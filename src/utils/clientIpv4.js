const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const IPIFY_IPV4_URL = "https://api.ipify.org/?format=json";

let cachedIpv4 = "";
let inFlightLookup = null;

let cachedCoordinates = null;
let geolocationSettled = false;
let inFlightCoordsLookup = null;

export const isValidIpv4 = (value) => IPV4_PATTERN.test(String(value || "").trim());

export const normalizeClientCoordinates = (rawCoords) => {
  if (!rawCoords || typeof rawCoords !== "object") return null;
  const latitude = Number(rawCoords.latitude ?? rawCoords.lat);
  const longitude = Number(rawCoords.longitude ?? rawCoords.lng ?? rawCoords.lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    (Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001)
  ) {
    return null;
  }
  return {
    latitude: Math.round(latitude * 1000) / 1000,
    longitude: Math.round(longitude * 1000) / 1000,
  };
};

export const resetCachedClientIpv4 = () => {
  cachedIpv4 = "";
  inFlightLookup = null;
  cachedCoordinates = null;
  geolocationSettled = false;
  inFlightCoordsLookup = null;
};

export const resolveClientIpv4 = async ({ timeoutMs = 1500 } = {}) => {
  if (cachedIpv4) return cachedIpv4;
  if (inFlightLookup) return inFlightLookup;
  if (typeof fetch !== "function") return "";

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeoutId;

  const lookupPromise = (async () => {
    try {
      const fetchPromise = fetch(IPIFY_IPV4_URL, {
        method: "GET",
        ...(controller ? { signal: controller.signal } : {}),
      });
      const timeoutPromise = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          controller?.abort?.();
          resolve(null);
        }, timeoutMs);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      if (!response || !response.ok || typeof response.json !== "function") return "";
      const data = await response.json().catch(() => ({}));
      const ip = String(data?.ip || "").trim();
      if (isValidIpv4(ip)) {
        cachedIpv4 = ip;
        return ip;
      }
      return "";
    } catch {
      return "";
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      inFlightLookup = null;
    }
  })();

  inFlightLookup = lookupPromise;
  return lookupPromise;
};

const requestBrowserCoordinates = (geoTimeoutMs = 30000) => {
  if (cachedCoordinates) return Promise.resolve(cachedCoordinates);
  if (geolocationSettled) return Promise.resolve(null);
  if (inFlightCoordsLookup) return inFlightCoordsLookup;

  const geolocation =
    typeof navigator !== "undefined" && navigator?.geolocation
      ? navigator.geolocation
      : null;

  if (!geolocation || typeof geolocation.getCurrentPosition !== "function") {
    geolocationSettled = true;
    return Promise.resolve(null);
  }

  const lookupPromise = new Promise((resolve) => {
    let settled = false;
    const finish = (coords) => {
      if (settled) return;
      settled = true;
      if (coords) {
        cachedCoordinates = coords;
        geolocationSettled = true;
      }
      inFlightCoordsLookup = null;
      resolve(coords);
    };

    try {
      geolocation.getCurrentPosition(
        (position) => {
          finish(normalizeClientCoordinates(position?.coords));
        },
        () => {
          finish(null);
        },
        {
          enableHighAccuracy: false,
          timeout: geoTimeoutMs,
          maximumAge: 600000,
        }
      );
    } catch {
      finish(null);
    }
  });

  inFlightCoordsLookup = lookupPromise;
  return lookupPromise;
};

export const prewarmClientLocation = () => {
  requestBrowserCoordinates(30000).catch(() => null);
};

export const resolveClientCoordinates = async ({ timeoutMs = 30000 } = {}) => {
  if (cachedCoordinates) return cachedCoordinates;
  if (geolocationSettled) return null;

  let timeoutId;
  try {
    const coordsPromise = requestBrowserCoordinates(timeoutMs);
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(null), timeoutMs);
    });
    return await Promise.race([coordsPromise, timeoutPromise]);
  } catch {
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};
