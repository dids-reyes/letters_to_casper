import React, { useMemo } from "react";
import { getCityStampData, isInternationalLocation, getPhilippineIslandGroup, getDedicatedCountryCode } from "../data/philippineCities";

const SCALLOP_48_58 = "M 0 0 L 0.6 0 A 1.4 1.4 0 0 1 3.4 0 L 4.0 0 L 4.6 0 A 1.4 1.4 0 0 1 7.4 0 L 8.0 0 L 8.6 0 A 1.4 1.4 0 0 1 11.4 0 L 12.0 0 L 12.6 0 A 1.4 1.4 0 0 1 15.4 0 L 16.0 0 L 16.6 0 A 1.4 1.4 0 0 1 19.4 0 L 20.0 0 L 20.6 0 A 1.4 1.4 0 0 1 23.4 0 L 24.0 0 L 24.6 0 A 1.4 1.4 0 0 1 27.4 0 L 28.0 0 L 28.6 0 A 1.4 1.4 0 0 1 31.4 0 L 32.0 0 L 32.6 0 A 1.4 1.4 0 0 1 35.4 0 L 36.0 0 L 36.6 0 A 1.4 1.4 0 0 1 39.4 0 L 40.0 0 L 40.6 0 A 1.4 1.4 0 0 1 43.4 0 L 44.0 0 L 44.6 0 A 1.4 1.4 0 0 1 47.4 0 L 48.0 0 L 48 0.7 A 1.4 1.4 0 0 1 48 3.5 L 48 4.1 L 48 4.8 A 1.4 1.4 0 0 1 48 7.6 L 48 8.3 L 48 9.0 A 1.4 1.4 0 0 1 48 11.8 L 48 12.4 L 48 13.1 A 1.4 1.4 0 0 1 48 15.9 L 48 16.6 L 48 17.2 A 1.4 1.4 0 0 1 48 20.0 L 48 20.7 L 48 21.4 A 1.4 1.4 0 0 1 48 24.2 L 48 24.9 L 48 25.5 A 1.4 1.4 0 0 1 48 28.3 L 48 29.0 L 48 29.7 A 1.4 1.4 0 0 1 48 32.5 L 48 33.1 L 48 33.8 A 1.4 1.4 0 0 1 48 36.6 L 48 37.3 L 48 38.0 A 1.4 1.4 0 0 1 48 40.8 L 48 41.4 L 48 42.1 A 1.4 1.4 0 0 1 48 44.9 L 48 45.6 L 48 46.2 A 1.4 1.4 0 0 1 48 49.0 L 48 49.7 L 48 50.4 A 1.4 1.4 0 0 1 48 53.2 L 48 53.9 L 48 54.5 A 1.4 1.4 0 0 1 48 57.3 L 48 58.0 L 47.4 58 A 1.4 1.4 0 0 1 44.6 58 L 44.0 58 L 43.4 58 A 1.4 1.4 0 0 1 40.6 58 L 40.0 58 L 39.4 58 A 1.4 1.4 0 0 1 36.6 58 L 36.0 58 L 35.4 58 A 1.4 1.4 0 0 1 32.6 58 L 32.0 58 L 31.4 58 A 1.4 1.4 0 0 1 28.6 58 L 28.0 58 L 27.4 58 A 1.4 1.4 0 0 1 24.6 58 L 24.0 58 L 23.4 58 A 1.4 1.4 0 0 1 20.6 58 L 20.0 58 L 19.4 58 A 1.4 1.4 0 0 1 16.6 58 L 16.0 58 L 15.4 58 A 1.4 1.4 0 0 1 12.6 58 L 12.0 58 L 11.4 58 A 1.4 1.4 0 0 1 8.6 58 L 8.0 58 L 7.4 58 A 1.4 1.4 0 0 1 4.6 58 L 4.0 58 L 3.4 58 A 1.4 1.4 0 0 1 0.6 58 L 0.0 58 L 0 57.3 A 1.4 1.4 0 0 1 0 54.5 L 0 53.9 L 0 53.2 A 1.4 1.4 0 0 1 0 50.4 L 0 49.7 L 0 49.0 A 1.4 1.4 0 0 1 0 46.2 L 0 45.6 L 0 44.9 A 1.4 1.4 0 0 1 0 42.1 L 0 41.4 L 0 40.8 A 1.4 1.4 0 0 1 0 38.0 L 0 37.3 L 0 36.6 A 1.4 1.4 0 0 1 0 33.8 L 0 33.1 L 0 32.5 A 1.4 1.4 0 0 1 0 29.7 L 0 29.0 L 0 28.3 A 1.4 1.4 0 0 1 0 25.5 L 0 24.9 L 0 24.2 A 1.4 1.4 0 0 1 0 21.4 L 0 20.7 L 0 20.0 A 1.4 1.4 0 0 1 0 17.2 L 0 16.6 L 0 15.9 A 1.4 1.4 0 0 1 0 13.1 L 0 12.4 L 0 11.8 A 1.4 1.4 0 0 1 0 9.0 L 0 8.3 L 0 7.6 A 1.4 1.4 0 0 1 0 4.8 L 0 4.1 L 0 3.5 A 1.4 1.4 0 0 1 0 0.7 L 0 0.0 Z";

// Washi Tape for Card
export const WashiTape = () => <div className="letter-card__washi-tape" aria-hidden="true" />;

// Skeuomorphic Red Pushpin (top-center tactile pin for pinned letters)
export const RedPushpin = React.memo(({ className = "" }) => (
  <svg
    className={`letter-card__red-pin ${className}`}
    viewBox="0 0 16 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Pinned letter"
    role="img"
  >
    <defs>
      <linearGradient id="ltc-pin-head" x1="3" y1="2" x2="13" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="35%" stopColor="#ef4444" />
        <stop offset="75%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="ltc-pin-waist" x1="4" y1="7" x2="12" y2="15" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#b91c1c" />
        <stop offset="30%" stopColor="#ef4444" />
        <stop offset="70%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id="ltc-pin-base" x1="3" y1="14" x2="13" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id="ltc-pin-needle" x1="7" y1="16" x2="9" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    {/* Ground shadow on paper where needle pierces */}
    <ellipse cx="8" cy="21" rx="2.5" ry="0.9" fill="rgba(40, 20, 10, 0.4)" />
    {/* Steel pin needle tip */}
    <path d="M 8 16 L 8 21" stroke="url(#ltc-pin-needle)" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M 7.8 16.5 L 7.8 20" stroke="#ffffff" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" />
    {/* Base collar flange */}
    <ellipse cx="8" cy="15.8" rx="5.6" ry="2.2" fill="#7f1d1d" />
    <ellipse cx="8" cy="15.3" rx="5.2" ry="1.9" fill="url(#ltc-pin-base)" />
    <ellipse cx="8" cy="15.0" rx="4.5" ry="1.4" fill="#f87171" opacity="0.6" />
    {/* Waisted pushpin body */}
    <path
      d="M 4.2 7.5 C 5.0 10.2, 4.8 12.5, 3.2 15.0 C 5.2 15.6, 10.8 15.6, 12.8 15.0 C 11.2 12.5, 11.0 10.2, 11.8 7.5 Z"
      fill="url(#ltc-pin-waist)"
    />
    {/* Vertical cylindrical highlight on body */}
    <path
      d="M 6.8 7.5 C 7.2 10.2, 7.1 12.5, 6.2 15.0 C 7.2 15.3, 8.8 15.3, 9.8 15.0 C 8.9 12.5, 8.8 10.2, 9.2 7.5 Z"
      fill="#fca5a5"
      opacity="0.55"
    />
    {/* Pushpin top head / bulb */}
    <ellipse cx="8" cy="7.2" rx="5.8" ry="3.6" fill="#7f1d1d" />
    <ellipse cx="8" cy="6.6" rx="5.6" ry="3.4" fill="url(#ltc-pin-head)" />
    <ellipse cx="7.6" cy="5.8" rx="4.8" ry="2.6" fill="#ef4444" />
    {/* Specular highlights on domed head */}
    <ellipse cx="6.5" cy="4.5" rx="2.8" ry="1.4" fill="#ffffff" opacity="0.75" />
    <circle cx="5.6" cy="4.0" r="0.7" fill="#ffffff" opacity="0.95" />
  </svg>
));

// =============================================================================
// STATIONERY PAPER AGING (Parchment for older letters, Ivory for fresh letters)
// Letters written 6 months (~180 days) or more ago naturally age into the warm
// darker parchment brown tone (#ede2cb), while newer letters stay crisp ivory (#faf7ec).
// =============================================================================
export const OLD_LETTER_AGE_DAYS = 180;

export const isOldLetter = (letterOrTimestamp, thresholdDays = OLD_LETTER_AGE_DAYS) => {
  if (!letterOrTimestamp) return false;
  const rawTime =
    typeof letterOrTimestamp === "object"
      ? letterOrTimestamp.timestamp ||
        letterOrTimestamp.created_at ||
        letterOrTimestamp.createdAt ||
        letterOrTimestamp.date
      : letterOrTimestamp;

  if (!rawTime) return false;
  const time = new Date(rawTime).getTime();
  if (!Number.isFinite(time)) return false;

  const ageMs = Date.now() - time;
  return ageMs >= thresholdDays * 24 * 60 * 60 * 1000;
};

