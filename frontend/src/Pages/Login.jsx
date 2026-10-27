import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { IconExternalLink } from "../Components/Icons";
import "../Css/Login.css";

import { 
  getSetting 
} from "../Api/setting.api.js";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ userName: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [setting, setSettings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  }

useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getSetting();
        setSettings(res.data.data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    loadSettings();
  }, []);

  function validate() {
    const next = {};

    if (!form.userName.trim()) {
      next.userName = "UserName is required";
    }

    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    const result = await login(form.userName.trim(), form.password);

    setSubmitting(false);

    if (result.success) {

      const role = result.user?.role;
      if(role === "admin"){
        navigate("/dashboard");
      } else if(role === "saleManager"){
        navigate("/dashboard");
      } else if(role === "counter"){
        navigate("/sale");
      } else {
        setServerError("Invalid User Role.");
      }
    } else {
      setServerError(result.message);
    }
  }

  return (
    <div className="pfl-login">
      <div className="pfl-login__panel">
        <div className="pfl-login__brand">
          <span className="pfl-login__mark bg-dark" aria-hidden="true">
            <img src={setting?.logo} className="pfl-login__img" />
          </span>
          <span className="pfl-login__brand-name">{setting?.name || "FinStock by Pixel Forge Labs"}</span>
        </div>

        <h1 className="pfl-login__title">Welcome back</h1>
        <p className="pfl-login__subtitle">Log in to manage your POS retail, ledger, and more.</p>

        {serverError && <div className="pfl-login__server-error">{serverError}</div>}

        <form className="pfl-login__form" onSubmit={handleSubmit} noValidate>
          <div className="pfl-login__field">
            <label htmlFor="text">UserName</label>
            <input
              id="userName"
              name="userName"
              type="text"
              placeholder="username"
              value={form.userName}
              onChange={handleChange}
              className={errors.userName ? "is-invalid" : ""}
            />
            {errors.userName && <span className="pfl-login__error">{errors.userName}</span>}
          </div>

          <div className="pfl-login__field">
            <label htmlFor="password">Password</label>
            <div className="pfl-login__password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "is-invalid" : ""}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pfl-login__toggle-visibility"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="pfl-login__error">{errors.password}</span>}
          </div>

          {/* <div className="pfl-login__row">
            <label className="pfl-login__remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="pfl-login__forgot">
              Forgot password?
            </Link>
          </div> */}

          <button type="submit" className="pfl-login__submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <a href="https://pixelforgelabs.edgeone.app" target="_blank" className="pfl-login__web">
            <IconExternalLink size={17} />  Powered By Pixel Forge Labs
        </a>

      </div>
    </div>
  );
}