import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const localeDir = join(root, "src", "i18n", "locales", "ja");
const expectedNamespaces = ["chat.json", "common.json", "console.json", "layout.json", "office.json", "panels.json"];
const errors = [];

const technicalOnly = new Set([
  "Telegram",
  "Discord",
  "WhatsApp",
  "Signal",
  "Feishu",
  "iMessage",
  "Matrix",
  "LINE",
  "Microsoft Teams",
  "Google Chat",
  "Mattermost",
  "Gateway",
  "Node.js",
  "WebSocket URL",
  "GitHub",
  "{{time}}",
]);

function visitValue(value, path, file) {
  if (typeof value === "string") {
    const hasLatin = /[A-Za-z]/.test(value);
    const hasJapanese = /[ぁ-んァ-ヶ一-龠々ー]/.test(value);
    const isUrl = /^https?:\/\//.test(value);
    if (hasLatin && !hasJapanese && !isUrl && !technicalOnly.has(value)) {
      errors.push(`${file}:${path} は日本語化されていません: ${value}`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visitValue(child, path ? `${path}.${key}` : key, file);
    }
  }
}

for (const file of expectedNamespaces) {
  const fullPath = join(localeDir, file);
  try {
    visitValue(JSON.parse(readFileSync(fullPath, "utf8")), "", file);
  } catch (error) {
    errors.push(`${file} を読み込めません: ${error.message}`);
  }
}

function sourceFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      found.push(...sourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      found.push(fullPath);
    }
  }
  return found;
}

const allowedAttributeValues = /^(?:Bankr|BAGS|GPT-4o|gpt-4o|https?:\/\/)/;
const bannedDemoNames = /\b(?:0xDeployer|FINN|BANKR)\b/;
const bannedUiLiterals = new Set([
  "Menu",
  "Agents",
  "Loading…",
  "Connect",
  "Refresh",
  "Disconnect",
  "Overview",
  "Claimers",
  "Events",
  "Creator",
  "No data",
  "No claimers yet",
  "No claim events yet",
  "Failed to fetch",
]);

for (const fullPath of sourceFiles(join(root, "src"))) {
  const file = relative(root, fullPath).replaceAll("\\", "/");
  const source = readFileSync(fullPath, "utf8");
  if (/[�]|窶|竊|笞|/.test(source)) {
    errors.push(`${file} に文字化けの疑いがあります`);
  }
  if (bannedDemoNames.test(source)) {
    errors.push(`${file} に旧デモ社員名が残っています`);
  }

  if (file.endsWith(".tsx")) {
    for (const match of source.matchAll(/>\s*([A-Za-z][A-Za-z0-9 /&+_.:()-]{2,})\s*</g)) {
      if (match[1] !== "BAGS" && match[1] !== "ClawProwl") {
        errors.push(`${file} に英語の画面表示が残っています: ${match[1]}`);
      }
    }
    for (const match of source.matchAll(/(?:title|placeholder|aria-label|alt)="([^"]*[A-Za-z][^"]*)"/g)) {
      if (!allowedAttributeValues.test(match[1]) && !/[ぁ-んァ-ヶ一-龠々ー]/.test(match[1])) {
        errors.push(`${file} に英語属性が残っています: ${match[1]}`);
      }
    }
  }

  for (const literal of bannedUiLiterals) {
    if (source.includes(`"${literal}"`) || source.includes(`'${literal}'`)) {
      errors.push(`${file} に英語文言が残っています: ${literal}`);
    }
  }
}

if (errors.length > 0) {
  console.error("日本語化チェックで問題が見つかりました:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log("日本語化チェック完了: 6名前空間、画面文言、旧デモ社員名、文字化けを確認しました。");
