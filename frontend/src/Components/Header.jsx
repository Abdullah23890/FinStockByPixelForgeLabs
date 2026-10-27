import { useEffect, useRef, useState } from "react";
import "../Css/Header.css";
import { IconPhoneOutline } from "./Icons";
import { useAuth } from "../Context/AuthContext";

import {
  getDeveloperContact
} from "../Api/developer.api.js";

export default function Header({ pageTitle, pageSubtitle }) {
  const { user } = useAuth();


  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState([]);

  const dropdownRef = useRef(null);


  async function loadContact() {
    setLoading(true);
    try {
      const res = await getDeveloperContact();
      setContact(res.data.data || []);
    } catch (err) {
      console.error("Failed to load developer contact:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleDropdown() {
    const next = !open;
    setOpen(next);
    if (next) loadContact();
  }

  return (
    <header className="pfl-main__topbar">
      <div className="pfl-main__heading">
        <h1 className="pfl-main__title">{pageTitle}</h1>
        {pageSubtitle && <p className="pfl-main__subtitle">{pageSubtitle}</p>}
      </div>

      <div className="pfl-main__topbar-actions">
        <div className="pfl-main__notif-wrap" ref={dropdownRef}>
          <button
            className="pfl-main__icon-btn"
            aria-label="Notifications"
            onClick={toggleDropdown}
          >
            <IconPhoneOutline size={18} />
          </button>

          {open && (
            <div className="pfl-main__notif-dropdown">
              <div className="pfl-main__notif-dropdown-head">
                <span>Support Center</span>
              </div>
              <div className="pfl-main__notif-list">
                {loading && (
                  <div className="pfl-main__notif-empty">Loading...</div>
                )}
                {!loading && !contact&& (
                  <div className="pfl-main__notif-empty">
                    No Contact Found
                  </div>
                )}
                {!loading && contact && (
                  <div className="pfl-main__contact-item">
                    <div className="container">
                    <div className="name">
                      <p> Name </p>
                    </div>
                    <div className="namee">
                      <p> {contact.name || "Pixel Forge Labs"} </p>
                    </div>
                  </div>
                  <hr />
                  <div className="container">
                    <div className="name">
                      <p> - </p>
                    </div>
                    <div className="namee">
                      <p> {contact.tagLine || "Design. Develop. Deliver."} </p>
                    </div>
                  </div>
                  <hr />
                  <div className="container">
                    <div className="name">
                      <p> Email </p>
                    </div>
                    <div className="namee">
                      <p> <a href="https://mailto://pixelforgelabs.11@gmail.com" target="_blank"> {contact.email || "pixelforgelabs.11@gmail.com"} </a> </p>
                    </div>
                  </div>
                  <hr />
                  <div className="container">
                    <div className="name">
                      <p> Whatsapp </p>
                    </div>
                    <div className="namee">
                      <p> <a href="https://wa.me/923243933699" target="_blank"> {contact.phone || "03243933699"} </a> </p>
                    </div>
                  </div>
                  <hr />
                  <div className="container">
                    <div className="name">
                      <p> Website </p>
                    </div>
                    <div className="namee">
                      <p> <a href="https://pixelforgelabs.edgeone.app" target="_blank"> {contact.website || "pixelforgelabs.edgeone.app"} </a> </p>
                    </div>
                  </div></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* {user && (
          <div className="pfl-main__user-chip">
            <span className="pfl-main__user-avatar">{(user.name || "U").charAt(0)}</span>
            <span className="pfl-main__user-name">{user.name}</span>
          </div>
        )} */}
      </div>
    </header>
  );
}