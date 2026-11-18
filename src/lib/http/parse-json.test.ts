import { describe, expect, it } from "vitest";
import { parseJsonBody } from "./parse-json";

describe("parseJsonBody", () => {
  it("returns parsed data for valid JSON", async () => {
    const req = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
    });
    const res = await parseJsonBody(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toEqual({ ok: true });
    }
  });

  it("returns a 400 NextResponse for malformed JSON", async () => {
    const req = new Request("http://localhost/test", {
      method: "POST",
      body: "{broken",
    });
    const res = await parseJsonBody(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.response.status).toBe(400);
    }
  });
});

