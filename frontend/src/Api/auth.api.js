import Api from "../Axios/axios.js";

export const loginUser = (data) => {
    return Api.post("/auth", data);
}