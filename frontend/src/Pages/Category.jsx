import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import CategoryForm from "../Components/CategoryForm";
import CategoryTable from "../Components/CategoryTable";
import CategoryProfile from "../Components/CategoryProfile";
import SidePanel from "../Components/SidePanel";

import { 
    createCategory, 
    getCategories, 
    getCategoryById,
    updateCategory, 
    deleteCategory 
} from "../Api/category.api.js";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [profileCategory, setProfileCategory] = useState(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openAddForm() {
    setEditingCategory(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(category) {
    setProfileCategory(null);
    setEditingCategory(category);
    setFormError("");
    setShowForm(true);
  }

  function openProfile(category) {
    setProfileCategory(category);
  }

  function closeProfile() {
    setProfileCategory(null);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
      } else {
        await createCategory(payload);
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete "${category.name}"? This can't be undone.`)) return;
    try {
      await deleteCategory(category._id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category.");
    }
  }

  return (
    <>
      <MainContent
        pageTitle="Categories"
        pageSubtitle="Organize your products into categories."
        sections={[
          {
            id: "category-management",
            title: showForm ? (editingCategory ? "Edit Category" : "Add New Category") : null,
            content: showForm ? (
              <CategoryForm
                initialData={editingCategory}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <CategoryTable
                categories={categories}
                loading={loading}
                onAddNew={openAddForm}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onProfile={openProfile}
              />
            ),
          },
        ]}
      />

      <SidePanel open={profileCategory !== null} onClose={closeProfile} title="Category Details">
        <CategoryProfile
          category={profileCategory}
          onClose={closeProfile}
          onEdit={(category) => openEditForm(category)}
        />
      </SidePanel>
    </>
  );
}