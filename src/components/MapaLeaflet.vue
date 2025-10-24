<template>
  <div id="mapa-principal" />
</template>

<script setup>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Wkt from 'wicket';
import { onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
    regionData: { type: Array, required: true },
    radarData: { type: Array, required: true },
    regionColorMap: { type: Object, required: true },
    iconeCamera: { type: String, required: true },
});
const emit = defineEmits(['region-selected']);

// --- Configuração do Mapa ---
const zoom = 12;
const center = [-23.179323, -45.865832];
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
let mapInstance = null;
let activeLayer = null;

// Grupos de Camadas para gerenciamento
let regionsLayerGroup = null;
let radarsLayerGroup = null;

// --- Função para selecionar/deselecionar regiões ---
const defaultStyle = {
    color: '#333333',
    weight: 1.5,
    opacity: 0.65,
    fillOpacity: 0.4,
};

const highlightStyle = {
    color: '#000000',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.6,
};

function selectRegion(currentProps) {
    // 1. LÓGICA DE DESMARCAR A CAMADA ANTERIOR
    if (activeLayer) {
        const previousRegionName = activeLayer.feature.properties.name;
        const previousFillColor = props.regionColorMap[previousRegionName] || props.regionColorMap['default'];

        activeLayer.setStyle({ ...defaultStyle, fillColor: previousFillColor });
    }

    // Zera o activeLayer antes de processar o novo clique, caso ele seja nulo (desclique no mapa)
    activeLayer = null;

    // 2. LÓGICA DE MARCAR A NOVA CAMADA (SE EXISTIR)
    if (currentProps) {
        let currentLayer = currentProps.layer;

        // Se estiver sendo chamada pela inicialização (sem props.layer), encontra a camada
        if (!currentLayer) {
             regionsLayerGroup.eachLayer(layer => {
                if (layer.feature && layer.feature.properties.name === currentProps.name) {
                    currentLayer = layer;
                }
             });
        }

        // 2b. Aplica o destaque na camada atual e atualiza o activeLayer
        if (currentLayer) {
            const currentFillColor = currentProps.name ? props.regionColorMap[currentProps.name] || props.regionColorMap['default'] : defaultStyle.fillColor;

            currentLayer.setStyle({ ...highlightStyle, fillColor: currentFillColor });
            currentLayer.bringToFront();

            activeLayer = currentLayer; // Atualiza o activeLayer com a nova camada
        }

        // 2c. Emite o evento para o pai
        emit('region-selected', {
             name: currentProps.name,
             overall: currentProps.overall,
             traffic: currentProps.traffic,
             security: currentProps.security,
             estado: currentProps.estado,
             ListaCarros: currentProps.ListaCarros,
        });
    } else {
        // 3. Emite o evento de desclique para o pai
        emit('region-selected', null);
    }
};

// --- Função para adicionar as regiões ao mapa ---
function addRegionsToMap(data) {
  if (!mapInstance) return;

  // 1. Limpa as camadas antigas do grupo
  if (regionsLayerGroup) {
      regionsLayerGroup.clearLayers();
  } else {
      // Cria o grupo se for a primeira vez
      regionsLayerGroup = L.layerGroup().addTo(mapInstance);
  }

  const wkt = new Wkt.Wkt();
  data.forEach((region) => {
    try {
      wkt.read(region.areaRegiao);
      const geojsonGeometry = wkt.toJson();

      const estado = region.overallIndex == 1 ? 'Ótimo' : region.overallIndex <= 3 ? 'Bom' : 'Ruim';

      const geojsonFeature = {
        type: 'Feature',
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
          const fillColor = props.regionColorMap[regionName] || props.regionColorMap['default'];
          return { ...defaultStyle, fillColor: fillColor };
        },
        onEachFeature: function (feature, layer) {
          const props = feature.properties;

          // Ao clique, EMITE e usa a própria camada do Leaflet para o destaque
          layer.on('click', (e) => {
            // Passa a referência da camada Leaflet junto com as propriedades
            selectRegion({ ...props, layer: layer });
            L.DomEvent.stopPropagation(e);
          });
        },
      }).addTo(regionsLayerGroup); // Adiciona ao Layer Group
    } catch (e) {
      Console.error(`Erro ao processar WKT para a região ${region.regionName}:`, e);
    }
  });

  // Clique no mapa vazio: deseleciona a região ativa
  mapInstance.off('click'); // Remove o listener anterior para evitar duplicação
  mapInstance.on('click', () => {
    selectRegion(null);
  });
}

// --- Adiciona os radares ao mapa ---
function addRadarsToMap(radars) {
  if (!mapInstance) return;

  // 1. Limpa as camadas antigas do grupo
  if (radarsLayerGroup) {
      radarsLayerGroup.clearLayers();
  } else {
      // Cria o grupo se for a primeira vez
      radarsLayerGroup = L.layerGroup().addTo(mapInstance);
  }

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
          `<b>Endereço:</b> ${radar.address?.address ?? 'N/A'}<br>` +
          `<b>Região:</b> ${radar.address?.region ?? 'N/A'}<br>` +
          `<b>Velocidade Máxima:</b> ${radar.regulatedSpeed} km/h`;
        marker.bindPopup(popupContent);

        marker.addTo(radarsLayerGroup); // Adiciona ao Layer Group
      }
    }
  });
}

// Inicialização do mapa
function initializeMap() {
    // Se o mapa não existe, cria
    if (!mapInstance) {
        mapInstance = L.map('mapa-principal').setView(center, zoom);
        L.tileLayer(tileUrl, { attribution: attribution }).addTo(mapInstance);
    }
    addRegionsToMap(props.regionData);
    addRadarsToMap(props.radarData);
}

// Reage às mudanças nos dados das regiões ou radares
watch([() => props.regionData, () => props.radarData], () => {
    initializeMap();
}, { deep: true });


onMounted(() => {
    initializeMap(); // Inicializa na montagem

    if (props.regionData.length > 0) {
        // Encontra a primeira camada no mapa, se existir, e a marca como ativa
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
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
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
