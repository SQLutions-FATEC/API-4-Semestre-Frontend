import api from "@/services/api";

export interface IndexData {
  combinedIndex: number;
  trafficIndex: number;
  securityIndex: number;
}

interface AxiosError {
  response?: {
    status: number;
  };
}

export const indexService = {
  async getCityIndex(options?: { minutes?: number }): Promise<IndexData> {
    const startMinutes = options?.minutes || 5;
    const maxMinutes = options?.minutes || 30;

    for (let minutes = startMinutes; minutes <= maxMinutes; minutes += 5) {
      try {
        const response = await api.get(`/index`, {
          params: { minutes },
        });
        return response.data;
      } catch (error: unknown) {
        if ((error as AxiosError)?.response?.status === 404 && minutes < maxMinutes) {
          continue;
        }
        throw error;
      }
    }
    throw new Error('Não foi possível obter dados da cidade após tentativas');
  },

  async getRegionIndex(region: string, options?: { minutes?: number }): Promise<IndexData> {
    const startMinutes = options?.minutes || 5;
    const maxMinutes = options?.minutes || 30;

    for (let minutes = startMinutes; minutes <= maxMinutes; minutes += 5) {
      try {
        const response = await api.get(`/index/region`, {
          params: { minutes, region },
        });
        return response.data;
      } catch (error: unknown) {
        if ((error as AxiosError)?.response?.status === 404 && minutes < maxMinutes) {
          continue;
        }
        throw error;
      }
    }
    throw new Error('Não foi possível obter dados da região após tentativas');
  },

  // Pega o índice de um ou mais radares pelo ID
  async getRadarIndexes(radarIds: string[], minutes = 5): Promise<IndexData> {
    const response = await api.get(`/index/radar`, {
      params: { minutes, radars: radarIds },
    });
    return response.data;
  }
};
