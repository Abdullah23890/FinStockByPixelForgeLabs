import Api from "../Axios/axios.js";

export const getSupplierCreditNotes = () => {
  return Api.get("/supplier/creditNotes");
}

export const getSupplierCreditNotesBySupplier = (supplierId) => {
  return Api.get(`/supplier/creditNotes/${supplierId}`);
}