export const PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export interface AvatarInfo {
  backgroundColor: string;
  textColor: string;
  initial: string;
}

export function generateAvatar(agentId: string, agentName?: string): AvatarInfo {
  const hash = hashString(agentId);
  const backgroundColor = PALETTE[hash % PALETTE.length];
  const textColor = luminance(backgroundColor) > 0.5 ? "#000000" : "#ffffff";

  const displayName = agentName ?? agentId;
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return { backgroundColor, textColor, initial };
}

/** Deterministic hex color for 3D MeshStandardMaterial */
export function generateAvatar3dColor(agentId: string): string {
  const hash = hashString(agentId);
  return JAPANESE_UNIFORM_COLORS[hash % JAPANESE_UNIFORM_COLORS.length];
}

// --- SVG Avatar ---

export type FaceShape = "round" | "square" | "oval";
export type HairStyle = "short" | "spiky" | "bob" | "hime" | "side-tail" | "messy";
export type EyeStyle = "sparkle" | "soft" | "smile";
export type AccessoryStyle = "none" | "ribbon" | "hairpin" | "headband" | "glasses";

const FACE_SHAPES: FaceShape[] = ["round", "square", "oval"];
const HAIR_STYLES: HairStyle[] = ["short", "spiky", "bob", "hime", "side-tail", "messy"];
const EYE_STYLES: EyeStyle[] = ["sparkle", "soft", "smile"];
const ACCESSORIES: AccessoryStyle[] = ["none", "ribbon", "hairpin", "headband", "glasses"];
const SKIN_COLORS = ["#ffe4d6", "#f8d5bd", "#e8b994", "#c98f69", "#8f5f43", "#ffdcc6"];
const HAIR_COLORS = ["#17151d", "#28243a", "#3b241f", "#56362d", "#243349", "#713c4d"];
const PASTEL_BACKGROUNDS = ["#fce7f3", "#e0e7ff", "#dbeafe", "#ccfbf1", "#fef3c7", "#ede9fe"];
const JAPANESE_UNIFORM_COLORS = ["#24324a", "#334155", "#4c3f65", "#315b62", "#6b3e52", "#3f5368"];

export interface SvgAvatarData {
  faceShape: FaceShape;
  hairStyle: HairStyle;
  eyeStyle: EyeStyle;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  backgroundColor: string;
  accessoryStyle: AccessoryStyle;
}

export function generateSvgAvatar(agentId: string): SvgAvatarData {
  const h = hashString(agentId);
  const bits = (offset: number, count: number) => (h >>> offset) % count;

  return {
    faceShape: FACE_SHAPES[bits(0, FACE_SHAPES.length)],
    hairStyle: HAIR_STYLES[bits(3, HAIR_STYLES.length)],
    eyeStyle: EYE_STYLES[bits(6, EYE_STYLES.length)],
    skinColor: SKIN_COLORS[bits(8, SKIN_COLORS.length)],
    hairColor: HAIR_COLORS[bits(11, HAIR_COLORS.length)],
    shirtColor: JAPANESE_UNIFORM_COLORS[h % JAPANESE_UNIFORM_COLORS.length],
    backgroundColor: PASTEL_BACKGROUNDS[bits(17, PASTEL_BACKGROUNDS.length)],
    accessoryStyle: ACCESSORIES[bits(20, ACCESSORIES.length)],
  };
}
