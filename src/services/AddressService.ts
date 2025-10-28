import type { Address } from "@/mock/entities/Address";
import type { AxiosResponse } from "axios";
import api from "./api";

const addressService = {
  get: (addressId: number): Promise<AxiosResponse<Address>> =>
    api.get(`/address/${addressId}`),

  getAll: (): Promise<AxiosResponse<Address[]>> =>
    api.get("/address"),

  create: (payload: Omit<Address, "id">): Promise<AxiosResponse<Address>> =>
    api.post("/address", payload),

  edit: (payload: Address): Promise<AxiosResponse<Address>> =>
    api.put(`/address/${payload.id}`, payload),

  delete: (addressId: number): Promise<AxiosResponse<void>> =>
    api.delete(`/address/${addressId}`),
};

export default addressService;
