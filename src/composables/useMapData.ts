import { ref, onMounted } from "vue";
import type { VehicleTypeCounts } from "../entities/VehicleTypeCounts";
import type { Radar } from "../entities/Radar";
import { indexService } from "@/services/IndexService";
import radarService from "@/services/RadarService";
import api from "@/services/api";

// --- Interfaces (Reutilizáveis) ---

interface addressProps {
  nomeEndereco: string;
  areaRuaGeoJson: string | null;
  trafficIndex: number;
  securityIndex: number;
  overallIndex: number;
  message?: string;
}

interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros?: VehicleTypeCounts;
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
      const [heatmapResponse, radarsResponse, _citySummaryResult] = await Promise.all([
        api.get("/address/heatmap"),
        radarService.getAll(),
        fetchCitySummary(), // Função que retorna uma Promise<boolean>
      ]);

      // 2. Processa as respostas
      addressData.value = heatmapResponse.data;
      radarData.value = radarsResponse.data;

      const regionMap = new Map<string, {
        traffic: number[],
        security: number[],
        overall: number[],
        count: number
      }>();

      heatmapResponse.data.forEach((address: addressProps) => {
        // Extrai a região do nome do endereço (parte após o último hífen)
        const parts = address.nomeEndereco.split(' - ');
        const region = parts.length > 1 ? parts[parts.length - 1].trim() : 'Região Desconhecida';

        if (!regionMap.has(region)) {
          regionMap.set(region, {
            traffic: [],
            security: [],
            overall: [],
            count: 0
          });
        }

        const regionStats = regionMap.get(region)!;
        regionStats.traffic.push(address.trafficIndex);
        regionStats.security.push(address.securityIndex);
        regionStats.overall.push(address.overallIndex);
        regionStats.count++;
      });

      // Converte o Map em array de regionProps
      regionData.value = Array.from(regionMap.entries()).map(([regionName, stats]) => {
        const avgTraffic = stats.traffic.reduce((a, b) => a + b, 0) / stats.count;
        const avgSecurity = stats.security.reduce((a, b) => a + b, 0) / stats.count;
        const avgOverall = stats.overall.reduce((a, b) => a + b, 0) / stats.count;

        const estado = avgOverall <= 1 ? "Ótimo" : avgOverall <= 3 ? "Bom" : "Ruim";

        return {
          name: regionName,
          overall: Math.round(avgOverall * 100) / 100,
          traffic: Math.round(avgTraffic * 100) / 100,
          security: Math.round(avgSecurity * 100) / 100,
          estado: estado
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
