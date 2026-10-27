import Api from "../Axios/axios.js";

export const getCustomers = () => {
    return Api.get("/customers");
}

export const createCustomer = (data) => {
  return Api.post("/customers", data);
}

export const updateCustomer = (id, data) => {
  return Api.put(`/customers/${id}`, data);
}

export const getCustomerLedger = (id) => {
 return Api.get(`/customers/${id}/ledger`);
}