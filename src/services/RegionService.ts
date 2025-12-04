import api from "./api";

interface RegionData {
  regionName: string;
  areaRegiao: string;
  trafficIndex: number;
  securityIndex: number;
  overallIndex: number;
  vehicleTypeCounts: { [key: string]: number };
}

interface RegionParams {
  minutes?: number;
  timestamp?: string;
}

const regionService = {
  async getAll(params: RegionParams = {}): Promise<{ data: RegionData[] }> {
    const queryParams = new URLSearchParams();

    if (params.minutes !== undefined) {
      queryParams.append('minutes', params.minutes.toString());
    }

    if (params.timestamp) {
      queryParams.append('timestamp', params.timestamp);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/regions?${queryString}` : '/regions';

    const response = await api.get(url);
    return response;
  }
};

export default regionService;
