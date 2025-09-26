import type { Address } from './Address';

export interface Radar {
  id: string;
  addressId: number;
  latitude: number; 
  longitude: number;
  speedLimit: number; 
  address?: Address;
}