import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { WorkInputPanel } from "@/components/office/WorkInputPanel";
import { useOfficeStore } from "@/store/office-store";

describe("WorkInputPanel", () => {
  beforeEach(() => {
    useOfficeStore.setState({ agents: new Map(), workTasks: [] });
    useOfficeStore.getState().initAgents([
      { id: "agent-1", name: "担当A" },
      { id: "agent-2", name: "担当B" },
    ]);
  });

  it("1行ずつ複数の仕事を入力して自動割り当てできる", () => {
    render(<WorkInputPanel />);

    fireEvent.change(screen.getByLabelText("依頼する仕事（1行につき1件・最大8件）"), {
      target: { value: "市場調査\n提案書の作成" },
    });
    fireEvent.click(screen.getByRole("button", { name: "2件を依頼" }));

    const userTasks = useOfficeStore.getState().workTasks.filter((task) => task.source === "user");
    expect(userTasks.map((task) => task.title)).toEqual(["提案書の作成", "市場調査"]);
    expect(new Set(userTasks.map((task) => task.assigneeId)).size).toBe(2);
    expect(screen.getByText("提案書の作成")).toBeTruthy();
  });
});
