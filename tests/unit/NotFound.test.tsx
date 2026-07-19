import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("NotFound page", () => {
  it("renders the 404 messaging and a link back home", () => {
    render(
      <MemoryRouter initialEntries={["/does-not-exist"]}>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("404 Error")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
