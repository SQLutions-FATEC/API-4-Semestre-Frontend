import api from "@/services/api";

export interface IndexData {
  combinedIndex: number;
  trafficIndex: number;
  securityIndex: number;
}

export const indexService = {
  // Pega o índice geral da cidade
  async getCityIndex(minutes = 5): Promise<IndexData> {
    const response = await api.get(`/index`, {
      params: { minutes },
    });
    return response.data;
  },

  // Pega o índice de uma região específica
  async getRegionIndex(region: string, minutes = 5): Promise<IndexData> {
    const response = await api.get(`/index/region`, {
      params: { minutes, region },
    });
    return response.data;
  },

  // Pega o índice de um ou mais radares pelo ID
async getRadarIndexes(radarIds: string[], minutes = 5): Promise<IndexData> {
  const response = await api.get(`/index/radar`, {
    params: { minutes, radars: radarIds },
  });
  return response.data;
}

};
