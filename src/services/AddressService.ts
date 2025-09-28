import api from "./api";
import type { Address } from "@/mock/entities/Address";

const addressService = {
  get: (addressId: number) => api.get(`/address/${addressId}`),
  getAll: () => api.get("/address"),
  create: (payload: Omit<Address, "id">) => api.post("/address", payload),
  edit: (payload: Address) => api.put(`/address/${payload.id}`, payload),
  delete: (addressId: number) => api.delete(`/address/${addressId}`),
};

export default addressService;
