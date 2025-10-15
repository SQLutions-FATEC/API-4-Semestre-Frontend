import api from "@/services/api";

export interface IndexData {
  combinedIndex: number;
  trafficIndex: number;
  securityIndex: number;
}

export const indexService = {
  async getCityIndex(minutes = 5): Promise<IndexData> {
    const response = await api.get(`/indexes`, {
      params: { minutes },
    });
    return response.data;
  },

  async getRegionIndex(region: string, minutes = 5): Promise<IndexData> {
    const response = await api.get(`/indexes/region`, {
      params: { minutes },
      data: region,
    });
    return response.data;
  },

  async getRadarIndexes(radars: any[], minutes = 5): Promise<IndexData> {
    const response = await api.get(`/indexes/radar`, {
      params: { minutes },
      data: radars,
    });
    return response.data;
  },
};
