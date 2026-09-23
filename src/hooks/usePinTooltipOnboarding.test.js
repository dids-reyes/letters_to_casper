import {
  PIN_TOOLTIP_DISMISSED_KEY,
  PIN_TOOLTIP_VIEW_COUNT_KEY,
  claimPinTooltipView,
  getPinTooltipPreferences,
  permanentlyDismissPinTooltip,
} from "./usePinTooltipOnboarding";

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
};

describe("Pin Letter tooltip storage", () => {
  test("claims no more than two automatic views", () => {
    const storage = createStorage();

    expect(claimPinTooltipView(storage)).toBe(true);
    expect(claimPinTooltipView(storage)).toBe(true);
    expect(claimPinTooltipView(storage)).toBe(false);
    expect(storage.getItem(PIN_TOOLTIP_VIEW_COUNT_KEY)).toBe("2");
  });

  test("a permanent dismissal prevents later automatic views", () => {
    const storage = createStorage();
    expect(claimPinTooltipView(storage)).toBe(true);

    permanentlyDismissPinTooltip(storage);

    expect(storage.getItem(PIN_TOOLTIP_DISMISSED_KEY)).toBe("true");
    expect(claimPinTooltipView(storage)).toBe(false);
    expect(getPinTooltipPreferences(storage)).toEqual({
      viewCount: 1,
      dismissed: true,
    });
  });

  test("handles unavailable storage without throwing", () => {
    const inaccessibleStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(getPinTooltipPreferences(inaccessibleStorage)).toEqual({
      viewCount: 0,
      dismissed: false,
    });
    expect(claimPinTooltipView(inaccessibleStorage)).toBe(false);
    expect(() => permanentlyDismissPinTooltip(inaccessibleStorage)).not.toThrow();
  });
});
