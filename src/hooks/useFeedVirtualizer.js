import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * Groups a flat array of feed items into grid rows based on column count.
 * Ad slots span the entire row (1 / -1), while cards fill columns sequentially.
 */
export function groupItemsIntoRows(items, columns) {
  if (!items || items.length === 0) return [];
  const safeCols = Math.max(1, Number(columns) || 1);
  const rows = [];
  let currentRow = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === "ad") {
      if (currentRow.length > 0) {
        rows.push({ isAd: false, items: currentRow });
        currentRow = [];
      }
      rows.push({ isAd: true, items: [item] });
    } else {
      currentRow.push(item);
      if (currentRow.length === safeCols) {
        rows.push({ isAd: false, items: currentRow });
        currentRow = [];
      }
    }
  }

  if (currentRow.length > 0) {
    rows.push({ isAd: false, items: currentRow });
  }

  return rows;
}

/**
 * Returns grid dimensions (card height, gap, ad height) matching App.css.
 */
export function getGridDimensions(windowWidth) {
  const width =
    typeof windowWidth === "number"
      ? windowWidth
      : typeof window !== "undefined"
      ? window.innerWidth
      : 1200;
  const isMobile = width <= 768;
  return {
    cardHeight: isMobile ? 130 : 170,
    gap: isMobile ? 8 : 14,
    adHeight: 250,
  };
}

/**
 * Computes cumulative offsets and total height for rows.
 */
export function computeRowOffsets(rows, dimensions) {
  const { cardHeight, gap, adHeight } = dimensions;
  const offsets = new Array(rows.length);
  let currentOffset = 0;

  for (let i = 0; i < rows.length; i++) {
    offsets[i] = currentOffset;
    const h = rows[i].isAd ? adHeight : cardHeight;
    currentOffset += h + gap;
  }

  const totalHeight =
    rows.length > 0
      ? offsets[rows.length - 1] +
        (rows[rows.length - 1].isAd ? adHeight : cardHeight)
      : 0;

  return { offsets, totalHeight };
}

/**
 * Custom hook for main feed DOM virtualization.
 */
