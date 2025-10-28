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
  async getCityIndex(options?: { minutes?: number; timestamp?: string; signal?: AbortSignal }): Promise<IndexData> {
    const startMinutes = options?.minutes || 5;
    const maxMinutes = options?.minutes || 30;

    for (let minutes = startMinutes; minutes <= maxMinutes; minutes += 5) {
      try {
        const params: Record<string, string> = { minutes: minutes.toString() };
        if (options?.timestamp) {
          params.timestamp = options.timestamp;
        }

        const response = await api.get(`/index`, {
          params,
          signal: options?.signal
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

  async getRegionIndex(region: string, options?: { minutes?: number; timestamp?: string; signal?: AbortSignal }): Promise<IndexData> {
    const startMinutes = options?.minutes || 5;
    const maxMinutes = options?.minutes || 30;

    for (let minutes = startMinutes; minutes <= maxMinutes; minutes += 5) {
      try {
        const params: Record<string, string> = {
          minutes: minutes.toString(),
          region
        };
        if (options?.timestamp) {
          params.timestamp = options.timestamp;
        }

        const response = await api.get(`/index/region`, {
          params,
          signal: options?.signal
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

  async getRadarIndexes(radarIds: string[], minutes = 5): Promise<IndexData> {
    const response = await api.get(`/index/radar`, {
      params: { minutes, radars: radarIds },
    });
    return response.data;
  }
};
