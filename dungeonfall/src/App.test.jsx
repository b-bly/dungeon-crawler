import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

vi.mock("./components/GameCanvas", () => ({
  default: ({ onHud, restartKey }) => (
    <div data-testid="game-canvas">
      <span data-testid="restart-key">{restartKey}</span>

      <button
        onClick={() =>
          onHud({
            hp: 75,
            maxHp: 100,
            floor: 3,
            kills: 12,
            enemies: 4,
            gameOver: false,
          })
        }
      >
        Simulate Game Update
      </button>

      <button
        onClick={() =>
          onHud({
            hp: 0,
            maxHp: 100,
            floor: 5,
            kills: 20,
            enemies: 0,
            gameOver: true,
          })
        }
      >
        Simulate Player Death
      </button>
    </div>
  ),
}));

describe("Dungeon Depths App", () => {
  it("renders the game title", () => {
    render(<App />);

    expect(screen.getByText("DUNGEON DEPTHS")).toBeInTheDocument();
  });

  it("renders the initial player health", () => {
    render(<App />);

    expect(screen.getByText("100 / 100")).toBeInTheDocument();
  });

  it("renders the initial dungeon floor", () => {
    render(<App />);

    expect(screen.getByText("FLOOR")).toBeInTheDocument();

    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("renders player controls", () => {
    render(<App />);

    expect(screen.getByText("MOVEMENT")).toBeInTheDocument();
    expect(screen.getByText("ATTACK")).toBeInTheDocument();
    expect(screen.getByText("SPACE / J")).toBeInTheDocument();
  });

  it("updates player health and statistics", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Simulate Game Update"));

    expect(screen.getByText("75 / 100")).toBeInTheDocument();

    expect(screen.getByText("Enemies Slain").parentElement).toHaveTextContent(
      "12",
    );

    expect(
      screen.getByText("Enemies Remaining").parentElement,
    ).toHaveTextContent("4");

    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("displays the death screen when the player dies", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Simulate Player Death"));

    expect(screen.getByText("YOU HAVE FALLEN")).toBeInTheDocument();

    expect(screen.getByText("TRY AGAIN")).toBeInTheDocument();
  });

  it("restarts the game after player death", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Simulate Player Death"));

    fireEvent.click(screen.getByText("TRY AGAIN"));

    expect(screen.queryByText("YOU HAVE FALLEN")).not.toBeInTheDocument();

    expect(screen.getByTestId("restart-key")).toHaveTextContent("1");

    expect(screen.getByText("100 / 100")).toBeInTheDocument();
  });

  it("restarts the game using the restart button", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /restart run/i,
      }),
    );

    expect(screen.getByTestId("restart-key")).toHaveTextContent("1");

    expect(screen.getByText("100 / 100")).toBeInTheDocument();
  });
});
