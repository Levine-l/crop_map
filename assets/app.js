const DATA = {
  overall: [
    { metric: "Overall agreement", s2: 0.7168, s1s2: 0.7911 },
    { metric: "Balanced accuracy", s2: 0.7163, s1s2: 0.7911 },
    { metric: "Macro-F1", s2: 0.7172, s1s2: 0.7916 },
    { metric: "Weighted F1", s2: 0.7174, s1s2: 0.7915 }
  ],
  ukceh: [
    { metric: "Overall", s2: 0.7738, s1s2: 0.8434 },
    { metric: "Balanced", s2: 0.7709, s1s2: 0.8425 },
    { metric: "Macro-F1", s2: 0.7653, s1s2: 0.8373 },
    { metric: "Weighted F1", s2: 0.7760, s1s2: 0.8445 }
  ],
  classGains: [
    { crop: "Pulses / field beans and peas", s2: 0.5340, s1s2: 0.6636, gain: 0.1296 },
    { crop: "Potatoes", s2: 0.6998, s1s2: 0.7895, gain: 0.0897 },
    { crop: "Maize", s2: 0.6189, s1s2: 0.7059, gain: 0.0869 },
    { crop: "Oilseed rape", s2: 0.8209, s1s2: 0.9017, gain: 0.0808 },
    { crop: "Spring barley", s2: 0.7811, s1s2: 0.8482, gain: 0.0671 },
    { crop: "Winter wheat", s2: 0.7482, s1s2: 0.8078, gain: 0.0596 },
    { crop: "Beet", s2: 0.7707, s1s2: 0.8292, gain: 0.0585 },
    { crop: "Winter barley", s2: 0.7636, s1s2: 0.7872, gain: 0.0235 }
  ],
  rf: [
    { metric: "Overall agreement", mean: 0.080, min: 0.071, max: 0.088 },
    { metric: "Balanced accuracy", mean: 0.081, min: 0.072, max: 0.088 },
    { metric: "Macro-F1", mean: 0.081, min: 0.071, max: 0.089 },
    { metric: "Weighted F1", mean: 0.081, min: 0.071, max: 0.089 }
  ],
  zones: [
    {
      zone: "Zone 1",
      label: "Mixed wheat-barley-beet zone",
      profile: "Winter wheat 36%; winter barley 17%; beet 12%",
      cells: 46,
      samples: 561,
      s2Dis: 0.303,
      s1s2Dis: 0.219,
      reduction: 0.084,
      refDis: 0.119
    },
    {
      zone: "Zone 2",
      label: "Barley oriented mixed zone",
      profile: "Winter barley 26%; winter wheat 19%; spring barley 16%",
      cells: 20,
      samples: 255,
      s2Dis: 0.275,
      s1s2Dis: 0.204,
      reduction: 0.071,
      refDis: 0.116
    },
    {
      zone: "Zone 3",
      label: "Winter wheat dominant zone",
      profile: "Winter wheat 53%; winter barley 11%; spring barley 8%",
      cells: 78,
      samples: 901,
      s2Dis: 0.272,
      s1s2Dis: 0.204,
      reduction: 0.068,
      refDis: 0.111
    }
  ],
  kSummary: [
    { run: "Automatic", k: 2, silhouette: 0.412, samples: "688 / 1029", sarRange: "0.071-0.075", interpretation: "Best silhouette, but coarse agricultural interpretation." },
    { run: "Main text", k: 3, silhouette: 0.312, samples: "255 / 901", sarRange: "0.068-0.084", interpretation: "Chosen for interpretable crop profile zones." },
    { run: "Sensitivity", k: 4, silhouette: 0.261, samples: "255 / 575", sarRange: "0.061-0.084", interpretation: "More fragmented and lower silhouette." }
  ]
};

