const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const removeMeta = (html, key) =>
  html.replace(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key.replace(":", "\\:")}["'][^>]*>`,
      "gi",
    ),
    "",
  );

export default async (request, context) => {
  const pageResponse = await context.next();
  const messageId = context.params.messageId;
  const apiKey = Netlify.env.get("REACT_APP_API_KEY");
  const configuredBaseUrl = Netlify.env.get("REACT_APP_BASE_URL");
  const apiBaseUrl = (
    configuredBaseUrl || "https://ltc-service.onrender.com"
  ).replace(/\/+$/, "");

  if (!messageId || !apiKey || !pageResponse.ok) {
    return pageResponse;
  }

  const fallbackResponse = pageResponse.clone();

  try {
    const letterResponse = await fetch(
      `${apiBaseUrl}/api/messages/public/${encodeURIComponent(messageId)}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    if (!letterResponse.ok) {
      return pageResponse;
    }

    const {message: letter} = await letterResponse.json();
    const pageUrl = new URL(request.url);
    const canonicalUrl = `${pageUrl.origin}/letters/${encodeURIComponent(
      messageId,
    )}`;
    const previewSource = `/letter-preview/${encodeURIComponent(messageId)}.svg`;
    const imageUrl = `${pageUrl.origin}/.netlify/images?url=${encodeURIComponent(
      previewSource,
    )}&fm=png&w=1200&h=630&fit=fill`;
    const title = `Letter from: ${letter.from} to: ${letter.to}`;
    const normalizedMessage = String(letter.message || "").replace(/\s+/g, " ").trim();
    const description =
      normalizedMessage.length > 180
        ? `${normalizedMessage.slice(0, 177)}...`
        : normalizedMessage || "An open letter shared on Letters to Casper.";

    let html = await pageResponse.text();
    const previewKeys = [
      "description",
      "og:url",
      "og:type",
      "og:image",
      "og:image:alt",
      "og:image:width",
      "og:image:height",
      "og:title",
      "og:description",
      "og:site_name",
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
    ];

    previewKeys.forEach((key) => {
      html = removeMeta(html, key);
    });

    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(
      /<link[^>]+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    );

    const metadata = `
      <meta name="description" content="${escapeHtml(description)}" />
      <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
      <meta property="og:type" content="article" />
      <meta property="og:title" content="${escapeHtml(title)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      <meta property="og:site_name" content="Letters to Casper" />
      <meta property="og:image" content="${escapeHtml(imageUrl)}" />
      <meta property="og:image:alt" content="${escapeHtml(title)}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`;

    html = html.replace("</head>", `${metadata}\n  </head>`);

    const headers = new Headers(pageResponse.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=0, s-maxage=300");

    return new Response(html, {
      status: pageResponse.status,
      statusText: pageResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error("Unable to create letter link preview", error);
    return fallbackResponse;
  }
};

export const config = {
  path: "/letters/:messageId",
  onError: "bypass",
};
