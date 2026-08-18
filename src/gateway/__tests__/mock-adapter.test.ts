import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MockAdapter } from "../mock-adapter";

describe("MockAdapter", () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  afterEach(() => {
    adapter.disconnect();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("connect resolves without error", async () => {
    await expect(adapter.connect()).resolves.toBeUndefined();
  });

  it("channelsStatus returns non-empty array with valid shape", async () => {
    const channels = await adapter.channelsStatus();
    expect(channels.length).toBeGreaterThan(0);
    for (const ch of channels) {
      expect(ch).toHaveProperty("id");
      expect(ch).toHaveProperty("type");
      expect(ch).toHaveProperty("name");
      expect(ch).toHaveProperty("status");
      expect(["connected", "disconnected", "connecting", "error"]).toContain(ch.status);
    }
  });

  it("skillsStatus returns non-empty array with valid shape", async () => {
    const skills = await adapter.skillsStatus();
    expect(skills.length).toBeGreaterThan(0);
    for (const sk of skills) {
      expect(sk).toHaveProperty("id");
      expect(sk).toHaveProperty("name");
      expect(sk).toHaveProperty("enabled");
      expect(typeof sk.enabled).toBe("boolean");
    }
  });

  it("cronList returns array with valid shape", async () => {
    const tasks = await adapter.cronList();
    expect(Array.isArray(tasks)).toBe(true);
    for (const t of tasks) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("name");
      expect(t).toHaveProperty("schedule");
      expect(t).toHaveProperty("enabled");
    }
  });

  it("cronAdd returns task with generated id", async () => {
    const task = await adapter.cronAdd({
      name: "Test",
      schedule: { kind: "cron", expr: "0 * * * *" },
      sessionTarget: "isolated",
      wakeMode: "now",
      payload: { kind: "agentTurn", message: "hello" },
    });
    expect(task.id).toBeDefined();
    expect(task.name).toBe("Test");
  });

  it("agentsList returns valid response", async () => {
    const result = await adapter.agentsList();
    expect(result).toHaveProperty("defaultId");
    expect(result).toHaveProperty("agents");
    expect(result.agents.length).toBeGreaterThan(0);
  });

  it("usageStatus returns valid usage info", async () => {
    const usage = await adapter.usageStatus();
    expect(usage).toHaveProperty("updatedAt");
    expect(usage).toHaveProperty("providers");
    expect(Array.isArray(usage.providers)).toBe(true);
    expect(usage.providers.length).toBeGreaterThan(0);
  });

  it("onEvent returns unsubscribe function", async () => {
    await adapter.connect();
    const unsub = adapter.onEvent(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("chatHistory returns array of messages", async () => {
    const messages = await adapter.chatHistory();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toHaveProperty("role");
    expect(messages[0]).toHaveProperty("content");
  });

  it("全20名を順番に共同作業へ参加させ、サブエージェントへ固有名を付ける", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const mainAgentIds = new Set<string>();
    const subAgentNames: string[] = [];
    const collaborationStartedAt = new Map<string, number>();
    const collaborationDurations: number[] = [];

    adapter.onEvent((event, payload) => {
      if (event !== "agent" || typeof payload !== "object" || payload === null) return;
      const agentEvent = payload as {
        stream?: string;
        data?: Record<string, unknown>;
      };
      if (agentEvent.stream !== "lifecycle" || agentEvent.data?.phase !== "start") return;
      if (typeof agentEvent.data.parentAgentId === "string") {
        if (typeof agentEvent.data.label === "string") subAgentNames.push(agentEvent.data.label);
      } else if (typeof agentEvent.data.agentId === "string") {
        mainAgentIds.add(agentEvent.data.agentId);
      }
      const sessionKey = (payload as { sessionKey?: string }).sessionKey;
      if (sessionKey?.startsWith("共同作業-") && !collaborationStartedAt.has(sessionKey)) {
        collaborationStartedAt.set(sessionKey, Date.now());
      }
    });

    adapter.onEvent((event, payload) => {
      if (event !== "agent" || typeof payload !== "object" || payload === null) return;
      const agentEvent = payload as {
        stream?: string;
        sessionKey?: string;
        data?: Record<string, unknown>;
      };
      if (
        agentEvent.stream === "lifecycle" &&
        agentEvent.data?.phase === "end" &&
        agentEvent.sessionKey?.startsWith("共同作業-")
      ) {
        const startedAt = collaborationStartedAt.get(agentEvent.sessionKey);
        if (startedAt !== undefined && !collaborationDurations.length) {
          collaborationDurations.push(Date.now() - startedAt);
        }
      }
    });

    await adapter.connect();
    await vi.advanceTimersByTimeAsync(50_000);

    expect(mainAgentIds.size).toBe(20);
    expect(subAgentNames.length).toBeGreaterThan(0);
    expect(subAgentNames[0]).toBe("月城ひかり");
    expect(subAgentNames[0]).not.toContain("mock-sub");
    expect(collaborationDurations[0]).toBeGreaterThanOrEqual(16_000);
  });
});
