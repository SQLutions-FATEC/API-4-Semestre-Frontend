import radarsData from "@/mock/seeds/radarSeeds.json";
import addresses from "@/mock/seeds/addressSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { Radar } from "@/mock/entities/Radar.ts";

const radars: Radar[] = [...radarsData];

const radarRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/radar",
      result: (_request) => {
        const response = radars;

        return APIFailureWrapper({
          content: response,
          errorMessage: "Erro ao listar radares",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "get",
      url: "/radar/:id",
      result: (request) => {
        const radar = radars.find((r) => r.id === request.params.id);

        return APIFailureWrapper({
          content: radar,
          errorMessage: "Erro ao listar radar",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/radar",
      result: (request) => {
        const body = JSON.parse(request.requestBody);

        const newRadar: Radar = {
          id: "CAM00" + radars.length + 1,
          addressId: body.addressId,
          latitude: body.latitude,
          longitude: body.longitude,
          speedLimit: body.speedLimit,
        };

        radars.push(newRadar);

        return APIFailureWrapper({
          content: newRadar,
          errorMessage: "Erro ao criar radar",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "put",
      url: "/radar/:id",
      result: (request) => {
        const body = JSON.parse(request.requestBody);
        let editedRadar: Radar | undefined;

        radars.forEach((radar) => {
          if (radar.id === request.params.id) {
            editedRadar = radar;
            radar.addressId = body.addressId || radar.addressId;
            radar.latitude = body.latitude || radar.latitude;
            radar.longitude = body.longitude || radar.longitude;
            radar.speedLimit = body.speedLimit || radar.speedLimit;
          }
        });

        return APIFailureWrapper({
          content: editedRadar,
          errorMessage: "Erro ao editar radar",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "delete",
      url: "/radar/:id",
      result: (request) => {
        let radarToDelete: Radar | undefined;

        for (let index = 0; index < radars.length; index++) {
          if (radars[index].id === request.params.id) {
            radarToDelete = radars.splice(index, 1)[0];
            break;
          }
        }

        return APIFailureWrapper({
          content: radarToDelete,
          errorMessage: "Erro ao deletar radar",
        });
      },
    },
    "on"
  ),
];

export default radarRoutes;
