import Api from "../Axios/axios.js";

export const getDashboard = () => {
    return Api.get("/dashboard");
}