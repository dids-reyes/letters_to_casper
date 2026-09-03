const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const truncateText = (value, maxCharacters) => {
  const text = String(value ?? "").trim();
  return text.length > maxCharacters
    ? `${text.slice(0, maxCharacters - 3)}...`
    : text;
};

const wrapText = (value, maxCharacters = 62, maxLines = 6) => {
  const words = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((originalWord) => {
    let word = originalWord;

    while (word.length > maxCharacters) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      lines.push(word.slice(0, maxCharacters));
      word = word.slice(maxCharacters);
    }

    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharacters) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && visibleLines.length > 0) {
    const lastIndex = visibleLines.length - 1;
    visibleLines[lastIndex] = `${visibleLines[lastIndex].slice(0, -3)}...`;
  }

  return visibleLines;
};

export default async (_request, context) => {
  const rawMessageId = context.params.messageId || "";
  const messageId = rawMessageId.replace(/\.svg$/i, "");
  const apiKey = Netlify.env.get("REACT_APP_API_KEY");
  const configuredBaseUrl = Netlify.env.get("REACT_APP_BASE_URL");
  const apiBaseUrl = (
    configuredBaseUrl || "https://ltc-service.onrender.com"
  ).replace(/\/+$/, "");

  if (!messageId || !apiKey) {
    return new Response("Preview unavailable", {status: 404});
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/api/messages/public/${encodeURIComponent(messageId)}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      return new Response("Letter not found", {status: 404});
    }

    const {message: letter} = await response.json();
    const messageLines = wrapText(letter.message);
    const messageSvg = messageLines
      .map(
        (line, index) =>
          `<text x="160" y="${298 + index * 40}" class="message">${escapeXml(
            line,
          )}</text>`,
      )
      .join("");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
        <defs>
          <pattern id="paper-grain" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill="#faf7ec" />
            <path d="M0 0V5" stroke="#78643c" stroke-opacity="0.035" />
          </pattern>
          <filter id="paper-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#2f2b20" flood-opacity="0.22" />
          </filter>
          <style>
            .address-label { font: 700 19px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; fill: #6b6550; }
            .address-value { font: 22px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; fill: #2f2b20; }
            .message { font: 23px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; fill: #2f2b20; }
            .brand { font: 700 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #8a8367; letter-spacing: 1.5px; }
          </style>
        </defs>

        <rect width="1200" height="630" fill="#e9dfc0" />
        <path d="M0 0H1200V630H0Z" fill="#f3ecd8" opacity="0.55" />
        <rect x="95" y="48" width="1010" height="534" rx="12" fill="url(#paper-grain)" stroke="#e4dcc4" filter="url(#paper-shadow)" />

        <text x="150" y="122" class="address-label">FROM:</text>
        <text x="238" y="122" class="address-value">${escapeXml(truncateText(letter.from, 42))}</text>
        <text x="150" y="164" class="address-label">TO:</text>
        <text x="202" y="164" class="address-value">${escapeXml(truncateText(letter.to, 46))}</text>
        <line x1="150" y1="206" x2="1050" y2="206" stroke="#e4dcc4" stroke-width="2" />

        ${messageSvg}

        <line x1="150" y1="538" x2="1050" y2="538" stroke="#ece4cd" stroke-width="2" />
        <text x="600" y="565" text-anchor="middle" class="brand">LETTERS TO CASPER</text>
      </svg>`;

    return new Response(svg, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Unable to render letter preview image", error);
    return new Response("Preview unavailable", {status: 500});
  }
};

export const config = {
  path: "/letter-preview/:messageId",
  onError: "bypass",
};
