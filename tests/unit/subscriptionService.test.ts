import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Supabase mock -----------------------------------------------------------
// subscriptionService talks to Supabase through a fluent query builder
// (`.from().select().eq().maybeSingle()`, `.insert().select().single()`,
// `.update().eq()`). We model that with a Proxy whose chain methods return the
// builder itself and whose terminal calls resolve to a queued result, so each
// test can script exactly what the database "returns".
const { supabaseState, builder } = vi.hoisted(() => {
  const supabaseState = {
    queue: [] as Array<{ data: unknown; error: unknown }>,
    default: { data: null, error: null } as { data: unknown; error: unknown },
  };
  const next = () =>
    supabaseState.queue.length ? supabaseState.queue.shift() : supabaseState.default;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "then") {
          return (resolve: (v: unknown) => void) => Promise.resolve(next()).then(resolve);
        }
        if (prop === "maybeSingle" || prop === "single") {
          return () => Promise.resolve(next());
        }
        return () => builder;
      },
    }
  );
  return { supabaseState, builder };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => builder) },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  isFirstLogin,
  markFirstLoginComplete,
  clearSubscriptionCache,
  getUserSubscription,
  markFreeTrialAsUsed,
  activateUserSubscription,
  FREE_TRIAL,
  ACTIVE,
} from "@/services/subscriptionService";

const USER = "user-123";

function queue(...results: Array<{ data: unknown; error: unknown }>) {
  supabaseState.queue.push(...results);
}

beforeEach(() => {
  supabaseState.queue = [];
  supabaseState.default = { data: null, error: null };
  localStorage.clear();
  clearSubscriptionCache();
});

describe("status constants", () => {
  it("exposes the expected literal values", () => {
    expect(FREE_TRIAL).toBe("free_trial");
    expect(ACTIVE).toBe("active");
  });
});

describe("first-login tracking", () => {
  it("treats an unseen user as a first login", () => {
    expect(isFirstLogin()).toBe(true);
  });

  it("stops reporting a first login once marked complete", () => {
    markFirstLoginComplete();
    expect(isFirstLogin()).toBe(false);
    expect(localStorage.getItem("fashion_app_first_login")).toBe("false");
  });
});

describe("getUserSubscription", () => {
  it("returns the existing record when the database has one", async () => {
    const record = { id: "s1", user_id: USER, is_subscribed: true, free_trial_used: true };
    queue({ data: record, error: null });

    const result = await getUserSubscription(USER);
    expect(result).toEqual(record);
  });

  it("serves cached data on the second call without re-querying", async () => {
    const record = { id: "s1", user_id: USER, is_subscribed: false, free_trial_used: false };
    queue({ data: record, error: null });

    const first = await getUserSubscription(USER);
    // No second result queued: if it hit the DB again it would get the null
    // default and try to create a subscription. Cache must prevent that.
    const second = await getUserSubscription(USER);
    expect(second).toEqual(first);
  });

  it("creates a default subscription when none exists", async () => {
    const created = { id: "new", user_id: USER, is_subscribed: false, free_trial_used: false };
    // First query (maybeSingle) -> no row; then insert().select().single() -> created row.
    queue({ data: null, error: null }, { data: created, error: null });

    const result = await getUserSubscription(USER);
    expect(result).toEqual(created);
  });

  it("returns null when the query errors", async () => {
    queue({ data: null, error: { message: "boom" } });
    const result = await getUserSubscription(USER);
    expect(result).toBeNull();
  });
});

describe("markFreeTrialAsUsed", () => {
  it("persists trial usage locally and resolves true on success", async () => {
    queue({ data: null, error: null });
    const ok = await markFreeTrialAsUsed(USER);
    expect(ok).toBe(true);
    expect(localStorage.getItem("fashion_app_free_trial_used")).toBe("true");
    expect(localStorage.getItem("fashion_app_first_login")).toBe("false");
  });

  it("resolves false when the update errors", async () => {
    queue({ data: null, error: { message: "nope" } });
    const ok = await markFreeTrialAsUsed(USER);
    expect(ok).toBe(false);
  });
});

describe("activateUserSubscription", () => {
  it("marks the user subscribed and returns true on success", async () => {
    queue({ data: null, error: null });
    const ok = await activateUserSubscription(USER, "ref-abc", 30);
    expect(ok).toBe(true);
    expect(localStorage.getItem("fashion_app_free_trial_used")).toBe("true");
  });

  it("returns false when activation errors", async () => {
    queue({ data: null, error: { message: "fail" } });
    const ok = await activateUserSubscription(USER, "ref-abc");
    expect(ok).toBe(false);
  });
});
