import api from "./api";

export interface VehicleTypeCounts {
  Indefinido?: number;
  Van?: number;
  Camionete?: number;
  Ônibus?: number;
  Moto?: number;
  Carro?: number;
  "Caminhão grande"?: number;
}

export interface ReadingData {
  timeInterval: string,
  averageSpeed: number,
  totalReadings: number,
  endTime: string,
  startTime: string,
  maxSpeed: number,
  minSpeed: number,
  averageSpeedLimit: number,
  speedingCount: number,
  averageSpeedingAmount: number,
  vehicleTypeCounts: VehicleTypeCounts,
}

export interface VehicleDataParams {
  minutes?: number;
  timestamp?: string;
  regions?: string[];
  signal?: AbortSignal;
}

const readingService = {
  getRegionData: (params?: VehicleDataParams) => {
    const requestParams: Record<string, string> = {};

    if (params?.minutes) {
      requestParams.minutes = params.minutes.toString();
    }
    if (params?.regions && params.regions.length > 0) {
      requestParams.regions = params.regions[0];
    }
    if (params?.timestamp) {
      requestParams.timestamp = params.timestamp;
    }

    return api.get<ReadingData[]>("/reading/series", {
      params: requestParams,
      signal: params?.signal
    });
  },

  getCityData: (params?: VehicleDataParams) => {
    const requestParams: Record<string, string> = {};

    if (params?.minutes) {
      requestParams.minutes = params.minutes.toString();
    }
    if (params?.timestamp) {
      requestParams.timestamp = params.timestamp;
    }

    return api.get<ReadingData[]>("/reading/series", {
      params: requestParams,
      signal: params?.signal
    });
  },
};

export default readingService;
