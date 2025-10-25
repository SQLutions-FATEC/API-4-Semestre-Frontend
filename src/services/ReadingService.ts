import api from "./api";

export interface HourlyVehicleData {
  hour: string;
  vehicleCount: number;
  averageSpeed: number;
}

export interface VehicleTypeHourlyData {
  vehicleType: string;
  data: HourlyVehicleData[];
}

export interface HourlyCountParams {
  startTime?: string;
  endTime?: string;
  vehicleType?: string;
  regions?: string[];
}

const readingService = {
  getHourlyCount: (params?: HourlyCountParams) => {
    const requestParams: Record<string, string | string[]> = {};

    if (params?.startTime) {
      requestParams.startTime = params.startTime;
    }
    if (params?.endTime) {
      requestParams.endTime = params.endTime;
    }
    if (params?.vehicleType && params.vehicleType !== "Todos") {
      requestParams.vehicleType = params.vehicleType;
    }
    if (params?.regions && params.regions.length > 0) {
      requestParams.regions = params.regions;
    }

    return api.get<VehicleTypeHourlyData[]>("/reading/hourly-count", {
      params: requestParams
    });
  },
};

export default readingService;
