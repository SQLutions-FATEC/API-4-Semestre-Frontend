import { ref, onMounted } from "vue";
import type { VehicleTypeCounts } from "../entities/VehicleTypeCounts";
import type { ReadingAggregate } from "../entities/ReadingAggregate";

// --- Interfaces (Reutilizáveis) ---

interface addressProps {
  nomeEndereco: string;
  areaRuaGeoJson: string;
  trafficIndex: number;
  message:string
}

interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros: VehicleTypeCounts;
}

interface citySummary {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros: VehicleTypeCounts;
}


export function useMapData() {
  const addressData = ref<addressProps[]>([]);
  const radarData = ref([]);
  const regionData = ref<regionProps[]>([]);
  const citySummaryData = ref<citySummary | null>(null);

  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  async function fetchCitySummary() {
    try {
      const responseIndex = await fetch("http://localhost:8080/index?minutes=10");
      if (!responseIndex.ok) {
        throw new Error(`Erro HTTP Índices: ${responseIndex.status}`);
      }
      const dataIndex = await responseIndex.json();

      const responseVehicle = await fetch("http://localhost:8080/reading/series?minutes=59");
      if (!responseVehicle.ok) {
        throw new Error(`Erro HTTP Veículos: ${responseVehicle.status}`);
      }
      const dataVehicleReadings: ReadingAggregate[] = await responseVehicle.json();

      const totalVehicleCounts: VehicleTypeCounts = {};
      dataVehicleReadings.forEach((reading: ReadingAggregate) => {
        if (reading.vehicleTypeCounts) {
          for (const type in reading.vehicleTypeCounts) {
            const t = type as keyof VehicleTypeCounts;
            const count: number = reading.vehicleTypeCounts[t] || 0;
            totalVehicleCounts[t] = (totalVehicleCounts[t] || 0) + count;
          }
        }
      });

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
        ListaCarros: totalVehicleCounts,
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
      const [responseRegions, responseRadars, responseAddresses, _citySummaryResult] = await Promise.all([
        fetch("http://localhost:8080/regions"),
        fetch("http://localhost:8080/radars"),
        fetch("http://localhost:8080/address/heatmap"),
        fetchCitySummary(), // Função que retorna uma Promise<boolean>
      ]);

      // 2. Processa as respostas
      if (!responseRegions.ok) {
        throw new Error(`Erro HTTP Regiões: ${responseRegions.status} ${responseRegions.statusText}`);
      }
      regionData.value = await responseRegions.json();

      if (!responseRadars.ok) {
        throw new Error(`Erro HTTP Radares: ${responseRadars.status} ${responseRadars.statusText}`);
      }
      radarData.value = await responseRadars.json();

      if (!responseAddresses.ok) {
        throw new Error(`Erro HTTP Endereços: ${responseAddresses.status} ${responseAddresses.statusText}`);
      }
      addressData.value = await responseAddresses.json();
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
