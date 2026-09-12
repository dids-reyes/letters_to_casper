import { renderHook, act } from "@testing-library/react";
import {
  useFeedVirtualizer,
  groupItemsIntoRows,
  getGridDimensions,
  computeRowOffsets,
} from "./useFeedVirtualizer";

describe("useFeedVirtualizer Unit Tests", () => {
  describe("groupItemsIntoRows", () => {
    test("correctly groups cards into rows of specified column count", () => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        type: "letter",
        key: `item-${i}`,
      }));
      const rows = groupItemsIntoRows(items, 6);
      expect(rows).toHaveLength(3);
      expect(rows[0].items).toHaveLength(6);
      expect(rows[1].items).toHaveLength(6);
      expect(rows[2].items).toHaveLength(3);
      expect(rows[0].isAd).toBe(false);
    });

    test("places ad slots into their own full-width rows", () => {
      const items = [
        { type: "featured", key: "featured" },
        { type: "letter", key: "l-1" },
        { type: "ad", key: "ad-1" },
        { type: "letter", key: "l-2" },
      ];
      const rows = groupItemsIntoRows(items, 3);
      expect(rows).toHaveLength(3);
      expect(rows[0].items).toHaveLength(2);
      expect(rows[0].isAd).toBe(false);
      expect(rows[1].items).toHaveLength(1);
      expect(rows[1].isAd).toBe(true);
      expect(rows[2].items).toHaveLength(1);
      expect(rows[2].isAd).toBe(false);
    });
  });

  describe("computeRowOffsets & Zero CLS Math", () => {
    test("calculates exact cumulative offsets for desktop", () => {
      const dimensions = getGridDimensions(1200); // 170 card, 14 gap, 250 ad
      const rows = [
        { isAd: false, items: [1, 2, 3] },
        { isAd: true, items: ["ad"] },
        { isAd: false, items: [4, 5, 6] },
      ];
      const { offsets, totalHeight } = computeRowOffsets(rows, dimensions);

      expect(offsets[0]).toBe(0);
      expect(offsets[1]).toBe(170 + 14); // 184
      expect(offsets[2]).toBe(184 + 250 + 14); // 448
      expect(totalHeight).toBe(448 + 170); // 618
    });

    test("calculates exact cumulative offsets for mobile", () => {
      const dimensions = getGridDimensions(400); // 130 card, 8 gap, 250 ad
      const rows = [
        { isAd: false, items: [1, 2] },
        { isAd: false, items: [3, 4] },
      ];
      const { offsets, totalHeight } = computeRowOffsets(rows, dimensions);

      expect(offsets[0]).toBe(0);
      expect(offsets[1]).toBe(130 + 8); // 138
      expect(totalHeight).toBe(138 + 130); // 268
    });
  });

  describe("Hook Virtualization & Node Capping", () => {
    const generateLetters = (count) =>
      Array.from({ length: count }, (_, i) => ({
        type: "letter",
        key: `letter-${i + 1}`,
      }));

    function setWindowScrollY(val) {
      Object.defineProperty(window, "scrollY", {
        value: val,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "pageYOffset", {
        value: val,
        writable: true,
        configurable: true,
      });
    }

    beforeEach(() => {
      setWindowScrollY(0);
      window.innerHeight = 800;
      window.innerWidth = 1200;
      window.scrollTo = jest.fn((options) => {
        const top = typeof options === "object" ? options.top : options;
        setWindowScrollY(top);
      });
    });

    test("under 300+ items, mounted DOM nodes are strictly capped and offscreen nodes are unmounted", () => {
      const items = generateLetters(300); // 50 rows of 6 cards
      const containerRef = {
        current: {
          getBoundingClientRect: () => ({ top: 0 }),
        },
      };

      const { result } = renderHook(() =>
        useFeedVirtualizer({
          items,
          columns: 6,
          isSuspended: false,
          containerRef,
          overscanRows: 2,
        })
      );

      // Total rows = 50. In initial viewport (scrollY=0, height=800):
      // Each row is 184px (170+14). 800px fits ~5 visible rows + 2 overscan = ~7 rows (42 items).
      // Crucially, nowhere near 300 items are mounted!
      expect(result.current.virtualItems.length).toBeLessThan(50);
      expect(result.current.virtualItems.length).toBeGreaterThan(15);
      expect(result.current.topSpacerHeight).toBe(0);
      expect(result.current.bottomSpacerHeight).toBeGreaterThan(0);

      // Verify that total height equals topSpacer + visibleHeight + bottomSpacer (Zero CLS)
      const { startRow, endRow } = result.current.visibleRange;
      const dimensions = getGridDimensions(1200);
      const rows = groupItemsIntoRows(items, 6);
      const { offsets, totalHeight } = computeRowOffsets(rows, dimensions);

      const mountedHeight =
        offsets[endRow] + dimensions.cardHeight - offsets[startRow];
      const reconstructedTotal =
        result.current.topSpacerHeight +
        (result.current.topSpacerHeight > 0 ? dimensions.gap : 0) +
        mountedHeight +
        (result.current.bottomSpacerHeight > 0 ? dimensions.gap : 0) +
        result.current.bottomSpacerHeight;

      expect(reconstructedTotal).toBe(totalHeight);
    });

    test("bidirectional traversal: scrolling down unmounts top rows, scrolling back up smoothly remounts them", () => {
      const items = generateLetters(300);
      const containerRef = {
        current: {
          getBoundingClientRect: () => ({ top: 0 }),
        },
      };

      const { result } = renderHook(() =>
        useFeedVirtualizer({
          items,
          columns: 6,
          isSuspended: false,
          containerRef,
          overscanRows: 2,
        })
      );

      // Simulate scrolling down to row 20 (scrollY = 20 * 184 = 3680px)
      act(() => {
        setWindowScrollY(3680);
        window.dispatchEvent(new Event("scroll"));
      });

      // After scroll, top spacer must be positive, upper rows unmounted
      expect(result.current.topSpacerHeight).toBeGreaterThan(1000);
      const middleFirstItem = result.current.virtualItems[0];
      expect(middleFirstItem.key).not.toBe("letter-1");

      // Now scroll back up to top (scrollY = 0)
      act(() => {
        setWindowScrollY(0);
        window.dispatchEvent(new Event("scroll"));
      });

      // Top spacer returns to 0, first item is remounted
      expect(result.current.topSpacerHeight).toBe(0);
      expect(result.current.virtualItems[0].key).toBe("letter-1");
    });

    test("when isSuspended is true, scroll listeners are disconnected and no pagination triggers occur", () => {
      const items = generateLetters(60);
      const mockOnNearEnd = jest.fn();
      const containerRef = {
        current: {
          getBoundingClientRect: () => ({ top: 0 }),
        },
      };

      const { rerender } = renderHook(
        ({ isSuspended }) =>
          useFeedVirtualizer({
            items,
            columns: 6,
            isSuspended,
            containerRef,
            onNearEnd: mockOnNearEnd,
            hasMore: true,
          }),
        { initialProps: { isSuspended: true } }
      );

      // Scroll to bottom while suspended
      act(() => {
        setWindowScrollY(5000);
        window.dispatchEvent(new Event("scroll"));
      });

      // nearEnd must NOT be called while suspended
      expect(mockOnNearEnd).not.toHaveBeenCalled();

      // Unsuspending re-enables nearEnd
      rerender({ isSuspended: false });
      act(() => {
        setWindowScrollY(5000);
        window.dispatchEvent(new Event("scroll"));
      });
      expect(mockOnNearEnd).toHaveBeenCalled();
    });

    test("preserves and restores exact scroll coordinate upon exiting Read Mode without refetching", () => {
      const items = generateLetters(100);
      setWindowScrollY(1500);

      const { rerender } = renderHook(
        ({ isSuspended }) =>
          useFeedVirtualizer({
            items,
            columns: 6,
            isSuspended,
            hasMore: false,
          }),
        { initialProps: { isSuspended: false } }
      );

      // Enter Read Mode at scrollY = 1500
      rerender({ isSuspended: true });

      // While in Read Mode, scroll is ostensibly clamped or changed by modal
      setWindowScrollY(0);

      // Exit Read Mode -> Hook must restore scrollY back to 1500
      rerender({ isSuspended: false });
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 1500,
        behavior: "instant",
      });
      expect(window.scrollY).toBe(1500);
    });
  });
});
