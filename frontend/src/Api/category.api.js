import Api from "../Axios/axios.js";

export const createCategory = (data) => {
    return Api.post("/categories", data);
}

export const getCategories = () => {
    return Api.get("/categories");
}

export const getCategoryById = (id, data) => {
    return Api.get(`/categories/${id}`, data);
}

export const updateCategory = (id, data) => {
    return Api.put(`/categories/${id}`, data);
}

export const deleteCategory = (id) => {
    return Api.delete(`/categories/${id}`);
}