export const getPaperClassForLetter = (letterOrTimestamp, thresholdDays = OLD_LETTER_AGE_DAYS) => {
  if (!letterOrTimestamp) return "letter-card--paper-ivory";

  // Older letters (>= 180 days) age into the darker warm parchment brown
  if (isOldLetter(letterOrTimestamp, thresholdDays)) {
    return "letter-card--paper-parchment";
  }

  // Fresh letters mix between Light Ivory and Medium Slight Brown (Cream)
  // using deterministic ID/timestamp hashing so the same letter always gets the same paper
  const idStr =
    typeof letterOrTimestamp === "object"
      ? String(
          letterOrTimestamp?._id ||
          letterOrTimestamp?.id ||
          letterOrTimestamp?.timestamp ||
          letterOrTimestamp?.created_at ||
          letterOrTimestamp?.createdAt ||
          ""
        )
      : String(letterOrTimestamp || "");

  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  return posHash % 2 === 0
    ? "letter-card--paper-cream"
    : "letter-card--paper-ivory";
};

// =============================================================================
// INNER STAMP ARTWORK RESOLUTION & AUTOMATIC DETECTION
// Priority: [city]_inner.webp -> [city]_inner.jpg -> [city]_inner.png -> [motif]_inner
// =============================================================================
export const PRESET_INNER_STAMPS = {
  "alabang": "/stamps/alabang_inner.webp",
  "alabang_town_center": "/stamps/alabang_inner.webp",
  "alaminos": "/stamps/alaminos_inner.webp",
  "alaminos_hundred_islands": "/stamps/alaminos_inner.webp",
  "angeles": "/stamps/angeles_inner.webp",
  "angeles_kuliat": "/stamps/angeles_inner.webp",
  "antipolo": "/stamps/antipolo_inner.webp",
  "antipolo_hinulugang_taktak": "/stamps/antipolo_inner.webp",
  "bacoor": "/stamps/bacoor_inner.webp",
  "bacoor_molino_dam": "/stamps/bacoor_inner.webp",
  "baguio": "/stamps/baguio_inner.webp",
  "baguio city": "/stamps/baguio_inner.webp",
  "baguio_city": "/stamps/baguio_inner.webp",
  "baguio_lion_head": "/stamps/baguio_inner.webp",
  "balanga": "/stamps/balanga_inner.webp",
  "balanga_cross": "/stamps/balanga_inner.webp",
  "baliwag": "/stamps/baliwag_inner.webp",
  "baliwag_buntal_hat": "/stamps/baliwag_inner.webp",
  "batac": "/stamps/batac_inner.webp",
  "batac_empanada": "/stamps/batac_inner.webp",
  "batangas": "/stamps/batangas_inner.webp",
  "batangas city": "/stamps/batangas_inner.webp",
  "batangas_balisong": "/stamps/batangas_inner.webp",
  "batangas_city": "/stamps/batangas_inner.webp",
  "binan": "/stamps/binan_inner.webp",
  "binan_alberto_mansion": "/stamps/binan_inner.webp",
  "cabanatuan": "/stamps/cabanatuan_inner.webp",
  "cabanatuan_carabao": "/stamps/cabanatuan_inner.webp",
  "cabanatuan_tricycle": "/stamps/cabanatuan_inner.webp",
  "cabuyao": "/stamps/cabuyao_inner.webp",
  "cabuyao_golden_bell": "/stamps/cabuyao_inner.webp",
  "calaca": "/stamps/calaca_inner.webp",
  "calaca_atchara": "/stamps/calaca_inner.webp",
  "calamba": "/stamps/calamba_inner.webp",
  "calamba_laguna_de_bay": "/stamps/calamba_inner.webp",
  "calamba_rizal_shrine": "/stamps/calamba_inner.webp",
  "calapan": "/stamps/calapan_inner.webp",
  "calapan_tamaraw": "/stamps/calapan_inner.webp",
  "caloocan": "/stamps/caloocan_inner.webp",
  "caloocan_bonifacio": "/stamps/caloocan_inner.webp",
  "candon": "/stamps/candon_inner.webp",
  "candon_tobacco": "/stamps/candon_inner.webp",
  "carmona": "/stamps/carmona_inner.webp",
  "carmona_racing": "/stamps/carmona_inner.webp",
  "carmona_vermosa": "/stamps/carmona_inner.webp",
  "cauayan": "/stamps/cauayan_inner.webp",
  "cauayan_mushroom": "/stamps/cauayan_inner.webp",
  "cavite": "/stamps/cavite_inner.webp",
  "cavite city": "/stamps/cavite_inner.webp",
  "cavite_city": "/stamps/cavite_inner.webp",
  "cavite_naval_spit": "/stamps/cavite_inner.webp",
  "dagupan": "/stamps/dagupan_inner.webp",
  "dagupan_bangus": "/stamps/dagupan_inner.webp",
  "dasmarinas": "/stamps/dasmarinas_inner.webp",
  "dasmarinas_kadiwa": "/stamps/dasmarinas_inner.webp",
  "davao": "/stamps/davao_inner.webp",
  "davao city": "/stamps/davao_inner.webp",
  "davao_city": "/stamps/davao_inner.webp",
  "davao_eagle": "/stamps/davao_inner.webp",
  "eagle": "/stamps/davao_inner.webp",
  "gapan": "/stamps/gapan_inner.webp",
  "gapan_footwear": "/stamps/gapan_inner.webp",
  "general trias": "/stamps/general_trias_inner.webp",
  "general_trias": "/stamps/general_trias_inner.webp",
  "gentrias": "/stamps/general_trias_inner.webp",
  "gentrias_tejeros": "/stamps/general_trias_inner.webp",
  "ilagan": "/stamps/ilagan_inner.webp",
  "ilagan_giant_butaka": "/stamps/ilagan_inner.webp",
  "laoag": "/stamps/laoag_inner.webp",
  "laoag_sinking_belfry": "/stamps/laoag_inner.webp",
  "las pinas": "/stamps/las_pinas_inner.webp",
  "las_pinas": "/stamps/las_pinas_inner.webp",
  "las_pinas_bamboo_organ": "/stamps/las_pinas_inner.webp",
  "legazpi": "/stamps/legazpi_inner.webp",
  "legazpi_mayon": "/stamps/legazpi_inner.webp",
  "ligao": "/stamps/ligao_inner.webp",
  "ligao_sunflower": "/stamps/ligao_inner.webp",
  "lipa": "/stamps/lipa_inner.webp",
  "lipa_coffee_beans": "/stamps/lipa_inner.webp",
  "lucena": "/stamps/lucena_inner.webp",
  "lucena_perez_park": "/stamps/lucena_inner.webp",
  "makati": "/stamps/makati_inner.webp",
  "makati_skyline": "/stamps/makati_inner.webp",
  "malabon": "/stamps/malabon_inner.webp",
  "malabon_tambobong": "/stamps/malabon_inner.webp",
  "malolos": "/stamps/malolos_inner.webp",
  "malolos_barasoain": "/stamps/malolos_inner.webp",
  "mandaluyong": "/stamps/mandaluyong_inner.webp",
  "mandaluyong_kabataan": "/stamps/mandaluyong_inner.webp",
  "mandaluyong_tiger": "/stamps/mandaluyong_inner.webp",
  "manila": "/stamps/manila_inner.webp",
  "manila_intramuros": "/stamps/manila_inner.webp",
  "marikina": "/stamps/marikina_inner.webp",
  "marikina_river_park": "/stamps/marikina_inner.webp",
  "marikina_shoe": "/stamps/marikina_inner.webp",
  "masbate": "/stamps/masbate_inner.webp",
  "masbate city": "/stamps/masbate_inner.webp",
  "masbate_city": "/stamps/masbate_inner.webp",
  "masbate_rodeo": "/stamps/masbate_inner.webp",
  "mayon": "/stamps/legazpi_inner.webp",
  "meycauayan": "/stamps/meycauayan_inner.webp",
  "meycauayan_jewelry": "/stamps/meycauayan_inner.webp",
  "munoz": "/stamps/munoz_inner.webp",
  "muntinlupa": "/stamps/muntinlupa_lake_inner.png",
  "muntinlupa_lake": "/stamps/muntinlupa_lake_inner.png",
  "muntinlupa_inner": "/stamps/muntinlupa_lake_inner.png",
  "naga": "/stamps/naga_inner.webp",
  "naga_penafrancia": "/stamps/naga_inner.webp",
  "naga_bicol": "/stamps/naga_bicol_inner.webp",
  "navotas": "/stamps/navotas_inner.webp",
  "navotas_fishing_trawler": "/stamps/navotas_inner.webp",
  "olongapo": "/stamps/olongapo_inner.webp",
  "olongapo_subic_bay": "/stamps/olongapo_inner.webp",
  "palayan": "/stamps/palayan_inner.webp",
  "palayan_capitol": "/stamps/palayan_inner.webp",
  "paranaque": "/stamps/paranaque_inner.webp",
  "paranaque_baclaran": "/stamps/paranaque_inner.webp",
  "paranaque_palayok": "/stamps/paranaque_inner.webp",
  "pasay": "/stamps/pasay_inner.webp",
  "pasay_manila_bay": "/stamps/pasay_inner.webp",
  "pasig": "/stamps/pasig_inner.webp",
  "pasig_mutya": "/stamps/pasig_inner.webp",
  "pasig_river": "/stamps/pasig_inner.webp",
  "pateros": "/stamps/pateros_inner.webp",
  "pateros_balut": "/stamps/pateros_inner.webp",
  "pines": "/stamps/baguio_inner.webp",
  "puerto princesa": "/stamps/puerto_princesa_inner.webp",
  "puerto_princesa": "/stamps/puerto_princesa_inner.webp",
  "puerto_princesa_subterranean": "/stamps/puerto_princesa_inner.webp",
  "qc": "/stamps/quezon_city_inner.webp",
  "qc_monument": "/stamps/quezon_city_inner.webp",
  "quezon": "/stamps/quezon_city_inner.webp",
  "quezon city": "/stamps/quezon_city_inner.webp",
  "quezon_city": "/stamps/quezon_city_inner.webp",
  "san carlos (pangasinan)": "/stamps/san_carlos_pangasinan_inner.webp",
  "san fernando (la union)": "/stamps/san_fernando_la_union_inner.webp",
  "san juan": "/stamps/san_juan_inner.webp",
  "san_carlos_mango_baskets": "/stamps/san_carlos_pangasinan_inner.webp",
  "san_carlos_pangasinan": "/stamps/san_carlos_pangasinan_inner.webp",
  "san_fernando": "/stamps/san_fernando_la_union_inner.webp",
  "san_fernando_la_union": "/stamps/san_fernando_la_union_inner.webp",
  "san_fernando_poro_point": "/stamps/san_fernando_la_union_inner.webp",
  "san_juan": "/stamps/san_juan_inner.webp",
  "san_juan_pinaglabanan": "/stamps/san_juan_inner.webp",
  "taguig": "/stamps/taguig_inner.webp",
  "taguig_highstreet": "/stamps/taguig_inner.webp",
  "valenzuela": "/stamps/valenzuela_inner.webp",
  "valenzuela_arkong_bato": "/stamps/valenzuela_inner.webp",
  "biñan": "/stamps/binan_inner.webp",
  "dasmariñas": "/stamps/dasmarinas_inner.webp",
  "muñoz": "/stamps/munoz_inner.webp",
  "parañaque": "/stamps/paranaque_inner.webp",
  "san fernando (pampanga)": "/stamps/san_fernando_pampanga_inner.webp",
  "san_fernando_pampanga": "/stamps/san_fernando_pampanga_inner.webp",
  "pampanga_parol": "/stamps/san_fernando_pampanga_inner.webp",
  "san jose (nueva ecija)": "/stamps/san_jose_nueva_ecija_inner.webp",
  "san_jose_nueva_ecija": "/stamps/san_jose_nueva_ecija_inner.webp",
  "san_jose_onion": "/stamps/san_jose_nueva_ecija_inner.webp",
  "san pedro": "/stamps/san_pedro_inner.webp",
  "san_pedro": "/stamps/san_pedro_inner.webp",
  "san_pedro_sampaguita": "/stamps/san_pedro_inner.webp",
  "santa rosa": "/stamps/santa_rosa_inner.webp",
  "santa_rosa": "/stamps/santa_rosa_inner.webp",
  "santa_rosa_lion": "/stamps/santa_rosa_inner.webp",
  "santiago": "/stamps/santiago_inner.webp",
  "santiago_corn": "/stamps/santiago_inner.webp",
  "santo tomas": "/stamps/santo_tomas_inner.webp",
  "santo_tomas": "/stamps/santo_tomas_inner.webp",
  "santo_tomas_malvar": "/stamps/santo_tomas_inner.webp",
  "sorsogon": "/stamps/sorsogon_inner.webp",
  "sorsogon city": "/stamps/sorsogon_inner.webp",
  "sorsogon_city": "/stamps/sorsogon_inner.webp",
  "sorsogon_bulusan": "/stamps/sorsogon_inner.webp",
  "tabaco": "/stamps/tabaco_inner.webp",
  "tabaco_cutlery": "/stamps/tabaco_inner.webp",
  "tabuk": "/stamps/tabuk_inner.webp",
  "tabuk_chico_river": "/stamps/tabuk_inner.webp",
  "tagaytay": "/stamps/tagaytay_inner.webp",
  "tagaytay_taal_ridge": "/stamps/tagaytay_inner.webp",
  "tanauan": "/stamps/tanauan_inner.webp",
  "tanauan_mabini": "/stamps/tanauan_inner.webp",
  "tarlac": "/stamps/tarlac_inner.webp",
  "tarlac city": "/stamps/tarlac_inner.webp",
  "tarlac_city": "/stamps/tarlac_inner.webp",
  "tarlac_sugarcane": "/stamps/tarlac_inner.webp",
  "tayabas": "/stamps/tayabas_inner.webp",
  "tayabas_malagonlong_bridge": "/stamps/tayabas_inner.webp",
  "trece martires": "/stamps/trece_martires_inner.webp",
  "trece_martires": "/stamps/trece_martires_inner.webp",
  "trece_martires_monument": "/stamps/trece_martires_inner.webp",
  "tuguegarao": "/stamps/tuguegarao_inner.webp",
  "tuguegarao_callao_cave": "/stamps/tuguegarao_inner.webp",
  "urdaneta": "/stamps/urdaneta_inner.webp",
  "urdaneta_city": "/stamps/urdaneta_inner.webp",
  "vigan": "/stamps/vigan_inner.webp",
  "vigan_city": "/stamps/vigan_inner.webp",
  "crisologo": "/stamps/vigan_inner.webp",
"urdaneta_cattle_market": "/stamps/urdaneta_inner.webp",
  "roxas city": "/stamps/roxas_inner.webp",
  "roxas_city": "/stamps/roxas_inner.webp",
  "roxas": "/stamps/roxas_inner.webp",
  "roxas_diwal_seafood": "/stamps/roxas_inner.webp",
  "iloilo city": "/stamps/iloilo_inner.webp",
  "iloilo_city": "/stamps/iloilo_inner.webp",
  "iloilo": "/stamps/iloilo_inner.webp",
  "iloilo_dinagyang": "/stamps/iloilo_inner.webp",
  "passi": "/stamps/passi_inner.webp",
  "passi_sweet_pineapple": "/stamps/passi_inner.webp",
  "bacolod": "/stamps/bacolod_inner.webp",
  "bacolod_masskara": "/stamps/bacolod_inner.webp",
  "bago": "/stamps/bago_inner.webp",
  "bago_araneta_sugar": "/stamps/bago_inner.webp",
  "cadiz": "/stamps/cadiz_inner.webp",
  "cadiz_dinagsa_whales": "/stamps/cadiz_inner.webp",
  "escalante": "/stamps/escalante_inner.webp",
  "escalante_manquiquile": "/stamps/escalante_inner.webp",
  "himamaylan": "/stamps/himamaylan_inner.webp",
  "himamaylan_oysters": "/stamps/himamaylan_inner.webp",
  "kabankalan": "/stamps/kabankalan_inner.webp",
  "kabankalan_magaso_falls": "/stamps/kabankalan_inner.webp",
  "la carlota": "/stamps/la_carlota_inner.webp",
  "la_carlota": "/stamps/la_carlota_inner.webp",
  "la_carlota_iron_dinosaur": "/stamps/la_carlota_inner.webp",
  "sagay": "/stamps/sagay_inner.webp",
  "sagay_carbin_reef": "/stamps/sagay_inner.webp",
  "san carlos (negros occidental)": "/stamps/san_carlos_negros_occidental_inner.webp",
  "san_carlos_negros_occidental": "/stamps/san_carlos_negros_occidental_inner.webp",
  "san_carlos_pintaflores": "/stamps/san_carlos_negros_occidental_inner.webp",
  "silay": "/stamps/silay_inner.webp",
  "silay_balay_negrense": "/stamps/silay_inner.webp",
  "sipalay": "/stamps/sipalay_inner.webp",
  "sipalay_tinagong_dagat": "/stamps/sipalay_inner.webp",
  "talisay (negros occidental)": "/stamps/talisay_negros_occidental_inner.webp",
  "talisay_negros_occidental": "/stamps/talisay_negros_occidental_inner.webp",
  "talisay_the_ruins": "/stamps/talisay_negros_occidental_inner.webp",
  "victorias": "/stamps/victorias_inner.webp",
  "victorias_sugar_refinery": "/stamps/victorias_inner.webp",
  "bogo": "/stamps/bogo_inner.webp",
  "bogo_san_vicente": "/stamps/bogo_inner.webp",
  "carcar": "/stamps/carcar_inner.webp",
  "carcar_chicharon_shoe": "/stamps/carcar_inner.webp",
  "cebu city": "/stamps/cebu_inner.webp",
  "cebu_city": "/stamps/cebu_inner.webp",
  "cebu": "/stamps/cebu_inner.webp",
  "magellan_cross": "/stamps/cebu_inner.webp",
  "danao": "/stamps/danao_inner.webp",
  "danao_karansa_pottery": "/stamps/danao_inner.webp",
  "lapu-lapu": "/stamps/lapu_lapu_inner.webp",
  "lapu_lapu": "/stamps/lapu_lapu_inner.webp",
  "lapu_lapu_guitar": "/stamps/lapu_lapu_inner.webp",
  "mandaue": "/stamps/mandaue_inner.webp",
  "mandaue_furniture": "/stamps/mandaue_inner.webp",
  "naga (cebu)": "/stamps/naga_cebu_inner.webp",
  "naga_cebu": "/stamps/naga_cebu_inner.webp",
  "naga_cebu_boardwalk": "/stamps/naga_cebu_inner.webp",
  "talisay (cebu)": "/stamps/talisay_cebu_inner.webp",
  "talisay_cebu": "/stamps/talisay_cebu_inner.webp",
  "talisay_lechon": "/stamps/talisay_cebu_inner.webp",
  "toledo": "/stamps/toledo_inner.webp",
  "toledo_copper_mine": "/stamps/toledo_inner.webp",
  "bais": "/stamps/bais_inner.webp",
  "bais_dolphins": "/stamps/bais_inner.webp",
  "bayawan": "/stamps/bayawan_inner.webp",
  "bayawan_tawo_tawo": "/stamps/bayawan_inner.webp",
  "canlaon": "/stamps/canlaon_inner.webp",
  "canlaon_volcano": "/stamps/canlaon_inner.webp",
  "dumaguete": "/stamps/dumaguete_inner.webp",
  "dumaguete_campanario": "/stamps/dumaguete_inner.webp",
  "guihulngan": "/stamps/guihulngan_inner.webp",
  "guihulngan_kanhulalo": "/stamps/guihulngan_inner.webp",
  "tanjay": "/stamps/tanjay_inner.webp",
  "tanjay_saulog": "/stamps/tanjay_inner.webp",
  "borongan": "/stamps/borongan_inner.webp",
  "borongan_pacific_surf": "/stamps/borongan_inner.webp",
  "baybay": "/stamps/baybay_inner.webp",
  "baybay_mount_pangasugan": "/stamps/baybay_inner.webp",
  "ormoc": "/stamps/ormoc_inner.webp",
  "ormoc_queen_pineapple": "/stamps/ormoc_inner.webp",
  "tacloban": "/stamps/tacloban_inner.webp",
  "tacloban_san_juanico": "/stamps/tacloban_inner.webp",
  "calbayog": "/stamps/calbayog_inner.webp",
  "calbayog_tarangban_falls": "/stamps/calbayog_inner.webp",
  "catbalogan": "/stamps/catbalogan_inner.webp",
  "catbalogan_maqueda_bay": "/stamps/catbalogan_inner.webp",
  "maasin": "/stamps/maasin_inner.webp",
  "maasin_sacred_heart": "/stamps/maasin_inner.webp",
  "isabela": "/stamps/isabela_inner.webp",
  "isabela_malamawi_beach": "/stamps/isabela_inner.webp",
  "dapitan": "/stamps/dapitan_inner.webp",
  "dapitan_rizal_shrine": "/stamps/dapitan_inner.webp",
  "dipolog": "/stamps/dipolog_inner.webp",
  "dipolog_sardines": "/stamps/dipolog_inner.webp",
  "pagadian": "/stamps/pagadian_inner.webp",
  "pagadian_sloping_tricycle": "/stamps/pagadian_inner.webp",
  "zamboanga city": "/stamps/zamboanga_inner.webp",
  "zamboanga_city": "/stamps/zamboanga_inner.webp",
  "zamboanga": "/stamps/zamboanga_inner.webp",
  "zamboanga_vinta_fort_pilar": "/stamps/zamboanga_inner.webp",
  "malaybalay": "/stamps/malaybalay_inner.webp",
  "malaybalay_kaamulan": "/stamps/malaybalay_inner.webp",
  "valencia": "/stamps/valencia_inner.webp",
  "valencia_pulangi_dam": "/stamps/valencia_inner.webp",
  "oroquieta": "/stamps/oroquieta_inner.webp",
  "oroquieta_mobod_marine": "/stamps/oroquieta_inner.webp",
  "ozamiz": "/stamps/ozamiz_inner.webp",
  "ozamiz_fuerte_triunfo": "/stamps/ozamiz_inner.webp",
  "tangub": "/stamps/tangub_inner.webp",
  "tangub_christmas_symbols": "/stamps/tangub_inner.webp",
  "cagayan de oro": "/stamps/cagayan_de_oro_inner.webp",
  "cagayan_de_oro": "/stamps/cagayan_de_oro_inner.webp",
  "cdo_whitewater_rafting": "/stamps/cagayan_de_oro_inner.webp",
  "el salvador": "/stamps/el_salvador_inner.webp",
  "el_salvador": "/stamps/el_salvador_inner.webp",
  "el_salvador_divine_mercy": "/stamps/el_salvador_inner.webp",
  "gingoog": "/stamps/gingoog_inner.webp",
  "gingoog_tiklas_falls": "/stamps/gingoog_inner.webp",
  "iligan": "/stamps/iligan_inner.webp",
  "iligan_maria_cristina": "/stamps/iligan_inner.webp",
  "panabo": "/stamps/panabo_inner.webp",
  "panabo_banana_capital": "/stamps/panabo_inner.webp",
  "samal": "/stamps/samal_inner.webp",
  "samal_monfort_bats": "/stamps/samal_inner.webp",
  "tagum": "/stamps/tagum_inner.webp",
  "tagum_palm_city": "/stamps/tagum_inner.webp",
  "digos": "/stamps/digos_inner.webp",
  "digos_mount_apo_trail": "/stamps/digos_inner.webp",
  "mati": "/stamps/mati_inner.webp",
  "mati_sleeping_dinosaur": "/stamps/mati_inner.webp",
  "general santos": "/stamps/general_santos_inner.webp",
  "general_santos": "/stamps/general_santos_inner.webp",
  "tuna": "/stamps/general_santos_inner.webp",
  "kidapawan": "/stamps/kidapawan_inner.webp",
  "kidapawan_highland_fruits": "/stamps/kidapawan_inner.webp",
  "koronadal": "/stamps/koronadal_inner.webp",
  "koronadal_tnalak": "/stamps/koronadal_inner.webp",
  "tacurong": "/stamps/tacurong_inner.webp",
  "tacurong_baras_birds": "/stamps/tacurong_inner.webp",
  "butuan": "/stamps/butuan_inner.webp",
  "butuan_balangay": "/stamps/butuan_inner.webp",
  "cabadbaran": "/stamps/cabadbaran_inner.webp",
  "cabadbaran_hilong_hilong": "/stamps/cabadbaran_inner.webp",
  "bayugan": "/stamps/bayugan_inner.webp",
  "bayugan_kahimunan_timber": "/stamps/bayugan_inner.webp",
  "surigao city": "/stamps/surigao_city_inner.webp",
  "surigao_city": "/stamps/surigao_city_inner.webp",
  "surigao": "/stamps/surigao_city_inner.webp",
  "surigao_mabua_pebbles": "/stamps/surigao_city_inner.webp",
  "bislig": "/stamps/bislig_inner.webp",
  "bislig_tinuy_an_falls": "/stamps/bislig_inner.webp",
  "tandag": "/stamps/tandag_inner.webp",
  "tandag_linungao_island": "/stamps/tandag_inner.webp",
  "bunawan": "/stamps/bunawan_inner.webp",
  "bunawan_lolong_crocodile": "/stamps/bunawan_inner.webp",
  "cotabato city": "/stamps/cotabato_inner.webp",
  "cotabato_city": "/stamps/cotabato_inner.webp",
  "cotabato": "/stamps/cotabato_inner.webp",
  "cotabato_grand_mosque": "/stamps/cotabato_inner.webp",
  "marawi": "/stamps/marawi_inner.webp",
  "marawi_torogan_sarimanok": "/stamps/marawi_inner.webp",
  "lamitan": "/stamps/lamitan_inner.webp",
  "lamitan_yakan_tennun": "/stamps/lamitan_inner.webp",
  "luzon": "/stamps/luzon.webp",
  "ph_luzon_map": "/stamps/luzon.webp",
  "visayas": "/stamps/visayas.webp",
  "ph_visayas_map": "/stamps/visayas.webp",
  "mindanao": "/stamps/mindanao.webp",
  "ph_mindanao_map": "/stamps/mindanao.webp",
  "ozamis": "/stamps/ozamiz_inner.webp",
  "ozamis_city": "/stamps/ozamiz_inner.webp",
  "ozamiz_city": "/stamps/ozamiz_inner.webp",
  "island_garden_city_of_samal": "/stamps/samal_inner.webp",
  "samal_city": "/stamps/samal_inner.webp",
  "science_city_of_munoz": "/stamps/munoz_inner.webp",
  // Newly illustrated Philippine cities (Luzon & Visayas completions)
  "san jose del monte": "/stamps/san_jose_del_monte_inner.webp",
  "san_jose_del_monte": "/stamps/san_jose_del_monte_inner.webp",
  "sjdm": "/stamps/san_jose_del_monte_inner.webp",
  "sjdm_balagbag": "/stamps/san_jose_del_monte_inner.webp",
  "mabalacat": "/stamps/mabalacat_inner.webp",
  "mabalacat_city": "/stamps/mabalacat_inner.webp",
  "mabalacat_aeta_heritage": "/stamps/mabalacat_inner.webp",
  "imus": "/stamps/imus_inner.webp",
  "imus_city": "/stamps/imus_inner.webp",
  "imus_battle_of_alapan": "/stamps/imus_inner.webp",
  "san pablo": "/stamps/san_pablo_inner.webp",
  "san_pablo": "/stamps/san_pablo_inner.webp",
  "san_pablo_city": "/stamps/san_pablo_inner.webp",
  "san_pablo_sampaloc_lake": "/stamps/san_pablo_inner.webp",
  "iriga": "/stamps/iriga_inner.webp",
  "iriga_city": "/stamps/iriga_inner.webp",
  "iriga_mount_asog": "/stamps/iriga_inner.webp",
  "tagbilaran": "/stamps/tagbilaran_inner.webp",
  "tagbilaran_city": "/stamps/tagbilaran_inner.webp",
  "tagbilaran_sandugo": "/stamps/tagbilaran_inner.webp",
  // International cities with illustrated stamps
  "jakarta": "/stamps/jakarta_indonesia.webp",
  "jakarta_indonesia": "/stamps/jakarta_indonesia.webp",
  "jakarta_monas": "/stamps/jakarta_indonesia.webp",
  "bandung": "/stamps/bandung_indonesia.webp",
  "bandung_indonesia": "/stamps/bandung_indonesia.webp",
  "bandung_gedung_sate": "/stamps/bandung_indonesia.webp",
  "singapore": "/stamps/singapore.webp",
  "singapore_merlion": "/stamps/singapore.webp",
  "kuching": "/stamps/kuching_malaysia.webp",
  "kuching_malaysia": "/stamps/kuching_malaysia.webp",
  "kuching_cat_monument": "/stamps/kuching_malaysia.webp",
  "palembang": "/stamps/palembang_indonesia.webp",
  "palembang_indonesia": "/stamps/palembang_indonesia.webp",
  "palembang_ampera_bridge": "/stamps/palembang_indonesia.webp",
  "purwokerto": "/stamps/purwokerto_indonesia.webp",
  "purwokerto_indonesia": "/stamps/purwokerto_indonesia.webp",
  "purwokerto_slamet_waterfall": "/stamps/purwokerto_indonesia.webp",
  "semarang": "/stamps/semarang_indonesia.webp",
  "semarang_indonesia": "/stamps/semarang_indonesia.webp",
  "semarang_lawang_sewu": "/stamps/semarang_indonesia.webp",
  "surabaya": "/stamps/surabaya_indonesia.webp",
  "surabaya_indonesia": "/stamps/surabaya_indonesia.webp",
  "surabaya_shark_crocodile": "/stamps/surabaya_indonesia.webp",
  "toronto": "/stamps/toronto_canada.webp",
  "toronto_canada": "/stamps/toronto_canada.webp",
  "toronto_cn_tower": "/stamps/toronto_canada.webp",
  // Dedicated Country Fallback Stamps
  "indonesia": "/stamps/indonesia.webp",
  "indonesia_national": "/stamps/indonesia.webp",
  "usa": "/stamps/usa.webp",
  "usa_national": "/stamps/usa.webp",
  "united_states": "/stamps/usa.webp",
  "canada": "/stamps/canada.webp",
  "canada_national": "/stamps/canada.webp",
  "united_arab_emirates": "/stamps/united_arab_emirates.webp",
  "uae": "/stamps/united_arab_emirates.webp",
  "uae_national": "/stamps/united_arab_emirates.webp",
  "singapore_national": "/stamps/singapore.webp",
  "malaysia": "/stamps/malaysia.webp",
  "malaysia_national": "/stamps/malaysia.webp",
  "new_zealand": "/stamps/new_zealand.webp",
  "new_zealand_national": "/stamps/new_zealand.webp",
};

