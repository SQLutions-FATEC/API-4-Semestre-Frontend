<template>
  <div id="mapa-principal" />
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import Wkt from "wicket";
import { onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  regionData: { type: Array, required: true },
  radarData: { type: Array, required: false, default: () => [] },
  addressData: { type: Array, required: false, default: () => [] },
  regionColorMap: { type: Object, required: true },
  iconeCamera: { type: String, required: false, default: "" },
});
const emit = defineEmits(["region-selected"]);

// --- Configuração do Mapa ---
const zoom = 12;
const center = [-23.179323, -45.865832];
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

// --- Variáveis de Instância ---
let mapInstance = null;
let activeLayer = null;
let regionsLayerGroup = null;
let radarsLayerGroup = null;

// NOVO: Três camadas de calor separadas
let heatmapLayerBlue = null;
let heatmapLayerOrange = null;
let heatmapLayerRed = null;

let baseTileLayer = null;
let layerControl = null;

// --- Função para selecionar/deselecionar regiões ---
const defaultStyle = {
  color: "#333333",
  weight: 1.5,
  opacity: 0.65,
  fillOpacity: 0.4,
};

const highlightStyle = {
  color: "#000000",
  weight: 3,
  opacity: 1,
  fillOpacity: 0.6,
};

function selectRegion(currentProps) {
  // 1. LÓGICA DE DESMARCAR A CAMADA ANTERIOR
  if (activeLayer) {
    const previousRegionName = activeLayer.feature.properties.name;
    const previousFillColor =
      props.regionColorMap[previousRegionName] || props.regionColorMap["default"];

    activeLayer.setStyle({ ...defaultStyle, fillColor: previousFillColor });
  }
  activeLayer = null;

  if (currentProps) {
    let currentLayer = currentProps.layer;
    if (!currentLayer && regionsLayerGroup) {
      regionsLayerGroup.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties.name === currentProps.name) {
          currentLayer = layer;
        }
      });
    }
    if (currentLayer) {
      const currentFillColor = currentProps.name
        ? props.regionColorMap[currentProps.name] || props.regionColorMap["default"]
        : defaultStyle.fillColor;

      currentLayer.setStyle({ ...highlightStyle, fillColor: currentFillColor });
      currentLayer.bringToFront();
      activeLayer = currentLayer;
    } //Emite o evento para o pai
    emit("region-selected", {
      name: currentProps.name,
      overall: currentProps.overall,
      traffic: currentProps.traffic,
      security: currentProps.security,
      estado: currentProps.estado,
      ListaCarros: currentProps.ListaCarros,
    });
  } else {
    // Emite o evento de desclique para o pai
    emit("region-selected", null);
  }
}

// --- Função para adicionar as regiões ao mapa ---
function addRegionsToMap(data) {
  if (!mapInstance || !regionsLayerGroup) return;
  regionsLayerGroup.clearLayers();

  const wkt = new Wkt.Wkt();
  data.forEach((region) => {
    try {
      wkt.read(region.areaRegiao);
      const geojsonGeometry = wkt.toJson();
      const estado = region.overallIndex <= 1 ? "Ótimo" : region.overallIndex <= 3 ? "Bom" : "Ruim";
      const geojsonFeature = {
        type: "Feature",
        properties: {
          name: region.regionName,
          traffic: region.trafficIndex,
          security: region.securityIndex,
          overall: region.overallIndex,
          estado: estado,
          ListaCarros: region.vehicleTypeCounts,
        },
        geometry: geojsonGeometry,
      };

      L.geoJSON(geojsonFeature, {
        style: function (feature) {
          const regionName = feature.properties.name;
          const fillColor = props.regionColorMap[regionName] || props.regionColorMap["default"];
          return { ...defaultStyle, fillColor: fillColor };
        },
        onEachFeature: function (feature, layer) {
          const props = feature.properties;
          layer.on("click", (e) => {
            selectRegion({ ...props, layer: layer });
            e.originalEvent.regionClicked = true;
          });
        },
      }).addTo(regionsLayerGroup);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Erro ao processar WKT para a região ${region.regionName}:`, e);
    }
  });
}

// --- Adiciona os radares ao mapa ---
function addRadarsToMap(radars) {
  if (!mapInstance || !radarsLayerGroup) return;
  radarsLayerGroup.clearLayers();

  const radarIcon = L.icon({
    iconUrl: props.iconeCamera,
    iconSize: [50, 50],
  });

  radars.forEach((radar) => {
    const pointString = radar.location;
    const coordsMatch = pointString.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    if (coordsMatch && coordsMatch.length === 3) {
      const lon = parseFloat(coordsMatch[1]);
      const lat = parseFloat(coordsMatch[2]);

      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = L.marker([lat, lon], { icon: radarIcon });
        const popupContent =
          `<b>Endereço:</b> ${radar.address?.address ?? "N/A"}<br>` +
          `<b>Região:</b> ${radar.address?.region ?? "N/A"}<br>` +
          `<b>Velocidade Máxima:</b> ${radar.regulatedSpeed} km/h`;
        marker.bindPopup(popupContent);
        marker.addTo(radarsLayerGroup);
      }
    }
  });
}

function addAddressesToMap(data) {
  if (!mapInstance || !heatmapLayerBlue || !heatmapLayerOrange || !heatmapLayerRed) return; // 1. Cria arrays separados para cada cor

  const heatPointsBlue = [];
  const heatPointsOrange = [];
  const heatPointsRed = [];

  const fixedIntensity = 15.0;

  data.forEach((address) => {
    try {
      const geojsonGeometry = JSON.parse(address.areaRuaGeoJson);

      if (
        geojsonGeometry.type === "LineString" &&
        geojsonGeometry.coordinates &&
        geojsonGeometry.coordinates.length > 0
      ) {
        const firstCoord = geojsonGeometry.coordinates[0];
        const lon = firstCoord[0];
        const lat = firstCoord[1];
        const trafficIndex = address.trafficIndex;

        if (!isNaN(lat) && !isNaN(lon)) {
         if (trafficIndex === 3) {
            heatPointsOrange.push([lat, lon, fixedIntensity]);
          } else if(trafficIndex >=4) {
            // 4 ou 5
            heatPointsRed.push([lat, lon, fixedIntensity]);
          }
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Erro ao processar GeoJSON para ${address.nomeEndereco}:`, e);
    }
  });

  heatmapLayerBlue.setLatLngs(heatPointsBlue);
  heatmapLayerOrange.setLatLngs(heatPointsOrange);
  heatmapLayerRed.setLatLngs(heatPointsRed);
}

