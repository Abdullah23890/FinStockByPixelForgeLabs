import Api from "../Axios/axios.js";

export const getDeveloperContact = () => {
    return Api.get("/developer");
}