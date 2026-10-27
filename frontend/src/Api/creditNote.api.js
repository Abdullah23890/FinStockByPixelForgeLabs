import Api from "../Axios/axios.js";

export const getCreditNotes = () => { 
    return Api.get("/customer/creditNotes");
}

export const getCreditNotesByCustomer = (customerId) => { 
    return Api.get(`/customer/creditNotes/customer/${customerId}`);
}

export const useCreditNote = (data) => {
    return Api.post("/customer/creditNotes/use", data);
}