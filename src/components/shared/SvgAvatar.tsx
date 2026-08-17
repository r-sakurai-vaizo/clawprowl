import type { AccessoryStyle, EyeStyle, FaceShape, HairStyle } from "@/lib/avatar-generator";
import { generateSvgAvatar } from "@/lib/avatar-generator";

interface SvgAvatarProps {
  agentId: string;
  size?: number;
  className?: string;
}

function FacePath({ shape, color }: { shape: FaceShape; color: string }) {
  switch (shape) {
    case "round":
      return <circle cx="24" cy="21" r="12" fill={color} stroke="#c58f79" strokeWidth="0.5" />;
    case "square":
      return (
        <rect
          x="12"
          y="9"
          width="24"
          height="24"
          rx="8"
          fill={color}
          stroke="#c58f79"
          strokeWidth="0.5"
        />
      );
    case "oval":
      return (
        <ellipse cx="24" cy="21" rx="11" ry="14" fill={color} stroke="#c58f79" strokeWidth="0.5" />
      );
  }
}

function HairPath({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "short":
      return (
        <path d="M12 18 Q10 6 24 5 Q38 6 36 18 L32 12 L28 16 L24 11 L19 16 L16 12 Z" fill={color} />
      );
    case "spiky":
      return (
        <path
          d="M12 17 L14 5 L19 11 L22 2 L26 10 L31 3 L32 12 L38 8 L35 20 L31 14 L27 17 L23 12 L18 17 L15 13 Z"
          fill={color}
        />
      );
    case "bob":
      return (
        <path
          d="M11 26 Q9 7 24 5 Q39 7 37 28 L32 31 L32 15 L27 18 L23 11 L18 18 L15 14 L16 30 Z"
          fill={color}
        />
      );
    case "hime":
      return (
        <path
          d="M10 31 Q9 7 24 4 Q39 7 38 31 L33 34 L33 15 L29 18 L25 10 L20 18 L15 14 L15 34 Z"
          fill={color}
        />
      );
    case "side-tail":
      return (
        <>
          <path
            d="M12 18 Q10 6 24 5 Q37 6 36 19 L31 13 L27 17 L23 11 L18 17 L15 13 Z"
            fill={color}
          />
          <path d="M35 11 Q44 15 38 30 Q36 24 32 18 Z" fill={color} />
        </>
      );
    case "messy":
      return (
        <path
          d="M11 19 L13 8 L17 11 L20 3 L24 9 L29 3 L31 11 L37 8 L35 21 L31 14 L28 18 L24 12 L20 18 L16 13 Z"
          fill={color}
        />
      );
  }
}

function Eyes({ style }: { style: EyeStyle }) {
  switch (style) {
    case "sparkle":
      return (
        <>
          <ellipse cx="19" cy="21" rx="2.5" ry="3.2" fill="#303047" />
          <circle cx="18.3" cy="19.8" r="0.9" fill="white" />
          <circle cx="19.8" cy="22.1" r="0.45" fill="#a5b4fc" />
          <ellipse cx="29" cy="21" rx="2.5" ry="3.2" fill="#303047" />
          <circle cx="28.3" cy="19.8" r="0.9" fill="white" />
          <circle cx="29.8" cy="22.1" r="0.45" fill="#a5b4fc" />
        </>
      );
    case "soft":
      return (
        <>
          <path
            d="M16.5 21 Q19 18.5 21.5 21"
            fill="none"
            stroke="#303047"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="19" cy="21" r="1.25" fill="#303047" />
          <path
            d="M26.5 21 Q29 18.5 31.5 21"
            fill="none"
            stroke="#303047"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="29" cy="21" r="1.25" fill="#303047" />
        </>
      );
    case "smile":
      return (
        <>
          <path
            d="M16.5 21 Q19 24 21.5 21"
            fill="none"
            stroke="#303047"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M26.5 21 Q29 24 31.5 21"
            fill="none"
            stroke="#303047"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      );
  }
}

function Accessory({ style }: { style: AccessoryStyle }) {
  switch (style) {
    case "none":
      return null;
    case "ribbon":
      return (
        <path
          d="M34 10 L39 7 L38 13 L42 15 L36 17 L33 13 Z"
          fill="#ef6f9f"
          stroke="#9d345e"
          strokeWidth="0.5"
        />
      );
    case "hairpin":
      return (
        <path
          d="M31 10 L36 14 M33 8 L38 12"
          stroke="#f8c84a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      );
    case "headband":
      return (
        <path
          d="M14 12 Q24 4 35 12"
          fill="none"
          stroke="#ef6f9f"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    case "glasses":
      return (
        <path
          d="M15 20 H22 V24 H16 Q15 24 15 23 Z M26 20 H33 V23 Q33 24 32 24 H26 Z M22 21 H26"
          fill="none"
          stroke="#3f3f55"
          strokeWidth="0.9"
        />
      );
  }
}

export function SvgAvatar({ agentId, size = 40, className }: SvgAvatarProps) {
  const avatar = generateSvgAvatar(agentId);

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: "50%", overflow: "hidden" }}
    >
      <rect width="48" height="48" fill={avatar.backgroundColor} rx="24" />
      <circle cx="39" cy="9" r="6" fill="#ffffff" opacity="0.35" />
      {/* Body/shirt */}
      <path d="M8 42 Q8 34 24 34 Q40 34 40 42 L40 48 L8 48 Z" fill={avatar.shirtColor} />
      <path d="M19 35 L24 41 L29 35" fill="#f8fafc" opacity="0.95" />
      {/* Face */}
      <FacePath shape={avatar.faceShape} color={avatar.skinColor} />
      {/* Hair */}
      <HairPath style={avatar.hairStyle} color={avatar.hairColor} />
      {/* Eyes */}
      <Eyes style={avatar.eyeStyle} />
      <circle cx="15.8" cy="25.5" r="2" fill="#f59cab" opacity="0.35" />
      <circle cx="32.2" cy="25.5" r="2" fill="#f59cab" opacity="0.35" />
      {/* Mouth */}
      <path
        d="M21.5 27 Q24 29 26.5 27"
        stroke="#8f4a52"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <Accessory style={avatar.accessoryStyle} />
    </svg>
  );
}
