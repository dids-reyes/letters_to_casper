import { useCallback, useEffect, useRef, useState } from "react";

export const PIN_TOOLTIP_VIEW_COUNT_KEY = "pin_tooltip_view_count";
export const PIN_TOOLTIP_DISMISSED_KEY = "pin_tooltip_dismissed";
export const PIN_TOOLTIP_MAX_VIEWS = 2;

const getStorage = (storage) => {
  if (storage) return storage;
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getPinTooltipPreferences = (storage) => {
  const safeStorage = getStorage(storage);
  if (!safeStorage) return { viewCount: 0, dismissed: false };

  try {
    const parsedCount = Number.parseInt(
      safeStorage.getItem(PIN_TOOLTIP_VIEW_COUNT_KEY) || "0",
      10
    );
    return {
      viewCount: Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : 0,
      dismissed: safeStorage.getItem(PIN_TOOLTIP_DISMISSED_KEY) === "true",
    };
  } catch {
    return { viewCount: 0, dismissed: false };
  }
};

export const claimPinTooltipView = (storage) => {
  const safeStorage = getStorage(storage);
  const preferences = getPinTooltipPreferences(safeStorage);
  if (
    !safeStorage ||
    preferences.dismissed ||
    preferences.viewCount >= PIN_TOOLTIP_MAX_VIEWS
  ) {
    return false;
  }

  try {
    safeStorage.setItem(
      PIN_TOOLTIP_VIEW_COUNT_KEY,
      String(preferences.viewCount + 1)
    );
    return true;
  } catch {
    return false;
  }
};

export const permanentlyDismissPinTooltip = (storage) => {
  const safeStorage = getStorage(storage);
  if (!safeStorage) return;

  try {
    safeStorage.setItem(PIN_TOOLTIP_DISMISSED_KEY, "true");
  } catch {
    // Storage can be unavailable in privacy modes; dismissal still applies in memory.
  }
};

export default function usePinTooltipOnboarding({
  ready,
  letterKey,
  showDelay = 400,
  autoHideDelay = 7000,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const delayTimerRef = useRef(null);
  const autoHideTimerRef = useRef(null);
  const removalTimerRef = useRef(null);
  const claimedLetterRef = useRef("");

  const clearTimers = useCallback(() => {
    clearTimeout(delayTimerRef.current);
    clearTimeout(autoHideTimerRef.current);
    clearTimeout(removalTimerRef.current);
    delayTimerRef.current = null;
    autoHideTimerRef.current = null;
    removalTimerRef.current = null;
  }, []);

  const hide = useCallback(() => {
    clearTimers();
    setIsOpen(false);
    removalTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      removalTimerRef.current = null;
    }, 220);
  }, [clearTimers]);

  const dismiss = useCallback(() => {
    permanentlyDismissPinTooltip();
    hide();
  }, [hide]);

  useEffect(() => {
    if (!ready || !letterKey || claimedLetterRef.current === letterKey) {
      if (!ready) hide();
      return undefined;
    }

    delayTimerRef.current = setTimeout(() => {
      claimedLetterRef.current = letterKey;
      if (!claimPinTooltipView()) return;

      setIsMounted(true);
      setIsOpen(true);
      autoHideTimerRef.current = setTimeout(() => {
        hide();
      }, autoHideDelay);
    }, showDelay);

    return clearTimers;
  }, [autoHideDelay, clearTimers, hide, letterKey, ready, showDelay]);

  useEffect(() => clearTimers, [clearTimers]);

  return { isMounted, isOpen, hide, dismiss };
}