export const getCityStampCandidateUrls = (cityData) => {
  if (!cityData) return [];
  const publicUrl = process.env.PUBLIC_URL || "";
  const names = new Set();

  const rawSlug = (cityData.canonicalName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (rawSlug) {
    names.add(rawSlug);
    if (rawSlug.endsWith("_city")) {
      names.add(rawSlug.replace(/_city$/, ""));
    }
  }

  if (cityData.displayName) {
    const displaySlug = cityData.displayName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (displaySlug) {
      names.add(displaySlug);
      if (displaySlug.endsWith("_city")) {
        names.add(displaySlug.replace(/_city$/, ""));
      }
    }
  }

  if (rawSlug === "san_jose_del_monte") {
    names.add("sjdm");
    names.add("san_jose_del_monte");
  }
  if (rawSlug === "jakarta") {
    names.add("jakarta_indonesia");
  }
  if (rawSlug === "bandung") {
    names.add("bandung_indonesia");
  }
  if (rawSlug === "kuching") {
    names.add("kuching_malaysia");
  }
  if (rawSlug === "palembang") {
    names.add("palembang_indonesia");
  }
  if (rawSlug === "purwokerto") {
    names.add("purwokerto_indonesia");
  }
  if (rawSlug === "semarang") {
    names.add("semarang_indonesia");
  }
  if (rawSlug === "surabaya") {
    names.add("surabaya_indonesia");
  }
  if (rawSlug === "toronto") {
    names.add("toronto_canada");
  }
  if (rawSlug === "general_trias") names.add("gentrias");
  if (rawSlug === "quezon_city") names.add("qc");
  if (rawSlug === "davao_city") names.add("davao");
  if (rawSlug === "zamboanga_city") names.add("zamboanga");
  if (rawSlug === "cebu_city") names.add("cebu");
  if (rawSlug === "iloilo_city") names.add("iloilo");
  if (rawSlug === "roxas_city") names.add("roxas");
  if (rawSlug === "cotabato_city") names.add("cotabato");
  if (rawSlug === "surigao_city" || rawSlug === "surigao") {
    names.add("surigao_city");
    names.add("surigao");
  }
  if (rawSlug === "ozamiz" || rawSlug === "ozamis" || rawSlug === "ozamiz_city" || rawSlug === "ozamis_city") {
    names.add("ozamiz");
    names.add("ozamis");
  }
  if (rawSlug.includes("samal")) {
    names.add("samal");
    names.add("island_garden_city_of_samal");
  }
  if (rawSlug.includes("naga")) {
    if (rawSlug.includes("cebu")) {
      names.add("naga_cebu");
    } else {
      names.add("naga_bicol");
      names.add("naga");
    }
  }
  if (rawSlug.includes("talisay")) {
    if (rawSlug.includes("cebu")) {
      names.add("talisay_cebu");
    } else {
      names.add("talisay_negros_occidental");
    }
  }
  if (rawSlug.includes("san_carlos")) {
    if (rawSlug.includes("negros")) {
      names.add("san_carlos_negros_occidental");
    } else {
      names.add("san_carlos_pangasinan");
    }
  }
  if (rawSlug === "muntinlupa") names.add("alabang");
  if (rawSlug === "alabang") names.add("muntinlupa");
  if (rawSlug === "carmona") names.add("carmona_vermosa");
  if (rawSlug === "calamba") names.add("calamba_laguna_de_bay");
  if (rawSlug.includes("san_fernando")) {
    names.add("san_fernando_la_union");
    names.add("san_fernando_poro_point");
    names.add("san_fernando_pampanga");
    names.add("san_fernando");
  }

  if (cityData.motif) {
    names.add(cityData.motif);
  }

  const urls = [];
  names.forEach((name) => {
    urls.push(`${publicUrl}/stamps/${name}_inner.webp`);
    urls.push(`${publicUrl}/stamps/${name}-inner.webp`);
    urls.push(`${publicUrl}/stamps/${name}.webp`);
    urls.push(`${publicUrl}/stamps/${name}_inner.jpg`);
    urls.push(`${publicUrl}/stamps/${name}-inner.jpg`);
    urls.push(`${publicUrl}/stamps/${name}.jpg`);
    urls.push(`${publicUrl}/stamps/${name}_inner.png`);
    urls.push(`${publicUrl}/stamps/${name}-inner.png`);
    urls.push(`${publicUrl}/stamps/${name}.png`);
  });

  return urls;
};

export const resolveCityStampUrl = (cityData) => {
  if (!cityData) return null;
  const publicUrl = process.env.PUBLIC_URL || "";
  const names = [];

  const rawSlug = (cityData.canonicalName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (rawSlug) {
    names.push(rawSlug);
    if (rawSlug.endsWith("_city")) {
      names.push(rawSlug.replace(/_city$/, ""));
    }
  }

  if (cityData.displayName) {
    const displaySlug = cityData.displayName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (displaySlug) {
      names.push(displaySlug);
      if (displaySlug.endsWith("_city")) {
        names.push(displaySlug.replace(/_city$/, ""));
      }
    }
  }

  if (rawSlug === "san_jose_del_monte") {
    names.push("sjdm", "san_jose_del_monte");
  }
  if (rawSlug === "jakarta") names.push("jakarta_indonesia");
  if (rawSlug === "bandung") names.push("bandung_indonesia");
  if (rawSlug === "kuching") names.push("kuching_malaysia");
  if (rawSlug === "palembang") names.push("palembang_indonesia");
  if (rawSlug === "purwokerto") names.push("purwokerto_indonesia");
  if (rawSlug === "semarang") names.push("semarang_indonesia");
  if (rawSlug === "surabaya") names.push("surabaya_indonesia");
  if (rawSlug === "toronto") names.push("toronto_canada");
  if (rawSlug === "general_trias") names.push("gentrias");
  if (rawSlug === "quezon_city") names.push("qc");
  if (rawSlug === "davao_city") names.push("davao");
  if (rawSlug === "zamboanga_city") names.push("zamboanga");
  if (rawSlug === "cebu_city") names.push("cebu");
  if (rawSlug === "iloilo_city") names.push("iloilo");
  if (rawSlug === "roxas_city") names.push("roxas");
  if (rawSlug === "cotabato_city") names.push("cotabato");
  if (rawSlug === "muntinlupa") names.push("muntinlupa_inner");
  if (cityData.motif) names.push(cityData.motif);

  for (const name of names) {
    if (PRESET_INNER_STAMPS[name]) {
      return `${publicUrl}${PRESET_INNER_STAMPS[name]}`;
    }
  }

  return null;
};

export const CityStampArt = React.memo(({ cityData, fallback }) => {
  const resolvedUrl = useMemo(() => resolveCityStampUrl(cityData), [cityData]);

  if (resolvedUrl) {
    return (
      <image
        href={resolvedUrl}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
        decoding="async"
      />
    );
  }

  return fallback ? fallback() : null;
});

// =============================================================================
// PHILATELIC MOTIFS REGISTRY (Vibrant Pop-Art Retro Travel Poster Style)
// =============================================================================
const PHILATELIC_MOTIFS = {
  "alaminos_hundred_islands": { bg: "#f0fdf4" },
  "angeles_kuliat": { bg: "#fef2f2" },
  "antipolo_cathedral_falls": { bg: "#f0fdf4" },
  "bacolod_masskara": { bg: "#fff1f2" },
  "bacoor_mussels_battle": { bg: "#fdf0d5" },
  "bago_araneta_sugar": { bg: "#f0fdf4" },
  "bago_kanlaon_sugar": { bg: "#fefae0" },
  "baguio_lion_head": { bg: "#fdf0d5" },
  "bais_dolphins": { bg: "#f0f9ff" },
  "balanga_cross": { bg: "#f0f9ff" },
  "balanga_mount_samat": { bg: "#f1faee" },
  "baliwag_buntal_hat": { bg: "#fefce8" },
  "bandung_gedung_sate": { bg: "#fdf0d5" },
  "batac_empanada": { bg: "#fff7ed" },
  "batac_empanda_tobacco": { bg: "#fdf0d5" },
  "batangas_balisong": { bg: "#fefce8" },
  "batangas_port_batel": { bg: "#e0e1dd" },
  "bayawan_tawo_tawo": { bg: "#fef2f2" },
  "baybay_mount_pangasugan": { bg: "#fdf2f8" },
  "bayugan_kahimunan_timber": { bg: "#f0fdf4" },
  "binan_alberto_mansion": { bg: "#fefce8" },
  "binan_puto_rizal": { bg: "#f7ede2" },
  "bislig_tinuy_an_falls": { bg: "#f0fdf4" },
  "bogo_san_vicente": { bg: "#f0f9ff" },
  "borongan_pacific_surf": { bg: "#f0f9ff" },
  "bunawan_lolong_crocodile": { bg: "#f0fdf4" },
  "butuan_balangay": { bg: "#fefce8" },
  "cabadbaran_hilong_hilong": { bg: "#fefce8" },
  "cabuyao_enterprise": { bg: "#f1faee" },
  "cabuyao_golden_bell": { bg: "#fefce8" },
  "cadiz_dinagsa_whales": { bg: "#f0f9ff" },
  "calaca_atchara": { bg: "#fefce8" },
  "calaca_energy": { bg: "#f4f1de" },
  "calamba_rizal_shrine": { bg: "#fef7ee" },
  "calapan_halcon": { bg: "#e0f2fe" },
  "calbayog_tarangban_falls": { bg: "#f0fdfa" },
  "candon_tobacco": { bg: "#fffbeb" },
  "canlaon_volcano": { bg: "#fefce8" },
  "carcar_chicharon_shoe": { bg: "#fff7ed" },
  "carmona_racing": { bg: "#f0fdfa" },
  "catbalogan_maqueda_bay": { bg: "#fef2f2" },
  "cauayan_corn": { bg: "#fefae0" },
  "cauayan_mushroom": { bg: "#f0fdf4" },
  "cavite_fort_san_felipe": { bg: "#fdf0d5" },
  "cavite_naval_spit": { bg: "#fafaf9" },
  "cdo_whitewater_rafting": { bg: "#f0f9ff" },
  "cotabato_grand_mosque": { bg: "#f0fdf4" },
  "crisologo": { bg: "#fdfcf7" },
  "dagupan_bangus": { bg: "#f0f9ff" },
  "danao_karansa_pottery": { bg: "#fff7ed" },
  "dapitan_rizal_shrine": { bg: "#fefce8" },
  "dasmarinas_kadiwa": { bg: "#fff7ed" },
  "dasmarinas_university": { bg: "#fefae0" },
  "digos_mount_apo_trail": { bg: "#fefce8" },
  "dipolog_sardines": { bg: "#f0f9ff" },
  "dumaguete_campanario": { bg: "#eff6ff" },
  "el_salvador_divine_mercy": { bg: "#fefce8" },
  "escalante_manquiquile": { bg: "#f0fdf4" },
  "gapan_footwear": { bg: "#fdf2f8" },
  "gapan_slippers": { bg: "#fefae0" },
  "gen_trias_tejeros": { bg: "#fdf0d5" },
  "gentrias_tejeros": { bg: "#f8fafc" },
  "gingoog_tiklas_falls": { bg: "#fefce8" },
  "indonesia_national": {
    frame: "#eab308",
    bg: "#fefae0",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/indonesia.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "usa_national": {
    frame: "#eab308",
    bg: "#eff6ff",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/usa.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "canada_national": {
    frame: "#eab308",
    bg: "#fef2f2",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/canada.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "uae_national": {
    frame: "#eab308",
    bg: "#f0fdf4",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/united_arab_emirates.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "singapore_national": {
    frame: "#eab308",
    bg: "#fef2f2",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/singapore.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "malaysia_national": {
    frame: "#eab308",
    bg: "#eff6ff",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/malaysia.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "new_zealand_national": {
    frame: "#eab308",
    bg: "#f8fafc",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/new_zealand.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "global_international": {
    frame: "#eab308",
    bg: "#f8fafc",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* World Globe Graticule Sphere */}
      <circle cx="24" cy="29" r="14" fill="#e0f2fe" stroke="#1e293b" strokeWidth="1" />
      {/* Longitude and Latitude Meridian Curves */}
      <ellipse cx="24" cy="29" rx="7" ry="14" fill="none" stroke="#60a5fa" strokeWidth="0.6" opacity="0.65" />
      <line x1="10" y1="29" x2="38" y2="29" stroke="#60a5fa" strokeWidth="0.6" opacity="0.65" />
      <line x1="12" y1="22" x2="36" y2="22" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="1.5 1" opacity="0.6" />
      <line x1="12" y1="36" x2="36" y2="36" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="1.5 1" opacity="0.6" />
      {/* Stylized Continents: Americas on left, Europe/Africa/Asia on right */}
      <path d="M 13 24 Q 17 22 18 26 Q 20 32 17 35 Q 14 33 13 28 Z" fill="#22c55e" opacity="0.8" />
      <path d="M 24 19 Q 29 18 31 22 Q 33 28 29 34 Q 25 32 23 26 Z" fill="#22c55e" opacity="0.8" />
      {/* Transcontinental Airmail Orbital Flight Arc */}
      <path d="M 8 38 Q 20 12 40 18" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 1" />
      {/* Supersonic Jet Flight Silhouette */}
      <polygon points="39,18 35,16 36,18.5 33,19.5 39,21" fill="#1e293b" />
      {/* 4-Point Golden Navigation Star in corner */}
      <polygon points="24,9 25.5,12 28,13.5 25.5,15 24,18 22.5,15 20,13.5 22.5,12" fill="#eab308" />
      </g>
    ),
  },
  "guihulngan_kanhulalo": { bg: "#f0fdf4" },
  "himamaylan_oysters": { bg: "#fefce8" },
  "ilagan_giant_butaka": { bg: "#fefce8" },
  "ilagan_giant_chair": { bg: "#d8f3dc" },
  "iligan_maria_cristina": { bg: "#f0f9ff" },
  "iloilo_dinagyang": { bg: "#fffdfa" },
  "iloilo_molo": { bg: "#fffdfa" },
  "imus_battle_of_alapan": { bg: "#f0fdf4" },
  "imus_flag_capital": { bg: "#fdf0d5" },
  "iriga_buhi_sinarapan": { bg: "#f0fdf4" },
  "iriga_mount_asog": { bg: "#fefce8" },
  "isabela_malamawi_beach": { bg: "#fff7ed" },
  "jakarta_monas": { bg: "#fefae0" },
  "kabankalan_magaso_falls": { bg: "#f0fdf4" },
  "kidapawan_highland_fruits": { bg: "#f0fdf4" },
  "koronadal_tnalak": { bg: "#fef3c7" },
  "kuching_cat_monument": { bg: "#fdf2f8" },
  "la_carlota_iron_dinosaur": { bg: "#f0fdf4" },
  "la_union_surf": { bg: "#caf0f8" },
  "lamitan_yakan_tennun": { bg: "#1e1b4b" },
  "laoag_sinking_belfry": { bg: "#fffbeb" },
  "laoag_sinking_tower": { bg: "#fefae0" },
  "lapu_lapu_guitar": { bg: "#fefce8" },
  "las_pinas_bamboo_organ": { bg: "#fefdfa" },
  "ligao_kawakawa": { bg: "#fefae0" },
  "ligao_sunflower": { bg: "#fcfbf7" },
  "lipa_coffee": { bg: "#fff8e1" },
  "lipa_coffee_beans": { bg: "#fefce8" },
  "lucena_pahiyas": { bg: "#fefae0" },
  "lucena_perez_park": { bg: "#fffbeb" },
  "maasin_sacred_heart": { bg: "#fef7ee" },
  "mabalacat_aeta_heritage": { bg: "#fefaf6" },
  "mabalacat_clark": { bg: "#e0f2fe" },
  "magellan_cross": { bg: "#fef2f2" },
  "makati_skyline": { bg: "#f8fafc" },
  "malabon_tambobong": { bg: "#fffdfa" },
  "malaybalay_kaamulan": { bg: "#fef2f2" },
  "malolos_barasoain": { bg: "#fef7ee" },
  "mandaluyong_tiger": { bg: "#f0fdf4" },
  "mandaue_furniture": { bg: "#fefce8" },
  "manila_intramuros": { bg: "#faf8f5" },
  "marawi_torogan_sarimanok": { bg: "#fefce8" },
  "marikina_river_park": { bg: "#faf5f0" },
  "marikina_shoe": { bg: "#faf5f0" },
  "masbate_rodeo": { bg: "#fefce8" },
  "mati_sleeping_dinosaur": { bg: "#f0f9ff" },
  "mayon": { bg: "#f0fdf4" },
  "meycauayan_jewelry": { bg: "#fefce8" },
  "munoz_rice_science": { bg: "#f0fdf4" },
  "munoz_science": { bg: "#f0f4f8" },
  "muntinlupa_lake": { bg: "#f0fdf4" },
  "alabang_town_center": { bg: "#f0fdf4" },
  "naga_cebu_boardwalk": { bg: "#fff7ed" },
  "naga_penafrancia": { bg: "#fefce8" },
  "navotas_fishing_trawler": { bg: "#f0f9ff" },
  "olongapo_naval": { bg: "#e0f2fe" },
  "olongapo_subic_bay": { bg: "#eff6ff" },
  "ormoc_queen_pineapple": { bg: "#fefce8" },
  "oroquieta_mobod_marine": { bg: "#fefce8" },
  "ozamiz_fuerte_triunfo": { bg: "#fefce8" },
  "pagadian_sloping_tricycle": { bg: "#f0f9ff" },
  "palayan_capitol": { bg: "#fefce8" },
  "palayan_rice": { bg: "#fefae0" },
  "palembang_ampera_bridge": { bg: "#fff7ed" },
  "pampanga_giant_parol": { bg: "#0b132b" },
  "pampanga_parol": { bg: "#fef2f2" },
  "panabo_banana_capital": { bg: "#fefce8" },
  "paranaque_baclaran": { bg: "#fdf0d5" },
  "paranaque_palayok": { bg: "#fafaf9" },
  "pasay_manila_bay": { bg: "#fffbeb" },
  "pasay_sunset": { bg: "#03071e" },
  "pasig_mutya": { bg: "#f0f9ff" },
  "pasig_river_ferry": { bg: "#f1faee" },
  "passi_pineapple": { bg: "#fefae0" },
  "passi_sweet_pineapple": { bg: "#fefce8" },
  "pateros_balut": { bg: "#faf8f2" },
  "ph_luzon_map": {
    frame: "#eab308",
    bg: "#f0f9ff",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/luzon.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "ph_mindanao_map": {
    frame: "#eab308",
    bg: "#fefce8",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/mindanao.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "ph_visayas_map": {
    frame: "#eab308",
    bg: "#f0fdf4",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/visayas.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "pines": { bg: "#faf8ee" },
  "puerto_princesa_subterranean": { bg: "#f0fdf4" },
  "purwokerto_slamet_waterfall": { bg: "#f0fdf4" },
  "qc_monument": { bg: "#fafafa" },
  "roxas_diwal_seafood": { bg: "#ecfeff" },
  "roxas_seafood": { bg: "#fdf0d5" },
  "sagay_carbin_reef": { bg: "#f0fdfa" },
  "samal_monfort_bats": { bg: "#f0fdfa" },
  "san_carlos_mango": { bg: "#fefae0" },
  "san_carlos_mango_baskets": { bg: "#fefce8" },
  "san_carlos_pintaflores": { bg: "#f0fdf4" },
  "san_fernando_poro_point": { bg: "#f0f9ff" },
  "san_jose_ne_onion": { bg: "#fefae0" },
  "san_jose_onion": { bg: "#fdf2f8" },
  "san_juan_pinaglabanan": { bg: "#fdfbf7" },
  "san_pablo_sampaloc_lake": { bg: "#f0fdf4" },
  "san_pablo_seven_lakes": { bg: "#fefae0" },
  "san_pedro_sampaguita": { bg: "#f0fdf4" },
  "santa_rosa_lion": { bg: "#fefce8" },
  "santiago_corn": { bg: "#fefce8" },
  "santiago_gateway": { bg: "#fefae0" },
  "santo_tomas_malvar": { bg: "#f0fdf4" },
  "semarang_lawang_sewu": { bg: "#fefce8" },
  "silay_balay_negrense": { bg: "#fefce8" },
  "singapore_merlion": { bg: "#f0fdf4" },
  "sipalay_tinagong_dagat": { bg: "#f0f9ff" },
  "sjdm_balagbag": { bg: "#fefce8" },
  "sjdm_rising_city": { bg: "#fefae0" },
  "sorsogon_bulusan": { bg: "#f0f9ff" },
  "sorsogon_butanding": { bg: "#e0f2fe" },
  "sta_rosa_arch": { bg: "#fdf0d5" },
  "sto_tomas_makiling": { bg: "#fefae0" },
  "surabaya_shark_crocodile": { bg: "#fefae0" },
  "surigao_mabua_pebbles": { bg: "#fefce8" },
  "tabaco_bolo_bay": { bg: "#f1f5f9" },
  "tabaco_cutlery": { bg: "#f0fdf4" },
  "tabuk_chico_river": { bg: "#f0fdf4" },
  "tabuk_kalinga_tattoo": { bg: "#fdf0d5" },
  "tacloban_san_juanico": { bg: "#fef2f2" },
  "tacurong_baras_birds": { bg: "#fefce8" },
  "tagaytay_taal": { bg: "#caf0f8" },
  "tagaytay_taal_ridge": { bg: "#fefce8" },
  "tagbilaran_sandugo": { bg: "#fefce8" },
  "taguig_bgc_highstreet": { bg: "#020c1b" },
  "taguig_highstreet": { bg: "#f0f9ff" },
  "tagum_palm_city": { bg: "#fefce8" },
  "talisay_lechon": { bg: "#fff7ed" },
  "talisay_the_ruins": { bg: "#fefce8" },
  "tanauan_mabini": { bg: "#fefce8" },
  "tandag_linungao_island": { bg: "#fefce8" },
  "tangub_christmas_symbols": { bg: "#fef2f2" },
  "tanjay_saulog": { bg: "#fff7ed" },
  "tarlac_sugarcane": { bg: "#fefce8" },
  "tayabas_malagonlong": { bg: "#fdf0d5" },
  "tayabas_malagonlong_bridge": { bg: "#f0f9ff" },
  "toledo_copper_mine": { bg: "#fffbeb" },
  "toronto_cn_tower": { bg: "#f1f5f9" },
  "trece_martires_heroes": { bg: "#fefae0" },
  "trece_martires_monument": { bg: "#fefce8" },
  "tuguegarao_callao": { bg: "#fdf0d5" },
  "tuguegarao_callao_cave": { bg: "#fff7ed" },
  "tuna": { bg: "#0284c7" },
  "urdaneta_cattle_market": { bg: "#fefce8" },
  "urdaneta_palay": { bg: "#fefae0" },
  "valencia_pulangi_dam": { bg: "#f0fdf4" },
  "valenzuela_arkong_bato": { bg: "#f0f9ff" },
  "victorias_sugar_refinery": { bg: "#f8fafc" },
  "zamboanga_vinta_fort_pilar": { bg: "#faf8f5" },
};

// =============================================================================
// Philatelic Border Colors:
// Uniform Yellow (#eab308) across all origins
// =============================================================================
export const getStampBorderColor = (_city = "", _region = "", _country = "") => {
  return "#eab308";
};

// =============================================================================
// LetterStamp Component
// =============================================================================
export const LetterStamp = React.memo(({ variant = 0, city = "", region = "", country = "", isFeatured = false, className = "" }) => {
  // 1. Featured Philatelic Star Stamp - ONLY rendered on the Featured Card!
  if (isFeatured) {
    return (
      <div className={`letter-card__stamp-wrapper letter-card__stamp-wrapper--variant-3 ${className}`}>
        <svg
          className="letter-card__main-stamp letter-card__main-stamp--featured-star"
          width="38"
          height="46"
          viewBox="0 0 48 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Featured postage stamp"
        >
          <path d={SCALLOP_48_58} fill="#ffffff" stroke="#eab308" strokeWidth="0.8" strokeLinejoin="round" />
          <rect x="3" y="3" width="42" height="52" rx="0.5" fill="#2b2014" />
          <rect x="4.5" y="4.5" width="39" height="49" fill="#1c160e" />
          <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke="#b08a32" strokeWidth="0.4" opacity="0.4" />
          <circle cx="24" cy="29" r="15" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="1.5 1" opacity="0.8" />
          {/* 8-Pointed Philatelic Star */}
          <polygon
            points="24,17 26.5,25 34,22 28.5,28 36,29 28.5,30 34,36 26.5,33 24,41 21.5,33 14,36 19.5,30 12,29 19.5,28 14,22 21.5,25"
            fill="#d4af37"
            stroke="#b08a32"
            strokeWidth="0.4"
          />
          <circle cx="24" cy="29" r="2.8" fill="#f9e8a2" />
        </svg>
      </div>
    );
  }

  const frameColor = getStampBorderColor(city, region, country);

  // 2. City Landmark Stamp (All 152 Philippine Cities + Specific International Cities)
  const cityData = city ? getCityStampData(city) : null;
  const isDomesticCity = cityData && (!cityData.country || cityData.country === "Philippines");
  const isLocallyInternational = isDomesticCity && isInternationalLocation(city, country, region);

  if (cityData && !isLocallyInternational) {
    const motifConfig = PHILATELIC_MOTIFS[cityData.motif] || PHILATELIC_MOTIFS["mayon"] || PHILATELIC_MOTIFS["manila_intramuros"];

    return (
      <div className={`letter-card__stamp-wrapper letter-card__stamp-wrapper--city ${className}`}>
        <svg
          className="letter-card__main-stamp letter-card__main-stamp--city"
          viewBox="0 0 48 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Postage stamp: ${cityData.canonicalName}`}
          data-city={cityData.canonicalName}
          data-motif={cityData.motif}
        >
          {/* Perforated scallop border */}
          <path d={SCALLOP_48_58} fill="#ffffff" stroke="#eab308" strokeWidth="0.8" strokeLinejoin="round" />
          {/* Outer contrasting border frame */}
          <rect x="3" y="3" width="42" height="52" rx="0.5" fill={frameColor} />
          {/* Inner canvas background */}
          <rect x="4.5" y="4.5" width="39" height="49" fill={motifConfig.bg} />
          {/* Fine interior frame line */}
          <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke={frameColor} strokeWidth="0.4" opacity="0.3" />

          {/* Central Artwork: auto-detects [city]_inner.webp, falls back to vector */}
          <CityStampArt cityData={cityData} fallback={motifConfig.renderArt} />
        </svg>
      </div>
    );
  }

  // 3. Generic Philippine Island Group Map Stamps (Luzon, Visayas, Mindanao)
  const islandGroup = getPhilippineIslandGroup(city, region, country);
  if (islandGroup) {
    const motifKey = `ph_${islandGroup}_map`;
    const motifConfig = PHILATELIC_MOTIFS[motifKey] || PHILATELIC_MOTIFS["ph_luzon_map"];
    const capitalizedName = islandGroup.charAt(0).toUpperCase() + islandGroup.slice(1);

    return (
      <div className={`letter-card__stamp-wrapper letter-card__stamp-wrapper--ph-island letter-card__stamp-wrapper--${islandGroup} ${className}`}>
        <svg
          className="letter-card__main-stamp letter-card__main-stamp--ph-island"
          viewBox="0 0 48 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Philippine postage stamp: ${capitalizedName} Map`}
          data-island-group={islandGroup}
          data-motif={motifKey}
        >
          {/* Perforated scallop border */}
          <path d={SCALLOP_48_58} fill="#ffffff" stroke="#eab308" strokeWidth="0.8" strokeLinejoin="round" />
          {/* Outer contrasting border frame */}
          <rect x="3" y="3" width="42" height="52" rx="0.5" fill={frameColor} />
          {/* Inner canvas background */}
          <rect x="4.5" y="4.5" width="39" height="49" fill={motifConfig.bg} />
          {/* Fine interior frame line */}
          <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke={frameColor} strokeWidth="0.4" opacity="0.3" />

          {/* Central Artwork */}
          {motifConfig.renderArt()}
        </svg>
      </div>
    );
  }

  // 4. Dedicated Country Fallback Stamps (USA, Canada, UAE, Singapore, Malaysia, Indonesia, New Zealand)
  const dedicatedCountryCode = getDedicatedCountryCode(city, region, country);
  if (dedicatedCountryCode) {
    const COUNTRY_CONFIGS = {
      usa: {
        countryName: "United States",
        motifKey: "usa_national",
        wrapperClass: "letter-card__stamp-wrapper--country-usa",
        mainClass: "letter-card__main-stamp--country-usa",
      },
      canada: {
        countryName: "Canada",
        motifKey: "canada_national",
        wrapperClass: "letter-card__stamp-wrapper--country-canada",
        mainClass: "letter-card__main-stamp--country-canada",
      },
      united_arab_emirates: {
        countryName: "United Arab Emirates",
        motifKey: "uae_national",
        wrapperClass: "letter-card__stamp-wrapper--country-uae",
        mainClass: "letter-card__main-stamp--country-uae",
      },
      singapore: {
        countryName: "Singapore",
        motifKey: "singapore_national",
        wrapperClass: "letter-card__stamp-wrapper--country-singapore",
        mainClass: "letter-card__main-stamp--country-singapore",
      },
      malaysia: {
        countryName: "Malaysia",
        motifKey: "malaysia_national",
        wrapperClass: "letter-card__stamp-wrapper--country-malaysia",
        mainClass: "letter-card__main-stamp--country-malaysia",
      },
      indonesia: {
        countryName: "Indonesia",
        motifKey: "indonesia_national",
        wrapperClass: "letter-card__stamp-wrapper--country-indonesia",
        mainClass: "letter-card__main-stamp--country-indonesia",
      },
      new_zealand: {
        countryName: "New Zealand",
        motifKey: "new_zealand_national",
        wrapperClass: "letter-card__stamp-wrapper--country-new-zealand",
        mainClass: "letter-card__main-stamp--country-new-zealand",
      },
    };

    const cfg = COUNTRY_CONFIGS[dedicatedCountryCode] || COUNTRY_CONFIGS.indonesia;
    const motifConfig = PHILATELIC_MOTIFS[cfg.motifKey] || {
      frame: "#1e293b",
      bg: "#f8fafc",
      renderArt: () => null,
    };

    return (
      <div className={`letter-card__stamp-wrapper letter-card__stamp-wrapper--country ${cfg.wrapperClass} ${className}`}>
        <svg
          className={`letter-card__main-stamp letter-card__main-stamp--country ${cfg.mainClass}`}
          viewBox="0 0 48 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${cfg.countryName} postage stamp`}
          data-country={cfg.countryName}
          data-motif={cfg.motifKey}
        >
          {/* Perforated scallop border */}
          <path d={SCALLOP_48_58} fill="#ffffff" stroke="#eab308" strokeWidth="0.8" strokeLinejoin="round" />
          {/* Outer contrasting border frame */}
          <rect x="3" y="3" width="42" height="52" rx="0.5" fill={frameColor} />
          {/* Inner canvas background */}
          <rect x="4.5" y="4.5" width="39" height="49" fill={motifConfig.bg} />
          {/* Fine interior frame line */}
          <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke={frameColor} strokeWidth="0.4" opacity="0.3" />

          {/* Central Artwork */}
          {motifConfig.renderArt()}
        </svg>
      </div>
    );
  }

  // 5. Generic International Stamp (for any international location without a specific city stamp)
  if (isInternationalLocation(city, country, region)) {
    const motifConfig = PHILATELIC_MOTIFS["global_international"] || {
      frame: "#1e293b",
      bg: "#f8fafc",
      renderArt: () => null,
    };

    return (
      <div className={`letter-card__stamp-wrapper letter-card__stamp-wrapper--international ${className}`}>
        <svg
          className="letter-card__main-stamp letter-card__main-stamp--international"
          viewBox="0 0 48 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="International postage stamp: Global"
          data-motif="global_international"
        >
          {/* Perforated scallop border */}
          <path d={SCALLOP_48_58} fill="#ffffff" stroke="#eab308" strokeWidth="0.8" strokeLinejoin="round" />
          {/* Outer contrasting border frame */}
          <rect x="3" y="3" width="42" height="52" rx="0.5" fill={frameColor} />
          {/* Inner canvas background */}
          <rect x="4.5" y="4.5" width="39" height="49" fill={motifConfig.bg} />
          {/* Fine interior frame line */}
          <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke={frameColor} strokeWidth="0.4" opacity="0.3" />

          {/* Central Artwork */}
          {motifConfig.renderArt()}
        </svg>
      </div>
    );
  }

  // 6. Default Classical Archetype Fallback Stamp: Philippine Jeepney pop-art stamp
  return (
    <div className={`letter-card__stamp-wrapper letter-card__stamp-wrapper--variant-1 ${className}`}>
      <svg
        className="letter-card__main-stamp"
        viewBox="0 0 48 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d={SCALLOP_48_58} fill="#ffffff" stroke="#eab308" strokeWidth="0.8" strokeLinejoin="round" />
        <rect x="3" y="3" width="42" height="52" rx="0.5" fill={frameColor} />
        <rect x="4.5" y="4.5" width="39" height="49" fill="#fefae0" />
        <rect x="5.5" y="5.5" width="37" height="47" fill="none" stroke={frameColor} strokeWidth="0.4" opacity="0.3" />
        {/* Jeepney Hood & Body */}
        <rect x="9" y="24" width="30" height="15" fill="#d90429" rx="2" />
        <rect x="9" y="19" width="30" height="6" fill="#facc15" />
        <polygon points="13,19 16,14 32,14 35,19" fill="#facc15" />
        {/* Windshield */}
        <rect x="13" y="21" width="10.5" height="4" fill="#60a5fa" />
        <rect x="24.5" y="21" width="10.5" height="4" fill="#60a5fa" />
        {/* Chrome horses on hood */}
        <circle cx="21" cy="18" r="1.5" fill="#ffffff" />
        <circle cx="27" cy="18" r="1.5" fill="#ffffff" />
        {/* Headlights & Grille */}
        <circle cx="13" cy="31" r="3" fill="#fef08a" stroke="#1d3557" strokeWidth="0.8" />
        <circle cx="35" cy="31" r="3" fill="#fef08a" stroke="#1d3557" strokeWidth="0.8" />
        <rect x="18" y="29" width="12" height="6" fill="#1d3557" rx="1" />
        <line x1="21" y1="30" x2="21" y2="34" stroke="#ffffff" strokeWidth="0.8" />
        <line x1="24" y1="30" x2="24" y2="34" stroke="#ffffff" strokeWidth="0.8" />
        <line x1="27" y1="30" x2="27" y2="34" stroke="#ffffff" strokeWidth="0.8" />
        {/* Bumper */}
        <rect x="8" y="37" width="32" height="3" fill="#cbd5e1" rx="0.5" />
      </svg>
    </div>
  );
});

export default LetterStamp;