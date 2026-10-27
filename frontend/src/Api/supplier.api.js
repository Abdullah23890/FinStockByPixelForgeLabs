import Api from "../Axios/axios.js";

export const createSupplier = (data) => {
    return Api.post("/suppliers", data);
}

export const getSuppliers = () => {
    return Api.get("/suppliers");
}

export const getSupplierById = (id, data) => {
    return Api.get(`/suppliers/${id}`, data);
}

export const getSupplierLedger = (id) => {
    return Api.get(`/suppliers/${id}/ledger`);
}

export const updateSupplier = (id, data) => {
    return Api.put(`/suppliers/${id}`, data);
}

export const deleteSupplier = (id) => {
    return Api.delete(`/suppliers/${id}`);
}