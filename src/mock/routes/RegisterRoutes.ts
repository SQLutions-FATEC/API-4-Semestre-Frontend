import registersData from "@/mock/seeds/registerSeeds.json";
import radars from "@/mock/seeds/radarSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { Register } from "@/mock/types/Register";
import type { VehicleType } from "@/mock/types/VehicleType";

const registers: Register[] = registersData.map((register) => ({
  ...register,
  vehicleType: register.vehicleType as VehicleType,
}));

const registerRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/registers",
      result: (request) => {
        const queryParams = request.queryParams;
        let filteredRegisters = [...registers];

        const {
          radarId,
          vehicleType,
          startDate,
          endDate,
          minSpeed,
          maxSpeed,
          page = "1",
          limit = "10",
        } = queryParams;

        if (radarId) {
          filteredRegisters = filteredRegisters.filter((r) => r.radarId === radarId);
        }

        if (vehicleType) {
          filteredRegisters = filteredRegisters.filter((r) => r.vehicleType === vehicleType);
        }

        if (startDate) {
          filteredRegisters = filteredRegisters.filter((r) => r.timestamp >= startDate);
        }

        if (endDate) {
          filteredRegisters = filteredRegisters.filter((r) => r.timestamp <= endDate);
        }

        if (minSpeed) {
          filteredRegisters = filteredRegisters.filter((r) => r.speed >= parseInt(minSpeed));
        }

        if (maxSpeed) {
          filteredRegisters = filteredRegisters.filter((r) => r.speed <= parseInt(maxSpeed));
        }

        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedRegisters = filteredRegisters.slice(
          startIndex,
          startIndex + parseInt(limit)
        );

        const response = paginatedRegisters.map((register) => {
          const radar = radars.find((r) => r.id === register.radarId);
          return {
            id: register.id,
            radarId: register.radarId,
            timestamp: register.timestamp,
            vehicleType: register.vehicleType,
            speed: register.speed,
            radar: radar
              ? {
                  id: radar.id,
                  speedLimit: radar.speedLimit,
                }
              : null,
          };
        });

        return APIFailureWrapper({
          content: {
            items: response,
            total: filteredRegisters.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(filteredRegisters.length / parseInt(limit)),
          },
          errorMessage: "Error fetching registers",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "get",
      url: "/registers/:id",
      result: (request) => {
        const id = parseInt(request.params.id);
        const register = registers.find((r) => r.id === id);

        if (!register) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Register not found",
            specificError: { status: 404, message: "Register not found" },
            failureRate: 5,
          });
        }

        const radar = radars.find((r) => r.id === register.radarId);

        const response = {
          id: register.id,
          radarId: register.radarId,
          timestamp: register.timestamp,
          vehicleType: register.vehicleType,
          speed: register.speed,
          radar: radar
            ? {
                id: radar.id,
                addressId: radar.addressId,
                speedLimit: radar.speedLimit,
                latitude: radar.latitude,
                longitude: radar.longitude,
              }
            : null,
        };

        return APIFailureWrapper({
          content: response,
          errorMessage: "Error fetching register details",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/registers",
      result: (request) => {
        const body = JSON.parse(request.requestBody);

        if (!body.radarId || !body.vehicleType || !body.speed) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Radar ID, vehicle type and speed are required",
            specificError: { status: 400, message: "Missing required fields" },
            failureRate: 100,
          });
        }

        const radar = radars.find((r) => r.id === body.radarId);
        if (!radar) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Radar not found",
            specificError: { status: 404, message: "Radar not found" },
            failureRate: 100,
          });
        }

        const newRegister: Register = {
          id: Math.max(...registers.map((r) => r.id), 0) + 1,
          radarId: body.radarId,
          timestamp: new Date().toISOString(),
          vehicleType: body.vehicleType as VehicleType,
          speed: body.speed,
        };

        registers.push(newRegister);

        return APIFailureWrapper({
          content: {
            ...newRegister,
            radar: {
              id: radar.id,
              speedLimit: radar.speedLimit,
            },
          },
          errorMessage: "Error creating register",
          failureRate: 15,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "delete",
      url: "/registers/:id",
      result: (request) => {
        const id = parseInt(request.params.id);
        let registerToDelete: Register | null = null;

        for (let i = 0; i < registers.length; i++) {
          if (registers[i].id === id) {
            registerToDelete = registers.splice(i, 1)[0];
            break;
          }
        }

        if (!registerToDelete) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Register not found",
            specificError: { status: 404, message: "Register not found" },
            failureRate: 5,
          });
        }

        return APIFailureWrapper({
          content: registerToDelete,
          errorMessage: "Error deleting register",
          failureRate: 10,
        });
      },
    },
    "on"
  ),
];

export default registerRoutes;
