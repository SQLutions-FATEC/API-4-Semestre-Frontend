import radars from "@/mock/seeds/radarSeeds.json";
import addresses from "@/mock/seeds/addressSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { Radar } from "@/mock/types/Radar";

const radarRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/radars",
      result: (_request) => {
        const response = radars.map((radar) => {
          const address = addresses.find((addr) => addr.id === radar.addressId);
          return {
            id: radar.id,
            addressId: radar.addressId,
            latitude: radar.latitude,
            longitude: radar.longitude,
            speedLimit: radar.speedLimit,
            address: address
              ? {
                  addr: address.addr,
                  neighborhood: address.neighborhood,
                }
              : null,
          };
        });

        return APIFailureWrapper({
          content: { items: response, total: response.length },
          errorMessage: "Error fetching radars",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "get",
      url: "/radars/:id",
      result: (request) => {
        const radar = radars.find((r) => r.id === request.params.id);

        if (!radar) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Radar not found",
            specificError: { status: 404, message: "Radar not found" },
            failureRate: 5,
          });
        }

        const address = addresses.find((addr) => addr.id === radar.addressId);

        const response = {
          id: radar.id,
          addressId: radar.addressId,
          latitude: radar.latitude,
          longitude: radar.longitude,
          speedLimit: radar.speedLimit,
          address: address
            ? {
                id: address.id,
                addr: address.addr,
                neighborhood: address.neighborhood,
                region: address.region,
              }
            : null,
        };

        return APIFailureWrapper({
          content: response,
          errorMessage: "Error fetching radar details",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/radars",
      result: (request) => {
        const body = JSON.parse(request.requestBody);

        if (radars.find((r) => r.id === body.id)) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Radar ID already exists",
            specificError: { status: 400, message: "Radar ID already exists" },
            failureRate: 100,
          });
        }

        const newRadar: Radar = {
          id: body.id,
          addressId: body.addressId,
          latitude: body.latitude,
          longitude: body.longitude,
          speedLimit: body.speedLimit,
        };

        radars.push(newRadar);

        return APIFailureWrapper({
          content: newRadar,
          errorMessage: "Error creating radar",
          failureRate: 15,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "put",
      url: "/radars/:id",
      result: (request) => {
        const body = JSON.parse(request.requestBody);
        let editedRadar: Radar | null = null;

        radars.forEach((radar) => {
          if (radar.id === request.params.id) {
            editedRadar = radar;
            radar.addressId = body.addressId || radar.addressId;
            radar.latitude = body.latitude || radar.latitude;
            radar.longitude = body.longitude || radar.longitude;
            radar.speedLimit = body.speedLimit || radar.speedLimit;
          }
        });

        if (!editedRadar) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Radar not found",
            specificError: { status: 404, message: "Radar not found" },
            failureRate: 5,
          });
        }

        return APIFailureWrapper({
          content: editedRadar,
          errorMessage: "Error updating radar",
          failureRate: 15,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "delete",
      url: "/radars/:id",
      result: (request) => {
        let radarToDelete: Radar | null = null;

        for (let i = 0; i < radars.length; i++) {
          if (radars[i].id === request.params.id) {
            radarToDelete = radars.splice(i, 1)[0];
            break;
          }
        }

        if (!radarToDelete) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Radar not found",
            specificError: { status: 404, message: "Radar not found" },
            failureRate: 5,
          });
        }

        return APIFailureWrapper({
          content: radarToDelete,
          errorMessage: "Error deleting radar",
          failureRate: 10,
        });
      },
    },
    "on"
  ),
];

export default radarRoutes;
