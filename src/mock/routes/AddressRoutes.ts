import addresses from "@/mock/seeds/addressSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { MirageRequest } from "../types";

const addressRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/addresses",
      result: (request: MirageRequest) => {
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
];

export default addressRoutes;
