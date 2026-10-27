import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import ProductForm from "../Components/ProductForm";
import ProductTable from "../Components/ProductTable";
import ProductProfile from "../Components/ProductProfile";
import SidePanel from "../Components/SidePanel";

import { 
  createProduct, 
  getProducts, 
  getProductById,
  updateProduct, 
  deleteProduct 
} from "../Api/product.api.js";
import { 
  getCategories 
} from "../Api/category.api.js";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [profileProduct, setProfileProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openProfile(product){
    setProfileProduct(product);
  }

  function closeProfile(){
    setProfileProduct(null);
  }

  function openAddForm() {
    setEditingProduct(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setProfileProduct(null);
    setEditingProduct(product);
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(product._id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  }

  return (
    <>
    <MainContent
      pageTitle="Products"
      pageSubtitle="Manage products and channel-specific pricing."
      sections={[
        {
          id: "product-management",
          title: showForm ? (editingProduct ? "Edit Product" : "Add New Product") : null,
          content: showForm ? (
            <ProductForm
              initialData={editingProduct}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
              serverError={formError}
            />
          ) : (
            <ProductTable
              products={products}
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
    <SidePanel open={profileProduct !== null} onClose={closeProfile} title="Product Details">
      <ProductProfile
        product={profileProduct}
        onClose={closeProfile}
        onEdit={(product) => openEditForm(product)}
      />
    </SidePanel>
  </>
  );
}