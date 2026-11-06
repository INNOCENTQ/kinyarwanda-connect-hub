import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "./ThemeToggle";

const renderToggle = () => render(<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}><ThemeToggle /></ThemeProvider>);

describe("ThemeToggle", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it("offers an accessible switch to dark mode and persists the selection", () => {
    renderToggle();
    const toggle = screen.getByRole("button", { name: /umwijima/i });
    fireEvent.click(toggle);
    expect(localStorage.getItem("ubuhinzi-ubworozi-theme")).toBe("dark");
  });
});
