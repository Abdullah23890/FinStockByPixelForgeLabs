import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent.jsx";
import UserForm from "../Components/UserForm.jsx";
import UserTable from "../Components/UserTable.jsx";
import UserProfile from "../Components/UserProfile.jsx";
import SidePanel from "../Components/SidePanel.jsx";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../Api/user.api.js";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit — inline, replaces table
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Profile — side panel only
  const [profileUser, setProfileUser] = useState(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openAddForm() {
    setEditingUser(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(user) {
    setProfileUser(null);
    setEditingUser(user);
    setFormError("");
    setShowForm(true);
  }

  function openProfile(user) {
    setProfileUser(user);
  }

  function closeProfile() {
    setProfileUser(null);
  }

  async function handleSubmit(formData) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
      } else {
        await createUser(formData);
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.name}? This can't be undone.`)) return;
    try {
      await deleteUser(user._id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  }

  return (
    <>
      <MainContent
        pageTitle="Users"
        pageSubtitle="Manage staff accounts, roles, and access."
        sections={[
          {
            id: "user-management",
            title: showForm ? (editingUser ? "Edit User" : "Add New User") : null,
            content: showForm ? (
              <UserForm
                initialData={editingUser}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <UserTable
                users={users}
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

      <SidePanel open={profileUser !== null} onClose={closeProfile} title="User Profile">
        <UserProfile
          user={profileUser}
          onClose={closeProfile}
          onEdit={(user) => openEditForm(user)}
        />
      </SidePanel>
    </>
  );
}