import api from "./api";
import type { ReadingAggregate } from "@/entities/ReadingAggregate";

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

    return api.get<ReadingAggregate[]>("/reading/series", {
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

    return api.get<ReadingAggregate[]>("/reading/series", {
      params: requestParams,
      signal: params?.signal
    });
  },
};

export default readingService;
