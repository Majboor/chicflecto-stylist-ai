import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merge helper)", () => {
  it("joins multiple class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("resolves conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("lets later tailwind utilities win over conflicting earlier ones", () => {
    // tailwind-merge should collapse conflicting padding utilities.
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
