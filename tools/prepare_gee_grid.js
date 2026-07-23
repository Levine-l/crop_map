const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(
  ROOT,
  "data",
  "maps",
  "crop_profile_cluster_map_k3.html"
);
const OUTPUT_DIR = path.join(ROOT, "data", "gee");
const OUTPUT = path.join(OUTPUT_DIR, "crop_profile_grid_k3_gee.geojson");
const CSV_OUTPUT = path.join(OUTPUT_DIR, "crop_profile_grid_k3_gee.csv");

const ZONES = {
  1: {
    name: "Mixed wheat-barley-beet zone",
    profile: "Winter wheat 36%; winter barley 17%; beet 12%",
    grid_cells: 46,
    test_samples: 561,
    s2_disagreement: 0.303,
    s1s2_disagreement: 0.219,
    sar_reduction: 0.084,
    crome_ukceh_disagreement: 0.119
  },
  2: {
    name: "Barley oriented mixed zone",
    profile: "Winter barley 26%; winter wheat 19%; spring barley 16%",
    grid_cells: 20,
    test_samples: 255,
    s2_disagreement: 0.275,
    s1s2_disagreement: 0.204,
    sar_reduction: 0.071,
    crome_ukceh_disagreement: 0.116
  },
  3: {
    name: "Winter wheat dominant zone",
    profile: "Winter wheat 53%; winter barley 11%; spring barley 8%",
    grid_cells: 78,
    test_samples: 901,
    s2_disagreement: 0.272,
    s1s2_disagreement: 0.204,
    sar_reduction: 0.068,
    crome_ukceh_disagreement: 0.111
  }
};

const CROP_FIELDS = [
  ["Winter wheat", "p_ww", "prop_winter_wheat"],
  ["Winter barley", "p_wb", "prop_winter_barley"],
  ["Spring barley", "p_sb", "prop_spring_barley"],
  ["Beet", "p_beet", "prop_beet_sugar_beet___fodder_beet"],
  ["Maize", "p_maize", "prop_maize"],
  ["Oilseed rape", "p_osr", "prop_oilseed_rape"],
  ["Potatoes", "p_pot", "prop_potatoes"],
  ["Pulses / field beans and peas", "p_pulse", "prop_pulses___field_beans_and_peas"]
];

function extractFeatureCollections(html) {
  const pattern = /_add\s*\((\{"features":.*?,\s*"type":\s*"FeatureCollection"\})\);/gs;
  return Array.from(html.matchAll(pattern), match => JSON.parse(match[1]));
}

function compactProperties(properties) {
  const zoneId = Number(properties.cluster_id);
  const zone = ZONES[zoneId];
  if (!zone) {
    throw new Error(`Unexpected cluster_id: ${properties.cluster_id}`);
  }

  const crops = CROP_FIELDS.map(([label, shortName, sourceName]) => ({
    label,
    shortName,
    value: Number(properties[sourceName] || 0)
  }));
  const dominant = crops.reduce((best, crop) => crop.value > best.value ? crop : best);

  const compact = {
    grid_id: properties.grid_id,
    zone_id: zoneId,
    zone: `Zone ${zoneId}`,
    zone_name: zone.name,
    zone_profile: zone.profile,
    grid_ha: Number(properties.grid_area_ha),
    crop_ha: Number(properties.selected_crop_area_ha),
    crop_int: Number(properties.selected_crop_intensity),
    dominant: dominant.label,
    dominant_p: dominant.value,
    zone_cells: zone.grid_cells,
    test_n: zone.test_samples,
    s2_dis: zone.s2_disagreement,
    s1s2_dis: zone.s1s2_disagreement,
    sar_red: zone.sar_reduction,
    ref_dis: zone.crome_ukceh_disagreement
  };

  crops.forEach(crop => {
    compact[crop.shortName] = crop.value;
  });
  return compact;
}

const html = fs.readFileSync(SOURCE, "utf8");
const collections = extractFeatureCollections(html);
const grid = collections.find(collection =>
  collection.features.length > 100 &&
  collection.features.every(feature => feature.properties?.cluster_id)
);

if (!grid) {
  throw new Error("Could not find the k=3 crop-profile grid in the Folium HTML.");
}

const seen = new Set();
const features = grid.features.map(feature => {
  const properties = compactProperties(feature.properties);
  if (seen.has(properties.grid_id)) {
    throw new Error(`Duplicate grid_id: ${properties.grid_id}`);
  }
  seen.add(properties.grid_id);
  return {
    type: "Feature",
    properties,
    geometry: feature.geometry
  };
});

const output = {
  type: "FeatureCollection",
  name: "crop_profile_grid_k3_gee",
  features
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(output));

const propertyNames = Object.keys(features[0].properties);
const csvHeaders = [...propertyNames, ".geo"];
const csvRows = features.map(feature => {
  const values = propertyNames.map(name => feature.properties[name]);
  values.push(JSON.stringify(feature.geometry));
  return values.map(csvValue).join(",");
});
fs.writeFileSync(CSV_OUTPUT, [csvHeaders.join(","), ...csvRows].join("\n"));

const counts = features.reduce((summary, feature) => {
  const key = feature.properties.zone;
  summary[key] = (summary[key] || 0) + 1;
  return summary;
}, {});

console.log(`Wrote ${features.length} grid cells to ${OUTPUT}`);
console.log(`Wrote Earth Engine upload CSV to ${CSV_OUTPUT}`);
console.log(`Zone counts: ${JSON.stringify(counts)}`);

function csvValue(value) {
  if (typeof value === "number") return String(value);
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}
