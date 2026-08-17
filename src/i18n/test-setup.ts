import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import jaChat from "./locales/ja/chat.json";
import jaCommon from "./locales/ja/common.json";
import jaConsole from "./locales/ja/console.json";
import jaLayout from "./locales/ja/layout.json";
import jaOffice from "./locales/ja/office.json";
import jaPanels from "./locales/ja/panels.json";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
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
    lng: "ja",
    fallbackLng: "ja",
    defaultNS: "common",
    ns: ["common", "layout", "office", "panels", "chat", "console"],
    interpolation: { escapeValue: false },
  });
}

export default i18n;
