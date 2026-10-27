import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainContent from "../Components/MainContent";
import CustomerForm from "../Components/CustomerForm";
import CustomerTable from "../Components/CustomerTable";
import CustomerProfile from "../Components/CustomerProfile";
import SidePanel from "../Components/SidePanel";

import { 
    createCustomer, 
    getCustomers, 
    updateCustomer
} from "../Api/customer.api.js";

export default function Customer() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [profileCustomer, setProfileCustomer] = useState(null);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.data.data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function openAddForm() {
    setEditingCustomer(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(customer) {
    setProfileCustomer(null);
    setEditingCustomer(customer);
    setFormError("");
    setShowForm(true);
  }

  function openProfile(customer) {
    setProfileCustomer(customer);
  }

  function closeProfile() {
    setProfileCustomer(null);
  }

  function openLedger(customer) {
    navigate(`/customers/${customer._id}/ledger`);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
      } else {
        await createCustomer(payload);
      }
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

//   async function handleDelete(customer) {
//     if (!window.confirm(`Delete "${customer.name}"? This can't be undone.`)) return;
//     try {
//       await deleteCustomer(customer._id);
//       loadCustomers();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to delete customer.");
//     }
//   }

  return (
    <>
      <MainContent
        pageTitle="Customers"
        pageSubtitle="Manage retail, wholesale, and parlor customers."
        sections={[
          {
            id: "customer-management",
            title: showForm ? (editingCustomer ? "Edit Customer" : "Add New Customer") : null,
            content: showForm ? (
              <CustomerForm
                initialData={editingCustomer}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <CustomerTable
                customers={customers}
                loading={loading}
                onAddNew={openAddForm}
                onEdit={openEditForm}
                // onDelete={handleDelete}
                onProfile={openProfile}
                onLedger={openLedger}
              />
            ),
          },
        ]}
      />

      <SidePanel open={profileCustomer !== null} onClose={closeProfile} title="Customer Details">
        <CustomerProfile
          customer={profileCustomer}
          onClose={closeProfile}
          onEdit={(customer) => openEditForm(customer)}
        />
      </SidePanel>
    </>
  );
}