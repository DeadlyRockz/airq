import { beforeEach, describe, expect, it } from "vitest";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { clearSessionState, loadSessionState, saveSessionState } from "./session-context";

describe("session-context storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("saves and restores validated session state", () => {
    const scenario = getDemoScenarioById("bengaluru-moderate");
    saveSessionState({
      context: scenario.defaultContext,
    });

    const loaded = loadSessionState();
    expect(loaded).not.toBeNull();
    expect(loaded?.context.locationLabel).toBe("Bengaluru, IN");
  });

  it("returns null on malformed JSON in sessionStorage", () => {
    window.sessionStorage.setItem("airq:session-state:v2", "{not-valid-json");
    expect(loadSessionState()).toBeNull();
  });

  it("clears stored session state", () => {
    const scenario = getDemoScenarioById("seattle-clean");
    saveSessionState({
      context: scenario.defaultContext,
    });
    clearSessionState();
    expect(loadSessionState()).toBeNull();
  });
});