const MAP_NOTES = {
  cluster: {
    title: "k=3 crop-profile zones",
    body: "Each polygon is a retained 10 km crop-profile grid cell, coloured by KMeans cluster over selected-crop proportions.",
    details: [
      "Zone definitions and sample counts are summarised in the fixed table above."
    ]
  },
  intensity: {
    title: "Selected crop proportion",
    body: "This map shows selected_crop_intensity: selected crop area divided by total grid-cell area. Units are proportions of grid-cell area from 0 to 1; multiply by 100 for percent.",
    details: [
      "Selected crop area is the combined UKCEH area, in hectares, for the eight analysed crops: winter wheat, winter barley, spring barley, beet, maize, oilseed rape, potatoes, and pulses/field beans/peas.",
      "The tooltip reports both selected_crop_area_ha and selected_crop_intensity so area and proportion are not conflated."
    ]
  },
  sar: {
    title: "Zone-level SAR disagreement reduction",
    body: "This map joins the zone-level reduction in model-reference disagreement after adding Sentinel-1 SAR to every grid cell in that zone. Units are rate-point differences: S2 disagreement rate minus S1+S2 disagreement rate.",
    details: [
      "Zone sample counts are held-out CROME test samples, not grid-cell counts."
    ]
  }
};

const COLORS = {
  s2: "#9a6b45",
  s1s2: "#33658a",
  gain: "#4f8a5b",
  ref: "#7b527f",
  grid: "#d7dee2",
  text: "#1d252c",
  muted: "#65717c",
  gold: "#d59f2f"
};

function createSvg(width, height) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("role", "img");
  return svg;
}

function add(parent, tag, attrs = {}, text = "") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  if (text !== "") el.textContent = text;
  parent.appendChild(el);
  return el;
}

function fmt(value, digits = 3) {
  return Number(value).toFixed(digits);
}

function renderGroupedBars(targetId, data, options = {}) {
  const target = document.getElementById(targetId);
  target.innerHTML = "";
  const width = options.width || 880;
  const height = options.height || 360;
  const margin = { top: 28, right: 28, bottom: 76, left: 74 };
  const svg = createSvg(width, height);
  target.appendChild(svg);

  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const yMin = options.yMin ?? 0.65;
  const yMax = options.yMax ?? 0.86;
  const y = value => margin.top + chartH - ((value - yMin) / (yMax - yMin)) * chartH;
  const groupW = chartW / data.length;
  const barW = Math.min(42, groupW * 0.28);

  for (let i = 0; i <= 4; i++) {
    const value = yMin + (i / 4) * (yMax - yMin);
    const yy = y(value);
    add(svg, "line", { x1: margin.left, y1: yy, x2: width - margin.right, y2: yy, class: "chart-grid" });
    add(svg, "text", { x: margin.left - 12, y: yy + 4, "text-anchor": "end", class: "chart-label" }, fmt(value, 2));
  }

  data.forEach((d, i) => {
    const cx = margin.left + groupW * i + groupW / 2;
    const x1 = cx - barW - 3;
    const x2 = cx + 3;
    const y1 = y(d.s2);
    const y2 = y(d.s1s2);
    add(svg, "rect", { x: x1, y: y1, width: barW, height: margin.top + chartH - y1, fill: COLORS.s2, rx: 3 });
    add(svg, "rect", { x: x2, y: y2, width: barW, height: margin.top + chartH - y2, fill: COLORS.s1s2, rx: 3 });
    add(svg, "text", { x: x1 + barW / 2, y: y1 - 7, "text-anchor": "middle", class: "chart-label" }, fmt(d.s2));
    add(svg, "text", { x: x2 + barW / 2, y: y2 - 7, "text-anchor": "middle", class: "chart-label" }, fmt(d.s1s2));
    add(svg, "text", { x: cx, y: height - margin.bottom + 30, "text-anchor": "middle", class: "chart-label" }, d.metric);
    add(svg, "text", { x: cx, y: height - margin.bottom + 48, "text-anchor": "middle", class: "chart-title-small" }, `Delta +${fmt(d.s1s2 - d.s2)}`);
  });

  add(svg, "line", { x1: margin.left, y1: margin.top + chartH, x2: width - margin.right, y2: margin.top + chartH, class: "chart-axis" });
  addLegend(svg, width - 210, 18, [
    { label: "S2-only", color: COLORS.s2 },
    { label: "S1+S2", color: COLORS.s1s2 }
  ]);
}

function addLegend(svg, x, y, items) {
  const group = add(svg, "g", { class: "legend" });
  items.forEach((item, i) => {
    const yy = y + i * 20;
    add(group, "rect", { x, y: yy - 10, width: 12, height: 12, fill: item.color, rx: 2 });
    add(group, "text", { x: x + 18, y: yy, class: "chart-label" }, item.label);
  });
}

