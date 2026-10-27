import Api from "../Axios/axios.js";

export const getStockAlerts = () => {
    return Api.get("/stockAlerts");
}