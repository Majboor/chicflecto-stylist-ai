import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("@/context/AuthContext", () => ({ useAuth }));

import ProtectedRoute from "@/components/ProtectedRoute";

function renderAt(initialPath = "/secret") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>Auth page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows a loading indicator while auth is resolving", () => {
    useAuth.mockReturnValue({ user: null, isLoading: true });
    renderAt();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders children for an authenticated user", () => {
    useAuth.mockReturnValue({ user: { id: "u1" }, isLoading: false });
    renderAt();
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("redirects an unauthenticated user to /auth", () => {
    useAuth.mockReturnValue({ user: null, isLoading: false });
    renderAt();
    expect(screen.getByText("Auth page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });
});
