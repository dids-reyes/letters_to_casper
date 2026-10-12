import {
  isValidIpv4,
  normalizeClientCoordinates,
  prewarmClientLocation,
  resetCachedClientIpv4,
  resolveClientCoordinates,
  resolveClientIpv4,
} from "./clientIpv4";

describe("clientIpv4 and geolocation utility", () => {
  const originalFetch = global.fetch;
  const originalGeolocation = global.navigator?.geolocation;

  beforeEach(() => {
    resetCachedClientIpv4();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (global.navigator) {
      Object.defineProperty(global.navigator, "geolocation", {
        value: originalGeolocation,
        configurable: true,
        writable: true,
      });
    }
    resetCachedClientIpv4();
  });

  test("validates IPv4 addresses and rejects IPv6 or malformed strings", () => {
    expect(isValidIpv4("112.198.68.42")).toBe(true);
    expect(isValidIpv4("2001:4450:8140:1200::1")).toBe(false);
    expect(isValidIpv4("blocked")).toBe(false);
    expect(isValidIpv4("")).toBe(false);
  });

  test("resolves and caches public IPv4 from api.ipify.org", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ip: "49.145.172.19" }),
    });

    const first = await resolveClientIpv4();
    const second = await resolveClientIpv4();

    expect(first).toBe("49.145.172.19");
    expect(second).toBe("49.145.172.19");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.ipify.org/?format=json",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("returns empty string without throwing when blocked or failing", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("AdBlocker blocked"));

    const ip = await resolveClientIpv4();
    expect(ip).toBe("");
  });

  test("normalizes browser GPS coordinates without rounding", () => {
    expect(
      normalizeClientCoordinates({
        latitude: 14.554729,
        longitude: 121.024445,
      })
    ).toEqual({
      latitude: 14.554729,
      longitude: 121.024445,
    });
    expect(normalizeClientCoordinates({ latitude: 0, longitude: 0 })).toBeNull();
  });

  test("resolves and caches browser GPS coordinates when user grants permission", async () => {
    const getCurrentPosition = jest.fn((onSuccess) => {
      onSuccess({
        coords: {
          latitude: 14.554729,
          longitude: 121.024445,
        },
      });
    });

    Object.defineProperty(global.navigator, "geolocation", {
      value: { getCurrentPosition },
      configurable: true,
      writable: true,
    });

    prewarmClientLocation();
    const coords = await resolveClientCoordinates();

    expect(coords).toEqual({
      latitude: 14.554729,
      longitude: 121.024445,
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  test("returns null without throwing when user denies browser GPS permission", async () => {
    const getCurrentPosition = jest.fn((_, onError) => {
      onError(new Error("User denied Geolocation"));
    });

    Object.defineProperty(global.navigator, "geolocation", {
      value: { getCurrentPosition },
      configurable: true,
      writable: true,
    });

    const coords = await resolveClientCoordinates();
    expect(coords).toBeNull();
  });
});
