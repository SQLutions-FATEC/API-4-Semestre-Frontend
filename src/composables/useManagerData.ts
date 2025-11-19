import { ref, computed } from "vue";
import type { VehicleTypeCounts } from "../entities/VehicleTypeCounts";

interface SpeedTimeData {
  [key: string]: number;
}

interface ReadingData {
  timeInterval: string;
  averageSpeed: number;
  totalReadings: number;
  endTime: string;
  startTime: string;
  maxSpeed: number;
  minSpeed: number;
  averageSpeedLimit: number;
  speedingCount: number;
  averageSpeedingAmount: number;
  vehicleTypeCounts: VehicleTypeCounts;
}

export function useManagerData() {
  const vehicleReadingData = ref<ReadingData[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Computed para dados de veículos agregados
  const totalVehicleCounts = computed<VehicleTypeCounts>(() => {
    const totalCounts: VehicleTypeCounts = {};
    vehicleReadingData.value.forEach((reading) => {
      if (reading.vehicleTypeCounts) {
        for (const type in reading.vehicleTypeCounts) {
          const t = type as keyof VehicleTypeCounts;
          const count = reading.vehicleTypeCounts[t] || 0;
          totalCounts[t] = (totalCounts[t] || 0) + count;
        }
      }
    });
    return totalCounts;
  });

  // Computed para dados de velocidade máxima por tempo
  const speedMaxByTime = computed<SpeedTimeData>(() => {
    const speedData: SpeedTimeData = {};
    vehicleReadingData.value.forEach((reading) => {
      if (reading.maxSpeed && reading.endTime) {
        const timePart = reading.endTime.split("T")[1];
        speedData[timePart] = Math.trunc(reading.maxSpeed);
      }
    });
    return speedData;
  });

  // Computed para dados de velocidade média por tempo
  const speedAvgByTime = computed<SpeedTimeData>(() => {
    const speedData: SpeedTimeData = {};
    vehicleReadingData.value.forEach((reading) => {
      if (reading.averageSpeed && reading.endTime) {
        const timePart = reading.endTime.split("T")[1];
        speedData[timePart] = Math.trunc(reading.averageSpeed);
      }
    });
    return speedData;
  });

  async function fetchReadingData(minutes = 59) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`http://localhost:8080/reading/series?minutes=${minutes}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      vehicleReadingData.value = await response.json();
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // Estados
    isLoading,
    error,
    // Dados computados
    totalVehicleCounts,
    speedMaxByTime,
    speedAvgByTime,
    // Dados brutos (caso necessário)
    vehicleReadingData,
    // Funções
    fetchReadingData,
  };
}
