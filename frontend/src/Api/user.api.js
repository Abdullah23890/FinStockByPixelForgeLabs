import Api from "../Axios/axios.js";

export const createUser = (data) => {
    return Api.post("/users", data);
}

export const getUsers = () => {
    return Api.get("/users");
}

export const getUserById = (id, data) => {
    return Api.get(`/users/${id}`, data);
}

export const updateUser = (id, data) => {
    return Api.put(`/users/${id}`, data);
}

export const deleteUser = (id) => {
    return Api.delete(`/users/${id}`);
}