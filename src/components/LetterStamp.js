import React, { useMemo } from "react";
import { getCityStampData, isInternationalLocation, getPhilippineIslandGroup, getDedicatedCountryCode } from "../data/philippineCities";
import { BacoorTahongArt } from "./SpecialVectorStamps";

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
  "alaminos_hundred_islands": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "ALAMINOS",
    topColor: "#065f46",
    bottom: "HUNDRED ISLANDS",
    bottomColor: "#065f46",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/alaminos_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "angeles_kuliat": {
    frame: "#991b1b",
    bg: "#fef2f2",
    top: "ANGELES",
    topColor: "#991b1b",
    bottom: "SISIG",
    bottomColor: "#991b1b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Wooden Trivet Platter Base */}
    <ellipse cx="50" cy="60" rx="36" ry="32" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
    <ellipse cx="50" cy="60" rx="33" ry="29" fill="#92400e" stroke="#451a03" strokeWidth="0.6" strokeDasharray="3 1.5" />
    {/* Sizzling Cast Iron Skillet Plate */}
    <ellipse cx="50" cy="60" rx="30" ry="26" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
    <ellipse cx="50" cy="60" rx="27" ry="23" fill="#27272a" />
    {/* Sizzling Texture (Crispy Chopped Pork, Onions, Chilis) */}
    <g fill="#713f12" stroke="#451a03" strokeWidth="0.5">
      {/* Chopped pork bits */}
      <rect x="30" y="44" width="7" height="6" rx="1.5" fill="#a16207" />
      <rect x="39" y="42" width="8" height="7" rx="1.5" fill="#ca8a04" />
      <rect x="49" y="43" width="7" height="6" rx="1.5" fill="#854d0e" />
      <rect x="58" y="45" width="8" height="6" rx="1.5" fill="#ca8a04" />
      <rect x="28" y="52" width="8" height="6" rx="1.5" fill="#854d0e" />
      <rect x="64" y="52" width="7" height="6" rx="1.5" fill="#a16207" />
      <rect x="32" y="60" width="7" height="7" rx="1.5" fill="#ca8a04" />
      <rect x="61" y="60" width="8" height="6" rx="1.5" fill="#854d0e" />
      <rect x="35" y="69" width="8" height="6" rx="1.5" fill="#a16207" />
      <rect x="57" y="68" width="7" height="6" rx="1.5" fill="#ca8a04" />
      <rect x="46" y="71" width="9" height="5" rx="1.5" fill="#854d0e" />
      {/* Diced Onions & Green Chili Rings */}
      <circle cx="34" cy="50" r="2" fill="#fef08a" stroke="#ca8a04" />
      <circle cx="63" cy="50" r="2.2" fill="#fef08a" stroke="#ca8a04" />
      <circle cx="42" cy="68" r="2" fill="#fef08a" stroke="#ca8a04" />
      <ellipse cx="56" cy="64" rx="2.5" ry="1.5" fill="#15803d" stroke="#14532d" />
      <ellipse cx="38" cy="58" rx="2.2" ry="1.5" fill="#15803d" stroke="#14532d" />
      {/* Siling Labuyo Red Chili */}
      <path d="M36,44 Q42,40 44,45" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M58,70 Q64,74 66,69" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    {/* Center Fried Egg */}
    <ellipse cx="50" cy="57" rx="9" ry="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
    <circle cx="50" cy="57" r="4.5" fill="#ea580c" stroke="#c2410c" strokeWidth="0.8" />
    <circle cx="48.5" cy="55.5" r="1.2" fill="#fef08a" />
    {/* Sizzle Steam Rays */}
    <path d="M42,32 Q40,24 43,18 M50,30 Q52,22 49,16 M58,32 Q60,24 57,18" fill="none" stroke="#b91c1c" strokeWidth="0.7" strokeDasharray="2 1.5" opacity="0.6" />
      </svg>
    ),
  },
  "antipolo_cathedral_falls": {
    frame: "#1a365d",
    bg: "#f0fdf4",
    top: "ANTIPOLO",
    topColor: "#1a365d",
    bottom: "HINULUGANG TAKTAK",
    bottomColor: "#0284c7",
    renderArt: () => (
      <g>
{/* Antipolo Cathedral Bell Tower */}
      <rect x="10" y="20" width="10" height="22" fill="#1e3a8a" rx="1" />
      <polygon points="15,13 10,20 20,20" fill="#b91c1c" />
      <circle cx="15" cy="25" r="2" fill="#fef08a" />
      {/* Hinulugang Taktak Waterfall */}
      <rect x="25" y="20" width="14" height="22" fill="#14532d" rx="1" />
      <path d="M 28 20 V 42" stroke="#38bdf8" strokeWidth="2.5" />
      <path d="M 33 20 V 42" stroke="#ffffff" strokeWidth="2" />
      <circle cx="30" cy="42" r="3" fill="#bae6fd" />
      </g>
    ),
  },
    "antipolo_hinulugang_taktak": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "ANTIPOLO",
    topColor: "#047857",
    bottom: "HINULUGANG TAKTAK FALLS",
    bottomColor: "#047857",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/antipolo_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "bacolod_masskara": {
    frame: "#be123c",
    bg: "#fff1f2",
    top: "BACOLOD",
    topColor: "#be123c",
    bottom: "MASSKARA MASK",
    bottomColor: "#be123c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Outer Festival Radial Light Rays */}
    <g stroke="#fb7185" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
      <line x1="50" y1="10" x2="50" y2="106" /><line x1="12" y1="58" x2="88" y2="58" />
      <line x1="22" y1="28" x2="78" y2="88" /><line x1="78" y1="28" x2="22" y2="88" />
    </g>
    {/* One Smiling MassKara Mask Viewed Frontally (Exaggerated Smile, Feathers, Rays) */}
    <g id="masskara-mask">
      {/* Radiating Fan of Ornamental Feathers / Sunburst Crest */}
      <g fill="#facc15" stroke="#b45309" strokeWidth="0.8">
        <path d="M50,18 C46,24 44,34 50,40 C56,34 54,24 50,18 Z" fill="#e11d48" />
        <path d="M38,22 C34,28 36,38 44,42 C48,36 44,26 38,22 Z" fill="#f59e0b" />
        <path d="M62,22 C66,28 64,38 56,42 C52,36 56,26 62,22 Z" fill="#f59e0b" />
        <path d="M26,30 C24,36 28,46 38,48 C40,42 34,32 26,30 Z" fill="#059669" />
        <path d="M74,30 C76,36 72,46 62,48 C60,42 66,32 74,30 Z" fill="#059669" />
        <path d="M18,42 C18,48 24,56 34,56 C34,50 26,42 18,42 Z" fill="#0284c7" />
        <path d="M82,42 C82,48 76,56 66,56 C66,50 74,42 82,42 Z" fill="#0284c7" />
      </g>
      {/* Main Mask Face Oval */}
      <ellipse cx="50" cy="62" rx="24" ry="26" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.4" />
      {/* Ornate Forehead Filigree Tiara */}
      <path d="M34,44 Q50,40 66,44 Q50,48 34,44 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />
      <circle cx="50" cy="44" r="2.5" fill="#ffffff" stroke="#e11d48" strokeWidth="0.7" />
      {/* Almond-Shaped Dramatic Stage Eyes with Eyelashes */}
      <path d="M34,54 Q41,48 45,54 Q41,58 34,54 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      <path d="M55,54 Q59,48 66,54 Q59,58 55,54 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="41" cy="53" r="1.5" fill="#ffffff" /><circle cx="61" cy="53" r="1.5" fill="#ffffff" />
      {/* Cheerful Blushing Cheeks */}
      <circle cx="34" cy="65" r="4.5" fill="#f43f5e" opacity="0.6" />
      <circle cx="66" cy="65" r="4.5" fill="#f43f5e" opacity="0.6" />
      {/* Signature Exaggerated Broad Beam Smile with Teeth */}
      <path d="M32,68 Q50,88 68,68 Q50,78 32,68 Z" fill="#be123c" stroke="#881337" strokeWidth="1.3" />
      {/* White Radiant Teeth */}
      <path d="M36,70 Q50,80 64,70 Q50,75 36,70 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
      {/* Chin Rosette Gem */}
      <circle cx="50" cy="84" r="2" fill="#ca8a04" />
    </g>
      </svg>
    ),
  },
    "bacoor_molino_dam": {
    frame: "#047857",
    bg: "#fefae0",
    top: "BACOOR",
    topColor: "#047857",
    bottom: "TAHONG CAPITAL",
    bottomColor: "#047857",
    renderArt: () => <BacoorTahongArt />,
  },
  "bacoor_mussels_battle": {
    frame: "#005f73",
    bg: "#fdf0d5",
    top: "BACOOR",
    topColor: "#005f73",
    bottom: "TAHONG CAPITAL",
    bottomColor: "#ae2012",
    renderArt: () => (
      <g>
{/* Tahong bamboo poles in water */}
      <rect x="7" y="32" width="34" height="12" fill="#0a9396" />
      <line x1="13" y1="22" x2="13" y2="40" stroke="#7f4f24" strokeWidth="1.2" />
      <line x1="19" y1="20" x2="19" y2="40" stroke="#7f4f24" strokeWidth="1.2" />
      <line x1="25" y1="23" x2="25" y2="40" stroke="#7f4f24" strokeWidth="1.2" />
      {/* Green Mussel (Tahong) Shell */}
      <ellipse cx="32" cy="28" rx="6" ry="3.5" fill="#005f73" transform="rotate(-20 32 28)" />
      <ellipse cx="32" cy="28" rx="4.5" ry="2" fill="#94d2bd" transform="rotate(-20 32 28)" />
      {/* Zapote bridge arch */}
      <path d="M 8 34 Q 20 25 32 34" stroke="#ae2012" strokeWidth="1.5" fill="none" />
      </g>
    ),
  },
  "bago_araneta_sugar": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "BAGO",
    topColor: "#15803d",
    bottom: "SUGARCANE",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Sugarcane Stalk Shown Diagonally in Precise Botanical Engraving */}
    <g transform="translate(50, 58) rotate(-38) translate(-50, -58)">
      {/* Segmented Cane Stalk (Nodes and Internodes) */}
      {/* Internode 1 */}
      <rect x="47" y="14" width="6" height="22" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="36" x2="55" y2="36" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      {/* Internode 2 */}
      <rect x="47" y="36" width="6" height="24" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="60" x2="55" y2="60" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      {/* Internode 3 */}
      <rect x="47" y="60" width="6" height="24" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="84" x2="55" y2="84" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      {/* Internode 4 */}
      <rect x="47" y="84" width="6" height="20" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      {/* Botanical Hatching Striations on Cane */}
      <line x1="49" y1="16" x2="49" y2="34" stroke="#a3e635" strokeWidth="0.6" />
      <line x1="49" y1="38" x2="49" y2="58" stroke="#a3e635" strokeWidth="0.6" />
      <line x1="49" y1="62" x2="49" y2="82" stroke="#a3e635" strokeWidth="0.6" />
      {/* Long Arching Tapered Cane Leaves from Nodes */}
      <path d="M47,36 C32,28 18,34 10,48 C22,44 36,42 47,36 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <path d="M53,60 C68,52 82,58 90,72 C78,68 64,66 53,60 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <path d="M47,84 C30,78 20,86 14,98 C24,94 36,92 47,84 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
    </g>
      </svg>
    ),
  },
  "bago_kanlaon_sugar": {
    frame: "#15803d",
    bg: "#fefae0",
    top: "BAGO",
    topColor: "#15803d",
    bottom: "MOUNT KANLAON",
    bottomColor: "#374151",
    renderArt: () => (
      <g>
{/* Mount Kanlaon Volcano peak */}
      <polygon points="7,36 24,17 41,36" fill="#374151" />
      <polygon points="20,17 24,20 28,17 24,15" fill="#f97316" />
      {/* Sugarcane field foreground */}
      <line x1="13" y1="28" x2="13" y2="43" stroke="#22c55e" strokeWidth="1.8" />
      <line x1="21" y1="26" x2="21" y2="43" stroke="#15803d" strokeWidth="1.8" />
      <line x1="29" y1="27" x2="29" y2="43" stroke="#22c55e" strokeWidth="1.8" />
      <line x1="36" y1="29" x2="36" y2="43" stroke="#15803d" strokeWidth="1.8" />
      </g>
    ),
  },
  "baguio_lion_head": {
    frame: "#1d3557",
    bg: "#fdf0d5",
    top: "BAGUIO",
    topColor: "#ffffff",
    bottom: "SUMMER CAPITAL",
    bottomColor: "#fcbf49",
    renderArt: () => (
      <g>
{/* Deep blue sky */}
      <rect x="8" y="13" width="32" height="30" fill="#1d3557" />
      {/* Kennon Road Giant Lion Head */}
      <polygon points="24,15 15,33 33,33" fill="#fcbf49" />
      <circle cx="24" cy="24" r="7.5" fill="#fcbf49" />
      {/* Red mane accents */}
      <path d="M 16 23 Q 12 28 16 33 L 20 33 Z" fill="#d90429" />
      <path d="M 32 23 Q 36 28 32 33 L 28 33 Z" fill="#d90429" />
      <path d="M 21 16 Q 24 13 27 16 Z" fill="#d90429" />
      {/* Lion face features */}
      <ellipse cx="21" cy="22" rx="1.2" ry="0.8" fill="#1d3557" />
      <ellipse cx="27" cy="22" rx="1.2" ry="0.8" fill="#1d3557" />
      <polygon points="24,24 22,26 26,26" fill="#1d3557" />
      <path d="M 21 28 Q 24 31 27 28" stroke="#1d3557" strokeWidth="1" fill="#ffffff" />
      {/* Stone Pedestal with WELCOME */}
      <rect x="13" y="34" width="22" height="7" fill="#457b9d" rx="1" />
      <text x="24" y="39" textAnchor="middle" fill="#ffffff" fontSize="3.2" fontFamily="sans-serif" fontWeight="bold">WELCOME</text>
      </g>
    ),
  },
  "bais_dolphins": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "BAIS",
    topColor: "#0284c7",
    bottom: "TAÑON STRAIT DOLPHIN",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Tañon Strait Marine Horizon & Calm Ripples */}
    <g opacity="0.3" stroke="#0284c7" strokeWidth="0.5">
      <line x1="10" y1="78" x2="90" y2="78" strokeDasharray="4 2" />
      <line x1="12" y1="88" x2="88" y2="88" strokeDasharray="2 2" />
    </g>

    <g id="tañon-dolphin-leap">
      {/* Water Wave Crest & Emergence Splash */}
      <path d="M 12 76 Q 26 72 38 75 Q 46 70 56 74 Q 68 76 88 74" fill="none" stroke="#0369a1" strokeWidth="1.1" />
      <path d="M 28 75 Q 34 68 40 76" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
      {/* Water Spray Droplets */}
      <circle cx="32" cy="70" r="1.1" fill="#38bdf8" />
      <circle cx="36" cy="67" r="0.9" fill="#38bdf8" />
      <circle cx="42" cy="69" r="1.2" fill="#38bdf8" />

      {/* Single Leaping Bottlenose Dolphin (Hydrodynamic Arcing Silhouette) */}
      {/* Main Upper Body (Slate-Blue / Steel Gray Dorsum) */}
      <path d="
        M 22 68
        C 24 58, 30 46, 42 38
        C 52 32, 64 32, 74 38
        C 80 42, 84 48, 86 54
        C 84 52, 78 48, 70 46
        C 60 44, 48 48, 38 56
        C 30 62, 26 68, 22 68 Z
      " fill="#0369a1" stroke="#0c4a6e" strokeWidth="1.2" />

      {/* Characteristic Curved Falcate Dorsal Fin */}
      <path d="M 52 34 C 55 24, 61 22, 65 24 C 62 28, 59 32, 59 35 Z" fill="#0369a1" stroke="#0c4a6e" strokeWidth="1.0" />

      {/* Rounded Melon Forehead & Slender Rostrum (Beak) */}
      <path d="
        M 74 38
        C 78 40, 82 43, 85 46
        L 91 48 L 91 50 L 86 51
        C 84 53, 81 55, 78 55 Z
      " fill="#0284c7" stroke="#0c4a6e" strokeWidth="0.9" />
      {/* Mouthline & Intelligent Eye */}
      <line x1="86" y1="49" x2="90" y2="49" stroke="#0c4a6e" strokeWidth="0.7" />
      <circle cx="78" cy="45" r="1.2" fill="#0c4a6e" />
      <circle cx="78.3" cy="44.8" r="0.4" fill="#ffffff" />

      {/* Counter-Shaded Lighter Ventral Belly (Cream / Soft Cyan) */}
      <path d="
        M 24 68
        C 32 64, 42 56, 52 54
        C 62 52, 72 52, 78 55
        C 74 58, 62 59, 50 61
        C 38 64, 30 70, 24 68 Z
      " fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.7" />

      {/* Pointed Pectoral Flipper */}
      <path d="M 64 52 C 60 58, 56 64, 52 66 C 54 62, 58 56, 62 52 Z" fill="#0284c7" stroke="#0c4a6e" strokeWidth="0.8" />

      {/* Muscular Caudal Peduncle & Tail Flukes (Breaking clear of water) */}
      <path d="M 22 68 L 14 74 L 10 70 Q 14 73 18 70 L 22 68 Z" fill="#0369a1" stroke="#0c4a6e" strokeWidth="0.9" />
      <path d="M 14 74 L 12 80 Q 15 76 19 75 Z" fill="#0369a1" stroke="#0c4a6e" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "balanga_cross": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "BALANGA",
    topColor: "#0369a1",
    bottom: "WETLAND BIRD",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Minimal Marsh Background & Water Shimmer */}
    <line x1="14" y1="88" x2="86" y2="88" stroke="#38bdf8" strokeWidth="0.8" />
    <line x1="20" y1="94" x2="80" y2="94" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 2" />
    {/* Marsh Reeds & Cattails */}
    <g stroke="#0369a1" strokeWidth="0.8" fill="none">
      <path d="M18,92 Q22,60 16,36 M22,92 Q26,65 24,42 M26,92 Q30,70 32,50" />
      <path d="M74,92 Q72,62 76,40 M78,92 Q82,66 80,45 M82,92 Q86,70 85,52" />
      {/* Cattail Heads */}
      <rect x="15" y="44" width="2.5" height="12" rx="1.2" fill="#78350f" stroke="none" />
      <rect x="75" y="46" width="2.5" height="12" rx="1.2" fill="#78350f" stroke="none" />
    </g>
    {/* Single Native Wetland Bird (Egret/Heron in Side Profile) */}
    <g id="wetland-bird">
      {/* Legs standing in shallow marsh */}
      <line x1="48" y1="68" x2="46" y2="90" stroke="#0f172a" strokeWidth="1.2" />
      <line x1="53" y1="68" x2="54" y2="90" stroke="#0f172a" strokeWidth="1.2" />
      <path d="M46,90 L40,92 M46,90 L48,93 M54,90 L50,92 M54,90 L58,92" stroke="#0f172a" strokeWidth="0.9" />
      {/* Body & Plumage */}
      <path d="M42,66 C36,60 38,48 48,46 C56,44 64,50 66,60 C68,66 62,70 52,70 C46,70 43,68 42,66 Z" fill="#ffffff" stroke="#0284c7" strokeWidth="1.1" />
      {/* Wing feather engraving lines */}
      <path d="M45,54 C50,52 58,54 62,60 M44,58 C50,56 58,58 64,64 M43,62 C48,60 55,62 60,66" fill="none" stroke="#0ea5e9" strokeWidth="0.6" />
      {/* Graceful S-Curved Neck */}
      <path d="M48,46 C46,38 42,32 44,24 C45,20 48,18 52,18" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M48,46 C46,38 42,32 44,24 C45,20 48,18 52,18" fill="none" stroke="#0284c7" strokeWidth="1" />
      {/* Head & Long Sharp Beak */}
      <circle cx="53" cy="18" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="0.9" />
      <circle cx="54" cy="17" r="0.8" fill="#0f172a" />
      <polygon points="56,17 72,19 56,21" fill="#facc15" stroke="#ca8a04" strokeWidth="0.6" />
      {/* Elegant Crest Feather */}
      <path d="M51,15 Q44,12 42,16" fill="none" stroke="#0284c7" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "balanga_mount_samat": {
    frame: "#1d3557",
    bg: "#f1faee",
    top: "BALANGA",
    topColor: "#1d3557",
    bottom: "MOUNT SAMAT",
    bottomColor: "#e63946",
    renderArt: () => (
      <g>
{/* Green Mountain Ridge */}
      <polygon points="7,44 24,24 41,44" fill="#2a9d8f" />
      <polygon points="12,44 24,28 36,44" fill="#264653" />
      {/* Mount Samat Giant War Memorial Cross */}
      <rect x="22.5" y="14" width="3" height="26" fill="#ffffff" stroke="#1d3557" strokeWidth="0.6" />
      <rect x="17" y="19" width="14" height="3" fill="#ffffff" stroke="#1d3557" strokeWidth="0.6" />
      <circle cx="34" cy="18" r="4.5" fill="#e9c46a" />
      </g>
    ),
  },
  "baliwag_buntal_hat": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "BALIWAG",
    topColor: "#78350f",
    bottom: "ITAK",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Radial Backdrop */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Diagonal Traditional Filipino Itak / Bolo */}
    <g transform="translate(50, 58) rotate(-35) translate(-50, -58)">
      {/* Carved Hardwood Handle / Hilt */}
      <path d="M14,56 C14,52 18,50 24,51 L30,52 L30,62 L24,63 C18,63 14,60 14,56 Z" fill="#451a03" stroke="#1c0a00" strokeWidth="1.1" />
      {/* Brass Ferrule Ring */}
      <rect x="30" y="52" width="4" height="10" fill="#eab308" stroke="#a16207" strokeWidth="0.8" />
      {/* Distinctive Curved Handcrafted Itak Steel Blade */}
      {/* Wide belly, tapered tip, thick forged spine */}
      <path d="M34,52 L74,51 C82,51 88,54 86,58 C80,63 68,66 52,65 L34,62 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.3" />
      {/* Upper Blade Bevel & Forged Fuller */}
      <path d="M35,53 L73,52 C78,52 82,54 84,56 L52,62 L35,60 Z" fill="#94a3b8" />
      <line x1="38" y1="56" x2="68" y2="55" stroke="#475569" strokeWidth="0.8" />
      {/* Razor Sharp Ground Edge */}
      <path d="M34,62 L52,65 C68,66 80,63 86,58" fill="none" stroke="#ffffff" strokeWidth="0.9" />
      {/* Carved grip rings on handle */}
      <line x1="18" y1="52" x2="18" y2="61" stroke="#78350f" strokeWidth="0.7" />
      <line x1="22" y1="52" x2="22" y2="62" stroke="#78350f" strokeWidth="0.7" />
      <line x1="26" y1="52" x2="26" y2="62" stroke="#78350f" strokeWidth="0.7" />
    </g>
      </svg>
    ),
  },
  "bandung_gedung_sate": {
    frame: "#065f46",
    bg: "#fdf0d5",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Mount Tangkuban Perahu backdrop */}
      <path d="M 6 28 Q 18 19 24 20 Q 30 19 42 27 L 42 38 L 6 38 Z" fill="#a7f3d0" opacity="0.45" />
      {/* Gedung Sate main neoclassical building facade */}
      <rect x="9" y="26" width="30" height="12" fill="#ffffff" stroke="#065f46" strokeWidth="0.6" rx="0.5" />
      {/* Colonial arched windows and corridors */}
      <rect x="11" y="29" width="3" height="4.5" fill="#065f46" rx="1.5" />
      <rect x="16" y="29" width="3" height="4.5" fill="#065f46" rx="1.5" />
      <rect x="21" y="29" width="6" height="5.5" fill="#065f46" rx="2" />
      <rect x="29" y="29" width="3" height="4.5" fill="#065f46" rx="1.5" />
      <rect x="34" y="29" width="3" height="4.5" fill="#065f46" rx="1.5" />
      {/* Multi-tiered roof structure */}
      <polygon points="18,26 30,26 28,21 20,21" fill="#065f46" />
      <polygon points="21,21 27,21 25.5,18 22.5,18" fill="#047857" />
      {/* Iconic Satay-skewer lightning rod with 6 gold spheres */}
      <line x1="24" y1="18" x2="24" y2="9" stroke="#065f46" strokeWidth="0.8" />
      <circle cx="24" cy="10" r="0.8" fill="#eab308" />
      <circle cx="24" cy="11.5" r="0.8" fill="#eab308" />
      <circle cx="24" cy="13" r="0.8" fill="#eab308" />
      <circle cx="24" cy="14.5" r="0.8" fill="#eab308" />
      <circle cx="24" cy="16" r="0.8" fill="#eab308" />
      <circle cx="24" cy="17.5" r="0.8" fill="#eab308" />
      {/* Lawn and front fountain */}
      <rect x="6" y="38" width="36" height="5" fill="#15803d" />
      <ellipse cx="24" cy="40.5" rx="6" ry="1.5" fill="#38bdf8" stroke="#065f46" strokeWidth="0.4" />
      </g>
    ),
  },
  "batac_empanada": {
    frame: "#c2410c",
    bg: "#fff7ed",
    top: "BATAC",
    topColor: "#c2410c",
    bottom: "ILOCOS EMPANADA",
    bottomColor: "#c2410c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Radial Rays */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Ground Shadow */}
    <ellipse cx="50" cy="88" rx="34" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Batac-Style Bright Orange Empanada in Three-Quarter View */}
    <g id="batac-empanada" transform="translate(14, 28)">
      {/* Main Puffy Crescent Body (Crispy Annatto-Orange Shell) */}
      <path d="M6,46 C8,22 24,6 48,6 C64,6 68,22 66,46 C52,56 20,56 6,46 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1.3" />
      {/* Deep Golden/Orange Highlight & Crispy Blistered Texture */}
      <path d="M12,42 C14,24 28,12 48,12 C60,12 62,24 60,42 C48,50 24,50 12,42 Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
      {/* Blistering Fry Marks / Engraved Shading */}
      <ellipse cx="36" cy="24" rx="6" ry="4" fill="#c2410c" opacity="0.5" />
      <ellipse cx="48" cy="28" rx="7" ry="5" fill="#c2410c" opacity="0.4" />
      <ellipse cx="26" cy="34" rx="5" ry="3" fill="#c2410c" opacity="0.5" />
      {/* Signature Hand-Crimped / Braided Crust Edge (Repulgue) */}
      <path d="M4,48 Q8,46 12,50 Q16,48 20,52 Q24,50 28,54 Q32,52 36,55 Q40,53 44,55 Q48,53 52,55 Q56,52 60,53 Q64,50 68,48" fill="none" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4,48 Q8,46 12,50 Q16,48 20,52 Q24,50 28,54 Q32,52 36,55 Q40,53 44,55 Q48,53 52,55 Q56,52 60,53 Q64,50 68,48" fill="none" stroke="#fed7aa" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    </g>
      </svg>
    ),
  },
  "batac_empanda_tobacco": {
    frame: "#b23b3b",
    bg: "#fdf0d5",
    top: "BATAC",
    topColor: "#b23b3b",
    bottom: "EMPANADA",
    bottomColor: "#c67d0a",
    renderArt: () => (
      <g>
{/* Spanish Brick Church facade */}
      <rect x="10" y="24" width="16" height="19" fill="#b23b3b" rx="1" />
      <polygon points="18,16 11,24 25,24" fill="#780000" />
      <path d="M 16 43 V 34 A 2 2 0 0 1 20 34 V 43 Z" fill="#fdf0d5" />
      {/* Bright Orange Batac Empanada */}
      <path d="M 23 35 Q 38 22 37 36 Q 30 40 23 35 Z" fill="#f77f00" stroke="#d62828" strokeWidth="0.8" />
      <path d="M 24 35 Q 37 23 36 36" stroke="#fcbf49" strokeWidth="0.8" strokeDasharray="1.5 1" fill="none" />
      {/* Tobacco leaf */}
      <path d="M 33 21 Q 38 15 36 25 Q 33 24 33 21 Z" fill="#556b2f" />
      </g>
    ),
  },
  "batangas_balisong": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "BATANGAS CITY",
    topColor: "#78350f",
    bottom: "KAPENG BARAKO",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Delicate Engraved Steam Rising Above */}
    <path d="M44,32 Q40,22 45,14 M50,30 Q54,20 49,12 M56,32 Q60,22 55,14" fill="none" stroke="#b45309" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />
    {/* Ground Shadow */}
    <ellipse cx="50" cy="88" rx="34" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Ceramic Saucer */}
    <ellipse cx="48" cy="80" rx="30" ry="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.1" />
    <ellipse cx="48" cy="80" rx="22" ry="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.6" />
    {/* Traditional Ceramic Cup of Dark Barako Coffee */}
    <path d="M30,46 L34,74 C34,77 42,79 48,79 C54,79 62,77 62,74 L66,46 Z" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
    {/* Cup Handle */}
    <path d="M65,50 C74,50 74,66 63,68" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M65,50 C74,50 74,66 63,68" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
    {/* Dark Surface of Steaming Barako Coffee */}
    <ellipse cx="48" cy="46" rx="18" ry="4.5" fill="#1c1917" stroke="#451a03" strokeWidth="1" />
    <ellipse cx="48" cy="46" rx="14" ry="3" fill="#292524" />
    <ellipse cx="45" cy="45" rx="4" ry="1.2" fill="#78350f" opacity="0.7" />
    {/* Several Coffee Beans Beside Cup */}
    <g transform="translate(64, 76)">
      <ellipse cx="6" cy="4" rx="4.5" ry="3" fill="#451a03" stroke="#1c1917" strokeWidth="0.7" transform="rotate(25 6 4)" />
      <path d="M4,2 Q6,4 8,6" stroke="#d97706" strokeWidth="0.6" fill="none" />
    </g>
    <g transform="translate(20, 78)">
      <ellipse cx="4" cy="4" rx="4.2" ry="2.8" fill="#451a03" stroke="#1c1917" strokeWidth="0.7" transform="rotate(-30 4 4)" />
      <path d="M2,5 Q4,4 6,3" stroke="#d97706" strokeWidth="0.6" fill="none" />
    </g>
      </svg>
    ),
  },
  "batangas_port_batel": {
    frame: "#1b263b",
    bg: "#e0e1dd",
    top: "BATANGAS",
    topColor: "#0d1b2a",
    bottom: "INTERNATIONAL PORT",
    bottomColor: "#e63946",
    renderArt: () => (
      <g>
{/* Batangas Bay deep waters */}
      <rect x="7" y="32" width="34" height="12" fill="#1b263b" />
      {/* Container Ship / Batel Sailboat */}
      <polygon points="12,32 36,32 32,37 16,37" fill="#e63946" />
      <rect x="18" y="27" width="12" height="5" fill="#415a77" />
      {/* White triangular sails of traditional Batel boat */}
      <polygon points="24,15 17,28 24,28" fill="#ffffff" />
      <polygon points="25,18 31,28 25,28" fill="#fdf0d5" />
      <line x1="24" y1="14" x2="24" y2="30" stroke="#0d1b2a" strokeWidth="1" />
      </g>
    ),
  },
  "bayawan_tawo_tawo": {
    frame: "#991b1b",
    bg: "#fef2f2",
    top: "BAYAWAN",
    topColor: "#991b1b",
    bottom: "WOVEN TEXTILE",
    bottomColor: "#991b1b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Antique Cultural Artifact Framing */}
    <rect x="14" y="16" width="72" height="88" rx="1" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1.3" />
    {/* Traditional Woven Textile Displayed Flat (Geometric Handwoven Patterns) */}
    <g id="bayawan-textile">
      {/* Outer Border Bands */}
      <rect x="18" y="20" width="64" height="80" fill="#991b1b" stroke="#facc15" strokeWidth="0.8" />
      {/* Repeating Geometric Diamond / Zigzag Rows */}
      <g stroke="#facc15" strokeWidth="1" fill="none">
        <path d="M20,32 L28,24 L36,32 L44,24 L52,32 L60,24 L68,32 L76,24 L80,28" />
        <path d="M20,38 L28,30 L36,38 L44,30 L52,38 L60,30 L68,38 L76,30 L80,34" />
        <path d="M20,82 L28,90 L36,82 L44,90 L52,82 L60,90 L68,82 L76,90 L80,86" />
      </g>
      {/* Central Intricate Ikat/Weft Diamond Medallion */}
      <polygon points="50,42 66,58 50,74 34,58" fill="#15803d" stroke="#facc15" strokeWidth="1.2" />
      <polygon points="50,48 60,58 50,68 40,58" fill="#facc15" stroke="#991b1b" strokeWidth="0.8" />
      <polygon points="50,54 54,58 50,62 46,58" fill="#7f1d1d" />
      {/* Thread Hatching Lines (Visible Handwoven Texture) */}
      <g stroke="#ffffff" strokeWidth="0.4" opacity="0.6">
        <line x1="22" y1="44" x2="32" y2="44" /><line x1="68" y1="44" x2="78" y2="44" />
        <line x1="22" y1="72" x2="32" y2="72" /><line x1="68" y1="72" x2="78" y2="72" />
      </g>
    </g>
      </svg>
    ),
  },
  "baybay_mount_pangasugan": {
    frame: "#831843",
    bg: "#fdf2f8",
    top: "BAYBAY",
    topColor: "#831843",
    bottom: "BAYBAY KAMOTE TUBER",
    bottomColor: "#831843",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Botanical Oval Ring */}
    <g opacity="0.25" stroke="#9d174d" strokeWidth="0.5">
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="baybay-sweet-potato" transform="translate(6, 10)">
      {/* Ground Shadow */}
      <ellipse cx="44" cy="74" rx="30" ry="5" fill="#1e293b" opacity="0.2" />

      {/* Main Large Sweet Potato Tuber (Lying diagonally from 20,70 to 68,34) */}
      <path d="
        M 16 72
        C 12 70, 16 64, 22 58
        C 30 50, 42 42, 54 36
        C 64 30, 74 32, 74 38
        C 74 46, 64 58, 50 68
        C 38 76, 24 78, 16 72 Z
      " fill="#9d174d" stroke="#500724" strokeWidth="1.3" />

      {/* Rich Earthy Skin Furrows & Shading */}
      <g stroke="#700720" strokeWidth="0.6" fill="none" opacity="0.75">
        <path d="M 24 64 Q 38 54 52 46" />
        <path d="M 30 70 Q 44 60 58 52" />
        <path d="M 36 72 Q 48 64 62 56" />
      </g>

      {/* Tiny Root Eyes & Fibrous Root Hairs */}
      <ellipse cx="32" cy="56" rx="1.5" ry="0.8" fill="#500724" />
      <ellipse cx="46" cy="48" rx="1.5" ry="0.8" fill="#500724" />
      <ellipse cx="58" cy="42" rx="1.5" ry="0.8" fill="#500724" />
      {/* Root hair strands on tapered tip */}
      <path d="M 16 72 Q 12 76 10 80" fill="none" stroke="#700720" strokeWidth="0.6" />
      <path d="M 18 74 Q 16 79 14 82" fill="none" stroke="#700720" strokeWidth="0.5" />
      <path d="M 74 36 Q 78 34 82 35" fill="none" stroke="#700720" strokeWidth="0.6" />

      {/* Round Cut Cross-Section Slice Resting Alongside */}
      <g id="cut-kamote-slice" transform="translate(18, 62)">
        <ellipse cx="14" cy="10" rx="11" ry="8" fill="#fef08a" stroke="#831843" strokeWidth="1.2" />
        {/* Purple Skin Rim of Slice */}
        <ellipse cx="14" cy="10" rx="11" ry="8" fill="none" stroke="#9d174d" strokeWidth="1.6" />
        {/* Concentric Inner Starch Growth Rings */}
        <ellipse cx="14" cy="10" rx="7.5" ry="5.5" fill="none" stroke="#fde047" strokeWidth="0.7" strokeDasharray="1.5 1" />
        <ellipse cx="14" cy="10" rx="4" ry="3" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
      </g>
    </g>
      </svg>
    ),
  },
  "bayugan_kahimunan_timber": {
    frame: "#14532d",
    bg: "#f0fdf4",
    top: "BAYUGAN",
    topColor: "#14532d",
    bottom: "RUBBER TREE",
    bottomColor: "#14532d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Backdrop */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Ground Line */}
    <ellipse cx="50" cy="94" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Rubber Tree Trunk with Spiral Tapping Groove & Latex Cup */}
    <g id="rubber-tree">
      {/* Sturdy Bark Trunk with Vertical Rough Bark Striations */}
      <path d="M38,16 L36,94 L64,94 L62,16 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.3" />
      <g stroke="#451a03" strokeWidth="0.6">
        <line x1="42" y1="18" x2="40" y2="92" /><line x1="48" y1="18" x2="48" y2="92" />
        <line x1="54" y1="18" x2="54" y2="92" /><line x1="58" y1="18" x2="60" y2="92" />
      </g>
      {/* Spiral Incision / Tapping Groove Channel */}
      <path d="M40,32 Q50,42 56,54" fill="none" stroke="#1c0702" strokeWidth="2" />
      {/* Fresh White Latex Stream Flowing in Groove */}
      <path d="M40,33 Q50,43 56,54" fill="none" stroke="#ffffff" strokeWidth="1" />
      <line x1="56" y1="54" x2="56" y2="62" stroke="#ffffff" strokeWidth="1.2" />
      {/* Metal Spout Chute */}
      <polygon points="54,54 58,54 57,60 55,60" fill="#94a3b8" stroke="#334155" strokeWidth="0.6" />
      {/* Clay Collection Cup (Coconutshell / Ceramic Cup) Tied to Trunk */}
      <path d="M50,62 L64,62 C64,74 50,74 50,62 Z" fill="#92400e" stroke="#451a03" strokeWidth="1" />
      {/* White Liquid Latex Pool inside Cup */}
      <ellipse cx="57" cy="63" rx="6" ry="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      {/* Wire Cup Hanger Tied around Trunk */}
      <path d="M36,66 Q50,70 64,66" fill="none" stroke="#64748b" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "binan_alberto_mansion": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "BIÑAN",
    topColor: "#a16207",
    bottom: "BAMBOO CRAFT",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Radial Frame */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Ground Shadow */}
    <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Finely Woven Bamboo Basket (Interlocking Strips & Rounded Rim) */}
    <g id="bamboo-basket" transform="translate(18, 30)">
      {/* Basket Base Body */}
      <path d="M6,22 L12,48 C14,54 26,56 32,56 C38,56 50,54 52,48 L58,22 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
      {/* Rounded Woven Bamboo Rim */}
      <ellipse cx="32" cy="22" rx="26" ry="6" fill="#fef08a" stroke="#854d0e" strokeWidth="1.3" />
      <ellipse cx="32" cy="22" rx="22" ry="4" fill="#ca8a04" stroke="#78350f" strokeWidth="0.7" />
      {/* Woven Interlocking Strips Cross-Hatching */}
      <g stroke="#78350f" strokeWidth="0.7" opacity="0.85">
        {/* Diagonal Strips Left-to-Right */}
        <line x1="8" y1="28" x2="22" y2="52" /><line x1="16" y1="26" x2="30" y2="55" />
        <line x1="26" y1="26" x2="38" y2="55" /><line x1="36" y1="26" x2="48" y2="52" />
        <line x1="46" y1="26" x2="54" y2="44" />
        {/* Diagonal Strips Right-to-Left */}
        <line x1="56" y1="28" x2="42" y2="52" /><line x1="48" y1="26" x2="34" y2="55" />
        <line x1="38" y1="26" x2="26" y2="55" /><line x1="28" y1="26" x2="16" y2="52" />
        <line x1="18" y1="26" x2="10" y2="44" />
        {/* Horizontal Binding Bands */}
        <path d="M9,32 Q32,38 55,32" fill="none" stroke="#fef08a" strokeWidth="1" />
        <path d="M11,42 Q32,48 53,42" fill="none" stroke="#fef08a" strokeWidth="1" />
      </g>
    </g>
      </svg>
    ),
  },
  "binan_puto_rizal": {
    frame: "#c57b57",
    bg: "#f7ede2",
    top: "BIÑAN",
    topColor: "#c57b57",
    bottom: "PUTO LATIK",
    bottomColor: "#7f4f24",
    renderArt: () => (
      <g>
{/* Steamed Puto Biñan platter */}
      <ellipse cx="24" cy="33" rx="13" ry="5.5" fill="#dda15e" stroke="#7f4f24" strokeWidth="0.8" />
      {/* White & Golden Puto rice cakes */}
      <circle cx="18" cy="32" r="3.2" fill="#ffffff" stroke="#c57b57" strokeWidth="0.5" />
      <circle cx="24" cy="30" r="3.5" fill="#fefae0" stroke="#c57b57" strokeWidth="0.5" />
      <circle cx="30" cy="32" r="3.2" fill="#ffffff" stroke="#c57b57" strokeWidth="0.5" />
      {/* Cheese toppings */}
      <rect x="22.5" y="29.5" width="3" height="1" fill="#facc15" />
      <rect x="16.5" y="31.5" width="3" height="1" fill="#facc15" />
      <rect x="28.5" y="31.5" width="3" height="1" fill="#facc15" />
      {/* Young Rizal schoolhouse arch */}
      <path d="M 16 23 V 15 A 8 8 0 0 1 32 15 V 23" stroke="#7f4f24" strokeWidth="1.2" fill="none" />
      </g>
    ),
  },
  "bislig_tinuy_an_falls": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "BISLIG",
    topColor: "#047857",
    bottom: "TINUY-AN FALLS",
    bottomColor: "#047857",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Broad Multi-Tiered Tinuy-an Waterfall (Curtain of Water across Rugged Rock) */}
    {/* Canyon Backdrop */}
    <rect x="12" y="18" width="76" height="86" fill="#064e3b" stroke="#022c22" strokeWidth="1.3" />
    {/* Upper Rock Ledge */}
    <rect x="12" y="38" width="76" height="6" fill="#022c22" />
    {/* Broad Curtain Cascade (Tier 1) */}
    <rect x="22" y="18" width="56" height="20" fill="#e0f2fe" opacity="0.9" />
    <g stroke="#ffffff" strokeWidth="0.7">
      <line x1="26" y1="18" x2="26" y2="38" /><line x1="34" y1="18" x2="34" y2="38" />
      <line x1="42" y1="18" x2="42" y2="38" /><line x1="50" y1="18" x2="50" y2="38" />
      <line x1="58" y1="18" x2="58" y2="38" /><line x1="66" y1="18" x2="66" y2="38" />
      <line x1="74" y1="18" x2="74" y2="38" />
    </g>
    {/* Mid Tier Intermediate Basin */}
    <ellipse cx="50" cy="42" rx="36" ry="3" fill="#0d9488" />
    {/* Lower Grand Broad Curtain (Wide Niagara-Style Fan across Entire Width) */}
    <rect x="16" y="44" width="68" height="42" fill="#e0f2fe" opacity="0.9" />
    <g stroke="#ffffff" strokeWidth="0.8">
      <line x1="20" y1="44" x2="18" y2="86" /><line x1="28" y1="44" x2="26" y2="86" />
      <line x1="36" y1="44" x2="35" y2="86" /><line x1="44" y1="44" x2="44" y2="86" />
      <line x1="52" y1="44" x2="53" y2="86" /><line x1="60" y1="44" x2="62" y2="86" />
      <line x1="68" y1="44" x2="70" y2="86" /><line x1="76" y1="44" x2="80" y2="86" />
    </g>
    {/* Plunge Pool and Mist Foam */}
    <rect x="12" y="86" width="76" height="18" fill="#0f766e" />
    <ellipse cx="50" cy="88" rx="34" ry="4" fill="#ffffff" opacity="0.7" />
      </svg>
    ),
  },
  "bogo_san_vicente": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "BOGO",
    topColor: "#0369a1",
    bottom: "SPANISH MACKEREL",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<path d="M12,42 C30,40 70,44 88,42 M14,74 C35,72 65,75 86,74" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
    {/* One Spanish Mackerel (Tanigue) in Side Profile in Scientific Marine Engraving */}
    <g id="mackerel-fish" transform="translate(10, 34)">
      {/* Long Slender Streamlined Body */}
      <path d="M14,24 C22,16 46,14 62,18 C70,21 74,24 68,26 C62,28 44,32 26,30 C18,28 14,26 14,24 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.3" />
      {/* Metallic Blue-Green Dorsal Shading */}
      <path d="M18,22 C26,16 46,15 60,19 L58,22 C44,18 26,19 18,22 Z" fill="#0284c7" />
      {/* Forked Tail and Finlets */}
      <polygon points="68,24 80,14 75,24 80,34" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.9" />
      <polygon points="36,15 44,8 48,16" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.8" />
      <polygon points="26,27 22,34 30,29" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.8" />
      {/* Sharp Predatory Head, Mouth, and Eye */}
      <polygon points="14,24 8,24 16,21" fill="#cbd5e1" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="17" cy="22" r="1.8" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="16.8" cy="22" r="0.9" fill="#0f172a" />
      {/* Wavy Tiger Stripe Markings along Flank */}
      <g stroke="#0369a1" strokeWidth="0.7">
        <line x1="32" y1="18" x2="31" y2="26" /><line x1="38" y1="18" x2="37" y2="27" />
        <line x1="44" y1="19" x2="43" y2="27" /><line x1="50" y1="20" x2="49" y2="27" />
        <line x1="56" y1="21" x2="55" y2="26" />
      </g>
    </g>
      </svg>
    ),
  },
  "borongan_pacific_surf": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "BORONGAN",
    topColor: "#0369a1",
    bottom: "PACIFIC SUNRISE",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<g id="borongan-pacific-dawn">
      {/* Radiating Sun Rays Across Morning Sky */}
      <g stroke="#f59e0b" strokeWidth="0.8" opacity="0.65">
        <line x1="50" y1="52" x2="50" y2="10" />
        <line x1="50" y1="52" x2="20" y2="16" />
        <line x1="50" y1="52" x2="80" y2="16" />
        <line x1="50" y1="52" x2="10" y2="30" />
        <line x1="50" y1="52" x2="90" y2="30" />
        <line x1="50" y1="52" x2="10" y2="46" />
        <line x1="50" y1="52" x2="90" y2="46" />
      </g>

      {/* Dawn Sky Horizon Gradient */}
      <rect x="8" y="10" width="84" height="42" fill="#fef3c7" opacity="0.4" />

      {/* Brilliant Circular Golden Sun Cresting Ocean Horizon */}
      <circle cx="50" cy="52" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
      <circle cx="50" cy="52" r="10" fill="#fef08a" />
      <circle cx="50" cy="52" r="6" fill="#ffffff" />

      {/* Ocean Horizon Line */}
      <line x1="8" y1="52" x2="92" y2="52" stroke="#0284c7" strokeWidth="1.2" />

      {/* Vast Pacific Ocean Swell & Rhythmic Horizontal Water Lines */}
      <g stroke="#0369a1" strokeWidth="0.8">
        <line x1="10" y1="56" x2="90" y2="56" />
        <line x1="12" y1="61" x2="88" y2="61" />
        <line x1="10" y1="67" x2="90" y2="67" />
        <line x1="14" y1="74" x2="86" y2="74" />
        <line x1="12" y1="82" x2="88" y2="82" />
        <line x1="16" y1="91" x2="84" y2="91" />
      </g>

      {/* Shimmering Pillar of Reflected Sunlight on Water Surface */}
      <g fill="#fde047" opacity="0.85">
        <polygon points="46,52 54,52 56,58 44,58" />
        <polygon points="43,60 57,60 59,67 41,67" />
        <polygon points="40,69 60,69 62,77 38,77" />
        <polygon points="36,79 64,79 66,88 34,88" />
      </g>

      {/* Low Dark Jagged Pacific Reef Rock Silhouette (Framing Lower-Left) */}
      <path d="M 8 78 L 18 74 L 26 77 L 34 72 L 40 82 L 42 98 L 8 98 Z" fill="#0f172a" stroke="#020617" strokeWidth="1.0" />
      <path d="M 12 79 L 20 76 L 24 82" fill="none" stroke="#334155" strokeWidth="0.6" />
    </g>
      </svg>
    ),
  },
  "bunawan_lolong_crocodile": {
    frame: "#14532d",
    bg: "#f0fdf4",
    top: "BUNAWAN",
    topColor: "#14532d",
    bottom: "PHILIPPINE CROCODILE",
    bottomColor: "#14532d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<line x1="12" y1="84" x2="88" y2="84" stroke="#16a34a" strokeWidth="0.6" strokeDasharray="2 1.5" />
    <ellipse cx="50" cy="86" rx="36" ry="3.5" fill="#0f172a" opacity="0.2" />
    {/* Philippine Crocodile (Lolong Heritage) in Powerful Side Profile */}
    <g id="crocodile-profile" transform="translate(10, 32)">
      {/* Massive Low-Slung Muscular Armored Body */}
      <path d="M12,42 C18,36 34,34 56,36 C68,38 74,44 78,48 C72,50 64,52 48,52 C32,52 18,50 12,42 Z" fill="#15803d" stroke="#052e16" strokeWidth="1.3" />
      {/* Long Powerful Tapered Tail with Dorsal Scutes */}
      <path d="M12,42 C6,44 2,48 2,52 C8,50 16,48 20,48 Z" fill="#14532d" stroke="#052e16" strokeWidth="1.1" />
      <polygon points="4,45 8,40 12,44" fill="#052e16" /><polygon points="12,43 16,38 20,42" fill="#052e16" />
      {/* Long Snout, Jaws, and Exposed Teeth */}
      <path d="M56,36 L76,38 L78,44 L58,44 Z" fill="#166534" stroke="#052e16" strokeWidth="1.1" />
      {/* Nostril bump & Eye Ridge */}
      <circle cx="74" cy="38" r="1.5" fill="#052e16" />
      <polygon points="58,35 62,31 66,35" fill="#14532d" />
      <circle cx="62" cy="34" r="1" fill="#facc15" />
      {/* Conical Exposed Teeth along Jaw */}
      <polygon points="64,44 65,46 66,44" fill="#ffffff" />
      <polygon points="70,44 71,46 72,44" fill="#ffffff" />
      {/* Sturdy Clawed Limbs (Foreleg & Hindleg) */}
      <path d="M30,48 L28,60 L36,60 L34,48 Z" fill="#14532d" stroke="#052e16" strokeWidth="0.9" />
      <path d="M52,46 L50,60 L58,60 L56,46 Z" fill="#14532d" stroke="#052e16" strokeWidth="0.9" />
      {/* Dorsal Osteoderms / Raised Armored Scutes along Back */}
      <g fill="#052e16">
        <polygon points="26,35 28,31 32,35" /><polygon points="34,35 36,31 40,35" />
        <polygon points="42,35 44,31 48,35" /><polygon points="50,36 52,32 56,36" />
      </g>
    </g>
      </svg>
    ),
  },
  "butuan_balangay": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "BUTUAN",
    topColor: "#78350f",
    bottom: "BALANGAY BOAT",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Archaeological Maritime Water Horizon */}
    <line x1="10" y1="80" x2="90" y2="80" stroke="#0284c7" strokeWidth="0.8" />
    <path d="M12,86 C30,84 70,88 88,86 M16,92 C35,90 65,94 84,92" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 1.5" />
    {/* One Historic Edge-Pegged Balangay Boat in Side Profile (Archaeological Specimen) */}
    <g id="balangay-boat" transform="translate(10, 28)">
      {/* Distinctive Sweeping Double-Ended Carvel-Built Wooden Hull */}
      <path d="M4,34 C12,48 24,54 40,54 C56,54 68,48 76,34 L72,36 C64,46 54,50 40,50 C26,50 16,46 8,36 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.4" />
      {/* Individual Stitched Wooden Planks (Planking Lines & Dowels) */}
      <path d="M6,36 C16,46 26,48 40,48 C54,48 64,46 74,36" fill="none" stroke="#451a03" strokeWidth="0.9" />
      <path d="M9,41 C18,48 28,51 40,51 C52,51 62,48 71,41" fill="none" stroke="#451a03" strokeWidth="0.8" />
      {/* Traditional Bipod / Tripod Bamboo Mast */}
      <line x1="36" y1="48" x2="40" y2="8" stroke="#451a03" strokeWidth="1.3" />
      <line x1="44" y1="48" x2="40" y2="8" stroke="#451a03" strokeWidth="1.3" />
      {/* Square Woven Tanja Palm Sail (Furl / Rigging) */}
      <rect x="26" y="12" width="28" height="22" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
      <line x1="26" y1="12" x2="54" y2="12" stroke="#451a03" strokeWidth="1.1" />
      <line x1="26" y1="34" x2="54" y2="34" stroke="#451a03" strokeWidth="1.1" />
      {/* Outrigger Booms & Bamboo Float (Katig) */}
      <line x1="20" y1="46" x2="16" y2="56" stroke="#451a03" strokeWidth="1.1" />
      <line x1="60" y1="46" x2="64" y2="56" stroke="#451a03" strokeWidth="1.1" />
      <rect x="12" y="55" width="56" height="3" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "cabadbaran_hilong_hilong": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "CABADBARAN",
    topColor: "#ca8a04",
    bottom: "RICE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#eab308" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Rice Panicle Bending Under Grains in Botanical Detail */}
    <g id="cabadbaran-rice">
      <path d="M68,102 Q64,66 48,40 Q38,24 22,28" fill="none" stroke="#854d0e" strokeWidth="1.5" strokeLinecap="round" />
      <g fill="#fde047" stroke="#854d0e" strokeWidth="0.6">
        <ellipse cx="25" cy="30" rx="3" ry="5.5" transform="rotate(-65 25 30)" />
        <ellipse cx="30" cy="35" rx="3" ry="5.5" transform="rotate(-50 30 35)" />
        <ellipse cx="36" cy="42" rx="3" ry="5.5" transform="rotate(-40 36 42)" />
        <ellipse cx="42" cy="50" rx="3" ry="5.5" transform="rotate(-30 42 50)" />
        <ellipse cx="48" cy="60" rx="3" ry="5.5" transform="rotate(-20 48 60)" />
        <ellipse cx="54" cy="72" rx="3" ry="5.5" transform="rotate(-15 54 72)" />
        <ellipse cx="58" cy="84" rx="3" ry="5.5" transform="rotate(-10 58 84)" />
        <ellipse cx="32" cy="27" rx="2.8" ry="5.2" transform="rotate(-75 32 27)" />
        <ellipse cx="38" cy="34" rx="2.8" ry="5.2" transform="rotate(-60 38 34)" />
        <ellipse cx="45" cy="42" rx="2.8" ry="5.2" transform="rotate(-45 45 42)" />
        <ellipse cx="52" cy="52" rx="2.8" ry="5.2" transform="rotate(-35 52 52)" />
      </g>
    </g>
      </svg>
    ),
  },
    "cabanatuan_tricycle": {
    frame: "#334155",
    bg: "#f8fafc",
    top: "CABANATUAN",
    topColor: "#334155",
    bottom: "PHILIPPINE CARABAO",
    bottomColor: "#334155",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/cabanatuan_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "cabuyao_enterprise": {
    frame: "#1d3557",
    bg: "#f1faee",
    top: "CABUYAO",
    topColor: "#1d3557",
    bottom: "ENTERPRISE CITY",
    bottomColor: "#2a9d8f",
    renderArt: () => (
      <g>
{/* Enterprise Industrial Cogwheels */}
      <circle cx="20" cy="27" r="7" fill="#457b9d" />
      <circle cx="20" cy="27" r="3" fill="#f1faee" />
      <circle cx="29" cy="33" r="5.5" fill="#e63946" />
      <circle cx="29" cy="33" r="2.5" fill="#f1faee" />
      {/* Laguna de Bay fishing banca */}
      <polygon points="12,41 36,41 32,44 16,44" fill="#1d3557" />
      <line x1="24" y1="36" x2="24" y2="41" stroke="#1d3557" strokeWidth="1" />
      </g>
    ),
  },
  "cabuyao_golden_bell": {
    frame: "#15803d",
    bg: "#fefce8",
    top: "CABUYAO",
    topColor: "#15803d",
    bottom: "CABUYAO COCONUT CLUSTER",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Frame Backdrop Lines */}
    <g opacity="0.25" stroke="#166534" strokeWidth="0.5">
      <circle cx="50" cy="58" r="36" fill="none" strokeDasharray="3 2" />
      <circle cx="50" cy="58" r="32" fill="none" strokeDasharray="1 2" />
    </g>

    <g id="coconut-fruit-cluster" transform="translate(6, 6)">
      {/* Main Thick Fibrous Palm Fruit Stalk (Spadix branch) */}
      <path d="M 40 12 Q 42 24 44 38 L 40 38 Q 38 24 36 12 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1.2" />
      {/* Secondary branching pedicels */}
      <path d="M 38 26 Q 28 32 24 38" fill="none" stroke="#713f12" strokeWidth="1.8" />
      <path d="M 42 28 Q 54 34 60 42" fill="none" stroke="#713f12" strokeWidth="1.8" />
      <path d="M 40 34 Q 42 42 42 48" fill="none" stroke="#713f12" strokeWidth="1.8" />

      {/* Coconut 1: Left Upper Coconut (Smooth green/amber husk) */}
      <g id="coconut-left">
        {/* Calyx Cap */}
        <polygon points="22,36 26,38 24,42 20,40" fill="#4d7c0f" stroke="#365314" strokeWidth="0.8" />
        {/* Oval Body */}
        <path d="M 22 38 C 12 40, 8 52, 12 62 C 16 70, 26 72, 32 64 C 38 54, 34 42, 22 38 Z" fill="#65a30d" stroke="#365314" strokeWidth="1.1" />
        {/* Husk angular facets & fibrous hatching */}
        <path d="M 14 50 Q 22 54 28 52" fill="none" stroke="#365314" strokeWidth="0.6" opacity="0.7" />
        <path d="M 16 58 Q 24 62 30 58" fill="none" stroke="#365314" strokeWidth="0.6" opacity="0.7" />
      </g>

      {/* Coconut 2: Right Upper Coconut */}
      <g id="coconut-right">
        {/* Calyx Cap */}
        <polygon points="58,40 62,42 60,46 56,44" fill="#4d7c0f" stroke="#365314" strokeWidth="0.8" />
        {/* Oval Body */}
        <path d="M 58 42 C 68 44, 74 56, 70 66 C 66 74, 54 74, 48 66 C 44 56, 48 44, 58 42 Z" fill="#84cc16" stroke="#365314" strokeWidth="1.1" />
        <path d="M 64 52 Q 58 56 52 54" fill="none" stroke="#365314" strokeWidth="0.6" opacity="0.7" />
        <path d="M 66 60 Q 58 64 52 60" fill="none" stroke="#365314" strokeWidth="0.6" opacity="0.7" />
      </g>

      {/* Coconut 3: Dominant Center Bottom Mature Coconut (Partially Husks Exposed) */}
      <g id="coconut-center-exposed">
        {/* Calyx Attachment */}
        <polygon points="40,46 45,46 44,51 39,51" fill="#713f12" stroke="#451a03" strokeWidth="0.8" />
        {/* Outer Fibrous Husk Contour */}
        <path d="
          M 42 48
          C 28 52, 24 68, 28 80
          C 32 90, 48 94, 56 86
          C 66 76, 64 58, 48 50 Z
        " fill="#a16207" stroke="#451a03" strokeWidth="1.3" />

        {/* Coir Fiber Texture Lines along Husk */}
        <g stroke="#713f12" strokeWidth="0.6" opacity="0.75">
          <path d="M 32 58 Q 30 70 34 80" fill="none" />
          <path d="M 38 54 Q 36 72 40 84" fill="none" />
          <path d="M 56 56 Q 58 70 54 80" fill="none" />
        </g>

        {/* Cut/Exposed Section Showing Hard Inner Shell (Bao) */}
        <ellipse cx="44" cy="72" rx="11" ry="11" fill="#451a03" stroke="#1c0702" strokeWidth="1.1" />
        {/* Shell Polish Highlight and 3 Germination Eyes */}
        <ellipse cx="43" cy="71" rx="8" ry="8" fill="#58240c" />
        <circle cx="41" cy="67" r="1.1" fill="#1c0702" />
        <circle cx="45" cy="67" r="1.1" fill="#1c0702" />
        <circle cx="43" cy="70" r="1.3" fill="#1c0702" />
        {/* Cross-hatched Fibers radiating around the shell rim */}
        <path d="M 33 72 L 30 72 M 55 72 L 58 72 M 44 61 L 44 58 M 44 83 L 44 86" stroke="#ca8a04" strokeWidth="0.7" />
      </g>
    </g>
      </svg>
    ),
  },
  "cadiz_dinagsa_whales": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "CADIZ",
    topColor: "#0369a1",
    bottom: "BLUE SWIMMING CRAB",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Marine Specimen Aura */}
    <g opacity="0.25" stroke="#0284c7" strokeWidth="0.5">
      <ellipse cx="50" cy="60" rx="38" ry="34" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="blue-swimming-crab" transform="translate(50, 60)">
      {/* Symmetrical Dorsal View of Portunus Pelagicus */}

      {/* 3 Pairs of Jointed Slender Walking Legs */}
      {/* Left Walking Legs */}
      <g stroke="#0369a1" strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M -16 -4 L -28 -10 L -38 -6 L -44 2" />
        <path d="M -16 4 L -29 6 L -39 14 L -43 24" />
        <path d="M -15 12 L -27 18 L -36 28 L -38 38" />
      </g>
      {/* Right Walking Legs */}
      <g stroke="#0369a1" strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M 16 -4 L 28 -10 L 38 -6 L 44 2" />
        <path d="M 16 4 L 29 6 L 39 14 L 43 24" />
        <path d="M 15 12 L 27 18 L 36 28 L 38 38" />
      </g>

      {/* Rear Pair of Paddle-Shaped Swimming Legs (Oar-Feet) */}
      {/* Left Paddle */}
      <path d="M -12 18 L -22 26 L -30 36" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="-32" cy="38" rx="7" ry="4" transform="rotate(-30 -32 38)" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.0" />
      {/* Right Paddle */}
      <path d="M 12 18 L 22 26 L 30 36" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="32" cy="38" rx="7" ry="4" transform="rotate(30 32 38)" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.0" />

      {/* Two Large Elongated Chelipeds (Claws) Reaching Forward */}
      {/* Left Claw Arm & Pincer */}
      <path d="M -16 -10 L -26 -22 L -24 -36" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
      {/* Left Cheliped Hand & Blue Pincer */}
      <path d="M -26 -34 L -22 -44 L -18 -36 Z" fill="#0284c7" stroke="#0c4a6e" strokeWidth="0.9" />
      <path d="M -22 -44 Q -20 -48 -18 -44" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M -22 -44 Q -25 -48 -24 -42" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />

      {/* Right Claw Arm & Pincer */}
      <path d="M 16 -10 L 26 -22 L 24 -36" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 26 -34 L 22 -44 L 18 -36 Z" fill="#0284c7" stroke="#0c4a6e" strokeWidth="0.9" />
      <path d="M 22 -44 Q 20 -48 18 -44" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 22 -44 Q 25 -48 24 -42" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />

      {/* Broad Flattened Spindle Carapace with Sharp Lateral Spines */}
      <path d="
        M 0 -16
        C 10 -16, 20 -12, 34 -4
        L 42 -2
        C 34 4, 26 14, 18 20
        C 10 24, -10 24, -18 20
        C -26 14, -34 4, -42 -2
        L -34 -4
        C -20 -12, -10 -16, 0 -16 Z
      " fill="#0369a1" stroke="#082f49" strokeWidth="1.3" />

      {/* Frontal Serrated Margin & Eyestalks */}
      <circle cx="-6" cy="-17" r="1.5" fill="#0f172a" />
      <circle cx="6" cy="-17" r="1.5" fill="#0f172a" />
      {/* Serrations between eyes */}
      <polygon points="-4,-16 -2,-18 0,-16 2,-18 4,-16" fill="#38bdf8" />

      {/* Mottled Shell Texture & Carapace Ridges */}
      <path d="M -12 -4 Q 0 -2 12 -4" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
      <path d="M -8 6 Q 0 8 8 6" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
      <circle cx="-10" cy="-6" r="1.2" fill="#bae6fd" />
      <circle cx="10" cy="-6" r="1.2" fill="#bae6fd" />
      <circle cx="0" cy="2" r="1.4" fill="#bae6fd" />
    </g>
      </svg>
    ),
  },
  "calaca_atchara": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "CALACA",
    topColor: "#78350f",
    bottom: "COCONUT",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Backdrop */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#a16207" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Mature Coconut with Fibrous Husk Partially Opened */}
    <g id="botanical-coconut" transform="translate(18, 28)">
      {/* Outer Fibrous Husk Layers (Peeling Open) */}
      <path d="M8,36 C8,16 20,4 32,4 C44,4 56,16 56,36 C56,52 46,62 32,62 C18,62 8,52 8,36 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1.3" />
      {/* Fibrous Striations */}
      <path d="M12,30 C12,18 20,8 32,8 M16,40 C16,22 24,12 32,12 M52,30 C52,18 44,8 32,8 M48,40 C48,22 40,12 32,12" fill="none" stroke="#ca8a04" strokeWidth="0.6" />
      {/* Peeling Husk Flaps */}
      <path d="M8,26 C2,34 4,46 12,50 L16,42 Z" fill="#a16207" stroke="#451a03" strokeWidth="0.8" />
      <path d="M56,26 C62,34 60,46 52,50 L48,42 Z" fill="#a16207" stroke="#451a03" strokeWidth="0.8" />
      {/* Exposed Hard Brown Inner Shell (Nut) with 3 Eyes */}
      <circle cx="32" cy="38" r="15" fill="#451a03" stroke="#1c0702" strokeWidth="1.2" />
      <circle cx="28" cy="34" r="2.2" fill="#1c0702" />
      <circle cx="36" cy="34" r="2.2" fill="#1c0702" />
      <circle cx="32" cy="42" r="2" fill="#1c0702" />
      {/* Fine Botanical Shading on Shell */}
      <path d="M22,38 C22,46 28,50 34,51" fill="none" stroke="#78350f" strokeWidth="0.7" />
    </g>
      </svg>
    ),
  },
  "calaca_energy": {
    frame: "#e76f51",
    bg: "#f4f1de",
    top: "CALACA",
    topColor: "#e76f51",
    bottom: "BATANGAS",
    bottomColor: "#264653",
    renderArt: () => (
      <g>
{/* Thermal Energy cooling towers & transmission pylons */}
      <path d="M 14 42 Q 17 31 16 24 H 22 Q 21 31 24 42 Z" fill="#264653" />
      <path d="M 24 42 Q 27 33 26 27 H 31 Q 30 33 33 42 Z" fill="#457b9d" />
      {/* Clean energy steam plumes */}
      <ellipse cx="19" cy="20" rx="4" ry="2.5" fill="#ffffff" opacity="0.8" />
      <ellipse cx="28.5" cy="23" rx="3.5" ry="2" fill="#ffffff" opacity="0.8" />
      <circle cx="34" cy="18" r="4.5" fill="#e76f51" />
      </g>
    ),
  },
  "calamba_rizal_shrine": {
    frame: "#7c2d12",
    bg: "#fef7ee",
    top: "CALAMBA",
    topColor: "#7c2d12",
    bottom: "ANCESTRAL HOUSE",
    bottomColor: "#7c2d12",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Architectural Sunburst Rays */}
    <circle cx="50" cy="52" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Frontal Historic Ancestral House Architecture */}
    <g id="ancestral-house" transform="translate(14, 24)">
      {/* Massive Clay Tile Hip Roof (Tejas de Barro) */}
      <polygon points="36,4 4,26 68,26" fill="#c2410c" stroke="#7c2d12" strokeWidth="1.3" />
      {/* Tile rows hatching */}
      <line x1="12" y1="20" x2="60" y2="20" stroke="#7c2d12" strokeWidth="0.7" />
      <line x1="20" y1="14" x2="52" y2="14" stroke="#7c2d12" strokeWidth="0.7" />
      <line x1="28" y1="8" x2="44" y2="8" stroke="#7c2d12" strokeWidth="0.7" />
      {/* Upper Floor Hardwood Construction (Wood Siding & Sliding Capiz Windows) */}
      <rect x="8" y="26" width="56" height="24" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
      {/* Four Sliding Capiz Windows with Ventanillas */}
      <g fill="#fefce8" stroke="#451a03" strokeWidth="0.7">
        <rect x="12" y="29" width="10" height="12" /><rect x="24" y="29" width="10" height="12" />
        <rect x="38" y="29" width="10" height="12" /><rect x="50" y="29" width="10" height="12" />
        {/* Window Panes */}
        <line x1="17" y1="29" x2="17" y2="41" /><line x1="29" y1="29" x2="29" y2="41" />
        <line x1="43" y1="29" x2="43" y2="41" /><line x1="55" y1="29" x2="55" y2="41" />
        {/* Ventanillas grillwork below windows */}
        <rect x="12" y="43" width="10" height="5" fill="#451a03" />
        <rect x="24" y="43" width="10" height="5" fill="#451a03" />
        <rect x="38" y="43" width="10" height="5" fill="#451a03" />
        <rect x="50" y="43" width="10" height="5" fill="#451a03" />
      </g>
      {/* Lower Ground Floor (Stone/Masonry Piedra China Base) */}
      <rect x="8" y="50" width="56" height="22" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
      {/* Arched Heavy Wooden Double Doors */}
      <path d="M31,72 L31,58 C31,54 41,54 41,58 L41,72 Z" fill="#451a03" stroke="#1e293b" strokeWidth="0.9" />
      {/* Side Stone Arch Windows */}
      <rect x="14" y="56" width="8" height="10" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="0.7" />
      <rect x="50" y="56" width="8" height="10" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="0.7" />
    </g>
      </svg>
    ),
  },
  "calapan_halcon": {
    frame: "#155e75",
    bg: "#e0f2fe",
    top: "CALAPAN",
    topColor: "#155e75",
    bottom: "MOUNT HALCON",
    bottomColor: "#15803d",
    renderArt: () => (
      <g>
{/* Mount Halcon Rugged Peak */}
      <polygon points="7,36 24,17 41,36" fill="#155e75" />
      <polygon points="14,36 24,22 34,36" fill="#0e7490" />
      {/* Mangrove waterways */}
      <rect x="7" y="36" width="34" height="8" fill="#15803d" />
      <path d="M 7 40 Q 24 37 41 40" stroke="#38bdf8" strokeWidth="1.2" fill="none" />
      <circle cx="33" cy="19" r="4.5" fill="#facc15" />
      </g>
    ),
  },
    "calapan_tamaraw": {
    frame: "#065f46",
    bg: "#a89f91",
    top: "CALAPAN",
    topColor: "#065f46",
    bottom: "MINDORO TAMARAW",
    bottomColor: "#065f46",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/calapan_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "calbayog_tarangban_falls": {
    frame: "#0f766e",
    bg: "#f0fdfa",
    top: "CALBAYOG",
    topColor: "#0f766e",
    bottom: "TARANGBAN FALLS",
    bottomColor: "#0f766e",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Vertical Border Hatching */}
    <g opacity="0.25" stroke="#0d9488" strokeWidth="0.5">
      <line x1="12" y1="12" x2="12" y2="96" strokeDasharray="3 2" />
      <line x1="88" y1="12" x2="88" y2="96" strokeDasharray="3 2" />
    </g>

    <g id="tarangban-falls-cascade">
      {/* Flanking Stratified Volcanic Rock Walls (Left & Right) */}
      {/* Left Rock Wall */}
      <path d="M 8 10 L 32 10 L 30 28 L 36 44 L 28 64 L 32 82 L 8 82 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.1" />
      {/* Left Rock Texture & Ferns */}
      <g stroke="#334155" strokeWidth="0.6">
        <line x1="10" y1="20" x2="28" y2="20" />
        <line x1="12" y1="38" x2="32" y2="38" />
        <line x1="10" y1="56" x2="26" y2="56" />
      </g>
      <path d="M 28 26 Q 34 24 32 30" fill="none" stroke="#22c55e" strokeWidth="1.0" />
      <path d="M 26 62 Q 32 60 30 66" fill="none" stroke="#22c55e" strokeWidth="1.0" />

      {/* Right Rock Wall */}
      <path d="M 92 10 L 68 10 L 70 28 L 64 44 L 72 64 L 68 82 L 92 82 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.1" />
      <g stroke="#334155" strokeWidth="0.6">
        <line x1="72" y1="20" x2="90" y2="20" />
        <line x1="68" y1="38" x2="88" y2="38" />
        <line x1="74" y1="56" x2="90" y2="56" />
      </g>
      <path d="M 72 26 Q 66 24 68 30" fill="none" stroke="#22c55e" strokeWidth="1.0" />
      <path d="M 74 62 Q 68 60 70 66" fill="none" stroke="#22c55e" strokeWidth="1.0" />

      {/* Tier 1: Broad Upper Cascade */}
      <path d="M 32 10 L 68 10 L 66 32 L 34 32 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
      <g stroke="#ffffff" strokeWidth="0.8">
        <line x1="38" y1="12" x2="38" y2="30" />
        <line x1="44" y1="10" x2="44" y2="32" />
        <line x1="50" y1="10" x2="50" y2="32" />
        <line x1="56" y1="10" x2="56" y2="32" />
        <line x1="62" y1="12" x2="62" y2="30" />
      </g>

      {/* Intermediate Rock Shelf 1 */}
      <polygon points="30,32 70,32 66,38 34,38" fill="#0f172a" stroke="#020617" strokeWidth="0.8" />

      {/* Tier 2: Braided Intermediate Torrents Splitting Over Rocky Tiers */}
      <path d="M 34 38 L 66 38 L 62 60 L 38 60 Z" fill="#e0f2fe" />
      <g stroke="#0284c7" strokeWidth="1.2">
        <line x1="40" y1="38" x2="42" y2="58" />
        <line x1="48" y1="38" x2="46" y2="58" />
        <line x1="52" y1="38" x2="54" y2="58" />
        <line x1="60" y1="38" x2="58" y2="58" />
      </g>
      {/* Foaming White Splash Highlights */}
      <g stroke="#ffffff" strokeWidth="0.7">
        <line x1="41" y1="40" x2="41" y2="56" />
        <line x1="47" y1="40" x2="47" y2="56" />
        <line x1="53" y1="40" x2="53" y2="56" />
        <line x1="59" y1="40" x2="59" y2="56" />
      </g>

      {/* Intermediate Rock Shelf 2 */}
      <polygon points="26,60 74,60 70,66 30,66" fill="#0f172a" stroke="#020617" strokeWidth="0.9" />

      {/* Tier 3: Lower Powerful Plunge Torrent */}
      <path d="M 30 66 L 70 66 L 68 84 L 32 84 Z" fill="#38bdf8" />
      <g stroke="#ffffff" strokeWidth="1.0">
        <line x1="36" y1="66" x2="36" y2="84" />
        <line x1="42" y1="66" x2="42" y2="84" />
        <line x1="50" y1="66" x2="50" y2="84" />
        <line x1="58" y1="66" x2="58" y2="84" />
        <line x1="64" y1="66" x2="64" y2="84" />
      </g>

      {/* Foaming Lower Plunge Pool & Billowing Mist at Base */}
      <ellipse cx="50" cy="86" rx="42" ry="10" fill="#0284c7" stroke="#0369a1" strokeWidth="1.1" />
      <ellipse cx="50" cy="85" rx="34" ry="7" fill="#e0f2fe" />
      {/* Swirling Foam Ripples */}
      <path d="M 24 85 Q 36 82 50 85 Q 64 88 76 85" fill="none" stroke="#ffffff" strokeWidth="1.1" />
      <path d="M 30 88 Q 44 85 58 88" fill="none" stroke="#ffffff" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
    "caloocan_bonifacio": {
    frame: "#782035",
    bg: "#faf8f2",
    top: "CALOOCAN",
    topColor: "#782035",
    bottom: "BONIFACIO MONUMENT",
    bottomColor: "#782035",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/caloocan_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "candon_tobacco": {
    frame: "#b45309",
    bg: "#fffbeb",
    top: "CANDON",
    topColor: "#b45309",
    bottom: "TOBACCO LEAF",
    bottomColor: "#b45309",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Antique Botanical Circular Frame */}
    <circle cx="50" cy="58" r="34" fill="none" stroke="#d97706" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Large Mature Golden Tobacco Leaf Displayed Diagonally */}
    <g transform="translate(50, 58) rotate(35) translate(-50, -58)">
      {/* Broad Mature Leaf Blade with Curled Edges */}
      <path d="M50,14 C66,28 72,50 68,74 C64,88 56,96 50,102 C44,96 36,88 32,74 C28,50 34,28 50,14 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.3" />
      <path d="M50,18 C62,32 66,50 62,72 C58,84 52,92 50,96 C48,92 42,84 38,72 C34,50 38,32 50,18 Z" fill="#f59e0b" />
      {/* Prominent Central Midrib Vein */}
      <path d="M50,14 L50,106" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
      {/* Detailed Lateral Secondary Veins in Botanical Engraving */}
      <g stroke="#92400e" strokeWidth="0.8" fill="none">
        <path d="M50,30 Q58,26 64,32" /><path d="M50,30 Q42,26 36,32" />
        <path d="M50,42 Q60,38 66,46" /><path d="M50,42 Q40,38 34,46" />
        <path d="M50,56 Q62,52 66,62" /><path d="M50,56 Q38,52 34,62" />
        <path d="M50,70 Q60,68 64,76" /><path d="M50,70 Q40,68 36,76" />
        <path d="M50,84 Q56,82 60,88" /><path d="M50,84 Q44,82 40,88" />
      </g>
    </g>
      </svg>
    ),
  },
  "canlaon_volcano": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "CANLAON",
    topColor: "#78350f",
    bottom: "MOUNT KANLAON",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="44" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <path d="M10,88 C30,86 70,86 90,88 L90,108 L10,108 Z" fill="#451a03" stroke="#1c0702" strokeWidth="1" />
    {/* Dramatic Volcanic Cone & Summit of Mount Kanlaon */}
    <path d="M50,28 C44,42 32,70 14,88 L86,88 C68,70 56,42 50,28 Z" fill="#78350f" stroke="#1c0702" strokeWidth="1.4" />
    {/* Shaded Eastern Slopes with Layered Strata */}
    <path d="M50,28 C50,42 54,70 86,88 L50,88 Z" fill="#92400e" />
    {/* Rugged Active Crater Rim & Fumarole Plume */}
    <polygon points="46,28 54,28 52,32 48,32" fill="#dc2626" />
    <g stroke="#ca8a04" strokeWidth="0.6" fill="none" opacity="0.7">
      <path d="M50,32 L34,88" /><path d="M50,32 L44,88" />
      <path d="M50,32 L58,88" /><path d="M50,32 L68,88" />
    </g>
    {/* Whispering Plume of Volcanic Steam */}
    <ellipse cx="50" cy="22" rx="5" ry="3" fill="#f8fafc" opacity="0.8" />
    <ellipse cx="54" cy="16" rx="7" ry="3.5" fill="#f8fafc" opacity="0.6" />
      </svg>
    ),
  },
  "carcar_chicharon_shoe": {
    frame: "#9a3412",
    bg: "#fff7ed",
    top: "CARCAR",
    topColor: "#9a3412",
    bottom: "CHICHARON",
    bottomColor: "#9a3412",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Culinary Oval Framing */}
    <ellipse cx="50" cy="58" rx="36" ry="30" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="32" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Close-Up Pile of Crispy Chicharon with Irregular Bubbly Puffed Surface */}
    <g id="chicharon-pile" transform="translate(16, 26)">
      {/* Deep Golden Background Cluster */}
      <ellipse cx="34" cy="38" rx="26" ry="18" fill="#b45309" stroke="#78350f" strokeWidth="1.2" />
      {/* Crispy Curled Chicharon Piece 1 (Left) */}
      <path d="M12,42 C8,30 14,24 24,26 C32,28 30,38 24,44 C18,48 12,46 12,42 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
      {/* Crispy Curled Chicharon Piece 2 (Right) */}
      <path d="M38,44 C34,32 42,22 52,24 C60,26 62,36 56,42 C50,48 42,48 38,44 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
      {/* Center Dominant Puffed Pork Rind (Crunchy Blistered Crust) */}
      <path d="M22,34 C18,20 28,14 42,16 C52,18 56,28 50,36 C42,42 26,42 22,34 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1.2" />
      {/* Characteristic Irregular Air Bubble Blisters (Puffed Skin) */}
      <g fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5">
        <circle cx="28" cy="24" r="2.2" /><circle cx="34" cy="22" r="2.5" />
        <circle cx="42" cy="24" r="2" /><circle cx="46" cy="28" r="2.2" />
        <circle cx="36" cy="30" r="2.8" /><circle cx="30" cy="32" r="2" />
        <circle cx="18" cy="34" r="1.8" /><circle cx="50" cy="34" r="1.8" />
      </g>
    </g>
      </svg>
    ),
  },
  "carmona_racing": {
    frame: "#0f766e",
    bg: "#f0fdfa",
    top: "CARMONA",
    topColor: "#0f766e",
    bottom: "THOROUGHBRED RACING",
    bottomColor: "#0f766e",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/carmona_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "catbalogan_maqueda_bay": {
    frame: "#7f1d1d",
    bg: "#fef2f2",
    top: "CATBALOGAN",
    topColor: "#7f1d1d",
    bottom: "WARAY TEXTILE",
    bottomColor: "#7f1d1d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<rect x="14" y="16" width="72" height="88" rx="1" fill="#991b1b" stroke="#450a0a" strokeWidth="1.3" />
    {/* Single Traditional Waray Woven Textile as Cultural Artifact */}
    <g id="waray-textile">
      <rect x="18" y="20" width="64" height="80" fill="#7f1d1d" stroke="#facc15" strokeWidth="0.8" />
      {/* Geometric Woven Diamond & Cross Patterns */}
      <g stroke="#facc15" strokeWidth="1" fill="none">
        <line x1="20" y1="36" x2="80" y2="36" /><line x1="20" y1="84" x2="80" y2="84" />
        {/* Repeating Crosses */}
        <path d="M26,28 L34,28 M30,24 L30,32" />
        <path d="M46,28 L54,28 M50,24 L50,32" />
        <path d="M66,28 L74,28 M70,24 L70,32" />
        {/* Central Chevron / Diamond Medallion */}
        <polygon points="50,44 66,60 50,76 34,60" fill="#15803d" stroke="#facc15" strokeWidth="1.2" />
        <polygon points="50,50 60,60 50,70 40,60" fill="#facc15" stroke="#7f1d1d" strokeWidth="0.8" />
      </g>
      {/* Handwoven Fiber Hatching */}
      <g stroke="#ffffff" strokeWidth="0.4" opacity="0.6">
        <line x1="22" y1="46" x2="32" y2="46" /><line x1="68" y1="46" x2="78" y2="46" />
        <line x1="22" y1="74" x2="32" y2="74" /><line x1="68" y1="74" x2="78" y2="74" />
      </g>
    </g>
      </svg>
    ),
  },
  "cauayan_corn": {
    frame: "#ffbe0b",
    bg: "#fefae0",
    top: "CAUAYAN",
    topColor: "#d48b18",
    bottom: "CORN GRANARY",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <g>
{/* Golden Corn Cob */}
      <ellipse cx="24" cy="27" rx="6" ry="12" fill="#ffbe0b" />
      {/* Kernels pattern */}
      <line x1="21" y1="18" x2="21" y2="36" stroke="#fb5607" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <line x1="24" y1="16" x2="24" y2="38" stroke="#fb5607" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <line x1="27" y1="18" x2="27" y2="36" stroke="#fb5607" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      {/* Corn Husk leaves */}
      <path d="M 24 39 Q 14 36 12 28 Q 18 34 24 39 Z" fill="#2d6a4f" />
      <path d="M 24 39 Q 34 36 36 28 Q 30 34 24 39 Z" fill="#40916c" />
      <circle cx="34" cy="18" r="3.5" fill="#fcbf49" />
      </g>
    ),
  },
  "cauayan_mushroom": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "CAUAYAN",
    topColor: "#065f46",
    bottom: "TOBACCO",
    bottomColor: "#065f46",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Antique Botanical Oval Frame */}
    <ellipse cx="50" cy="58" rx="28" ry="38" fill="none" stroke="#059669" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Single Large Mature Tobacco Leaf Shown Vertically */}
    <g id="vertical-tobacco-leaf">
      {/* Broad Mature Leaf Blade */}
      <path d="M50,18 C64,28 70,52 66,76 C62,90 54,98 50,104 C46,98 38,90 34,76 C30,52 36,28 50,18 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.3" />
      <path d="M50,22 C60,34 64,52 60,74 C56,86 52,94 50,98 C48,94 44,86 40,74 C36,52 40,34 50,22 Z" fill="#22c55e" />
      {/* Prominent Central Stem / Midrib */}
      <path d="M50,16 L50,106" stroke="#14532d" strokeWidth="1.5" strokeLinecap="round" />
      {/* Detailed Botanical Veins & Textures */}
      <g stroke="#166534" strokeWidth="0.8" fill="none">
        <path d="M50,32 Q58,28 64,34" /><path d="M50,32 Q42,28 36,34" />
        <path d="M50,44 Q60,40 65,48" /><path d="M50,44 Q40,40 35,48" />
        <path d="M50,58 Q62,54 65,64" /><path d="M50,58 Q38,54 35,64" />
        <path d="M50,72 Q60,70 63,78" /><path d="M50,72 Q40,70 37,78" />
        <path d="M50,86 Q56,84 59,90" /><path d="M50,86 Q44,84 41,90" />
      </g>
    </g>
      </svg>
    ),
  },
  "cavite_fort_san_felipe": {
    frame: "#1d3557",
    bg: "#fdf0d5",
    top: "CAVITE CITY",
    topColor: "#1d3557",
    bottom: "FORT SAN FELIPE",
    bottomColor: "#c1121f",
    renderArt: () => (
      <g>
{/* Spanish Fort Stone Ramparts */}
      <rect x="10" y="28" width="28" height="14" fill="#6c757d" />
      <polygon points="8,28 11,24 15,28" fill="#495057" />
      <polygon points="18,28 21,24 25,28" fill="#495057" />
      <polygon points="28,28 31,24 35,28" fill="#495057" />
      {/* Galleon Mast behind ramparts */}
      <line x1="24" y1="14" x2="24" y2="28" stroke="#7f4f24" strokeWidth="1.2" />
      <polygon points="24,16 32,18 24,20" fill="#ffffff" />
      {/* Spanish cannon */}
      <line x1="17" y1="33" x2="11" y2="31" stroke="#1d3557" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="33" r="2.5" fill="#1d3557" />
      </g>
    ),
  },
  "cavite_naval_spit": {
    frame: "#1e3a8a",
    bg: "#fafaf9",
    top: "CAVITE CITY",
    topColor: "#1e3a8a",
    bottom: "CAVITEÑO CERAMIC VESSEL",
    bottomColor: "#1e3a8a",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Museum Pedestal & Philatelic Frame Aura */}
    <g opacity="0.25" stroke="#1d4ed8" strokeWidth="0.5">
      <ellipse cx="50" cy="62" rx="36" ry="34" fill="none" strokeDasharray="2 2" />
      <ellipse cx="50" cy="62" rx="32" ry="30" fill="none" strokeDasharray="1 2" />
    </g>

    <g id="cavite-ceramic-vessel" transform="translate(6, 12)">
      {/* Ground Shadow */}
      <ellipse cx="44" cy="78" rx="26" ry="3.5" fill="#1e293b" opacity="0.2" />

      {/* Pedestal Foot Base */}
      <ellipse cx="44" cy="74" rx="16" ry="3.5" fill="#e2e8f0" stroke="#1e3a8a" strokeWidth="1.0" />
      <path d="M 32 74 Q 44 72 56 74 L 54 68 Q 44 66 34 68 Z" fill="#cbd5e1" stroke="#1e3a8a" strokeWidth="0.8" />

      {/* Main Rounded Bulbous Porcelain Body */}
      <path d="
        M 18 46
        C 14 56, 22 68, 44 68
        C 66 68, 74 56, 70 46
        C 68 42, 60 40, 44 40
        C 28 40, 20 42, 18 46 Z
      " fill="#f8fafc" stroke="#1e3a8a" strokeWidth="1.3" />

      {/* Fitted Domed Lid with Sculpted Finial */}
      <path d="
        M 22 41
        C 22 32, 32 26, 44 26
        C 56 26, 66 32, 66 41
        C 58 39, 50 38, 44 38
        C 38 38, 30 39, 22 41 Z
      " fill="#f1f5f9" stroke="#1e3a8a" strokeWidth="1.1" />

      {/* Sculpted Lid Finial (Pineapple / Floral knob) */}
      <path d="M 42 26 Q 44 20 44 17 Q 44 20 46 26 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="0.8" />
      <circle cx="44" cy="16.5" r="2.2" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.7" />

      {/* Two Rococo Ornamental Side Handles */}
      {/* Left Handle */}
      <path d="M 20 44 C 10 44, 8 56, 22 58 C 16 56, 14 48, 22 46 Z" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="1.0" />
      {/* Right Handle */}
      <path d="M 68 44 C 78 44, 80 56, 66 58 C 72 56, 74 48, 66 46 Z" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="1.0" />

      {/* Hand-Painted Cobalt Blue Spanish-Filipino Floral & Scrollwork Patterns */}
      {/* Body Center Floral Medallion */}
      <circle cx="44" cy="54" r="7" fill="none" stroke="#1d4ed8" strokeWidth="0.8" strokeDasharray="1.5 1" />
      <path d="M 44 49 C 42 52, 42 56, 44 59 C 46 56, 46 52, 44 49 Z" fill="#2563eb" />
      <path d="M 39 54 C 42 52, 46 52, 49 54 C 46 56, 42 56, 39 54 Z" fill="#2563eb" />
      {/* Flanking scroll vines on body */}
      <path d="M 28 52 Q 34 50 36 54" fill="none" stroke="#1d4ed8" strokeWidth="0.8" />
      <path d="M 60 52 Q 54 50 52 54" fill="none" stroke="#1d4ed8" strokeWidth="0.8" />

      {/* Lid Painted Rim Garland */}
      <path d="M 28 36 Q 44 32 60 36" fill="none" stroke="#2563eb" strokeWidth="0.9" strokeDasharray="2 1.5" />

      {/* Glaze Reflection Highlights */}
      <path d="M 24 48 Q 28 58 32 62" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "cdo_whitewater_rafting": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "CAGAYAN DE ORO",
    topColor: "#0284c7",
    bottom: "WHITEWATER RAPID",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Turbulent Whitewater River Rapids across Riverbed Rocks (No People / No Rafts) */}
    {/* Rocky River Canyon Bed */}
    <rect x="12" y="16" width="76" height="88" fill="#075985" stroke="#082f49" strokeWidth="1.3" />
    {/* Giant River Boulders in Midstream */}
    <path d="M22,50 C18,36 28,30 38,32 C48,34 50,44 46,54 C40,58 26,56 22,50 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.2" />
    <path d="M58,68 C52,56 62,48 72,50 C82,52 84,62 80,72 C74,76 62,74 58,68 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
    {/* Roaring Whitewater Churning Waves and Hydraulic Boils */}
    <g stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M14,32 C26,30 32,38 46,28 C56,22 68,26 86,24" />
      <path d="M42,42 C50,38 60,42 70,36 C76,32 82,34 86,38" />
      <path d="M14,64 C28,68 36,60 48,64 C56,68 64,62 72,66" />
      <path d="M16,84 C32,80 44,92 60,82 C72,76 80,84 86,80" />
    </g>
    {/* Spray Droplets & Hydraulic Froth */}
    <g fill="#ffffff">
      <circle cx="36" cy="28" r="1.5" /><circle cx="48" cy="36" r="1.8" />
      <circle cx="64" cy="46" r="1.5" /><circle cx="52" cy="74" r="2" />
      <circle cx="38" cy="62" r="1.6" />
    </g>
      </svg>
    ),
  },
  "cotabato_grand_mosque": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "COTABATO CITY",
    topColor: "#047857",
    bottom: "GRAND MOSQUE",
    bottomColor: "#047857",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="46" r="34" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Frontal Architectural Engraving of Grand Mosque (Sultan Hassanal Bolkiah Mosque) */}
    <g id="grand-mosque" transform="translate(8, 22)">
      <line x1="2" y1="76" x2="82" y2="76" stroke="#064e3b" strokeWidth="1.2" />
      {/* Main Symmetrical Mosque Hall Structure (Pure White Marble) */}
      <rect x="18" y="44" width="48" height="32" fill="#ffffff" stroke="#064e3b" strokeWidth="1.2" />
      {/* Symmetrical Triple Arches of Facade */}
      <g fill="#047857" stroke="#064e3b" strokeWidth="0.8">
        <rect x="22" y="56" width="8" height="20" rx="4" />
        <rect x="38" y="52" width="8" height="24" rx="4" fill="#ca8a04" />
        <rect x="54" y="56" width="8" height="20" rx="4" />
      </g>
      {/* Monumental Central Golden Onion Dome */}
      <path d="M34,44 C34,28 42,20 42,14 C42,20 50,28 50,44 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.3" />
      <polygon points="42,10 40,14 44,14" fill="#ca8a04" />
      <line x1="42" y1="8" x2="42" y2="12" stroke="#ca8a04" strokeWidth="1" />
      {/* Symmetrical Flanking Golden Domes */}
      <path d="M22,44 C22,34 27,28 27,22 C27,28 32,34 32,44 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      <path d="M52,44 C52,34 57,28 57,22 C57,28 62,34 62,44 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      {/* Soaring Symmetrical Minaret Towers Left and Right */}
      <rect x="8" y="16" width="6" height="60" fill="#ffffff" stroke="#064e3b" strokeWidth="1" />
      <path d="M8,16 C8,10 11,8 11,4 C11,8 14,10 14,16 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
      <rect x="70" y="16" width="6" height="60" fill="#ffffff" stroke="#064e3b" strokeWidth="1" />
      <path d="M70,16 C70,10 73,8 73,4 C73,8 76,10 76,16 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "crisologo": {
    frame: "#7c2d12",
    bg: "#fdfcf7",
    top: "VIGAN",
    topColor: "#7c2d12",
    bottom: "HERITAGE KALESA",
    bottomColor: "#b45309",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
        {/* Outer Spanish-Colonial Framing */}
        <rect x="8" y="8" width="84" height="104" fill="#fdfcf7" stroke="#7c2d12" strokeWidth="1.8" />
        <rect x="10.5" y="10.5" width="79" height="99" fill="none" stroke="#b45309" strokeWidth="0.7" />

        {/* Heritage Spanish Brick Arch Border at top */}
        <g stroke="#9a3412" strokeWidth="0.55" fill="none">
          <path d="M 12 14 H 88 M 12 17 H 88" />
          <line x1="18" y1="14" x2="18" y2="17" /><line x1="26" y1="14" x2="26" y2="17" />
          <line x1="34" y1="14" x2="34" y2="17" /><line x1="42" y1="14" x2="42" y2="17" />
          <line x1="50" y1="14" x2="50" y2="17" /><line x1="58" y1="14" x2="58" y2="17" />
          <line x1="66" y1="14" x2="66" y2="17" /><line x1="74" y1="14" x2="74" y2="17" />
          <line x1="82" y1="14" x2="82" y2="17" />
        </g>

        {/* Architectural Background: Vigan Ancestral Spanish Houses & Farola */}
        <g opacity="0.45" stroke="#78350f" fill="none">
          <path d="M 12 42 L 28 34 L 48 44 L 70 33 L 88 41" strokeWidth="0.8" />
          <path d="M 12 44 L 28 36 L 48 46 L 70 35 L 88 43" strokeWidth="0.5" />
          <rect x="16" y="44" width="10" height="12" strokeWidth="0.6" />
          <line x1="21" y1="44" x2="21" y2="56" strokeWidth="0.4" /><line x1="16" y1="50" x2="26" y2="50" strokeWidth="0.4" />
          <rect x="32" y="46" width="12" height="12" strokeWidth="0.6" />
          <line x1="38" y1="46" x2="38" y2="58" strokeWidth="0.4" /><line x1="32" y1="52" x2="44" y2="52" strokeWidth="0.4" />
          
          <path d="M 80 24 L 84 24 L 85 29 L 79 29 Z" fill="#d97706" opacity="0.6" />
          <line x1="82" y1="29" x2="82" y2="60" strokeWidth="0.8" />
          <path d="M 78 36 C 80 33, 84 33, 86 36" strokeWidth="0.6" />
        </g>

        {/* Cobblestone Pavement */}
        <g stroke="#64748b" strokeWidth="0.5" fill="#f1f5f9">
          <rect x="11" y="90" width="78" height="18" fill="#e2e8f0" stroke="none" />
          <path d="M 12 92 H 88 M 12 96 H 88 M 12 100 H 88 M 12 104 H 88 M 12 108 H 88" stroke="#64748b" strokeWidth="0.6" />
          <line x1="18" y1="92" x2="18" y2="96" /><line x1="28" y1="92" x2="28" y2="96" /><line x1="40" y1="92" x2="40" y2="96" /><line x1="52" y1="92" x2="52" y2="96" /><line x1="64" y1="92" x2="64" y2="96" /><line x1="76" y1="92" x2="76" y2="96" />
          <line x1="23" y1="96" x2="23" y2="100" /><line x1="34" y1="96" x2="34" y2="100" /><line x1="46" y1="96" x2="46" y2="100" /><line x1="58" y1="96" x2="58" y2="100" /><line x1="70" y1="96" x2="70" y2="100" /><line x1="82" y1="96" x2="82" y2="100" />
          <line x1="17" y1="100" x2="17" y2="104" /><line x1="30" y1="100" x2="30" y2="104" /><line x1="42" y1="100" x2="42" y2="104" /><line x1="55" y1="100" x2="55" y2="104" /><line x1="67" y1="100" x2="67" y2="104" /><line x1="79" y1="100" x2="79" y2="104" />
          <line x1="22" y1="104" x2="22" y2="108" /><line x1="36" y1="104" x2="36" y2="108" /><line x1="50" y1="104" x2="50" y2="108" /><line x1="62" y1="104" x2="62" y2="108" /><line x1="74" y1="104" x2="74" y2="108" />
        </g>

        {/* VIGAN KALESA CARRIAGE & TROTTING HORSE */}
        <g id="kalesa-horse">
          <path d="M 22 54 C 22 50, 25 46, 27 44 C 28 42, 30 43, 30 46 C 32 52, 35 56, 39 58 C 44 59, 48 59, 51 61 C 54 63, 54 70, 52 73 C 48 74, 43 75, 38 75 C 33 75, 31 72, 30 69 C 29 65, 27 60, 24 57 Z" fill="#1e293b" />
          <path d="M 27 43 L 28 39 L 30 43 Z" fill="#1e293b" />
          <path d="M 22 54 C 19 55, 18 58, 20 60 C 22 61, 24 59, 25 57 Z" fill="#1e293b" />
          <path d="M 29 44 Q 33 48 35 55" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

          {/* Horse Legs */}
          <path d="M 30 69 L 30 80 L 28 91 L 31 91 L 32 81 L 33 70" fill="#1e293b" />
          <rect x="27.5" y="90" width="3.5" height="2" fill="#0f172a" rx="0.5" />
          <path d="M 32 70 L 34 79 L 38 85 L 40 84 L 36 78 L 35 70" fill="#334155" />
          <rect x="37.5" y="83.5" width="3" height="2" fill="#0f172a" rx="0.5" />
          <path d="M 50 72 L 52 81 L 53 91 L 50 91 L 48 81 L 47 73" fill="#1e293b" />
          <rect x="49.5" y="90" width="3.5" height="2" fill="#0f172a" rx="0.5" />
          <path d="M 46 73 L 48 80 L 46 89 L 44 89 L 45 80 L 44 74" fill="#334155" />
          <rect x="43.5" y="88" width="3" height="2" fill="#0f172a" rx="0.5" />

          <path d="M 52 70 Q 56 76 54 84" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />

          <rect x="39" y="59" width="7" height="6" rx="1" fill="#dc2626" stroke="#991b1b" strokeWidth="0.5" />
          <line x1="42.5" y1="65" x2="42.5" y2="75" stroke="#78350f" strokeWidth="0.8" />
          <path d="M 21 57 L 27 47" stroke="#b91c1c" strokeWidth="0.6" />
          <circle cx="21" cy="57" r="0.7" fill="#fbbf24" />
        </g>

        {/* Shafts & Reins */}
        <line x1="41" y1="67" x2="61" y2="75" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 21 57 Q 45 59 62 67" fill="none" stroke="#dc2626" strokeWidth="0.8" strokeDasharray="3 0.6" />

        {/* Kalesa Carriage */}
        <g id="kalesa-carriage">
          <path d="M 63 49 C 63 43, 71 40, 78 40 C 83 40, 85 44, 85 51 L 84 64 L 61 64 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
          <path d="M 66 48 C 69 44, 74 42, 78 42 C 81 42, 82 45, 82 50" fill="none" stroke="#fde047" strokeWidth="0.7" />

          <rect x="58" y="61" width="6" height="8" fill="#451a03" stroke="#1c1917" strokeWidth="0.7" />
          <polygon points="60,69 82,69 80,76 58,76" fill="#78350f" stroke="#451a03" strokeWidth="0.9" />

          <rect x="60" y="54" width="3" height="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
          <line x1="61.5" y1="58.5" x2="61.5" y2="62" stroke="#ca8a04" strokeWidth="0.7" />

          <path d="M 60 76 Q 72 65 84 76" fill="none" stroke="#451a03" strokeWidth="1.4" />

          {/* 12-Spoke Wheel */}
          <g transform="translate(72, 79)">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="none" stroke="#b45309" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="3.2" fill="#b91c1c" stroke="#1e293b" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.2" fill="#fbbf24" />
            <g stroke="#1e293b" strokeWidth="0.9">
              <line x1="0" y1="-12" x2="0" y2="12" />
              <line x1="-12" y1="0" x2="12" y2="0" />
              <line x1="-8.5" y1="-8.5" x2="8.5" y2="8.5" />
              <line x1="-8.5" y1="8.5" x2="8.5" y2="-8.5" />
              <line x1="-4.1" y1="-11.3" x2="4.1" y2="11.3" />
              <line x1="-11.3" y1="-4.1" x2="11.3" y2="4.1" />
            </g>
          </g>
        </g>
      </svg>
    ),
  },
  "dagupan_bangus": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "DAGUPAN",
    topColor: "#0284c7",
    bottom: "BANGUS",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Estuary Water Lines */}
    <path d="M12,40 C30,38 70,42 88,40 M14,76 C35,74 65,77 86,76" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
    {/* One Large Milkfish (Bangus) in Side Profile in Scientific Engraving Style */}
    <g id="bangus-fish" transform="translate(12, 34)">
      {/* Streamlined Torpedo Body */}
      <path d="M12,24 C20,14 44,12 60,18 C68,21 72,24 68,28 C64,32 44,36 24,32 C16,30 12,26 12,24 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.3" />
      {/* Silver-Blue Back Shading */}
      <path d="M16,22 C22,15 44,13 58,19 L56,23 C42,18 24,19 16,22 Z" fill="#0284c7" />
      {/* Distinctive Deeply Forked Caudal Tail Fin */}
      <polygon points="66,24 78,14 74,24 78,34" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.9" />
      {/* Dorsal, Pectoral, and Ventral Fins */}
      <polygon points="36,13 42,6 46,14" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.8" />
      <polygon points="24,28 20,36 28,31" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.8" />
      <polygon points="46,31 48,37 52,31" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.7" />
      {/* Head, Operculum (Gill Cover), Small Toothless Mouth, Eye */}
      <path d="M18,18 C22,20 22,28 18,30" fill="none" stroke="#0f172a" strokeWidth="0.9" />
      <circle cx="15" cy="23" r="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="14.8" cy="23" r="1" fill="#0f172a" />
      {/* Delicate Engraved Scale Patterns */}
      <g stroke="#94a3b8" strokeWidth="0.5" fill="none">
        <path d="M28,20 Q32,23 36,20 M38,20 Q42,23 46,20 M48,20 Q52,23 56,20" />
        <path d="M26,24 Q30,27 34,24 M36,24 Q40,27 44,24 M46,24 Q50,27 54,24" />
        <path d="M28,28 Q32,31 36,28 M38,28 Q42,31 46,28" />
      </g>
    </g>
      </svg>
    ),
  },
  "danao_karansa_pottery": {
    frame: "#ea580c",
    bg: "#fff7ed",
    top: "DANAO",
    topColor: "#ea580c",
    bottom: "KARANSA MASK",
    bottomColor: "#ea580c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Single Decorative Mask Associated with Karansa Festival Displayed Frontally */}
    <g id="karansa-mask">
      {/* Radiating Sunburst / Petal Headdress Crest */}
      <g fill="#facc15" stroke="#c2410c" strokeWidth="0.8">
        <polygon points="50,16 46,30 54,30" fill="#dc2626" />
        <polygon points="38,20 38,34 46,30" fill="#f59e0b" />
        <polygon points="62,20 54,30 62,34" fill="#f59e0b" />
        <polygon points="28,28 32,40 40,36" fill="#15803d" />
        <polygon points="72,28 60,36 68,40" fill="#15803d" />
      </g>
      {/* Carved Wooden Mask Base */}
      <ellipse cx="50" cy="62" rx="22" ry="26" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.3" />
      {/* Intricate Geometric Carvings and Decorative Surfaces */}
      {/* Eyes */}
      <ellipse cx="42" cy="54" rx="4" ry="2.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      <ellipse cx="58" cy="54" rx="4" ry="2.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      {/* Geometric Facial Pigment Bands */}
      <path d="M34,60 Q50,64 66,60" fill="none" stroke="#ea580c" strokeWidth="1.2" />
      <path d="M36,66 Q50,70 64,66" fill="none" stroke="#dc2626" strokeWidth="1.2" />
      {/* Cheerful Expression / Mouth */}
      <path d="M42,74 Q50,82 58,74" fill="none" stroke="#9a3412" strokeWidth="1.6" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "dapitan_rizal_shrine": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "DAPITAN",
    topColor: "#78350f",
    bottom: "DAPITAN ANCESTRAL ARCHITECTURE",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="50" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Traditional Elevated Dapitan Wooden House Architecture (Casa Cuadrada) */}
    <g id="dapitan-house" transform="translate(12, 24)">
      <line x1="2" y1="74" x2="74" y2="74" stroke="#451a03" strokeWidth="1.2" />
      {/* Thatched / Wooden Gabled Hip Roof with Flared Overhanging Eaves */}
      <polygon points="38,8 4,26 72,26" fill="#854d0e" stroke="#451a03" strokeWidth="1.3" />
      <line x1="12" y1="20" x2="64" y2="20" stroke="#ca8a04" strokeWidth="0.8" />
      {/* Upper Living Level (Hardwood Siding and Open Slatted Windows) */}
      <rect x="10" y="26" width="56" height="24" fill="#a16207" stroke="#451a03" strokeWidth="1.2" />
      {/* Open Wooden Shutter Windows */}
      <g fill="#fefce8" stroke="#451a03" strokeWidth="0.7">
        <rect x="14" y="30" width="10" height="12" />
        <rect x="28" y="30" width="10" height="12" />
        <rect x="44" y="30" width="10" height="12" />
        <rect x="58" y="30" width="8" height="12" />
      </g>
      {/* Heavy Hardwood Stilts Elevating House Above Ground */}
      <g stroke="#451a03" strokeWidth="2">
        <line x1="14" y1="50" x2="14" y2="74" />
        <line x1="26" y1="50" x2="26" y2="74" />
        <line x1="50" y1="50" x2="50" y2="74" />
        <line x1="62" y1="50" x2="62" y2="74" />
      </g>
      {/* Traditional Wooden Ladder / Stairs to Entrance */}
      <line x1="38" y1="50" x2="34" y2="74" stroke="#78350f" strokeWidth="1.3" />
      <line x1="44" y1="50" x2="40" y2="74" stroke="#78350f" strokeWidth="1.3" />
    </g>
      </svg>
    ),
  },
  "dasmarinas_kadiwa": {
    frame: "#ea580c",
    bg: "#fff7ed",
    top: "DASMARIÑAS",
    topColor: "#ea580c",
    bottom: "SALTED EGG",
    bottomColor: "#ea580c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Culinary Oval Framing */}
    <ellipse cx="50" cy="58" rx="34" ry="28" fill="none" stroke="#fdba74" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Salted Duck Egg Cut in Half */}
    <g id="salted-egg" transform="translate(18, 28)">
      {/* Outer Reddish-Violet/Crimson Salted Egg Shell */}
      <ellipse cx="32" cy="32" rx="26" ry="22" fill="#9d174d" stroke="#700730" strokeWidth="1.3" />
      {/* Egg White (Smooth, Translucent Cooked Albumen) */}
      <ellipse cx="32" cy="32" rx="23" ry="19" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
      {/* Vibrant Creamy Orange Salted Egg Yolk (Centerpiece) */}
      <circle cx="32" cy="32" r="11" fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
      <circle cx="30" cy="30" r="8" fill="#f97316" />
      <circle cx="28" cy="28" r="3" fill="#fef08a" opacity="0.8" />
      {/* Oily/Rich Texture Engraving Circles */}
      <circle cx="36" cy="36" r="2" fill="#c2410c" opacity="0.5" />
      <circle cx="34" cy="26" r="1.5" fill="#c2410c" opacity="0.4" />
    </g>
      </svg>
    ),
  },
  "dasmarinas_university": {
    frame: "#1b4332",
    bg: "#fefae0",
    top: "DASMARIÑAS",
    topColor: "#1b4332",
    bottom: "UNIVERSITY CAPITAL",
    bottomColor: "#b45309",
    renderArt: () => (
      <g>
{/* University Rotunda Clock Tower */}
      <rect x="20" y="17" width="8" height="25" fill="#b45309" rx="0.5" />
      <polygon points="24,11 19,17 29,17" fill="#78350f" />
      <circle cx="24" cy="22" r="2.2" fill="#ffffff" stroke="#78350f" strokeWidth="0.6" />
      <line x1="24" y1="22" x2="24" y2="21" stroke="#78350f" strokeWidth="0.6" />
      <line x1="24" y1="22" x2="25" y2="22" stroke="#78350f" strokeWidth="0.6" />
      {/* Lush Academic Avenue Trees */}
      <circle cx="14" cy="34" r="5" fill="#2d6a4f" />
      <circle cx="34" cy="34" r="5" fill="#2d6a4f" />
      <rect x="9" y="42" width="30" height="2" fill="#1b4332" />
      </g>
    ),
  },
  "digos_mount_apo_trail": {
    frame: "#d97706",
    bg: "#fefce8",
    top: "DIGOS",
    topColor: "#d97706",
    bottom: "MANGO",
    bottomColor: "#d97706",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="28" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Large Ripe Carabao Mango in Three-Quarter View */}
    <g id="digos-mango" transform="translate(18, 22)">
      <path d="M28,18 C22,12 14,14 8,22 C12,26 22,24 28,18 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <path d="M28,18 L32,10" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30,16 C44,14 56,26 56,44 C56,60 44,72 32,70 C20,68 12,54 14,38 C16,24 22,18 30,16 Z" fill="#facc15" stroke="#b45309" strokeWidth="1.3" />
      <path d="M34,22 C46,24 52,36 50,52 C48,64 38,68 32,68 C38,64 42,50 40,36 C38,28 34,24 34,22 Z" fill="#f59e0b" opacity="0.8" />
      <path d="M22,28 C26,24 32,24 34,26" fill="none" stroke="#fefce8" strokeWidth="1.5" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "dipolog_sardines": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "DIPOLOG",
    topColor: "#0369a1",
    bottom: "SARDINES",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Vintage Food Product Engraving Oval */}
    <ellipse cx="50" cy="58" rx="36" ry="28" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="32" ry="4" fill="#0f172a" opacity="0.2" />
    {/* An Opened Sardine Tin Containing Neatly Arranged Sardines */}
    <g id="sardine-tin" transform="translate(16, 28)">
      {/* Oval Shallow Metal Tin Can Body */}
      <rect x="6" y="16" width="56" height="38" rx="10" fill="#94a3b8" stroke="#334155" strokeWidth="1.4" />
      {/* Rolled Tin Lid Peeling Back (Vintage Sardine Key Opening) */}
      <path d="M6,16 C12,8 24,6 40,8 L44,16 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
      <ellipse cx="44" cy="14" rx="3" ry="5" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
      {/* Golden Oil Bath Interior */}
      <rect x="10" y="20" width="48" height="30" rx="7" fill="#ca8a04" stroke="#854d0e" strokeWidth="0.8" />
      {/* Four Neatly Arranged Whole Sardines in Oil (Silver Skin & Blue Backs) */}
      <g stroke="#0f172a" strokeWidth="0.8">
        {/* Sardine 1 */}
        <rect x="12" y="22" width="44" height="6" rx="3" fill="#e2e8f0" />
        <path d="M12,22 L56,22" stroke="#0284c7" strokeWidth="1.5" />
        {/* Sardine 2 */}
        <rect x="12" y="29" width="44" height="6" rx="3" fill="#e2e8f0" />
        <path d="M12,29 L56,29" stroke="#0284c7" strokeWidth="1.5" />
        {/* Sardine 3 */}
        <rect x="12" y="36" width="44" height="6" rx="3" fill="#e2e8f0" />
        <path d="M12,36 L56,36" stroke="#0284c7" strokeWidth="1.5" />
        {/* Sardine 4 */}
        <rect x="12" y="43" width="44" height="5" rx="2.5" fill="#e2e8f0" />
      </g>
    </g>
      </svg>
    ),
  },
  "dumaguete_campanario": {
    frame: "#1e3a8a",
    bg: "#eff6ff",
    top: "DUMAGUETE",
    topColor: "#1e3a8a",
    bottom: "SILLIMAN ARCHITECTURE",
    bottomColor: "#1e3a8a",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="48" r="32" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Frontal Historic Silliman University Architecture (Silliman Hall) */}
    <g id="silliman-hall" transform="translate(10, 24)">
      <line x1="2" y1="76" x2="78" y2="76" stroke="#1e293b" strokeWidth="1.2" />
      {/* Classical Victorian / American-Colonial Building Body */}
      <rect x="8" y="32" width="64" height="44" fill="#ffffff" stroke="#1e293b" strokeWidth="1.3" />
      {/* Ornate Steep Pitch Gabled Roof with Shingles */}
      <polygon points="40,12 6,32 74,32" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.2" />
      {/* Center Roof Dormer Window & Cupola Tower */}
      <rect x="36" y="4" width="8" height="10" fill="#ffffff" stroke="#1e293b" strokeWidth="0.9" />
      <polygon points="40,0 35,4 45,4" fill="#991b1b" stroke="#7f1d1d" strokeWidth="0.8" />
      {/* Prominent White Porch Veranda & Classical Columns */}
      <g fill="#ffffff" stroke="#1e293b" strokeWidth="0.9">
        <rect x="12" y="38" width="4" height="38" /><rect x="22" y="38" width="4" height="38" />
        <rect x="32" y="38" width="4" height="38" /><rect x="44" y="38" width="4" height="38" />
        <rect x="54" y="38" width="4" height="38" /><rect x="64" y="38" width="4" height="38" />
      </g>
      {/* Symmetrical Windows with Shutters */}
      <g fill="#1e3a8a" stroke="#1e293b" strokeWidth="0.6">
        <rect x="17" y="42" width="4" height="8" /><rect x="27" y="42" width="4" height="8" />
        <rect x="49" y="42" width="4" height="8" /><rect x="59" y="42" width="4" height="8" />
      </g>
    </g>
      </svg>
    ),
  },
    "eagle": {
    frame: "#78350f",
    bg: "#064e3b",
    top: "DAVAO CITY",
    topColor: "#78350f",
    bottom: "PHILIPPINE EAGLE",
    bottomColor: "#78350f",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/davao_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "el_salvador_divine_mercy": {
    frame: "#b45309",
    bg: "#fefce8",
    top: "EL SALVADOR",
    topColor: "#b45309",
    bottom: "DIVINE MERCY SHRINE ARCHITECTURE",
    bottomColor: "#b45309",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="48" r="34" fill="none" stroke="#d97706" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Divine Mercy Shrine Architecture Sole Subject (Facade, Arches, Roofline - No Figures) */}
    <g id="divine-mercy-shrine" transform="translate(12, 22)">
      <line x1="2" y1="76" x2="74" y2="76" stroke="#78350f" strokeWidth="1.2" />
      {/* Multi-Tiered Pedestal Base Platform */}
      <rect x="16" y="68" width="44" height="8" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <rect x="22" y="60" width="32" height="8" fill="#e2e8f0" stroke="#475569" strokeWidth="0.9" />
      {/* Massive Soaring Pylon Architecture (Central Monument Structure) */}
      <polygon points="38,10 32,60 44,60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.3" />
      {/* Flanking Architectural Wing Ribs */}
      <path d="M38,18 C26,30 20,46 22,60" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      <path d="M38,18 C50,30 56,46 54,60" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      {/* Architectural Radial Beams (Red & Pale Rays Representing the Shrine Structure) */}
      <g strokeWidth="1.2" fill="none">
        <line x1="38" y1="36" x2="16" y2="58" stroke="#dc2626" />
        <line x1="38" y1="36" x2="18" y2="64" stroke="#dc2626" />
        <line x1="38" y1="36" x2="60" y2="58" stroke="#38bdf8" />
        <line x1="38" y1="36" x2="58" y2="64" stroke="#38bdf8" />
      </g>
      {/* Base Chapel Arched Entrance */}
      <rect x="34" y="66" width="8" height="10" rx="4" fill="#1e293b" />
    </g>
      </svg>
    ),
  },
  "escalante_manquiquile": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "ESCALANTE",
    topColor: "#15803d",
    bottom: "SUGARCANE",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Sugarcane Stalk with Long Leaves and Clearly Segmented Stem */}
    <g transform="translate(50, 58) rotate(35) translate(-50, -58)">
      <rect x="47" y="14" width="6" height="22" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="36" x2="55" y2="36" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="36" width="6" height="24" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="60" x2="55" y2="60" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="60" width="6" height="24" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="84" x2="55" y2="84" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="84" width="6" height="20" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      {/* Arching Leaves */}
      <path d="M47,36 C32,28 18,34 10,48 C22,44 36,42 47,36 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <path d="M53,60 C68,52 82,58 90,72 C78,68 64,66 53,60 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
    </g>
      </svg>
    ),
  },
  "gapan_footwear": {
    frame: "#831843",
    bg: "#fdf2f8",
    top: "GAPAN",
    topColor: "#831843",
    bottom: "ONION",
    bottomColor: "#831843",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Etched Circle */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#db2777" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Ground Shadow */}
    <ellipse cx="50" cy="92" rx="26" ry="3.5" fill="#0f172a" opacity="0.2" />
    {/* One Onion Bulb with Papery Layers Partly Peeling Away */}
    <g id="onion-bulb" transform="translate(20, 24)">
      {/* Main Round Bulb Body */}
      <path d="M30,12 C14,18 8,36 12,50 C16,62 26,66 30,66 C34,66 44,62 48,50 C52,36 46,18 30,12 Z" fill="#be185d" stroke="#831843" strokeWidth="1.3" />
      {/* Concentric Structure & Papery Layers Peeling Outward */}
      <path d="M12,46 C6,40 4,28 10,22 L16,30 Z" fill="#db2777" stroke="#831843" strokeWidth="0.8" />
      <path d="M48,46 C54,40 56,28 50,22 L44,30 Z" fill="#db2777" stroke="#831843" strokeWidth="0.8" />
      {/* Internal Concentric Rings Visible Under Skin */}
      <path d="M20,24 C16,34 18,48 24,58 M40,24 C44,34 42,48 36,58" fill="none" stroke="#fbcfe8" strokeWidth="0.8" />
      <path d="M26,18 C24,30 26,48 30,62 M34,18 C36,30 34,48 30,62" fill="none" stroke="#fbcfe8" strokeWidth="0.7" />
      {/* Top Dried Neck / Stem Shoot */}
      <path d="M28,12 L30,4 L32,12" stroke="#831843" strokeWidth="1.2" fill="none" />
      {/* Dry Basal Plate & Delicate Root Strands */}
      <g stroke="#78350f" strokeWidth="0.7" fill="none">
        <path d="M26,66 L22,76" /><path d="M28,66 L27,78" />
        <path d="M30,66 L31,79" /><path d="M32,66 L35,77" /><path d="M34,66 L38,75" />
      </g>
    </g>
      </svg>
    ),
  },
  "gapan_slippers": {
    frame: "#9c413a",
    bg: "#fefae0",
    top: "GAPAN",
    topColor: "#9c413a",
    bottom: "FOOTWEAR",
    bottomColor: "#7f4f24",
    renderArt: () => (
      <g>
{/* Artisanal Leather Slippers / Sandals */}
      <ellipse cx="18" cy="29" rx="5" ry="11" fill="#dda15e" stroke="#7f4f24" strokeWidth="0.8" transform="rotate(-15 18 29)" />
      <ellipse cx="30" cy="29" rx="5" ry="11" fill="#dda15e" stroke="#7f4f24" strokeWidth="0.8" transform="rotate(15 30 29)" />
      {/* Slipper Straps */}
      <path d="M 14 27 Q 19 21 21 28" stroke="#9c413a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 27 28 Q 29 21 34 27" stroke="#9c413a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  "gen_trias_tejeros": {
    frame: "#b0413e",
    bg: "#fdf0d5",
    top: "GEN. TRIAS",
    topColor: "#b0413e",
    bottom: "TEJEROS CONVENTION",
    bottomColor: "#548c2f",
    renderArt: () => (
      <g>
{/* Historic Tejeros Convention 2-story Spanish House */}
      <polygon points="24,18 11,25 37,25" fill="#78350f" />
      <rect x="14" y="25" width="20" height="17" fill="#fdf0d5" stroke="#b0413e" strokeWidth="1" />
      {/* Wooden Capiz Ventanillas */}
      <rect x="16" y="27" width="4.5" height="4.5" fill="#548c2f" />
      <rect x="27.5" y="27" width="4.5" height="4.5" fill="#548c2f" />
      <path d="M 21 42 V 35 A 3 3 0 0 1 27 35 V 42 Z" fill="#b0413e" />
      </g>
    ),
  },
  "gentrias_tejeros": {
    frame: "#334155",
    bg: "#f8fafc",
    top: "GENERAL TRIAS",
    topColor: "#334155",
    bottom: "FIRST CRY OF CAVITE",
    bottomColor: "#334155",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/general_trias_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "gingoog_tiklas_falls": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "GINGOOG",
    topColor: "#78350f",
    bottom: "COCONUT",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#a16207" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Mature Coconut with Rough Husk and Exposed Shell in Botanical Engraving */}
    <g id="gingoog-coconut" transform="translate(18, 28)">
      <path d="M8,36 C8,16 20,4 32,4 C44,4 56,16 56,36 C56,52 46,62 32,62 C18,62 8,52 8,36 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1.3" />
      <g stroke="#ca8a04" strokeWidth="0.6" fill="none">
        <path d="M14,30 C14,18 22,8 32,8" /><path d="M18,40 C18,22 26,12 32,12" />
        <path d="M50,30 C50,18 42,8 32,8" /><path d="M46,40 C46,22 38,12 32,12" />
      </g>
      <circle cx="32" cy="38" r="15" fill="#451a03" stroke="#1c0702" strokeWidth="1.2" />
      <circle cx="28" cy="34" r="2.2" fill="#1c0702" />
      <circle cx="36" cy="34" r="2.2" fill="#1c0702" />
      <circle cx="32" cy="42" r="2" fill="#1c0702" />
    </g>
      </svg>
    ),
  },
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
  "guihulngan_kanhulalo": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "GUIHULNGAN",
    topColor: "#15803d",
    bottom: "BAMBOO",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Bamboo Stalk with Detailed Nodes and Leaves in Botanical Engraving */}
    <g id="bamboo-stalk">
      {/* Sturdy Segmented Green Culm (Stalk) */}
      <rect x="46" y="16" width="8" height="24" rx="1" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />
      <line x1="44" y1="40" x2="56" y2="40" stroke="#14532d" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="46" y="40" width="8" height="26" rx="1" fill="#16a34a" stroke="#14532d" strokeWidth="1.2" />
      <line x1="44" y1="66" x2="56" y2="66" stroke="#14532d" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="46" y="66" width="8" height="28" rx="1" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />
      <line x1="44" y1="94" x2="56" y2="94" stroke="#14532d" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="46" y="94" width="8" height="16" rx="1" fill="#16a34a" stroke="#14532d" strokeWidth="1.2" />
      {/* Delicate Lanceolate Bamboo Leaves Branching from Nodes */}
      <g fill="#15803d" stroke="#14532d" strokeWidth="0.8">
        <path d="M44,40 C34,36 24,40 16,50 C26,46 36,44 44,40 Z" />
        <path d="M44,40 C36,46 30,56 26,68 C34,58 40,50 44,40 Z" />
        <path d="M56,66 C66,62 76,66 84,76 C74,72 64,70 56,66 Z" />
        <path d="M56,66 C64,72 70,82 74,94 C66,84 60,76 56,66 Z" />
      </g>
    </g>
      </svg>
    ),
  },
  "himamaylan_oysters": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "HIMAMAYLAN",
    topColor: "#ca8a04",
    bottom: "GOLDEN RICE PANICLE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Botanical Background Ellipse */}
    <g opacity="0.25" stroke="#ca8a04" strokeWidth="0.5">
      <ellipse cx="50" cy="58" rx="36" ry="42" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="golden-rice-panicle" transform="translate(6, 6)">
      {/* Rice Leaves Framing Base of Stem */}
      <path d="M 22 96 C 20 80, 16 64, 12 52 C 16 66, 22 78, 24 96 Z" fill="#65a30d" stroke="#3f6212" strokeWidth="0.8" />
      <path d="M 26 96 C 28 82, 34 68, 42 56 C 36 70, 30 84, 28 96 Z" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.8" />

      {/* Main Slender Stem (Rachis) Arching Gracefully (24,96 to 72,42 to 62,78) */}
      <path d="
        M 24 96
        C 24 74, 32 50, 48 34
        C 58 24, 72 26, 76 38
        C 78 48, 72 64, 62 76
      " fill="none" stroke="#a16207" strokeWidth="1.6" strokeLinecap="round" />

      {/* Branching Pedicels & Dozens of Plump Golden Rice Grains (Palay) */}
      {/* Cluster 1: Crest of Arc */}
      <g fill="#facc15" stroke="#854d0e" strokeWidth="0.7">
        {/* Top Grains */}
        <ellipse cx="46" cy="32" rx="4.5" ry="2.2" transform="rotate(-30 46 32)" />
        <ellipse cx="54" cy="28" rx="4.5" ry="2.2" transform="rotate(-15 54 28)" />
        <ellipse cx="62" cy="28" rx="4.5" ry="2.2" transform="rotate(10 62 28)" />
        <ellipse cx="70" cy="32" rx="4.5" ry="2.2" transform="rotate(35 70 32)" />
        <ellipse cx="74" cy="40" rx="4.5" ry="2.2" transform="rotate(60 74 40)" />

        {/* Mid Draping Grains */}
        <ellipse cx="73" cy="48" rx="4.5" ry="2.2" transform="rotate(80 73 48)" />
        <ellipse cx="69" cy="56" rx="4.5" ry="2.2" transform="rotate(100 69 56)" />
        <ellipse cx="64" cy="64" rx="4.5" ry="2.2" transform="rotate(115 64 64)" />
        <ellipse cx="58" cy="72" rx="4.5" ry="2.2" transform="rotate(125 58 72)" />
        <ellipse cx="52" cy="78" rx="4.5" ry="2.2" transform="rotate(135 52 78)" />

        {/* Secondary Inner Spikes */}
        <ellipse cx="52" cy="36" rx="4.0" ry="2.0" transform="rotate(-10 52 36)" />
        <ellipse cx="60" cy="36" rx="4.0" ry="2.0" transform="rotate(20 60 36)" />
        <ellipse cx="66" cy="44" rx="4.0" ry="2.0" transform="rotate(50 66 44)" />
        <ellipse cx="63" cy="52" rx="4.0" ry="2.0" transform="rotate(75 63 52)" />
        <ellipse cx="58" cy="60" rx="4.0" ry="2.0" transform="rotate(95 58 60)" />

        {/* Lower Stalk Grains */}
        <ellipse cx="40" cy="42" rx="4.2" ry="2.1" transform="rotate(-45 40 42)" />
        <ellipse cx="36" cy="52" rx="4.2" ry="2.1" transform="rotate(-60 36 52)" />
        <ellipse cx="32" cy="62" rx="4.2" ry="2.1" transform="rotate(-75 32 62)" />
      </g>

      {/* Grain Hull Ridges & Delicate Terminal Awns */}
      <g stroke="#a16207" strokeWidth="0.5">
        <line x1="53" y1="26" x2="57" y2="23" />
        <line x1="62" y1="26" x2="65" y2="22" />
        <line x1="71" y1="30" x2="75" y2="27" />
        <line x1="76" y1="40" x2="80" y2="40" />
        <line x1="75" y1="49" x2="79" y2="51" />
        <line x1="70" y1="58" x2="74" y2="61" />
      </g>
    </g>
      </svg>
    ),
  },
  "ilagan_giant_butaka": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "ILAGAN",
    topColor: "#ca8a04",
    bottom: "CORN",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Etching */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#eab308" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Ear of Corn with Husk Partially Opened */}
    <g id="corn-ear" transform="translate(20, 20)">
      {/* Peeling Outer Green Husk Leaves with Detailed Leaf Veins */}
      <path d="M12,48 C6,38 8,24 18,18 L24,32 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.1" />
      <path d="M48,48 C54,38 52,24 42,18 L36,32 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.1" />
      <line x1="12" y1="26" x2="20" y2="34" stroke="#4ade80" strokeWidth="0.6" />
      <line x1="48" y1="26" x2="40" y2="34" stroke="#4ade80" strokeWidth="0.6" />
      {/* Central Cob of Golden Kernels */}
      <rect x="20" y="24" width="20" height="48" rx="8" fill="#eab308" stroke="#854d0e" strokeWidth="1.3" />
      {/* Tightly Packed Kernel Grid Pattern */}
      <g stroke="#a16207" strokeWidth="0.6" fill="#fde047">
        <rect x="22" y="28" width="4" height="4" rx="1" /><rect x="28" y="28" width="4" height="4" rx="1" /><rect x="34" y="28" width="4" height="4" rx="1" />
        <rect x="22" y="34" width="4" height="4" rx="1" /><rect x="28" y="34" width="4" height="4" rx="1" /><rect x="34" y="34" width="4" height="4" rx="1" />
        <rect x="22" y="40" width="4" height="4" rx="1" /><rect x="28" y="40" width="4" height="4" rx="1" /><rect x="34" y="40" width="4" height="4" rx="1" />
        <rect x="22" y="46" width="4" height="4" rx="1" /><rect x="28" y="46" width="4" height="4" rx="1" /><rect x="34" y="46" width="4" height="4" rx="1" />
        <rect x="22" y="52" width="4" height="4" rx="1" /><rect x="28" y="52" width="4" height="4" rx="1" /><rect x="34" y="52" width="4" height="4" rx="1" />
        <rect x="22" y="58" width="4" height="4" rx="1" /><rect x="28" y="58" width="4" height="4" rx="1" /><rect x="34" y="58" width="4" height="4" rx="1" />
      </g>
      {/* Corn Silk Threads at Crown */}
      <path d="M26,24 Q30,12 28,6 M30,24 Q32,10 34,6 M34,24 Q36,14 40,8" fill="none" stroke="#b45309" strokeWidth="0.7" />
    </g>
      </svg>
    ),
  },
  "ilagan_giant_chair": {
    frame: "#1b4332",
    bg: "#d8f3dc",
    top: "ILAGAN",
    topColor: "#1b4332",
    bottom: "GIANT BUTAKA",
    bottomColor: "#7f4f24",
    renderArt: () => (
      <g>
{/* Sierra Madre Forest Backdrop */}
      <path d="M 7 32 Q 24 16 41 32 Z" fill="#2d6a4f" />
      {/* Giant Butaka wooden lounge rocking chair */}
      <path d="M 14 39 Q 24 43 34 39" stroke="#7f4f24" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Chair Seat & High Back */}
      <path d="M 18 38 L 24 33 L 31 35 L 30 22 Q 24 20 18 22 Z" fill="#dda15e" stroke="#7f4f24" strokeWidth="1" />
      {/* Extended butaka arms */}
      <line x1="16" y1="28" x2="33" y2="28" stroke="#7f4f24" strokeWidth="1.5" strokeLinecap="round" />
      {/* Philippine Eagle perched silhouette */}
      <circle cx="24" cy="18" r="2.5" fill="#582f0e" />
      <path d="M 24 18 Q 28 15 27 21 Z" fill="#582f0e" />
      </g>
    ),
  },
  "iligan_maria_cristina": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "ILIGAN",
    topColor: "#0284c7",
    bottom: "WATERFALL",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Single Powerful Waterfall (Maria Cristina Falls) Plunging Over Rugged Rock */}
    {/* Massive Basalt Rock Canyon Frame */}
    <rect x="12" y="16" width="76" height="88" fill="#1e293b" stroke="#0f172a" strokeWidth="1.3" />
    {/* Restrained Cliffside Vegetation at Edges */}
    <path d="M12,16 L24,16 L18,40 L12,40 Z" fill="#065f46" />
    <path d="M88,16 L76,16 L82,40 L88,40 Z" fill="#065f46" />
    {/* Powerful Twin-Plunge Vertical Water Columns */}
    <rect x="30" y="16" width="18" height="66" fill="#e0f2fe" opacity="0.9" />
    <rect x="52" y="16" width="18" height="66" fill="#e0f2fe" opacity="0.9" />
    {/* Fine Vertical Water Streaks & Plunge Linework */}
    <g stroke="#ffffff" strokeWidth="0.9">
      <line x1="34" y1="16" x2="33" y2="82" /><line x1="40" y1="16" x2="40" y2="82" /><line x1="45" y1="16" x2="46" y2="82" />
      <line x1="55" y1="16" x2="54" y2="82" /><line x1="61" y1="16" x2="61" y2="82" /><line x1="67" y1="16" x2="68" y2="82" />
    </g>
    {/* Raging Churning Plunge Pool & Mist at Bottom */}
    <rect x="12" y="82" width="76" height="22" fill="#0369a1" />
    <ellipse cx="50" cy="84" rx="34" ry="5" fill="#ffffff" opacity="0.8" />
    {/* Rising Fine Spray Particles */}
    <circle cx="44" cy="74" r="1.5" fill="#ffffff" /><circle cx="56" cy="74" r="1.5" fill="#ffffff" />
      </svg>
    ),
  },
  "iloilo_dinagyang": {
    frame: "#831843",
    bg: "#fffdfa",
    top: "ILOILO",
    topColor: "#831843",
    bottom: "CITY OF LOVE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
        {/* Outer Romantic Crimson & Gold Framing */}
        <rect x="8" y="8" width="84" height="104" fill="#fffdfa" stroke="#831843" strokeWidth="1.8" />
        <rect x="10.5" y="10.5" width="79" height="99" fill="#fff5f5" stroke="#f59e0b" strokeWidth="0.7" />

        {/* Sunburst Rays behind Heart */}
        <g stroke="#fed7aa" strokeWidth="0.5" opacity="0.6">
          <line x1="50" y1="44" x2="20" y2="14" /><line x1="50" y1="44" x2="32" y2="11" />
          <line x1="50" y1="44" x2="50" y2="9" /><line x1="50" y1="44" x2="68" y2="11" />
          <line x1="50" y1="44" x2="80" y2="14" />
        </g>

        {/* ROYAL BAROQUE "HEART OF THE PHILIPPINES" CREST */}
        <path
          d="M 50 73 C 32 57, 16 45, 16 29 C 16 18, 26 12, 36 12 C 43 12, 47 16, 50 21 C 53 16, 57 12, 64 12 C 74 12, 84 18, 84 29 C 84 45, 68 57, 50 73 Z"
          fill="#4c0519"
          opacity="0.2"
        />
        <path
          d="M 50 72 C 32 56, 16 44, 16 28 C 16 17, 26 11, 36 11 C 43 11, 47 15, 50 20 C 53 15, 57 11, 64 11 C 74 11, 84 17, 84 28 C 84 44, 68 56, 50 72 Z"
          fill="#991b1b"
          stroke="#ca8a04"
          strokeWidth="1.8"
        />
        <path
          d="M 50 68 C 34 54, 20 43, 20 30 C 20 20, 28 15, 36 15 C 42 15, 46 19, 50 23 C 54 19, 58 15, 64 15 C 72 15, 80 20, 80 30 C 80 43, 66 54, 50 68 Z"
          fill="#fff1f2"
          stroke="#fbbf24"
          strokeWidth="1.1"
        />

        {/* MOLO CHURCH (Inside Heart Window) */}
        <g transform="translate(0, -6)">
          <polygon points="46,38 50,33 54,38" fill="#881337" />
          <rect x="47" y="38" width="6" height="12" fill="#881337" />
          <circle cx="50" cy="42" r="1.8" fill="#fde047" stroke="#881337" strokeWidth="0.4" />
          
          <polygon points="38,41 41,29 44,41" fill="#9f1239" />
          <rect x="39" y="41" width="4" height="9" fill="#9f1239" />
          <rect x="40" y="43" width="2" height="4" rx="1" fill="#fff1f2" />

          <polygon points="56,41 59,29 62,41" fill="#9f1239" />
          <rect x="57" y="41" width="4" height="9" fill="#9f1239" />
          <rect x="58" y="43" width="2" height="4" rx="1" fill="#fff1f2" />

          <path d="M 36 50 L 64 50 L 64 56 L 36 56 Z" fill="#881337" />
          <path d="M 48 56 A 2 3 0 0 1 52 56 Z" fill="#fff1f2" />
        </g>

        {/* TWO WHITE LOVE DOVES IN FLIGHT */}
        <g transform="translate(23, 16)">
          <path d="M 8 9 Q 2 3 0 0 Q 6 3 10 7 Q 14 2 18 1 Q 13 7 12 10 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
          <ellipse cx="9" cy="8.5" rx="2.5" ry="1.5" transform="rotate(30 9 8.5)" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
          <path d="M 12 10 L 14 12 M 13 10.5 L 14.5 10" stroke="#15803d" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        <g transform="translate(59, 16)">
          <path d="M 10 9 Q 16 3 18 0 Q 12 3 8 7 Q 4 2 0 1 Q 5 7 6 10 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
          <ellipse cx="9" cy="8.5" rx="2.5" ry="1.5" transform="rotate(-30 9 8.5)" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
        </g>

        <polygon points="50,54 53,58 50,62 47,58" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

        {/* ILOILO STRAIT & FAMOUS PARAW REGATTA */}
        <g fill="none" strokeLinecap="round">
          <path d="M 14 84 Q 26 80 38 84 Q 50 88 62 84 Q 74 80 86 84" stroke="#0284c7" strokeWidth="1.8" />
          <path d="M 12 90 Q 24 86 36 90 Q 48 94 60 90 Q 72 86 88 90" stroke="#0369a1" strokeWidth="1.4" />
          <path d="M 16 96 Q 28 92 40 96 Q 52 100 64 96 Q 76 92 84 96" stroke="#075985" strokeWidth="1" />
        </g>

        {/* The Iloilo Paraw Sailboat */}
        <g id="paraw-sail" transform="translate(50, 77)">
          <path d="M -14 4 Q 0 7 14 4 Q 16 5 12 6 Q 0 7 -12 6 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.6" />
          <line x1="-12" y1="5" x2="-6" y2="7" stroke="#ca8a04" strokeWidth="0.7" />
          <line x1="12" y1="5" x2="6" y2="7" stroke="#ca8a04" strokeWidth="0.7" />
          <line x1="-10" y1="7.5" x2="10" y2="7.5" stroke="#d97706" strokeWidth="0.9" />

          <polygon points="0,-18 10,2 -4,2" fill="#ea580c" stroke="#9a3412" strokeWidth="0.7" />
          <polygon points="0,-18 4,-4 -1,-4" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
          <polygon points="-1,-17 -11,1 -3,1" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
        </g>

        <g stroke="#e11d48" fill="#fda4af" strokeWidth="0.6">
          <circle cx="16" cy="102" r="1.5" /><circle cx="84" cy="102" r="1.5" />
          <path d="M 13 104 Q 16 101 19 104 M 81 104 Q 84 101 87 104" fill="none" stroke="#be123c" />
        </g>
      </svg>
    ),
  },
  "iloilo_molo": {
    frame: "#831843",
    bg: "#fffdfa",
    top: "ILOILO",
    topColor: "#831843",
    bottom: "CITY OF LOVE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
        <rect x="8" y="8" width="84" height="104" fill="#fffdfa" stroke="#831843" strokeWidth="1.8" />
        <rect x="10.5" y="10.5" width="79" height="99" fill="#fff5f5" stroke="#f59e0b" strokeWidth="0.7" />

        <g stroke="#fed7aa" strokeWidth="0.5" opacity="0.6">
          <line x1="50" y1="44" x2="20" y2="14" /><line x1="50" y1="44" x2="32" y2="11" />
          <line x1="50" y1="44" x2="50" y2="9" /><line x1="50" y1="44" x2="68" y2="11" />
          <line x1="50" y1="44" x2="80" y2="14" />
        </g>

        <path
          d="M 50 73 C 32 57, 16 45, 16 29 C 16 18, 26 12, 36 12 C 43 12, 47 16, 50 21 C 53 16, 57 12, 64 12 C 74 12, 84 18, 84 29 C 84 45, 68 57, 50 73 Z"
          fill="#4c0519"
          opacity="0.2"
        />
        <path
          d="M 50 72 C 32 56, 16 44, 16 28 C 16 17, 26 11, 36 11 C 43 11, 47 15, 50 20 C 53 15, 57 11, 64 11 C 74 11, 84 17, 84 28 C 84 44, 68 56, 50 72 Z"
          fill="#991b1b"
          stroke="#ca8a04"
          strokeWidth="1.8"
        />
        <path
          d="M 50 68 C 34 54, 20 43, 20 30 C 20 20, 28 15, 36 15 C 42 15, 46 19, 50 23 C 54 19, 58 15, 64 15 C 72 15, 80 20, 80 30 C 80 43, 66 54, 50 68 Z"
          fill="#fff1f2"
          stroke="#fbbf24"
          strokeWidth="1.1"
        />

        <g transform="translate(0, -6)">
          <polygon points="46,38 50,33 54,38" fill="#881337" />
          <rect x="47" y="38" width="6" height="12" fill="#881337" />
          <circle cx="50" cy="42" r="1.8" fill="#fde047" stroke="#881337" strokeWidth="0.4" />
          
          <polygon points="38,41 41,29 44,41" fill="#9f1239" />
          <rect x="39" y="41" width="4" height="9" fill="#9f1239" />
          <rect x="40" y="43" width="2" height="4" rx="1" fill="#fff1f2" />

          <polygon points="56,41 59,29 62,41" fill="#9f1239" />
          <rect x="57" y="41" width="4" height="9" fill="#9f1239" />
          <rect x="58" y="43" width="2" height="4" rx="1" fill="#fff1f2" />

          <path d="M 36 50 L 64 50 L 64 56 L 36 56 Z" fill="#881337" />
          <path d="M 48 56 A 2 3 0 0 1 52 56 Z" fill="#fff1f2" />
        </g>

        <g transform="translate(23, 16)">
          <path d="M 8 9 Q 2 3 0 0 Q 6 3 10 7 Q 14 2 18 1 Q 13 7 12 10 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
          <ellipse cx="9" cy="8.5" rx="2.5" ry="1.5" transform="rotate(30 9 8.5)" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
          <path d="M 12 10 L 14 12 M 13 10.5 L 14.5 10" stroke="#15803d" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        <g transform="translate(59, 16)">
          <path d="M 10 9 Q 16 3 18 0 Q 12 3 8 7 Q 4 2 0 1 Q 5 7 6 10 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
          <ellipse cx="9" cy="8.5" rx="2.5" ry="1.5" transform="rotate(-30 9 8.5)" fill="#ffffff" stroke="#991b1b" strokeWidth="0.6" />
        </g>

        <polygon points="50,54 53,58 50,62 47,58" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

        <g fill="none" strokeLinecap="round">
          <path d="M 14 84 Q 26 80 38 84 Q 50 88 62 84 Q 74 80 86 84" stroke="#0284c7" strokeWidth="1.8" />
          <path d="M 12 90 Q 24 86 36 90 Q 48 94 60 90 Q 72 86 88 90" stroke="#0369a1" strokeWidth="1.4" />
          <path d="M 16 96 Q 28 92 40 96 Q 52 100 64 96 Q 76 92 84 96" stroke="#075985" strokeWidth="1" />
        </g>

        <g id="paraw-sail-molo" transform="translate(50, 77)">
          <path d="M -14 4 Q 0 7 14 4 Q 16 5 12 6 Q 0 7 -12 6 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.6" />
          <line x1="-12" y1="5" x2="-6" y2="7" stroke="#ca8a04" strokeWidth="0.7" />
          <line x1="12" y1="5" x2="6" y2="7" stroke="#ca8a04" strokeWidth="0.7" />
          <line x1="-10" y1="7.5" x2="10" y2="7.5" stroke="#d97706" strokeWidth="0.9" />

          <polygon points="0,-18 10,2 -4,2" fill="#ea580c" stroke="#9a3412" strokeWidth="0.7" />
          <polygon points="0,-18 4,-4 -1,-4" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
          <polygon points="-1,-17 -11,1 -3,1" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
        </g>

        <g stroke="#e11d48" fill="#fda4af" strokeWidth="0.6">
          <circle cx="16" cy="102" r="1.5" /><circle cx="84" cy="102" r="1.5" />
          <path d="M 13 104 Q 16 101 19 104 M 81 104 Q 84 101 87 104" fill="none" stroke="#be123c" />
        </g>
      </svg>
    ),
  },
  "imus_battle_of_alapan": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "IMUS",
    topColor: "#15803d",
    bottom: "LOCAL RICE CAKE",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Circular Plate */}
    <ellipse cx="50" cy="58" rx="34" ry="28" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="32" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Single Traditional Cavite-Style Rice Cake (Kakanin) Specimen */}
    <g id="rice-cake" transform="translate(16, 26)">
      {/* Steamed Banana Leaf Wrapping Base */}
      <path d="M4,44 C8,28 22,20 40,18 C56,16 64,26 64,44 C64,58 52,66 36,66 C18,66 4,58 4,44 Z" fill="#166534" stroke="#14532d" strokeWidth="1.2" />
      {/* Banana Leaf Veins */}
      <line x1="8" y1="44" x2="60" y2="44" stroke="#14532d" strokeWidth="0.8" />
      <line x1="20" y1="28" x2="26" y2="60" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="36" y1="22" x2="40" y2="62" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="50" y1="26" x2="52" y2="58" stroke="#22c55e" strokeWidth="0.5" />
      {/* Steamed Rice Cake (Glutinous / Kalamay) Square on Leaf */}
      <rect x="18" y="28" width="32" height="26" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.1" />
      <rect x="20" y="30" width="28" height="22" rx="2" fill="#ca8a04" opacity="0.3" />
      {/* Latik (Toasted Coconut Curd) Topping Bits */}
      <g fill="#78350f">
        <circle cx="26" cy="36" r="1.8" /><circle cx="34" cy="34" r="1.5" />
        <circle cx="42" cy="38" r="2" /><circle cx="28" cy="44" r="1.6" />
        <circle cx="36" cy="46" r="2.2" /><circle cx="44" cy="44" r="1.5" />
      </g>
    </g>
      </svg>
    ),
  },
  "imus_flag_capital": {
    frame: "#1d3557",
    bg: "#fdf0d5",
    top: "IMUS",
    topColor: "#d90429",
    bottom: "FLAG CAPITAL",
    bottomColor: "#1d3557",
    renderArt: () => (
      <g>
{/* Battle of Alapan Waving Philippine Flag */}
      <path d="M 14 17 Q 24 14 36 17 L 36 29 Q 24 26 14 29 Z" fill="#1d3557" />
      <path d="M 14 23 Q 24 20 36 23 L 36 29 Q 24 26 14 29 Z" fill="#d90429" />
      {/* White Triangle on Left */}
      <polygon points="14,17 24,23 14,29" fill="#ffffff" />
      <circle cx="17" cy="23" r="1.5" fill="#fcbf49" />
      {/* Flagpole */}
      <line x1="14" y1="14" x2="14" y2="43" stroke="#7f4f24" strokeWidth="1.5" strokeLinecap="round" />
      {/* Battle Monument Base */}
      <polygon points="9,44 39,44 35,41 13,41" fill="#1d3557" />
      </g>
    ),
  },
  "iriga_buhi_sinarapan": {
    frame: "#1e293b",
    bg: "#f0fdf4",
    top: "IRIGA",
    topColor: "#1e293b",
    bottom: "LAKE BUHI",
    bottomColor: "#06b6d4",
    renderArt: () => (
      <g>
{/* Mount Iriga volcano */}
      <polygon points="7,34 24,18 41,34" fill="#1e293b" />
      {/* Lake Buhi waters */}
      <rect x="7" y="34" width="34" height="10" fill="#06b6d4" />
      {/* Tiny Sinarapan Fish jumping */}
      <ellipse cx="20" cy="30" rx="4" ry="1.5" fill="#ffffff" stroke="#0e7490" strokeWidth="0.5" />
      <polygon points="16,30 14,28 14,32" fill="#0e7490" />
      <ellipse cx="28" cy="27" rx="3.5" ry="1.2" fill="#ffffff" stroke="#0e7490" strokeWidth="0.5" />
      </g>
    ),
  },
  "iriga_mount_asog": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "IRIGA",
    topColor: "#a16207",
    bottom: "HARVEST BASKET",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Radial Backdrop */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Single Traditional Woven Harvest Basket with Produce */}
    <g id="harvest-basket" transform="translate(16, 26)">
      {/* Woven Basket Body (Dominant Visual Feature) */}
      <path d="M6,28 L12,54 C16,62 30,64 34,64 C38,64 52,62 56,54 L62,28 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.3" />
      {/* Reinforced Woven Rim */}
      <ellipse cx="34" cy="28" rx="28" ry="7" fill="#fef08a" stroke="#854d0e" strokeWidth="1.3" />
      {/* Intricate Basket Weave Texture Hatching */}
      <g stroke="#78350f" strokeWidth="0.7">
        <line x1="8" y1="36" x2="24" y2="60" /><line x1="18" y1="34" x2="32" y2="62" />
        <line x1="30" y1="34" x2="42" y2="62" /><line x1="42" y1="34" x2="52" y2="58" />
        <line x1="60" y1="36" x2="44" y2="60" /><line x1="50" y1="34" x2="36" y2="62" />
        <line x1="38" y1="34" x2="26" y2="62" /><line x1="26" y1="34" x2="16" y2="58" />
      </g>
      {/* Overflowing Agricultural Produce (Grains, Fruits, Greens) */}
      <circle cx="26" cy="24" r="6" fill="#ea580c" stroke="#9a3412" strokeWidth="0.7" />
      <circle cx="36" cy="20" r="7" fill="#15803d" stroke="#14532d" strokeWidth="0.7" />
      <circle cx="44" cy="23" r="5.5" fill="#eab308" stroke="#a16207" strokeWidth="0.7" />
    </g>
      </svg>
    ),
  },
  "isabela_malamawi_beach": {
    frame: "#ea580c",
    bg: "#fff7ed",
    top: "ISABELA",
    topColor: "#ea580c",
    bottom: "YAKAN TEXTILE",
    bottomColor: "#ea580c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Museum Cultural Specimen Frame */}
    <rect x="14" y="16" width="72" height="88" rx="1" fill="#7c2d12" stroke="#451a03" strokeWidth="1.3" />
    {/* Single Yakan Woven Textile Displayed Flat (Intricate Diamond/Tennun Geometry) */}
    <g id="yakan-textile">
      <rect x="18" y="20" width="64" height="80" fill="#ea580c" stroke="#facc15" strokeWidth="0.8" />
      {/* Alternating Strong Color Bands */}
      <rect x="18" y="28" width="64" height="12" fill="#15803d" />
      <rect x="18" y="52" width="64" height="16" fill="#facc15" />
      <rect x="18" y="80" width="64" height="12" fill="#15803d" />
      {/* Intricate Geometric Diamonds & Zigzags (Seputangan Motif) */}
      <g stroke="#ffffff" strokeWidth="1" fill="none">
        <path d="M22,34 L28,28 L34,34 L40,28 L46,34 L52,28 L58,34 L64,28 L70,34 L76,28" />
        <path d="M22,86 L28,80 L34,86 L40,80 L46,86 L52,80 L58,86 L64,80 L70,86 L76,80" />
      </g>
      {/* Center High-Complexity Diamond Matrix */}
      <g fill="#dc2626" stroke="#7c2d12" strokeWidth="0.8">
        <polygon points="32,60 38,54 44,60 38,66" />
        <polygon points="50,60 56,54 62,60 56,66" />
        <polygon points="41,54 47,48 53,54 47,60" fill="#15803d" />
        <polygon points="41,66 47,60 53,66 47,72" fill="#15803d" />
      </g>
    </g>
      </svg>
    ),
  },
  "jakarta_monas": {
    frame: "#b91c1c",
    bg: "#fefae0",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Merdeka Square green lawns */}
      <rect x="6" y="38" width="36" height="5" fill="#15803d" />
      {/* Monas Monument tiered marble base */}
      <polygon points="12,38 36,38 33,33 15,33" fill="#e2e8f0" stroke="#b91c1c" strokeWidth="0.5" />
      <rect x="18" y="29" width="12" height="4" fill="#f8fafc" stroke="#b91c1c" strokeWidth="0.5" />
      {/* 132m Marble Obelisk Shaft */}
      <polygon points="22.5,29 25.5,29 24.8,14 23.2,14" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.6" />
      {/* Bronze Flame coated in gold leaf */}
      <path d="M 24 14 C 22.5 11.5 22 9 24 6.5 C 26 9 25.5 11.5 24 14 Z" fill="#eab308" />
      <path d="M 24 13 C 23.2 11 23.2 9.5 24 8 C 24.8 9.5 24.8 11 24 13 Z" fill="#ef4444" />
      {/* Palm silhouettes on left and right */}
      <path d="M 8 38 Q 9 32 10 27 M 10 38 Q 11 31 12 28 M 38 38 Q 37 32 36 27 M 40 38 Q 39 31 38 28" stroke="#166534" strokeWidth="0.8" fill="none" />
      </g>
    ),
  },
  "kabankalan_magaso_falls": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "KABANKALAN",
    topColor: "#047857",
    bottom: "SINIGAYAN MASK",
    bottomColor: "#047857",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Elaborate Sinigayan Festival Mask (Symmetrical Shell-Inspired Patterns) */}
    <g id="sinigayan-mask">
      {/* Carved Seashell Headdress Crown */}
      <path d="M30,34 Q50,16 70,34 Q50,26 30,34 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.1" />
      {/* Symmetrical Shell Ridges */}
      <line x1="50" y1="20" x2="50" y2="34" stroke="#78350f" strokeWidth="1" />
      <line x1="42" y1="24" x2="46" y2="34" stroke="#78350f" strokeWidth="0.8" />
      <line x1="58" y1="24" x2="54" y2="34" stroke="#78350f" strokeWidth="0.8" />
      {/* Main Mask Face Body */}
      <ellipse cx="50" cy="62" rx="22" ry="26" fill="#047857" stroke="#022c22" strokeWidth="1.3" />
      {/* Pearlescent Shell Inlays Around Eyes and Mouth */}
      <ellipse cx="42" cy="54" rx="4" ry="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="42" cy="54" r="1.5" fill="#0f172a" />
      <ellipse cx="58" cy="54" rx="4" ry="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="58" cy="54" r="1.5" fill="#0f172a" />
      {/* Broad Festive Smile */}
      <path d="M36,68 Q50,82 64,68" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "kidapawan_highland_fruits": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "KIDAPAWAN",
    topColor: "#065f46",
    bottom: "MOUNT APO MAJESTIC PEAK",
    bottomColor: "#065f46",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Atmospheric Highland Sky Lines */}
    <g opacity="0.3" stroke="#047857" strokeWidth="0.5">
      <line x1="10" y1="20" x2="90" y2="20" strokeDasharray="4 3" />
      <line x1="12" y1="28" x2="88" y2="28" strokeDasharray="3 2" />
    </g>

    <g id="mount-apo-stratovolcano">
      {/* Distant Mount Apo Massive Volcanic Cone (Matching Photo 4) */}
      <path d="
        M 10 74
        L 10 68
        C 22 66, 32 58, 42 46
        C 46 41, 48 34, 52 32
        C 54 32, 56 34, 60 38
        C 68 46, 78 58, 90 68
        L 90 74 Z
      " fill="#047857" stroke="#022c22" strokeWidth="1.2" />

      {/* Rugged Volcanic Ridges & Crater Ravines on Slopes */}
      <g stroke="#10b981" strokeWidth="0.6" opacity="0.7">
        <path d="M 52 32 L 48 54 M 52 32 L 56 56 M 46 44 L 38 64 M 58 42 L 66 64" />
      </g>

      {/* Sulfur / Rock Highlights on Apo Summit Crag */}
      <polygon points="51,32 53,32 54,36 50,36" fill="#fef08a" />

      {/* Midground Layered Forest Foothills */}
      <path d="
        M 10 74
        Q 28 66 50 70
        Q 72 65 90 74
        L 90 84 L 10 84 Z
      " fill="#065f46" stroke="#022c22" strokeWidth="1.0" />

      {/* Foreground Tranquil Mirror Lake / Highland Plain (Matching Photo 4) */}
      <rect x="10" y="84" width="80" height="18" fill="#0284c7" stroke="#0369a1" strokeWidth="0.9" />

      {/* Water Reflection of Mount Apo Silhouette */}
      <g stroke="#38bdf8" strokeWidth="0.8" opacity="0.65">
        <line x1="30" y1="87" x2="70" y2="87" />
        <line x1="38" y1="91" x2="62" y2="91" />
        <line x1="44" y1="95" x2="56" y2="95" />
      </g>
    </g>
      </svg>
    ),
  },
  "koronadal_tnalak": {
    frame: "#991b1b",
    bg: "#fef3c7",
    top: "KORONADAL",
    topColor: "#991b1b",
    bottom: "T'NALAK WEAVE",
    bottomColor: "#18181b",
    renderArt: () => (
      <g>
{/* Sacred T'boli T'nalak Geometric Textile Tapestry */}
      <rect x="10" y="15" width="28" height="28" fill="#18181b" rx="1" />
      {/* Intricate Geometric Diamonds & Zigzags in Crimson and Cream */}
      <polygon points="24,17 32,25 24,33 16,25" fill="#991b1b" />
      <polygon points="24,20 29,25 24,30 19,25" fill="#fef3c7" />
      <polygon points="24,23 26,25 24,27 22,25" fill="#18181b" />
      {/* Corner geometric motifs */}
      <polygon points="12,17 16,21 12,25" fill="#fef3c7" />
      <polygon points="36,17 32,21 36,25" fill="#fef3c7" />
      <polygon points="12,33 16,37 12,41" fill="#fef3c7" />
      <polygon points="36,33 32,37 36,41" fill="#fef3c7" />
      </g>
    ),
  },
  "kuching_cat_monument": {
    frame: "#b91c1c",
    bg: "#fdf2f8",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Mount Santubong silhouette */}
      <polygon points="28,20 16,34 40,34" fill="#fbcfe8" opacity="0.6" />
      {/* Darul Hana S-Bridge spanning Sarawak River */}
      <path d="M 6 31 Q 20 27 28 32 Q 36 35 42 30" stroke="#b91c1c" strokeWidth="1" fill="none" />
      <line x1="28" y1="24" x2="28" y2="32" stroke="#b91c1c" strokeWidth="1.2" />
      {/* Sarawak River water */}
      <rect x="6" y="35" width="36" height="8" fill="#0284c7" />
      <line x1="8" y1="37" x2="24" y2="37" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      {/* Great Cat Monument (Patung Kucing) in foreground */}
      {/* Body & tail */}
      <ellipse cx="16" cy="33" rx="5" ry="4" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.7" />
      <path d="M 20 34 Q 23 32 22 29" stroke="#b91c1c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Cat head with alert triangular ears */}
      <circle cx="15" cy="26" r="3.2" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.7" />
      <polygon points="12.5,24 11.5,20 14.5,23" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.5" />
      <polygon points="15.5,23 18.5,20 17.5,24" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.5" />
      {/* Raised welcoming paw */}
      <ellipse cx="12" cy="29" rx="1.2" ry="2" fill="#ffffff" stroke="#b91c1c" strokeWidth="0.5" />
      </g>
    ),
  },
  "la_carlota_iron_dinosaur": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "LA CARLOTA",
    topColor: "#15803d",
    bottom: "SUGARCANE",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Mature Sugarcane Stalk with Segmented Stem and Long Curved Leaves */}
    <g transform="translate(50, 58) rotate(-30) translate(-50, -58)">
      <rect x="47" y="14" width="6" height="22" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="36" x2="55" y2="36" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="36" width="6" height="24" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="60" x2="55" y2="60" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="60" width="6" height="24" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="84" x2="55" y2="84" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="84" width="6" height="20" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      <path d="M47,36 C32,28 18,34 10,48 C22,44 36,42 47,36 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <path d="M53,60 C68,52 82,58 90,72 C78,68 64,66 53,60 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
    </g>
      </svg>
    ),
  },
  "la_union_surf": {
    frame: "#0077b6",
    bg: "#caf0f8",
    top: "LA UNION",
    topColor: "#03045e",
    bottom: "SURFING",
    bottomColor: "#f77f00",
    renderArt: () => (
      <g>
{/* Massive barrel wave */}
      <path d="M 7 42 C 14 42, 16 26, 26 21 C 36 16, 40 27, 34 29 C 29 31, 26 28, 26 31 C 26 35, 36 38, 41 42 Z" fill="#0077b6" />
      <path d="M 12 42 C 18 42, 20 30, 27 26 C 33 22, 35 29, 31 31 Z" fill="#00b4d8" />
      {/* Wave froth white */}
      <circle cx="34" cy="28" r="2.5" fill="#ffffff" />
      <circle cx="37" cy="29" r="1.8" fill="#ffffff" />
      {/* Upright Surfboard planted in sand */}
      <ellipse cx="14" cy="30" rx="2.5" ry="11" fill="#f77f00" transform="rotate(-15 14 30)" />
      <line x1="11" y1="20" x2="17" y2="40" stroke="#ffffff" strokeWidth="0.8" />
      {/* Sun */}
      <circle cx="33" cy="18" r="4" fill="#fcbf49" />
      </g>
    ),
  },
  "lamitan_yakan_tennun": {
    frame: "#dc2626",
    bg: "#1e1b4b",
    top: "LAMITAN",
    topColor: "#facc15",
    bottom: "YAKAN TENNUN",
    bottomColor: "#38bdf8",
    renderArt: () => (
      <g>
{/* Yakan Tennun Handwoven Geometric Diamond Textile */}
      <rect x="10" y="15" width="28" height="28" fill="#1e1b4b" rx="1" />
      {/* Diamond patterns */}
      <polygon points="24,17 32,25 24,33 16,25" fill="#dc2626" />
      <polygon points="24,20 29,25 24,30 19,25" fill="#facc15" />
      <polygon points="24,23 26,25 24,27 22,25" fill="#ffffff" />
      {/* Flanking geometric diamonds */}
      <polygon points="14,19 18,23 14,27 10,23" fill="#38bdf8" />
      <polygon points="34,19 38,23 34,27 30,23" fill="#38bdf8" />
      <polygon points="24,33 28,37 24,41 20,37" fill="#38bdf8" />
      </g>
    ),
  },
  "laoag_sinking_belfry": {
    frame: "#78350f",
    bg: "#fffbeb",
    top: "LAOAG",
    topColor: "#78350f",
    bottom: "TOBACCO LEAF",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Antique Botanical Engraving Frame */}
    <rect x="14" y="14" width="72" height="92" fill="none" stroke="#b45309" strokeWidth="0.6" strokeDasharray="3 2" />
    {/* One Broad Tobacco Leaf Rendered as Antique Botanical Plate */}
    <g id="laoag-tobacco-plate">
      {/* Broad Leaf Blade with Delicate Curled Margin */}
      <path d="M50,18 C68,30 76,54 70,78 C64,92 56,100 50,104 C44,100 36,92 30,78 C24,54 32,30 50,18 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.3" />
      <path d="M50,22 C64,34 70,54 64,74 C58,86 52,94 50,98 C48,94 42,86 36,74 C30,54 36,34 50,22 Z" fill="#b45309" />
      {/* Sturdy Stem / Central Vein */}
      <path d="M50,16 L50,106" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />
      {/* Antique Botanical Hatching Veins */}
      <g stroke="#fde68a" strokeWidth="0.7" fill="none">
        <path d="M50,32 Q62,28 68,34" /><path d="M50,32 Q38,28 32,34" />
        <path d="M50,46 Q64,42 68,50" /><path d="M50,46 Q36,42 32,50" />
        <path d="M50,60 Q64,56 68,66" /><path d="M50,60 Q36,56 32,66" />
        <path d="M50,74 Q62,72 66,80" /><path d="M50,74 Q38,72 34,80" />
      </g>
    </g>
      </svg>
    ),
  },
  "laoag_sinking_tower": {
    frame: "#e09f3e",
    bg: "#fefae0",
    top: "LAOAG",
    topColor: "#d94e34",
    bottom: "SINKING TOWER",
    bottomColor: "#335c67",
    renderArt: () => (
      <g>
{/* Golden Sunset sky */}
      <rect x="8" y="14" width="32" height="18" fill="#fcbf49" opacity="0.4" />
      <circle cx="15" cy="20" r="4" fill="#e76f51" />
      {/* Laoag Sinking Bell Tower */}
      <rect x="21" y="20" width="14" height="23" fill="#99582a" rx="1" />
      <rect x="23" y="16" width="10" height="5" fill="#6f1d1b" rx="0.5" />
      <polygon points="28,11 24,16 32,16" fill="#99582a" />
      <circle cx="28" cy="25" r="2.2" fill="#fefae0" />
      <path d="M 26 43 V 35 A 2 2 0 0 1 30 35 V 43 Z" fill="#43281c" />
      {/* Coastal Bangui Windmill in background */}
      <line x1="12" y1="23" x2="12" y2="38" stroke="#335c67" strokeWidth="1" />
      <line x1="12" y1="23" x2="8" y2="20" stroke="#335c67" strokeWidth="0.8" />
      <line x1="12" y1="23" x2="16" y2="20" stroke="#335c67" strokeWidth="0.8" />
      <line x1="12" y1="23" x2="12" y2="28" stroke="#335c67" strokeWidth="0.8" />
      </g>
    ),
  },
  "lapu_lapu_guitar": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "LAPU-LAPU",
    topColor: "#78350f",
    bottom: "KAMPILAN",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Traditional Kampilan Sword Displayed Diagonally (No Person) */}
    <g transform="translate(50, 58) rotate(-42) translate(-50, -58)">
      {/* Distinctive Carved Crocodile / Bakunawa Hilt (Pommel) */}
      <path d="M10,54 C10,48 14,46 20,48 L28,52 L28,62 L20,64 C14,64 10,60 10,54 Z" fill="#451a03" stroke="#1c0702" strokeWidth="1.1" />
      {/* Forked Hilt Tail / Carved Jaws of Pommel */}
      <polygon points="10,50 4,44 10,54" fill="#451a03" stroke="#1c0702" strokeWidth="0.7" />
      <polygon points="10,58 4,64 10,54" fill="#451a03" stroke="#1c0702" strokeWidth="0.7" />
      {/* Crossguard with Tufted Fiber Holes */}
      <rect x="28" y="48" width="4" height="18" rx="1" fill="#78350f" stroke="#1c0702" strokeWidth="0.8" />
      {/* Long, Single-Edged Heavy Blade Widening Toward the Tip */}
      {/* Narrow base at guard, widening dramatically toward the spike/crest tip */}
      <path d="M32,53 L82,49 L92,52 L90,62 L80,60 L32,59 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.3" />
      {/* Blade Fuller & Spine Shading */}
      <line x1="34" y1="55" x2="84" y2="52" stroke="#64748b" strokeWidth="1" />
      {/* Characteristic Notched / Spiked Tip Contour (Kampilan Tip Crest) */}
      <polygon points="86,49 92,46 90,52" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
      {/* Ground Cutting Edge */}
      <line x1="32" y1="59" x2="88" y2="61" stroke="#ffffff" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "las_pinas_bamboo_organ": {
    frame: "#78350f",
    bg: "#fefdfa",
    top: "LAS PIÑAS",
    topColor: "#78350f",
    bottom: "BAMBOO ORGAN",
    bottomColor: "#78350f",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/las_pinas_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "ligao_kawakawa": {
    frame: "#eab308",
    bg: "#fefae0",
    top: "LIGAO",
    topColor: "#ca8a04",
    bottom: "KAWA-KAWA HILL",
    bottomColor: "#16a34a",
    renderArt: () => (
      <g>
{/* Kawa-Kawa Hill Amphitheater Rim */}
      <path d="M 8 36 Q 24 23 40 36 V 44 H 8 Z" fill="#16a34a" />
      <ellipse cx="24" cy="33" rx="10" ry="3.5" fill="#15803d" />
      {/* Golden Sunflower Blossoms */}
      <circle cx="18" cy="25" r="3.5" fill="#eab308" />
      <circle cx="18" cy="25" r="1.5" fill="#78350f" />
      <circle cx="30" cy="27" r="3" fill="#eab308" />
      <circle cx="30" cy="27" r="1.2" fill="#78350f" />
      </g>
    ),
  },
  "ligao_sunflower": {
    frame: "#14532d",
    bg: "#fcfbf7",
    top: "LIGAO",
    topColor: "#14532d",
    bottom: "BICOL PINANGAT",
    bottomColor: "#14532d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Culinary Medallion */}
    <g opacity="0.25" stroke="#15803d" strokeWidth="0.5">
      <ellipse cx="50" cy="62" rx="36" ry="28" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="bicol-pinangat" transform="translate(6, 10)">
      {/* Traditional Clay / Ceramic Serving Plate */}
      <ellipse cx="44" cy="68" rx="34" ry="16" fill="#f5f5f4" stroke="#78716c" strokeWidth="1.2" />
      <ellipse cx="44" cy="67" rx="30" ry="13" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="0.8" />

      {/* Pool of Glistening Rich Coconut Milk (Gata) Sauce */}
      <ellipse cx="44" cy="66" rx="26" ry="10" fill="#fef9c3" stroke="#eab308" strokeWidth="0.8" />
      {/* Gata Sauce Oil Droplets & Chili Oil Ringlets */}
      <circle cx="28" cy="68" r="1.5" fill="#dc2626" opacity="0.8" />
      <circle cx="58" cy="64" r="1.3" fill="#dc2626" opacity="0.8" />
      <circle cx="52" cy="70" r="1.0" fill="#dc2626" opacity="0.7" />

      {/* Authentic Folded Gabi (Taro) Leaf Pinangat Parcel (Rectangular Pillow) */}
      {/* Bottom leaf layer shadow */}
      <path d="M 22 56 Q 44 48 66 56 Q 64 68 44 72 Q 24 68 22 56 Z" fill="#052e16" stroke="#022c22" strokeWidth="1.2" />

      {/* Main Layered Taro Leaf Wrapper (Deep Forest Green with Veins) */}
      <path d="
        M 24 54
        Q 44 46 64 54
        L 62 64
        Q 44 70 26 64 Z
      " fill="#14532d" stroke="#052e16" strokeWidth="1.0" />

      {/* Top Folded Leaf Envelope Flaps */}
      <polygon points="26,54 44,60 62,54 44,48" fill="#166534" stroke="#14532d" strokeWidth="0.9" />

      {/* Taro Leaf Intricate Vein Engraving Lines */}
      <g stroke="#22c55e" strokeWidth="0.5" opacity="0.75">
        <line x1="44" y1="48" x2="44" y2="60" />
        <line x1="44" y1="52" x2="34" y2="50" />
        <line x1="44" y1="56" x2="36" y2="58" />
        <line x1="44" y1="52" x2="54" y2="50" />
        <line x1="44" y1="56" x2="52" y2="58" />
      </g>

      {/* Natural Twine / Fiber Tie Band (Cordon) Wrapping Center of Parcel */}
      <path d="M 42 47 L 42 61" stroke="#ca8a04" strokeWidth="1.2" />
      <path d="M 46 47 L 46 61" stroke="#eab308" strokeWidth="0.8" />
      {/* Tied Knot on Top */}
      <ellipse cx="44" cy="54" rx="2.5" ry="1.5" fill="#ca8a04" stroke="#854d0e" strokeWidth="0.6" />

      {/* Creamy Coconut Milk Ladled Over Top Surface */}
      <path d="M 38 52 Q 44 54 50 51 Q 46 56 40 55 Z" fill="#fefce8" opacity="0.85" />
      <ellipse cx="44" cy="53" rx="2" ry="0.8" fill="#ffffff" />

      {/* Fresh Sliced Red Siling Labuyo Chili Garnish on Top */}
      <path d="M 40 50 Q 43 46 47 48" fill="none" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "lipa_coffee": {
    frame: "#3e2723",
    bg: "#fff8e1",
    top: "LIPA",
    topColor: "#3e2723",
    bottom: "KAPENG BARAKO",
    bottomColor: "#8d6e63",
    renderArt: () => (
      <g>
{/* Steaming Coffee Cup */}
      <path d="M 15 28 C 15 37, 31 37, 31 28 Z" fill="#4e342e" />
      <ellipse cx="23" cy="28" rx="8" ry="2.5" fill="#3e2723" />
      {/* Cup handle */}
      <path d="M 31 29 C 35 29, 35 34, 30 34" stroke="#4e342e" strokeWidth="1.8" fill="none" />
      {/* Saucer */}
      <ellipse cx="23" cy="38" rx="12" ry="2" fill="#8d6e63" />
      {/* Steaming Aroma vapors */}
      <path d="M 19 24 Q 21 20 19 16" stroke="#d7ccc8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 23 23 Q 25 18 23 14" stroke="#d7ccc8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 27 24 Q 29 20 27 16" stroke="#d7ccc8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Coffee Beans */}
      <ellipse cx="13" cy="39" rx="2" ry="1.2" fill="#3e2723" transform="rotate(30 13 39)" />
      <ellipse cx="33" cy="39" rx="2" ry="1.2" fill="#3e2723" transform="rotate(-30 33 39)" />
      </g>
    ),
  },
  "lipa_coffee_beans": {
    frame: "#451a03",
    bg: "#fefce8",
    top: "LIPA",
    topColor: "#451a03",
    bottom: "KAPENG BARAKO",
    bottomColor: "#451a03",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Delicate Engraved Steam */}
    <path d="M46,30 Q42,20 47,12 M52,28 Q56,18 51,10 M58,30 Q62,20 57,12" fill="none" stroke="#78350f" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />
    {/* Ground Shadow */}
    <ellipse cx="50" cy="88" rx="32" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Ceramic Saucer */}
    <ellipse cx="48" cy="80" rx="28" ry="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.1" />
    {/* Traditional Cup of Barako Coffee */}
    <path d="M30,46 L34,74 C34,77 42,79 48,79 C54,79 62,77 62,74 L66,46 Z" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
    {/* Cup Handle */}
    <path d="M65,50 C74,50 74,66 63,68" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
    {/* Dark Surface of Steaming Barako Coffee */}
    <ellipse cx="48" cy="46" rx="18" ry="4.5" fill="#1c1917" stroke="#451a03" strokeWidth="1" />
    <ellipse cx="48" cy="46" rx="14" ry="3" fill="#292524" />
    {/* Several Coffee Beans Beside Cup */}
    <g transform="translate(62, 76)">
      <ellipse cx="6" cy="4" rx="4.5" ry="3" fill="#451a03" stroke="#1c1917" strokeWidth="0.7" transform="rotate(25 6 4)" />
      <path d="M4,2 Q6,4 8,6" stroke="#d97706" strokeWidth="0.6" fill="none" />
    </g>
    <g transform="translate(22, 78)">
      <ellipse cx="4" cy="4" rx="4.2" ry="2.8" fill="#451a03" stroke="#1c1917" strokeWidth="0.7" transform="rotate(-30 4 4)" />
      <path d="M2,5 Q4,4 6,3" stroke="#d97706" strokeWidth="0.6" fill="none" />
    </g>
      </svg>
    ),
  },
  "lucena_pahiyas": {
    frame: "#d90429",
    bg: "#fefae0",
    top: "LUCENA",
    topColor: "#d90429",
    bottom: "PAHIYAS",
    bottomColor: "#ffbe0b",
    renderArt: () => (
      <g>
{/* Translucent Colorful Kiping Leaf Chandelier (Arangya) */}
      <circle cx="24" cy="18" r="2.5" fill="#ffbe0b" />
      <path d="M 24 20 C 18 25, 17 33, 24 37 C 31 33, 30 25, 24 20 Z" fill="#d90429" />
      <path d="M 16 24 C 11 29, 12 36, 18 39 C 22 36, 21 29, 16 24 Z" fill="#ffbe0b" />
      <path d="M 32 24 C 37 29, 36 36, 30 39 C 26 36, 27 29, 32 24 Z" fill="#38b000" />
      {/* Coconut Palm groves below */}
      <path d="M 24 43 V 37" stroke="#7f4f24" strokeWidth="1.5" />
      <circle cx="24" cy="28" r="2" fill="#ffffff" />
      </g>
    ),
  },
  "lucena_perez_park": {
    frame: "#c2410c",
    bg: "#fffbeb",
    top: "LUCENA",
    topColor: "#c2410c",
    bottom: "LUCENA CHAMI",
    bottomColor: "#c2410c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Delicate Engraved Steam Wisps Curling Gracefully Upward */}
    <g stroke="#d97706" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6">
      <path d="M 38 36 C 36 28, 42 22, 38 14" />
      <path d="M 50 32 C 48 24, 54 18, 50 10" />
      <path d="M 62 36 C 64 28, 58 22, 62 14" />
    </g>

    <g id="lucena-chami-bowl" transform="translate(6, 12)">
      {/* Ceramic Bowl Shadow */}
      <ellipse cx="44" cy="74" rx="30" ry="5" fill="#1e293b" opacity="0.22" />

      {/* Deep Glazed Ceramic Bowl Exterior (Rich terracotta / cobalt glaze) */}
      <path d="
        M 16 50
        C 16 68, 28 74, 44 74
        C 60 74, 72 68, 72 50
        C 72 44, 60 42, 44 42
        C 28 42, 16 44, 16 50 Z
      " fill="#9a3412" stroke="#431407" strokeWidth="1.3" />

      {/* Bowl Rim Lip */}
      <ellipse cx="44" cy="48" rx="27" ry="8" fill="#c2410c" stroke="#7c2d12" strokeWidth="1.0" />
      <ellipse cx="44" cy="48" rx="25" ry="7" fill="#451a03" />

      {/* Mound of Thick Glossy Miki Stir-Fried Noodles in Dark Savory Sauce */}
      <path d="M 21 48 Q 44 38 67 48 Q 62 58 44 60 Q 26 58 21 48 Z" fill="#78350f" />

      {/* Tangled Thick Noodle Strands (Rich Golden Brown with Sauce Highlights) */}
      <g stroke="#d97706" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M 26 49 Q 34 44 42 48 Q 50 52 58 47" />
        <path d="M 28 53 Q 36 57 44 51 Q 52 46 62 50" />
        <path d="M 32 46 Q 40 50 48 45 Q 56 50 62 46" />
        <path d="M 30 51 Q 42 46 54 53" />
      </g>
      <g stroke="#fef08a" strokeWidth="0.6" fill="none" opacity="0.7">
        <path d="M 27 48 Q 35 43 43 47" />
        <path d="M 33 50 Q 43 45 53 52" />
      </g>

      {/* Culinary Toppings */}
      {/* Plump Pink Shrimp with Curved Tail */}
      <path d="M 38 45 C 42 41, 48 42, 49 46 C 46 48, 41 47, 38 45 Z" fill="#f87171" stroke="#dc2626" strokeWidth="0.7" />
      <path d="M 49 46 Q 52 44 54 46" fill="none" stroke="#ef4444" strokeWidth="0.8" />

      {/* Hard Boiled Egg Slices (White with Golden Yolk) */}
      <ellipse cx="56" cy="48" rx="5" ry="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
      <circle cx="56" cy="48" r="2" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5" />

      {/* Crisp Sliced Cabbage / Snow Peas (Bright Green Cuts) */}
      <polygon points="26,46 32,44 30,47" fill="#22c55e" />
      <polygon points="46,52 52,50 50,54" fill="#16a34a" />
      <polygon points="36,54 40,53 38,56" fill="#22c55e" />

      {/* Fresh Calamansi Half on Bowl Rim */}
      <circle cx="21" cy="46" r="3.2" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.7" />
      <circle cx="21" cy="46" r="2.2" fill="#bef264" />
      <line x1="21" y1="44" x2="21" y2="48" stroke="#4d7c0f" strokeWidth="0.4" />
      <line x1="19" y1="46" x2="23" y2="46" stroke="#4d7c0f" strokeWidth="0.4" />
    </g>
      </svg>
    ),
  },
  "maasin_sacred_heart": {
    frame: "#7c2d12",
    bg: "#fef7ee",
    top: "MAASIN",
    topColor: "#7c2d12",
    bottom: "MAASIN CATHEDRAL",
    bottomColor: "#7c2d12",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="50" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Detailed Architectural Engraving of Maasin Cathedral Facade */}
    <g id="maasin-cathedral" transform="translate(10, 24)">
      <line x1="2" y1="74" x2="78" y2="74" stroke="#451a03" strokeWidth="1.2" />
      {/* Symmetrical Spanish-Colonial Coral Stone Facade Body */}
      <rect x="12" y="32" width="56" height="42" fill="#cbd5e1" stroke="#451a03" strokeWidth="1.2" />
      {/* Triangular Classical Pediment with Rose Window */}
      <polygon points="40,16 10,32 70,32" fill="#94a3b8" stroke="#451a03" strokeWidth="1.2" />
      <circle cx="40" cy="25" r="4.5" fill="#fefce8" stroke="#451a03" strokeWidth="0.9" />
      <line x1="40" y1="10" x2="40" y2="16" stroke="#451a03" strokeWidth="1.2" />
      <line x1="37" y1="12" x2="43" y2="12" stroke="#451a03" strokeWidth="1.2" />
      {/* Symmetrical Bell Towers on Left and Right */}
      <rect x="6" y="20" width="10" height="54" fill="#94a3b8" stroke="#451a03" strokeWidth="1" />
      <polygon points="11,12 6,20 16,20" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
      <rect x="64" y="20" width="10" height="54" fill="#94a3b8" stroke="#451a03" strokeWidth="1" />
      <polygon points="69,12 64,20 74,20" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
      {/* Tower Arched Windows */}
      <rect x="8" y="28" width="6" height="10" rx="3" fill="#334155" />
      <rect x="66" y="28" width="6" height="10" rx="3" fill="#334155" />
      {/* Grand Main Arched Entrance Portal */}
      <path d="M34,74 L34,52 C34,48 46,48 46,52 L46,74 Z" fill="#451a03" stroke="#1e293b" strokeWidth="1.1" />
    </g>
      </svg>
    ),
  },
  "mabalacat_aeta_heritage": {
    frame: "#9a3412",
    bg: "#fefaf6",
    top: "MABALACAT",
    topColor: "#9a3412",
    bottom: "KAPAMPANGAN PALAYOK",
    bottomColor: "#9a3412",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Heritage Frame Aura */}
    <g opacity="0.25" stroke="#c2410c" strokeWidth="0.5">
      <ellipse cx="50" cy="62" rx="36" ry="32" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="kapampangan-palayok" transform="translate(6, 12)">
      {/* Baseline Earthenware Shadow */}
      <ellipse cx="44" cy="74" rx="26" ry="4" fill="#271005" opacity="0.28" />

      {/* Main Bulbous Rounded Terracotta Clay Body */}
      <path d="
        M 16 46
        C 12 60, 24 74, 44 74
        C 64 74, 76 60, 72 46
        C 70 41, 60 39, 44 39
        C 28 39, 18 41, 16 46 Z
      " fill="#c2410c" stroke="#431407" strokeWidth="1.3" />

      {/* Wood-Fired Smoke Patina & Shading on Lower Pot */}
      <path d="
        M 22 56
        C 24 68, 34 73, 44 73
        C 54 73, 64 68, 66 56
        C 58 64, 50 67, 44 67
        C 38 67, 30 64, 22 56 Z
      " fill="#431407" opacity="0.75" />

      {/* Wide Rolled Clay Lip Rim */}
      <ellipse cx="44" cy="42" rx="26" ry="6.5" fill="#9a3412" stroke="#431407" strokeWidth="1.1" />

      {/* Fitted Shallow Clay Lid with Rim */}
      <ellipse cx="44" cy="40" rx="24" ry="5.5" fill="#b45309" stroke="#78350f" strokeWidth="1.0" />
      <ellipse cx="44" cy="38" rx="21" ry="4.5" fill="#d97706" />

      {/* Central Rounded Clay Lid Knob (Hawakan) */}
      <ellipse cx="44" cy="34" rx="5.5" ry="3.5" fill="#9a3412" stroke="#431407" strokeWidth="0.9" />
      <circle cx="43" cy="33" r="1.2" fill="#fef3c7" opacity="0.6" />

      {/* Fine Intaglio Pottery Shading Lines */}
      <g stroke="#7c2d12" strokeWidth="0.6" opacity="0.7">
        <path d="M 22 48 Q 28 58 36 64" fill="none" />
        <path d="M 66 48 Q 60 58 52 64" fill="none" />
        <path d="M 26 52 Q 32 60 40 66" fill="none" />
      </g>
      {/* Warm Glaze / Polished Highlight */}
      <path d="M 22 47 Q 26 55 30 58" fill="none" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
    </g>
      </svg>
    ),
  },
  "mabalacat_clark": {
    frame: "#0077b6",
    bg: "#e0f2fe",
    top: "MABALACAT",
    topColor: "#03045e",
    bottom: "CLARK GATEWAY",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <g>
{/* Runway lines */}
      <polygon points="21,44 27,44 25,32 23,32" fill="#334155" />
      <line x1="24" y1="33" x2="24" y2="43" stroke="#facc15" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      {/* Soaring Airplane */}
      <polygon points="24,15 22,25 12,28 12,30 22,28 22,34 18,36 18,37 24,36 30,37 30,36 26,34 26,28 36,30 36,28 26,25" fill="#0077b6" />
      {/* Balacat green leaves */}
      <path d="M 33 20 Q 38 15 35 24 Z" fill="#2d6a4f" />
      </g>
    ),
  },
  "magellan_cross": {
    frame: "#991b1b",
    bg: "#fef2f2",
    top: "CEBU CITY",
    topColor: "#991b1b",
    bottom: "SANTO NIÑO ARTIFACT",
    bottomColor: "#991b1b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Radiant Halo / Celestial Aura */}
    <circle cx="50" cy="46" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.6" strokeDasharray="2 2" />
    {/* Santo Niño Statue Image Treated Strictly as a Religious Artifact (No People) */}
    <g id="santo-nino-statue">
      {/* Sculpted Wooden Base / Pedestal */}
      <rect x="36" y="88" width="28" height="8" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1.1" />
      {/* Ornate Crimson & Gold Embroidered Vestment Robe */}
      <path d="M50,50 L32,88 L68,88 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.3" />
      {/* Gold Brocade Filigree Embroidery on Robe */}
      <path d="M50,50 L42,88 M50,50 L58,88" stroke="#facc15" strokeWidth="0.9" />
      <g stroke="#facc15" strokeWidth="0.7" fill="none">
        <path d="M38,70 Q50,76 62,70" /><path d="M36,80 Q50,86 64,80" />
      </g>
      {/* Regal Gold Crown (Corona Imperial with Cross) */}
      <path d="M42,32 L58,32 L56,22 L50,26 L44,22 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.1" />
      <line x1="50" y1="16" x2="50" y2="22" stroke="#ca8a04" strokeWidth="1.2" />
      <line x1="47" y1="18" x2="53" y2="18" stroke="#ca8a04" strokeWidth="1.2" />
      {/* Carved Face of the Child Jesus */}
      <ellipse cx="50" cy="38" rx="6" ry="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.9" />
      {/* Left Hand Holding Globus Cruciger (Orb and Cross) */}
      <circle cx="38" cy="62" r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
      <line x1="38" y1="56" x2="38" y2="59" stroke="#ca8a04" strokeWidth="0.8" />
      {/* Right Hand Raised in Blessing */}
      <circle cx="62" cy="60" r="2.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "makati_skyline": {
    frame: "#0f172a",
    bg: "#f8fafc",
    top: "MAKATI",
    topColor: "#0f172a",
    bottom: "MAKATI SKYLINE",
    bottomColor: "#0f172a",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Sky backdrop with architectural grid hatch */}
    <g opacity="0.3" stroke="#64748b" strokeWidth="0.4">
      <line x1="12" y1="20" x2="88" y2="20" strokeDasharray="3 2" />
      <line x1="12" y1="26" x2="88" y2="26" strokeDasharray="4 2" />
    </g>

    {/* Background Flanking Towers (Ayala Triangle area) */}
    <rect x="16" y="44" width="16" height="58" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
    <g stroke="#64748b" strokeWidth="0.4">
      <line x1="20" y1="44" x2="20" y2="102" /><line x1="24" y1="44" x2="24" y2="102" /><line x1="28" y1="44" x2="28" y2="102" />
      <line x1="16" y1="52" x2="32" y2="52" /><line x1="16" y1="62" x2="32" y2="62" /><line x1="16" y1="72" x2="32" y2="72" /><line x1="16" y1="82" x2="32" y2="82" />
    </g>

    <rect x="68" y="38" width="16" height="64" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
    <g stroke="#475569" strokeWidth="0.4">
      <line x1="72" y1="38" x2="72" y2="102" /><line x1="76" y1="38" x2="76" y2="102" /><line x1="80" y1="38" x2="80" y2="102" />
      <line x1="68" y1="48" x2="84" y2="48" /><line x1="68" y1="58" x2="84" y2="58" /><line x1="68" y1="68" x2="84" y2="68" /><line x1="68" y1="78" x2="84" y2="78" />
    </g>

    {/* Mid-ground Angular Highrise Tower */}
    <path d="M26,36 L38,30 L48,34 L48,102 L26,102 Z" fill="#64748b" stroke="#1e293b" strokeWidth="0.9" />
    <g stroke="#94a3b8" strokeWidth="0.4">
      <line x1="32" y1="34" x2="32" y2="102" /><line x1="38" y1="31" x2="38" y2="102" /><line x1="44" y1="33" x2="44" y2="102" />
    </g>

    {/* DOMINANT ICONIC CENTRAL MAKATI SKYSCRAPER */}
    {/* Distinctive chamfered/angled apex crown with antenna spire */}
    <line x1="50" y1="12" x2="50" y2="18" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
    <polygon points="46,18 50,14 54,18 64,24 64,102 36,102 36,24" fill="#1e293b" stroke="#090d16" strokeWidth="1.2" />

    {/* Glass Facade Vertical Mullion Pinstripes & Structural Concrete Bands */}
    <g stroke="#38bdf8" strokeWidth="0.55" opacity="0.85">
      <line x1="40" y1="24" x2="40" y2="102" />
      <line x1="44" y1="23" x2="44" y2="102" />
      <line x1="48" y1="20" x2="48" y2="102" />
      <line x1="52" y1="20" x2="52" y2="102" />
      <line x1="56" y1="23" x2="56" y2="102" />
      <line x1="60" y1="24" x2="60" y2="102" />
    </g>
    {/* Geometric Floor Plates / Horizontal Louvers */}
    <g stroke="#0ea5e9" strokeWidth="0.4" opacity="0.6">
      <line x1="37" y1="32" x2="63" y2="32" /><line x1="37" y1="42" x2="63" y2="42" />
      <line x1="37" y1="52" x2="63" y2="52" /><line x1="37" y1="62" x2="63" y2="62" />
      <line x1="37" y1="72" x2="63" y2="72" /><line x1="37" y1="82" x2="63" y2="82" />
      <line x1="37" y1="92" x2="63" y2="92" />
    </g>
    {/* Sharp Sunlit Glass Reflection Glare */}
    <polygon points="42,26 48,22 46,102 40,102" fill="#ffffff" opacity="0.18" />

    {/* Street Level Concrete Plaza Base */}
    <rect x="12" y="100" width="76" height="4" fill="#0f172a" />
      </svg>
    ),
  },
  "malabon_tambobong": {
    frame: "#c2410c",
    bg: "#fffdfa",
    top: "MALABON",
    topColor: "#c2410c",
    bottom: "PANCIT MALABON",
    bottomColor: "#c2410c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Top-down Round Ceramic Serving Platter / Bilao with Banana Leaf liner */}
    <circle cx="50" cy="54" r="38" fill="#15803d" stroke="#14532d" strokeWidth="1.8" />
    <circle cx="50" cy="54" r="36" fill="#166534" stroke="#15803d" strokeWidth="0.6" strokeDasharray="2 1.5" />
    {/* Banana Leaf Rib Veins */}
    <g stroke="#14532d" strokeWidth="0.5" opacity="0.5">
      <line x1="16" y1="54" x2="84" y2="54" />
      <line x1="24" y1="30" x2="76" y2="78" /><line x1="24" y1="78" x2="76" y2="30" />
    </g>

    {/* Bed of Thick Noodles coated in Golden-Orange Achuete Shrimp Sauce */}
    <circle cx="50" cy="54" r="31" fill="#ea580c" stroke="#9a3412" strokeWidth="1.2" />
    {/* Intricate Tangled Noodle Strands Engraving */}
    <g fill="none" stroke="#fed7aa" strokeWidth="1.1" strokeLinecap="round" opacity="0.85">
      <path d="M28,48 Q38,40 52,44 Q66,48 72,40" />
      <path d="M26,58 Q36,66 50,60 Q64,54 74,62" />
      <path d="M36,36 Q46,46 44,60 Q42,72 56,72" />
      <path d="M60,34 Q54,46 58,58 Q62,70 48,74" />
      <path d="M32,44 Q44,52 64,48" />
      <path d="M38,62 Q48,54 62,60" />
    </g>

    {/* SEAFOOD & CULINARY TOPPINGS */}
    {/* 1. Fresh Plump Steamed Shrimp / Prawns (Curved with tail) */}
    {/* Prawn 1 (Top Left) */}
    <path d="M34,42 C30,34 38,30 44,32 C48,34 46,38 41,39 C38,40 36,41 34,42 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.7" />
    <path d="M32,43 Q28,45 26,44" fill="none" stroke="#b91c1c" strokeWidth="0.6" />
    {/* Prawn Segments */}
    <path d="M37,33 Q40,36 38,39" fill="none" stroke="#fee2e2" strokeWidth="0.5" />

    {/* Prawn 2 (Bottom Right) */}
    <path d="M56,66 C62,72 68,66 66,60 C64,56 60,57 58,61 C57,63 56,65 56,66 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.7" />

    {/* 2. Hard-Boiled Egg Halves / Slices with Golden Yolk */}
    {/* Egg 1 (Center Right) */}
    <ellipse cx="60" cy="46" rx="6.5" ry="5" transform="rotate(-20 60 46)" fill="#ffffff" stroke="#9a3412" strokeWidth="0.7" />
    <circle cx="60" cy="46" r="3.2" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5" />
    <circle cx="59.2" cy="45.2" r="1.1" fill="#fef08a" />

    {/* Egg 2 (Bottom Left) */}
    <ellipse cx="38" cy="62" rx="6" ry="4.5" transform="rotate(30 38 62)" fill="#ffffff" stroke="#9a3412" strokeWidth="0.7" />
    <circle cx="38" cy="62" r="2.8" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5" />

    {/* 3. Squid Rings (Calamari) */}
    <ellipse cx="48" cy="40" rx="4" ry="2.5" fill="none" stroke="#f8fafc" strokeWidth="1.4" />
    <ellipse cx="42" cy="52" rx="3.5" ry="2.2" fill="none" stroke="#f8fafc" strokeWidth="1.3" />

    {/* 4. Crushed Crispy Chicharon Bits & Toasted Garlic */}
    <g fill="#ca8a04" stroke="#78350f" strokeWidth="0.35">
      <polygon points="48,50 51,48 50,52" /><polygon points="54,54 57,53 55,56" />
      <polygon points="44,45 46,44 45,47" /><polygon points="52,62 55,61 53,64" />
      <polygon points="63,58 66,57 65,60" /><polygon points="34,54 36,52 35,55" />
    </g>

    {/* 5. Fresh Green Spring Onions (Kinchay/Scallions) */}
    <g stroke="#15803d" strokeWidth="1.1" strokeLinecap="round">
      <line x1="46" y1="56" x2="48" y2="54" /><line x1="52" y1="46" x2="54" y2="48" />
      <line x1="56" y1="52" x2="58" y2="50" /><line x1="42" y1="48" x2="44" y2="50" />
    </g>
      </svg>
    ),
  },
  "malaybalay_kaamulan": {
    frame: "#991b1b",
    bg: "#fef2f2",
    top: "MALAYBALAY",
    topColor: "#991b1b",
    bottom: "BUKIDNON TEXTILE",
    bottomColor: "#991b1b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<rect x="14" y="16" width="72" height="88" rx="1" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1.3" />
    {/* Single Traditional Bukidnon Woven Textile Specimen (Matigsalug / Talaandig Geometry) */}
    <g id="bukidnon-textile">
      <rect x="18" y="20" width="64" height="80" fill="#991b1b" stroke="#facc15" strokeWidth="0.8" />
      {/* Signature Tri-Color Geometric Bands (Red, White, Black, Yellow) */}
      <rect x="18" y="28" width="64" height="8" fill="#ffffff" />
      <rect x="18" y="36" width="64" height="8" fill="#1e293b" />
      <rect x="18" y="76" width="64" height="8" fill="#1e293b" />
      <rect x="18" y="84" width="64" height="8" fill="#ffffff" />
      {/* Central Repeating Diamond / Star Geometric Weave */}
      <g fill="#facc15" stroke="#78350f" strokeWidth="0.7">
        <polygon points="50,48 58,58 50,68 42,58" />
        <polygon points="32,48 40,58 32,68 24,58" />
        <polygon points="68,48 76,58 68,68 60,58" />
      </g>
      {/* Center Red Star Inlays */}
      <polygon points="50,54 54,58 50,62 46,58" fill="#dc2626" />
      <polygon points="32,54 36,58 32,62 28,58" fill="#dc2626" />
      <polygon points="68,54 72,58 68,62 64,58" fill="#dc2626" />
      {/* Visible Fine Thread Hatching */}
      <g stroke="#ffffff" strokeWidth="0.4" opacity="0.6">
        <line x1="20" y1="46" x2="80" y2="46" /><line x1="20" y1="70" x2="80" y2="70" />
      </g>
    </g>
      </svg>
    ),
  },
  "malolos_barasoain": {
    frame: "#7c2d12",
    bg: "#fef7ee",
    top: "MALOLOS",
    topColor: "#7c2d12",
    bottom: "BARASOAIN CHURCH",
    bottomColor: "#7c2d12",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="50" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Precise Architectural Engraving of Barasoain Church Facade & Belfry */}
    <g id="barasoain-facade" transform="translate(10, 22)">
      {/* Ground Line */}
      <line x1="2" y1="74" x2="78" y2="74" stroke="#451a03" strokeWidth="1.2" />
      {/* Left 3-Tier Octagonal Bell Tower */}
      <rect x="6" y="24" width="16" height="50" fill="#94a3b8" stroke="#451a03" strokeWidth="1.2" />
      <rect x="8" y="16" width="12" height="8" fill="#cbd5e1" stroke="#451a03" strokeWidth="0.8" />
      <polygon points="14,8 8,16 20,16" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
      {/* Belfry Arched Windows */}
      <rect x="10" y="28" width="8" height="14" rx="4" fill="#334155" stroke="#451a03" strokeWidth="0.8" />
      <rect x="11" y="48" width="6" height="12" rx="3" fill="#334155" stroke="#451a03" strokeWidth="0.8" />
      {/* Main Neo-Classical Curved Pediment Facade */}
      <rect x="22" y="38" width="52" height="36" fill="#cbd5e1" stroke="#451a03" strokeWidth="1.2" />
      {/* Sinuous Baroque Curved Pediment Roofline */}
      <path d="M22,38 C28,34 32,24 48,22 C64,24 68,34 74,38 Z" fill="#94a3b8" stroke="#451a03" strokeWidth="1.2" />
      {/* Pediment Center Rose Window & Cross */}
      <circle cx="48" cy="30" r="5" fill="#fefce8" stroke="#451a03" strokeWidth="0.9" />
      <line x1="48" y1="16" x2="48" y2="22" stroke="#451a03" strokeWidth="1.2" />
      <line x1="45" y1="18" x2="51" y2="18" stroke="#451a03" strokeWidth="1.2" />
      {/* Classical Columns & Symmetrical Arched Windows */}
      <rect x="26" y="44" width="8" height="14" rx="4" fill="#334155" stroke="#451a03" strokeWidth="0.8" />
      <rect x="62" y="44" width="8" height="14" rx="4" fill="#334155" stroke="#451a03" strokeWidth="0.8" />
      {/* Grand Main Arched Entrance Portal */}
      <path d="M42,74 L42,50 C42,46 54,46 54,50 L54,74 Z" fill="#451a03" stroke="#1e293b" strokeWidth="1.1" />
      <path d="M40,49 Q48,44 56,49" fill="none" stroke="#78350f" strokeWidth="1.2" />
    </g>
      </svg>
    ),
  },
  "mandaluyong_tiger": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "MANDALUYONG",
    topColor: "#047857",
    bottom: "ORTIGAS SKYLINE",
    bottomColor: "#047857",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/mandaluyong_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "mandaue_furniture": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "MANDAUE",
    topColor: "#a16207",
    bottom: "MASAREAL",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<ellipse cx="50" cy="58" rx="34" ry="28" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Traditional Masareal Confection Displayed as Culinary Artifact */}
    <g id="masareal-bar" transform="translate(16, 26)">
      {/* Wrapped Paper Liner Tray */}
      <rect x="6" y="24" width="56" height="34" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      {/* Molded Rectangle Bar of Sweet Ground Peanut/Almond & Sugar Paste */}
      <rect x="10" y="28" width="48" height="26" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
      {/* Fine Granular Ground Nut Texture Hatching */}
      <g fill="#ca8a04" opacity="0.7">
        <circle cx="16" cy="34" r="1.2" /><circle cx="22" cy="33" r="1.1" /><circle cx="28" cy="35" r="1.3" />
        <circle cx="34" cy="33" r="1.1" /><circle cx="40" cy="34" r="1.2" /><circle cx="46" cy="33" r="1.1" /><circle cx="52" cy="35" r="1.3" />
        <circle cx="14" cy="40" r="1.1" /><circle cx="20" cy="42" r="1.3" /><circle cx="26" cy="39" r="1.2" />
        <circle cx="32" cy="41" r="1.1" /><circle cx="38" cy="42" r="1.3" /><circle cx="44" cy="40" r="1.2" /><circle cx="50" cy="41" r="1.1" />
        <circle cx="18" cy="48" r="1.2" /><circle cx="24" cy="47" r="1.1" /><circle cx="30" cy="49" r="1.3" />
        <circle cx="36" cy="47" r="1.1" /><circle cx="42" cy="48" r="1.2" /><circle cx="48" cy="47" r="1.1" />
      </g>
      {/* Traditional String Tie Binding across Middle */}
      <line x1="34" y1="24" x2="34" y2="58" stroke="#dc2626" strokeWidth="1.5" />
    </g>
      </svg>
    ),
  },
  "manila_intramuros": {
    frame: "#7c2d12",
    bg: "#faf8f5",
    top: "MANILA",
    topColor: "#7c2d12",
    bottom: "INTRAMUROS",
    bottomColor: "#7c2d12",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/manila_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "marawi_torogan_sarimanok": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "MARAWI",
    topColor: "#a16207",
    bottom: "MARANAO OKIR",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Museum Exhibit Frame */}
    <rect x="14" y="16" width="72" height="88" rx="2" fill="#451a03" stroke="#1c0702" strokeWidth="1.4" />
    <rect x="18" y="20" width="64" height="80" fill="#78350f" stroke="#ca8a04" strokeWidth="0.8" />
    {/* Highly Intricate Maranao Okir Carving (Flowing Vegetal Curves & Naga Forms) */}
    <g id="maranao-okir" stroke="#facc15" strokeWidth="1.3" fill="none">
      {/* Symmetrical Central Flowing Lotus / Pako Rabong (Fern Motif) */}
      <path d="M50,86 C50,68 38,58 34,44 C30,30 42,22 50,22 C58,22 70,30 66,44 C62,58 50,68 50,86 Z" fill="#b45309" stroke="#facc15" strokeWidth="1.2" />
      {/* Naga Dragon / Serpent Spiral Waves (Okir a Datu) */}
      <path d="M50,54 C42,48 32,50 26,60 C20,70 28,80 38,76 C46,72 44,60 38,62 C34,64 36,68 38,68" strokeWidth="1.2" />
      <path d="M50,54 C58,48 68,50 74,60 C80,70 72,80 62,76 C54,72 56,60 62,62 C66,64 64,68 62,68" strokeWidth="1.2" />
      {/* Upper Flourishing Tendrils (Matilak) */}
      <path d="M50,34 Q38,28 32,36 Q38,40 44,36" />
      <path d="M50,34 Q62,28 68,36 Q62,40 56,36" />
      {/* Center Crown Bud */}
      <circle cx="50" cy="28" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="0.6" />
    </g>
      </svg>
    ),
  },
  "marikina_river_park": {
    frame: "#831843",
    bg: "#faf5f0",
    top: "MARIKINA",
    topColor: "#831843",
    bottom: "RIVER PARK",
    bottomColor: "#831843",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/marikina_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "marikina_shoe": {
    frame: "#831843",
    bg: "#faf5f0",
    top: "MARIKINA",
    topColor: "#831843",
    bottom: "MARIKINA SHOEMAKING",
    bottomColor: "#831843",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Elliptical Medallion Background */}
    <g opacity="0.25" stroke="#9d174d" strokeWidth="0.5">
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="none" strokeDasharray="2 2" />
      <ellipse cx="50" cy="58" rx="34" ry="28" fill="none" strokeDasharray="1 1.5" />
    </g>

    <g id="marikina-oxford-shoe" transform="translate(4, 8)">
      {/* Soft Ground Cast Shadow */}
      <path d="M 16 82 Q 42 92 78 68 Q 60 62 28 72 Z" fill="#1e293b" opacity="0.22" />

      {/* Goodyear Stacked Leather Heel (Elevated Upper-Right) */}
      <path d="M 64 54 L 77 43 L 73 53 L 61 63 Z" fill="#2d150b" stroke="#0f0502" strokeWidth="1.0" />
      {/* Rubber Top-lift and leather layers */}
      <line x1="63" y1="58" x2="75" y2="48" stroke="#78350f" strokeWidth="0.6" />
      <line x1="62" y1="60" x2="74" y2="50" stroke="#451a03" strokeWidth="0.8" />

      {/* Leather Sole & Waist Profile (Diagonal sweep from 77,43 down to 18,78) */}
      <path d="M 18 78 Q 28 84 46 80 Q 58 74 62 62 L 74 52 Q 78 48 76 43 L 73 42 Q 68 47 56 59 Q 44 68 30 72 Q 18 73 18 78 Z" fill="#3b1706" stroke="#170601" strokeWidth="1.1" />

      {/* Goodyear Welt Stitched Edge (Ivory Dashes) */}
      <path d="M 19 77 Q 30 82 46 78 Q 57 72 61 61" fill="none" stroke="#fef3c7" strokeWidth="0.75" strokeDasharray="1.2 0.8" />

      {/* Upper Main Body: Full Grain Oxblood/Cognac Calfskin */}
      {/* Vamp, Quarter, and Instep */}
      <path d="M 20 76 Q 16 71 22 65 Q 32 55 45 49 Q 54 44 66 38 Q 72 40 73 45 Q 70 52 61 62 Q 52 70 38 74 Q 26 77 20 76 Z" fill="#881337" stroke="#4c0519" strokeWidth="1.2" />

      {/* Burnished Shading & Creases on Vamp */}
      <path d="M 28 66 Q 36 60 46 56" fill="none" stroke="#4c0519" strokeWidth="0.8" opacity="0.7" />
      <path d="M 32 68 Q 40 63 48 59" fill="none" stroke="#4c0519" strokeWidth="0.6" opacity="0.6" />
      {/* Polished Light Highlights */}
      <path d="M 24 70 Q 32 63 44 57" fill="none" stroke="#f43f5e" strokeWidth="0.8" opacity="0.6" />

      {/* Cap Toe with Brogue Perforations (Pointing Lower-Left) */}
      <path d="M 20 76 Q 17 72 23 66 Q 28 69 31 75 Q 24 77 20 76 Z" fill="#9f1239" stroke="#4c0519" strokeWidth="0.9" />
      {/* Brogue punch line */}
      <path d="M 23 66 Q 27 70 30 76" fill="none" stroke="#fef08a" strokeWidth="0.65" strokeDasharray="1.0 0.8" />

      {/* Oxford Closed Lacing Facings & Tongue */}
      <path d="M 45 49 Q 50 43 57 39 L 55 46 Q 48 50 45 49 Z" fill="#701a30" stroke="#4c0519" strokeWidth="0.8" />
      {/* 5 Eyelets and Tied Laces */}
      <circle cx="47" cy="48" r="0.8" fill="#ca8a04" /><circle cx="49" cy="46" r="0.8" fill="#ca8a04" />
      <circle cx="51" cy="44" r="0.8" fill="#ca8a04" /><circle cx="53" cy="42" r="0.8" fill="#ca8a04" />
      <circle cx="55" cy="40" r="0.8" fill="#ca8a04" />
      <line x1="47" y1="48" x2="49" y2="46" stroke="#fef08a" strokeWidth="0.75" />
      <line x1="49" y1="46" x2="51" y2="44" stroke="#fef08a" strokeWidth="0.75" />
      <line x1="51" y1="44" x2="53" y2="42" stroke="#fef08a" strokeWidth="0.75" />
      <line x1="53" y1="42" x2="55" y2="40" stroke="#fef08a" strokeWidth="0.75" />
      {/* Tied Knot & Lace Loops */}
      <path d="M 55 40 Q 57 36 60 38 Q 58 41 55 40" fill="none" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M 55 40 Q 53 36 51 38 Q 53 41 55 40" fill="none" stroke="#fef08a" strokeWidth="0.8" />

      {/* Ankle Collar / Topline Rim with Rolled Leather Binding */}
      <path d="M 57 39 Q 63 35 68 36 Q 73 39 73 44" fill="none" stroke="#3b0714" strokeWidth="1.3" />
      {/* Interior Lining Peeking Out */}
      <path d="M 58 40 Q 64 37 68 38 Q 71 40 71 43" fill="#fef3c7" stroke="#ca8a04" strokeWidth="0.4" />
    </g>
      </svg>
    ),
  },
  "masbate_rodeo": {
    frame: "#b45309",
    bg: "#fefce8",
    top: "MASBATE CITY",
    topColor: "#b45309",
    bottom: "RODEO MASBATEÑO CARABAO",
    bottomColor: "#b45309",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Rodeo Arena Soil Baseline */}
    <g opacity="0.3" stroke="#b45309" strokeWidth="0.5">
      <line x1="10" y1="88" x2="90" y2="88" strokeDasharray="3 2" />
      <line x1="14" y1="94" x2="86" y2="94" strokeDasharray="2 2" />
    </g>

    <g id="rodeo-masbatene-carabao" transform="translate(2, 6)">
      {/* Spirited Ground Shadow */}
      <ellipse cx="48" cy="84" rx="34" ry="4.5" fill="#451a03" opacity="0.22" />

      {/* Far Legs */}
      <path d="M 66 56 L 68 70 L 67 82 L 63 82 L 63 70 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      <polygon points="63,82 67,82 66,85 62,85" fill="#0f172a" />
      {/* Far foreleg poised forward */}
      <path d="M 30 54 L 26 66 L 24 78 L 20 78 L 22 66 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      <polygon points="20,78 24,78 23,81 19,81" fill="#0f172a" />

      {/* Massive Muscular Torso in Taut Energy Stance */}
      <path d="
        M 26 42
        C 22 40, 18 42, 16 46
        C 14 49, 14 53, 16 56
        C 18 59, 23 61, 28 61
        C 32 62, 36 65, 38 65
        C 48 66, 60 65, 70 61
        C 75 59, 78 55, 77 49
        C 76 43, 71 41, 65 41
        C 56 41, 48 43, 40 42
        C 35 40, 31 37, 26 42 Z
      " fill="#334155" stroke="#0f172a" strokeWidth="1.2" />

      {/* Near Hind Leg Planted Strong */}
      <path d="M 58 45 Q 66 47 70 55 L 68 68 L 66 84 L 59 84 L 60 70 Q 60 62 58 55 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.0" />
      <polygon points="59,84 66,84 65,87 58,87" fill="#0f172a" />

      {/* Near Foreleg (Strong forward stance) */}
      <path d="M 34 45 Q 38 53 39 63 L 38 84 L 32 84 L 33 65 Q 32 57 34 45 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.0" />
      <polygon points="32,84 38,84 37,87 31,87" fill="#0f172a" />

      {/* Tail with flying tuft */}
      <path d="M 76 48 Q 80 56 79 66 L 78 72" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      <polygon points="78,70 82,76 77,78" fill="#0f172a" />

      {/* Head Held Proud (Alert Rodeo Stance) */}
      <path d="M 26 42 L 20 44 L 14 48 L 13 52 L 18 54 L 25 52 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.0" />
      <ellipse cx="15" cy="51" rx="2.2" ry="1.8" fill="#1e293b" />
      <ellipse cx="20" cy="46" rx="1.5" ry="1.2" fill="#0f172a" />
      <circle cx="20.3" cy="45.8" r="0.4" fill="#ffffff" />

      {/* Traditional Braided Rodeo Rope Halter (Cabuyao / Masbate Tack) */}
      <path d="M 16 50 L 21 44 L 24 49 L 18 53 Z" fill="none" stroke="#eab308" strokeWidth="0.9" />
      <line x1="21" y1="44" x2="25" y2="46" stroke="#ca8a04" strokeWidth="0.9" />
      <path d="M 18 53 Q 22 58 26 62" fill="none" stroke="#ca8a04" strokeWidth="0.8" strokeDasharray="1.5 1" />

      {/* Massive Sweeping Crescent Horns (Curving dramatically outward and backward) */}
      {/* Far horn */}
      <path d="M 22 42 Q 28 30 40 30 Q 44 31 46 34 Q 42 33 34 35 Q 26 38 22 42 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
      {/* Dominant Near Crescent Horn with Growth Ridges */}
      <path d="
        M 21 43
        C 22 34, 30 24, 45 24
        C 53 24, 57 28, 56 33
        C 54 36, 49 36, 46 34
        C 38 29, 30 33, 25 41 Z
      " fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
      <g stroke="#64748b" strokeWidth="0.6" opacity="0.8">
        <line x1="24" y1="40" x2="26" y2="42" />
        <line x1="29" y1="35" x2="32" y2="38" />
        <line x1="35" y1="31" x2="38" y2="34" />
        <line x1="41" y1="28" x2="44" y2="31" />
        <line x1="47" y1="27" x2="49" y2="30" />
      </g>
    </g>
      </svg>
    ),
  },
  "mati_sleeping_dinosaur": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "MATI",
    topColor: "#0284c7",
    bottom: "DAHICAN WAVE",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="3 2" />
    {/* Powerful Curling Dahican Wave (Clean Surfing Barrel Shape, No People) */}
    <g id="dahican-wave">
      <path d="M14,88 C30,86 70,86 86,88 L86,102 L14,102 Z" fill="#075985" />
      <path d="M14,88 C16,74 24,62 38,54 C54,44 74,48 82,34 C76,28 62,26 48,32 C30,40 18,60 14,88 Z" fill="#0284c7" stroke="#082f49" strokeWidth="1.2" />
      <path d="M38,78 C44,68 54,62 66,62 C74,62 80,54 82,34 C74,44 60,48 48,58 C40,66 38,74 38,78 Z" fill="#082f49" />
      <g stroke="#bae6fd" strokeWidth="0.7" fill="none">
        <path d="M22,82 C26,68 34,58 46,50" /><path d="M28,84 C32,72 40,64 52,56" />
        <path d="M34,84 C40,74 48,68 58,62" />
      </g>
      <path d="M82,34 C78,32 72,36 68,40 C64,44 60,44 58,42 C56,40 60,36 64,32 C68,28 76,28 82,34 Z" fill="#ffffff" stroke="#bae6fd" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "mayon": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "LEGAZPI",
    topColor: "#065f46",
    bottom: "MAYON VOLCANO",
    bottomColor: "#065f46",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/legazpi_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "meycauayan_jewelry": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "MEYCAUAYAN",
    topColor: "#a16207",
    bottom: "GOLD JEWELRY",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Museum Exhibit Frame */}
    <circle cx="50" cy="58" r="34" fill="none" stroke="#ca8a04" strokeWidth="0.6" strokeDasharray="2 2" />
    <circle cx="50" cy="58" r="28" fill="none" stroke="#eab308" strokeWidth="0.4" />
    {/* Intricate Filipino Gold Jewelry / Tamborin Artifact with Filigree */}
    <g id="gold-jewelry">
      {/* Ornate Outer Gold Filigree Ring */}
      <circle cx="50" cy="58" r="22" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.4" />
      {/* Delicate Radial Gold Beads (Tamborin Granules) */}
      <g fill="#eab308" stroke="#a16207" strokeWidth="0.5">
        <circle cx="50" cy="34" r="2" /><circle cx="50" cy="82" r="2" />
        <circle cx="26" cy="58" r="2" /><circle cx="74" cy="58" r="2" />
        <circle cx="33" cy="41" r="1.8" /><circle cx="67" cy="75" r="1.8" />
        <circle cx="67" cy="41" r="1.8" /><circle cx="33" cy="75" r="1.8" />
      </g>
      {/* Pierced Openwork Filigree Foliage Pattern */}
      <path d="M50,42 Q42,50 50,58 Q58,50 50,42 Z" fill="#ca8a04" stroke="#a16207" strokeWidth="0.7" />
      <path d="M50,74 Q42,66 50,58 Q58,66 50,74 Z" fill="#ca8a04" stroke="#a16207" strokeWidth="0.7" />
      <path d="M34,58 Q42,50 50,58 Q42,66 34,58 Z" fill="#ca8a04" stroke="#a16207" strokeWidth="0.7" />
      <path d="M66,58 Q58,50 50,58 Q58,66 66,58 Z" fill="#ca8a04" stroke="#a16207" strokeWidth="0.7" />
      {/* Central Bezel-Set Gemstone (Restrained Pearl/Ruby) */}
      <circle cx="50" cy="58" r="7" fill="#be123c" stroke="#881337" strokeWidth="1.2" />
      <circle cx="50" cy="58" r="5" fill="#e11d48" />
      <circle cx="48" cy="56" r="1.8" fill="#ffffff" opacity="0.8" />
      {/* Hanging Filigree Teardrop Drop */}
      <path d="M50,84 L50,90 C50,94 46,96 46,98 C46,101 50,103 50,103 C50,103 54,101 54,98 C54,96 50,94 50,90 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "munoz_rice_science": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "MUÑOZ",
    topColor: "#15803d",
    bottom: "RICE RESEARCH PLANT",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Scientific Specimen Measurement Ruler Lines */}
    <line x1="82" y1="18" x2="82" y2="102" stroke="#16a34a" strokeWidth="0.6" strokeDasharray="1 3" />
    <g stroke="#16a34a" strokeWidth="0.5">
      <line x1="80" y1="20" x2="84" y2="20" /><line x1="80" y1="40" x2="84" y2="40" />
      <line x1="80" y1="60" x2="84" y2="60" /><line x1="80" y1="80" x2="84" y2="80" />
      <line x1="80" y1="100" x2="84" y2="100" />
    </g>
    {/* Single Scientifically Illustrated Rice Plant (Roots, Stem, Leaves, Panicle) */}
    <g id="rice-research-plant">
      {/* Root System (Fibrous Roots in Soil) */}
      <g stroke="#78350f" strokeWidth="0.7" fill="none">
        <path d="M50,94 L42,104" /><path d="M50,94 L46,108" />
        <path d="M50,94 L50,110" /><path d="M50,94 L54,107" />
        <path d="M50,94 L58,103" /><path d="M50,94 L38,100" />
      </g>
      {/* Central Culm / Stalk */}
      <path d="M50,94 L50,46" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" />
      {/* Node Markings */}
      <circle cx="50" cy="80" r="1.3" fill="#14532d" /><circle cx="50" cy="62" r="1.3" fill="#14532d" />
      {/* Linear Blade Leaves (Veneering Outward) */}
      <path d="M50,80 Q32,70 24,52" fill="none" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M50,62 Q68,52 74,36" fill="none" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" />
      {/* Arching Mature Grain Panicle Bending Under Grain Weight */}
      <path d="M50,46 Q48,28 34,22" fill="none" stroke="#ca8a04" strokeWidth="1.2" />
      {/* Individual Grains (Spikelets) along Branches */}
      <g fill="#facc15" stroke="#a16207" strokeWidth="0.5">
        <ellipse cx="44" cy="36" rx="2" ry="3.5" transform="rotate(30 44 36)" />
        <ellipse cx="40" cy="30" rx="2" ry="3.5" transform="rotate(40 40 30)" />
        <ellipse cx="36" cy="25" rx="2" ry="3.5" transform="rotate(50 36 25)" />
        <ellipse cx="31" cy="22" rx="2" ry="3.5" transform="rotate(60 31 22)" />
        <ellipse cx="48" cy="32" rx="2" ry="3.5" transform="rotate(20 48 32)" />
        <ellipse cx="42" cy="24" rx="2" ry="3.5" transform="rotate(35 42 24)" />
      </g>
    </g>
      </svg>
    ),
  },
  "munoz_science": {
    frame: "#023e8a",
    bg: "#f0f4f8",
    top: "MUÑOZ",
    topColor: "#023e8a",
    bottom: "SCIENCE CITY",
    bottomColor: "#52b788",
    renderArt: () => (
      <g>
{/* Laboratory Flask beaker */}
      <polygon points="21,18 27,18 27,24 33,34 15,34 21,24" fill="#00b4d8" opacity="0.6" stroke="#023e8a" strokeWidth="1" />
      <polygon points="17,34 31,34 28,29 20,29" fill="#52b788" />
      {/* Rice stalk emerging from flask */}
      <path d="M 24 24 Q 28 17 26 12" stroke="#ffb703" strokeWidth="1.2" fill="none" />
      <ellipse cx="26" cy="13" rx="1.5" ry="2.5" fill="#ffb703" />
      <ellipse cx="28" cy="16" rx="1.5" ry="2.5" fill="#ffb703" />
      <circle cx="24" cy="31" r="1.2" fill="#ffffff" />
      </g>
    ),
  },
  "muntinlupa_lake": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "MUNTINLUPA",
    topColor: "#065f46",
    bottom: "JAMBOREE LAKE",
    bottomColor: "#065f46",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/muntinlupa_lake_inner.png`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "alabang_town_center": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "ALABANG",
    topColor: "#065f46",
    bottom: "TOWN CENTER",
    bottomColor: "#065f46",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/alabang_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "naga_cebu_boardwalk": {
    frame: "#ea580c",
    bg: "#fff7ed",
    top: "NAGA (CEBU)",
    topColor: "#ea580c",
    bottom: "DAGITAB LANTERN",
    bottomColor: "#ea580c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Outer Electric Glow / Light Burst Rays */}
    <g stroke="#f97316" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
      <line x1="50" y1="12" x2="50" y2="104" /><line x1="12" y1="58" x2="88" y2="58" />
      <line x1="22" y1="30" x2="78" y2="86" /><line x1="78" y1="30" x2="22" y2="86" />
    </g>
    {/* Single Elaborate Dagitab Light Lantern (Electric Radial Geometry) */}
    <g id="dagitab-lantern">
      {/* Outer Geometric Star Perimeter */}
      <polygon points="50,22 56,38 72,32 64,48 80,58 64,68 72,84 56,78 50,94 44,78 28,84 36,68 20,58 36,48 28,32 44,38" fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
      {/* Concentric Radiating Rings of Light */}
      <circle cx="50" cy="58" r="22" fill="#facc15" stroke="#ca8a04" strokeWidth="1.1" />
      <circle cx="50" cy="58" r="14" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
      {/* Brilliant Center Filament / Spark */}
      <circle cx="50" cy="58" r="6" fill="#fef08a" />
      <polygon points="50,50 52,56 58,58 52,60 50,66 48,60 42,58 48,56" fill="#ea580c" />
    </g>
      </svg>
    ),
  },
  "naga_penafrancia": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "NAGA",
    topColor: "#78350f",
    bottom: "PEÑAFRANCIA PAGODA",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Fluvial River Water Waves */}
    <path d="M10,84 C30,80 70,86 90,82 M12,90 C35,88 65,92 88,90 M16,96 C40,94 60,98 84,96" fill="none" stroke="#0284c7" strokeWidth="0.8" />
    {/* Architectural Fluvial Pagoda Boat (No Worshippers) */}
    <g id="fluvial-pagoda" transform="translate(12, 24)">
      {/* Barge / Pontoon Boat Hull */}
      <path d="M4,58 L12,66 L64,66 L72,58 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
      <line x1="6" y1="62" x2="70" y2="62" stroke="#facc15" strokeWidth="0.8" />
      {/* Multi-Tiered Pagoda Shrine Architecture */}
      {/* Lower Tier Canopy */}
      <polygon points="12,50 64,50 60,58 16,58" fill="#eab308" stroke="#a16207" strokeWidth="1" />
      {/* Mid Canopy Support Columns */}
      <line x1="22" y1="50" x2="22" y2="38" stroke="#78350f" strokeWidth="1.1" />
      <line x1="38" y1="50" x2="38" y2="38" stroke="#78350f" strokeWidth="1.1" />
      <line x1="54" y1="50" x2="54" y2="38" stroke="#78350f" strokeWidth="1.1" />
      {/* Mid Tier Canopy Roof with Curved Eaves */}
      <path d="M18,38 L58,38 L54,30 L22,30 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
      {/* Upper Crown Shingle & Cross */}
      <polygon points="38,18 30,30 46,30" fill="#eab308" stroke="#a16207" strokeWidth="1" />
      <line x1="38" y1="12" x2="38" y2="18" stroke="#ca8a04" strokeWidth="1.3" />
      <line x1="35" y1="14" x2="41" y2="14" stroke="#ca8a04" strokeWidth="1.3" />
      {/* Symmetrical Festival Buntings / Pennants */}
      <path d="M14,58 Q38,62 62,58" fill="none" stroke="#dc2626" strokeWidth="0.8" strokeDasharray="2 1.5" />
    </g>
      </svg>
    ),
  },
  "navotas_fishing_trawler": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "NAVOTAS",
    topColor: "#0369a1",
    bottom: "FISHING BOAT",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Marine Horizon & Ocean Swell Lines */}
    <g fill="none" stroke="#bae6fd" strokeWidth="0.6">
      <line x1="14" y1="36" x2="86" y2="36" strokeDasharray="3 2" />
      <path d="M12,78 Q30,74 50,78 Q70,82 88,78" stroke="#38bdf8" strokeWidth="1.2" />
      <path d="M12,86 Q30,82 50,86 Q70,90 88,86" stroke="#0284c7" strokeWidth="1.4" />
      <path d="M12,94 Q30,90 50,94 Q70,98 88,94" stroke="#0369a1" strokeWidth="1.6" />
    </g>

    {/* TRADITIONAL NAVOTAS FISHING BOAT (THREE-QUARTER SIDE VIEW) */}
    <g id="navotas-bangka" transform="translate(6, 12)">
      {/* Main Hull (Deep V-Bottom Wooden Banca with High Curving Prow & Stern) */}
      <path d="M12,54 Q20,52 44,53 Q66,54 82,46 Q78,60 52,62 Q28,62 16,58 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.3" />
      {/* Hull Planking Lines & Painted Color Strakes */}
      <path d="M14,56 Q36,56 54,57 Q70,57 78,51" fill="none" stroke="#ffffff" strokeWidth="1.1" />
      <path d="M15,57.5 Q36,57.5 54,58.5 Q68,58.5 76,53" fill="none" stroke="#ef4444" strokeWidth="0.8" />

      {/* Center Mast & Rigging Stays */}
      <line x1="46" y1="20" x2="46" y2="54" stroke="#451a03" strokeWidth="1.5" />
      {/* Fore and Aft Wire Stays */}
      <line x1="46" y1="22" x2="14" y2="54" stroke="#64748b" strokeWidth="0.6" />
      <line x1="46" y1="22" x2="80" y2="48" stroke="#64748b" strokeWidth="0.6" />

      {/* Bamboo Outrigger Booms (Tadyaw crossbeams extending out) */}
      <path d="M34,54 Q30,62 20,66" fill="none" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M56,54 Q54,63 46,68" fill="none" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" />

      {/* Bamboo Float (Katig outrigger log riding the water) */}
      <path d="M10,68 Q34,70 60,69 Q68,68 70,66 Q60,67 34,68 Q14,68 10,68 Z" fill="#fde047" stroke="#854d0e" strokeWidth="1.1" />
      <line x1="12" y1="68" x2="68" y2="67" stroke="#ca8a04" strokeWidth="0.6" strokeDasharray="4 2" />

      {/* Bundled Fishing Nets (Lambat) Draped on Deck & Stern */}
      <path d="M52,53 Q64,50 72,48 Q70,55 58,56 Z" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />
      {/* Fishnet Crosshatch Mesh Texture */}
      <g stroke="#94a3b8" strokeWidth="0.4" opacity="0.8">
        <line x1="56" y1="52" x2="68" y2="52" /><line x1="58" y1="54" x2="66" y2="54" />
        <line x1="60" y1="50" x2="64" y2="56" /><line x1="64" y1="49" x2="68" y2="55" />
      </g>
      {/* Cork Floats / Buoys on Nets */}
      <circle cx="58" cy="51" r="0.8" fill="#f97316" /><circle cx="63" cy="50" r="0.8" fill="#f97316" /><circle cx="68" cy="49" r="0.8" fill="#f97316" />

      {/* Small Steering Tiller & Stern Flag */}
      <line x1="14" y1="52" x2="11" y2="48" stroke="#ca8a04" strokeWidth="0.8" />
      <polygon points="46,20 52,22 46,24" fill="#ef4444" />
    </g>
      </svg>
    ),
  },
  "olongapo_naval": {
    frame: "#03045e",
    bg: "#e0f2fe",
    top: "OLONGAPO",
    topColor: "#03045e",
    bottom: "SUBIC BAY",
    bottomColor: "#0077b6",
    renderArt: () => (
      <g>
{/* Deep blue Subic bay */}
      <rect x="7" y="32" width="34" height="12" fill="#023e8a" />
      <path d="M 7 35 Q 24 33 41 35" stroke="#48cae4" strokeWidth="0.8" fill="none" />
      {/* Naval ship silhouette */}
      <polygon points="12,31 34,31 31,36 15,36" fill="#334155" />
      <rect x="18" y="25" width="8" height="6" fill="#475569" />
      <rect x="20" y="20" width="3" height="5" fill="#64748b" />
      {/* Spanish Gate lighthouse */}
      <polygon points="9,40 11,26 13,40" fill="#d90429" />
      <circle cx="11" cy="25" r="1.5" fill="#facc15" />
      </g>
    ),
  },
  "olongapo_subic_bay": {
    frame: "#1e3a8a",
    bg: "#eff6ff",
    top: "OLONGAPO",
    topColor: "#1e3a8a",
    bottom: "NAVAL SHIP",
    bottomColor: "#1e3a8a",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Minimal Bay Horizon Line */}
    <line x1="10" y1="74" x2="90" y2="74" stroke="#3b82f6" strokeWidth="0.8" />
    <path d="M12,80 C30,78 70,82 88,80 M16,86 C35,84 65,88 84,86" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="3 1.5" />
    {/* One Large Modern Naval Ship in Profile across Bay Horizon */}
    <g id="modern-naval-ship" transform="translate(10, 34)">
      {/* Gray Steel Hull */}
      <path d="M4,40 L16,40 L68,40 L76,32 L6,34 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
      <line x1="12" y1="36" x2="72" y2="36" stroke="#94a3b8" strokeWidth="0.6" />
      {/* Stepped Superstructure / Command Bridge Tower */}
      <rect x="26" y="24" width="28" height="10" fill="#64748b" stroke="#1e293b" strokeWidth="1" />
      <rect x="32" y="16" width="16" height="8" fill="#475569" stroke="#1e293b" strokeWidth="0.9" />
      {/* Radar Mast & Communication Antennas */}
      <line x1="40" y1="16" x2="40" y2="6" stroke="#1e293b" strokeWidth="1.2" />
      <line x1="36" y1="10" x2="44" y2="10" stroke="#1e293b" strokeWidth="0.8" />
      <circle cx="40" cy="6" r="1.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.6" />
      {/* Bow Deck Gun Turret */}
      <path d="M18,34 L22,34 L21,30 L17,30 Z" fill="#334155" stroke="#0f172a" strokeWidth="0.7" />
      <line x1="17" y1="31" x2="10" y2="29" stroke="#0f172a" strokeWidth="1" />
      {/* Stern Helideck Flight Pad Horizon */}
      <rect x="58" y="32" width="16" height="2" fill="#334155" />
    </g>
      </svg>
    ),
  },
  "ormoc_queen_pineapple": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "ORMOC",
    topColor: "#ca8a04",
    bottom: "PINEAPPLE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#eab308" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="26" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Ripe Queen Pineapple Standing Upright in Botanical Detail */}
    <g id="ormoc-pineapple" transform="translate(20, 18)">
      {/* Crown Leaves (Spiky Rosette of Crown Foliage) */}
      <g fill="#15803d" stroke="#14532d" strokeWidth="0.8">
        <polygon points="30,4 26,24 34,24" />
        <polygon points="20,10 24,24 28,24" fill="#16a34a" />
        <polygon points="40,10 32,24 36,24" fill="#16a34a" />
        <polygon points="12,18 22,26 26,26" />
        <polygon points="48,18 34,26 38,26" />
      </g>
      {/* Plump Oval Pineapple Body (Queen Variety) */}
      <ellipse cx="30" cy="52" rx="20" ry="26" fill="#eab308" stroke="#854d0e" strokeWidth="1.3" />
      {/* Diamond-Patterned Skin Matrix (Pineapple Eyes) */}
      <g stroke="#854d0e" strokeWidth="0.8" fill="none">
        {/* Diagonals Left-to-Right */}
        <path d="M14,40 L46,68" /><path d="M12,48 L44,74" /><path d="M16,34 L48,60" />
        {/* Diagonals Right-to-Left */}
        <path d="M46,40 L14,68" /><path d="M48,48 L16,74" /><path d="M44,34 L12,60" />
      </g>
      {/* Eye Center Dots */}
      <g fill="#78350f">
        <circle cx="30" cy="40" r="1.5" /><circle cx="30" cy="52" r="1.5" /><circle cx="30" cy="64" r="1.5" />
        <circle cx="22" cy="46" r="1.5" /><circle cx="38" cy="46" r="1.5" />
        <circle cx="22" cy="58" r="1.5" /><circle cx="38" cy="58" r="1.5" />
      </g>
    </g>
      </svg>
    ),
  },
  "oroquieta_mobod_marine": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "OROQUIETA",
    topColor: "#78350f",
    bottom: "COCONUT",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#a16207" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Mature Coconut with Fibrous Husk and Exposed Shell (Botanical Plate) */}
    <g id="oroquieta-coconut" transform="translate(18, 28)">
      <path d="M8,36 C8,16 20,4 32,4 C44,4 56,16 56,36 C56,52 46,62 32,62 C18,62 8,52 8,36 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.3" />
      <g stroke="#ca8a04" strokeWidth="0.6" fill="none">
        <path d="M14,30 C14,18 22,8 32,8" /><path d="M18,40 C18,22 26,12 32,12" />
        <path d="M50,30 C50,18 42,8 32,8" /><path d="M46,40 C46,22 38,12 32,12" />
      </g>
      <circle cx="32" cy="38" r="15" fill="#451a03" stroke="#1c0702" strokeWidth="1.2" />
      <circle cx="28" cy="34" r="2.2" fill="#1c0702" />
      <circle cx="36" cy="34" r="2.2" fill="#1c0702" />
      <circle cx="32" cy="42" r="2" fill="#1c0702" />
    </g>
      </svg>
    ),
  },
  "ozamiz_fuerte_triunfo": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "OZAMIZ",
    topColor: "#78350f",
    bottom: "COTTA FORT",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="48" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Historic Fuerte de la Concepcion y del Triunfo (Cotta Fort, No People) */}
    <g id="cotta-fort" transform="translate(10, 24)">
      <line x1="2" y1="76" x2="78" y2="76" stroke="#451a03" strokeWidth="1.2" />
      {/* Massive Bastion Stone Rampart Walls */}
      <polygon points="8,40 16,32 64,32 72,40 76,76 4,76" fill="#94a3b8" stroke="#334155" strokeWidth="1.3" />
      {/* Battlements (Crenels & Merlons) */}
      <g fill="#64748b" stroke="#334155" strokeWidth="0.8">
        <rect x="18" y="26" width="6" height="8" /><rect x="28" y="26" width="6" height="8" />
        <rect x="38" y="26" width="6" height="8" /><rect x="48" y="26" width="6" height="8" />
        <rect x="58" y="26" width="6" height="8" />
      </g>
      {/* Stone Masonry Ashlar Hatching */}
      <g stroke="#475569" strokeWidth="0.6">
        <line x1="12" y1="46" x2="68" y2="46" /><line x1="10" y1="56" x2="70" y2="56" />
        <line x1="8" y1="66" x2="72" y2="66" />
      </g>
      {/* Arched Heavy Wooden Sally Port Gate */}
      <path d="M34,76 L34,54 C34,48 46,48 46,54 L46,76 Z" fill="#451a03" stroke="#1c0702" strokeWidth="1.1" />
      {/* Cannon Embrasure Ports */}
      <circle cx="22" cy="50" r="2.5" fill="#1e293b" /><circle cx="58" cy="50" r="2.5" fill="#1e293b" />
    </g>
      </svg>
    ),
  },
  "pagadian_sloping_tricycle": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "PAGADIAN",
    topColor: "#0284c7",
    bottom: "PAGADIAN TRICYCLE",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<line x1="10" y1="88" x2="90" y2="88" stroke="#0369a1" strokeWidth="0.8" />
    {/* Single Pagadian Tricycle with Unusually Inclined Elevated Passenger Cabin (25-40 Degree Hill Incline) */}
    <g id="pagadian-tricycle" transform="translate(10, 26)">
      {/* Main Motorcycle Base (Left) */}
      <circle cx="22" cy="58" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1.1" />
      <circle cx="22" cy="58" r="4" fill="#94a3b8" />
      <rect x="20" y="44" width="12" height="6" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
      <line x1="22" y1="44" x2="26" y2="34" stroke="#475569" strokeWidth="1.4" />
      {/* Unique Inclined / Slanted High-Roofed Sidecar Cabin */}
      {/* Floor slanted upwards at steep 35-degree angle to tackle hills */}
      <polygon points="34,60 74,44 76,22 36,36" fill="#0284c7" stroke="#082f49" strokeWidth="1.3" />
      {/* Roof Canopy Supported on Slanted Struts */}
      <polygon points="32,36 78,20 74,16 28,32" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      {/* Large Sidecar Wheel (Right) */}
      <circle cx="68" cy="58" r="9" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="68" cy="58" r="4.5" fill="#94a3b8" />
      {/* Passenger Window Opening */}
      <polygon points="38,40 70,28 68,36 38,48" fill="#f8fafc" stroke="#082f49" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "palayan_capitol": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "PALAYAN",
    topColor: "#ca8a04",
    bottom: "RICE PANICLE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Framing */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#eab308" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Rice Panicle Bending Naturally Under Grains */}
    <g id="rice-panicle">
      {/* Graceful Arched Stem */}
      <path d="M68,102 Q64,66 48,40 Q38,24 22,28" fill="none" stroke="#854d0e" strokeWidth="1.5" strokeLinecap="round" />
      {/* Individual Heavy Oval Grains Precisely Engraved */}
      <g fill="#fde047" stroke="#854d0e" strokeWidth="0.6">
        <ellipse cx="25" cy="30" rx="3" ry="5.5" transform="rotate(-65 25 30)" />
        <ellipse cx="30" cy="35" rx="3" ry="5.5" transform="rotate(-50 30 35)" />
        <ellipse cx="36" cy="42" rx="3" ry="5.5" transform="rotate(-40 36 42)" />
        <ellipse cx="42" cy="50" rx="3" ry="5.5" transform="rotate(-30 42 50)" />
        <ellipse cx="48" cy="60" rx="3" ry="5.5" transform="rotate(-20 48 60)" />
        <ellipse cx="54" cy="72" rx="3" ry="5.5" transform="rotate(-15 54 72)" />
        <ellipse cx="58" cy="84" rx="3" ry="5.5" transform="rotate(-10 58 84)" />
        {/* Paired Secondary Grains */}
        <ellipse cx="32" cy="27" rx="2.8" ry="5.2" transform="rotate(-75 32 27)" />
        <ellipse cx="38" cy="34" rx="2.8" ry="5.2" transform="rotate(-60 38 34)" />
        <ellipse cx="45" cy="42" rx="2.8" ry="5.2" transform="rotate(-45 45 42)" />
        <ellipse cx="52" cy="52" rx="2.8" ry="5.2" transform="rotate(-35 52 52)" />
        <ellipse cx="58" cy="64" rx="2.8" ry="5.2" transform="rotate(-25 58 64)" />
      </g>
    </g>
      </svg>
    ),
  },
  "palayan_rice": {
    frame: "#2a9d8f",
    bg: "#fefae0",
    top: "PALAYAN",
    topColor: "#264653",
    bottom: "RICE PLAINS",
    bottomColor: "#f4a261",
    renderArt: () => (
      <g>
{/* Golden fields */}
      <rect x="7" y="32" width="34" height="12" fill="#e9c46a" />
      <polygon points="7,44 24,30 41,44" fill="#2a9d8f" opacity="0.3" />
      {/* Nipa Hut */}
      <polygon points="24,20 15,27 33,27" fill="#7f4f24" />
      <rect x="18" y="27" width="12" height="7" fill="#dda15e" />
      <rect x="22" y="29" width="4" height="5" fill="#7f4f24" />
      <circle cx="34" cy="18" r="4.5" fill="#f4a261" />
      </g>
    ),
  },
  "palembang_ampera_bridge": {
    frame: "#991b1b",
    bg: "#fff7ed",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Musi River flowing waters */}
      <rect x="6" y="34" width="36" height="9" fill="#0284c7" />
      <line x1="8" y1="37" x2="26" y2="37" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      <line x1="20" y1="40" x2="40" y2="40" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      {/* Traditional Ketek riverboat */}
      <path d="M 10 39 Q 14 41 18 39 L 17 38 L 11 38 Z" fill="#78350f" />
      <rect x="13" y="37" width="2" height="1.5" fill="#ffffff" />
      {/* Jembatan Ampera twin red pylon towers */}
      {/* Left Tower */}
      <rect x="16" y="14" width="3.5" height="20" fill="#dc2626" />
      <polygon points="16,14 17.75,9 19.5,14" fill="#991b1b" />
      {/* Right Tower */}
      <rect x="28.5" y="14" width="3.5" height="20" fill="#dc2626" />
      <polygon points="28.5,14 30.25,9 32,14" fill="#991b1b" />
      {/* Overhead horizontal crossbeams */}
      <rect x="16" y="18" width="16" height="2" fill="#991b1b" />
      <rect x="16" y="24" width="16" height="1.5" fill="#991b1b" />
      {/* Bridge Road Deck */}
      <rect x="6" y="31" width="36" height="3" fill="#dc2626" stroke="#991b1b" strokeWidth="0.4" />
      {/* Suspension stay cables */}
      <line x1="17.75" y1="14" x2="8" y2="31" stroke="#dc2626" strokeWidth="0.5" opacity="0.7" />
      <line x1="30.25" y1="14" x2="40" y2="31" stroke="#dc2626" strokeWidth="0.5" opacity="0.7" />
      </g>
    ),
  },
  "pampanga_giant_parol": {
    frame: "#0b132b",
    bg: "#0b132b",
    top: "PAMPANGA",
    topColor: "#ffb703",
    bottom: "GIANT PAROL",
    bottomColor: "#ff006e",
    renderArt: () => (
      <g>
{/* Giant 8-Pointed Kaleidoscopic Christmas Parol Lantern */}
      <circle cx="24" cy="27" r="14" fill="#1c2541" />
      {/* Radiating multi-color star points */}
      <polygon points="24,14 26,24 24,27 22,24" fill="#d90429" />
      <polygon points="24,40 26,30 24,27 22,30" fill="#d90429" />
      <polygon points="11,27 21,25 24,27 21,29" fill="#00b4d8" />
      <polygon points="37,27 27,25 24,27 27,29" fill="#00b4d8" />
      <polygon points="15,18 23,24 24,27 20,27" fill="#38b000" />
      <polygon points="33,36 25,30 24,27 28,27" fill="#38b000" />
      <polygon points="33,18 25,24 24,27 28,27" fill="#ffbe0b" />
      <polygon points="15,36 23,30 24,27 20,27" fill="#ffbe0b" />
      {/* Center glowing golden hub */}
      <circle cx="24" cy="27" r="4.5" fill="#ffbe0b" />
      <circle cx="24" cy="27" r="2.5" fill="#ffffff" />
      {/* Two trailing Parol tails */}
      <path d="M 19 37 Q 16 42 17 44" stroke="#ffbe0b" strokeWidth="1.2" fill="none" />
      <path d="M 29 37 Q 32 42 31 44" stroke="#ffbe0b" strokeWidth="1.2" fill="none" />
      </g>
    ),
  },
  "pampanga_parol": {
    frame: "#b91c1c",
    bg: "#fef2f2",
    top: "SAN FERNANDO (PAMPANGA)",
    topColor: "#b91c1c",
    bottom: "GIANT LANTERN",
    bottomColor: "#b91c1c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Outer Radiating Light Rays */}
    <g stroke="#f87171" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
      <line x1="50" y1="12" x2="50" y2="104" /><line x1="12" y1="58" x2="88" y2="58" />
      <line x1="22" y1="30" x2="78" y2="86" /><line x1="78" y1="30" x2="22" y2="86" />
    </g>
    {/* One Enormous Kapampangan Parol (Radial Kaleidoscopic Geometry) */}
    <g id="giant-parol">
      {/* Outer 16-Point Radial Kaleidoscope Perimeter */}
      <circle cx="50" cy="58" r="32" fill="#dc2626" stroke="#991b1b" strokeWidth="1.3" />
      {/* Concentric Geometric Rings */}
      <circle cx="50" cy="58" r="26" fill="#facc15" stroke="#ca8a04" strokeWidth="1.1" />
      <circle cx="50" cy="58" r="20" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <circle cx="50" cy="58" r="14" fill="#0284c7" stroke="#0369a1" strokeWidth="0.9" />
      {/* Central 8-Point Brilliant Star */}
      <polygon points="50,46 53,55 62,58 53,61 50,70 47,61 38,58 47,55" fill="#ffffff" stroke="#eab308" strokeWidth="1.1" />
      {/* Radial Colored Prisms / Windows */}
      <g stroke="#ffffff" strokeWidth="0.7" fill="none">
        <line x1="50" y1="32" x2="50" y2="84" /><line x1="24" y1="58" x2="76" y2="58" />
        <line x1="32" y1="40" x2="68" y2="76" /><line x1="68" y1="40" x2="32" y2="76" />
      </g>
    </g>
      </svg>
    ),
  },
  "panabo_banana_capital": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "PANABO",
    topColor: "#ca8a04",
    bottom: "BANANA",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#eab308" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Large Hanging Bunch of Cavendish Bananas (Banana Capital) */}
    <g id="banana-bunch" transform="translate(20, 16)">
      {/* Heavy Hanging Inflorescence Stalk (Rachis) */}
      <path d="M30,4 L30,28" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M30,28 L30,84" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      {/* Hanging Hands / Clusters of Yellow Cavendish Bananas */}
      {/* Tier 1 (Top Hand) */}
      <g fill="#facc15" stroke="#a16207" strokeWidth="0.8">
        <path d="M28,24 C18,22 10,28 10,36 C18,34 26,30 28,24 Z" />
        <path d="M28,24 C22,26 16,34 18,42 C24,38 28,32 28,24 Z" />
        <path d="M32,24 C42,22 50,28 50,36 C42,34 34,30 32,24 Z" />
        <path d="M32,24 C38,26 44,34 42,42 C36,38 32,32 32,24 Z" />
      </g>
      {/* Tier 2 (Mid Hand) */}
      <g fill="#fde047" stroke="#a16207" strokeWidth="0.8">
        <path d="M28,40 C18,38 12,46 14,54 C20,50 26,46 28,40 Z" />
        <path d="M32,40 C42,38 48,46 46,54 C40,50 34,46 32,40 Z" />
        <path d="M26,44 C24,52 28,60 30,64 C32,58 30,50 26,44 Z" />
      </g>
      {/* Terminal Heart (Puso ng Saging / Male Inflorescence Bud) at Bottom */}
      <path d="M30,82 C24,84 22,94 30,102 C38,94 36,84 30,82 Z" fill="#881337" stroke="#4c0519" strokeWidth="1.1" />
    </g>
      </svg>
    ),
  },
  "paranaque_baclaran": {
    frame: "#c1121f",
    bg: "#fdf0d5",
    top: "PARAÑAQUE",
    topColor: "#c1121f",
    bottom: "BACLARAN",
    bottomColor: "#669bbc",
    renderArt: () => (
      <g>
{/* Baclaran Redemptorist Church Facade */}
      <rect x="12" y="24" width="24" height="19" fill="#c1121f" rx="1" />
      <polygon points="24,14 14,24 34,24" fill="#780000" />
      <line x1="24" y1="9" x2="24" y2="14" stroke="#c1121f" strokeWidth="1.2" />
      <line x1="22" y1="11" x2="26" y2="11" stroke="#c1121f" strokeWidth="1" />
      {/* Center Rose Window & Arch */}
      <circle cx="24" cy="21" r="2.8" fill="#fdf0d5" stroke="#780000" strokeWidth="0.6" />
      <path d="M 21 43 V 33 A 3 3 0 0 1 27 33 V 43 Z" fill="#fdf0d5" />
      {/* Palm tree */}
      <path d="M 36 43 Q 35 34 37 27" stroke="#780000" strokeWidth="1" fill="none" />
      <path d="M 37 27 Q 34 24 32 26" stroke="#2d6a4f" strokeWidth="1" fill="none" />
      <path d="M 37 27 Q 40 24 41 27" stroke="#2d6a4f" strokeWidth="1" fill="none" />
      </g>
    ),
  },
  "paranaque_palayok": {
    frame: "#991b1b",
    bg: "#fafaf9",
    top: "PARAÑAQUE",
    topColor: "#991b1b",
    bottom: "BACLARAN CHURCH",
    bottomColor: "#991b1b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Sky backdrop with architectural rays */}
    <g opacity="0.3" stroke="#b91c1c" strokeWidth="0.4">
      <circle cx="50" cy="54" r="34" fill="none" strokeDasharray="2 2" />
    </g>

    {/* NATIONAL SHRINE OF OUR MOTHER OF PERPETUAL HELP (BACLARAN CHURCH) */}
    {/* Symmetrical Frontal Architectural Facade */}
    {/* Main Massive Nave Facade Block */}
    <rect x="20" y="32" width="60" height="70" fill="#f5f5f4" stroke="#44403c" strokeWidth="1.2" />

    {/* Monumental Stepped Gabled Pediment Apex */}
    <polygon points="50,16 18,32 82,32" fill="#e7e5e4" stroke="#44403c" strokeWidth="1.3" />
    {/* Pediment Cross Finial */}
    <path d="M50,10 L50,16 M48,12 L52,12" stroke="#78350f" strokeWidth="1.3" strokeLinecap="round" />

    {/* Central Romanesque Rose Window / Perforated Octofoil */}
    <circle cx="50" cy="40" r="8" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
    <circle cx="50" cy="40" r="5" fill="#ca8a04" stroke="#78350f" strokeWidth="0.6" />
    <g stroke="#451a03" strokeWidth="0.6">
      <line x1="50" y1="32" x2="50" y2="48" /><line x1="42" y1="40" x2="58" y2="40" />
      <line x1="44.3" y1="34.3" x2="55.7" y2="45.7" /><line x1="44.3" y1="45.7" x2="55.7" y2="34.3" />
    </g>

    {/* Flanking Symmetrical Bell Towers / Buttress Columns */}
    <rect x="18" y="28" width="8" height="74" fill="#d6d3d1" stroke="#44403c" strokeWidth="0.9" />
    <rect x="74" y="28" width="8" height="74" fill="#d6d3d1" stroke="#44403c" strokeWidth="0.9" />
    {/* Upper Bell Tower Louvered Arches */}
    <path d="M20,38 A2,3 0 0 1 24,38 L24,46 L20,46 Z" fill="#292524" stroke="#44403c" strokeWidth="0.6" />
    <path d="M76,38 A2,3 0 0 1 80,38 L80,46 L76,46 Z" fill="#292524" stroke="#44403c" strokeWidth="0.6" />

    {/* Colonnaded Upper Gallery (Vertical Architectural Engraving) */}
    <g stroke="#78716c" strokeWidth="0.6">
      <line x1="32" y1="52" x2="32" y2="66" /><line x1="38" y1="52" x2="38" y2="66" />
      <line x1="44" y1="52" x2="44" y2="66" /><line x1="50" y1="52" x2="50" y2="66" />
      <line x1="56" y1="52" x2="56" y2="66" /><line x1="62" y1="52" x2="62" y2="66" />
      <line x1="68" y1="52" x2="68" y2="66" />
      <line x1="28" y1="52" x2="72" y2="52" /><line x1="28" y1="66" x2="72" y2="66" />
    </g>

    {/* TRIPLE-ARCHED PORTICO ENTRANCE (Centerpiece of Facade) */}
    {/* Center Main Portal Arch */}
    <path d="M43,102 L43,76 C43,70 57,70 57,76 L57,102 Z" fill="#1c1917" stroke="#44403c" strokeWidth="1.2" />
    {/* Center Arch Moulding */}
    <path d="M41,102 L41,75 C41,68 59,68 59,75 L59,102 Z" fill="none" stroke="#78716c" strokeWidth="0.8" />

    {/* Left Entrance Arch */}
    <path d="M29,102 L29,82 C29,77 39,77 39,82 L39,102 Z" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
    {/* Right Entrance Arch */}
    <path d="M61,102 L61,82 C61,77 71,77 71,82 L71,102 Z" fill="#1c1917" stroke="#44403c" strokeWidth="1" />

    {/* Monumental Entrance Staircase Plinth */}
    <rect x="14" y="99" width="72" height="3" fill="#e7e5e4" stroke="#44403c" strokeWidth="0.8" />
      </svg>
    ),
  },
  "pasay_manila_bay": {
    frame: "#991b1b",
    bg: "#fffbeb",
    top: "PASAY",
    topColor: "#991b1b",
    bottom: "ALIWAN FESTIVAL ORNAMENT",
    bottomColor: "#991b1b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Symmetrical Radial Aliwan Festival Ceremonial Ornament */}
    <g id="aliwan-festival-rosette" transform="translate(50, 60)">
      {/* Outer Decorative Halo Rings */}
      <circle cx="0" cy="0" r="42" fill="none" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.5 2" opacity="0.6" />
      <circle cx="0" cy="0" r="39" fill="none" stroke="#b45309" strokeWidth="0.8" />

      {/* 16 Outer Scalloped Ray Points */}
      <g stroke="#991b1b" strokeWidth="0.8">
        {/* 8 Cardinal & Diagonal Giant Festival Rays */}
        <polygon points="0,-42 -4,-32 4,-32" fill="#dc2626" />
        <polygon points="0,42 -4,32 4,32" fill="#dc2626" />
        <polygon points="-42,0 -32,-4 -32,4" fill="#dc2626" />
        <polygon points="42,0 32,-4 32,4" fill="#dc2626" />
        <polygon points="-30,-30 -25,-20 -20,-25" fill="#ea580c" />
        <polygon points="30,-30 20,-25 25,-20" fill="#ea580c" />
        <polygon points="-30,30 -20,25 -25,20" fill="#ea580c" />
        <polygon points="30,30 25,20 20,25" fill="#ea580c" />
      </g>

      {/* Second Concentric Star Layer (Golden Geometrics) */}
      <circle cx="0" cy="0" r="32" fill="#fef3c7" stroke="#d97706" strokeWidth="1.0" />
      {/* Intricate 12-pointed Star Lattice */}
      <polygon points="0,-32 8,-12 28,-16 16,0 28,16 8,12 0,32 -8,12 -28,16 -16,0 -28,-16 -8,-12" fill="#fbbf24" stroke="#b45309" strokeWidth="0.9" />

      {/* Layered Filigree Floral Petals */}
      <circle cx="0" cy="0" r="22" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.1" />
      {/* 8 Radial Lotus / Capiz Petals */}
      <g fill="#fef08a" stroke="#ca8a04" strokeWidth="0.7">
        <path d="M 0 0 C -5 -12, -8 -18, 0 -22 C 8 -18, 5 -12, 0 0 Z" />
        <path d="M 0 0 C -5 12, -8 18, 0 22 C 8 18, 5 12, 0 0 Z" />
        <path d="M 0 0 C -12 -5, -18 -8, -22 0 C -18 8, -12 5, 0 0 Z" />
        <path d="M 0 0 C 12 -5, 18 -8, 22 0 C 18 8, 12 5, 0 0 Z" />
        <path d="M 0 0 C -12 -12, -16 -16, -15 -15 C -16 -16, -12 -12, 0 0 Z" strokeWidth="1.2" />
      </g>

      {/* Inner Emerald Jewel Ring */}
      <circle cx="0" cy="0" r="13" fill="#047857" stroke="#064e3b" strokeWidth="0.9" />
      <circle cx="0" cy="0" r="10" fill="#facc15" stroke="#b45309" strokeWidth="0.7" />

      {/* Central Rosette Core */}
      <circle cx="0" cy="0" r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="3" fill="#ffffff" stroke="#ca8a04" strokeWidth="0.6" />

      {/* Fine Intaglio Radiating Stipples & Rays */}
      <g stroke="#ffffff" strokeWidth="0.5" opacity="0.8">
        <line x1="0" y1="-22" x2="0" y2="-13" />
        <line x1="0" y1="13" x2="0" y2="22" />
        <line x1="-22" y1="0" x2="-13" y2="0" />
        <line x1="13" y1="0" x2="22" y2="0" />
      </g>
    </g>
      </svg>
    ),
  },
  "pasay_sunset": {
    frame: "#f77f00",
    bg: "#03071e",
    top: "PASAY",
    topColor: "#fcbf49",
    bottom: "MANILA BAY",
    bottomColor: "#f77f00",
    renderArt: () => (
      <g>
{/* Manila Bay Sunset sky gradients */}
      <rect x="8" y="14" width="32" height="14" fill="#d00000" />
      <rect x="8" y="24" width="32" height="7" fill="#f77f00" />
      {/* Glowing Sun Disc */}
      <circle cx="24" cy="28" r="6" fill="#ffba08" />
      {/* Bay Waters reflection */}
      <rect x="8" y="31" width="32" height="13" fill="#370617" />
      <ellipse cx="24" cy="33" rx="7" ry="1" fill="#ffba08" opacity="0.8" />
      <ellipse cx="24" cy="36" rx="5" ry="0.8" fill="#f77f00" opacity="0.7" />
      {/* Coconut Palm Silhouette */}
      <path d="M 12 44 Q 16 35 14 24" stroke="#03071e" strokeWidth="1.6" fill="none" />
      <path d="M 14 24 Q 9 20 8 23" stroke="#03071e" strokeWidth="1.2" fill="none" />
      <path d="M 14 24 Q 18 19 21 21" stroke="#03071e" strokeWidth="1.2" fill="none" />
      <path d="M 14 24 Q 12 17 10 18" stroke="#03071e" strokeWidth="1.2" fill="none" />
      </g>
    ),
  },
  "pasig_mutya": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "PASIG",
    topColor: "#0369a1",
    bottom: "PASIG RIVER",
    bottomColor: "#0369a1",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/pasig_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "pasig_river_ferry": {
    frame: "#1d3557",
    bg: "#f1faee",
    top: "PASIG",
    topColor: "#1d3557",
    bottom: "PASIG RIVER",
    bottomColor: "#2a9d8f",
    renderArt: () => (
      <g>
{/* River water */}
      <rect x="8" y="30" width="32" height="14" fill="#2a9d8f" />
      <path d="M 8 33 Q 16 31 24 33 Q 32 31 40 33" stroke="#a8dadc" strokeWidth="0.8" fill="none" />
      <path d="M 8 38 Q 16 36 24 38 Q 32 36 40 38" stroke="#a8dadc" strokeWidth="0.8" fill="none" />
      {/* Pasig Bridge Arch */}
      <path d="M 9 32 Q 24 16 39 32" stroke="#1d3557" strokeWidth="2.2" fill="none" />
      <line x1="16" y1="24" x2="16" y2="31" stroke="#1d3557" strokeWidth="0.8" />
      <line x1="24" y1="19" x2="24" y2="31" stroke="#1d3557" strokeWidth="0.8" />
      <line x1="32" y1="24" x2="32" y2="31" stroke="#1d3557" strokeWidth="0.8" />
      {/* Pasig River Ferry Boat */}
      <path d="M 16 34 L 32 34 L 30 38 L 18 38 Z" fill="#e63946" />
      <rect x="19" y="31" width="10" height="3" fill="#ffffff" />
      <rect x="21" y="32" width="2" height="1.5" fill="#1d3557" />
      <rect x="25" y="32" width="2" height="1.5" fill="#1d3557" />
      </g>
    ),
  },
  "passi_pineapple": {
    frame: "#d97706",
    bg: "#fefae0",
    top: "PASSI",
    topColor: "#b45309",
    bottom: "PINTADOS DE PASI",
    bottomColor: "#15803d",
    renderArt: () => (
      <g>
{/* Golden Sweet Pineapple Fruit */}
      <ellipse cx="24" cy="30" rx="8" ry="11" fill="#f59e0b" />
      {/* Diamond eyes pattern */}
      <line x1="18" y1="23" x2="30" y2="35" stroke="#b45309" strokeWidth="0.8" />
      <line x1="30" y1="23" x2="18" y2="35" stroke="#b45309" strokeWidth="0.8" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="#b45309" strokeWidth="0.8" />
      {/* Spiky Green Crown Leaves */}
      <polygon points="24,12 21,21 27,21" fill="#15803d" />
      <polygon points="19,14 18,22 23,21" fill="#16a34a" />
      <polygon points="29,14 25,21 30,22" fill="#16a34a" />
      </g>
    ),
  },
  "passi_sweet_pineapple": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "PASSI",
    topColor: "#a16207",
    bottom: "TRADITIONAL WOVEN BILAO",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Heritage Aura */}
    <g opacity="0.25" stroke="#a16207" strokeWidth="0.5">
      <ellipse cx="50" cy="60" rx="38" ry="34" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="traditional-bilao-basket" transform="translate(6, 12)">
      {/* Baseline Cast Shadow */}
      <ellipse cx="44" cy="72" rx="34" ry="8" fill="#1e293b" opacity="0.22" />

      {/* Outer Sturdy Double-Bound Rattan/Bamboo Rim */}
      <ellipse cx="44" cy="56" rx="35" ry="22" fill="#78350f" stroke="#451a03" strokeWidth="1.3" />
      <ellipse cx="44" cy="56" rx="33" ry="20.5" fill="#a16207" stroke="#713f12" strokeWidth="1.0" />

      {/* Woven Bamboo Mat Tray Floor (Slightly Concave Inner Surface) */}
      <ellipse cx="44" cy="56" rx="31" ry="19" fill="#fef08a" stroke="#854d0e" strokeWidth="0.9" />

      {/* Intricate Interlocking Bamboo Weave Pattern (Diagonal Twill / Herringbone Weaving) */}
      {/* Diagonal Weave Lines / Pattern Grid */}
      <g stroke="#ca8a04" strokeWidth="0.6" opacity="0.8">
        <line x1="20" y1="46" x2="68" y2="66" /><line x1="24" y1="42" x2="64" y2="70" />
        <line x1="30" y1="38" x2="58" y2="74" /><line x1="16" y1="52" x2="72" y2="60" />
        <line x1="20" y1="66" x2="68" y2="46" /><line x1="24" y1="70" x2="64" y2="42" />
        <line x1="30" y1="74" x2="58" y2="38" /><line x1="16" y1="60" x2="72" y2="52" />
      </g>
      {/* Weave Texture Blocks */}
      <g stroke="#92400e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.7">
        <ellipse cx="44" cy="56" rx="22" ry="13" fill="none" />
        <ellipse cx="44" cy="56" rx="14" ry="8" fill="none" />
      </g>

      {/* Double-Bound Rim Decorative Cord / Vine Lashings (Tali) at Regular Intervals */}
      <g stroke="#451a03" strokeWidth="1.1">
        <line x1="44" y1="34" x2="44" y2="37" />
        <line x1="44" y1="75" x2="44" y2="78" />
        <line x1="9" y1="56" x2="13" y2="56" />
        <line x1="75" y1="56" x2="79" y2="56" />
        <line x1="19" y1="42" x2="22" y2="44" />
        <line x1="66" y1="42" x2="69" y2="44" />
        <line x1="19" y1="70" x2="22" y2="68" />
        <line x1="66" y1="70" x2="69" y2="68" />
      </g>
    </g>
      </svg>
    ),
  },
  "pateros_balut": {
    frame: "#854d0e",
    bg: "#faf8f2",
    top: "PATEROS",
    topColor: "#854d0e",
    bottom: "BALUT",
    bottomColor: "#854d0e",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* 19th-Century Scientific Specimen Oval Vignette Framing */}
    <ellipse cx="50" cy="54" r="35" fill="none" stroke="#a16207" strokeWidth="0.6" strokeDasharray="2 1.5" />
    <g opacity="0.25" stroke="#78350f" strokeWidth="0.4">
      <line x1="20" y1="20" x2="80" y2="20" /><line x1="20" y1="88" x2="80" y2="88" />
    </g>

    {/* THE PATEROS BALUT SPECIMEN (UPRIGHT CRACKED EGG IN CERAMIC CUP) */}
    {/* Shadow beneath Egg Cup Base */}
    <ellipse cx="50" cy="92" rx="20" ry="3.5" fill="#1e293b" opacity="0.2" />

    {/* Traditional Earthenware Egg Cup / Pedestal */}
    <path d="M38,92 L62,92 L58,82 L42,82 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.9" />
    <ellipse cx="50" cy="82" rx="14" ry="3" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />

    {/* Egg Lower Shell Half (Pristine Duck Egg White/Cream) */}
    <path d="M30,56 C30,76 38,82 50,82 C62,82 70,76 70,56" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
    {/* Fine Stippled Shading on Egg Shell Curvature */}
    <g fill="#94a3b8" opacity="0.5">
      <circle cx="34" cy="64" r="0.5" /><circle cx="36" cy="68" r="0.5" /><circle cx="40" cy="74" r="0.5" />
      <circle cx="66" cy="64" r="0.5" /><circle cx="64" cy="68" r="0.5" /><circle cx="60" cy="74" r="0.5" />
    </g>

    {/* CRACKED CHIPPED SHELL RIM (Irregular Jagged Natural Break) */}
    <path d="M30,56 L33,52 L36,54 L40,49 L45,53 L50,48 L55,52 L60,49 L64,54 L68,51 L70,56" fill="none" stroke="#475569" strokeWidth="1.2" strokeLinejoin="round" />

    {/* INTERIOR OF BALUT (RECOGNIZABLE CULINARY/SCIENTIFIC ANATOMY) */}
    {/* Rich Golden Savor Broth (Sabaw) & Custard Cavity */}
    <path d="M31,56 Q50,60 69,56 Q68,76 50,77 Q32,76 31,56 Z" fill="#ca8a04" stroke="#854d0e" strokeWidth="0.8" />

    {/* Golden Rich Yolk (Pula / Balut Yolk) */}
    <path d="M34,58 C34,52 46,50 48,58 C46,68 36,66 34,58 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
    {/* Yolk Lobe Texture & Highlight */}
    <circle cx="41" cy="56" r="1.8" fill="#fef08a" />

    {/* Developing Specimen (Sisiw Embryo Silhouette) */}
    <path d="M48,56 C50,52 56,51 60,55 C64,59 62,65 56,66 C51,66 48,61 48,56 Z" fill="#713f12" stroke="#3b1d11" strokeWidth="0.9" />
    {/* Delicate Scientific Stippling / Feathery Winglet Etching */}
    <g fill="none" stroke="#a16207" strokeWidth="0.4">
      <path d="M52,56 Q56,58 58,62" />
      <path d="M50,59 Q54,61 56,64" />
    </g>

    {/* Albumen (White / Bato) Base Segment */}
    <ellipse cx="50" cy="72" rx="12" ry="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" opacity="0.9" />

    {/* A Dash of Rock Salt Grains beside Egg Cup */}
    <g fill="#ffffff" stroke="#94a3b8" strokeWidth="0.3">
      <rect x="30" y="93" width="1.2" height="1.2" /><rect x="33" y="94" width="1.2" height="1.2" />
      <rect x="67" y="93" width="1.2" height="1.2" /><rect x="70" y="94" width="1.2" height="1.2" />
    </g>
      </svg>
    ),
  },
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
  "pines": {
    frame: "#1b4332",
    bg: "#faf8ee",
    top: "BAGUIO",
    topColor: "#1b4332",
    bottom: "CORDILLERA HERITAGE",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
        {/* Outer Double Stamp Framing */}
        <rect x="8" y="8" width="84" height="104" fill="#faf8ee" stroke="#1b4332" strokeWidth="1.8" />
        <rect x="10.5" y="10.5" width="79" height="99" fill="none" stroke="#2d6a4f" strokeWidth="0.6" strokeDasharray="2 1.5" />

        {/* Circular Vignette (Inspired directly by the Nov 24, 1947 Baguio postmark) */}
        <circle cx="53" cy="54" r="35" fill="#fefdf8" stroke="#1b4332" strokeWidth="2" />
        <circle cx="53" cy="54" r="33" fill="none" stroke="#2d6a4f" strokeWidth="0.6" strokeDasharray="2 1" />

        <g clipPath="url(#baguio-vignette-clip)">
          <defs>
            <clipPath id="baguio-vignette-clip">
              <circle cx="53" cy="54" r="32.5" />
            </clipPath>
          </defs>

          {/* Sky background horizontal etched shading lines */}
          <g opacity="0.4" stroke="#2d6a4f" strokeWidth="0.45">
            <line x1="38" y1="26" x2="86" y2="26" strokeDasharray="4 2" />
            <line x1="42" y1="29" x2="86" y2="29" strokeDasharray="2 3" />
            <line x1="40" y1="32" x2="86" y2="32" strokeDasharray="5 3" />
          </g>

          {/* Distant mountain peaks (Receding Cordillera mountain ranges) */}
          <polygon points="40,42 52,32 64,39 74,27 88,38 88,52 40,52" fill="#d8ebd8" opacity="0.6" />
          <path d="M 40 42 L 52 32 L 64 39 L 74 27 L 88 38" fill="none" stroke="#2d6a4f" strokeWidth="0.7" />

          {/* Mountain Peak & Slope with Stepped Terraces */}
          <path d="M 68 26 L 76 33 L 86 38 L 86 88 L 35 88 L 44 56 Q 56 42 68 26 Z" fill="#c1dec1" opacity="0.4" />
          
          {/* Sharp mountain ridge dividing sunlit terrace face and shadow */}
          <path d="M 68 26 C 64 35, 56 45, 46 54 C 38 62, 34 72, 34 88" fill="none" stroke="#1b4332" strokeWidth="1.3" />

          {/* Terraces: stepped ledges with solid drops */}
          <path d="M 68 27 Q 75 32 86 35" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="68,27 86,35 86,38 65,33" fill="#1b4332" opacity="0.7" />
          
          <path d="M 65 33 Q 74 38 86 41" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="65,33 86,41 86,44 61,39" fill="#1b4332" opacity="0.7" />

          <path d="M 61 39 Q 72 44 86 48" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="61,39 86,48 86,52 56,45" fill="#1b4332" opacity="0.7" />

          <path d="M 56 45 Q 70 51 86 55" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="56,45 86,55 86,59 51,52" fill="#1b4332" opacity="0.7" />

          <path d="M 51 52 Q 67 58 86 63" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="51,52 86,63 86,67 46,60" fill="#1b4332" opacity="0.7" />

          <path d="M 46 60 Q 65 66 86 71" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="46,60 86,71 86,75 41,68" fill="#1b4332" opacity="0.7" />

          <path d="M 41 68 Q 62 74 86 79" fill="none" stroke="#1b4332" strokeWidth="0.9" />
          <polygon points="41,68 86,79 86,83 37,76" fill="#1b4332" opacity="0.7" />

          {/* Terraced green fields between tiers */}
          <g fill="#9fc49f" opacity="0.5">
            <polygon points="65,33 86,41 86,38 68,27" />
            <polygon points="61,39 86,48 86,44 65,33" />
            <polygon points="56,45 86,55 86,52 61,39" />
            <polygon points="51,52 86,63 86,59 56,45" />
            <polygon points="46,60 86,71 86,67 51,52" />
            <polygon points="41,68 86,79 86,75 46,60" />
          </g>

          {/* Pine trees on the high mountain crest */}
          <g stroke="#1b4332" strokeWidth="0.7" fill="#1b4332">
            <path d="M 68 23 L 68 27 M 66 25 L 70 25 M 65 26 L 71 26" />
            <path d="M 72 20 L 72 25 M 70 22 L 74 22 M 69 23 L 75 23" />
            <path d="M 77 24 L 77 29 M 75 26 L 79 26" />
            <path d="M 82 28 L 82 33 M 80 30 L 84 30" />
          </g>
        </g>

        {/* IGOROT WOMAN WITH KAYABANG (Woodcut style matching 1947 postmark) */}
        <g id="igorot-woman">
          {/* Kayabang (Cordillera woven harvest basket worn on back) */}
          <path d="M 14 35 L 28 24 L 35 34 L 25 56 L 16 53 Z" fill="#faf8ee" stroke="#1b4332" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Elliptical flared rim */}
          <ellipse cx="21" cy="29.5" rx="8" ry="3.5" transform="rotate(-34 21 29.5)" fill="#e2ede2" stroke="#1b4332" strokeWidth="1" />
          {/* Woven bamboo diagonal basket weave */}
          <g stroke="#1b4332" strokeWidth="0.6">
            <line x1="17" y1="31" x2="19" y2="54" /><line x1="22" y1="29" x2="21" y2="55" /><line x1="27" y1="30" x2="23" y2="54" />
            <line x1="14" y1="37" x2="33" y2="30" /><line x1="15" y1="43" x2="30" y2="37" /><line x1="16" y1="49" x2="26" y2="44" />
          </g>

          {/* Tumpline strap around forehead */}
          <path d="M 22 28 Q 26 32 29 33" fill="none" stroke="#1b4332" strokeWidth="1.1" />

          {/* Head & Hair (Traditional braided crown & hair bun) */}
          <path d="M 28 28 C 28 22, 35 21, 37 25 C 38 29, 37 33, 32 33 C 29 33, 28 31, 28 28 Z" fill="#1b4332" />
          {/* Face profile turned right */}
          <path d="M 34 26 C 36 26, 37 27, 37 29 C 37 31, 35 33, 33 33" fill="#faf8ee" stroke="#1b4332" strokeWidth="0.8" />
          <path d="M 36 28 L 38 29.5 L 36.5 30.5" fill="none" stroke="#1b4332" strokeWidth="0.7" />

          {/* Right Arm raised to brow shading eyes (Iconic pose from 1947 postmark) */}
          <path d="M 34 34 Q 39 31 42 26 Q 40 24 36.5 25" fill="#faf8ee" stroke="#1b4332" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M 37 25 L 41 24" stroke="#1b4332" strokeWidth="1.3" strokeLinecap="round" />

          {/* Left Arm holding basket strap / cane */}
          <path d="M 27 36 Q 26 43 29 48" fill="none" stroke="#1b4332" strokeWidth="1.2" />

          {/* Cordillera Woven Blouse */}
          <path d="M 26 35 L 36 35 L 35 49 L 25 47 Z" fill="#faf8ee" stroke="#1b4332" strokeWidth="1.1" />
          {/* Tribal striped weave bands on blouse */}
          <g stroke="#1b4332" strokeWidth="0.9">
            <line x1="26" y1="38" x2="35.5" y2="38" /><line x1="26" y1="41" x2="35.5" y2="41" />
            <line x1="25.5" y1="44" x2="35.2" y2="44" /><line x1="25" y1="47" x2="35.2" y2="47" />
          </g>

          {/* Tapis (Cordillera wrap-around striped skirt) */}
          <path d="M 25 48 L 35 49 L 38 67 L 23 66 Z" fill="#faf8ee" stroke="#1b4332" strokeWidth="1.2" />
          {/* Alternating solid and patterned tribal stripes */}
          <polygon points="24.5,52 35.5,53 36,56 24,55" fill="#1b4332" />
          <polygon points="23.5,59 36.5,60 37,63 23,62" fill="#1b4332" />
          <line x1="24" y1="57.5" x2="36" y2="58.5" stroke="#2d6a4f" strokeWidth="0.5" strokeDasharray="1 1" />
          <line x1="23" y1="65" x2="38" y2="66" stroke="#1b4332" strokeWidth="0.7" />

          {/* Bare Legs standing firmly on the hillside slope */}
          <path d="M 27 67 L 27 79 L 25 80" fill="none" stroke="#1b4332" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 33 67 L 34 78 L 37 79" fill="none" stroke="#1b4332" strokeWidth="1.3" strokeLinecap="round" />
        </g>

        {/* Foreground Grassy Hillside with wild highland grass (breaking circle border) */}
        <g stroke="#1b4332" fill="none" strokeLinejoin="round">
          <path d="M 10 84 Q 26 76 44 77 Q 60 79 72 87" strokeWidth="1.4" />
          <path d="M 11 86 L 9 75 L 13 83 M 13 83 L 14 73 L 17 82 M 17 82 L 20 71 L 21 82 M 21 82 L 24 75 L 26 81" strokeWidth="1" />
          <path d="M 26 82 L 25 73 L 29 79 M 30 79 L 31 69 L 34 78 M 35 79 L 37 71 L 39 78 M 40 78 L 42 72 L 45 79" strokeWidth="1" />
          <path d="M 46 79 L 49 71 L 52 78 M 53 78 L 57 73 L 59 81 M 60 81 L 65 75 L 68 84" strokeWidth="1" />
        </g>

        {/* Bottom decorative engraved border */}
        <g stroke="#1b4332" strokeWidth="0.6" fill="none">
          <line x1="16" y1="96" x2="84" y2="96" />
          <line x1="16" y1="98" x2="84" y2="98" strokeDasharray="1 1.5" />
          <line x1="20" y1="101" x2="80" y2="101" />
        </g>

        {/* Vintage corner rosettes in 4 stamp corners */}
        <g stroke="#1b4332" strokeWidth="0.8" fill="none">
          <circle cx="14" cy="14" r="2.5" /><circle cx="86" cy="14" r="2.5" />
          <circle cx="14" cy="106" r="2.5" /><circle cx="86" cy="106" r="2.5" />
          <path d="M 11 14 L 17 14 M 14 11 L 14 17" /><path d="M 83 14 L 89 14 M 86 11 L 86 17" />
          <path d="M 11 106 L 17 106 M 14 103 L 14 109" /><path d="M 83 106 L 89 106 M 86 103 L 86 109" />
        </g>
      </svg>
    ),
  },
  "puerto_princesa_subterranean": {
    frame: "#064e3b",
    bg: "#f0fdf4",
    top: "PUERTO PRINCESA",
    topColor: "#064e3b",
    bottom: "UNDERGROUND RIVER",
    bottomColor: "#064e3b",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Dramatic Limestone Arch of Underground River Cave */}
    {/* Massive Surrounding Karst Cliff with Rock Strata Hatching */}
    <path d="M12,18 L88,18 L88,102 L12,102 Z" fill="#047857" stroke="#022c22" strokeWidth="1.3" />
    {/* Rock Texture Strata Lines */}
    <g stroke="#022c22" strokeWidth="0.8" fill="none">
      <path d="M14,28 Q50,22 86,28" /><path d="M14,40 Q50,34 86,40" />
      <path d="M14,52 Q34,48 40,54" /><path d="M60,54 Q66,48 86,52" />
    </g>
    {/* Deep Ominous Cave Vault / Arch Opening */}
    <path d="M30,94 C28,58 36,44 50,44 C64,44 72,58 70,94 Z" fill="#020617" stroke="#022c22" strokeWidth="1.4" />
    {/* Stalactites Hanging from Cave Ceiling */}
    <polygon points="40,46 42,56 44,46" fill="#0f172a" />
    <polygon points="48,45 50,60 52,45" fill="#0f172a" />
    <polygon points="56,46 58,54 60,46" fill="#0f172a" />
    {/* Calm Emerald River Water Flowing from Cave */}
    <path d="M26,94 C34,92 66,92 74,94 L88,102 L12,102 Z" fill="#0f766e" />
    <line x1="24" y1="96" x2="76" y2="96" stroke="#2dd4bf" strokeWidth="0.7" strokeDasharray="3 1.5" />
    <line x1="20" y1="100" x2="80" y2="100" stroke="#2dd4bf" strokeWidth="0.7" strokeDasharray="2 1" />
      </svg>
    ),
  },
  "purwokerto_slamet_waterfall": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Towering Mount Slamet volcano summit (3,428m) */}
      <polygon points="24,11 11,31 37,31" fill="#475569" />
      <polygon points="24,11 26,16 37,31 24,31" fill="#334155" />
      {/* Volcanic crater steam plume */}
      <circle cx="24" cy="9" r="1.5" fill="#f8fafc" opacity="0.8" />
      <circle cx="26" cy="7.5" r="2" fill="#f8fafc" opacity="0.6" />
      {/* Highland pine gorge cliffs */}
      <path d="M 6 28 L 18 28 L 19 43 L 6 43 Z" fill="#14532d" />
      <path d="M 29 28 L 42 28 L 42 43 L 29 43 Z" fill="#14532d" />
      {/* Curug Cipendok / Baturraden vertical cascading waterfall */}
      <rect x="20" y="27" width="8" height="15" fill="#38bdf8" />
      <path d="M 22 27 L 22 42 M 24 27 L 24 42 M 26 27 L 26 42" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 1" />
      {/* Foam pool & river */}
      <ellipse cx="24" cy="41" rx="8" ry="2" fill="#bae6fd" />
      </g>
    ),
  },
  "qc_monument": {
    frame: "#0f172a",
    bg: "#fafafa",
    top: "QUEZON CITY",
    topColor: "#0f172a",
    bottom: "QUEZON MEMORIAL SHRINE ARCHITECTURE",
    bottomColor: "#0f172a",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/quezon_city_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "roxas_diwal_seafood": {
    frame: "#0891b2",
    bg: "#ecfeff",
    top: "ROXAS CITY",
    topColor: "#0891b2",
    bottom: "CAPIZ ANGEL-WING DIWAL",
    bottomColor: "#0891b2",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Marine Specimen Ellipse */}
    <g opacity="0.25" stroke="#0891b2" strokeWidth="0.5">
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="none" strokeDasharray="2 2" />
    </g>

    <g id="angel-wing-clam-diwal" transform="translate(6, 10)">
      {/* Soft Marine Sand Shadow */}
      <ellipse cx="44" cy="74" rx="30" ry="4.5" fill="#1e293b" opacity="0.2" />

      {/* Left / Lower Valve (Gently parted underneath) */}
      <path d="
        M 16 64
        C 22 52, 38 46, 56 48
        C 68 50, 76 56, 74 62
        C 68 68, 52 74, 34 74
        C 22 74, 14 70, 16 64 Z
      " fill="#cffafe" stroke="#0891b2" strokeWidth="1.0" />

      {/* Delicate Smooth Interior Cavity Rim & Siphon Recess */}
      <ellipse cx="44" cy="62" rx="22" ry="7" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.7" />

      {/* Upper / Main Valve (Dominant Luminous Angel-Wing Valve Tilted Upward) */}
      <path d="
        M 14 56
        C 20 42, 38 34, 58 36
        C 70 38, 76 44, 76 50
        C 72 58, 54 66, 36 66
        C 22 66, 12 62, 14 56 Z
      " fill="#f8fafc" stroke="#0e7490" strokeWidth="1.3" />

      {/* Distinctive Angel-Wing Radiating Ribs & Scaled Ridges */}
      <g stroke="#06b6d4" strokeWidth="0.7" fill="none" opacity="0.8">
        <path d="M 14 56 Q 34 46 56 46" />
        <path d="M 16 58 Q 36 50 62 48" />
        <path d="M 18 60 Q 38 54 68 50" />
        <path d="M 22 62 Q 40 58 72 54" />
        <path d="M 26 64 Q 44 62 74 58" />
      </g>

      {/* Concentric Growth Rings & Serrated Anterior Margin */}
      <g stroke="#cbd5e1" strokeWidth="0.5" fill="none">
        <path d="M 30 38 Q 34 52 32 64" />
        <path d="M 46 38 Q 50 52 48 64" />
        <path d="M 62 40 Q 66 50 64 60" />
      </g>

      {/* Prickly / Serrated Wing Margins on Pointed Wing Tip */}
      <polygon points="76,48 78,49 76,51 78,52 75,54" fill="#0891b2" />

      {/* Pearl Glaze Highlight */}
      <path d="M 22 52 Q 40 42 60 42" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "roxas_seafood": {
    frame: "#e11d48",
    bg: "#fdf0d5",
    top: "ROXAS",
    topColor: "#be123c",
    bottom: "SEAFOOD CAPITAL",
    bottomColor: "#0e7490",
    renderArt: () => (
      <g>
{/* Seafood platter */}
      <ellipse cx="24" cy="33" rx="14" ry="6" fill="#0e7490" />
      <ellipse cx="24" cy="33" rx="12.5" ry="4.5" fill="#fefae0" />
      {/* Giant Red Mud Crab */}
      <ellipse cx="24" cy="32" rx="5.5" ry="3.5" fill="#e11d48" />
      <circle cx="20" cy="29" r="1.8" fill="#e11d48" />
      <circle cx="28" cy="29" r="1.8" fill="#e11d48" />
      {/* Capiz window shell */}
      <rect x="21.5" y="18" width="5" height="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
      </g>
    ),
  },
  "sagay_carbin_reef": {
    frame: "#0f766e",
    bg: "#f0fdfa",
    top: "SAGAY",
    topColor: "#0f766e",
    bottom: "CARBIN REEF",
    bottomColor: "#0f766e",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#2dd4bf" strokeWidth="0.5" strokeDasharray="3 2" />
    {/* Detailed Coral Reef Formation Beneath Shallow Water (Reef Structure Dominant) */}
    {/* Shallow Lagoon Water Base */}
    <rect x="12" y="32" width="76" height="72" fill="#0d9488" opacity="0.3" />
    <path d="M14,38 C32,36 68,40 86,38 M18,48 C36,46 64,50 82,48" fill="none" stroke="#5eead4" strokeWidth="0.6" strokeDasharray="2 2" />
    {/* Intricate Branching Staghorn and Brain Coral Formations */}
    {/* Brain Coral Dome (Left) */}
    <path d="M20,94 C18,80 26,72 36,72 C46,72 52,80 50,94 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.1" />
    <path d="M26,84 Q34,78 44,84 M28,90 Q36,86 42,90" fill="none" stroke="#78350f" strokeWidth="0.7" />
    {/* Branching Staghorn Coral (Center & Right) */}
    <g stroke="#0f766e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60,94 L60,68 L52,54 M60,68 L68,52 L64,40 M68,52 L76,46" />
      <path d="M52,54 L44,46 M52,54 L54,42" />
    </g>
    <g stroke="#2dd4bf" strokeWidth="1.2" fill="none" strokeLinecap="round">
      <path d="M60,94 L60,68 L52,54 M60,68 L68,52 L64,40 M68,52 L76,46" />
      <path d="M52,54 L44,46 M52,54 L54,42" />
    </g>
    {/* Sea Fan Coral Network */}
    <path d="M34,72 Q38,56 46,52 Q42,64 34,72 Z" fill="#ec4899" stroke="#be185d" strokeWidth="0.8" />
      </svg>
    ),
  },
  "samal_monfort_bats": {
    frame: "#0f766e",
    bg: "#f0fdfa",
    top: "SAMAL",
    topColor: "#0f766e",
    bottom: "GIANT CLAM",
    bottomColor: "#0f766e",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Giant Clam (Tridacna gigas) Shown Slightly Open in Marine Engraving */}
    <g id="giant-clam" transform="translate(14, 28)">
      {/* Massive Heavy Fluted Lower Shell Half */}
      <path d="M12,46 C8,28 22,12 36,12 C50,12 64,28 60,46 C56,62 16,62 12,46 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.4" />
      {/* Deep Fluted Shell Folds & Scalloped Ridges */}
      <g stroke="#64748b" strokeWidth="1" fill="none">
        <path d="M36,12 L18,46" /><path d="M36,12 L28,52" />
        <path d="M36,12 L36,54" /><path d="M36,12 L44,52" />
        <path d="M36,12 L54,46" />
      </g>
      {/* Richly Textured Iridescent Mantle (Exposed Flesh) with Peacock Patterns */}
      <path d="M16,42 C22,34 30,32 36,32 C42,32 50,34 56,42 C54,48 18,48 16,42 Z" fill="#0d9488" stroke="#042f2e" strokeWidth="1" />
      {/* Siphon Openings and Bright Turquoise / Gold Spots */}
      <ellipse cx="36" cy="38" rx="4" ry="2.5" fill="#042f2e" />
      <circle cx="26" cy="40" r="1.5" fill="#5eead4" />
      <circle cx="46" cy="40" r="1.5" fill="#5eead4" />
      <circle cx="31" cy="36" r="1.2" fill="#facc15" />
      <circle cx="41" cy="36" r="1.2" fill="#facc15" />
    </g>
      </svg>
    ),
  },
  "san_carlos_mango": {
    frame: "#ffb703",
    bg: "#fefae0",
    top: "SAN CARLOS",
    topColor: "#d48b18",
    bottom: "PANGASINAN",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <g>
{/* Plump Golden Mangoes */}
      <path d="M 21 21 C 27 18, 30 24, 28 31 C 26 36, 18 36, 17 30 C 16 26, 17 22, 21 21 Z" fill="#ffb703" />
      <path d="M 27 27 C 33 24, 36 29, 34 35 C 32 40, 25 39, 24 34 Z" fill="#fb8500" />
      {/* Green Mango Leaves */}
      <path d="M 21 21 Q 14 15 17 12 Q 22 14 21 21 Z" fill="#2d6a4f" />
      <path d="M 23 21 Q 31 16 32 12 Q 27 14 23 21 Z" fill="#40916c" />
      {/* Twig */}
      <path d="M 21 16 Q 24 10 27 12" stroke="#7f4f24" strokeWidth="1.2" fill="none" />
      {/* Farmland furrow lines */}
      <line x1="9" y1="42" x2="39" y2="42" stroke="#dda15e" strokeWidth="1" strokeDasharray="3 1.5" />
      </g>
    ),
  },
  "san_carlos_mango_baskets": {
    frame: "#d97706",
    bg: "#fefce8",
    top: "SAN CARLOS (PANGASINAN)",
    topColor: "#d97706",
    bottom: "MANGO",
    bottomColor: "#d97706",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Etching */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="28" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Ripe Mango (Carabao Mango) in Three-Quarter View */}
    <g id="ripe-mango" transform="translate(18, 22)">
      {/* Stem and Green Leaf */}
      <path d="M28,18 C22,12 14,14 8,22 C12,26 22,24 28,18 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <line x1="12" y1="18" x2="24" y2="20" stroke="#4ade80" strokeWidth="0.6" />
      <path d="M28,18 L32,10" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
      {/* Signature Kidney-Shaped Plump Yellow Mango Silhouette */}
      <path d="M30,16 C44,14 56,26 56,44 C56,60 44,72 32,70 C20,68 12,54 14,38 C16,24 22,18 30,16 Z" fill="#facc15" stroke="#b45309" strokeWidth="1.3" />
      {/* Golden Apricot / Orange Blush Shading */}
      <path d="M34,22 C46,24 52,36 50,52 C48,64 38,68 32,68 C38,64 42,50 40,36 C38,28 34,24 34,22 Z" fill="#f59e0b" opacity="0.8" />
      {/* Smooth Specular Skin Highlight */}
      <path d="M22,28 C26,24 32,24 34,26" fill="none" stroke="#fefce8" strokeWidth="1.5" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "san_carlos_pintaflores": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "SAN CARLOS (NEGROS OCCIDENTAL)",
    topColor: "#15803d",
    bottom: "SUGARCANE",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* One Mature Sugarcane Stalk Rendered as Botanical Specimen */}
    <g transform="translate(50, 58) rotate(-25) translate(-50, -58)">
      <rect x="47" y="14" width="6" height="22" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="36" x2="55" y2="36" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="36" width="6" height="24" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="60" x2="55" y2="60" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="60" width="6" height="24" rx="1.5" fill="#65a30d" stroke="#3f6212" strokeWidth="1.1" />
      <line x1="45" y1="84" x2="55" y2="84" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="47" y="84" width="6" height="20" rx="1.5" fill="#84cc16" stroke="#3f6212" strokeWidth="1.1" />
      <path d="M47,36 C32,28 18,34 10,48 C22,44 36,42 47,36 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
      <path d="M53,60 C68,52 82,58 90,72 C78,68 64,66 53,60 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.9" />
    </g>
      </svg>
    ),
  },
  "san_fernando_poro_point": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "SAN FERNANDO (LA UNION)",
    topColor: "#0284c7",
    bottom: "PORO POINT LIGHTHOUSE",
    bottomColor: "#0284c7",
    renderArt: () => (
      <image
        href={`${process.env.PUBLIC_URL || ""}/stamps/san_fernando_la_union_inner.webp`}
        x="4.5"
        y="4.5"
        width="39"
        height="49"
        preserveAspectRatio="none"
      />
    ),
  },
  "san_jose_ne_onion": {
    frame: "#7209b7",
    bg: "#fefae0",
    top: "SAN JOSE",
    topColor: "#7209b7",
    bottom: "NUEVA ECIJA",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <g>
{/* Red Onion bulb */}
      <path d="M 24 18 C 16 18, 14 34, 24 37 C 34 34, 32 18, 24 18 Z" fill="#7209b7" />
      <path d="M 24 18 C 18 20, 17 32, 24 35 C 31 32, 30 20, 24 18 Z" fill="#9d4edd" />
      {/* Onion green shoots */}
      <path d="M 24 18 Q 21 11 18 13" stroke="#2d6a4f" strokeWidth="1.5" fill="none" />
      <path d="M 24 18 V 10" stroke="#2d6a4f" strokeWidth="1.5" />
      <path d="M 24 18 Q 27 11 30 13" stroke="#2d6a4f" strokeWidth="1.5" fill="none" />
      {/* Little root fibers */}
      <line x1="23" y1="37" x2="21" y2="40" stroke="#7209b7" strokeWidth="0.8" />
      <line x1="25" y1="37" x2="27" y2="40" stroke="#7209b7" strokeWidth="0.8" />
      </g>
    ),
  },
  "san_jose_onion": {
    frame: "#831843",
    bg: "#fdf2f8",
    top: "SAN JOSE (NUEVA ECIJA)",
    topColor: "#831843",
    bottom: "ONION",
    bottomColor: "#831843",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#db2777" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="26" ry="3.5" fill="#0f172a" opacity="0.2" />
    {/* Large Onion with Papery Layers Peeling Outward */}
    <g id="sj-onion" transform="translate(20, 24)">
      <path d="M30,12 C14,18 8,36 12,50 C16,62 26,66 30,66 C34,66 44,62 48,50 C52,36 46,18 30,12 Z" fill="#9d174d" stroke="#700730" strokeWidth="1.3" />
      {/* Peeling papery skins */}
      <path d="M12,46 C6,40 4,28 10,22 L16,30 Z" fill="#be185d" stroke="#700730" strokeWidth="0.8" />
      <path d="M48,46 C54,40 56,28 50,22 L44,30 Z" fill="#be185d" stroke="#700730" strokeWidth="0.8" />
      {/* Concentric layer lines */}
      <path d="M22,20 C18,32 18,48 24,58 M38,20 C42,32 42,48 36,58" fill="none" stroke="#fbcfe8" strokeWidth="0.7" />
      {/* Roots */}
      <g stroke="#78350f" strokeWidth="0.7" fill="none">
        <path d="M26,66 L22,76" /><path d="M30,66 L30,78" /><path d="M34,66 L38,76" />
      </g>
    </g>
      </svg>
    ),
  },
  "san_juan_pinaglabanan": {
    frame: "#78350f",
    bg: "#fdfbf7",
    top: "SAN JUAN",
    topColor: "#78350f",
    bottom: "PINAGLABANAN SHRINE ARCHITECTURE",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Sky backdrop with monument rays */}
    <g opacity="0.3" stroke="#854d0e" strokeWidth="0.45">
      <circle cx="50" cy="54" r="34" fill="none" strokeDasharray="2 2" />
    </g>

    {/* PINAGLABANAN SHRINE ARCHITECTURAL MONUMENT STRUCTURE */}
    {/* Monumental Stepped Granite Pedestal Platform */}
    <polygon points="20,96 80,96 74,84 26,84" fill="#451a03" stroke="#1f0b01" strokeWidth="1.2" />
    <polygon points="28,84 72,84 68,76 32,76" fill="#58240c" stroke="#1f0b01" strokeWidth="1" />
    <rect x="36" y="70" width="28" height="6" fill="#78350f" stroke="#1f0b01" strokeWidth="0.9" />

    {/* THE DISTINCTIVE ARCHITECTURAL PYLONS & SWEEPING MONUMENT FLAME/WING FORM */}
    {/* (Rendered Strictly Architecturally without Human Figures) */}
    {/* Left Sweeping Architectural Wing */}
    <path d="M38,70 Q32,46 36,26 Q42,40 44,70 Z" fill="#b45309" stroke="#451a03" strokeWidth="1.1" />
    <path d="M35,46 Q38,32 40,28" fill="none" stroke="#fef08a" strokeWidth="0.6" />

    {/* Right Sweeping Architectural Wing */}
    <path d="M62,70 Q68,46 64,26 Q58,40 56,70 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.1" />
    <path d="M65,46 Q62,32 60,28" fill="none" stroke="#fde047" strokeWidth="0.6" />

    {/* Central Monumental Spire / Katipunan Pylon Needle */}
    <polygon points="48,16 52,16 54,70 46,70" fill="#d97706" stroke="#451a03" strokeWidth="1.2" />
    <line x1="50" y1="16" x2="50" y2="70" stroke="#fef08a" strokeWidth="0.7" />

    {/* Sunburst Architectural Medallion behind Pylon Apex */}
    <circle cx="50" cy="22" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.7" />
    <g stroke="#ca8a04" strokeWidth="0.6">
      <line x1="50" y1="14" x2="50" y2="17" /><line x1="50" y1="27" x2="50" y2="30" />
      <line x1="42" y1="22" x2="45" y2="22" /><line x1="55" y1="22" x2="58" y2="22" />
    </g>

    {/* Historic Bronze Memorial Plaque Frame on Pedestal */}
    <rect x="42" y="78" width="16" height="5" fill="#ca8a04" stroke="#78350f" strokeWidth="0.6" />
    <line x1="44" y1="80.5" x2="56" y2="80.5" stroke="#451a03" strokeWidth="0.5" strokeDasharray="1 1" />

    {/* Ground Level Stone Terrace Base */}
    <rect x="14" y="96" width="72" height="4" fill="#2d150b" />
      </svg>
    ),
  },
  "san_pablo_sampaloc_lake": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "SAN PABLO",
    topColor: "#047857",
    bottom: "CRATER LAKE",
    bottomColor: "#047857",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Aerial View of Volcanic Crater Lake (Sampaloc Lake) */}
    {/* Surrounding Lush Green Terrain Ring with Topographic Contours */}
    <circle cx="50" cy="58" r="36" fill="#065f46" stroke="#022c22" strokeWidth="1.3" />
    {/* Topographic Contour Rings */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#10b981" strokeWidth="0.7" strokeDasharray="4 2" />
    <circle cx="50" cy="58" r="28" fill="none" stroke="#34d399" strokeWidth="0.6" strokeDasharray="3 1.5" />
    {/* Crater Lake Circular Shoreline */}
    <circle cx="50" cy="58" r="22" fill="#0284c7" stroke="#0f172a" strokeWidth="1.4" />
    {/* Deep Blue Crater Waters */}
    <circle cx="50" cy="58" r="16" fill="#0369a1" />
    <circle cx="50" cy="58" r="10" fill="#075985" />
    {/* Water Ripples */}
    <ellipse cx="50" cy="58" rx="6" ry="3" fill="none" stroke="#bae6fd" strokeWidth="0.6" />
      </svg>
    ),
  },
  "san_pablo_seven_lakes": {
    frame: "#2a9d8f",
    bg: "#fefae0",
    top: "SAN PABLO",
    topColor: "#264653",
    bottom: "SEVEN LAKES",
    bottomColor: "#e76f51",
    renderArt: () => (
      <g>
{/* Sampaloc Lake Waters */}
      <rect x="7" y="30" width="34" height="14" fill="#2a9d8f" />
      <path d="M 7 33 Q 24 31 41 33" stroke="#a8dadc" strokeWidth="0.8" fill="none" />
      {/* Mountain reflection & sunset */}
      <polygon points="12,30 24,19 36,30" fill="#1b4332" />
      <circle cx="16" cy="18" r="4" fill="#f4a261" />
      {/* Coconut Palm on shore */}
      <path d="M 33 42 Q 35 34 32 26" stroke="#4a3e30" strokeWidth="1.5" fill="none" />
      <path d="M 32 26 Q 28 22 26 24" stroke="#2d6a4f" strokeWidth="1.2" fill="none" />
      <path d="M 32 26 Q 36 21 39 23" stroke="#2d6a4f" strokeWidth="1.2" fill="none" />
      </g>
    ),
  },
  "san_pedro_sampaguita": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "SAN PEDRO",
    topColor: "#15803d",
    bottom: "SAMPAGUITA",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Framing */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Delicate Branch of Sampaguita (Jasminum sambac) with White Blossoms & Buds */}
    <g id="sampaguita-branch">
      {/* Woody Slender Stem */}
      <path d="M24,88 Q36,66 48,46 Q56,32 70,26" fill="none" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" />
      {/* Opposite Glossy Green Leaves */}
      <path d="M36,66 C28,62 24,52 26,44 C34,46 38,56 36,66 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
      <path d="M48,46 C56,44 64,48 66,56 C58,58 50,52 48,46 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
      {/* Unopened Elongated White Buds */}
      <path d="M64,30 C66,24 70,22 72,24 C72,28 68,32 64,30 Z" fill="#ffffff" stroke="#15803d" strokeWidth="0.7" />
      <polygon points="62,32 66,31 64,35" fill="#16a34a" />
      {/* Main Star-Shaped White Sampaguita Blossom (Centerpiece) */}
      <g transform="translate(46, 38)">
        {/* 8 Rounded Star Petals */}
        <g fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8">
          <ellipse cx="0" cy="-10" rx="3.5" ry="6" />
          <ellipse cx="7" cy="-7" rx="3.5" ry="6" transform="rotate(45 7 -7)" />
          <ellipse cx="10" cy="0" rx="3.5" ry="6" transform="rotate(90 10 0)" />
          <ellipse cx="7" cy="7" rx="3.5" ry="6" transform="rotate(135 7 7)" />
          <ellipse cx="0" cy="10" rx="3.5" ry="6" transform="rotate(180 0 10)" />
          <ellipse cx="-7" cy="7" rx="3.5" ry="6" transform="rotate(225 -7 7)" />
          <ellipse cx="-10" cy="0" rx="3.5" ry="6" transform="rotate(270 -10 0)" />
          <ellipse cx="-7" cy="-7" rx="3.5" ry="6" transform="rotate(315 -7 -7)" />
        </g>
        {/* Pale Yellow Pistil Center */}
        <circle cx="0" cy="0" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
      </g>
    </g>
      </svg>
    ),
  },
  "santa_rosa_lion": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "SANTA ROSA",
    topColor: "#ca8a04",
    bottom: "ARTISAN FILIPINO PAROL",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Philatelic Warm Radiance Halo */}
    <g opacity="0.25" stroke="#ca8a04" strokeWidth="0.5">
      <circle cx="50" cy="52" r="38" fill="none" strokeDasharray="2 2" />
      <circle cx="50" cy="52" r="34" fill="none" strokeDasharray="1 1.5" />
    </g>

    <g id="laguna-artisan-parol" transform="translate(50, 48)">
      {/* Five-Pointed Star Bamboo Framework & Translucent Capiz Panels */}
      {/* Outer Star Polygon Points (Radius 32) */}
      {/* Points: (0, -32), (19, -9), (30, 10), (12, 19), (18, 30), (0, 22), (-18, 30), (-12, 19), (-30, 10), (-19, -9) */}
      {/* Standard 5-point star coordinates: outer R=32, inner r=13 */}
      <polygon points="
        0,-32 8,-12 30,-10 14,3 20,25 0,13 -20,25 -14,3 -30,-10 -8,-12
      " fill="#fef08a" stroke="#854d0e" strokeWidth="1.3" />

      {/* Inner Concentric Star Lattice Ribs (Bamboo Struts) */}
      <g stroke="#ca8a04" strokeWidth="0.8">
        <line x1="0" y1="0" x2="0" y2="-32" />
        <line x1="0" y1="0" x2="30" y2="-10" />
        <line x1="0" y1="0" x2="20" y2="25" />
        <line x1="0" y1="0" x2="-20" y2="25" />
        <line x1="0" y1="0" x2="-30" y2="-10" />
      </g>

      {/* Center Radial Rosette (Floral Cutwork) */}
      <circle cx="0" cy="0" r="11" fill="#fef9c3" stroke="#b45309" strokeWidth="1.0" />
      <polygon points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3" fill="#ea580c" stroke="#9a3412" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="3" fill="#facc15" stroke="#854d0e" strokeWidth="0.6" />

      {/* Intricate Filigree Cutwork on the 5 Star Rays */}
      <g stroke="#b45309" strokeWidth="0.5" opacity="0.8">
        <circle cx="0" cy="-20" r="2" fill="none" />
        <circle cx="18" cy="-6" r="2" fill="none" />
        <circle cx="12" cy="15" r="2" fill="none" />
        <circle cx="-12" cy="15" r="2" fill="none" />
        <circle cx="-18" cy="-6" r="2" fill="none" />
      </g>

      {/* Two Hanging Decorative Tails (Tassels / Buntot) with Ruffled Concertina Folds */}
      {/* Left Tail */}
      <g id="left-tail" transform="translate(-10, 24)">
        <circle cx="0" cy="0" r="2.5" fill="#ca8a04" stroke="#854d0e" strokeWidth="0.6" />
        <path d="M -3 3 L -4 14 L 4 14 L 3 3 Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.7" />
        <line x1="-4" y1="8" x2="4" y2="8" stroke="#ca8a04" strokeWidth="0.6" />
        <path d="M -4 14 L -5 28 L 5 28 L 4 14 Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.7" />
        <line x1="-5" y1="21" x2="5" y2="21" stroke="#ca8a04" strokeWidth="0.6" />
        {/* Fringe */}
        <line x1="-4" y1="28" x2="-4" y2="34" stroke="#ca8a04" strokeWidth="0.6" />
        <line x1="-1" y1="28" x2="-1" y2="35" stroke="#ca8a04" strokeWidth="0.6" />
        <line x1="2" y1="28" x2="2" y2="35" stroke="#ca8a04" strokeWidth="0.6" />
        <line x1="5" y1="28" x2="5" y2="34" stroke="#ca8a04" strokeWidth="0.6" />
      </g>

      {/* Right Tail */}
      <g id="right-tail" transform="translate(10, 24)">
        <circle cx="0" cy="0" r="2.5" fill="#ca8a04" stroke="#854d0e" strokeWidth="0.6" />
        <path d="M -3 3 L -4 14 L 4 14 L 3 3 Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.7" />
        <line x1="-4" y1="8" x2="4" y2="8" stroke="#ca8a04" strokeWidth="0.6" />
        <path d="M -4 14 L -5 28 L 5 28 L 4 14 Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.7" />
        <line x1="-5" y1="21" x2="5" y2="21" stroke="#ca8a04" strokeWidth="0.6" />
        {/* Fringe */}
        <line x1="-4" y1="28" x2="-4" y2="34" stroke="#ca8a04" strokeWidth="0.6" />
        <line x1="-1" y1="28" x2="-1" y2="35" stroke="#ca8a04" strokeWidth="0.6" />
        <line x1="2" y1="28" x2="2" y2="35" stroke="#ca8a04" strokeWidth="0.6" />
        <line x1="5" y1="28" x2="5" y2="34" stroke="#ca8a04" strokeWidth="0.6" />
      </g>
    </g>
      </svg>
    ),
  },
  "santiago_corn": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "SANTIAGO",
    topColor: "#a16207",
    bottom: "AGRICULTURAL PRODUCE BASKET",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Traditional Agricultural Basket Filled with Carefully Arranged Local Produce */}
    <g id="santiago-basket" transform="translate(16, 26)">
      <path d="M6,28 L12,54 C16,62 30,64 34,64 C38,64 52,62 56,54 L62,28 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.3" />
      <ellipse cx="34" cy="28" rx="28" ry="7" fill="#fef08a" stroke="#854d0e" strokeWidth="1.3" />
      <g stroke="#78350f" strokeWidth="0.7">
        <line x1="10" y1="36" x2="26" y2="60" /><line x1="22" y1="34" x2="36" y2="62" />
        <line x1="34" y1="34" x2="46" y2="62" /><line x1="46" y1="34" x2="56" y2="58" />
        <line x1="58" y1="36" x2="42" y2="60" /><line x1="46" y1="34" x2="32" y2="62" />
      </g>
      {/* Carefully Arranged Produce: Golden Corn, Squash, Vegetables */}
      <circle cx="26" cy="22" r="7" fill="#eab308" stroke="#a16207" strokeWidth="0.7" />
      <circle cx="36" cy="18" r="8" fill="#15803d" stroke="#14532d" strokeWidth="0.7" />
      <circle cx="45" cy="22" r="6.5" fill="#ea580c" stroke="#9a3412" strokeWidth="0.7" />
    </g>
      </svg>
    ),
  },
  "santiago_gateway": {
    frame: "#e76f51",
    bg: "#fefae0",
    top: "SANTIAGO",
    topColor: "#e76f51",
    bottom: "AGRI-GATEWAY",
    bottomColor: "#2a9d8f",
    renderArt: () => (
      <g>
{/* Rolling crop fields */}
      <path d="M 7 36 Q 24 26 41 36 V 44 H 7 Z" fill="#2a9d8f" />
      <path d="M 7 40 Q 24 32 41 40 V 44 H 7 Z" fill="#264653" />
      {/* Sunburst */}
      <circle cx="24" cy="20" r="7" fill="#e9c46a" />
      {/* Gateway Arch Monument */}
      <path d="M 15 36 V 23 A 9 9 0 0 1 33 23 V 36" stroke="#e76f51" strokeWidth="2.5" fill="none" />
      <circle cx="24" cy="21" r="2.5" fill="#f4a261" />
      </g>
    ),
  },
  "santo_tomas_malvar": {
    frame: "#166534",
    bg: "#f0fdf4",
    top: "SANTO TOMAS",
    topColor: "#166534",
    bottom: "MOUNT MAKILING",
    bottomColor: "#166534",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Atmospheric Sky Engraving & Drifting Peak Clouds */}
    <g opacity="0.35" stroke="#15803d" strokeWidth="0.5">
      <line x1="10" y1="24" x2="90" y2="24" strokeDasharray="4 3" />
      <line x1="12" y1="32" x2="88" y2="32" strokeDasharray="3 2" />
    </g>

    {/* Cloud Wisps Clinging to Makiling Summit */}
    <path d="M 52 38 Q 62 34 72 38 Q 80 40 76 44 Q 66 43 54 44 Z" fill="#ffffff" opacity="0.8" />
    <path d="M 28 44 Q 38 40 48 43 Q 44 47 34 46 Z" fill="#ffffff" opacity="0.7" />

    <g id="mount-makiling-profile">
      {/* Distant Mount Makiling Volcanic Ridge (Matching Photo 3: Reclining Maiden profile) */}
      {/* Gentle slope rising from left (20,62) upward to summit ridge (58,38), then rugged descent to right (88,68) */}
      <path d="
        M 10 74
        L 10 68
        C 22 66, 34 58, 44 50
        C 48 46, 52 42, 58 38
        C 62 38, 66 40, 70 42
        C 76 46, 82 56, 90 68
        L 90 74 Z
      " fill="#14532d" stroke="#052e16" strokeWidth="1.2" />

      {/* Topographic Slope Cross-Hatching on Main Mountain Face */}
      <g stroke="#16a34a" strokeWidth="0.6" opacity="0.65">
        <path d="M 44 50 L 52 64 M 48 46 L 58 64 M 54 42 L 64 62 M 60 40 L 70 60" />
        <path d="M 64 42 L 74 58 M 68 44 L 78 60 M 72 48 L 82 64" />
      </g>

      {/* Midground Layered Forested Foothills */}
      <path d="
        M 10 76
        Q 24 66 38 70
        Q 52 64 68 68
        Q 80 62 90 72
        L 90 82 L 10 82 Z
      " fill="#166534" stroke="#064e3b" strokeWidth="1.0" />

      {/* Foreground Lush Agricultural Valley & Tree Canopy Stippling */}
      <path d="
        M 10 82
        Q 28 78 48 81
        Q 68 77 90 82
        L 90 96 L 10 96 Z
      " fill="#15803d" stroke="#064e3b" strokeWidth="1.1" />

      {/* Tree Stippling in Foreground Foothills */}
      <g fill="#22c55e" opacity="0.7">
        <circle cx="20" cy="84" r="1.5" /><circle cx="24" cy="83" r="1.8" />
        <circle cx="36" cy="85" r="2.0" /><circle cx="42" cy="84" r="1.6" />
        <circle cx="56" cy="85" r="1.8" /><circle cx="62" cy="83" r="2.2" />
        <circle cx="76" cy="86" r="1.7" /><circle cx="82" cy="84" r="2.0" />
      </g>

      {/* Clean Horizontal Ground Lines */}
      <line x1="12" y1="92" x2="88" y2="92" stroke="#14532d" strokeWidth="0.8" />
      <line x1="16" y1="95" x2="84" y2="95" stroke="#14532d" strokeWidth="0.6" strokeDasharray="2 1" />
    </g>
      </svg>
    ),
  },
  "semarang_lawang_sewu": {
    frame: "#854d0e",
    bg: "#fefce8",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Heritage Dutch colonial building facade */}
      <rect x="8" y="25" width="32" height="13" fill="#ffffff" stroke="#854d0e" strokeWidth="0.6" />
      {/* Twin Gabled Clock Towers */}
      <polygon points="9,25 15,25 12,17" fill="#dc2626" stroke="#854d0e" strokeWidth="0.5" />
      <polygon points="33,25 39,25 36,17" fill="#dc2626" stroke="#854d0e" strokeWidth="0.5" />
      {/* Central Dutch gabled pediment */}
      <polygon points="20,25 28,25 24,19" fill="#dc2626" stroke="#854d0e" strokeWidth="0.5" />
      {/* Semicircular open colonial archways ("Thousand Doors") */}
      <rect x="10" y="29" width="3" height="5" fill="#854d0e" rx="1.5" />
      <rect x="15" y="29" width="3" height="5" fill="#854d0e" rx="1.5" />
      <rect x="20" y="28" width="3.5" height="6" fill="#854d0e" rx="1.75" />
      <rect x="25" y="28" width="3.5" height="6" fill="#854d0e" rx="1.75" />
      <rect x="30" y="29" width="3" height="5" fill="#854d0e" rx="1.5" />
      <rect x="35" y="29" width="3" height="5" fill="#854d0e" rx="1.5" />
      {/* Stained-glass rose window rosette */}
      <circle cx="24" cy="22" r="1.5" fill="#38bdf8" stroke="#854d0e" strokeWidth="0.4" />
      {/* Cobblestone front yard */}
      <rect x="6" y="38" width="36" height="5" fill="#78716c" opacity="0.4" />
      </g>
    ),
  },
  "silay_balay_negrense": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "SILAY",
    topColor: "#78350f",
    bottom: "HERITAGE HOUSE",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="50" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* Frontal Ornate Silay Ancestral House Architecture (Balay Negrense) */}
    <g id="silay-mansion" transform="translate(10, 24)">
      <line x1="2" y1="74" x2="78" y2="74" stroke="#451a03" strokeWidth="1.2" />
      {/* Steep Galvanized / Shingle Hip Roof with Intricate Eaves */}
      <polygon points="40,10 4,28 76,28" fill="#451a03" stroke="#1c0702" strokeWidth="1.3" />
      <path d="M6,28 Q40,32 74,28" fill="none" stroke="#facc15" strokeWidth="0.8" />
      {/* Second Floor (Hardwood Siding & Sliding Capiz Windows) */}
      <rect x="8" y="28" width="64" height="24" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
      {/* Symmetrical Capiz Window Panels */}
      <g fill="#fefce8" stroke="#451a03" strokeWidth="0.7">
        <rect x="12" y="32" width="10" height="12" /><rect x="25" y="32" width="10" height="12" />
        <rect x="45" y="32" width="10" height="12" /><rect x="58" y="32" width="10" height="12" />
      </g>
      {/* Ornate Center Balcony with Iron Balusters */}
      <rect x="36" y="38" width="8" height="12" fill="#451a03" stroke="#facc15" strokeWidth="0.8" />
      {/* Ground Floor Piedra China Masonry Base with Arched Entrances */}
      <rect x="8" y="52" width="64" height="22" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
      <g fill="#334155" stroke="#1e293b" strokeWidth="0.8">
        <rect x="14" y="56" width="10" height="18" rx="4" />
        <rect x="35" y="54" width="10" height="20" rx="4" fill="#451a03" />
        <rect x="56" y="56" width="10" height="18" rx="4" />
      </g>
    </g>
      </svg>
    ),
  },
  "singapore_merlion": {
    frame: "#1e3a8a",
    bg: "#f0fdf4",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Marina Bay Sands 3 towers and curved SkyPark surfboard roof */}
      <path d="M 24 16 L 39 15.2 L 39.5 17.5 L 24 18.5 Z" fill="#1e3a8a" opacity="0.75" />
      <rect x="25" y="18" width="3" height="15" fill="#93c5fd" opacity="0.6" />
      <rect x="30" y="18" width="3" height="15" fill="#93c5fd" opacity="0.6" />
      <rect x="35" y="18" width="3" height="15" fill="#93c5fd" opacity="0.6" />
      {/* Red Singapore sun */}
      <circle cx="36" cy="11" r="3.5" fill="#ef4444" opacity="0.8" />
      {/* Marina Bay water with ripples */}
      <rect x="6" y="36" width="36" height="7" fill="#0284c7" />
      <line x1="8" y1="38" x2="22" y2="38" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      <line x1="14" y1="40" x2="38" y2="40" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      {/* Merlion Statue (noble lion head & scaled fish body) */}
      <path d="M 12 36 C 10 32 12 28 15 26 C 13 25 12 23 13 20 C 14 17 17 16 19 18 C 21 17 23 18 23 21 C 24 24 22 26 21 28 C 22 31 20 36 17 37 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="0.7" />
      {/* Water jet spouting from mouth */}
      <path d="M 13 22 Q 8 23 7 35" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="7" cy="35" rx="2" ry="0.8" fill="#bae6fd" />
      </g>
    ),
  },
  "sipalay_tinagong_dagat": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "SIPALAY",
    topColor: "#0284c7",
    bottom: "SUGAR BEACH",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Sweeping Curved Shoreline of Pale Sand Meeting Calm Sea (No People) */}
    {/* Sky & Distant Horizon */}
    <line x1="12" y1="44" x2="88" y2="44" stroke="#38bdf8" strokeWidth="0.6" />
    <circle cx="68" cy="32" r="12" fill="none" stroke="#bae6fd" strokeWidth="0.5" strokeDasharray="2 2" />
    {/* Distant Headland Limestone Karst Promontory */}
    <path d="M12,44 C18,34 26,32 36,36 C44,40 48,44 54,44 L12,44 Z" fill="#047857" stroke="#064e3b" strokeWidth="0.8" />
    {/* Calm Turquoise Sea with Gentle Water Linework */}
    <path d="M12,44 L88,44 L88,78 C70,72 44,64 12,68 Z" fill="#0284c7" />
    <g stroke="#e0f2fe" strokeWidth="0.7" fill="none">
      <path d="M24,52 C44,50 68,54 84,52" /><path d="M18,60 C42,58 66,62 82,60" />
    </g>
    {/* Gentle Shoreline Water Wash Foam */}
    <path d="M12,68 C44,64 70,72 88,78" fill="none" stroke="#ffffff" strokeWidth="1.5" />
    {/* Sweeping Pale Sand Sugar Beach (Clean Fine Linework) */}
    <path d="M12,68 C44,64 70,72 88,78 L88,104 L12,104 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    <path d="M16,84 C42,80 64,88 84,92 M20,94 C46,90 68,98 80,99" fill="none" stroke="#fde047" strokeWidth="0.6" strokeDasharray="3 2" />
      </svg>
    ),
  },
  "sjdm_balagbag": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "SAN JOSE DEL MONTE",
    topColor: "#a16207",
    bottom: "BAMBOO BASKET",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Woven Bamboo Basket at a Slight Angle */}
    <g id="sjdm-basket" transform="translate(18, 30)">
      <path d="M6,22 L12,48 C14,54 26,56 32,56 C38,56 50,54 52,48 L58,22 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
      <ellipse cx="32" cy="22" rx="26" ry="6" fill="#fef08a" stroke="#854d0e" strokeWidth="1.3" />
      <g stroke="#78350f" strokeWidth="0.7">
        <line x1="8" y1="28" x2="22" y2="52" /><line x1="16" y1="26" x2="30" y2="55" />
        <line x1="26" y1="26" x2="38" y2="55" /><line x1="36" y1="26" x2="48" y2="52" />
        <line x1="56" y1="28" x2="42" y2="52" /><line x1="48" y1="26" x2="34" y2="55" />
        <line x1="38" y1="26" x2="26" y2="55" /><line x1="28" y1="26" x2="16" y2="52" />
      </g>
    </g>
      </svg>
    ),
  },
  "sjdm_rising_city": {
    frame: "#264653",
    bg: "#fefae0",
    top: "SJDM",
    topColor: "#264653",
    bottom: "BULACAN",
    bottomColor: "#e76f51",
    renderArt: () => (
      <g>
{/* Foothills */}
      <path d="M 7 36 Q 24 22 41 36 V 44 H 7 Z" fill="#2a9d8f" />
      {/* Rising city skyline */}
      <rect x="14" y="24" width="6" height="16" fill="#e76f51" />
      <rect x="22" y="19" width="7" height="21" fill="#f4a261" />
      <rect x="31" y="26" width="5" height="14" fill="#e76f51" />
      <circle cx="16" cy="18" r="4" fill="#e9c46a" />
      </g>
    ),
  },
  "sorsogon_bulusan": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "SORSOGON CITY",
    topColor: "#0369a1",
    bottom: "WHALE SHARK",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Marine Depth Wave Lines */}
    <line x1="12" y1="36" x2="88" y2="36" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" />
    <line x1="12" y1="84" x2="88" y2="84" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" />
    {/* Massive Whale Shark (Rhincodon typus) in Side Profile */}
    <g id="whale-shark" transform="translate(12, 34)">
      {/* Broad Head and Graceful Tapered Body */}
      <path d="M10,24 C10,16 28,12 48,16 C64,20 70,24 74,28 C70,32 64,34 48,36 C28,38 10,32 10,24 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.4" />
      {/* White Underbelly Countershading */}
      <path d="M12,25 C14,30 28,36 48,35 C62,33 68,30 72,28 C68,31 60,34 46,35 C26,36 12,30 12,25 Z" fill="#f8fafc" />
      {/* Caudal (Tail) Fin */}
      <polygon points="72,28 82,14 78,28 82,38" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      {/* Dorsal and Pectoral Fins */}
      <polygon points="44,15 50,4 54,16" fill="#1e293b" stroke="#0f172a" strokeWidth="0.9" />
      <polygon points="22,26 16,38 28,32" fill="#1e293b" stroke="#0f172a" strokeWidth="0.9" />
      {/* Transverse Checkerboard Ridges & Distinctive White Spots */}
      <g stroke="#94a3b8" strokeWidth="0.5" fill="none">
        <line x1="28" y1="14" x2="28" y2="28" /><line x1="38" y1="15" x2="38" y2="30" />
        <line x1="48" y1="17" x2="48" y2="32" /><line x1="58" y1="20" x2="58" y2="32" />
      </g>
      <g fill="#ffffff">
        <circle cx="24" cy="20" r="1" /><circle cx="33" cy="18" r="1" />
        <circle cx="34" cy="24" r="1.1" /><circle cx="43" cy="20" r="1" />
        <circle cx="44" cy="26" r="1.1" /><circle cx="53" cy="22" r="1" />
        <circle cx="54" cy="28" r="1" /><circle cx="63" cy="25" r="0.9" />
      </g>
    </g>
      </svg>
    ),
  },
  "sorsogon_butanding": {
    frame: "#0c4a6e",
    bg: "#e0f2fe",
    top: "SORSOGON",
    topColor: "#0c4a6e",
    bottom: "BUTANDING",
    bottomColor: "#0284c7",
    renderArt: () => (
      <g>
{/* Deep sea blue */}
      <rect x="7" y="14" width="34" height="30" fill="#0284c7" />
      {/* Giant Whale Shark (Butanding) */}
      <ellipse cx="24" cy="29" rx="14" ry="6.5" fill="#334155" />
      <polygon points="10,29 5,23 7,35" fill="#334155" />
      <polygon points="23,22 27,27 21,27" fill="#334155" />
      <polygon points="26,34 30,37 25,35" fill="#334155" />
      {/* White Polka Dots */}
      <circle cx="17" cy="28" r="0.8" fill="#ffffff" />
      <circle cx="21" cy="27" r="0.8" fill="#ffffff" />
      <circle cx="21" cy="30" r="0.8" fill="#ffffff" />
      <circle cx="25" cy="28" r="0.8" fill="#ffffff" />
      <circle cx="25" cy="31" r="0.8" fill="#ffffff" />
      <circle cx="29" cy="29" r="0.8" fill="#ffffff" />
      </g>
    ),
  },
  "sta_rosa_arch": {
    frame: "#a44a3f",
    bg: "#fdf0d5",
    top: "STA. ROSA",
    topColor: "#a44a3f",
    bottom: "LION CITY",
    bottomColor: "#1d3557",
    renderArt: () => (
      <g>
{/* Historic Spanish Cuartel Stone Arch Gate */}
      <path d="M 12 44 V 22 A 12 12 0 0 1 36 22 V 44 H 29 V 26 A 5 5 0 0 0 19 26 V 44 Z" fill="#a44a3f" />
      {/* Arch crown pediment */}
      <polygon points="24,14 13,20 35,20" fill="#78290f" />
      <circle cx="24" cy="17.5" r="1.5" fill="#fdf0d5" />
      {/* Automotive wheel silhouette */}
      <circle cx="24" cy="38" r="4.5" fill="#1d3557" />
      <circle cx="24" cy="38" r="2" fill="#fdf0d5" />
      </g>
    ),
  },
  "sto_tomas_makiling": {
    frame: "#1b4332",
    bg: "#fefae0",
    top: "STO. TOMAS",
    topColor: "#1b4332",
    bottom: "MOUNT MAKILING",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <g>
{/* Grand Mount Makiling profile ("Maria Makiling reclining") */}
      <path d="M 7 36 Q 16 21 24 23 Q 32 20 41 36 V 44 H 7 Z" fill="#2d6a4f" />
      <path d="M 12 40 Q 20 28 27 29 Q 34 26 41 40 V 44 H 12 Z" fill="#1b4332" />
      <circle cx="16" cy="18" r="5" fill="#fcbf49" />
      {/* Miguel Malvar Monument */}
      <polygon points="24,31 22,43 26,43" fill="#ffffff" />
      <circle cx="24" cy="30" r="1.5" fill="#ffffff" />
      </g>
    ),
  },
  "surabaya_shark_crocodile": {
    frame: "#0284c7",
    bg: "#fefae0",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Kalimas River whirlpool waters */}
      <ellipse cx="24" cy="38" rx="14" ry="4" fill="#38bdf8" opacity="0.6" />
      <path d="M 12 38 Q 24 42 36 38" stroke="#0284c7" strokeWidth="0.8" fill="none" strokeDasharray="2 1" />
      {/* Baya (Crocodile) curving upward on right */}
      <path d="M 22 36 C 26 38 34 37 35 32 C 36 27 33 24 28 23 C 26 24 25 26 24 28 C 28 28 32 30 29 33 C 26 35 23 34 22 36 Z" fill="#15803d" stroke="#0f172a" strokeWidth="0.5" />
      <polygon points="32,24 33,22 34,24" fill="#052e16" />
      <polygon points="34,26 36,25 35,27" fill="#052e16" />
      {/* Sura (Shark) curving downward on left */}
      <path d="M 26 22 C 22 20 14 21 13 26 C 12 31 15 34 20 35 C 22 34 23 32 24 30 C 20 30 16 28 19 25 C 22 23 25 24 26 22 Z" fill="#ffffff" stroke="#0284c7" strokeWidth="0.6" />
      {/* Shark Dorsal Fin & Tail */}
      <polygon points="16,21 17,16 19,20" fill="#0284c7" />
      <polygon points="26,22 28,18 27,24" fill="#0284c7" />
      {/* Monument Center Algae/Seaweed tree trunk */}
      <path d="M 23 24 L 25 24 L 25 36 L 23 36 Z" fill="#78350f" opacity="0.5" />
      </g>
    ),
  },
  "surigao_mabua_pebbles": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "SURIGAO CITY",
    topColor: "#78350f",
    bottom: "NICKEL ORE",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Single Nickel-Bearing Ore Specimen (Laterite / Garnierite Rock) */}
    <g id="nickel-ore" transform="translate(18, 26)">
      {/* Angular Rough Rock Specimen Polygon Base */}
      <polygon points="12,42 22,18 48,16 62,34 56,58 36,66 18,60" fill="#78350f" stroke="#451a03" strokeWidth="1.4" />
      {/* Faceted Crystal Surfaces Shading */}
      <polygon points="22,18 36,28 32,50 12,42" fill="#92400e" />
      <polygon points="22,18 48,16 38,32 36,28" fill="#a16207" />
      <polygon points="48,16 62,34 50,44 38,32" fill="#78350f" />
      <polygon points="32,50 50,44 56,58 36,66" fill="#451a03" />
      {/* Metallic Green Garnierite / Nickel Veins */}
      <g stroke="#10b981" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M26,22 L34,32 L30,46" />
        <path d="M42,20 L40,36 L48,50" />
      </g>
      {/* Metallic Luster Highlights */}
      <polygon points="34,30 36,32 34,34 32,32" fill="#34d399" />
      <polygon points="42,34 44,36 42,38 40,36" fill="#34d399" />
    </g>
      </svg>
    ),
  },
  "tabaco_bolo_bay": {
    frame: "#334155",
    bg: "#f1f5f9",
    top: "TABACO",
    topColor: "#0f172a",
    bottom: "BLACKSMITH",
    bottomColor: "#dc2626",
    renderArt: () => (
      <g>
{/* Blacksmith's Handcrafted Bolo Knife */}
      <path d="M 12 36 L 22 28 Q 36 17 37 19 Q 34 26 24 33 L 14 40 Z" fill="#475569" stroke="#0f172a" strokeWidth="0.8" />
      {/* Knife cutting edge highlight */}
      <path d="M 22 28 Q 36 17 37 19" stroke="#ffffff" strokeWidth="1.2" fill="none" />
      {/* Wooden handle */}
      <rect x="11" y="35" width="4" height="6" fill="#78350f" transform="rotate(-40 11 35)" />
      {/* Tabaco Bay waves */}
      <path d="M 7 41 Q 24 38 41 41" stroke="#0284c7" strokeWidth="1.2" fill="none" />
      </g>
    ),
  },
  "tabaco_cutlery": {
    frame: "#15803d",
    bg: "#f0fdf4",
    top: "TABACO",
    topColor: "#15803d",
    bottom: "ABACA",
    bottomColor: "#15803d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Botanical Circular Frame */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Single Mature Abaca Plant Rendered Botanically */}
    <g id="abaca-plant" transform="translate(18, 20)">
      {/* Fibrous Pseudostem (Stalk) Composed of Overlapping Sheaths */}
      <path d="M28,84 L28,40 L36,40 L36,84 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1.2" />
      <g stroke="#ca8a04" strokeWidth="0.7">
        <line x1="28" y1="52" x2="36" y2="52" /><line x1="28" y1="64" x2="36" y2="64" />
        <line x1="28" y1="74" x2="36" y2="74" />
      </g>
      {/* Broad Arching Banana-Like Foliage Leaves */}
      <path d="M32,40 C22,26 8,24 2,32 C10,38 24,36 32,40 Z" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <path d="M32,40 C42,26 56,24 62,32 C54,38 40,36 32,40 Z" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <path d="M32,40 C30,18 34,10 36,6 C38,10 42,18 32,40 Z" fill="#22c55e" stroke="#14532d" strokeWidth="0.9" />
      {/* Leaf Vein Striations */}
      <line x1="8" y1="30" x2="28" y2="36" stroke="#4ade80" strokeWidth="0.6" />
      <line x1="56" y1="30" x2="36" y2="36" stroke="#4ade80" strokeWidth="0.6" />
    </g>
      </svg>
    ),
  },
  "tabuk_chico_river": {
    frame: "#065f46",
    bg: "#f0fdf4",
    top: "TABUK",
    topColor: "#065f46",
    bottom: "KALINGA RICE TERRACES",
    bottomColor: "#065f46",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Atmospheric Mountain Mist Lines */}
    <g opacity="0.3" stroke="#047857" strokeWidth="0.5">
      <line x1="10" y1="20" x2="90" y2="20" strokeDasharray="3 2" />
      <line x1="12" y1="28" x2="88" y2="28" strokeDasharray="4 2" />
    </g>

    <g id="kalinga-mountain-rice-terraces">
      {/* Distant Mountain Ridge Crest */}
      <path d="M 10 38 Q 30 26 50 32 Q 70 24 90 34 L 90 98 L 10 98 Z" fill="#047857" />

      {/* Series of Stepped Contour Rice Terraces Climbing Steep Slopes (Matching Photo 2) */}
      {/* Terrace Tier 1 (High Peak Tiers) */}
      <path d="M 22 36 Q 44 32 68 37 Q 82 34 90 38 L 90 44 Q 78 40 58 41 Q 34 38 22 42 Z" fill="#15803d" stroke="#022c22" strokeWidth="0.8" />
      {/* Stone Retaining Wall 1 (Vertical Hatched Stone Face) */}
      <path d="M 22 42 Q 44 39 68 43 Q 82 40 90 44 L 90 48 Q 78 44 58 45 Q 34 43 22 47 Z" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
      <g stroke="#64748b" strokeWidth="0.4" opacity="0.8">
        <line x1="30" y1="41" x2="30" y2="45" /><line x1="42" y1="41" x2="42" y2="45" />
        <line x1="56" y1="42" x2="56" y2="46" /><line x1="72" y1="42" x2="72" y2="46" />
      </g>

      {/* Terrace Tier 2 (Upper-Mid Tiers with Flooded Water Sheen) */}
      <path d="M 16 48 Q 42 44 68 49 Q 84 45 90 50 L 90 56 Q 76 52 54 53 Q 30 50 16 55 Z" fill="#22c55e" stroke="#022c22" strokeWidth="0.9" />
      <line x1="32" y1="50" x2="52" y2="49" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
      {/* Stone Retaining Wall 2 */}
      <path d="M 16 55 Q 42 51 68 56 Q 84 52 90 57 L 90 62 Q 76 57 54 58 Q 30 56 16 61 Z" fill="#334155" stroke="#1e293b" strokeWidth="0.9" />
      <g stroke="#64748b" strokeWidth="0.5" opacity="0.8">
        <line x1="24" y1="54" x2="24" y2="59" /><line x1="38" y1="53" x2="38" y2="58" />
        <line x1="54" y1="55" x2="54" y2="60" /><line x1="72" y1="54" x2="72" y2="59" />
      </g>

      {/* Terrace Tier 3 (Dominant Center Sweeping Contour Tiers) */}
      <path d="M 10 62 Q 36 57 66 62 Q 82 58 90 64 L 90 71 Q 74 66 50 67 Q 26 64 10 70 Z" fill="#4ade80" stroke="#022c22" strokeWidth="1.0" />
      <line x1="28" y1="63" x2="56" y2="62" stroke="#ffffff" strokeWidth="1.0" opacity="0.8" />
      {/* Stone Retaining Wall 3 */}
      <path d="M 10 70 Q 36 65 66 70 Q 82 66 90 72 L 90 78 Q 74 72 50 74 Q 26 71 10 77 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.0" />
      <g stroke="#64748b" strokeWidth="0.6" opacity="0.85">
        <line x1="18" y1="68" x2="18" y2="74" /><line x1="32" y1="67" x2="32" y2="73" />
        <line x1="48" y1="69" x2="48" y2="75" /><line x1="68" y1="68" x2="68" y2="74" />
      </g>

      {/* Terrace Tier 4 (Lower Wide Valley Terraces) */}
      <path d="M 10 78 Q 38 73 66 77 Q 82 74 90 80 L 90 88 Q 72 82 46 84 Q 24 81 10 87 Z" fill="#16a34a" stroke="#022c22" strokeWidth="1.1" />
      {/* Stone Retaining Wall 4 */}
      <path d="M 10 87 Q 38 82 66 86 Q 82 83 90 89 L 90 96 Q 72 90 46 92 Q 24 89 10 95 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.1" />
      <g stroke="#64748b" strokeWidth="0.7">
        <line x1="22" y1="85" x2="22" y2="92" /><line x1="40" y1="84" x2="40" y2="91" />
        <line x1="60" y1="86" x2="60" y2="93" /><line x1="78" y1="85" x2="78" y2="92" />
      </g>
    </g>
      </svg>
    ),
  },
  "tabuk_kalinga_tattoo": {
    frame: "#9a031e",
    bg: "#fdf0d5",
    top: "TABUK",
    topColor: "#9a031e",
    bottom: "KALINGA",
    bottomColor: "#1f1f1f",
    renderArt: () => (
      <g>
{/* Cordillera Mountain Peaks */}
      <polygon points="12,30 24,16 36,30" fill="#2d6a4f" opacity="0.6" />
      <polygon points="6,34 18,20 30,34" fill="#1b4332" />
      <polygon points="20,34 32,22 42,34" fill="#1b4332" />
      {/* Kalinga Geometric Tattoo / Weave diamonds (Apo Whang-Od) */}
      <polygon points="24,25 29,30 24,35 19,30" fill="#9a031e" />
      <polygon points="24,27 27,30 24,33 21,30" fill="#fcbf49" />
      <polygon points="13,31 16,34 13,37 10,34" fill="#9a031e" />
      <polygon points="35,31 38,34 35,37 32,34" fill="#9a031e" />
      <line x1="8" y1="40" x2="40" y2="40" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="2 1" />
      </g>
    ),
  },
  "tacloban_san_juanico": {
    frame: "#7f1d1d",
    bg: "#fef2f2",
    top: "TACLOBAN",
    topColor: "#7f1d1d",
    bottom: "PINTADOS PATTERN",
    bottomColor: "#7f1d1d",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Carved Wooden Artifact Base (No Human Bodies) */}
    <rect x="14" y="16" width="72" height="88" rx="2" fill="#451a03" stroke="#1c0702" strokeWidth="1.4" />
    <rect x="18" y="20" width="64" height="80" fill="#78350f" stroke="#ca8a04" strokeWidth="0.8" />
    {/* Traditional Pintados Geometric Tattoo Motifs Engraved on Artifact */}
    <g stroke="#fef08a" strokeWidth="1.3" fill="none">
      {/* Symmetrical Chevron & Solar Geometry */}
      <path d="M50,26 L30,42 L50,58 L70,42 Z" />
      <path d="M50,34 L38,42 L50,50 L62,42 Z" />
      <circle cx="50" cy="42" r="3" fill="#dc2626" stroke="#fef08a" strokeWidth="0.8" />
      {/* Lower Interlocking Spirals / Snake Scale Spirals */}
      <path d="M30,64 Q40,56 50,64 Q60,72 70,64" />
      <path d="M30,72 Q40,64 50,72 Q60,80 70,72" />
      <path d="M30,80 Q40,72 50,80 Q60,88 70,80" />
      <path d="M30,88 Q40,80 50,88 Q60,96 70,88" />
      {/* Side Jagged Teeth Bands (Ngipin ng Buwaya) */}
      <path d="M22,26 L26,30 L22,34 L26,38 L22,42 L26,46 L22,50" />
      <path d="M78,26 L74,30 L78,34 L74,38 L78,42 L74,46 L78,50" />
    </g>
      </svg>
    ),
  },
  "tacurong_baras_birds": {
    frame: "#ca8a04",
    bg: "#fefce8",
    top: "TACURONG",
    topColor: "#ca8a04",
    bottom: "KALIMUDAN TEXTILE",
    bottomColor: "#ca8a04",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<rect x="14" y="16" width="72" height="88" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="1.3" />
    {/* Richly Patterned Kalimudan Cultural Textile Displayed Flat */}
    <g id="kalimudan-textile">
      <rect x="18" y="20" width="64" height="80" fill="#ca8a04" stroke="#fef08a" strokeWidth="0.8" />
      {/* Alternating Tribal Diamond Bands */}
      <rect x="18" y="26" width="64" height="10" fill="#15803d" />
      <rect x="18" y="50" width="64" height="18" fill="#dc2626" />
      <rect x="18" y="82" width="64" height="10" fill="#15803d" />
      {/* Geometric Diamond Matrix Inlays */}
      <g fill="#facc15" stroke="#78350f" strokeWidth="0.7">
        <polygon points="50,52 58,59 50,66 42,59" />
        <polygon points="32,52 40,59 32,66 24,59" />
        <polygon points="68,52 76,59 68,66 60,59" />
      </g>
      {/* Zigzag Thread Hatching */}
      <g stroke="#ffffff" strokeWidth="0.5" fill="none">
        <path d="M20,31 L26,26 L32,31 L38,26 L44,31 L50,26 L56,31 L62,26 L68,31 L74,26 L80,31" />
        <path d="M20,87 L26,82 L32,87 L38,82 L44,87 L50,82 L56,87 L62,82 L68,87 L74,82 L80,87" />
      </g>
    </g>
      </svg>
    ),
  },
  "tagaytay_taal": {
    frame: "#0077b6",
    bg: "#caf0f8",
    top: "TAGAYTAY",
    topColor: "#03045e",
    bottom: "TAAL VOLCANO",
    bottomColor: "#2d6a4f",
    renderArt: () => (
      <g>
{/* Blue Taal Lake */}
      <rect x="7" y="28" width="34" height="15" fill="#0077b6" />
      <path d="M 7 31 Q 24 29 41 31" stroke="#90e0ef" strokeWidth="0.8" fill="none" />
      {/* Taal Volcano Crater Island */}
      <polygon points="12,38 24,23 36,38" fill="#2d6a4f" />
      <polygon points="21,23 24,25 27,23 24,22" fill="#e76f51" />
      {/* Crater Lake inside volcano */}
      <ellipse cx="24" cy="27" rx="3.5" ry="1.5" fill="#0096c7" />
      {/* Tagaytay Ridge Pine in foreground */}
      <polygon points="10,43 12,32 14,43" fill="#1b4332" />
      <polygon points="34,43 36,34 38,43" fill="#1b4332" />
      </g>
    ),
  },
  "tagaytay_taal_ridge": {
    frame: "#b45309",
    bg: "#fefce8",
    top: "TAGAYTAY",
    topColor: "#b45309",
    bottom: "TAGAYTAY BULALO",
    bottomColor: "#b45309",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Graceful Curled Steam Wisps Rising from Piping-Hot Broth */}
    <g stroke="#d97706" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6">
      <path d="M 36 34 C 34 26, 40 20, 36 12" />
      <path d="M 50 30 C 48 22, 54 16, 50 8" />
      <path d="M 64 34 C 66 26, 60 20, 64 12" />
    </g>

    <g id="tagaytay-bulalo-bowl" transform="translate(6, 12)">
      {/* Ground Shadow */}
      <ellipse cx="44" cy="74" rx="30" ry="5" fill="#1e293b" opacity="0.22" />

      {/* Deep Ceramic Soup Bowl Exterior */}
      <path d="
        M 16 50
        C 16 68, 28 74, 44 74
        C 60 74, 72 68, 72 50
        C 72 44, 60 42, 44 42
        C 28 42, 16 44, 16 50 Z
      " fill="#78350f" stroke="#451a03" strokeWidth="1.3" />

      {/* Bowl Rim & Savory Golden Broth Surface */}
      <ellipse cx="44" cy="48" rx="27" ry="8" fill="#92400e" stroke="#451a03" strokeWidth="1.0" />
      <ellipse cx="44" cy="48" rx="25" ry="7" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
      <ellipse cx="44" cy="48" rx="23" ry="6" fill="#eab308" opacity="0.75" />

      {/* Prominent Beef Marrow Bone Standing Proudly in Center */}
      {/* Bone Outer Cylinder */}
      <path d="M 40 38 L 40 54 Q 44 57 48 54 L 48 38 Z" fill="#f5f5f4" stroke="#78716c" strokeWidth="1.1" />
      {/* Circular Top Bone Cut Surface */}
      <ellipse cx="44" cy="38" rx="5.5" ry="3.5" fill="#e7e5e4" stroke="#57534e" strokeWidth="1.0" />
      {/* Rich Hollow Bone Marrow Center (The Prize!) */}
      <ellipse cx="44" cy="38" rx="3.0" ry="2.0" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
      <ellipse cx="44" cy="38" rx="1.8" ry="1.2" fill="#ca8a04" />

      {/* Surrounding Chunky Beef Shank Pieces (Tender Braised Beef) */}
      <path d="M 28 47 Q 34 43 38 48 Q 36 54 30 52 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.9" />
      <path d="M 48 49 Q 54 44 58 48 Q 56 55 50 53 Z" fill="#854d0e" stroke="#451a03" strokeWidth="0.9" />

      {/* Sweet Corn on the Cob Piece (Bright Yellow with Kernels) */}
      <g id="corn-cob" transform="translate(24, 46)">
        <ellipse cx="6" cy="4" rx="5" ry="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        {/* Kernel Grid Lines */}
        <line x1="3" y1="4" x2="9" y2="4" stroke="#a16207" strokeWidth="0.5" />
        <line x1="6" y1="1" x2="6" y2="7" stroke="#a16207" strokeWidth="0.5" />
      </g>

      {/* Crisp Pechay / Cabbage Leaf (Green Foliage) */}
      <path d="M 52 44 Q 60 41 64 45 Q 60 50 54 48 Z" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
      <path d="M 54 44 Q 58 47 62 46" fill="none" stroke="#fef08a" strokeWidth="0.6" />

      {/* Scallion / Spring Onion Rings on Broth */}
      <circle cx="36" cy="53" r="1.2" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.5" />
      <circle cx="48" cy="54" r="1.2" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.5" />
    </g>
      </svg>
    ),
  },
  "tagbilaran_sandugo": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "TAGBILARAN",
    topColor: "#78350f",
    bottom: "SANDUGO VESSEL",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Antique Exhibit Frame */}
    <circle cx="50" cy="56" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="28" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Single Traditional Ceremonial Vessel Representing Sandugo (Antique Metal Artifact) */}
    <g id="sandugo-chalice" transform="translate(24, 22)">
      {/* Flared Ceremonial Chalice / Goblet Cup */}
      <path d="M8,18 L44,18 C44,34 36,44 26,48 C16,44 8,34 8,18 Z" fill="#ca8a04" stroke="#78350f" strokeWidth="1.3" />
      {/* Flanged Rim with Engraved Geometric Band */}
      <ellipse cx="26" cy="18" rx="18" ry="4" fill="#facc15" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="26" cy="18" rx="14" ry="2.5" fill="#991b1b" />
      {/* Goblet Stem and Knop */}
      <rect x="23" y="48" width="6" height="16" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="26" cy="56" rx="5" ry="3" fill="#eab308" stroke="#78350f" strokeWidth="0.8" />
      {/* Flared Circular Base */}
      <path d="M12,70 C14,64 38,64 40,70 L42,72 L10,72 Z" fill="#ca8a04" stroke="#78350f" strokeWidth="1.1" />
      {/* Engraved Filigree on Cup Belly */}
      <path d="M14,28 Q26,34 38,28" fill="none" stroke="#78350f" strokeWidth="0.8" />
      <circle cx="26" cy="34" r="2.5" fill="#991b1b" stroke="#78350f" strokeWidth="0.6" />
    </g>
      </svg>
    ),
  },
  "taguig_bgc_highstreet": {
    frame: "#0a192f",
    bg: "#020c1b",
    top: "TAGUIG",
    topColor: "#64dfdf",
    bottom: "BGC",
    bottomColor: "#f72585",
    renderArt: () => (
      <g>
{/* Modern Neon BGC High-rises */}
      <rect x="10" y="22" width="6" height="21" fill="#480ca8" />
      <rect x="18" y="14" width="8" height="29" fill="#7209b7" />
      <polygon points="18,14 22,9 26,14" fill="#f72585" />
      <rect x="28" y="19" width="7" height="24" fill="#3a0ca3" />
      <rect x="36" y="25" width="4" height="18" fill="#4361ee" />
      {/* Grid of Lit Windows */}
      <line x1="20" y1="18" x2="24" y2="18" stroke="#4cc9f0" strokeWidth="0.8" />
      <line x1="20" y1="23" x2="24" y2="23" stroke="#4cc9f0" strokeWidth="0.8" />
      <line x1="20" y1="28" x2="24" y2="28" stroke="#4cc9f0" strokeWidth="0.8" />
      <line x1="30" y1="23" x2="33" y2="23" stroke="#f72585" strokeWidth="0.8" />
      <line x1="30" y1="28" x2="33" y2="28" stroke="#f72585" strokeWidth="0.8" />
      {/* High Street Promenade Ground */}
      <rect x="8" y="42" width="32" height="2" fill="#4cc9f0" />
      </g>
    ),
  },
  "taguig_highstreet": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "TAGUIG",
    topColor: "#0284c7",
    bottom: "BGC SKYLINE",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Vertical sky gradient backdrop with geometric pinstripe etching */}
    <g opacity="0.35" stroke="#0284c7" strokeWidth="0.4">
      <line x1="14" y1="18" x2="86" y2="18" strokeDasharray="3 2" />
      <line x1="14" y1="24" x2="86" y2="24" strokeDasharray="4 2" />
    </g>

    {/* BONIFACIO GLOBAL CITY (BGC) TIGHTLY CROPPED MODERN TOWERS */}
    {/* Tower Left (Glass Curtain Wall with Vertical Louvers) */}
    <rect x="18" y="40" width="16" height="62" fill="#7dd3fc" stroke="#0369a1" strokeWidth="0.8" />
    <g stroke="#0284c7" strokeWidth="0.45">
      <line x1="22" y1="40" x2="22" y2="102" /><line x1="26" y1="40" x2="26" y2="102" /><line x1="30" y1="40" x2="30" y2="102" />
      <line x1="18" y1="50" x2="34" y2="50" /><line x1="18" y1="62" x2="34" y2="62" /><line x1="18" y1="74" x2="34" y2="74" /><line x1="18" y1="86" x2="34" y2="86" />
    </g>

    {/* Tower Right (High Street Contemporary Slanted Penthouse Tower) */}
    <path d="M66,32 L82,40 L82,102 L66,102 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.8" />
    <g stroke="#0284c7" strokeWidth="0.45">
      <line x1="71" y1="35" x2="71" y2="102" /><line x1="76" y1="37" x2="76" y2="102" />
      <line x1="66" y1="48" x2="82" y2="48" /><line x1="66" y1="60" x2="82" y2="60" /><line x1="66" y1="72" x2="82" y2="72" /><line x1="66" y1="84" x2="82" y2="84" />
    </g>

    {/* Tower Mid-Left (Sleek Highrise with Spire) */}
    <path d="M28,30 L40,24 L48,28 L48,102 L28,102 Z" fill="#0369a1" stroke="#0c4a6e" strokeWidth="0.9" />
    <g stroke="#38bdf8" strokeWidth="0.4">
      <line x1="34" y1="27" x2="34" y2="102" /><line x1="40" y1="24" x2="40" y2="102" /><line x1="44" y1="26" x2="44" y2="102" />
    </g>

    {/* CENTRAL ICONIC BGC SUPER-TOWER (DOMINANT VERTICAL SILHOUETTE) */}
    {/* Architectural Crown Angle with Heli-Deck / Lantern Feature */}
    <polygon points="46,14 54,14 62,20 62,102 38,102 38,20" fill="#0c4a6e" stroke="#031d2c" strokeWidth="1.2" />

    {/* Glass Facade Vertical Grid Curtain Wall */}
    <g stroke="#e0f2fe" strokeWidth="0.55" opacity="0.85">
      <line x1="42" y1="20" x2="42" y2="102" />
      <line x1="46" y1="16" x2="46" y2="102" />
      <line x1="50" y1="14" x2="50" y2="102" />
      <line x1="54" y1="16" x2="54" y2="102" />
      <line x1="58" y1="20" x2="58" y2="102" />
    </g>
    {/* Geometric Horizontal Bands */}
    <g stroke="#38bdf8" strokeWidth="0.4" opacity="0.6">
      <line x1="39" y1="28" x2="61" y2="28" /><line x1="39" y1="38" x2="61" y2="38" />
      <line x1="39" y1="48" x2="61" y2="48" /><line x1="39" y1="58" x2="61" y2="58" />
      <line x1="39" y1="68" x2="61" y2="68" /><line x1="39" y1="78" x2="61" y2="78" />
      <line x1="39" y1="88" x2="61" y2="88" /><line x1="39" y1="96" x2="61" y2="96" />
    </g>

    {/* Modernist Street Level Boulevard Promenade */}
    <rect x="14" y="100" width="72" height="4" fill="#0c4a6e" />
      </svg>
    ),
  },
  "tagum_palm_city": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "TAGUM",
    topColor: "#a16207",
    bottom: "KULINTANG GONG",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* One Cast Bronze Kulintang Gong Shown from a Slight Angle */}
    <g id="kulintang-gong" transform="translate(18, 26)">
      {/* Outer Flanged Rim & Skirt (Heavy Bronze Casting) */}
      <ellipse cx="32" cy="38" rx="28" ry="22" fill="#854d0e" stroke="#451a03" strokeWidth="1.4" />
      {/* Upper Gong Basin Shoulder with Engraved Geometric Relief */}
      <ellipse cx="32" cy="36" rx="24" ry="18" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
      {/* Concentric Hammered Lines on Gong Face */}
      <ellipse cx="32" cy="35" rx="18" ry="13" fill="#eab308" stroke="#a16207" strokeWidth="0.8" />
      {/* Prominent Raised Central Boss (Papu / Nipple) Where Mallet Strikes */}
      <ellipse cx="32" cy="33" rx="7" ry="5.5" fill="#facc15" stroke="#78350f" strokeWidth="1.2" />
      {/* Metallic Bronze Specular Highlight */}
      <ellipse cx="30" cy="31" rx="3" ry="2" fill="#ffffff" opacity="0.8" />
    </g>
      </svg>
    ),
  },
  "talisay_lechon": {
    frame: "#9a3412",
    bg: "#fff7ed",
    top: "TALISAY (CEBU)",
    topColor: "#9a3412",
    bottom: "LECHON",
    bottomColor: "#9a3412",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Culinary Oval Framing */}
    <ellipse cx="50" cy="58" rx="36" ry="28" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="34" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Single Whole Roasted Lechon on a Traditional Platter */}
    <g id="whole-lechon" transform="translate(14, 28)">
      {/* Oval Bamboo / Wood Serving Platter Base */}
      <ellipse cx="36" cy="46" rx="34" ry="12" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
      <ellipse cx="36" cy="46" rx="31" ry="9" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
      {/* Roasted Pig Body with Glossy Amber-Red Crackling Skin */}
      <path d="M12,42 C14,26 30,22 50,24 C62,26 66,32 64,42 C60,48 46,50 30,50 C18,50 12,46 12,42 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="1.4" />
      {/* Crispy Golden Shading Highlight on Back */}
      <path d="M18,36 C22,26 34,24 48,26 C58,28 60,34 56,40 C44,42 26,42 18,36 Z" fill="#ea580c" />
      <ellipse cx="38" cy="30" rx="12" ry="4" fill="#f97316" opacity="0.8" />
      {/* Snout, Ear, and Tail Features */}
      <ellipse cx="64" cy="38" rx="4" ry="3.5" fill="#9a3412" stroke="#7c2d12" strokeWidth="0.8" />
      <polygon points="54,24 58,16 62,24" fill="#7c2d12" />
      <path d="M12,40 Q6,36 8,44" fill="none" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" />
      {/* Red Apple in Mouth */}
      <circle cx="67" cy="40" r="3" fill="#dc2626" stroke="#991b1b" strokeWidth="0.6" />
    </g>
      </svg>
    ),
  },
  "talisay_the_ruins": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "TALISAY (NEGROS OCCIDENTAL)",
    topColor: "#78350f",
    bottom: "THE RUINS",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="50" r="34" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    {/* The Ruins Symmetrical Classical Italianate Mansion Facade */}
    <g id="the-ruins" transform="translate(10, 22)">
      <line x1="2" y1="76" x2="78" y2="76" stroke="#451a03" strokeWidth="1.2" />
      {/* Classical Weathered Concrete Shell Body */}
      <rect x="8" y="24" width="64" height="52" fill="#d6d3d1" stroke="#451a03" strokeWidth="1.3" />
      {/* Open Roofless Upper Balustrade & Cornice */}
      <rect x="6" y="20" width="68" height="4" fill="#a8a29e" stroke="#451a03" strokeWidth="1" />
      {/* Upper Classical Baluster Railing */}
      <g stroke="#451a03" strokeWidth="0.6">
        <line x1="12" y1="16" x2="12" y2="20" /><line x1="20" y1="16" x2="20" y2="20" />
        <line x1="28" y1="16" x2="28" y2="20" /><line x1="36" y1="16" x2="36" y2="20" />
        <line x1="44" y1="16" x2="44" y2="20" /><line x1="52" y1="16" x2="52" y2="20" />
        <line x1="60" y1="16" x2="60" y2="20" /><line x1="68" y1="16" x2="68" y2="20" />
      </g>
      {/* Symmetrical Classical Columns (Ionic / Corinthian) */}
      <g fill="#e7e5e4" stroke="#451a03" strokeWidth="0.9">
        <rect x="12" y="24" width="4" height="52" /><rect x="24" y="24" width="4" height="52" />
        <rect x="52" y="24" width="4" height="52" /><rect x="64" y="24" width="4" height="52" />
      </g>
      {/* Grand Empty Open Arch Windows (Sky Showing Through) */}
      <g fill="#fefce8" stroke="#451a03" strokeWidth="1">
        <rect x="18" y="28" width="5" height="16" rx="2.5" />
        <rect x="57" y="28" width="5" height="16" rx="2.5" />
        <rect x="18" y="52" width="5" height="18" rx="2.5" />
        <rect x="57" y="52" width="5" height="18" rx="2.5" />
        {/* Grand Central Entrance Arch */}
        <rect x="34" y="44" width="12" height="32" rx="6" />
      </g>
    </g>
      </svg>
    ),
  },
  "tanauan_mabini": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "TANAUAN",
    topColor: "#78350f",
    bottom: "KAPENG BARAKO",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Delicate Engraved Steam */}
    <path d="M45,30 Q41,20 46,12 M51,28 Q55,18 50,10 M57,30 Q61,20 56,12" fill="none" stroke="#b45309" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />
    <ellipse cx="50" cy="88" rx="32" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Ceramic Saucer & Cup */}
    <ellipse cx="48" cy="80" rx="28" ry="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.1" />
    <path d="M30,46 L34,74 C34,77 42,79 48,79 C54,79 62,77 62,74 L66,46 Z" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
    <path d="M65,50 C74,50 74,66 63,68" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
    {/* Dark Surface of Coffee */}
    <ellipse cx="48" cy="46" rx="18" ry="4.5" fill="#1c1917" stroke="#451a03" strokeWidth="1" />
    {/* Coffee Beans Beside */}
    <g transform="translate(62, 76)">
      <ellipse cx="6" cy="4" rx="4.5" ry="3" fill="#451a03" stroke="#1c1917" strokeWidth="0.7" transform="rotate(25 6 4)" />
      <path d="M4,2 Q6,4 8,6" stroke="#d97706" strokeWidth="0.6" fill="none" />
    </g>
      </svg>
    ),
  },
  "tandag_linungao_island": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "TANDAG",
    topColor: "#78350f",
    bottom: "SURIGAONON TEXTILE",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<rect x="14" y="16" width="72" height="88" rx="1" fill="#451a03" stroke="#1c0702" strokeWidth="1.3" />
    {/* Traditional Surigaonon Woven Textile Displayed Flat */}
    <g id="surigaonon-textile">
      <rect x="18" y="20" width="64" height="80" fill="#78350f" stroke="#ca8a04" strokeWidth="0.8" />
      {/* Banded Geometric Striping */}
      <rect x="18" y="30" width="64" height="12" fill="#ca8a04" />
      <rect x="18" y="54" width="64" height="14" fill="#991b1b" />
      <rect x="18" y="78" width="64" height="12" fill="#ca8a04" />
      {/* Detailed Individual Threads & Weft Lines */}
      <g stroke="#fef08a" strokeWidth="0.6" fill="none">
        <path d="M22,36 L30,30 L38,36 L46,30 L54,36 L62,30 L70,36 L78,30" />
        <path d="M22,84 L30,78 L38,84 L46,78 L54,84 L62,78 L70,84 L78,78" />
      </g>
      {/* Center Medallion Geometric Inlay */}
      <polygon points="50,54 57,61 50,68 43,61" fill="#facc15" stroke="#451a03" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "tangub_christmas_symbols": {
    frame: "#b91c1c",
    bg: "#fef2f2",
    top: "TANGUB",
    topColor: "#b91c1c",
    bottom: "CHRISTMAS LANTERN",
    bottomColor: "#b91c1c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Outer Festive Starburst Glow Rays */}
    <g stroke="#f87171" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
      <line x1="50" y1="12" x2="50" y2="104" /><line x1="12" y1="58" x2="88" y2="58" />
      <line x1="22" y1="30" x2="78" y2="86" /><line x1="78" y1="30" x2="22" y2="86" />
    </g>
    {/* Elaborate Tangub Christmas Lantern Architecture (Christmas City of the South) */}
    <g id="tangub-lantern">
      {/* Ornate Radial Star Structure */}
      <polygon points="50,22 56,38 72,32 64,48 80,58 64,68 72,84 56,78 50,94 44,78 28,84 36,68 20,58 36,48 28,32 44,38" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
      {/* Concentric Miniature Architectural Lantern Lights */}
      <circle cx="50" cy="58" r="22" fill="#facc15" stroke="#ca8a04" strokeWidth="1.1" />
      <circle cx="50" cy="58" r="14" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <circle cx="50" cy="58" r="6" fill="#ffffff" />
    </g>
      </svg>
    ),
  },
  "tanjay_saulog": {
    frame: "#ea580c",
    bg: "#fff7ed",
    top: "TANJAY",
    topColor: "#ea580c",
    bottom: "FESTIVAL ORNAMENT",
    bottomColor: "#ea580c",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="34" fill="none" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Single Elaborate Traditional Festival Ornament Rendered as Cultural Artifact */}
    <g id="festival-ornament">
      {/* Outer Radial Rosette Petals */}
      <g fill="#facc15" stroke="#c2410c" strokeWidth="0.8">
        <circle cx="50" cy="32" r="6" /><circle cx="50" cy="84" r="6" />
        <circle cx="24" cy="58" r="6" /><circle cx="76" cy="58" r="6" />
        <circle cx="32" cy="40" r="5.5" /><circle cx="68" cy="76" r="5.5" />
        <circle cx="68" cy="40" r="5.5" /><circle cx="32" cy="76" r="5.5" />
      </g>
      {/* Concentric Medallion Body */}
      <circle cx="50" cy="58" r="22" fill="#ea580c" stroke="#9a3412" strokeWidth="1.3" />
      <circle cx="50" cy="58" r="16" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <circle cx="50" cy="58" r="8" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
      {/* Metallic Mirrored Center Gem */}
      <circle cx="50" cy="58" r="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
      {/* Hanging Decorative Streamers / Tassels */}
      <path d="M46,88 L44,104 M50,90 L50,106 M54,88 L56,104" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" />
    </g>
      </svg>
    ),
  },
  "tarlac_sugarcane": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "TARLAC CITY",
    topColor: "#78350f",
    bottom: "MONASTERIO CROSS",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Elevated Mount San Jose Setting & Radial Sunburst */}
    <circle cx="50" cy="48" r="32" fill="none" stroke="#d97706" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Elevated Hill Peak */}
    <path d="M12,88 C32,74 68,74 88,88 L88,104 L12,104 Z" fill="#047857" stroke="#022c22" strokeWidth="1.2" />
    {/* Monumental Cross Architecture (Monasterio de Tarlac, No People) */}
    <g id="monasterio-cross">
      {/* Pedestal / Base */}
      <rect x="42" y="80" width="16" height="8" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
      <rect x="44" y="74" width="12" height="6" fill="#cbd5e1" stroke="#334155" strokeWidth="0.8" />
      {/* Monumental Vertical Beam */}
      <rect x="47" y="16" width="6" height="58" fill="#ffffff" stroke="#1e293b" strokeWidth="1.3" />
      {/* Horizontal Crossbar */}
      <rect x="28" y="32" width="44" height="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.3" />
      {/* Architectural Recessed Bevel Lines */}
      <line x1="50" y1="18" x2="50" y2="72" stroke="#94a3b8" strokeWidth="0.8" />
      <line x1="30" y1="35" x2="70" y2="35" stroke="#94a3b8" strokeWidth="0.8" />
    </g>
      </svg>
    ),
  },
  "tayabas_malagonlong": {
    frame: "#4f5d2f",
    bg: "#fdf0d5",
    top: "TAYABAS",
    topColor: "#4f5d2f",
    bottom: "MALAGONLONG",
    bottomColor: "#bc6c25",
    renderArt: () => (
      <g>
{/* Historic Spanish Malagonlong Stone Bridge with 5 arches */}
      <rect x="8" y="24" width="32" height="7" fill="#bc6c25" />
      <rect x="8" y="31" width="32" height="12" fill="#8c5831" />
      {/* Arches */}
      <path d="M 10 43 V 35 A 3 3 0 0 1 16 35 V 43 Z" fill="#38bdf8" />
      <path d="M 18 43 V 33 A 4 4 0 0 1 26 33 V 43 Z" fill="#38bdf8" />
      <path d="M 28 43 V 35 A 3 3 0 0 1 34 35 V 43 Z" fill="#38bdf8" />
      {/* Bridge balustrade */}
      <line x1="8" y1="24" x2="40" y2="24" stroke="#4f5d2f" strokeWidth="1.5" />
      </g>
    ),
  },
  "tayabas_malagonlong_bridge": {
    frame: "#0284c7",
    bg: "#f0f9ff",
    top: "TAYABAS",
    topColor: "#0284c7",
    bottom: "LAMBANOG BOTTLE",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Antique Product Engraving Oval */}
    <ellipse cx="50" cy="58" rx="28" ry="36" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="94" rx="24" ry="3.5" fill="#0f172a" opacity="0.2" />
    {/* Traditional Lambanog Glass Jug / Bottle Specimen */}
    <g id="lambanog-bottle" transform="translate(24, 20)">
      {/* Cork Stopper */}
      <rect x="22" y="4" width="8" height="6" fill="#ca8a04" stroke="#78350f" strokeWidth="0.8" />
      {/* Flanged Lip & Narrow Neck */}
      <rect x="20" y="10" width="12" height="3" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
      <rect x="22" y="13" width="8" height="12" fill="#e2e8f0" stroke="#475569" strokeWidth="0.9" />
      {/* Bulbous Glass Demijohn Body */}
      <path d="M22,25 C14,28 6,38 6,56 C6,68 14,74 26,74 C38,74 46,68 46,56 C46,38 38,28 30,25 Z" fill="#f8fafc" stroke="#334155" strokeWidth="1.3" />
      {/* Clear Distilled Spirit Level & Glass Reflections */}
      <path d="M8,54 C8,66 15,71 26,71 C37,71 44,66 44,54 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M12,38 C10,48 10,60 14,68" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      {/* Traditional Paper Vintage Label */}
      <rect x="14" y="44" width="24" height="16" rx="1" fill="#fef08a" stroke="#a16207" strokeWidth="0.8" />
      <line x1="18" y1="48" x2="34" y2="48" stroke="#78350f" strokeWidth="0.8" />
      <line x1="20" y1="52" x2="32" y2="52" stroke="#78350f" strokeWidth="0.6" />
      <line x1="22" y1="56" x2="30" y2="56" stroke="#78350f" strokeWidth="0.6" />
    </g>
      </svg>
    ),
  },
  "toledo_copper_mine": {
    frame: "#b45309",
    bg: "#fffbeb",
    top: "TOLEDO",
    topColor: "#b45309",
    bottom: "COPPER ORE",
    bottomColor: "#b45309",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Geological Drafting Frame */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#d97706" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="92" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Single Raw Copper-Bearing Ore Specimen (Chalcopyrite / Malachite) */}
    <g id="copper-ore" transform="translate(18, 26)">
      {/* Angular Crystalline Rock Matrix Base */}
      <polygon points="12,42 22,18 48,16 62,34 56,58 36,66 18,60" fill="#475569" stroke="#1e293b" strokeWidth="1.4" />
      {/* Faceted Crystal Faces Shading */}
      <polygon points="22,18 36,28 32,50 12,42" fill="#334155" />
      <polygon points="22,18 48,16 38,32 36,28" fill="#64748b" />
      <polygon points="48,16 62,34 50,44 38,32" fill="#475569" />
      <polygon points="32,50 50,44 56,58 36,66" fill="#1e293b" />
      {/* Metallic Copper & Gold Veins (Chalcopyrite & Native Copper) */}
      <g stroke="#d97706" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M26,22 L34,32 L30,46" />
        <path d="M42,20 L40,36 L48,50" />
      </g>
      {/* Bright Copper Sparkle Highlights */}
      <polygon points="34,30 36,32 34,34 32,32" fill="#f59e0b" />
      <polygon points="42,34 44,36 42,38 40,36" fill="#f59e0b" />
      {/* Green Malachite Oxidation Vein */}
      <path d="M20,44 L28,54 L24,60" stroke="#059669" strokeWidth="1.2" fill="none" />
    </g>
      </svg>
    ),
  },
  "toronto_cn_tower": {
    frame: "#991b1b",
    bg: "#f1f5f9",
    top: "",
    topColor: "",
    bottom: "",
    bottomColor: "",
    renderArt: () => (
      <g>
{/* Lake Ontario shimmering waters */}
      <rect x="6" y="36" width="36" height="7" fill="#0284c7" />
      <line x1="8" y1="38" x2="24" y2="38" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      <line x1="18" y1="41" x2="40" y2="41" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="2 1" />
      {/* Toronto Skyline buildings */}
      <rect x="10" y="27" width="5" height="9" fill="#94a3b8" />
      <rect x="16" y="24" width="4" height="12" fill="#64748b" />
      <rect x="29" y="25" width="5" height="11" fill="#64748b" />
      <rect x="35" y="28" width="4" height="8" fill="#94a3b8" />
      {/* Soaring CN Tower column */}
      <polygon points="22.5,36 25.5,36 24.8,17 23.2,17" fill="#475569" />
      {/* Circular 360-degree SkyPod observation bubble */}
      <ellipse cx="24" cy="18" rx="3.5" ry="1.8" fill="#ffffff" stroke="#991b1b" strokeWidth="0.5" />
      <ellipse cx="24" cy="16" rx="2" ry="1" fill="#ffffff" stroke="#991b1b" strokeWidth="0.4" />
      {/* Tall communications antenna spire */}
      <line x1="24" y1="15" x2="24" y2="7" stroke="#991b1b" strokeWidth="0.8" />
      {/* Canadian Red Maple Leaf accent */}
      <path d="M 35 12 L 36 14 L 38 13 L 37 15 L 39 16 L 37 17 L 36 19 L 35 17 L 34 19 L 33 17 L 31 16 L 33 15 L 32 13 L 34 14 Z" fill="#dc2626" />
      </g>
    ),
  },
  "trece_martires_heroes": {
    frame: "#9d0208",
    bg: "#fefae0",
    top: "TRECE MARTIRES",
    topColor: "#9d0208",
    bottom: "13 HEROES",
    bottomColor: "#d4a373",
    renderArt: () => (
      <g>
{/* Memorial Monument Pylon */}
      <polygon points="24,14 20,42 28,42" fill="#78350f" />
      {/* Blazing Torch flame */}
      <path d="M 24 14 Q 28 8 26 6 Q 22 9 24 14 Z" fill="#d90429" />
      <path d="M 24 13 Q 26 9 25 8 Q 23 10 24 13 Z" fill="#ffb703" />
      {/* 13 Stars / Torches representation */}
      <circle cx="14" cy="26" r="1.2" fill="#9d0208" />
      <circle cx="16" cy="32" r="1.2" fill="#9d0208" />
      <circle cx="34" cy="26" r="1.2" fill="#9d0208" />
      <circle cx="32" cy="32" r="1.2" fill="#9d0208" />
      <polygon points="15,44 33,44 30,42 18,42" fill="#9d0208" />
      </g>
    ),
  },
  "trece_martires_monument": {
    frame: "#a16207",
    bg: "#fefce8",
    top: "TRECE MARTIRES",
    topColor: "#a16207",
    bottom: "CAVITE BAMBOO CRAFT",
    bottomColor: "#a16207",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
<circle cx="50" cy="58" r="32" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="88" rx="30" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Finely Woven Bamboo Container / Basket (Geometric Weaving Patterns) */}
    <g id="tm-bamboo-craft" transform="translate(18, 30)">
      <path d="M6,22 L12,48 C14,54 26,56 32,56 C38,56 50,54 52,48 L58,22 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
      <ellipse cx="32" cy="22" rx="26" ry="6" fill="#fef08a" stroke="#854d0e" strokeWidth="1.3" />
      <g stroke="#78350f" strokeWidth="0.7">
        <line x1="8" y1="28" x2="22" y2="52" /><line x1="16" y1="26" x2="30" y2="55" />
        <line x1="26" y1="26" x2="38" y2="55" /><line x1="36" y1="26" x2="48" y2="52" />
        <line x1="56" y1="28" x2="42" y2="52" /><line x1="48" y1="26" x2="34" y2="55" />
        <line x1="38" y1="26" x2="26" y2="55" /><line x1="28" y1="26" x2="16" y2="52" />
      </g>
    </g>
      </svg>
    ),
  },
  "tuguegarao_callao": {
    frame: "#1b4965",
    bg: "#fdf0d5",
    top: "TUGUEGARAO",
    topColor: "#1b4965",
    bottom: "CALLAO CAVE",
    bottomColor: "#8d99ae",
    renderArt: () => (
      <g>
{/* Cagayan River Blue */}
      <rect x="7" y="32" width="34" height="12" fill="#1b4965" />
      {/* Buntun Bridge Arch */}
      <path d="M 8 33 Q 24 23 40 33" stroke="#d90429" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="33" x2="40" y2="33" stroke="#d90429" strokeWidth="1" />
      {/* Callao Cave Natural Limestone Arch */}
      <path d="M 14 32 V 22 A 10 10 0 0 1 34 22 V 32 Z" fill="#8d99ae" opacity="0.6" />
      <path d="M 17 32 V 24 A 7 7 0 0 1 31 24 V 32 Z" fill="#fdf0d5" />
      {/* Light beam through skylight */}
      <polygon points="24,15 19,32 29,32" fill="#fcbf49" opacity="0.5" />
      </g>
    ),
  },
  "tuguegarao_callao_cave": {
    frame: "#9a3412",
    bg: "#fff7ed",
    top: "TUGUEGARAO",
    topColor: "#9a3412",
    bottom: "PANCIT BATIL PATUNG",
    bottomColor: "#9a3412",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Etched Circular Plate Platter */}
    <ellipse cx="50" cy="58" rx="36" ry="30" fill="none" stroke="#ea580c" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Deep Ceramic Serving Bowl */}
    <ellipse cx="50" cy="62" rx="34" ry="26" fill="#78350f" stroke="#451a03" strokeWidth="1.3" />
    <ellipse cx="50" cy="60" rx="30" ry="22" fill="#92400e" stroke="#451a03" strokeWidth="0.8" />
    {/* Miki Noodles Heap in Hearty Savory Sauce */}
    <ellipse cx="50" cy="60" rx="27" ry="19" fill="#ca8a04" />
    {/* Noodle Strands Engraved Linework */}
    <g stroke="#854d0e" strokeWidth="0.8" fill="none">
      <path d="M30,52 Q44,48 56,54" /><path d="M26,60 Q40,64 62,58" />
      <path d="M34,66 Q48,68 68,64" /><path d="M36,54 Q50,58 64,52" />
    </g>
    {/* Crushed Chicharon & Minced Carabeef Bits */}
    <g fill="#78350f">
      <circle cx="34" cy="54" r="2" /><circle cx="42" cy="50" r="1.8" />
      <circle cx="58" cy="52" r="2.2" /><circle cx="64" cy="58" r="1.8" />
      <circle cx="38" cy="66" r="2" /><circle cx="60" cy="66" r="2" />
    </g>
    {/* "Patung" Poached Egg on Top (Centerpiece) */}
    <ellipse cx="50" cy="58" rx="9" ry="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
    <circle cx="50" cy="58" r="4.2" fill="#ea580c" stroke="#c2410c" strokeWidth="0.8" />
    <circle cx="48.5" cy="56.5" r="1.2" fill="#fef08a" />
      </svg>
    ),
  },
  "tuna": {
    frame: "#1e3a8a",
    bg: "#0284c7",
    top: "GEN. SANTOS",
    topColor: "#ffffff",
    bottom: "TUNA CAPITAL",
    bottomColor: "#facc15",
    renderArt: () => (
      <g>
{/* Sarangani Bay deep ocean waves */}
      <path d="M 7 34 Q 16 30 24 34 Q 32 30 41 34 V 44 H 7 Z" fill="#1e3a8a" />
      {/* Mighty Yellowfin Tuna Leaping */}
      <ellipse cx="24" cy="27" rx="13" ry="5.5" fill="#334155" transform="rotate(-15 24 27)" />
      <ellipse cx="24" cy="28" rx="11" ry="3.5" fill="#ffffff" transform="rotate(-15 24 28)" />
      {/* Bright Yellow Finlets & Dorsal Fins */}
      <polygon points="23,19 28,24 22,25" fill="#facc15" />
      <polygon points="26,30 29,35 25,33" fill="#facc15" />
      {/* Forked Tail Fin */}
      <polygon points="11,31 6,26 8,36" fill="#facc15" />
      {/* Eye & Gill */}
      <circle cx="32" cy="23" r="1.2" fill="#facc15" />
      <circle cx="32" cy="23" r="0.6" fill="#000000" />
      {/* Water splash */}
      <circle cx="35" cy="28" r="1.2" fill="#bae6fd" />
      </g>
    ),
  },
  "urdaneta_cattle_market": {
    frame: "#78350f",
    bg: "#fefce8",
    top: "URDANETA",
    topColor: "#78350f",
    bottom: "MUSHROOM",
    bottomColor: "#78350f",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Scientific Botanical Circular Plate */}
    <circle cx="50" cy="58" r="32" fill="none" stroke="#a16207" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    <ellipse cx="50" cy="90" rx="28" ry="4" fill="#0f172a" opacity="0.2" />
    {/* Cluster of Cultivated Edible Mushrooms (Detailed Caps, Stems, and Gills) */}
    <g id="mushroom-cluster">
      {/* Secondary Mushroom (Right) */}
      <path d="M54,64 L56,86 L62,86 L60,64 Z" fill="#fef08a" stroke="#78350f" strokeWidth="0.8" />
      <path d="M48,62 C50,54 58,50 66,52 C74,54 76,62 74,66 C68,68 54,68 48,62 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.1" />
      {/* Dominant Center Mushroom */}
      {/* Sturdy Stem */}
      <path d="M38,58 L36,88 L46,88 L44,58 Z" fill="#fef9c3" stroke="#78350f" strokeWidth="1.1" />
      {/* Stem Ring / Annulus */}
      <ellipse cx="41" cy="68" rx="5" ry="1.5" fill="#fef08a" stroke="#78350f" strokeWidth="0.7" />
      {/* Umbrella Cap */}
      <path d="M22,54 C24,36 38,30 50,30 C62,30 72,36 74,54 C66,60 30,60 22,54 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.3" />
      {/* Cap Highlights & Scale Texture */}
      <ellipse cx="50" cy="38" rx="12" ry="5" fill="#92400e" />
      <ellipse cx="46" cy="36" rx="6" ry="2" fill="#ca8a04" opacity="0.6" />
      {/* Underside Gills (Lamellae) */}
      <ellipse cx="48" cy="56" rx="24" ry="4" fill="#fef08a" stroke="#854d0e" strokeWidth="0.8" />
      <g stroke="#854d0e" strokeWidth="0.5" fill="none">
        <line x1="28" y1="56" x2="38" y2="57" /><line x1="32" y1="55" x2="39" y2="56" />
        <line x1="58" y1="57" x2="68" y2="56" /><line x1="57" y1="56" x2="64" y2="55" />
      </g>
    </g>
      </svg>
    ),
  },
  "urdaneta_palay": {
    frame: "#ffb703",
    bg: "#fefae0",
    top: "URDANETA",
    topColor: "#b45309",
    bottom: "GRAIN CAPITAL",
    bottomColor: "#15803d",
    renderArt: () => (
      <g>
{/* Golden agricultural sun */}
      <circle cx="24" cy="18" r="6" fill="#fdc500" />
      {/* Graceful curving sheaves of palay (rice) */}
      <path d="M 24 43 Q 14 32 16 20" stroke="#b45309" strokeWidth="1.2" fill="none" />
      <path d="M 24 43 Q 34 32 32 20" stroke="#b45309" strokeWidth="1.2" fill="none" />
      {/* Grains of rice along the stalks */}
      <ellipse cx="15" cy="22" rx="1.5" ry="3" fill="#ffb703" transform="rotate(-30 15 22)" />
      <ellipse cx="17" cy="26" rx="1.5" ry="3" fill="#ffb703" transform="rotate(-20 17 26)" />
      <ellipse cx="19" cy="31" rx="1.5" ry="3" fill="#ffb703" transform="rotate(-15 19 31)" />
      <ellipse cx="33" cy="22" rx="1.5" ry="3" fill="#ffb703" transform="rotate(30 33 22)" />
      <ellipse cx="31" cy="26" rx="1.5" ry="3" fill="#ffb703" transform="rotate(20 31 26)" />
      <ellipse cx="29" cy="31" rx="1.5" ry="3" fill="#ffb703" transform="rotate(15 29 31)" />
      {/* Center upright stalk */}
      <path d="M 24 43 V 18" stroke="#15803d" strokeWidth="1.2" />
      <ellipse cx="24" cy="18" rx="1.5" ry="3.5" fill="#facc15" />
      </g>
    ),
  },
  "valencia_pulangi_dam": {
    frame: "#047857",
    bg: "#f0fdf4",
    top: "VALENCIA",
    topColor: "#047857",
    bottom: "MUSUAN PEAK",
    bottomColor: "#047857",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Atmospheric Geological Sky */}
    <circle cx="50" cy="44" r="32" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
    {/* Clean Silhouette of Musuan Peak (Mount Musuan Active Lava Dome) */}
    {/* Surrounding Agricultural Plains Horizon */}
    <path d="M10,88 C30,86 70,86 90,88 L90,108 L10,108 Z" fill="#064e3b" stroke="#022c22" strokeWidth="1" />
    {/* Distinctive Conical Lava Dome Summit Profile */}
    <path d="M50,30 C44,44 32,70 14,88 L86,88 C68,70 56,44 50,30 Z" fill="#047857" stroke="#022c22" strokeWidth="1.4" />
    {/* Shaded Eastern Slopes with Layered Strata */}
    <path d="M50,30 C50,44 54,70 86,88 L50,88 Z" fill="#065f46" />
    {/* Geological Slopes Contours */}
    <g stroke="#34d399" strokeWidth="0.6" fill="none" opacity="0.7">
      <path d="M50,32 L34,88" /><path d="M50,32 L44,88" />
      <path d="M50,32 L58,88" /><path d="M50,32 L68,88" />
    </g>
      </svg>
    ),
  },
  "valenzuela_arkong_bato": {
    frame: "#0369a1",
    bg: "#f0f9ff",
    top: "VALENZUELA",
    topColor: "#0369a1",
    bottom: "OLD POLO FISHING HERITAGE",
    bottomColor: "#0369a1",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Gentle Coastal Horizon & Rippling Manila Bay Water */}
    <g opacity="0.3" stroke="#0284c7" strokeWidth="0.5">
      <line x1="10" y1="72" x2="90" y2="72" strokeDasharray="3 2" />
      <line x1="12" y1="84" x2="88" y2="84" strokeDasharray="2 2" />
      <line x1="16" y1="94" x2="84" y2="94" strokeDasharray="4 2" />
    </g>

    <g id="polo-fishing-banca">
      {/* Water Surface Ripples Under Hull */}
      <path d="M 14 78 Q 30 76 50 78 Q 70 80 86 78" fill="none" stroke="#0284c7" strokeWidth="0.9" />
      <path d="M 18 82 Q 36 80 54 82 Q 72 84 82 82" fill="none" stroke="#0ea5e9" strokeWidth="0.7" />

      {/* Far Bamboo Float (Katig) & Curved Boom (Tadyo) */}
      <path d="M 38 62 Q 44 54 54 55 Q 64 56 68 62" fill="none" stroke="#b45309" strokeWidth="1.0" />
      <path d="M 34 64 Q 54 62 76 64" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />

      {/* Traditional Wooden Banca Hull */}
      {/* Keel and lower hull */}
      <path d="M 14 66 Q 22 74 38 77 Q 56 78 74 74 Q 82 70 86 64 Q 78 69 56 71 Q 34 71 18 64 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.0" />
      {/* Main Upper Planked Hull */}
      <path d="M 14 62 Q 22 70 42 72 Q 62 72 82 66 L 86 63 Q 66 69 44 69 Q 24 67 14 62 Z" fill="#9a3412" stroke="#431407" strokeWidth="0.9" />
      {/* Gunwale Rail (Painted white/teal traditional trim) */}
      <path d="M 12 59 Q 24 66 48 68 Q 72 68 88 61 L 87 60 Q 71 66 48 66 Q 25 64 13 58 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />

      {/* High Pointed Prow (Bow) */}
      <path d="M 12 59 Q 10 54 11 50 Q 13 53 14 58 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
      {/* Stern post */}
      <path d="M 88 61 Q 90 58 89 55 Q 87 58 86 61 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.7" />

      {/* Wood grain plank lines along hull */}
      <path d="M 18 65 Q 40 70 65 69 Q 78 67 82 65" fill="none" stroke="#451a03" strokeWidth="0.5" opacity="0.6" />
      <path d="M 22 68 Q 42 73 62 72 Q 74 71 78 68" fill="none" stroke="#451a03" strokeWidth="0.4" opacity="0.5" />

      {/* Center Mast & Furled Fishing Rigging */}
      <line x1="46" y1="67" x2="46" y2="28" stroke="#451a03" strokeWidth="1.4" />
      {/* Masthead block and stay ropes */}
      <line x1="46" y1="30" x2="16" y2="58" stroke="#78350f" strokeWidth="0.6" />
      <line x1="46" y1="30" x2="84" y2="60" stroke="#78350f" strokeWidth="0.6" />
      {/* Furled Sail Canvas along Boom */}
      <path d="M 46 36 Q 60 40 72 46 L 70 48 Q 58 43 46 39 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="0.7" />
      {/* Lashings on furled sail */}
      <line x1="52" y1="39" x2="51" y2="42" stroke="#92400e" strokeWidth="0.6" />
      <line x1="58" y1="41" x2="57" y2="44" stroke="#92400e" strokeWidth="0.6" />
      <line x1="64" y1="43" x2="63" y2="46" stroke="#92400e" strokeWidth="0.6" />

      {/* Near Bamboo Outrigger (Tadyo & Katig) in Crisp Foreground */}
      {/* Forward curved boom support */}
      <path d="M 32 67 Q 28 73 24 76 Q 22 81 26 84" fill="none" stroke="#ca8a04" strokeWidth="1.3" />
      {/* Aft curved boom support */}
      <path d="M 64 67 Q 60 74 58 78 Q 56 82 60 85" fill="none" stroke="#ca8a04" strokeWidth="1.3" />
      {/* Near Long Cylindrical Bamboo Float (Katig) Resting on Water */}
      <path d="M 18 85 Q 42 88 74 84 L 73 82 Q 42 86 19 83 Z" fill="#eab308" stroke="#a16207" strokeWidth="1.0" />
      {/* Bamboo internode joints */}
      <line x1="28" y1="83" x2="28" y2="86" stroke="#713f12" strokeWidth="0.8" />
      <line x1="40" y1="84" x2="40" y2="87" stroke="#713f12" strokeWidth="0.8" />
      <line x1="52" y1="84" x2="52" y2="87" stroke="#713f12" strokeWidth="0.8" />
      <line x1="64" y1="83" x2="64" y2="86" stroke="#713f12" strokeWidth="0.8" />

      {/* Coiled Fishing Nets / Rigging in Well */}
      <ellipse cx="40" cy="65" rx="5" ry="2" fill="#1e293b" opacity="0.6" />
      <path d="M 36 65 Q 40 63 44 65 Q 40 67 36 65" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1 1" />
    </g>
      </svg>
    ),
  },
  "victorias_sugar_refinery": {
    frame: "#334155",
    bg: "#f8fafc",
    top: "VICTORIAS",
    topColor: "#334155",
    bottom: "SUGAR MILL",
    bottomColor: "#334155",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
{/* Technical Industrial Grid Background */}
    <line x1="12" y1="88" x2="88" y2="88" stroke="#64748b" strokeWidth="0.8" />
    {/* Historic Sugar-Milling Machinery Rendered as Technical Engraving */}
    <g id="sugar-mill-machinery" transform="translate(12, 22)">
      {/* Heavy Cast Iron Mill Base Frame */}
      <rect x="10" y="48" width="56" height="18" fill="#334155" stroke="#0f172a" strokeWidth="1.3" />
      {/* Industrial Smelting Smokestack (Victorias Heritage Mill) */}
      <polygon points="62,6 58,54 66,54 64,6" fill="#64748b" stroke="#1e293b" strokeWidth="1.1" />
      <ellipse cx="63" cy="6" rx="3" ry="1" fill="#334155" />
      {/* High-Pressure Steam Piping Network */}
      <path d="M22,26 L34,26 L34,48" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
      <path d="M46,32 L58,32 L58,48" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
      {/* Massive Heavy Industrial Sugar Cane Crushing Rollers / Gears */}
      {/* Roller Gear 1 (Left) */}
      <circle cx="24" cy="48" r="14" fill="#475569" stroke="#0f172a" strokeWidth="1.3" />
      <circle cx="24" cy="48" r="5" fill="#0f172a" />
      {/* Gear Teeth */}
      <circle cx="24" cy="48" r="12" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeDasharray="3 2" />
      {/* Roller Gear 2 (Right) Intermeshed */}
      <circle cx="48" cy="48" r="14" fill="#475569" stroke="#0f172a" strokeWidth="1.3" />
      <circle cx="48" cy="48" r="5" fill="#0f172a" />
      <circle cx="48" cy="48" r="12" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeDasharray="3 2" />
      {/* Flywheel Spoke Lines */}
      <line x1="24" y1="36" x2="24" y2="60" stroke="#1e293b" strokeWidth="1" />
      <line x1="12" y1="48" x2="36" y2="48" stroke="#1e293b" strokeWidth="1" />
      <line x1="48" y1="36" x2="48" y2="60" stroke="#1e293b" strokeWidth="1" />
      <line x1="36" y1="48" x2="60" y2="48" stroke="#1e293b" strokeWidth="1" />
    </g>
      </svg>
    ),
  },
  "zamboanga_vinta_fort_pilar": {
    frame: "#78350f",
    bg: "#faf8f5",
    top: "ZAMBOANGA",
    topColor: "#78350f",
    bottom: "ASIA'S LATIN CITY",
    bottomColor: "#0284c7",
    renderArt: () => (
      <svg viewBox="6 6 88 108" x="4.5" y="4.5" width="39" height="49">
        {/* Outer Spanish-Colonial Frame */}
        <rect x="8" y="8" width="84" height="104" fill="#faf8f5" stroke="#78350f" strokeWidth="1.8" />
        <rect x="10.5" y="10.5" width="79" height="99" fill="none" stroke="#ea580c" strokeWidth="0.7" />

        <rect x="11" y="11" width="78" height="42" fill="#fef2f2" opacity="0.6" />

        {/* 1. ASIA'S LATIN CITY: REAL FUERZA DE NUESTRA SEÑORA DEL PILAR (FORT PILAR) */}
        <g id="fort-pilar">
          <polygon points="16,52 16,30 28,30 32,24 68,24 72,30 84,30 84,52" fill="#d6cbbe" stroke="#57493b" strokeWidth="1" />
          
          <g stroke="#8c7a6b" strokeWidth="0.4">
            <line x1="18" y1="34" x2="82" y2="34" />
            <line x1="18" y1="39" x2="82" y2="39" />
            <line x1="18" y1="44" x2="82" y2="44" />
            <line x1="18" y1="49" x2="82" y2="49" />
            <line x1="24" y1="30" x2="24" y2="34" /><line x1="36" y1="30" x2="36" y2="34" /><line x1="64" y1="30" x2="64" y2="34" /><line x1="76" y1="30" x2="76" y2="34" />
            <line x1="30" y1="34" x2="30" y2="39" /><line x1="42" y1="34" x2="42" y2="39" /><line x1="58" y1="34" x2="58" y2="39" /><line x1="70" y1="34" x2="70" y2="39" />
            <line x1="22" y1="39" x2="22" y2="44" /><line x1="34" y1="39" x2="34" y2="44" /><line x1="66" y1="39" x2="66" y2="44" /><line x1="78" y1="39" x2="78" y2="44" />
          </g>

          <rect x="18" y="27" width="4" height="3" fill="#b8a896" stroke="#57493b" strokeWidth="0.6" />
          <rect x="24" y="27" width="4" height="3" fill="#b8a896" stroke="#57493b" strokeWidth="0.6" />
          <rect x="72" y="27" width="4" height="3" fill="#b8a896" stroke="#57493b" strokeWidth="0.6" />
          <rect x="78" y="27" width="4" height="3" fill="#b8a896" stroke="#57493b" strokeWidth="0.6" />

          <path d="M 40 52 L 40 33 C 40 27, 60 27, 60 33 L 60 52 Z" fill="#fdfbf7" stroke="#78350f" strokeWidth="0.9" />
          <path d="M 42 52 L 42 34 C 42 29, 58 29, 58 34 L 58 52 Z" fill="#fef3c7" stroke="#ca8a04" strokeWidth="0.6" />
          
          <circle cx="50" cy="38" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="50" cy="38" r="1.6" fill="#fef08a" />
          <path d="M 50 19 L 50 25 M 48 21 L 52 21" stroke="#ca8a04" strokeWidth="1.3" strokeLinecap="round" />
        </g>

        {/* HISTORIC VINTA SAIL */}
        <g transform="translate(68, 14)">
          <path d="M -3 17 L 9 17 L 7 19 L -1 19 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.4" />
          <polygon points="0,0 8,16 -2,16" fill="#dc2626" stroke="#991b1b" strokeWidth="0.4" />
          <polygon points="2,4 5,16 2,16" fill="#facc15" />
          <polygon points="4,8 7,16 5,16" fill="#0284c7" />
        </g>

        {/* 2. CITY OF FLOWERS: CASCADING BOUGAINVILLEA */}
        <g id="bougainvillea-flowers">
          <path d="M 12 22 Q 24 18 36 23" fill="none" stroke="#166534" strokeWidth="0.8" />
          <path d="M 64 22 Q 76 17 88 21" fill="none" stroke="#166534" strokeWidth="0.8" />
          
          {/* Left Floral Spray */}
          <g fill="#ec4899" stroke="#9d174d" strokeWidth="0.4">
            <ellipse cx="18" cy="22" rx="2.2" ry="1.4" transform="rotate(-20 18 22)" />
            <ellipse cx="21" cy="20" rx="2.2" ry="1.4" transform="rotate(40 21 20)" fill="#db2777" />
            <ellipse cx="20" cy="23" rx="2" ry="1.3" transform="rotate(80 20 23)" fill="#f43f5e" />
            <circle cx="20" cy="21.5" r="0.6" fill="#fef08a" />
          </g>
          <g fill="#f43f5e" stroke="#be123c" strokeWidth="0.4">
            <ellipse cx="26" cy="21" rx="2.4" ry="1.5" transform="rotate(-15 26 21)" />
            <ellipse cx="29" cy="19" rx="2.2" ry="1.4" transform="rotate(50 29 19)" fill="#ec4899" />
            <ellipse cx="28" cy="23" rx="2.1" ry="1.3" transform="rotate(95 28 23)" fill="#e11d48" />
            <circle cx="27.5" cy="21" r="0.6" fill="#fef08a" />
          </g>
          <g fill="#db2777" stroke="#9d174d" strokeWidth="0.4">
            <ellipse cx="34" cy="23" rx="2.2" ry="1.4" transform="rotate(-30 34 23)" />
            <ellipse cx="36" cy="21" rx="2" ry="1.3" transform="rotate(30 36 21)" fill="#f43f5e" />
            <circle cx="35" cy="22.5" r="0.5" fill="#fef08a" />
          </g>

          {/* Right Floral Spray */}
          <g fill="#db2777" stroke="#9d174d" strokeWidth="0.4">
            <ellipse cx="66" cy="23" rx="2.2" ry="1.4" transform="rotate(20 66 23)" />
            <ellipse cx="64" cy="21" rx="2" ry="1.3" transform="rotate(-40 64 21)" fill="#f43f5e" />
            <circle cx="65" cy="22" r="0.5" fill="#fef08a" />
          </g>
          <g fill="#ec4899" stroke="#9d174d" strokeWidth="0.4">
            <ellipse cx="73" cy="20" rx="2.4" ry="1.5" transform="rotate(-20 73 20)" />
            <ellipse cx="76" cy="18" rx="2.2" ry="1.4" transform="rotate(40 76 18)" fill="#db2777" />
            <ellipse cx="75" cy="22" rx="2.1" ry="1.3" transform="rotate(80 75 22)" fill="#f43f5e" />
            <circle cx="74.5" cy="20" r="0.6" fill="#fef08a" />
          </g>
          <g fill="#f43f5e" stroke="#be123c" strokeWidth="0.4">
            <ellipse cx="82" cy="22" rx="2.3" ry="1.4" transform="rotate(10 82 22)" />
            <ellipse cx="84" cy="20" rx="2.1" ry="1.3" transform="rotate(-45 84 20)" fill="#ec4899" />
            <circle cx="83" cy="21" r="0.5" fill="#fef08a" />
          </g>
        </g>

        {/* 3. SARDINE CAPITAL OF THE PHILIPPINES */}
        <g id="ocean-waves">
          <path d="M 11 52 Q 25 46 40 51 Q 55 56 70 50 Q 80 46 89 50 L 89 109 L 11 109 Z" fill="#0284c7" />
          <path d="M 11 68 Q 30 62 50 67 Q 70 72 89 66 L 89 109 L 11 109 Z" fill="#0369a1" />
          <path d="M 11 86 Q 30 82 50 86 Q 70 90 89 84 L 89 109 L 11 109 Z" fill="#0c4a6e" />

          <path d="M 11 52 Q 25 46 40 51 Q 55 56 70 50 Q 80 46 89 50" fill="none" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 11 68 Q 30 62 50 67 Q 70 72 89 66" fill="none" stroke="#38bdf8" strokeWidth="0.9" />
        </g>

        {/* SLEEK LEAPING SARDINES (TAMBAN) */}
        {/* Sardine 1 */}
        <g id="sardine-1" transform="translate(18, 56) rotate(-14)">
          <ellipse cx="20" cy="5" rx="18" ry="4.5" fill="#075985" opacity="0.3" />
          
          <path
            d="M 0 5 C 6 1, 18 1, 30 3 C 34 4, 37 5, 40 5 C 37 6, 34 7, 30 7.5 C 18 9.5, 6 9, 0 5 Z"
            fill="#f1f5f9"
            stroke="#0f172a"
            strokeWidth="0.8"
          />

          <path d="M 0 5 C 6 1, 18 1, 30 3 C 35 4, 38 4.8 40 5 C 35 3, 20 2.5, 5 4.5 Z" fill="#0284c7" />
          <path d="M 3 5 C 12 3, 24 3, 32 4" stroke="#38bdf8" strokeWidth="0.5" fill="none" />

          <path d="M 8 5.2 Q 20 5 34 5.8" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1.5 0.8" />

          <path d="M 8 2.5 C 10 4, 10 6.5, 8 8" fill="none" stroke="#475569" strokeWidth="0.6" />
          <circle cx="5" cy="4.8" r="1.4" fill="#facc15" stroke="#0f172a" strokeWidth="0.5" />
          <circle cx="5" cy="4.8" r="0.8" fill="#0f172a" />
          <circle cx="4.6" cy="4.4" r="0.3" fill="#ffffff" />

          <polygon points="17,1.8 22,0 23,2.5" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
          <polygon points="9,6 13,8 10,7.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.5" />
          <polygon points="20,8.5 23,10.5 22,8.8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
          <polygon points="39,5 46,0.5 43,5 46,9.5 39,5" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.6" />
        </g>

        {/* Sardine 2 */}
        <g id="sardine-2" transform="translate(14, 80) rotate(10)">
          <path
            d="M 0 4 C 5 1, 15 1, 25 2.5 C 29 3.5, 31 4, 34 4 C 31 5, 29 6, 25 6.5 C 15 8, 5 7.5, 0 4 Z"
            fill="#f8fafc"
            stroke="#0f172a"
            strokeWidth="0.7"
          />
          <path d="M 0 4 C 5 1, 15 1, 25 2.5 C 29 3.5, 34 4, 4 3.5 Z" fill="#0369a1" />
          <circle cx="4" cy="3.8" r="1.2" fill="#facc15" stroke="#0f172a" strokeWidth="0.4" />
          <circle cx="4" cy="3.8" r="0.6" fill="#0f172a" />
          <path d="M 6.5 2 C 8 3.2, 8 5, 6.5 6" fill="none" stroke="#475569" strokeWidth="0.5" />
          <polygon points="33,4 39,0.5 36.5,4 39,7.5 33,4" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.5" />
        </g>

        {/* Sardine 3 */}
        <g id="sardine-3" transform="translate(48, 90) rotate(-6)">
          <path
            d="M 0 4 C 5 1, 15 1, 25 2.5 C 29 3.5, 31 4, 34 4 C 31 5, 29 6, 25 6.5 C 15 8, 5 7.5, 0 4 Z"
            fill="#f8fafc"
            stroke="#0f172a"
            strokeWidth="0.7"
          />
          <path d="M 0 4 C 5 1, 15 1, 25 2.5 C 29 3.5, 34 4, 4 3.5 Z" fill="#0284c7" />
          <circle cx="4" cy="3.8" r="1.2" fill="#facc15" stroke="#0f172a" strokeWidth="0.4" />
          <circle cx="4" cy="3.8" r="0.6" fill="#0f172a" />
          <polygon points="33,4 39,0.5 36.5,4 39,7.5 33,4" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.5" />
        </g>

        {/* Water Splashes / Bubbles */}
        <g fill="#ffffff" opacity="0.8">
          <circle cx="16" cy="60" r="0.9" /><circle cx="20" cy="57" r="0.6" />
          <circle cx="58" cy="60" r="0.8" /><circle cx="62" cy="63" r="0.5" />
          <circle cx="42" cy="84" r="0.7" />
        </g>
      </svg>
    ),
  },
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