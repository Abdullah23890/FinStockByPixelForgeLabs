import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import BatchForm from "../Components/BatchForm";
import BatchTable from "../Components/BatchTable";
import BatchProfile from "../Components/BatchProfile";
import SidePanel from "../Components/SidePanel";

import { 
    getBatches
} from "../Api/batch.api.js";

// import { 
//     getProducts
// } from "../Api/product.api.js";

// import { 
//     getSuppliers 
// } from "../Api/supplier.api.js";

export default function Batch() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [profileBatch, setProfileBatch] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getBatches();
      setBatches(res.data.data);
    } catch (err) {
      console.error("Failed to load batches:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

//   function openAddForm() {
//     setEditingBatch(null);
//     setFormError("");
//     setShowForm(true);
//   }

//   function openEditForm(batch) {
//     setProfileBatch(null);
//     setEditingBatch(batch);
//     setFormError("");
//     setShowForm(true);
//   }

  function openProfile(batch) {
    setProfileBatch(batch);
  }

  function closeProfile() {
    setProfileBatch(null);
  }

//   async function handleSubmit(payload) {
//     setSubmitting(true);
//     setFormError("");
//     try {
//       if (editingBatch) {
//         await updateBatch(editingBatch._id, payload);
//       } 
//       setShowForm(false);
//       loadData();
//     } catch (err) {
//       setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleDelete(batch) {
//     if (!window.confirm(`Delete batch "${batch.batchNo}"? This can't be undone.`)) return;
//     try {
//       await deleteBatch(batch._id);
//       loadData();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to delete batch.");
//     }
//   }

  return (
    <>
      <MainContent
        pageTitle="Batches"
        pageSubtitle="Track stock by batch, purchase price, and expiry."
        sections={[
          {
            id: "batch-management",
            title: showForm ? (editingBatch ? "Edit Batch" : "Add New Batch") : null,
            content: showForm ? (
              <BatchForm
                initialData={editingBatch}
                products={products}
                suppliers={suppliers}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <BatchTable
                batches={batches}
                loading={loading}
                // onAddNew={openAddForm}
                // onEdit={openEditForm}
                // onDelete={handleDelete}
                onProfile={openProfile}
              />
            ),
          },
        ]}
      />

      <SidePanel open={profileBatch !== null} onClose={closeProfile} title="Batch Details">
        <BatchProfile
          batch={profileBatch}
          onClose={closeProfile}
          onEdit={(batch) => openEditForm(batch)}
        />
      </SidePanel>
    </>
  );
}