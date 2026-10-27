import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import SidePanel from "../Components/SidePanel";
import ExpenseForm from "../Components/ExpenseForm";
import ExpenseTable from "../Components/ExpenseTable";
import ExpenseView from "../Components/ExpenseView";

import { 
    createExpense, 
    getExpenses, 
    updateExpense, 
    deleteExpense 
} from "../Api/expense.api.js";

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [viewExpense, setViewExpense] = useState(null);

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await getExpenses();
      setExpenses(res.data.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  function openAddForm() {
    setEditingExpense(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(expense) {
    setViewExpense(null);
    setEditingExpense(expense);
    setFormError("");
    setShowForm(true);
  }

  function openView(expense) {
    setViewExpense(expense);
  }

  function closeView() {
    setViewExpense(null);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingExpense) {
        await updateExpense(editingExpense._id, payload);
      } else {
        await createExpense(payload);
      }
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete "${expense.name}"? This can't be undone.`)) return;
    try {
      await deleteExpense(expense._id);
      loadExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete expense.");
    }
  }

  return (
    <>
      <MainContent
        pageTitle="Expenses"
        pageSubtitle="Track your shop's recurring and one-time costs."
        sections={[
          {
            id: "expense-management",
            title: showForm ? (editingExpense ? "Edit Expense" : "Add New Expense") : null,
            content: showForm ? (
              <ExpenseForm
                initialData={editingExpense}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <ExpenseTable
                expenses={expenses}
                loading={loading}
                onAddNew={openAddForm}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onView={openView}
              />
            ),
          },
        ]}
      />

      <SidePanel open={viewExpense !== null} onClose={closeView} title="Expense Details">
        <ExpenseView expense={viewExpense} onClose={closeView} onEdit={openEditForm} />
      </SidePanel>
    </>
  );
}