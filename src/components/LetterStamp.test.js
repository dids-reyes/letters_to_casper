import React from "react";
import { render, screen } from "@testing-library/react";
import LetterStamp, {
  LetterStamp as NamedLetterStamp,
  RedPushpin,
  WashiTape,
  getStampBorderColor,
} from "./LetterStamp";

describe("LetterStamp Component", () => {
  test("exports all required named and default components", () => {
    expect(LetterStamp).toBeDefined();
    expect(NamedLetterStamp).toBe(LetterStamp);
    expect(RedPushpin).toBeDefined();
    expect(WashiTape).toBeDefined();
  });

  test("renders default archetype stamp with Jeepney artwork and no text labels, without postmark waves or Mayon variant 0", () => {
    const { container } = render(<LetterStamp variant={0} />);
    expect(screen.queryByText("MAYON")).not.toBeInTheDocument();
    expect(screen.queryByText("JEEPNEY")).not.toBeInTheDocument();
    expect(screen.queryByText(/PILIPINAS/i)).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp")).toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-1")).toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-0")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__postmark-waves")).not.toBeInTheDocument();
  });

  test("renders Baguio city stamp motif with hidden top/bottom labels", () => {
    const { container } = render(<LetterStamp city="Baguio City" />);
    expect(screen.queryByText("BAGUIO")).not.toBeInTheDocument();
    expect(screen.queryByText(/SUMMER CAPITAL/i)).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Baguio");
    expect(container.querySelector(".letter-card__postmark-waves")).not.toBeInTheDocument();
  });

  test("renders Cebu City stamp motif with Magellan Cross artwork", () => {
    const { container } = render(<LetterStamp city="Cebu City" />);
    expect(screen.queryByText("CEBU")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Cebu City");
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "magellan_cross");
  });

  test("renders Davao stamp motif with Eagle & Durian artwork", () => {
    const { container } = render(<LetterStamp city="Davao City" />);
    expect(screen.queryByText("DAVAO")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Davao City");
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "eagle");
  });

  test("renders Vigan stamp motif with Kalesa artwork", () => {
    const { container } = render(<LetterStamp city="Vigan" />);
    expect(screen.queryByText("VIGAN")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Vigan");
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "crisologo");
  });

  test("renders General Santos stamp motif with Tuna artwork", () => {
    const { container } = render(<LetterStamp city="General Santos" />);
    expect(screen.queryByText("GEN. SANTOS")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "General Santos");
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "tuna");
  });

  test("renders Bohol stamp motif with Chocolate Hills artwork", () => {
    const { container } = render(<LetterStamp city="Bohol" />);
    expect(screen.queryByText("BOHOL")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Tagbilaran");
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "tagbilaran_sandugo");
  });

  test("renders Bunawan stamp with Bunawan Lolong crocodile motif instead of generic Jeepney", () => {
    const { container } = render(<LetterStamp city="Bunawan, Caraga" />);
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Bunawan");
    expect(container.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "bunawan_lolong_crocodile");
    expect(screen.queryByText("JEEPNEY")).not.toBeInTheDocument();
    expect(screen.queryByText("BUNAWAN")).not.toBeInTheDocument();
  });

  test("renders dedicated stamps for mapped international cities", () => {
    const { container: jakartaContainer } = render(<LetterStamp city="Jakarta, Indonesia" />);
    expect(jakartaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Jakarta");
    expect(jakartaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "jakarta_monas");

    const { container: sgContainer } = render(<LetterStamp city="Singapore, Singapore" />);
    expect(sgContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Singapore");
    expect(sgContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "singapore_merlion");

    const { container: dubaiContainer } = render(<LetterStamp city="Dubai, United Arab Emirates" />);
    expect(dubaiContainer.querySelector(".letter-card__stamp-wrapper--country-uae")).toBeInTheDocument();
    expect(dubaiContainer.querySelector(".letter-card__main-stamp--country-uae")).toHaveAttribute("data-motif", "uae_national");

    const { container: torontoContainer } = render(<LetterStamp city="Toronto, Canada" />);
    expect(torontoContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Toronto");
    expect(torontoContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "toronto_cn_tower");

    const { container: kkContainer } = render(<LetterStamp city="Kota Kinabalu, Malaysia" />);
    expect(kkContainer.querySelector(".letter-card__stamp-wrapper--country-malaysia")).toBeInTheDocument();
    expect(kkContainer.querySelector(".letter-card__main-stamp--country-malaysia")).toHaveAttribute("data-motif", "malaysia_national");

    // Madrid was removed from SVG stamps and routes to global international fallback
    const { container: madridContainer } = render(<LetterStamp city="Madrid, Spain" />);
    expect(madridContainer.querySelector(".letter-card__stamp-wrapper--international")).toBeInTheDocument();
    expect(madridContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");
  });

  test("renders global international stamp for generic unmapped international locations", () => {
    // Unmapped foreign cities
    const { container: londonContainer } = render(<LetterStamp variant={1} city="London" />);
    expect(londonContainer.querySelector(".letter-card__stamp-wrapper--international")).toBeInTheDocument();
    expect(londonContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");

    const { container: tokyoContainer } = render(<LetterStamp city="Tokyo" />);
    expect(tokyoContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");

    const { container: parisContainer } = render(<LetterStamp city="Paris, France" />);
    expect(parisContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");

    // Location with international country prop (unmapped country without dedicated fallback, e.g. Germany)
    const { container: deContainer } = render(<LetterStamp country="DE" />);
    expect(deContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");

    // Foreign location outside mapped countries
    const { container: melbourneContainer } = render(<LetterStamp variant={2} city="Melbourne" region="Victoria" />);
    expect(melbourneContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");
    expect(melbourneContainer.querySelector(".letter-card__stamp-wrapper--variant-2")).not.toBeInTheDocument();
  });

  test("renders Indonesia country stamp for unmapped Indonesian locations and country default", () => {
    // Unmapped Indonesian city with region (e.g. Ambon in Maluku)
    const { container: ambonContainer } = render(<LetterStamp variant={2} city="Ambon" region="Maluku" />);
    expect(ambonContainer.querySelector(".letter-card__stamp-wrapper--country-indonesia")).toBeInTheDocument();
    expect(ambonContainer.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-motif", "indonesia_national");
    expect(ambonContainer.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-country", "Indonesia");
    expect(ambonContainer.querySelector(".letter-card__stamp-wrapper--variant-2")).not.toBeInTheDocument();

    // Pelabuhanratu in West Java
    const { container: pelabuhanratuContainer } = render(<LetterStamp variant={2} city="Pelabuhanratu" region="West Java" />);
    expect(pelabuhanratuContainer.querySelector(".letter-card__stamp-wrapper--country-indonesia")).toBeInTheDocument();
    expect(pelabuhanratuContainer.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-motif", "indonesia_national");

    // Location with country="Indonesia" or "ID" without landmark
    const { container: idContainer } = render(<LetterStamp country="Indonesia" />);
    expect(idContainer.querySelector(".letter-card__stamp-wrapper--country-indonesia")).toBeInTheDocument();
    expect(idContainer.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-motif", "indonesia_national");

    // Bali
    const { container: baliContainer } = render(<LetterStamp city="Bali" />);
    expect(baliContainer.querySelector(".letter-card__stamp-wrapper--country-indonesia")).toBeInTheDocument();
    expect(baliContainer.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-motif", "indonesia_national");

    // Indonesian city with its own landmark stamp (e.g. Jakarta) still gets its city stamp
    const { container: jakartaContainer } = render(<LetterStamp city="Jakarta" />);
    expect(jakartaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "jakarta_monas");
    expect(jakartaContainer.querySelector(".letter-card__stamp-wrapper--country-indonesia")).not.toBeInTheDocument();
  });

  test("falls back cleanly to default domestic archetype variant for unknown domestic location", () => {
    const { container } = render(<LetterStamp variant={1} city="UnknownBarangay" />);
    expect(screen.queryByText("JEEPNEY")).not.toBeInTheDocument();
    expect(screen.queryByText(/PILIPINAS/i)).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-1")).toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp")).toBeInTheDocument();
  });

  test("renders the featured star stamp ONLY when isFeatured is true", () => {
    const { container: featuredContainer } = render(<LetterStamp isFeatured={true} />);
    expect(featuredContainer.querySelector(".letter-card__stamp-wrapper--variant-3")).toBeInTheDocument();
    expect(featuredContainer.querySelector(".letter-card__main-stamp--featured-star")).toBeInTheDocument();

    // When isFeatured is false, variant 3 MUST NOT render the featured star stamp
    const { container: nonFeaturedContainer } = render(<LetterStamp variant={3} isFeatured={false} />);
    expect(nonFeaturedContainer.querySelector(".letter-card__stamp-wrapper--variant-3")).not.toBeInTheDocument();
    expect(nonFeaturedContainer.querySelector(".letter-card__main-stamp--featured-star")).not.toBeInTheDocument();
    // It should cleanly fall back to a domestic archetype (variant 1 Jeepney for 3 % 2)
    expect(nonFeaturedContainer.querySelector(".letter-card__stamp-wrapper--variant-1")).toBeInTheDocument();
  });

  test("does not use Kalesa for generic fallback stamps, dedicating Kalesa exclusively to Vigan City", () => {
    const { container } = render(<LetterStamp variant={2} isFeatured={false} />);
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-2")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-0")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-1")).toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--featured-star")).not.toBeInTheDocument();
    expect(screen.queryByText("KALESA")).not.toBeInTheDocument();

    // Vigan City dedicated Kalesa stamp
    const { container: viganContainer } = render(<LetterStamp city="Vigan" />);
    expect(viganContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "crisologo");

    // Baguio, Davao, Iloilo, Zamboanga dedicated stamps
    const { container: baguioContainer } = render(<LetterStamp city="Baguio" />);
    expect(baguioContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "pines");

    const { container: davaoContainer } = render(<LetterStamp city="Davao City" />);
    expect(davaoContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "eagle");

    const { container: iloiloContainer } = render(<LetterStamp city="Iloilo City" />);
    expect(iloiloContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "iloilo_dinagyang");

    const { container: antipoloContainer } = render(<LetterStamp city="Antipolo" />);
    expect(antipoloContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "antipolo_hinulugang_taktak");

    const { container: caloocanContainer } = render(<LetterStamp city="Caloocan" />);
    expect(caloocanContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "caloocan_bonifacio");

    const { container: cabanatuanContainer } = render(<LetterStamp city="Cabanatuan" />);
    expect(cabanatuanContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "cabanatuan_tricycle");

    const { container: calapanContainer } = render(<LetterStamp city="Calapan" />);
    expect(calapanContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "calapan_tamaraw");

    const { container: carmonaContainer } = render(<LetterStamp city="Carmona" />);
    expect(carmonaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "carmona_racing");

    const { container: legazpiContainer } = render(<LetterStamp city="Legazpi" />);
    expect(legazpiContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "mayon");
  });

  test("never renders any top/bottom text label or currency denomination", () => {
    render(<LetterStamp variant={0} />);
    render(<LetterStamp variant={1} />);
    render(<LetterStamp variant={2} />);
    render(<LetterStamp city="Manila" />);
    render(<LetterStamp city="Baguio" />);
    render(<LetterStamp city="Bunawan" />);
    render(<LetterStamp city="Jakarta" />);
    render(<LetterStamp city="London" />);
    expect(screen.queryByText(/₱/)).not.toBeInTheDocument();
    expect(screen.queryByText(/PILIPINAS/i)).not.toBeInTheDocument();
    expect(screen.queryByText("MANILA")).not.toBeInTheDocument();
    expect(screen.queryByText("BUNAWAN")).not.toBeInTheDocument();
    expect(screen.queryByText("JAKARTA")).not.toBeInTheDocument();
    expect(screen.queryByText("LONDON")).not.toBeInTheDocument();
  });

  test("renders the stamp scallop crinkle border with white inside and noticeable yellow outline stroke", () => {
    const { container: cityContainer } = render(<LetterStamp city="Manila" />);
    const cityScallop = cityContainer.querySelector(".letter-card__main-stamp path");
    expect(cityScallop).toHaveAttribute("fill", "#ffffff");
    expect(cityScallop).toHaveAttribute("stroke", "#eab308");

    const { container: fallbackContainer } = render(<LetterStamp variant={0} />);
    const fallbackScallop = fallbackContainer.querySelector(".letter-card__main-stamp path");
    expect(fallbackScallop).toHaveAttribute("fill", "#ffffff");
    expect(fallbackScallop).toHaveAttribute("stroke", "#eab308");

    const { container: intlContainer } = render(<LetterStamp city="London" />);
    const intlScallop = intlContainer.querySelector(".letter-card__main-stamp path");
    expect(intlScallop).toHaveAttribute("fill", "#ffffff");
    expect(intlScallop).toHaveAttribute("stroke", "#eab308");
  });

  test("renders generic Philippine island group map stamps (Luzon, Visayas, Mindanao) for domestic locations without dedicated city stamps", () => {
    // Luzon unmapped domestic location
    const { container: luzonContainer } = render(
      <LetterStamp variant={2} city="San Ildefonso" region="Central Luzon" />
    );
    expect(luzonContainer.querySelector(".letter-card__stamp-wrapper--ph-island")).toBeInTheDocument();
    expect(luzonContainer.querySelector(".letter-card__stamp-wrapper--luzon")).toBeInTheDocument();
    expect(luzonContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-motif",
      "ph_luzon_map"
    );
    expect(luzonContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-island-group",
      "luzon"
    );
    // Scallop styling on island stamp
    const luzonScallop = luzonContainer.querySelector(".letter-card__main-stamp path");
    expect(luzonScallop).toHaveAttribute("fill", "#ffffff");
    expect(luzonScallop).toHaveAttribute("stroke", "#eab308");

    // Visayas unmapped domestic location
    const { container: visayasContainer } = render(
      <LetterStamp variant={2} city="Panglao" region="Central Visayas" />
    );
    expect(visayasContainer.querySelector(".letter-card__stamp-wrapper--ph-island")).toBeInTheDocument();
    expect(visayasContainer.querySelector(".letter-card__stamp-wrapper--visayas")).toBeInTheDocument();
    expect(visayasContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-motif",
      "ph_visayas_map"
    );
    expect(visayasContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-island-group",
      "visayas"
    );

    // Mindanao unmapped domestic location
    const { container: mindanaoContainer } = render(
      <LetterStamp variant={2} city="Magpet" region="Soccsksargen" />
    );
    expect(mindanaoContainer.querySelector(".letter-card__stamp-wrapper--ph-island")).toBeInTheDocument();
    expect(mindanaoContainer.querySelector(".letter-card__stamp-wrapper--mindanao")).toBeInTheDocument();
    expect(mindanaoContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-motif",
      "ph_mindanao_map"
    );
    expect(mindanaoContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-island-group",
      "mindanao"
    );
  });

  test("renders redesigned stamp motifs for Manila, Muntinlupa, Quezon City, Alaminos, and General Trias", () => {
    // Manila - Intramuros Kalesa
    const { container: manilaContainer } = render(<LetterStamp city="Manila" />);
    expect(manilaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Manila");
    expect(manilaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "manila_intramuros");
    expect(manilaContainer.querySelector("image")).toHaveAttribute("href", "/stamps/manila_inner.webp");

    // Muntinlupa - Jamboree Lake
    const { container: muntinlupaContainer } = render(<LetterStamp city="Muntinlupa" />);
    expect(muntinlupaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Muntinlupa");
    expect(muntinlupaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "muntinlupa_lake");
    expect(muntinlupaContainer.querySelector("image")).toHaveAttribute("href", "/stamps/muntinlupa_lake_inner.png");

    // Quezon City - Quezon Memorial Shrine
    const { container: qcContainer } = render(<LetterStamp city="Quezon City" />);
    expect(qcContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Quezon City");
    expect(qcContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "qc_monument");
    expect(qcContainer.querySelector("image")).toHaveAttribute("href", "/stamps/quezon_city_inner.webp");

    // Alaminos - Pilgrimage Island & Hundred Islands
    const { container: alaminosContainer } = render(<LetterStamp city="Alaminos" />);
    expect(alaminosContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Alaminos");
    expect(alaminosContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "alaminos_hundred_islands");
    expect(alaminosContainer.querySelector("image")).toHaveAttribute("href", "/stamps/alaminos_inner.webp");

    // General Trias - First Cry of Cavite Uprising
    const { container: gentriasContainer } = render(<LetterStamp city="General Trias" />);
    expect(gentriasContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "General Trias");
    expect(gentriasContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-motif", "gentrias_tejeros");
    expect(gentriasContainer.querySelector("image")).toHaveAttribute("href", "/stamps/general_trias_inner.webp");
  });

  test("renders dedicated country fallback stamps for USA, Canada, UAE, Singapore, Malaysia, Indonesia, and New Zealand", () => {
    // 1. USA country fallbacks (by country, region/state name, and state 2-letter code)
    const { container: usaCountryContainer } = render(<LetterStamp country="USA" />);
    expect(usaCountryContainer.querySelector(".letter-card__stamp-wrapper--country-usa")).toBeInTheDocument();
    expect(usaCountryContainer.querySelector(".letter-card__main-stamp--country-usa")).toHaveAttribute("data-motif", "usa_national");
    expect(usaCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/usa.webp");

    const { container: usCodeContainer } = render(<LetterStamp country="US" />);
    expect(usCodeContainer.querySelector(".letter-card__main-stamp--country-usa")).toHaveAttribute("data-motif", "usa_national");

    const { container: californiaContainer } = render(<LetterStamp city="San Jose" region="California" />);
    expect(californiaContainer.querySelector(".letter-card__main-stamp--country-usa")).toHaveAttribute("data-motif", "usa_national");

    const { container: texasCodeContainer } = render(<LetterStamp city="Austin" region="TX" />);
    expect(texasCodeContainer.querySelector(".letter-card__main-stamp--country-usa")).toHaveAttribute("data-motif", "usa_national");

    // 2. Canada country fallbacks
    const { container: canadaCountryContainer } = render(<LetterStamp country="Canada" />);
    expect(canadaCountryContainer.querySelector(".letter-card__stamp-wrapper--country-canada")).toBeInTheDocument();
    expect(canadaCountryContainer.querySelector(".letter-card__main-stamp--country-canada")).toHaveAttribute("data-motif", "canada_national");
    expect(canadaCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/canada.webp");

    const { container: ontarioContainer } = render(<LetterStamp city="Ottawa" region="Ontario" />);
    expect(ontarioContainer.querySelector(".letter-card__main-stamp--country-canada")).toHaveAttribute("data-motif", "canada_national");

    const { container: bcContainer } = render(<LetterStamp city="Vancouver" region="BC" />);
    expect(bcContainer.querySelector(".letter-card__main-stamp--country-canada")).toHaveAttribute("data-motif", "canada_national");

    // 3. UAE country fallbacks
    const { container: uaeCountryContainer } = render(<LetterStamp country="United Arab Emirates" />);
    expect(uaeCountryContainer.querySelector(".letter-card__stamp-wrapper--country-uae")).toBeInTheDocument();
    expect(uaeCountryContainer.querySelector(".letter-card__main-stamp--country-uae")).toHaveAttribute("data-motif", "uae_national");
    expect(uaeCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/united_arab_emirates.webp");

    const { container: uaeCodeContainer } = render(<LetterStamp country="UAE" />);
    expect(uaeCodeContainer.querySelector(".letter-card__main-stamp--country-uae")).toHaveAttribute("data-motif", "uae_national");

    const { container: sharjahContainer } = render(<LetterStamp city="Sharjah" region="Sharjah" />);
    expect(sharjahContainer.querySelector(".letter-card__main-stamp--country-uae")).toHaveAttribute("data-motif", "uae_national");

    // 4. Singapore country fallback
    const { container: singaporeCountryContainer } = render(<LetterStamp country="Singapore" />);
    expect(singaporeCountryContainer.querySelector(".letter-card__stamp-wrapper--country-singapore")).toBeInTheDocument();
    expect(singaporeCountryContainer.querySelector(".letter-card__main-stamp--country-singapore")).toHaveAttribute("data-motif", "singapore_national");
    expect(singaporeCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/singapore.webp");

    // 5. Malaysia country fallback
    const { container: malaysiaCountryContainer } = render(<LetterStamp country="Malaysia" />);
    expect(malaysiaCountryContainer.querySelector(".letter-card__stamp-wrapper--country-malaysia")).toBeInTheDocument();
    expect(malaysiaCountryContainer.querySelector(".letter-card__main-stamp--country-malaysia")).toHaveAttribute("data-motif", "malaysia_national");
    expect(malaysiaCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/malaysia.webp");

    const { container: selangorContainer } = render(<LetterStamp city="Subang Jaya" region="Selangor" />);
    expect(selangorContainer.querySelector(".letter-card__main-stamp--country-malaysia")).toHaveAttribute("data-motif", "malaysia_national");

    // 6. New Zealand country fallback
    const { container: nzCountryContainer } = render(<LetterStamp country="New Zealand" />);
    expect(nzCountryContainer.querySelector(".letter-card__stamp-wrapper--country-new-zealand")).toBeInTheDocument();
    expect(nzCountryContainer.querySelector(".letter-card__main-stamp--country-new-zealand")).toHaveAttribute("data-motif", "new_zealand_national");
    expect(nzCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/new_zealand.webp");

    const { container: queenstownContainer } = render(<LetterStamp city="Queenstown" region="Otago" />);
    expect(queenstownContainer.querySelector(".letter-card__main-stamp--country-new-zealand")).toHaveAttribute("data-motif", "new_zealand_national");

    // 7. Indonesia country fallback
    const { container: indoCountryContainer } = render(<LetterStamp country="Indonesia" />);
    expect(indoCountryContainer.querySelector(".letter-card__stamp-wrapper--country-indonesia")).toBeInTheDocument();
    expect(indoCountryContainer.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-motif", "indonesia_national");
    expect(indoCountryContainer.querySelector("image")).toHaveAttribute("href", "/stamps/indonesia.webp");
  });

  test("renders newly illustrated Philippine cities and international city landmarks", () => {
    // San Jose del Monte
    const { container: sjdmContainer } = render(<LetterStamp city="San Jose del Monte" />);
    expect(sjdmContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "San Jose del Monte");
    expect(sjdmContainer.querySelector("image")).toHaveAttribute("href", "/stamps/san_jose_del_monte_inner.webp");

    // Mabalacat
    const { container: mabalacatContainer } = render(<LetterStamp city="Mabalacat" />);
    expect(mabalacatContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Mabalacat");
    expect(mabalacatContainer.querySelector("image")).toHaveAttribute("href", "/stamps/mabalacat_inner.webp");

    // Imus
    const { container: imusContainer } = render(<LetterStamp city="Imus" />);
    expect(imusContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Imus");
    expect(imusContainer.querySelector("image")).toHaveAttribute("href", "/stamps/imus_inner.webp");

    // San Pablo
    const { container: sanPabloContainer } = render(<LetterStamp city="San Pablo" />);
    expect(sanPabloContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "San Pablo");
    expect(sanPabloContainer.querySelector("image")).toHaveAttribute("href", "/stamps/san_pablo_inner.webp");

    // Iriga
    const { container: irigaContainer } = render(<LetterStamp city="Iriga" />);
    expect(irigaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Iriga");
    expect(irigaContainer.querySelector("image")).toHaveAttribute("href", "/stamps/iriga_inner.webp");

    // Tagbilaran
    const { container: tagbilaranContainer } = render(<LetterStamp city="Tagbilaran" />);
    expect(tagbilaranContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Tagbilaran");
    expect(tagbilaranContainer.querySelector("image")).toHaveAttribute("href", "/stamps/tagbilaran_inner.webp");

    // Jakarta
    const { container: jakartaContainer } = render(<LetterStamp city="Jakarta" />);
    expect(jakartaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Jakarta");
    expect(jakartaContainer.querySelector("image")).toHaveAttribute("href", "/stamps/jakarta_indonesia.webp");

    // Bandung
    const { container: bandungContainer } = render(<LetterStamp city="Bandung" />);
    expect(bandungContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Bandung");
    expect(bandungContainer.querySelector("image")).toHaveAttribute("href", "/stamps/bandung_indonesia.webp");

    // Singapore City
    const { container: sgContainer } = render(<LetterStamp city="Singapore" />);
    expect(sgContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Singapore");
    expect(sgContainer.querySelector("image")).toHaveAttribute("href", "/stamps/singapore.webp");

    // Kuching, Malaysia
    const { container: kuchingContainer } = render(<LetterStamp city="Kuching, Malaysia" />);
    expect(kuchingContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Kuching");
    expect(kuchingContainer.querySelector("image")).toHaveAttribute("href", "/stamps/kuching_malaysia.webp");

    // Palembang, Indonesia
    const { container: palembangContainer } = render(<LetterStamp city="Palembang, Indonesia" />);
    expect(palembangContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Palembang");
    expect(palembangContainer.querySelector("image")).toHaveAttribute("href", "/stamps/palembang_indonesia.webp");

    // Purwokerto, Indonesia
    const { container: purwokertoContainer } = render(<LetterStamp city="Purwokerto, Indonesia" />);
    expect(purwokertoContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Purwokerto");
    expect(purwokertoContainer.querySelector("image")).toHaveAttribute("href", "/stamps/purwokerto_indonesia.webp");

    // Semarang, Indonesia
    const { container: semarangContainer } = render(<LetterStamp city="Semarang, Indonesia" />);
    expect(semarangContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Semarang");
    expect(semarangContainer.querySelector("image")).toHaveAttribute("href", "/stamps/semarang_indonesia.webp");

    // Surabaya, Indonesia
    const { container: surabayaContainer } = render(<LetterStamp city="Surabaya, Indonesia" />);
    expect(surabayaContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Surabaya");
    expect(surabayaContainer.querySelector("image")).toHaveAttribute("href", "/stamps/surabaya_indonesia.webp");

    // Toronto, Canada
    const { container: torontoJpegContainer } = render(<LetterStamp city="Toronto, Canada" />);
    expect(torontoJpegContainer.querySelector(".letter-card__main-stamp--city")).toHaveAttribute("data-city", "Toronto");
    expect(torontoJpegContainer.querySelector("image")).toHaveAttribute("href", "/stamps/toronto_canada.webp");
  });

  test("routes deleted SVG international cities to their country or international fallbacks", () => {
    // Takokak, Medan, Makassar, Depok, Bekasi -> Indonesia fallback
    ["Takokak", "Medan", "Makassar", "Depok", "Bekasi"].forEach((city) => {
      const { container } = render(<LetterStamp city={city} country="Indonesia" />);
      expect(container.querySelector(".letter-card__stamp-wrapper--country-indonesia")).toBeInTheDocument();
      expect(container.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute("data-motif", "indonesia_national");
    });

    // Petaling Jaya, Kuala Lumpur -> Malaysia fallback
    ["Petaling Jaya", "Kuala Lumpur"].forEach((city) => {
      const { container } = render(<LetterStamp city={city} country="Malaysia" />);
      expect(container.querySelector(".letter-card__stamp-wrapper--country-malaysia")).toBeInTheDocument();
      expect(container.querySelector(".letter-card__main-stamp--country-malaysia")).toHaveAttribute("data-motif", "malaysia_national");
    });

    // Auckland -> New Zealand fallback
    const { container: aucklandContainer } = render(<LetterStamp city="Auckland" country="New Zealand" />);
    expect(aucklandContainer.querySelector(".letter-card__stamp-wrapper--country-new-zealand")).toBeInTheDocument();
    expect(aucklandContainer.querySelector(".letter-card__main-stamp--country-new-zealand")).toHaveAttribute("data-motif", "new_zealand_national");

    // Madrid -> Generic international fallback
    const { container: madridContainer } = render(<LetterStamp city="Madrid" country="Spain" />);
    expect(madridContainer.querySelector(".letter-card__stamp-wrapper--international")).toBeInTheDocument();
    expect(madridContainer.querySelector(".letter-card__main-stamp--international")).toHaveAttribute("data-motif", "global_international");
  });

  describe("Regional Philatelic Stamp Rectangle Border Colors", () => {
    test("uniformly sets Yellow (#eab308) border color for all locations", () => {
      // Luzon
      expect(getStampBorderColor("Manila")).toBe("#eab308");
      expect(getStampBorderColor("Baguio")).toBe("#eab308");
      expect(getStampBorderColor("Quezon City")).toBe("#eab308");
      expect(getStampBorderColor("San Ildefonso", "Central Luzon")).toBe("#eab308");
      expect(getStampBorderColor()).toBe("#eab308");

      // Visayas
      expect(getStampBorderColor("Cebu City")).toBe("#eab308");
      expect(getStampBorderColor("Iloilo City")).toBe("#eab308");
      expect(getStampBorderColor("Tagbilaran")).toBe("#eab308");
      expect(getStampBorderColor("Lapu-Lapu")).toBe("#eab308");
      expect(getStampBorderColor("Panglao", "Central Visayas")).toBe("#eab308");

      // Mindanao
      expect(getStampBorderColor("Davao City")).toBe("#eab308");
      expect(getStampBorderColor("General Santos")).toBe("#eab308");
      expect(getStampBorderColor("Zamboanga City")).toBe("#eab308");
      expect(getStampBorderColor("Magpet", "Soccsksargen")).toBe("#eab308");

      // Outside the Philippines
      expect(getStampBorderColor("Jakarta", "DKI Jakarta", "Indonesia")).toBe("#eab308");
      expect(getStampBorderColor("Singapore", "", "Singapore")).toBe("#eab308");
      expect(getStampBorderColor("New York", "NY", "USA")).toBe("#eab308");
      expect(getStampBorderColor("London", "", "United Kingdom")).toBe("#eab308");
      expect(getStampBorderColor("Toronto", "Ontario", "Canada")).toBe("#eab308");
      expect(getStampBorderColor("Dubai", "Dubai", "UAE")).toBe("#eab308");
    });

    test("renders rectangle border with Yellow (#eab308) for Luzon stamps", () => {
      const { container } = render(<LetterStamp city="Manila" />);
      const rectFrame = container.querySelector('rect[width="42"][height="52"]');
      expect(rectFrame).toBeInTheDocument();
      expect(rectFrame).toHaveAttribute("fill", "#eab308");
    });

    test("renders rectangle border with Yellow (#eab308) for Visayas stamps", () => {
      const { container } = render(<LetterStamp city="Cebu City" />);
      const rectFrame = container.querySelector('rect[width="42"][height="52"]');
      expect(rectFrame).toBeInTheDocument();
      expect(rectFrame).toHaveAttribute("fill", "#eab308");
    });

    test("renders rectangle border with Yellow (#eab308) for Mindanao stamps", () => {
      const { container } = render(<LetterStamp city="Davao City" />);
      const rectFrame = container.querySelector('rect[width="42"][height="52"]');
      expect(rectFrame).toBeInTheDocument();
      expect(rectFrame).toHaveAttribute("fill", "#eab308");
    });

    test("renders rectangle border with Yellow (#eab308) for International stamps", () => {
      const { container } = render(<LetterStamp city="London" country="United Kingdom" />);
      const rectFrame = container.querySelector('rect[width="42"][height="52"]');
      expect(rectFrame).toBeInTheDocument();
      expect(rectFrame).toHaveAttribute("fill", "#eab308");
    });

    test("renders rectangle border with Yellow (#eab308) for island group fallback stamps", () => {
      const { container: luzonContainer } = render(<LetterStamp region="Central Luzon" />);
      expect(luzonContainer.querySelector('rect[width="42"][height="52"]')).toHaveAttribute("fill", "#eab308");

      const { container: visayasContainer } = render(<LetterStamp region="Central Visayas" />);
      expect(visayasContainer.querySelector('rect[width="42"][height="52"]')).toHaveAttribute("fill", "#eab308");

      const { container: mindanaoContainer } = render(<LetterStamp region="Northern Mindanao" />);
      expect(mindanaoContainer.querySelector('rect[width="42"][height="52"]')).toHaveAttribute("fill", "#eab308");
    });

    test("renders rectangle border with Yellow (#eab308) for country fallback stamps", () => {
      const { container: usaContainer } = render(<LetterStamp country="USA" />);
      expect(usaContainer.querySelector('rect[width="42"][height="52"]')).toHaveAttribute("fill", "#eab308");

      const { container: canadaContainer } = render(<LetterStamp country="Canada" />);
      expect(canadaContainer.querySelector('rect[width="42"][height="52"]')).toHaveAttribute("fill", "#eab308");

      const { container: uaeContainer } = render(<LetterStamp country="UAE" />);
      expect(uaeContainer.querySelector('rect[width="42"][height="52"]')).toHaveAttribute("fill", "#eab308");
    });
  });
});

