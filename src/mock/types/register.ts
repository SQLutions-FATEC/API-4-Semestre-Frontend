import type { VehicleType } from './vehycleType';
import type { Radar } from './radar';

export interface Register{
  id: number;
  radarId: string;
  timestamp: string;
  vehicleType: VehicleType;
  speed: number;
  radar?: Radar;
}