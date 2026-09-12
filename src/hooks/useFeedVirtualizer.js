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
  const [scrollY, setScrollY] = useState(() =>
    typeof window !== "undefined" ? window.scrollY : 0
  );

  const savedScrollY = useRef(0);
  const rafId = useRef(null);

  // Resize listener to track window width and responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
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

  const { offsets, totalHeight } = useMemo(
    () => computeRowOffsets(rows, dimensions),
    [rows, dimensions]
  );

  // Calculate visible row range based on current scroll position
  const visibleRange = useMemo(() => {
    if (rows.length === 0) {
      return { startRow: 0, endRow: -1 };
    }

    // When total rows is small (<= 8 rows, e.g. ~24-48 cards), render all rows directly
    if (rows.length <= 8) {
      return { startRow: 0, endRow: rows.length - 1 };
    }

    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;

    let viewTop = scrollY;
    if (
      containerRef &&
      containerRef.current &&
      typeof containerRef.current.getBoundingClientRect === "function"
    ) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top === 0 && scrollY > 0) {
        viewTop = scrollY;
      } else {
        viewTop = Math.max(0, -rect.top);
      }
    }

    const viewBottom = viewTop + viewportHeight;

    // Find first visible row
    let firstVisible = 0;
    for (let i = 0; i < rows.length; i++) {
      const rowH = rows[i].isAd ? dimensions.adHeight : dimensions.cardHeight;
      if (offsets[i] + rowH >= viewTop) {
        firstVisible = i;
        break;
      }
    }

    // Find last visible row
    let lastVisible = firstVisible;
    for (let i = firstVisible; i < rows.length; i++) {
      if (offsets[i] <= viewBottom) {
        lastVisible = i;
      } else {
        break;
      }
    }

    const startRow = Math.max(0, firstVisible - overscanRows);
    const endRow = Math.min(rows.length - 1, lastVisible + overscanRows);

    return { startRow, endRow };
  }, [rows, dimensions, offsets, scrollY, containerRef, overscanRows]);

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
  }, [rows.length, visibleRange, offsets, dimensions.gap, totalHeight]);

  // Extract items to mount in the DOM
  const virtualItems = useMemo(() => {
    if (rows.length === 0 || visibleRange.endRow < 0) return [];
    const slicedRows = rows.slice(
      visibleRange.startRow,
      visibleRange.endRow + 1
    );
    return slicedRows.flatMap((r) => r.items);
  }, [rows, visibleRange]);

  const updateBounds = useCallback(() => {
    if (typeof window !== "undefined") {
      setScrollY(window.scrollY);
    }
  }, []);

  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      savedScrollY.current = window.scrollY;
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        if (typeof window.scrollTo === "function") {
          window.scrollTo({ top: savedScrollY.current, behavior: "instant" });
        }
      } catch (e) {
        window.scrollY = savedScrollY.current;
      }
      setScrollY(savedScrollY.current);
    }
  }, []);

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
  const lastFetchedRowCount = useRef(0);
  useEffect(() => {
    if (isSuspended || !hasMore || !onNearEnd) return;

    if (
      rows.length > 0 &&
      visibleRange.endRow >= rows.length - 3 &&
      lastFetchedRowCount.current !== rows.length
    ) {
      lastFetchedRowCount.current = rows.length;
      onNearEnd();
    }
  }, [visibleRange.endRow, rows.length, isSuspended, hasMore, onNearEnd]);

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
