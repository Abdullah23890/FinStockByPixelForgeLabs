import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import SettingForm from "../Components/SettingForm";
import { 
    getSetting, 
    createSetting, 
    updateSetting 
} from "../Api/setting.api.js";

export default function Setting() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await getSetting();
      setSettings(res.data.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");
    try {
      const { logoFile, ...rest } = formData;

      let res;
      if (logoFile) {
        const fd = new FormData();
        Object.entries(rest).forEach(([key, value]) => fd.append(key, value));
        fd.append("logo", logoFile);

        res = settings
          ? await updateSetting(settings._id, fd)
          : await createSetting(fd);
      } else {
        res = settings
          ? await updateSetting(settings._id, rest)
          : await createSetting(rest);
      }

      setSettings(res.data.data);
      setSuccessMessage("Settings saved successfully.");
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MainContent
      pageTitle="Settings"
      pageSubtitle="Manage your business profile and receipt details."
      sections={[
        {
          id: "shop-settings",
          title: null,
          content: loading ? (
            <p>Loading settings...</p>
          ) : (
            <SettingForm
              initialData={settings}
              onSubmit={handleSubmit}
              submitting={submitting}
              serverError={formError}
              successMessage={successMessage}
            />
          ),
        },
      ]}
    />
  );
}