function renderHorizontalGains() {
  const target = document.getElementById("class-gain-chart");
  target.innerHTML = "";
  const data = [...DATA.classGains].sort((a, b) => b.gain - a.gain);
  const width = 880;
  const height = 480;
  const margin = { top: 30, right: 92, bottom: 42, left: 230 };
  const svg = createSvg(width, height);
  target.appendChild(svg);

  const chartW = width - margin.left - margin.right;
  const rowH = (height - margin.top - margin.bottom) / data.length;
  const xMax = 0.14;
  const x = value => margin.left + (value / xMax) * chartW;

  for (let i = 0; i <= 7; i++) {
    const value = (i / 7) * xMax;
    const xx = x(value);
    add(svg, "line", { x1: xx, y1: margin.top, x2: xx, y2: height - margin.bottom, class: "chart-grid" });
    add(svg, "text", { x: xx, y: height - margin.bottom + 24, "text-anchor": "middle", class: "chart-label" }, fmt(value, 2));
  }

  data.forEach((d, i) => {
    const y = margin.top + i * rowH + rowH * 0.22;
    const barH = rowH * 0.56;
    add(svg, "text", { x: margin.left - 14, y: y + barH * 0.68, "text-anchor": "end", class: "chart-label" }, d.crop);
    add(svg, "rect", { x: margin.left, y, width: x(d.gain) - margin.left, height: barH, fill: COLORS.gain, rx: 3 });
    add(svg, "text", { x: x(d.gain) + 8, y: y + barH * 0.68, class: "chart-label" }, `+${fmt(d.gain)}`);
  });

  add(svg, "text", { x: margin.left, y: 18, class: "chart-title-small" }, "F1 gain from adding Sentinel-1 SAR");
}

function renderRangeChart() {
  const target = document.getElementById("rf-chart");
  target.innerHTML = "";
  const data = DATA.rf;
  const width = 880;
  const height = 310;
  const margin = { top: 38, right: 68, bottom: 44, left: 180 };
  const svg = createSvg(width, height);
  target.appendChild(svg);

  const chartW = width - margin.left - margin.right;
  const rowH = (height - margin.top - margin.bottom) / data.length;
  const xMin = 0.065;
  const xMax = 0.092;
  const x = value => margin.left + ((value - xMin) / (xMax - xMin)) * chartW;

  for (let i = 0; i <= 3; i++) {
    const value = xMin + (i / 3) * (xMax - xMin);
    const xx = x(value);
    add(svg, "line", { x1: xx, y1: margin.top - 6, x2: xx, y2: height - margin.bottom, class: "chart-grid" });
    add(svg, "text", { x: xx, y: height - margin.bottom + 24, "text-anchor": "middle", class: "chart-label" }, fmt(value, 3));
  }

  data.forEach((d, i) => {
    const y = margin.top + i * rowH + rowH / 2;
    add(svg, "text", { x: margin.left - 14, y: y + 4, "text-anchor": "end", class: "chart-label" }, d.metric);
    add(svg, "line", { x1: x(d.min), y1: y, x2: x(d.max), y2: y, stroke: COLORS.s1s2, "stroke-width": 6, "stroke-linecap": "round" });
    add(svg, "circle", { cx: x(d.mean), cy: y, r: 8, fill: COLORS.gold, stroke: "#ffffff", "stroke-width": 2 });
    add(svg, "text", { x: x(d.max) + 10, y: y + 4, class: "chart-label" }, `mean +${fmt(d.mean)}`);
  });

  add(svg, "text", { x: margin.left, y: 20, class: "chart-title-small" }, "Delta range: S1+S2 minus S2-only across paired RF settings");
}

