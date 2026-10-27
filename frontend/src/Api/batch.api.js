import Api from "../Axios/axios.js";

export const getBatches = () => {
    return Api.get("/batches");
}

export const getBatchesProduct = () => {
    return Api.get("/batches/getBatchesProduct");
}