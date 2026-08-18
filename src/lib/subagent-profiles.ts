export interface SubAgentProfile {
  name: string;
  role: string;
  task: string;
}

export const SUB_AGENT_PROFILES: readonly SubAgentProfile[] = [
  { name: "月城ひかり", role: "調査アシスタント", task: "市場情報と参考資料を調査する" },
  { name: "神谷レン", role: "データ分析担当", task: "データを整理して傾向を分析する" },
  { name: "星野みお", role: "資料作成担当", task: "報告資料と要点をまとめる" },
  { name: "朝倉かなで", role: "品質確認担当", task: "成果物の品質と整合性を確認する" },
  { name: "白石つばさ", role: "開発支援担当", task: "実装案と技術的な論点を整理する" },
  { name: "藤宮あかり", role: "顧客理解担当", task: "利用者の声と要望を分析する" },
  { name: "水瀬ゆう", role: "業務改善担当", task: "作業手順と改善案をまとめる" },
  { name: "九条まこと", role: "リスク調査担当", task: "リスクと確認事項を洗い出す" },
] as const;

export function getSubAgentProfile(index: number): SubAgentProfile {
  return SUB_AGENT_PROFILES[
    ((index % SUB_AGENT_PROFILES.length) + SUB_AGENT_PROFILES.length) % SUB_AGENT_PROFILES.length
  ];
}

export function getSubAgentName(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return getSubAgentProfile(hash).name;
}
