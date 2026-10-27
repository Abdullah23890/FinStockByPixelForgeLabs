import "../Css/ProductProfile.css";

export default function ProductProfile({ product, onEdit, onClose }) {
  if (!product) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-prprofile">
      <div className="pfl-prprofile__head">
        <div>
          <h4>{product.name}</h4>
          <span className="pfl-prprofile__category">{product.category?.name || "—"}</span>
        </div>
        <span className={`pfl-prprofile__status pfl-prprofile__status--${product.status}`}>
          {product.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="pfl-prprofile__barcode">
        <label>Barcode</label>
        <span>{product.barcode}</span>
      </div>

      <div className="pfl-prprofile__prices">
        <div className="pfl-prprofile__price-item">
          <label>Retail</label>
          <span>PKR {Number(product.retailPrice || 0).toLocaleString()}</span>
        </div>
        <div className="pfl-prprofile__price-item">
          <label>Wholesale</label>
          <span>PKR {Number(product.wholesalePrice || 0).toLocaleString()}</span>
        </div>
        {/* <div className="pfl-prprofile__price-item">
          <label>Parlor</label>
          <span>PKR {Number(product.parlorPrice || 0).toLocaleString()}</span>
        </div> */}
      </div>

      <div className="pfl-prprofile__grid">
        <div className="pfl-prprofile__item pfl-prprofile__item--full">
          <label>Created By</label>
          <span>{product.createdBy?.name || "—"} - {product.createdBy?.role || "—"}</span>
        </div>
        <div className="pfl-prprofile__item pfl-prprofile__item--full">
          <label>Last Updated By</label>
          <span>{product.updatedBy?.name || "—"} - {product.updatedBy?.role || "—"}</span>
        </div>
        <div className="pfl-prprofile__item">
          <label>Created At</label>
          <span>{fmtDate(product.createdAt)}</span>
        </div>
        <div className="pfl-prprofile__item">
          <label>Last Updated At</label>
          <span>{fmtDate(product.updatedAt)}</span>
        </div>
      </div>

      <div className="pfl-prprofile__actions">
        <button className="pfl-prform__btn pfl-prform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-prform__btn pfl-prform__btn--primary" onClick={() => onEdit?.(product)}>
          Edit Product
        </button>
      </div>
    </div>
  );
}