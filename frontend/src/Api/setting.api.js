import Api from "../Axios/axios.js";

export const getSetting = () => {
    return Api.get("/settings");
}

export const createSetting = (data) => {
  return Api.post("/settings", data);
}

export const updateSetting = (id, data) => {
  return Api.put(`/settings/${id}`, data);
}