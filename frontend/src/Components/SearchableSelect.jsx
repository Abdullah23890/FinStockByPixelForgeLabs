import { useState, useRef, useEffect } from "react";
import "../Css/SearchableSelect.css";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Search...",
  getLabel = (o) => o.name,
  getSubLabel = null,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  const selected = options.find((o) => o._id === value);

  const filtered = options.filter((o) =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(option) {
    onChange(option._id);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="pfl-sselect" ref={wrapRef}>
      <button
        type="button"
        className={`pfl-sselect__trigger ${disabled ? "is-disabled" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        <span className={selected ? "" : "pfl-sselect__placeholder"}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <span className="pfl-sselect__caret">▾</span>
      </button>

      {open && (
        <div className="pfl-sselect__dropdown">
          <input
            autoFocus
            type="text"
            className="pfl-sselect__search"
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="pfl-sselect__list">
            {filtered.length === 0 && (
              <div className="pfl-sselect__empty">No matches found.</div>
            )}
            {filtered.map((o) => (
              <button
                type="button"
                key={o._id}
                className={`pfl-sselect__option ${o._id === value ? "is-selected" : ""}`}
                onClick={() => handleSelect(o)}
              >
                <span>{getLabel(o)}</span>
                {getSubLabel && <span className="pfl-sselect__sub">{getSubLabel(o)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}