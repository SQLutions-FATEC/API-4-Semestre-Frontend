export enum VehicleType {
  CAR = 'Carro',
  PICKUP_TRUCK = 'Camionete',
  BUS = 'Ônibus',
  VAN = 'Van',
  LARGE_TRUCK = 'Caminhão grande',
  MOTORCYCLE = 'Moto',
  UNDEFINED = 'Indefinido'
}

export const VehicleTypeLabel: Record<VehicleType, string> = {
  [VehicleType.CAR]: 'Carro',
  [VehicleType.PICKUP_TRUCK]: 'Camionete',
  [VehicleType.BUS]: 'Ônibus',
  [VehicleType.VAN]: 'Van',
  [VehicleType.LARGE_TRUCK]: 'Caminhão Grande',
  [VehicleType.MOTORCYCLE]: 'Moto',
  [VehicleType.UNDEFINED]: 'Indefinido'
};