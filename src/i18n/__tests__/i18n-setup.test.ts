import { describe, it, expect } from "vitest";
import i18n, { supportedLngs, namespaces } from "../index";

describe("i18n setup", () => {
  it("supports Japanese only", () => {
    expect(supportedLngs).toEqual(["ja"]);
  });

  it("has Japanese resource bundles for all namespaces", () => {
    for (const ns of namespaces) {
      expect(i18n.hasResourceBundle("ja", ns)).toBe(true);
    }
  });

  it("falls back to Japanese", () => {
    expect(i18n.options.fallbackLng).toEqual(["ja"]);
  });

  it("renders Japanese labels", () => {
    expect(i18n.t("actions.save")).toBe("保存");
    expect(i18n.t("zones.meeting")).toBe("会議室");
  });
});
