import Api from "../Axios/axios.js";

export const createSaleReturn = (data) => {
  return Api.post("customer/saleReturn", data);
}

export const getSaleReturnsBySale = (saleId) => {
  return Api.get(`customer/saleReturn/sale/${saleId}`);
}

export const getSaleReturns = () => {
  return Api.get("customer/saleReturn");
}