export function useFeedVirtualizer({
  items = [],
  columns = 3,
  isSuspended = false,
  containerRef,
  onNearEnd,
  hasMore = false,
  overscanRows = 2,
}) {
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const savedScrollY = useRef(0);
  const lastKnownScrollY = useRef(
    typeof window !== "undefined" ? window.scrollY : 0
  );
  const cachedContainerTop = useRef(null);
  const rafId = useRef(null);

  // Resize listener to track window width and responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      cachedContainerTop.current = null;
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dimensions = useMemo(
    () => getGridDimensions(windowWidth),
    [windowWidth]
  );

  const rows = useMemo(
    () => groupItemsIntoRows(items, columns),
    [items, columns]
  );

  useEffect(() => {
    cachedContainerTop.current = null;
  }, [items, columns]);

  const { offsets, totalHeight } = useMemo(
    () => computeRowOffsets(rows, dimensions),
    [rows, dimensions]
  );

  // Compute visible row range based on scroll position
  const calculateRange = useCallback(
    (currentScrollY) => {
      if (rows.length === 0) {
        return { startRow: 0, endRow: -1, lastVisible: -1 };
      }

      const viewportHeight =
        typeof window !== "undefined" ? window.innerHeight : 800;

      let viewTop = currentScrollY;
      if (
        containerRef &&
        containerRef.current &&
        typeof containerRef.current.getBoundingClientRect === "function"
      ) {
        if (cachedContainerTop.current === null) {
          const rect = containerRef.current.getBoundingClientRect();
          if (rect.top === 0 && currentScrollY > 0) {
            cachedContainerTop.current = 0;
          } else {
            cachedContainerTop.current = Math.max(0, rect.top + currentScrollY);
          }
        }
        viewTop = Math.max(0, currentScrollY - cachedContainerTop.current);
      }

      const viewBottom = viewTop + viewportHeight;

      // Fast binary search for first visible row in sorted offsets array
      let low = 0;
      let high = rows.length - 1;
      let firstVisible = 0;
      while (low <= high) {
        const mid = (low + high) >> 1;
        const rowH = rows[mid].isAd ? dimensions.adHeight : dimensions.cardHeight;
        if (offsets[mid] + rowH >= viewTop) {
          firstVisible = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      // Fast binary search for last visible row
      low = firstVisible;
      high = rows.length - 1;
      let lastVisible = firstVisible;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (offsets[mid] <= viewBottom) {
          lastVisible = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (items.length < 300) {
        return { startRow: 0, endRow: rows.length - 1, lastVisible };
      }

      const startRow = Math.max(0, firstVisible - overscanRows);
      const endRow = Math.min(rows.length - 1, lastVisible + overscanRows);

      return { startRow, endRow, lastVisible };
    },
    [rows, dimensions, offsets, containerRef, overscanRows, items.length]
  );

  const [visibleRange, setVisibleRange] = useState(() =>
    calculateRange(typeof window !== "undefined" ? window.scrollY : 0)
  );

  // Sync visible range when grid layout/items/offsets change
  useEffect(() => {
    const currentScrollY =
      typeof window !== "undefined" ? window.scrollY : 0;
    const nextRange = calculateRange(currentScrollY);
    setVisibleRange((prev) => {
      if (
        prev.startRow === nextRange.startRow &&
        prev.endRow === nextRange.endRow &&
        prev.lastVisible === nextRange.lastVisible
      ) {
        return prev;
      }
      return nextRange;
    });
  }, [calculateRange]);

  // Compute top and bottom spacer heights ensuring exact zero-CLS parity with unvirtualized grid
  const { topSpacerHeight, bottomSpacerHeight } = useMemo(() => {
    if (rows.length === 0 || visibleRange.endRow < 0) {
      return { topSpacerHeight: 0, bottomSpacerHeight: 0 };
    }

    const topSpacer =
      visibleRange.startRow > 0
        ? Math.max(0, offsets[visibleRange.startRow] - dimensions.gap)
        : 0;

    const bottomSpacer =
      visibleRange.endRow < rows.length - 1
        ? Math.max(0, totalHeight - offsets[visibleRange.endRow + 1])
        : 0;

    return {
      topSpacerHeight: topSpacer,
      bottomSpacerHeight: bottomSpacer,
    };
  }, [rows.length, visibleRange.startRow, visibleRange.endRow, offsets, dimensions.gap, totalHeight]);

  // Extract items to mount in the DOM
  const virtualItems = useMemo(() => {
    if (rows.length === 0 || visibleRange.endRow < 0) return [];
    const slicedRows = rows.slice(
      visibleRange.startRow,
      visibleRange.endRow + 1
    );
    return slicedRows.flatMap((r) => r.items);
  }, [rows, visibleRange.startRow, visibleRange.endRow]);

  const lastFetchedRowCount = useRef(0);

  const updateBounds = useCallback(() => {
    if (typeof window !== "undefined") {
      const nextScrollY = window.scrollY;
      lastKnownScrollY.current = nextScrollY;
      const nextRange = calculateRange(nextScrollY);

      if (
        !isSuspended &&
        hasMore &&
        onNearEnd &&
        rows.length > 0 &&
        nextRange.lastVisible >= rows.length - 3 &&
        lastFetchedRowCount.current !== rows.length
      ) {
        lastFetchedRowCount.current = rows.length;
        onNearEnd();
      }

      setVisibleRange((prev) => {
        if (
          prev.startRow === nextRange.startRow &&
          prev.endRow === nextRange.endRow
        ) {
          return prev;
        }
        return nextRange;
      });
    }
  }, [calculateRange, isSuspended, hasMore, onNearEnd, rows.length]);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY;
      savedScrollY.current =
        currentScrollY > 0 ? currentScrollY : lastKnownScrollY.current;
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const targetY = savedScrollY.current;
      const applyScroll = () => {
        if (Math.abs(window.scrollY - targetY) > 1) {
          try {
            if (typeof window.scrollTo === "function") {
              window.scrollTo({ top: targetY, behavior: "instant" });
            }
          } catch (e) {
            window.scrollY = targetY;
          }
        }
        lastKnownScrollY.current = targetY;
        updateBounds();
      };

      applyScroll();
      if (process.env.NODE_ENV !== "test") {
        window.requestAnimationFrame(() => {
          applyScroll();
          window.requestAnimationFrame(updateBounds);
        });
      }
    }
  }, [updateBounds]);

  // Handle suspension and resumption (Read Mode decoupling)
  const prevSuspended = useRef(isSuspended);
  useEffect(() => {
    if (isSuspended && !prevSuspended.current) {
      // Entering Read Mode: Anchor current scroll coordinate
      saveScrollPosition();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    } else if (!isSuspended && prevSuspended.current) {
      // Exiting Read Mode: Restore scroll position immediately from cache with zero flicker
      restoreScrollPosition();
      if (process.env.NODE_ENV === "test") {
        updateBounds();
      } else if (typeof window !== "undefined") {
        window.requestAnimationFrame(updateBounds);
      }
    }
    prevSuspended.current = isSuspended;
  }, [isSuspended, saveScrollPosition, restoreScrollPosition, updateBounds]);

  // Window scroll listener (active only when feed is NOT suspended)
  useEffect(() => {
    if (isSuspended) return undefined;

    const handleScroll = () => {
      if (isSuspended) return;
      if (process.env.NODE_ENV === "test") {
        updateBounds();
        return;
      }
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        updateBounds();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [isSuspended, updateBounds]);

  // Trigger onNearEnd when approaching the bottom of loaded items (dormant while suspended)
  useEffect(() => {
    if (isSuspended || !hasMore || !onNearEnd) return;

    const nearEnd =
      visibleRange.lastVisible !== undefined && visibleRange.lastVisible >= 0
        ? visibleRange.lastVisible >= rows.length - 3
        : visibleRange.endRow >= rows.length - 3;

    if (
      rows.length > 0 &&
      nearEnd &&
      lastFetchedRowCount.current !== rows.length
    ) {
      lastFetchedRowCount.current = rows.length;
      onNearEnd();
    }
  }, [visibleRange.lastVisible, visibleRange.endRow, rows.length, isSuspended, hasMore, onNearEnd]);

  return {
    virtualItems,
    topSpacerHeight,
    bottomSpacerHeight,
    totalHeight,
    saveScrollPosition,
    restoreScrollPosition,
    visibleRange,
  };
}
