import { ref, onMounted } from "vue";
import type { VehicleTypeCounts } from "../entities/VehicleTypeCounts";
import type { Radar } from "../entities/Radar";
import { indexService } from "@/services/IndexService";
import radarService from "@/services/RadarService";
import regionService from "@/services/RegionService";
import api from "@/services/api";

// --- Interfaces (Reutilizáveis) ---

interface RegionApiResponse {
  regionName: string;
  areaRegiao: string;
  trafficIndex: number;
  securityIndex: number;
  overallIndex: number;
  vehicleTypeCounts: { [key: string]: number };
}

interface addressProps {
  nomeEndereco: string;
  areaRuaGeoJson: string | null;
  trafficIndex: number;
  securityIndex: number;
  overallIndex: number;
  message?: string;
}

interface regionProps {
  regionName: string;
  areaRegiao: string;
  trafficIndex: number;
  securityIndex: number;
  overallIndex: number;
  vehicleTypeCounts: VehicleTypeCounts;

  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
}

interface citySummary {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros?: VehicleTypeCounts;
}


export function useMapData() {
  const addressData = ref<addressProps[]>([]);
  const radarData = ref<Radar[]>([]);
  const regionData = ref<regionProps[]>([]);
  const citySummaryData = ref<citySummary | null>(null);

  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  async function fetchCitySummary() {
    try {
      const dataIndex = await indexService.getCityIndex({ minutes: 10 });

      const overallAvg = (dataIndex.trafficIndex + dataIndex.securityIndex) / 2;
      const estado =
        overallAvg <= 1
          ? "Ótimo"
          : overallAvg <= 3
          ? "Bom"
          : "Ruim";

      citySummaryData.value = {
        name: "Cidade Inteira",
        overall: dataIndex.combinedIndex,
        traffic: dataIndex.trafficIndex,
        security: dataIndex.securityIndex,
        estado: estado,
      };

      return true; // Sucesso
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Falha ao buscar resumo da cidade:", err);
      citySummaryData.value = null;
      throw err; // Rejeita a promise para que o Promise.all falhe ou registre o erro.
    }
  }

  // --- Função principal para buscar todos os dados ---
  async function fetchData() {
    isLoading.value = true;
    error.value = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [heatmapResponse, radarsResponse, regionsResponse, _citySummaryResult] = await Promise.all([
        api.get("/address/heatmap"),
        radarService.getAll(),
        regionService.getAll({ minutes: 10 }),
        fetchCitySummary(), // Função que retorna uma Promise<boolean>
      ]);

      // 2. Processa as respostas
      addressData.value = heatmapResponse.data;
      radarData.value = radarsResponse.data;

      regionData.value = regionsResponse.data.map((region: RegionApiResponse) => {
        const estado = region.overallIndex <= 1 ? "Ótimo" : region.overallIndex <= 3 ? "Bom" : "Ruim";

        return {
          regionName: region.regionName,
          areaRegiao: region.areaRegiao,
          trafficIndex: region.trafficIndex,
          securityIndex: region.securityIndex,
          overallIndex: region.overallIndex,
          vehicleTypeCounts: region.vehicleTypeCounts,

          name: region.regionName,
          overall: region.overallIndex,
          traffic: region.trafficIndex,
          security: region.securityIndex,
          estado: estado,
        };
      });

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('🗺️ Dados processados:', {
          addressCount: addressData.value.length,
          radarCount: radarData.value.length,
          regionCount: regionData.value.length,
          regions: regionData.value
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Falha ao buscar dados do mapa:", err);
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  }

  // Executa a busca de dados ao montar o componente que usar este composable
  onMounted(() => {
    fetchData();
  });

  // Retorna os dados, estados e a função de busca
  return {
    // Dados
    addressData,
    radarData,
    regionData,
    citySummaryData,
    // Estados
    isLoading,
    error,
    // Funções
    fetchData,
  };
}
