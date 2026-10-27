import Api from "../Axios/axios.js";

export const createPurchaseReturn = (data) => {
  return Api.post("/supplier/purchaseReturn", data,);
}

export const getPurchaseReturns = () => {
  return Api.get("/supplier/purchaseReturn");
}

export const getPurchaseReturnsByPurchase = (purchaseId) => {
  return Api.get(`/supplier/purchaseReturn/${purchaseId}`);
}