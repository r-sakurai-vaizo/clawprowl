const DEMO_WORK_TITLES: Record<string, string> = {
  main: "顧客問い合わせの優先順位付け",
  "tech-lead": "新機能APIの設計レビュー",
  researcher: "競合3社の料金プラン調査",
  sales: "商談候補企業への提案準備",
  planner: "来月のプロジェクト計画作成",
  developer: "ダッシュボードの表示改善",
  designer: "新しいLPのデザイン案作成",
  analyst: "先月の利用データ分析",
  writer: "導入事例インタビューの記事化",
  support: "未解決チケットの回答作成",
  hr: "採用候補者の面談日程調整",
  accounting: "今月の請求内容チェック",
  marketing: "SNSキャンペーンの企画",
  qa: "リリース前の動作確認",
  legal: "利用規約改定案の確認",
  product: "ユーザー要望の優先度整理",
  security: "アクセスログの異常確認",
  operations: "本日の運用手順チェック",
  data: "週次KPIレポートの更新",
  community: "ユーザーコミュニティへの返信",
};

export function getDemoWorkTitle(agentId: string): string | null {
  return DEMO_WORK_TITLES[agentId] ?? null;
}
