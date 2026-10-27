import Api from "../Axios/axios.js";

export const getPurchases = () => {
    return Api.get("/purchases");
}

export const getPurchaseById = (id, data) => {
    return Api.get(`purchases/${id}`, data);
}

export const createPurchase = (data) => {
    return Api.post("/purchases", data);
}

export const updatePurchase = (id, data) => {
    return Api.put(`/purchases/${id}`, data);
}

export const addPurchasePayment = (purchaseId, data) => {
    return Api.post(`/purchases/${purchaseId}/payment`, data);
}