function renderZoneChart() {
  const target = document.getElementById("zone-chart");
  target.innerHTML = "";
  const data = DATA.zones;
  const width = 880;
  const height = 310;
  const margin = { top: 30, right: 30, bottom: 50, left: 72 };
  const svg = createSvg(width, height);
  target.appendChild(svg);

  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const yMax = 0.33;
  const y = value => margin.top + chartH - (value / yMax) * chartH;
  const groupW = chartW / data.length;
  const barW = Math.min(46, groupW * 0.20);

  for (let i = 0; i <= 3; i++) {
    const value = (i / 3) * yMax;
    const yy = y(value);
    add(svg, "line", { x1: margin.left, y1: yy, x2: width - margin.right, y2: yy, class: "chart-grid" });
    add(svg, "text", { x: margin.left - 10, y: yy + 4, "text-anchor": "end", class: "chart-label" }, fmt(value, 2));
  }

  data.forEach((d, i) => {
    const cx = margin.left + groupW * i + groupW / 2;
    const s2X = cx - barW - 6;
    const s1X = cx + 6;
    add(svg, "rect", { x: s2X, y: y(d.s2Dis), width: barW, height: margin.top + chartH - y(d.s2Dis), fill: COLORS.s2, rx: 3 });
    add(svg, "rect", { x: s1X, y: y(d.s1s2Dis), width: barW, height: margin.top + chartH - y(d.s1s2Dis), fill: COLORS.s1s2, rx: 3 });
    add(svg, "line", { x1: s2X + barW / 2, y1: y(d.s2Dis) - 8, x2: s1X + barW / 2, y2: y(d.s1s2Dis) - 8, stroke: COLORS.gain, "stroke-width": 2 });
    add(svg, "text", { x: cx, y: y(Math.max(d.s2Dis, d.s1s2Dis)) - 18, "text-anchor": "middle", class: "chart-label" }, `-${fmt(d.reduction)}`);
    add(svg, "text", { x: cx, y: height - margin.bottom + 28, "text-anchor": "middle", class: "chart-label" }, d.zone);
  });

  addLegend(svg, width - 200, 20, [
    { label: "S2 disagreement", color: COLORS.s2 },
    { label: "S1+S2 disagreement", color: COLORS.s1s2 }
  ]);
}

function renderZoneSummaryTable() {
  const target = document.getElementById("zone-summary-table");
  if (!target) return;
  const rows = DATA.zones.map(row => `
    <tr>
      <td>${row.zone}</td>
      <td>${row.label}</td>
      <td>${row.profile}</td>
      <td class="numeric">${row.cells}</td>
      <td class="numeric">${row.samples}</td>
      <td class="numeric">${fmt(row.reduction)}</td>
    </tr>
  `).join("");
  target.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Zone</th>
          <th>Meaning</th>
          <th>Centroid crop profile</th>
          <th class="numeric">Grid cells</th>
          <th class="numeric">Test samples</th>
          <th class="numeric">SAR reduction</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderKTable() {
  const target = document.getElementById("k-table");
  const rows = DATA.kSummary.map(row => `
    <tr>
      <td>${row.run}</td>
      <td class="numeric">${row.k}</td>
      <td class="numeric">${fmt(row.silhouette)}</td>
      <td class="numeric">${row.samples}</td>
      <td class="numeric">${row.sarRange}</td>
      <td>${row.interpretation}</td>
    </tr>
  `).join("");
  target.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Run</th>
          <th class="numeric">k</th>
          <th class="numeric">Silhouette</th>
          <th class="numeric">Min./max. samples</th>
          <th class="numeric">SAR reduction</th>
          <th>Interpretation</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function setupMapTabs() {
  const frame = document.getElementById("map-frame");
  const note = document.getElementById("map-note");
  const mapPaths = {
    cluster: "data/maps/crop_profile_cluster_map_k3.html",
    intensity: "data/maps/selected_crop_intensity_map_k3.html",
    sar: "data/maps/zone_level_sar_reduction_map_k3.html"
  };

  function renderMapNote(key) {
    if (!note || !MAP_NOTES[key]) return;
    const item = MAP_NOTES[key];
    note.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <ul>
        ${item.details.map(detail => `<li>${detail}</li>`).join("")}
      </ul>
    `;
  }

  renderMapNote("cluster");

  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("is-active"));
      button.classList.add("is-active");
      frame.src = mapPaths[button.dataset.map];
      renderMapNote(button.dataset.map);
    });
  });
}

renderGroupedBars("overall-chart", DATA.overall, { yMin: 0.68, yMax: 0.82, height: 360 });
renderGroupedBars("ukceh-chart", DATA.ukceh, { yMin: 0.74, yMax: 0.86, height: 360 });
renderHorizontalGains();
renderRangeChart();
renderZoneChart();
renderZoneSummaryTable();
renderKTable();
setupMapTabs();
