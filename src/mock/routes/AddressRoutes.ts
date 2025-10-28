import addressesData from "@/mock/seeds/addressSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { Address } from "@/mock/entities/Address";

const addresses: Address[] = [...addressesData];

const addressRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/address",
      result: (_request) => {
        const response = addresses;

        return APIFailureWrapper({
          content: response,
          errorMessage: "Erro ao listar endereços",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "get",
      url: "/address/:id",
      result: (request) => {
        const address = addresses.find((addr) => addr.id === parseInt(request.params.id));

        return APIFailureWrapper({
          content: address,
          errorMessage: "Erro ao listar endereço",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/address",
      result: (request) => {
        const body = JSON.parse(request.requestBody);

        const newAddress: Address = {
          id: addresses.length + 1,
          addr: body.addr,
          neighborhood: body.neighborhood,
          region: body.region,
        };

        addresses.push(newAddress);

        return APIFailureWrapper({
          content: newAddress,
          errorMessage: "Erro ao criar endereço",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "put",
      url: "/address/:id",
      result: (request) => {
        const body = JSON.parse(request.requestBody);
        let editedAddress: Address | undefined;

        addresses.forEach((address) => {
          if (address.id === parseInt(request.params.id)) {
            editedAddress = address;
            address.addr = body.addr || address.addr;
            address.neighborhood = body.neighborhood || address.neighborhood;
            address.region = body.region || address.region;
          }
        });

        return APIFailureWrapper({
          content: editedAddress,
          errorMessage: "Erro ao editar endereço",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "delete",
      url: "/address/:id",
      result: (request) => {
        let addressToDelete: Address | undefined;

        for (let index = 0; index < addresses.length; index++) {
          if (addresses[index].id === parseInt(request.params.id)) {
            addressToDelete = addresses.splice(index, 1)[0];
            break;
          }
        }

        return APIFailureWrapper({
          content: addressToDelete,
          errorMessage: "Erro ao deletar endereço",
        });
      },
    },
    "on"
  ),
];

export default addressRoutes;
