const TILE = 32;
const COLS = 30;
const ROWS = 20;

export { TILE, COLS, ROWS };

export function generateDungeon(floor = 1) {
  const map = Array.from({ length: ROWS }, () => Array(COLS).fill(1));

  const rooms = [];

  for (let i = 0; i < 8; i++) {
    const w = 4 + Math.floor(Math.random() * 5);
    const h = 4 + Math.floor(Math.random() * 4);
    const x = 1 + Math.floor(Math.random() * (COLS - w - 2));
    const y = 1 + Math.floor(Math.random() * (ROWS - h - 2));

    const overlaps = rooms.some(
      (r) =>
        x < r.x + r.w + 1 &&
        x + w + 1 > r.x &&
        y < r.y + r.h + 1 &&
        y + h + 1 > r.y,
    );

    if (overlaps) continue;

    const room = { x, y, w, h };
    rooms.push(room);

    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) {
        map[ry][rx] = 0;
      }
    }
  }

  // Connect rooms with corridors.
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];

    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);

    const horizontalFirst = Math.random() > 0.5;

    const carveH = () => {
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        map[ay][x] = 0;
      }
    };

    const carveV = () => {
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        map[y][bx] = 0;
      }
    };

    if (horizontalFirst) {
      carveH();
      carveV();
    } else {
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        map[y][ax] = 0;
      }
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        map[by][x] = 0;
      }
    }
  }

  // Ensure we have a playable dungeon.
  if (rooms.length < 2) {
    return generateDungeon(floor);
  }

  const first = rooms[0];
  const last = rooms[rooms.length - 1];

  const start = {
    x: (first.x + first.w / 2) * TILE,
    y: (first.y + first.h / 2) * TILE,
  };

  const exit = {
    x: Math.floor(last.x + last.w / 2),
    y: Math.floor(last.y + last.h / 2),
  };

  const enemies = [];

  rooms.slice(1).forEach((room) => {
    const count = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      enemies.push({
        x: (room.x + 1 + Math.random() * (room.w - 2)) * TILE,
        y: (room.y + 1 + Math.random() * (room.h - 2)) * TILE,
        hp: 2 + Math.floor(floor / 2),
        maxHp: 2 + Math.floor(floor / 2),
        speed: 35 + Math.random() * 15,
        attackCooldown: 0,
      });
    }
  });

  return { map, start, exit, enemies };
}
