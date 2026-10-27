import Api from "../Axios/axios.js";

export const createProduct = (data) => {
    return Api.post("/products", data);
}

export const getProducts = () => {
    return Api.get("/products");
}

export const getProductById = (id, data) => {
    return Api.get(`/products/${id}`, data);
}

export const updateProduct = (id, data) => {
    return Api.put(`/products/${id}`, data);
}

export const deleteProduct = (id) => {
    return Api.delete(`/products/${id}`);
}