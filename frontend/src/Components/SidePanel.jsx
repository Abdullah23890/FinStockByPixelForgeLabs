import { useEffect } from "react";
import "../Css/SidePanel.css";

export default function SidePanel({ open, onClose, title, children }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <div className={`pfl-sidepanel__overlay ${open ? "is-open" : ""}`} onClick={onClose}>
      <aside
        className={`pfl-sidepanel ${open ? "is-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pfl-sidepanel__header">
          <h3>{title}</h3>
          <button className="pfl-sidepanel__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="pfl-sidepanel__body">{children}</div>
      </aside>
    </div>
  );
}