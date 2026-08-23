import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const BAGS_API_BASE = "https://public-api-v2.bags.fm/api/v1";

// ── Types ──────────────────────────────────────────────────────────────────

interface ClaimStat {
  username: string;
  pfp: string;
  royaltyBps: number;
  isCreator: boolean;
  wallet: string;
  totalClaimed: string;
  twitterUsername: string;
  bagsUsername: string;
}

interface ClaimEvent {
  wallet: string;
  isCreator: boolean;
  amount: string;
  signature: string;
  timestamp: string;
}

interface BagsAnalyticsData {
  lifetimeFees: string | null;
  claimStats: ClaimStat[];
  claimEvents: ClaimEvent[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function lamportsToSol(lamports: string): string {
  const n = Number(lamports) / 1_000_000_000;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}k`;
  return n.toFixed(4);
}

function shortWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return i18n.t("common:time.secondsAgo", { count: diff });
  if (diff < 3600) return i18n.t("common:time.minutesAgo", { count: Math.floor(diff / 60) });
  if (diff < 86400) return i18n.t("common:time.hoursAgo", { count: Math.floor(diff / 3600) });
  return `${Math.floor(diff / 86400)}日前`;
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchBagsAnalytics(tokenMint: string, apiKey: string): Promise<BagsAnalyticsData> {
  const headers = { "x-api-key": apiKey };

  const [feesRes, statsRes, eventsRes] = await Promise.all([
    fetch(`${BAGS_API_BASE}/token-launch/lifetime-fees?tokenMint=${tokenMint}`, { headers }),
    fetch(`${BAGS_API_BASE}/token-launch/claim-stats?tokenMint=${tokenMint}`, { headers }),
    fetch(
      `${BAGS_API_BASE}/fee-share/token/claim-events?tokenMint=${tokenMint}&mode=offset&limit=20`,
      { headers },
    ),
  ]);

  const [feesJson, statsJson, eventsJson] = await Promise.all([
    feesRes.json(),
    statsRes.json(),
    eventsRes.json(),
  ]);

  return {
    lifetimeFees: feesJson.success ? feesJson.response : null,
    claimStats: statsJson.success ? statsJson.response : [],
    claimEvents: eventsJson.success ? (eventsJson.response?.events ?? []) : [],
  };
}

// ── Main Component ─────────────────────────────────────────────────────────

type TabId = "overview" | "claimers" | "events";

interface BagsAnalyticsPanelProps {
  /** Solana token mint address of PROWL token */
  tokenMint?: string;
  /** Bags API key */
  apiKey?: string;
}

export function BagsAnalyticsPanel({ tokenMint = "", apiKey = "" }: BagsAnalyticsPanelProps) {
  const { t } = useTranslation("panels");
  const [tab, setTab] = useState<TabId>("overview");
  const [data, setData] = useState<BagsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMint, setInputMint] = useState(tokenMint);
  const [inputKey, setInputKey] = useState(apiKey);
  const [configured, setConfigured] = useState(false);

  const load = useCallback(
    async (mint: string, key: string) => {
      if (!mint || !key) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBagsAnalytics(mint, key);
        setData(result);
        setConfigured(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("bagsAnalytics.fetchFailed"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // Auto-refresh every 30s when configured
  useEffect(() => {
    if (!configured) return;
    const id = setInterval(() => load(inputMint, inputKey), 30_000);
    return () => clearInterval(id);
  }, [configured, inputMint, inputKey, load]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("bagsAnalytics.tabs.overview") },
    { id: "claimers", label: t("bagsAnalytics.tabs.claimers") },
    { id: "events", label: t("bagsAnalytics.tabs.events") },
  ];

  // ── Config form ──────────────────────────────────────────────────────────
  if (!configured) {
    return (
      <div className="p-3 space-y-2">
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          {t("bagsAnalytics.description")}
        </p>
        <input
          className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder={t("bagsAnalytics.tokenMintPlaceholder")}
          value={inputMint}
          onChange={(e) => setInputMint(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder={t("bagsAnalytics.apiKeyPlaceholder")}
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
        />
        {error && <p className="text-[10px] text-red-500">{error}</p>}
        <button
          onClick={() => load(inputMint, inputKey)}
          disabled={loading || !inputMint || !inputKey}
          className="w-full rounded bg-blue-600 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("bagsAnalytics.loading") : t("bagsAnalytics.connect")}
        </button>
      </div>
    );
  }

  // ── Loaded state ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Bags branding + refresh */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-purple-500">BAGS</span>
          <span className="text-[9px] text-gray-400 uppercase tracking-wide">
            ・{t("bagsAnalytics.title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent" />
          )}
          <button
            onClick={() => load(inputMint, inputKey)}
            className="text-[9px] text-gray-400 hover:text-blue-400"
            title={t("bagsAnalytics.refresh")}
          >
            ↻
          </button>
          <button
            onClick={() => {
              setConfigured(false);
              setData(null);
            }}
            className="text-[9px] text-gray-400 hover:text-red-400"
            title={t("bagsAnalytics.disconnect")}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-2 py-1 border-b border-gray-100 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
              tab === t.id
                ? "bg-purple-100 text-purple-700 font-medium dark:bg-purple-900/40 dark:text-purple-300"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-2">
        {tab === "overview" && <OverviewTab data={data} />}
        {tab === "claimers" && <ClaimersTab stats={data?.claimStats ?? []} />}
        {tab === "events" && <EventsTab events={data?.claimEvents ?? []} />}
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: BagsAnalyticsData | null }) {
  if (!data) return <EmptyState text={i18n.t("common:empty.noData")} />;

  const totalClaimedLamports = data.claimStats.reduce((sum, s) => sum + Number(s.totalClaimed), 0);
  const totalClaimers = data.claimStats.length;
  const totalEvents = data.claimEvents.length;
  const creator = data.claimStats.find((s) => s.isCreator);

  const cards = [
    {
      label: i18n.t("panels:bagsAnalytics.lifetimeFees"),
      value: data.lifetimeFees ? `${lamportsToSol(data.lifetimeFees)} SOL` : "—",
      color: "#a855f7",
      icon: "◎",
    },
    {
      label: i18n.t("panels:bagsAnalytics.totalClaimed"),
      value: `${lamportsToSol(String(totalClaimedLamports))} SOL`,
      color: "#22c55e",
      icon: "✓",
    },
    {
      label: i18n.t("panels:bagsAnalytics.claimers"),
      value: String(totalClaimers),
      color: "#3b82f6",
      icon: "👤",
    },
    {
      label: i18n.t("panels:bagsAnalytics.claimEvents"),
      value: String(totalEvents),
      color: "#f97316",
      icon: "⚡",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-gray-50 px-2 py-2 dark:bg-gray-800">
            <div className="text-xs font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {creator && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-2 dark:border-purple-800 dark:bg-purple-950/30">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-purple-500 mb-1">
            {i18n.t("panels:bagsAnalytics.creator")}
          </div>
          <div className="flex items-center gap-2">
            {creator.pfp && (
              <img
                src={creator.pfp}
                alt={creator.username}
                className="h-6 w-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                @{creator.twitterUsername || creator.bagsUsername || creator.username}
              </div>
              <div className="text-[9px] text-gray-500">
                {i18n.t("panels:bagsAnalytics.royalty", {
                  percent: (creator.royaltyBps / 100).toFixed(1),
                  amount: lamportsToSol(creator.totalClaimed),
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Claimers Tab ───────────────────────────────────────────────────────────

function ClaimersTab({ stats }: { stats: ClaimStat[] }) {
  if (stats.length === 0) {
    return <EmptyState text={i18n.t("panels:bagsAnalytics.noClaimers")} />;
  }

  const sorted = [...stats].sort((a, b) => Number(b.totalClaimed) - Number(a.totalClaimed));

  return (
    <div className="space-y-1">
      {sorted.map((s, i) => (
        <div
          key={s.wallet}
          className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800"
        >
          <span className="text-[9px] text-gray-400 w-3">{i + 1}</span>
          {s.pfp ? (
            <img
              src={s.pfp}
              alt={s.username}
              className="h-5 w-5 rounded-full shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium text-gray-800 dark:text-gray-200 truncate">
              @{s.twitterUsername || s.bagsUsername || shortWallet(s.wallet)}
            </div>
            <div className="text-[9px] text-gray-400">
              {i18n.t("panels:bagsAnalytics.royaltyShort", {
                percent: (s.royaltyBps / 100).toFixed(1),
              })}
              {s.isCreator && (
                <span className="ml-1 text-purple-500 font-semibold">
                  ・{i18n.t("panels:bagsAnalytics.creator")}
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] font-semibold text-green-600 dark:text-green-400 shrink-0">
            {lamportsToSol(s.totalClaimed)} SOL
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Events Tab ─────────────────────────────────────────────────────────────

function EventsTab({ events }: { events: ClaimEvent[] }) {
  if (events.length === 0) {
    return <EmptyState text={i18n.t("panels:bagsAnalytics.noEvents")} />;
  }

  return (
    <div className="space-y-1">
      {events.map((ev) => (
        <div
          key={ev.signature}
          className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800"
        >
          <div>
            <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
              {shortWallet(ev.wallet)}
              {ev.isCreator && (
                <span className="ml-1 text-[9px] text-purple-500">
                  {i18n.t("panels:bagsAnalytics.creator")}
                </span>
              )}
            </div>
            <div className="text-[9px] text-gray-400">
              {timeAgo(ev.timestamp)} ·{" "}
              <a
                href={`https://solscan.io/tx/${ev.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {i18n.t("panels:bagsAnalytics.transaction")}
              </a>
            </div>
          </div>
          <div className="text-[10px] font-bold text-green-500 shrink-0">
            +{lamportsToSol(ev.amount)} SOL
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-4 text-center text-[10px] text-gray-400 dark:text-gray-500">{text}</div>
  );
}
