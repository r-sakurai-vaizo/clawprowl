import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import jaChat from "./locales/ja/chat.json";
import jaCommon from "./locales/ja/common.json";
import jaConsole from "./locales/ja/console.json";
import jaLayout from "./locales/ja/layout.json";
import jaOffice from "./locales/ja/office.json";
import jaPanels from "./locales/ja/panels.json";

export const supportedLngs = ["ja"] as const;
export type SupportedLng = (typeof supportedLngs)[number];

export const namespaces = ["common", "layout", "office", "panels", "chat", "console"] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        common: jaCommon,
        layout: jaLayout,
        office: jaOffice,
        panels: jaPanels,
        chat: jaChat,
        console: jaConsole,
      },
    },
    supportedLngs: [...supportedLngs],
    lng: "ja",
    fallbackLng: "ja",
    defaultNS: "common",
    ns: [...namespaces],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
