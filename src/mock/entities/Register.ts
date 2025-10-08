import type { VehicleType } from "./VehicleType.ts";
import type { Radar } from "./Radar.ts";

export interface Register {
  id: number;
  radarId: string;
  timestamp: string;
  vehicleType: VehicleType;
  speed: number;
  radar?: Radar;
}
