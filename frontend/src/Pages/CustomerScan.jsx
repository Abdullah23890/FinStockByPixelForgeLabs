import { useEffect, useRef, useState } from "react";
import { getProducts } from "../Api/product.api.js";
import { getNotExpireBatches } from "../Api/batch.api.js";
import MainContent from "../Components/MainContent.jsx";
import "../Css/ScanPage.css";

export default function CustomerScan() {
  const [products, setProducts] = useState([]);
  const [batchesByProduct, setBatchesByProduct] = useState({});
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([getProducts(), getNotExpireBatches()]).then(([pRes, bRes]) => {
      setProducts(pRes.data.data);
      const map = {};
      for (const b of bRes.data.data) {
        const pid = b.product?._id || b.product;
        if (b.quantity > 0) {
          if (!map[pid]) map[pid] = [];
          map[pid].push(b);
        }
      }
      setBatchesByProduct(map);
    });
    inputRef.current?.focus();
  }, []);

  function handleScan(e) {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;

    const product = products.find((p) => String(p.barcode).trim().toLowerCase() === code.toLowerCase());

    if (!product) {
      setError(`Product not found for barcode: ${code}`);
      setResult(null);
      setBarcode("");
      return;
    }

    const batches = (batchesByProduct[product._id] || []).sort(
      (a, b) => new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0)
    );
    const nearest = batches[0];

    setResult({
      name: product.name,
      retailPrice: product.retailPrice,
      expiryDate: nearest?.expiryDate ? new Date(nearest.expiryDate).toLocaleDateString() : "—",
    });
    setError("");
    setBarcode("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <MainContent
      pageTitle="Customer Scan"
      pageSubtitle="Scan a product to check its price and expiry."
      sections={[
        {
          id: "customer-scan",
          title: null,
          content: (
            <div className="pfl-scanpage">
              <form onSubmit={handleScan} className="pfl-scanpage__form">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan barcode..."
                  autoFocus
                  className="pfl-scanpage__input"
                />
              </form>

              {error && <div className="pfl-scanpage__error">{error}</div>}

              {result && (
                <div className="pfl-scanpage__card pfl-scanpage__card--customer">
                  <h2>{result.name}</h2>
                  <div className="pfl-scanpage__price">PKR {Number(result.retailPrice || 0).toLocaleString()}</div>
                  <div className="pfl-scanpage__expiry">Expiry: {result.expiryDate}</div>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}