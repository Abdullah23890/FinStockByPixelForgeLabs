import Api from "../Axios/axios.js";

export const getSales = () => {
    return Api.get("/sales");
}

export const getSaleById = (id, data) => {
    return Api.get(`/sales/${id}`, data);
}

export const createSale = (data) => {
    return Api.post("/sales", data);
}

export const addSalePayment = (saleId, data) => {
    return Api.post(`/sales/${saleId}/payment`, data);
}

export const deleteSale = (id) => {
    return Api.delete(`/sales/${id}`);
}