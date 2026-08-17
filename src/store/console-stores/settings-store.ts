import { create } from "zustand";

type ThemePreference = "light" | "dark" | "system";

const THEME_KEY = "clawprowl-console-theme";
const LANG_KEY = "clawprowl-console-lang";
const DEV_MODE_KEY = "clawprowl-console-dev-mode";

function readLocal(key: string, fallback: string): string {
  return (typeof window === "undefined" ? null : window.localStorage?.getItem(key)) ?? fallback;
}

function readLocalBool(key: string, fallback: boolean): boolean {
  const val = typeof window === "undefined" ? null : window.localStorage?.getItem(key);
  if (val === null) return fallback;
  return val === "true";
}

interface ConsoleSettingsState {
  theme: ThemePreference;
  language: string;
  devModeUnlocked: boolean;

  setTheme: (theme: ThemePreference) => void;
  setLanguage: (lang: string) => void;
  setDevModeUnlocked: (v: boolean) => void;
}

export const useConsoleSettingsStore = create<ConsoleSettingsState>((set) => ({
  theme: readLocal(THEME_KEY, "system") as ThemePreference,
  language: readLocal(LANG_KEY, "ja"),
  devModeUnlocked: readLocalBool(DEV_MODE_KEY, false),

  setTheme: (theme) => {
    window.localStorage?.setItem(THEME_KEY, theme);
    set({ theme });
  },

  setLanguage: (language) => {
    window.localStorage?.setItem(LANG_KEY, language);
    set({ language });
  },

  setDevModeUnlocked: (devModeUnlocked) => {
    window.localStorage?.setItem(DEV_MODE_KEY, String(devModeUnlocked));
    set({ devModeUnlocked });
  },
}));
