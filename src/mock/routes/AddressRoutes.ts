import addressesData from "@/mock/seeds/addressSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { MirageRequest } from "../types";
import type { Address } from "@/mock/types/Address";

const addresses: Address[] = [...addressesData];

const addressRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/addresses",
      result: (_request: MirageRequest) => {
        const response = addresses.map((address) => ({
          id: address.id,
          addr: address.addr,
          neighborhood: address.neighborhood,
          region: address.region,
        }));

        return APIFailureWrapper({
          content: { items: response, total: response.length },
          errorMessage: "Error fetching addresses",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "get",
      url: "/addresses/:id",
      result: (request: MirageRequest) => {
        const addressId = parseInt(request.params.id);
        const address = addresses.find((addr) => addr.id === addressId);

        if (!address) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Address not found",
            specificError: { status: 404, message: "Address not found" },
            failureRate: 5,
          });
        }

        return APIFailureWrapper({
          content: address,
          errorMessage: "Error fetching address details",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/addresses",
      result: (request: MirageRequest) => {
        const body = JSON.parse(request.requestBody);

        if (!body.addr) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Address (addr) is required",
            specificError: { status: 400, message: "Address is required" },
            failureRate: 100,
          });
        }

        const existingAddress = addresses.find(
          (addr) => addr.addr.toLowerCase() === body.addr.toLowerCase()
        );

        if (existingAddress) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Address already exists",
            specificError: { status: 400, message: "Address already registered" },
            failureRate: 100,
          });
        }

        const newAddress: Address = {
          id: Math.max(...addresses.map((addr) => addr.id), 0) + 1,
          addr: body.addr,
          neighborhood: body.neighborhood || "",
          region: body.region || "",
        };

        addresses.push(newAddress);

        return APIFailureWrapper({
          content: newAddress,
          errorMessage: "Error creating address",
          failureRate: 15,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "put",
      url: "/addresses/:id",
      result: (request: MirageRequest) => {
        const addressId = parseInt(request.params.id);
        const body = JSON.parse(request.requestBody);
        let editedAddress: Address | undefined;

        addresses.forEach((address) => {
          if (address.id === addressId) {
            editedAddress = address;
            address.addr = body.addr || address.addr;
            address.neighborhood = body.neighborhood || address.neighborhood;
            address.region = body.region || address.region;
          }
        });

        if (!editedAddress) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Address not found",
            specificError: { status: 404, message: "Address not found" },
            failureRate: 5,
          });
        }

        return APIFailureWrapper({
          content: editedAddress,
          errorMessage: "Error updating address",
          failureRate: 15,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "delete",
      url: "/addresses/:id",
      result: (request: MirageRequest) => {
        const addressId = parseInt(request.params.id);
        let addressToDelete: Address | null = null;

        for (let i = 0; i < addresses.length; i++) {
          if (addresses[i].id === addressId) {
            addressToDelete = addresses.splice(i, 1)[0];
            break;
          }
        }

        if (!addressToDelete) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Address not found",
            specificError: { status: 404, message: "Address not found" },
            failureRate: 5,
          });
        }

        return APIFailureWrapper({
          content: addressToDelete,
          errorMessage: "Error deleting address",
          failureRate: 10,
        });
      },
    },
    "on"
  ),
];

export default addressRoutes;
