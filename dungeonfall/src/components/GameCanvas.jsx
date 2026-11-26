import { useEffect, useRef } from "react";
import { generateDungeon, TILE, COLS, ROWS } from "../game/dungeon";

const WIDTH = COLS * TILE;
const HEIGHT = ROWS * TILE;

export default function GameCanvas({ onHud, restartKey }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const keys = {};
    let lastTime = 0;
    let hudTimer = 0;
    let animationId;

    let floor = 1;
    let kills = 0;
    let gameOver = false;

    let dungeon = generateDungeon(floor);

    const player = {
      x: dungeon.start.x,
      y: dungeon.start.y,
      size: 20,
      speed: 170,
      hp: 100,
      maxHp: 100,
      facingX: 1,
      facingY: 0,
      attackCooldown: 0,
      attackUntil: 0,
      invulnerable: 0,
    };

    function resetRun() {
      floor = 1;
      kills = 0;
      gameOver = false;
      player.hp = 100;
      player.maxHp = 100;
      loadFloor();
    }

    function loadFloor() {
      dungeon = generateDungeon(floor);
      player.x = dungeon.start.x;
      player.y = dungeon.start.y;
      player.hp = player.maxHp;
      player.attackCooldown = 0;
      player.attackUntil = 0;
      player.invulnerable = 0;
    }

    function isWall(x, y) {
      const col = Math.floor(x / TILE);
      const row = Math.floor(y / TILE);

      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
        return true;
      }

      return dungeon.map[row][col] === 1;
    }

    function canMove(x, y) {
      const r = player.size / 2 - 2;

      return !(
        isWall(x - r, y - r) ||
        isWall(x + r, y - r) ||
        isWall(x - r, y + r) ||
        isWall(x + r, y + r)
      );
    }

    function attack(now) {
      if (gameOver || player.attackCooldown > 0) return;

      player.attackCooldown = 0.35;
      player.attackUntil = now + 180;

      const range = 47;

      dungeon.enemies.forEach((enemy) => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;

        const distance = Math.hypot(dx, dy);
        const dot =
          (dx * player.facingX + dy * player.facingY) / Math.max(distance, 1);

        if (distance < range && dot > 0.25) {
          enemy.hp -= 1;
        }
      });

      const before = dungeon.enemies.length;
      dungeon.enemies = dungeon.enemies.filter((e) => e.hp > 0);
      kills += before - dungeon.enemies.length;
    }

    function update(dt, now) {
      if (gameOver) return;

      player.attackCooldown = Math.max(0, player.attackCooldown - dt);

      player.invulnerable = Math.max(0, player.invulnerable - dt);

      // Player movement.
      let dx = 0;
      let dy = 0;

      if (keys["w"] || keys["arrowup"]) dy -= 1;
      if (keys["s"] || keys["arrowdown"]) dy += 1;
      if (keys["a"] || keys["arrowleft"]) dx -= 1;
      if (keys["d"] || keys["arrowright"]) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const length = Math.hypot(dx, dy);
        dx /= length;
        dy /= length;

        player.facingX = dx;
        player.facingY = dy;

        const nextX = player.x + dx * player.speed * dt;
        const nextY = player.y + dy * player.speed * dt;

        if (canMove(nextX, player.y)) player.x = nextX;
        if (canMove(player.x, nextY)) player.y = nextY;
      }

      // Enemy AI.
      dungeon.enemies.forEach((enemy) => {
        const ex = player.x - enemy.x;
        const ey = player.y - enemy.y;
        const distance = Math.hypot(ex, ey);

        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);

        if (distance > 22 && distance < 240) {
          const moveX = (ex / distance) * enemy.speed * dt;
          const moveY = (ey / distance) * enemy.speed * dt;

          const nx = enemy.x + moveX;
          const ny = enemy.y + moveY;

          if (!isWall(nx, enemy.y)) enemy.x = nx;
          if (!isWall(enemy.x, ny)) enemy.y = ny;
        }

        if (
          distance < 25 &&
          enemy.attackCooldown <= 0 &&
          player.invulnerable <= 0
        ) {
          player.hp = Math.max(0, player.hp - 10);
          player.invulnerable = 0.7;
          enemy.attackCooldown = 0.9;
        }
      });

      if (player.hp <= 0) {
        gameOver = true;
      }

      // Stairs to the next dungeon floor.
      const exitX = (dungeon.exit.x + 0.5) * TILE;
      const exitY = (dungeon.exit.y + 0.5) * TILE;

      if (Math.hypot(player.x - exitX, player.y - exitY) < 22) {
        floor++;
        loadFloor();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Dungeon tiles.
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const wall = dungeon.map[y][x] === 1;
          const px = x * TILE;
          const py = y * TILE;

          if (wall) {
            ctx.fillStyle = "#292b3b";
            ctx.fillRect(px, py, TILE, TILE);

            ctx.fillStyle = "#393c50";
            ctx.fillRect(px + 2, py + 2, 28, 5);

            ctx.fillStyle = "#202131";
            ctx.fillRect(px + 3, py + 10, 26, 20);
          } else {
            ctx.fillStyle = "#48404a";
            ctx.fillRect(px, py, TILE, TILE);

            ctx.fillStyle = "#514853";
            ctx.fillRect(px + 2, py + 2, 28, 28);

            if ((x + y) % 3 === 0) {
              ctx.fillStyle = "#665661";
              ctx.fillRect(px + 8, py + 8, 2, 2);
            }
          }
        }
      }

      // Dungeon exit.
      const exitX = dungeon.exit.x * TILE;
      const exitY = dungeon.exit.y * TILE;

      ctx.fillStyle = "#f4c95d";
      ctx.fillRect(exitX + 7, exitY + 7, 18, 18);
      ctx.fillStyle = "#76502c";
      ctx.fillRect(exitX + 11, exitY + 11, 10, 10);

      // Enemies.
      dungeon.enemies.forEach((enemy) => {
        ctx.fillStyle = "#000000";
        ctx.fillRect(enemy.x - 11, enemy.y - 7, 22, 22);

        ctx.fillStyle = "#b64b50";
        ctx.fillRect(enemy.x - 10, enemy.y - 12, 20, 20);

        ctx.fillStyle = "#f2d5a0";
        ctx.fillRect(enemy.x - 6, enemy.y - 7, 4, 4);
        ctx.fillRect(enemy.x + 2, enemy.y - 7, 4, 4);

        ctx.fillStyle = "#3b1f29";
        ctx.fillRect(enemy.x - 10, enemy.y - 18, 20, 3);

        ctx.fillStyle = "#e75b61";
        ctx.fillRect(
          enemy.x - 10,
          enemy.y - 18,
          20 * (enemy.hp / enemy.maxHp),
          3,
        );
      });

      // Player.
      if (
        player.invulnerable <= 0 ||
        Math.floor(performance.now() / 100) % 2 === 0
      ) {
        ctx.fillStyle = "#171923";
        ctx.fillRect(player.x - 11, player.y - 7, 22, 23);

        ctx.fillStyle = "#5a9ce5";
        ctx.fillRect(player.x - 10, player.y - 12, 20, 20);

        ctx.fillStyle = "#f4d2a0";
        ctx.fillRect(player.x - 6, player.y - 8, 12, 9);

        ctx.fillStyle = "#29243a";
        ctx.fillRect(player.x - 7, player.y + 5, 5, 7);
        ctx.fillRect(player.x + 2, player.y + 5, 5, 7);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          player.x + player.facingX * 5 - 2,
          player.y + player.facingY * 5 - 2,
          4,
          4,
        );
      }

      // Attack indicator.
      if (player.attackUntil > performance.now()) {
        ctx.strokeStyle = "#f7df83";
        ctx.lineWidth = 4;
        ctx.beginPath();

        const angle = Math.atan2(player.facingY, player.facingX);

        ctx.arc(player.x, player.y, 35, angle - 0.65, angle + 0.65);

        ctx.stroke();
      }
    }

    function loop(timestamp) {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      update(dt, timestamp);
      draw();

      hudTimer += dt;

      if (hudTimer > 0.12) {
        onHud({
          hp: player.hp,
          maxHp: player.maxHp,
          floor,
          kills,
          enemies: dungeon.enemies.length,
          gameOver,
        });

        hudTimer = 0;
      }

      animationId = requestAnimationFrame(loop);
    }

    function onKeyDown(e) {
      const key = e.key.toLowerCase();

      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)
      ) {
        e.preventDefault();
      }

      keys[key] = true;

      if (key === " " || key === "j") {
        attack(performance.now());
      }
    }

    function onKeyUp(e) {
      keys[e.key.toLowerCase()] = false;
    }

    function onBlur() {
      Object.keys(keys).forEach((key) => {
        keys[key] = false;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    resetRun();
    onHud({
      hp: 100,
      maxHp: 100,
      floor: 1,
      kills: 0,
      enemies: dungeon.enemies.length,
      gameOver: false,
    });

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [restartKey, onHud]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="game-canvas"
    />
  );
}
