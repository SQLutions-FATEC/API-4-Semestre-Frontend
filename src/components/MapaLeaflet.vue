<!-- eslint-disable no-console -->
<template>
  <div id="mapa-principal" />
</template>
<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Wkt from "wicket";
import { onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  regionData: { type: Array, required: true },
  radarData: { type: Array, required: false, default: () => [] },
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
let regionsLayerGroup = null; // Grupo de Regiões
let radarsLayerGroup = null; // Grupo de Radares
let baseTileLayer = null; // Camada de mapa base
let layerControl = null; // NOVO: Instância do controle de camadas

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
  } // Zera o activeLayer antes de processar o novo clique, caso ele seja nulo (desclique no mapa)

  activeLayer = null; // 2. LÓGICA DE MARCAR A NOVA CAMADA (SE EXISTIR)

  if (currentProps) {
    let currentLayer = currentProps.layer; // Se estiver sendo chamada pela inicialização (sem props.layer), encontra a camada

    if (!currentLayer && regionsLayerGroup) {
      // ALTERADO: Adicionado check
      regionsLayerGroup.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties.name === currentProps.name) {
          currentLayer = layer;
        }
      });
    } // 2b. Aplica o destaque na camada atual e atualiza o activeLayer

    if (currentLayer) {
      const currentFillColor = currentProps.name
        ? props.regionColorMap[currentProps.name] || props.regionColorMap["default"]
        : defaultStyle.fillColor;

      currentLayer.setStyle({ ...highlightStyle, fillColor: currentFillColor });
      currentLayer.bringToFront();

      activeLayer = currentLayer; // Atualiza o activeLayer com a nova camada
    } // 2c. Emite o evento para o pai

    emit("region-selected", {
      name: currentProps.name,
      overall: currentProps.overall,
      traffic: currentProps.traffic,
      security: currentProps.security,
      estado: currentProps.estado,
      ListaCarros: currentProps.ListaCarros,
    });
  } else {
    // 3. Emite o evento de desclique para o pai
    emit("region-selected", null);
  }
}

// --- Função para adicionar as regiões ao mapa ---
// --- Função para adicionar as regiões ao mapa ---
function addRegionsToMap(data) {
  // ALTERADO: Apenas continua se o grupo de camadas já existir
  if (!mapInstance || !regionsLayerGroup) return; // 1. Limpa as camadas antigas do grupo

  regionsLayerGroup.clearLayers();

  const wkt = new Wkt.Wkt();
  data.forEach((region) => {
    try {
      wkt.read(region.areaRegiao);
      const geojsonGeometry = wkt.toJson();

      const estado = region.overallIndex == 1 ? "Ótimo" : region.overallIndex <= 3 ? "Bom" : "Ruim";

      // ***** AQUI ESTÁ A CORREÇÃO *****
      // O objeto properties estava com um comentário meu, agora está preenchido
      const geojsonFeature = {
        type: "Feature",
        properties: {
          name: region.regionName,
          traffic: region.trafficIndex,
          security: region.securityIndex,
          overall: region.overallIndex,
          estado: estado,
          ListaCarros: region.vehicleTypeCounts, // Esta linha estava faltando
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
          const props = feature.properties; // Ao clique, EMITE e usa a própria camada do Leaflet para o destaque

          layer.on("click", (e) => {
            // Passa a referência da camada Leaflet junto com as propriedades
            selectRegion({ ...props, layer: layer });
            L.DomEvent.stopPropagation(e);
          });
        },
      }).addTo(regionsLayerGroup); // Adiciona ao Layer Group
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Erro ao processar WKT para a região ${region.regionName}:`, e);
    }
  });
}

// --- Adiciona os radares ao mapa ---
function addRadarsToMap(radars) {
  // ALTERADO: Apenas continua se o grupo de camadas já existir
  if (!mapInstance || !radarsLayerGroup) return; // 1. Limpa as camadas antigas do grupo

  radarsLayerGroup.clearLayers();

  // ALTERADO: O grupo de camadas agora é criado no onMounted
  /* if (radarsLayerGroup) { ... } else { ... }
   */

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

        marker.addTo(radarsLayerGroup); // Adiciona ao Layer Group
      }
    }
  });
}

// ALTERADO: Esta função agora SÓ atualiza os dados
function updateMapData() {
  addRegionsToMap(props.regionData);
  addRadarsToMap(props.radarData);
}

// Reage às mudanças nos dados das regiões ou radares
watch(
  [() => props.regionData, () => props.radarData],
  () => {
    updateMapData(); // ALTERADO: Chama a função de atualização
  },
  { deep: true }
);

onMounted(() => {
  // ALTERADO: Toda a lógica de criação do mapa foi movida para cá.
  // Só cria o mapa se ele não existir
  if (!mapInstance) {
    // 1. Cria o Mapa
    mapInstance = L.map("mapa-principal").setView(center, zoom);

    // 2. Cria e adiciona a camada base (tiles)
    baseTileLayer = L.tileLayer(tileUrl, { attribution: attribution });
    baseTileLayer.addTo(mapInstance);

    // 3. Cria os grupos de camadas (vazios por enquanto)
    // E já os adiciona ao mapa para que o controle os veja
    regionsLayerGroup = L.layerGroup().addTo(mapInstance);
    radarsLayerGroup = L.layerGroup().addTo(mapInstance);

    // 4. NOVO: Define os mapas base e as camadas de overlay
    const baseMaps = {
      "Mapa Padrão": baseTileLayer,
      // Você poderia adicionar outros tiles aqui, ex: "Satélite": sateliteLayer
    };

    const overlayMaps = {
      Regiões: regionsLayerGroup,
      Radares: radarsLayerGroup,
    };

    // 5. NOVO: Adiciona o controle de camadas ao mapa
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(mapInstance);

    // 6. Adiciona o listener de clique no mapa (para deselecionar)
    mapInstance.on("click", () => {
      selectRegion(null);
    });
  }

  // 7. Carrega os dados iniciais
  updateMapData(); // Seleciona a primeira região (lógica original)

  if (props.regionData.length > 0 && regionsLayerGroup) {
    // ALTERADO: Check
    setTimeout(() => {
      regionsLayerGroup.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties.name === props.regionData[0].regionName) {
          selectRegion({ ...layer.feature.properties, layer: layer });
          return; // Para o loop
        }
      });
    }, 100);
  }
});

onBeforeUnmount(() => {
  // NOVO: Remove o controle também
  if (layerControl) {
    layerControl.remove();
    layerControl = null;
  }
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  // Grupos de camada não precisam de .remove(),
  // pois são destruídos junto com o mapInstance
  regionsLayerGroup = null;
  radarsLayerGroup = null;
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
