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
  startTime: string;
  endTime: string;
  readings: null;
  totalReadings: number;
  averageSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  index: null;
  vehicleTypeCounts: VehicleTypeCounts;
}

export interface VehicleDataParams {
  minutes?: number;
  timestamp?: string;
  regions?: string[];
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

    return api.get<ReadingData[]>("/reading/address/region", {
      params: requestParams
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

    return api.get<ReadingData[]>("/reading", {
      params: requestParams
    });
  },
};

export default readingService;
