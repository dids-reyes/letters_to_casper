import {
  PHILIPPINE_CITY_REGISTRY,
  getCityStampData,
  isInternationalLocation,
  getPhilippineIslandGroup,
  isIndonesiaLocation,
  getDedicatedCountryCode,
} from "./philippineCities";

describe("philippineCities registry and lookup", () => {
  test("contains comprehensive catalog of Philippine cities and international additions", () => {
    const keys = Object.keys(PHILIPPINE_CITY_REGISTRY);
    expect(keys.length).toBeGreaterThanOrEqual(161);
  });

  test("retrieves Baguio City stamp with pines motif", () => {
    const data = getCityStampData("Baguio City");
    expect(data).not.toBeNull();
    expect(data.canonicalName).toBe("Baguio");
    expect(data.displayName).toBe("BAGUIO");
    expect(data.motif).toBe("pines");
  });

  test("retrieves Cebu City stamp with magellan_cross motif", () => {
    const data = getCityStampData("Cebu City");
    expect(data).not.toBeNull();
    expect(data.displayName).toBe("CEBU");
    expect(data.motif).toBe("magellan_cross");
  });

  test("retrieves Davao City stamp with philippine_eagle motif", () => {
    const data = getCityStampData("Davao City");
    expect(data).not.toBeNull();
    expect(data.displayName).toBe("DAVAO");
    expect(data.motif).toBe("eagle");
  });

  test("retrieves Vigan stamp with crisologo motif", () => {
    const data = getCityStampData("Vigan");
    expect(data).not.toBeNull();
    expect(data.canonicalName).toBe("Vigan");
    expect(data.displayName).toBe("VIGAN");
    expect(data.motif).toBe("crisologo");
  });

  test("retrieves Legazpi stamp with mayon motif", () => {
    const data = getCityStampData("Legazpi City");
    expect(data).not.toBeNull();
    expect(data.displayName).toBe("LEGAZPI");
    expect(data.motif).toBe("mayon");
  });

  test("handles accented letters like Biñan and Parañaque", () => {
    const binan = getCityStampData("Biñan");
    expect(binan).not.toBeNull();
    expect(binan.canonicalName).toBe("Biñan");

    const paranaque = getCityStampData("Parañaque City");
    expect(paranaque).not.toBeNull();
    expect(paranaque.canonicalName).toBe("Parañaque");
  });

  test("handles common abbreviations and aliases like QC and GenSan", () => {
    const qc = getCityStampData("QC");
    expect(qc).not.toBeNull();
    expect(qc.canonicalName).toBe("Quezon City");

    const gensan = getCityStampData("GenSan");
    expect(gensan).not.toBeNull();
    expect(gensan.canonicalName).toBe("General Santos");
    expect(gensan.motif).toBe("tuna");
  });

  test("returns null safely for unknown international cities", () => {
    expect(getCityStampData("Tokyo")).toBeNull();
    expect(getCityStampData("London")).toBeNull();
    expect(getCityStampData("")).toBeNull();
    expect(getCityStampData(null)).toBeNull();
  });

  test("retrieves Bunawan, Caraga stamp with bunawan_lolong_crocodile motif", () => {
    const data = getCityStampData("Bunawan, Caraga");
    expect(data).not.toBeNull();
    expect(data.canonicalName).toBe("Bunawan");
    expect(data.displayName).toBe("BUNAWAN");
    expect(data.motif).toBe("bunawan_lolong_crocodile");
  });

  test("retrieves active illustrated international city stamps correctly", () => {
    expect(getCityStampData("Jakarta, Indonesia")?.motif).toBe("jakarta_monas");
    expect(getCityStampData("Bandung, Indonesia")?.motif).toBe("bandung_gedung_sate");
    expect(getCityStampData("Singapore, Singapore")?.motif).toBe("singapore_merlion");
    expect(getCityStampData("Surabaya, Indonesia")?.motif).toBe("surabaya_shark_crocodile");
    expect(getCityStampData("Palembang, Indonesia")?.motif).toBe("palembang_ampera_bridge");
    expect(getCityStampData("Toronto, Canada")?.motif).toBe("toronto_cn_tower");
    expect(getCityStampData("Semarang, Indonesia")?.motif).toBe("semarang_lawang_sewu");
    expect(getCityStampData("Kuching, Malaysia")?.motif).toBe("kuching_cat_monument");
    expect(getCityStampData("Purwokerto, Indonesia")?.motif).toBe("purwokerto_slamet_waterfall");
  });

  test("routes deleted SVG international cities to their country or international fallbacks", () => {
    // Removed SVG cities should no longer have dedicated city stamps
    const removedCities = [
      "Dubai, United Arab Emirates",
      "Kota Kinabalu, Malaysia",
      "Takokak, Indonesia",
      "Petaling Jaya, Malaysia",
      "Medan, Indonesia",
      "Makassar, Indonesia",
      "Kuala Lumpur, Malaysia",
      "Depok, Indonesia",
      "Bekasi, Indonesia",
      "Auckland, New Zealand",
      "Madrid, Spain",
    ];
    removedCities.forEach((city) => {
      expect(getCityStampData(city)).toBeNull();
    });

    // UAE fallback
    expect(getDedicatedCountryCode("Dubai", "", "United Arab Emirates")).toBe("united_arab_emirates");

    // Indonesia fallback
    expect(getDedicatedCountryCode("Takokak", "", "Indonesia")).toBe("indonesia");
    expect(getDedicatedCountryCode("Medan", "", "Indonesia")).toBe("indonesia");
    expect(getDedicatedCountryCode("Makassar", "", "Indonesia")).toBe("indonesia");
    expect(getDedicatedCountryCode("Depok", "", "Indonesia")).toBe("indonesia");
    expect(getDedicatedCountryCode("Bekasi", "", "Indonesia")).toBe("indonesia");

    // Malaysia fallback
    expect(getDedicatedCountryCode("Kota Kinabalu", "Sabah", "Malaysia")).toBe("malaysia");
    expect(getDedicatedCountryCode("Petaling Jaya", "Selangor", "Malaysia")).toBe("malaysia");
    expect(getDedicatedCountryCode("Kuala Lumpur", "", "Malaysia")).toBe("malaysia");
    expect(getDedicatedCountryCode("PJ", "", "Malaysia")).toBe("malaysia");
    expect(getDedicatedCountryCode("KL", "", "Malaysia")).toBe("malaysia");

    // New Zealand fallback
    expect(getDedicatedCountryCode("Auckland", "", "New Zealand")).toBe("new_zealand");

    // Madrid generic international fallback
    expect(isInternationalLocation("Madrid", "", "Spain")).toBe(true);
    expect(getDedicatedCountryCode("Madrid", "", "Spain")).toBeNull();
  });

  test("identifies international locations correctly with isInternationalLocation", () => {
    // International cities
    expect(isInternationalLocation("London")).toBe(true);
    expect(isInternationalLocation("Tokyo")).toBe(true);
    expect(isInternationalLocation("Paris, France")).toBe(true);
    expect(isInternationalLocation("Sydney, Australia")).toBe(true);
    expect(isInternationalLocation("Jakarta, Indonesia")).toBe(true);
    expect(isInternationalLocation("Singapore")).toBe(true);
    expect(isInternationalLocation("Dubai, United Arab Emirates")).toBe(true);

    // International country codes or names
    expect(isInternationalLocation("", "US")).toBe(true);
    expect(isInternationalLocation("", "United States")).toBe(true);
    expect(isInternationalLocation("", "Australia")).toBe(true);
    expect(isInternationalLocation("", "Germany")).toBe(true);
    expect(isInternationalLocation("", "Canada")).toBe(true);

    // Foreign locations without country code but with foreign city/region
    expect(isInternationalLocation("Ambon", "", "Maluku")).toBe(true);
    expect(isInternationalLocation("Melbourne", "", "Victoria")).toBe(true);
    expect(isInternationalLocation("Pelabuhanratu", "", "West Java")).toBe(true);
    expect(isInternationalLocation("Yogyakarta", "", "Yogyakarta")).toBe(true);
    expect(isInternationalLocation("Bengkulu", "", "Bengkulu")).toBe(true);

    // Domestic locations
    expect(isInternationalLocation("Baguio City", "PH")).toBe(false);
    expect(isInternationalLocation("Cebu City", "Philippines")).toBe(false);
    expect(isInternationalLocation("Manila")).toBe(false);
    expect(isInternationalLocation("Bunawan, Caraga")).toBe(false);
    expect(isInternationalLocation("San Ildefonso", "", "Bulacan")).toBe(false);
    expect(isInternationalLocation("Panglao", "", "Bohol")).toBe(false);
    expect(isInternationalLocation("La Trinidad", "", "Benguet")).toBe(false);
    expect(isInternationalLocation("")).toBe(false);
    expect(isInternationalLocation(null, null)).toBe(false);
  });

  test("accurately determines Indonesian locations with isIndonesiaLocation", () => {
    // Explicit country
    expect(isIndonesiaLocation("", "", "Indonesia")).toBe(true);
    expect(isIndonesiaLocation("", "", "ID")).toBe(true);
    expect(isIndonesiaLocation("", "", "IDN")).toBe(true);
    expect(isIndonesiaLocation("", "Indonesia", "")).toBe(true);
    expect(isIndonesiaLocation("Indonesia", "", "")).toBe(true);

    // Indonesian cities & regions
    expect(isIndonesiaLocation("Ambon", "Maluku")).toBe(true);
    expect(isIndonesiaLocation("Pelabuhanratu", "West Java")).toBe(true);
    expect(isIndonesiaLocation("Denpasar", "Bali")).toBe(true);
    expect(isIndonesiaLocation("Yogyakarta")).toBe(true);
    expect(isIndonesiaLocation("Jakarta")).toBe(true);
    expect(isIndonesiaLocation("Bandung")).toBe(true);
    expect(isIndonesiaLocation("Surabaya")).toBe(true);
    expect(isIndonesiaLocation("Batam", "Riau Islands")).toBe(true);
    expect(isIndonesiaLocation("Samarinda", "East Kalimantan")).toBe(true);
    expect(isIndonesiaLocation("Jayapura", "Papua")).toBe(true);

    // Non-Indonesian international locations
    expect(isIndonesiaLocation("London", "", "UK")).toBe(false);
    expect(isIndonesiaLocation("Tokyo", "", "Japan")).toBe(false);
    expect(isIndonesiaLocation("Melbourne", "Victoria", "Australia")).toBe(false);
    expect(isIndonesiaLocation("Kuala Lumpur", "", "Malaysia")).toBe(false);
    expect(isIndonesiaLocation("Singapore", "", "Singapore")).toBe(false);

    // Domestic Philippine locations
    expect(isIndonesiaLocation("Manila", "", "Philippines")).toBe(false);
    expect(isIndonesiaLocation("Baguio City", "Cordillera")).toBe(false);
    expect(isIndonesiaLocation("Cebu City", "Central Visayas")).toBe(false);
    expect(isIndonesiaLocation("Davao City", "Davao Region")).toBe(false);
    expect(isIndonesiaLocation("")).toBe(false);
    expect(isIndonesiaLocation(null, null, null)).toBe(false);
  });

  test("accurately determines Philippine Island Group (Luzon, Visayas, Mindanao)", () => {
    // Luzon locations
    expect(getPhilippineIslandGroup("San Ildefonso", "Central Luzon")).toBe("luzon");
    expect(getPhilippineIslandGroup("Balatero", "Mimaropa")).toBe("luzon");
    expect(getPhilippineIslandGroup("Los Baños", "Calabarzon")).toBe("luzon");
    expect(getPhilippineIslandGroup("Indang", "Calabarzon")).toBe("luzon");
    expect(getPhilippineIslandGroup("San Pascual", "Calabarzon")).toBe("luzon");
    expect(getPhilippineIslandGroup("Talavera", "Central Luzon")).toBe("luzon");
    expect(getPhilippineIslandGroup("La Trinidad", "Benguet")).toBe("luzon");
    expect(getPhilippineIslandGroup("Naga", "Camarines Sur")).toBe("luzon");
    expect(getPhilippineIslandGroup("UnknownTown", "NCR")).toBe("luzon");
    expect(getPhilippineIslandGroup("UnknownTown", "Ilocos Region")).toBe("luzon");
    expect(getPhilippineIslandGroup("UnknownTown", "Cagayan Valley")).toBe("luzon");
    expect(getPhilippineIslandGroup("UnknownTown", "Bicol")).toBe("luzon");

    // Visayas locations
    expect(getPhilippineIslandGroup("Panglao", "Central Visayas")).toBe("visayas");
    expect(getPhilippineIslandGroup("Boracay", "Western Visayas")).toBe("visayas");
    expect(getPhilippineIslandGroup("Kalibo", "Aklan")).toBe("visayas");
    expect(getPhilippineIslandGroup("Palo", "Leyte")).toBe("visayas");
    expect(getPhilippineIslandGroup("UnknownTown", "Eastern Visayas")).toBe("visayas");
    expect(getPhilippineIslandGroup("Dumaguete", "Negros Oriental")).toBe("visayas");

    // Mindanao locations
    expect(getPhilippineIslandGroup("Mabini", "Davao Region")).toBe("mindanao");
    expect(getPhilippineIslandGroup("Magugpo Poblacion", "Davao Region")).toBe("mindanao");
    expect(getPhilippineIslandGroup("Magpet", "Soccsksargen")).toBe("mindanao");
    expect(getPhilippineIslandGroup("Siargao", "Caraga")).toBe("mindanao");
    expect(getPhilippineIslandGroup("Marawi", "BARMM")).toBe("mindanao");
    expect(getPhilippineIslandGroup("UnknownTown", "Northern Mindanao")).toBe("mindanao");
    expect(getPhilippineIslandGroup("UnknownTown", "Zamboanga Peninsula")).toBe("mindanao");

    // Default to Luzon for generic Philippines with country="PH"
    expect(getPhilippineIslandGroup("UnknownBarangay", "", "PH")).toBe("luzon");
    expect(getPhilippineIslandGroup("Philippines")).toBe("luzon");

    // International locations return null
    expect(getPhilippineIslandGroup("Ambon", "Maluku")).toBeNull();
    expect(getPhilippineIslandGroup("Melbourne", "Victoria")).toBeNull();
    expect(getPhilippineIslandGroup("Pelabuhanratu", "West Java")).toBeNull();
    expect(getPhilippineIslandGroup("London")).toBeNull();
    expect(getPhilippineIslandGroup("Tokyo")).toBeNull();
    expect(getPhilippineIslandGroup("", "", "US")).toBeNull();

    // Unknown string without any region or Philippine indicator returns null
    expect(getPhilippineIslandGroup("UnknownBarangay")).toBeNull();
    expect(getPhilippineIslandGroup("")).toBeNull();
  });

  test("accurately determines dedicated country fallback code with getDedicatedCountryCode", () => {
    // 1. USA (Country, State name, or State 2-letter abbreviation)
    expect(getDedicatedCountryCode("", "", "US")).toBe("usa");
    expect(getDedicatedCountryCode("", "", "USA")).toBe("usa");
    expect(getDedicatedCountryCode("", "", "United States")).toBe("usa");
    expect(getDedicatedCountryCode("San Francisco", "California", "")).toBe("usa");
    expect(getDedicatedCountryCode("Austin", "TX", "")).toBe("usa");
    expect(getDedicatedCountryCode("New York City", "NY", "")).toBe("usa");
    expect(getDedicatedCountryCode("Miami, Florida")).toBe("usa");

    // 2. Canada (Country, Province name, or Province 2-letter abbreviation)
    expect(getDedicatedCountryCode("", "", "Canada")).toBe("canada");
    expect(getDedicatedCountryCode("", "", "CAN")).toBe("canada");
    expect(getDedicatedCountryCode("Toronto", "Ontario", "")).toBe("canada");
    expect(getDedicatedCountryCode("Vancouver", "BC", "")).toBe("canada");
    expect(getDedicatedCountryCode("Montreal", "Quebec", "")).toBe("canada");

    // 3. United Arab Emirates
    expect(getDedicatedCountryCode("", "", "United Arab Emirates")).toBe("united_arab_emirates");
    expect(getDedicatedCountryCode("", "", "UAE")).toBe("united_arab_emirates");
    expect(getDedicatedCountryCode("Sharjah", "Sharjah", "")).toBe("united_arab_emirates");
    expect(getDedicatedCountryCode("Dubai", "Dubai", "")).toBe("united_arab_emirates");

    // 4. Singapore
    expect(getDedicatedCountryCode("", "", "Singapore")).toBe("singapore");
    expect(getDedicatedCountryCode("", "", "SG")).toBe("singapore");
    expect(getDedicatedCountryCode("Singapore")).toBe("singapore");

    // 5. Malaysia
    expect(getDedicatedCountryCode("", "", "Malaysia")).toBe("malaysia");
    expect(getDedicatedCountryCode("", "", "MY")).toBe("malaysia");
    expect(getDedicatedCountryCode("George Town", "Penang", "")).toBe("malaysia");
    expect(getDedicatedCountryCode("Petaling Jaya", "Selangor", "")).toBe("malaysia");

    // 6. Indonesia
    expect(getDedicatedCountryCode("", "", "Indonesia")).toBe("indonesia");
    expect(getDedicatedCountryCode("", "", "ID")).toBe("indonesia");
    expect(getDedicatedCountryCode("Denpasar", "Bali", "")).toBe("indonesia");
    expect(getDedicatedCountryCode("Surabaya", "East Java", "")).toBe("indonesia");

    // 7. New Zealand
    expect(getDedicatedCountryCode("", "", "New Zealand")).toBe("new_zealand");
    expect(getDedicatedCountryCode("", "", "NZ")).toBe("new_zealand");
    expect(getDedicatedCountryCode("Christchurch", "Canterbury", "")).toBe("new_zealand");
    expect(getDedicatedCountryCode("Wellington", "Wellington", "")).toBe("new_zealand");

    // Domestic locations return null (never trigger international country fallback)
    expect(getDedicatedCountryCode("Manila")).toBeNull();
    expect(getDedicatedCountryCode("Cebu City", "", "PH")).toBeNull();
    expect(getDedicatedCountryCode("Davao City", "", "Philippines")).toBeNull();

    // Other unmapped foreign countries return null
    expect(getDedicatedCountryCode("Berlin", "", "Germany")).toBeNull();
    expect(getDedicatedCountryCode("Tokyo", "", "Japan")).toBeNull();
    expect(getDedicatedCountryCode("Paris", "", "France")).toBeNull();
  });
});

