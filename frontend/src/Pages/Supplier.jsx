import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainContent from "../Components/MainContent";
import SupplierForm from "../Components/SupplierForm";
import SupplierTable from "../Components/SupplierTable";
import SupplierProfile from "../Components/SupplierProfile";
import SidePanel from "../Components/SidePanel";

import { 
    createSupplier, 
    getSuppliers, 
    getSupplierById,
    updateSupplier, 
    deleteSupplier 
} from "../Api/supplier.api.js";

export default function Supplier() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [profileSupplier, setProfileSupplier] = useState(null);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data.data);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function openAddForm() {
    setEditingSupplier(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(supplier) {
    setProfileSupplier(null);
    setEditingSupplier(supplier);
    setFormError("");
    setShowForm(true);
  }

  function openProfile(supplier) {
    setProfileSupplier(supplier);
  }

  function closeProfile() {
    setProfileSupplier(null);
  }

  function openLedger(supplier) {
    navigate(`/suppliers/${supplier._id}/ledger`);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, payload);
      } else {
        await createSupplier(payload);
      }
      setShowForm(false);
      loadSuppliers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // async function handleDelete(supplier) {
  //   if (!window.confirm(`Delete "${supplier.name}"? This can't be undone.`)) return;
  //   try {
  //     await deleteSupplier(supplier._id);
  //     loadSuppliers();
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Failed to delete supplier.");
  //   }
  // }

  return (
    <>
      <MainContent
        pageTitle="Suppliers"
        pageSubtitle="Manage vendors and track payables."
        sections={[
          {
            id: "supplier-management",
            title: showForm ? (editingSupplier ? "Edit Supplier" : "Add New Supplier") : null,
            content: showForm ? (
              <SupplierForm
                initialData={editingSupplier}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <SupplierTable
                suppliers={suppliers}
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

      <SidePanel open={profileSupplier !== null} onClose={closeProfile} title="Supplier Details">
        <SupplierProfile
          supplier={profileSupplier}
          onClose={closeProfile}
          onEdit={(supplier) => openEditForm(supplier)}
        />
      </SidePanel>
    </>
  );
}