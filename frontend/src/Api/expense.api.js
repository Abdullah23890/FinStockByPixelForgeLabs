import Api from "../Axios/axios.js";

export const getExpenses = () => { 
    return Api.get("/expenses");
}

export const getExpenseById = (id, data) => { 
    return Api.get(`/expenses/${id}`, data);
}

export const createExpense = (data) => {
  return Api.post("/expenses", data);
}

export const updateExpense = (id, data) => {
  return Api.put(`/expenses/${id}`, data);
}

export const deleteExpense = (id) => {
  return Api.delete(`/expenses/${id}`);
}