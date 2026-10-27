import { useEffect, useRef, useState } from "react";
import { getProducts } from "../Api/product.api.js";
import { getBatches } from "../Api/batch.api.js";
import MainContent from "../Components/MainContent.jsx";
import "../Css/ScanPage.css";

export default function WorkshopScan() {
  const [products, setProducts] = useState([]);
  const [batchesByProduct, setBatchesByProduct] = useState({});
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([getProducts(), getBatches()]).then(([pRes, bRes]) => {
      setProducts(pRes.data.data);
      const map = {};
      for (const b of bRes.data.data) {
        const pid = b.product?._id || b.product;
        if (!map[pid]) map[pid] = [];
        map[pid].push(b);
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
    const totalQty = batches.reduce((sum, b) => sum + Number(b.quantity || 0), 0);

    setResult({ product, batches, totalQty });
    setError("");
    setBarcode("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <MainContent
      pageTitle="Workshop Scan"
      pageSubtitle="Scan a product to see full stock and pricing details."
      sections={[
        {
          id: "workshop-scan",
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
                <div className="pfl-scanpage__card pfl-scanpage__card--workshop">
                  <div className="pfl-scanpage__ws-head">
                    <h2>{result.product.name}</h2>
                    <span className="pfl-scanpage__barcode">{result.product.barcode}</span>
                  </div>

                  <div className="pfl-scanpage__ws-prices">
                    <div>
                      <label>Retail</label>
                      <span>PKR {Number(result.product.retailPrice || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <label>Wholesale</label>
                      <span>PKR {Number(result.product.wholesalePrice || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <label>Parlor</label>
                      <span>PKR {Number(result.product.parlorPrice || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pfl-scanpage__ws-total-qty">
                    Total Stock: <strong>{result.totalQty}</strong>
                  </div>

                  <div className="pfl-scanpage__ws-batches">
                    <h4>Batches</h4>
                    {result.batches.length === 0 ? (
                      <p className="pfl-scanpage__empty">No batches found for this product.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Batch No</th>
                            <th>Qty</th>
                            <th>Expiry</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.batches.map((b) => (
                            <tr key={b._id}>
                              <td>{b.batchNo}</td>
                              <td>{b.quantity}</td>
                              <td>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}