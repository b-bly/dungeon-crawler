import { describe, it, expect } from "vitest";
import { generateDungeon, TILE, COLS, ROWS } from "./dungeon";

describe("Dungeon Generator", () => {
  it("generates a dungeon with the correct dimensions", () => {
    const dungeon = generateDungeon();

    expect(dungeon.map).toHaveLength(ROWS);

    dungeon.map.forEach((row) => {
      expect(row).toHaveLength(COLS);
    });
  });

  it("generates a valid player starting position", () => {
    const dungeon = generateDungeon();

    const col = Math.floor(dungeon.start.x / TILE);
    const row = Math.floor(dungeon.start.y / TILE);

    expect(dungeon.map[row][col]).toBe(0);
  });

  it("generates a valid dungeon exit", () => {
    const dungeon = generateDungeon();

    const { x, y } = dungeon.exit;

    expect(dungeon.map[y][x]).toBe(0);
  });

  it("generates an array of enemies", () => {
    const dungeon = generateDungeon();

    expect(Array.isArray(dungeon.enemies)).toBe(true);
    expect(dungeon.enemies.length).toBeGreaterThan(0);
  });

  it("generates enemies with valid health", () => {
    const dungeon = generateDungeon(3);

    dungeon.enemies.forEach((enemy) => {
      expect(enemy.hp).toBeGreaterThan(0);
      expect(enemy.maxHp).toBeGreaterThan(0);
      expect(enemy.hp).toBe(enemy.maxHp);
    });
  });

  it("supports different dungeon floors", () => {
    const firstFloor = generateDungeon(1);
    const fifthFloor = generateDungeon(5);

    expect(firstFloor.map).toHaveLength(ROWS);
    expect(fifthFloor.map).toHaveLength(ROWS);

    fifthFloor.enemies.forEach((enemy) => {
      expect(enemy.hp).toBeGreaterThanOrEqual(4);
    });
  });
});