function updateMapData() {
  addRegionsToMap(props.regionData);
  addRadarsToMap(props.radarData);
  addAddressesToMap(props.addressData);
}

// Reage às mudanças nos dados
watch(
  [() => props.regionData, () => props.radarData, () => props.addressData],
  () => {
    updateMapData();
  },
  { deep: true }
);

onMounted(() => {
  if (!mapInstance) {
    // Cria o Mapa
    mapInstance = L.map("mapa-principal").setView(center, zoom);

    baseTileLayer = L.tileLayer(tileUrl, { attribution: attribution });
    baseTileLayer.addTo(mapInstance);

    regionsLayerGroup = L.layerGroup().addTo(mapInstance);
    radarsLayerGroup = L.layerGroup().addTo(mapInstance);

    const heatOptions = {
      radius: 50,
      blur: 30,
      maxZoom: 18,
    };

    heatmapLayerBlue = L.heatLayer([], {
      ...heatOptions,
      gradient: { 1.0: "blue" },
    }).addTo(mapInstance);

    heatmapLayerOrange = L.heatLayer([], {
      ...heatOptions,
      gradient: { 1.0: "orange" },
    }).addTo(mapInstance);

    heatmapLayerRed = L.heatLayer([], {
      ...heatOptions,
      gradient: { 1.0: "red" },
    }).addTo(mapInstance);

    const baseMaps = {
      "Mapa Padrão": baseTileLayer,
    };

    const overlayMaps = {
      Regiões: regionsLayerGroup,
      Radares: radarsLayerGroup,
      "Tráfego (Médio)": heatmapLayerOrange,
      "Tráfego (Alto)": heatmapLayerRed,
    }; // 6. Adiciona o controle de camadas ao mapa

    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(mapInstance);

    mapInstance.on("click", (e) => {
      if (!e.originalEvent.regionClicked) {
        selectRegion(null);
      }
    });
  }

  updateMapData();

  if (props.regionData.length > 0 && regionsLayerGroup) {
    setTimeout(() => {
      regionsLayerGroup.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties.name === props.regionData[0].regionName) {
          selectRegion({ ...layer.feature.properties, layer: layer });
          return;
        }
      });
    }, 100);
  }
});

onBeforeUnmount(() => {
  if (layerControl) {
    layerControl.remove();
    layerControl = null;
  }
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  regionsLayerGroup = null;
  radarsLayerGroup = null;
  heatmapLayerBlue = null;
  heatmapLayerOrange = null;
  heatmapLayerRed = null;
  baseTileLayer = null;
});
</script>

<style scoped>
#mapa-principal {
  height: 100%;
  width: 100%;
}

:deep(.leaflet-interactive) {
  cursor: pointer;
}
</style>
