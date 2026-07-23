// Dissertation crop-profile and SAR added-value explorer.
// Upload data/gee/crop_profile_grid_k3_gee.csv as this Earth Engine asset.
var GRID_ASSET = 'projects/casa0025wk6/assets/crop_profile_grid_k3_gee';

var grid = ee.FeatureCollection(GRID_ASSET);

var COLORS = {
  text: '#1d252c',
  muted: '#65717c',
  line: '#d7dee2',
  paper: '#ffffff',
  zone1: '#4f8a5b',
  zone2: '#d59f2f',
  zone3: '#33658a',
  low: '#edf4e8',
  high: '#7b527f',
  outline: '#ffffff'
};

var ZONE_NAMES = {
  1: 'Mixed wheat-barley-beet zone',
  2: 'Barley oriented mixed zone',
  3: 'Winter wheat dominant zone'
};

var METRICS = {
  'Crop-profile zones': {
    field: 'zone_id',
    type: 'zone',
    min: 1,
    max: 3,
    palette: [COLORS.zone1, COLORS.zone2, COLORS.zone3],
    legend: ['Zone 1', 'Zone 2', 'Zone 3']
  },
  'Selected-crop proportion of grid-cell area': {
    field: 'crop_int',
    type: 'continuous',
    min: 0,
    max: 0.8,
    palette: ['#f3f5ee', '#b8d5a7', '#4f8a5b', '#23543a'],
    unit: 'proportion of the whole grid cell'
  },
  'SAR disagreement reduction': {
    field: 'sar_red',
    type: 'continuous',
    min: 0.065,
    max: 0.085,
    palette: ['#e7eef3', '#91b6c9', '#33658a', '#173b55'],
    unit: 'rate-point reduction (S2-only minus S1+S2)'
  },
  'Winter wheat share of selected crop area': cropMetric('p_ww'),
  'Winter barley share of selected crop area': cropMetric('p_wb'),
  'Spring barley share of selected crop area': cropMetric('p_sb'),
  'Beet share of selected crop area': cropMetric('p_beet'),
  'Maize share of selected crop area': cropMetric('p_maize'),
  'Oilseed rape share of selected crop area': cropMetric('p_osr'),
  'Potatoes share of selected crop area': cropMetric('p_pot'),
  'Pulses share of selected crop area': cropMetric('p_pulse')
};

function cropMetric(field) {
  return {
    field: field,
    type: 'continuous',
    min: 0,
    max: 0.7,
    palette: ['#f7f5ec', '#efd98b', '#d59f2f', '#8c5f12'],
    unit: 'proportion of the eight selected crop classes'
  };
}

var map = ui.Map();
map.setOptions('ROADMAP');
map.setCenter(0.8, 52.45, 8);
map.style().set('cursor', 'crosshair');

var title = ui.Label('Crop profile and SAR added value', {
  fontSize: '20px',
  fontWeight: 'bold',
  color: COLORS.text,
  margin: '0 0 4px 0'
});

var subtitle = ui.Label(
  'Explore how crop composition and Sentinel-1 disagreement reduction vary across retained 10 km grid cells.',
  {
    fontSize: '12px',
    color: COLORS.muted,
    whiteSpace: 'pre-wrap',
    margin: '0 0 14px 0'
  }
);

var metricSelect = ui.Select({
  items: Object.keys(METRICS),
  value: 'Crop-profile zones',
  style: {stretch: 'horizontal'}
});

var zoneSelect = ui.Select({
  items: ['All zones', 'Zone 1', 'Zone 2', 'Zone 3'],
  value: 'All zones',
  style: {stretch: 'horizontal'}
});

var resetButton = ui.Button({
  label: 'Reset view',
  style: {stretch: 'horizontal'},
  onClick: function() {
    metricSelect.setValue('Crop-profile zones', true);
    zoneSelect.setValue('All zones', true);
    map.setCenter(0.8, 52.45, 8);
    setDefaultInfo();
  }
});

var legendPanel = ui.Panel([], ui.Panel.Layout.flow('vertical'), {
  margin: '12px 0 0 0',
  padding: '10px',
  border: '1px solid ' + COLORS.line,
  backgroundColor: COLORS.paper
});

var infoPanel = ui.Panel([], ui.Panel.Layout.flow('vertical'), {
  margin: '12px 0 0 0',
  padding: '10px',
  border: '1px solid ' + COLORS.line,
  backgroundColor: COLORS.paper
});

function sectionLabel(text) {
  return ui.Label(text, {
    fontSize: '12px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '10px 0 4px 0'
  });
}

function addInfoRow(label, value) {
  infoPanel.add(ui.Label(label + ': ' + value, {
    fontSize: '12px',
    color: COLORS.text,
    margin: '1px 0',
    whiteSpace: 'pre-wrap'
  }));
}

function formatNumber(value, digits) {
  var number = Number(value);
  return isNaN(number) ? 'N/A' : number.toFixed(digits);
}

function formatPercent(value) {
  var number = Number(value);
  return isNaN(number) ? 'N/A' : (number * 100).toFixed(1) + '%';
}

