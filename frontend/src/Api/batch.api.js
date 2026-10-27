import Api from "../Axios/axios.js";

export const getBatches = () => {
    return Api.get("/batches");
}

export const getNotExpireBatches = () => {
    return Api.get("/batches/getNotExpireBatches");
}