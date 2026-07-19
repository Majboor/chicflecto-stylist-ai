import { describe, it, expect, vi, beforeEach } from "vitest";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { createPayment, verifyPaymentById } from "@/services/paymentService";

beforeEach(() => {
  invoke.mockReset();
  vi.restoreAllMocks();
});

describe("createPayment", () => {
  it("returns success with the payment url when the edge function responds", async () => {
    invoke.mockResolvedValue({
      data: { payment_url: "https://pay.example/checkout", id: "pay_1" },
      error: null,
    });

    const result = await createPayment("user-1", 5141);

    expect(result.success).toBe(true);
    expect(result.paymentUrl).toBe("https://pay.example/checkout");
    expect(result.paymentId).toBe("pay_1");
    // amount + user id are forwarded to the edge function
    expect(invoke).toHaveBeenCalledWith(
      "payment-handler",
      expect.objectContaining({
        body: expect.objectContaining({ amount: 5141, user_id: "user-1" }),
      })
    );
  });

  it("defaults the amount to 5141 when not supplied", async () => {
    invoke.mockResolvedValue({ data: { payment_url: "https://x", id: "p" }, error: null });
    await createPayment("user-2");
    expect(invoke).toHaveBeenCalledWith(
      "payment-handler",
      expect.objectContaining({ body: expect.objectContaining({ amount: 5141 }) })
    );
  });

  it("fails when the edge function returns an error", async () => {
    invoke.mockResolvedValue({ data: null, error: { message: "edge down" } });
    const result = await createPayment("user-1");
    expect(result.success).toBe(false);
    expect(result.message).toBe("edge down");
  });

  it("fails when no payment url comes back", async () => {
    invoke.mockResolvedValue({ data: { id: "p" }, error: null });
    const result = await createPayment("user-1");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Payment service unavailable");
  });
});

describe("verifyPaymentById", () => {
  it("returns true when the verify endpoint confirms success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    await expect(verifyPaymentById("pay_1")).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://pay.techrealm.pk/verify-payment",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns false when the endpoint reports a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "bad" }) })
    );
    await expect(verifyPaymentById("pay_1")).resolves.toBe(false);
  });

  it("returns false when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(verifyPaymentById("pay_1")).resolves.toBe(false);
  });
});
