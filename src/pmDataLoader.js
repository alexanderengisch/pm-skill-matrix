const categoryMeta = {
  "Vision and Strategy": {
    className: "vision-strategy",
    label: "Vision & Strategy"
  },
  "Roadmaps": {
    className: "roadmaps",
    label: "Roadmaps"
  },
  "Design and Discovery": {
    className: "design-discovery",
    label: "Design & Discovery"
  },
  "Product Delivery": {
    className: "product-delivery",
    label: "Product Delivery"
  },
  "Technical Acumen": {
    className: "technical-acumen",
    label: "Technical Acumen"
  },
  "Business Acumen": {
    className: "business-acumen",
    label: "Business Acumen"
  },
  "Stakeholder Engagement": {
    className: "stakeholder-engagement",
    label: "Stakeholder Engagement"
  },
  "Collaboration": {
    className: "collaboration",
    label: "Collaboration"
  }
};

export const areaLegend = [
  { key: "vision-strategy", label: "Vision & Strategy" },
  { key: "roadmaps", label: "Roadmaps" },
  { key: "design-discovery", label: "Design & Discovery" },
  { key: "product-delivery", label: "Product Delivery" },
  { key: "technical-acumen", label: "Technical Acumen" },
  { key: "business-acumen", label: "Business Acumen" },
  { key: "stakeholder-engagement", label: "Stakeholder Engagement" },
  { key: "collaboration", label: "Collaboration" }
];

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\r" && next === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
      } else if (ch === "\n" || ch === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function deriveLevel(row, hierarchy, explicitLevel) {
  if (explicitLevel && ["junior", "mid", "senior"].includes(explicitLevel)) {
    return explicitLevel;
  }

  if (hierarchy === "junior" || hierarchy === "mid" || hierarchy === "senior") {
    return hierarchy;
  }

  if (hierarchy === "ai") {
    if (row <= 2) return "junior";
    if (row <= 4) return "mid";
    return "senior";
  }

  return null;
}

function csvRowsToElements(rows) {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const elements = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (!cols || cols.every((c) => !c?.trim())) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = (cols[idx] || "").trim();
    });

    if (!obj.symbol || !obj.name) continue;

    const row = parseInt(obj.row, 10);
    const col = parseInt(obj.col, 10);

    if (Number.isNaN(row) || Number.isNaN(col)) continue;

    const rawArea = (obj.area || obj.domain || "").trim();

const directAreaMap = {
  "vision-strategy": { className: "vision-strategy", label: "Vision & Strategy" },
  "roadmaps": { className: "roadmaps", label: "Roadmaps" },
  "design-discovery": { className: "design-discovery", label: "Design & Discovery" },
  "product-delivery": { className: "product-delivery", label: "Product Delivery" },
  "technical-acumen": { className: "technical-acumen", label: "Technical Acumen" },
  "business-acumen": { className: "business-acumen", label: "Business Acumen" },
  "stakeholder-engagement": { className: "stakeholder-engagement", label: "Stakeholder Engagement" },
  "collaboration": { className: "collaboration", label: "Collaboration" }
};

const areaInfo =
  directAreaMap[rawArea.toLowerCase()] ||
  categoryMeta[rawArea] || {
    className: "vision-strategy",
    label: rawArea || "Unknown"
  };

    const hierarchy = obj.hierarchy || "";
    const explicitLevel = obj.level || "";
    const derivedLevel = deriveLevel(row, hierarchy, explicitLevel);

    elements.push({
      id: `${obj.symbol}-${row}-${col}-${i}`,
      symbol: obj.symbol,
      name: obj.name,
      area: areaInfo.className,
      areaLabel: areaInfo.label,
      type: obj.type || "Behaviors",
      description: obj.description || "",
      long_description: obj.long_description || "",
      row,
      col,
      hierarchy,
      level: derivedLevel,
      lifecycle: obj.lifecycle || "",
      skillType: obj.skillType || "",
      isAI: hierarchy === "ai"
    });
  }

  return elements;
}

export async function loadPMData() {
  const response = await fetch("/periodic_table_structure.csv?v=" + Date.now());

  if (!response.ok) {
    throw new Error("CSV konnte nicht geladen werden");
  }

  const text = await response.text();
  const rows = parseCSV(text);
  const elements = csvRowsToElements(rows);

  if (!elements.length) {
    throw new Error("Keine gültigen Elemente in der CSV gefunden");
  }

  return elements;
}