function setDefaultInfo() {
  infoPanel.clear();
  infoPanel.add(ui.Label('Click a grid cell', {
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 4px 0'
  }));
  infoPanel.add(ui.Label(
    'The popup links local crop composition to zone-level model disagreement. Test sample counts are zone totals, not counts for an individual grid cell.',
    {
      fontSize: '12px',
      color: COLORS.muted,
      whiteSpace: 'pre-wrap',
      margin: '0'
    }
  ));
}

function filteredGrid() {
  var selected = zoneSelect.getValue();
  if (selected === 'All zones') {
    return grid;
  }
  return grid.filter(ee.Filter.eq('zone', selected));
}

function addColorRow(label, color) {
  legendPanel.add(ui.Panel([
    ui.Label('', {
      width: '16px',
      height: '12px',
      backgroundColor: color,
      margin: '3px 8px 0 0'
    }),
    ui.Label(label, {fontSize: '11px', color: COLORS.text, margin: '0'})
  ], ui.Panel.Layout.flow('horizontal'), {margin: '2px 0'}));
}

function updateLegend(label, config) {
  legendPanel.clear();
  legendPanel.add(ui.Label(label, {
    fontSize: '12px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 6px 0'
  }));

  if (config.type === 'zone') {
    config.legend.forEach(function(item, index) {
      addColorRow(item + ': ' + ZONE_NAMES[index + 1], config.palette[index]);
    });
    return;
  }

  var stops = [config.min, (config.min + config.max) / 2, config.max];
  [0, 2, 3].forEach(function(paletteIndex, index) {
    addColorRow(formatNumber(stops[index], 3), config.palette[paletteIndex]);
  });
  legendPanel.add(ui.Label(config.unit, {
    fontSize: '10px',
    color: COLORS.muted,
    whiteSpace: 'pre-wrap',
    margin: '5px 0 0 0'
  }));
}

function renderMap() {
  var label = metricSelect.getValue();
  var config = METRICS[label];
  var subset = filteredGrid();
  var image = ee.Image().float().paint(subset, config.field);
  var fill = ui.Map.Layer(image, {
    min: config.min,
    max: config.max,
    palette: config.palette,
    opacity: 0.82
  }, label, true);
  var outlines = ui.Map.Layer(
    subset.style({color: COLORS.outline, fillColor: '00000000', width: 1}),
    {},
    '10 km grid outlines',
    true
  );

  map.layers().reset([fill, outlines]);
  updateLegend(label, config);
}

metricSelect.onChange(renderMap);
zoneSelect.onChange(function(value) {
  renderMap();
  if (value === 'All zones') {
    map.setCenter(0.8, 52.45, 8);
  } else {
    map.centerObject(filteredGrid(), 8);
  }
  setDefaultInfo();
});

map.onClick(function(coords) {
  infoPanel.clear();
  infoPanel.add(ui.Label('Loading grid summary...', {
    fontSize: '12px',
    color: COLORS.muted
  }));

  var point = ee.Geometry.Point([coords.lon, coords.lat]);
  filteredGrid().filterBounds(point).first().evaluate(function(feature) {
    infoPanel.clear();
    if (!feature || !feature.properties) {
      infoPanel.add(ui.Label('No retained crop-profile grid cell at this location.', {
        fontSize: '12px',
        color: COLORS.muted
      }));
      return;
    }

    var p = feature.properties;
    infoPanel.add(ui.Label(p.zone + ': ' + p.zone_name, {
      fontWeight: 'bold',
      color: COLORS.text,
      margin: '0 0 5px 0'
    }));
    addInfoRow('Grid cell', p.grid_id);
    addInfoRow('Zone crop profile', p.zone_profile);
    addInfoRow('Dominant crop in this cell', p.dominant + ' (' + formatPercent(p.dominant_p) + ')');
    addInfoRow('Selected crop area', formatNumber(p.crop_ha, 0) + ' ha');
    addInfoRow('Selected crop proportion of grid cell', formatPercent(p.crop_int));
    addInfoRow('Held-out test samples in zone', String(p.test_n));
    addInfoRow('S2-only disagreement', formatPercent(p.s2_dis));
    addInfoRow('S1+S2 disagreement', formatPercent(p.s1s2_dis));
    addInfoRow('SAR reduction', formatNumber(p.sar_red, 3) + ' rate points');
    addInfoRow('CROME-UKCEH disagreement', formatPercent(p.ref_dis));
  });
});

var controls = ui.Panel([
  title,
  subtitle,
  sectionLabel('Map variable'),
  metricSelect,
  sectionLabel('Zone filter'),
  zoneSelect,
  resetButton,
  legendPanel,
  infoPanel
], ui.Panel.Layout.flow('vertical'), {
  width: '330px',
  padding: '14px',
  backgroundColor: '#f8faf8'
});

ui.root.clear();
ui.root.add(ui.SplitPanel({
  firstPanel: controls,
  secondPanel: map,
  orientation: 'horizontal',
  wipe: false,
  style: {stretch: 'both'}
}));

setDefaultInfo();
renderMap();
