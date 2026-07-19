import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const { useAuth, getUserSubscription, isFirstLogin } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getUserSubscription: vi.fn(),
  isFirstLogin: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({ useAuth }));

vi.mock("@/services/subscriptionService", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/subscriptionService")
  >("@/services/subscriptionService");
  return {
    ...actual,
    getUserSubscription,
    isFirstLogin,
    markFirstLoginComplete: vi.fn(),
    clearSubscriptionCache: vi.fn(),
  };
});

import { useSubscription } from "@/hooks/useSubscription";

beforeEach(() => {
  useAuth.mockReset();
  getUserSubscription.mockReset();
  isFirstLogin.mockReset();
  isFirstLogin.mockReturnValue(false);
});

describe("useSubscription", () => {
  it("defaults to free trial when there is no user", () => {
    useAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => useSubscription());
    expect(result.current.subscriptionStatus).toBe("free_trial");
    expect(result.current.isFreeTrial).toBe(true);
    expect(result.current.isPremium).toBe(false);
  });

  it("reports premium for a subscribed, past-first-login user", async () => {
    useAuth.mockReturnValue({ user: { id: "u1" } });
    isFirstLogin.mockReturnValue(false);
    getUserSubscription.mockResolvedValue({ is_subscribed: true, free_trial_used: true });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => expect(result.current.subscriptionStatus).toBe("active"));
    expect(result.current.isPremium).toBe(true);
  });

  it("reports expired when the free trial was already used", async () => {
    useAuth.mockReturnValue({ user: { id: "u2" } });
    isFirstLogin.mockReturnValue(false);
    getUserSubscription.mockResolvedValue({ is_subscribed: false, free_trial_used: true });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => expect(result.current.subscriptionStatus).toBe("expired"));
    expect(result.current.isPremium).toBe(false);
    expect(result.current.isFreeTrial).toBe(false);
  });

  it("grants free trial to a first-time user without hitting the database", async () => {
    useAuth.mockReturnValue({ user: { id: "u3" } });
    isFirstLogin.mockReturnValue(true);

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => expect(result.current.subscriptionStatus).toBe("free_trial"));
    expect(getUserSubscription).not.toHaveBeenCalled();
  });
});
