import { Check, ChevronDown, ChevronUp, ClipboardList, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOfficeStore } from "@/store/office-store";

const EXAMPLE_TASKS = [
  "競合サービス3社の料金を比較する",
  "新商品の紹介文を3案作成する",
  "今週の問い合わせ傾向をまとめる",
];

export function WorkInputPanel() {
  const { t } = useTranslation("office");
  const [expanded, setExpanded] = useState(true);
  const [input, setInput] = useState("");
  const [agentId, setAgentId] = useState("");
  const agents = useOfficeStore((state) => state.agents);
  const workTasks = useOfficeStore((state) => state.workTasks);
  const assignWorkTasks = useOfficeStore((state) => state.assignWorkTasks);
  const completeWorkTask = useOfficeStore((state) => state.completeWorkTask);

  const mainAgents = useMemo(
    () =>
      Array.from(agents.values()).filter(
        (agent) => !agent.isSubAgent && !agent.isPlaceholder && agent.confirmed,
      ),
    [agents],
  );
  const recentTasks = workTasks.slice(0, 6);
  const taskTitles = input
    .split("\n")
    .map((title) => title.trim())
    .filter(Boolean);

  const submitTasks = () => {
    if (taskTitles.length === 0) return;
    assignWorkTasks(taskTitles, agentId || undefined);
    setInput("");
  };

  return (
    <section className="pointer-events-auto absolute left-3 top-3 z-20 w-[min(360px,calc(100%-24px))] overflow-hidden rounded-2xl border border-white/10 bg-gray-950/92 text-white shadow-2xl backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-white/5"
        aria-expanded={expanded}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
          <ClipboardList className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{t("workInput.title")}</span>
          <span className="block truncate text-[11px] text-gray-400">
            {t("workInput.summary", {
              count: workTasks.filter((task) => task.status === "working").length,
            })}
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          <label className="mb-1 block text-[11px] font-medium text-gray-300" htmlFor="work-tasks">
            {t("workInput.taskLabel")}
          </label>
          <textarea
            id="work-tasks"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            maxLength={600}
            placeholder={t("workInput.placeholder")}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-gray-500 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLE_TASKS.map((task) => (
              <button
                key={task}
                type="button"
                onClick={() => setInput((value) => (value ? `${value}\n${task}` : task))}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-300 hover:border-violet-400/40 hover:bg-violet-500/10"
              >
                + {task}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <select
              value={agentId}
              onChange={(event) => setAgentId(event.target.value)}
              aria-label={t("workInput.assignee")}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-gray-900 px-2 py-2 text-xs text-gray-200 outline-none focus:border-violet-400/70"
            >
              <option value="">{t("workInput.autoAssign")}</option>
              {mainAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={submitTasks}
              disabled={taskTitles.length === 0}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
            >
              <Send className="h-3.5 w-3.5" />
              {t("workInput.assign", { count: Math.min(taskTitles.length, 8) })}
            </button>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-300">
                {t("workInput.currentWork")}
              </span>
              <span className="text-[10px] text-gray-500">{t("workInput.clickToComplete")}</span>
            </div>
            <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 ${
                    task.status === "done"
                      ? "border-white/5 bg-white/[0.02] opacity-55"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <span
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      task.status === "done" ? "bg-emerald-400" : "animate-pulse bg-violet-400"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] text-gray-100" title={task.title}>
                      {task.title}
                    </span>
                    <span className="block truncate text-[10px] text-gray-500">
                      {task.assigneeName} · {t(`workInput.status.${task.status}`)}
                    </span>
                  </span>
                  {task.status === "working" && (
                    <button
                      type="button"
                      onClick={() => completeWorkTask(task.id)}
                      className="rounded p-1 text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-300"
                      title={t("workInput.complete")}
                      aria-label={`${task.title}：${t("workInput.complete")}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
