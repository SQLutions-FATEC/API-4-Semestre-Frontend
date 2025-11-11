import type { VehicleTypeCounts } from "./VehicleTypeCounts";
export interface ReadingAggregate {
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