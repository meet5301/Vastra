import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { formatINR } from "../utils/currency";

const emptyForm = {
  _id: "",
  name: "",
  price: "",
  description: "",
  category: "Men",
  subCategory: "",
  sizes: "S, M, L, XL",
  colors: "",
  stock: "100",
  image: "",
  isFeatured: "false",
  isActive: "true",
  brand: "",
  brandName: "",
  placementKeys: "",
  tags: "",
  variants: "",
  externalOffers: "",
};

export default function Products() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [variantDraft, setVariantDraft] = useState({
    color: "",
    sku: "",
    stock: "",
    price: "",
    images: "",
    isActive: true,
  });
  const [variantsError, setVariantsError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/products/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (err) {
        setAllProducts([]);
      }
    }
    async function loadBrands() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/brands/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBrands(data.brands || []);
      } catch (err) {
        setBrands([]);
      }
    }
    loadProducts();
    loadBrands();
  }, []);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category ? p.category === category : true;
      return matchSearch && matchCat;
    });
  }, [allProducts, search, category]);

  function toast(msg) {
    const t = document.getElementById("admin-toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
  }

  function parseVariantsJson(raw) {
    if (!raw || !raw.trim()) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Variants must be an array");
    return parsed.map((v) => ({
      color: v.color || "",
      sku: v.sku || "",
      stock: Number(v.stock || 0),
      price: Number(v.price || 0),
      images: Array.isArray(v.images) ? v.images : v.images ? [v.images] : [],
      isActive: v.isActive !== false,
    }));
  }

  function syncVariantsText(list) {
    setFormValues((prev) => ({
      ...prev,
      variants: list.length ? JSON.stringify(list, null, 2) : "",
    }));
  }

  function addVariantFromDraft() {
    if (!variantDraft.color && !variantDraft.sku) {
      setVariantsError("Add at least color or SKU");
      return;
    }
    const next = {
      color: variantDraft.color || "",
      sku: variantDraft.sku || "",
      stock: Number(variantDraft.stock || 0),
      price: Number(variantDraft.price || 0),
      images: variantDraft.images
        ? variantDraft.images.split(",").map((i) => i.trim()).filter(Boolean)
        : [],
      isActive: !!variantDraft.isActive,
    };
    const updated = [...variantsList, next];
    setVariantsList(updated);
    syncVariantsText(updated);
    setVariantDraft({ color: "", sku: "", stock: "", price: "", images: "", isActive: true });
    setVariantsError("");
  }

  function removeVariant(index) {
    const updated = variantsList.filter((_, i) => i !== index);
    setVariantsList(updated);
    syncVariantsText(updated);
  }

  function openAddModal() {
    setFormValues(emptyForm);
    setImageFile(null);
    setVariantsList([]);
    setVariantDraft({ color: "", sku: "", stock: "", price: "", images: "", isActive: true });
    setVariantsError("");
    setModalOpen(true);
  }

  function openEditModal(p) {
    const parsedVariants = p.variants?.length
      ? p.variants.map((v) => ({
        color: v.color || "",
        sku: v.sku || "",
        stock: Number(v.stock || 0),
        price: Number(v.price || 0),
        images: Array.isArray(v.images) ? v.images : v.images ? [v.images] : [],
        isActive: v.isActive !== false,
      }))
      : [];
    setFormValues({
      _id: p._id,
      name: p.name || "",
      price: p.price ?? "",
      description: p.description || "",
      category: p.category || "Men",
      subCategory: p.subCategory || "",
      sizes: p.sizes?.join(", ") || "",
      colors: p.colors?.join(", ") || "",
      stock: p.stock ?? "",
      image: p.image || "",
      isFeatured: p.isFeatured ? "true" : "false",
      isActive: p.isActive ? "true" : "false",
      brand: p.brand || "",
      brandName: p.brandName || "",
      placementKeys: p.placementKeys?.join(", ") || "",
      tags: p.tags?.join(", ") || "",
      variants: p.variants?.length ? JSON.stringify(p.variants, null, 2) : "",
      externalOffers: p.externalOffers?.length ? JSON.stringify(p.externalOffers, null, 2) : "",
    });
    setImageFile(null);
    setVariantsList(parsedVariants);
    setVariantDraft({ color: "", sku: "", stock: "", price: "", images: "", isActive: true });
    setVariantsError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = formValues._id;

    let finalVariants = [];
    if (formValues.variants && formValues.variants.trim()) {
      try {
        finalVariants = parseVariantsJson(formValues.variants);
        setVariantsError("");
      } catch (err) {
        setVariantsError("Invalid variants JSON. Use an array of objects.");
        alert("Invalid variants JSON. Please fix before saving.");
        return;
      }
    } else if (variantsList.length) {
      finalVariants = variantsList;
    }

    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("price", formValues.price);
    formData.append("description", formValues.description);
    formData.append("category", formValues.category);
    formData.append("subCategory", formValues.subCategory);
    formData.append("sizes", formValues.sizes);
    formData.append("colors", formValues.colors);
    formData.append("stock", formValues.stock);
    formData.append("image", formValues.image);
    formData.append("isFeatured", formValues.isFeatured);
    formData.append("isActive", formValues.isActive);
    formData.append("brand", formValues.brand);
    formData.append("brandName", formValues.brandName);
    formData.append("placementKeys", formValues.placementKeys);
    formData.append("tags", formValues.tags);
    formData.append("variants", finalVariants.length ? JSON.stringify(finalVariants) : "");
    formData.append("externalOffers", formValues.externalOffers || "");
    if (imageFile) formData.append("image", imageFile);

    const url = id ? `/api/products/admin/${id}` : "/api/products/admin/create";
    const method = id ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast(id ? "Product updated!" : "Product added!");
        closeModal();
        const refresh = await fetch("/api/products/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refresh.json();
        setAllProducts(refreshData.products || []);
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      alert("Server error");
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/products/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast("Product deleted");
        setAllProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert("Error deleting");
    }
  }

  return (
    <AdminLayout
      active="products"
      title="PRODUCTS"
      topbarContent={<button className="btn btn-black btn-sm" onClick={openAddModal}>+ ADD PRODUCT</button>}
    >
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option>Men</option>
          <option>Women</option>
          <option>Accessories</option>
          <option>Other</option>
        </select>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h3>ALL PRODUCTS <span id="product-count" style={{ color: "#888", fontSize: 12 }}>({filtered.length})</span></h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>STOCK</th>
              <th>BRAND</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={p.image}
                      className="product-img-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/50x60";
                      }}
                    />
                  </td>
                  <td>
                    <strong>{p.name}</strong>{" "}
                    {p.isFeatured ? (
                      <span style={{ fontSize: 10, background: "#000", color: "#fff", padding: "2px 6px" }}>
                        FEATURED
                      </span>
                    ) : null}
                  </td>
                  <td>{formatINR(p.price)}</td>
                  <td>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>{p.brandName || "—"}</td>
                  <td>
                    <span className={`badge badge-${p.isActive ? "active" : "inactive"}`}>
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6, paddingTop: 14 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditModal(p)}>EDIT</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p._id)}>DELETE</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${modalOpen ? "open" : ""}`} id="product-modal">
        <div className="modal">
          <button className="modal-close" onClick={closeModal}>✕</button>
          <h2>{formValues._id ? "EDIT PRODUCT" : "ADD PRODUCT"}</h2>
          <form id="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>PRODUCT NAME *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>PRICE (Rs.) *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="1"
                  required
                  value={formValues.price}
                  onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>DESCRIPTION</label>
              <textarea
                name="description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>BRAND</label>
                <select
                  name="brand"
                  value={formValues.brand}
                  onChange={(e) => {
                    const selected = brands.find((b) => b._id === e.target.value);
                    setFormValues({
                      ...formValues,
                      brand: e.target.value,
                      brandName: selected?.name || "",
                    });
                  }}
                >
                  <option value="">No Brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>CATEGORY</label>
                <select
                  name="category"
                  value={formValues.category}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>SUB CATEGORY</label>
                <input
                  type="text"
                  name="subCategory"
                  placeholder="e.g. Shirts, Dresses"
                  value={formValues.subCategory}
                  onChange={(e) => setFormValues({ ...formValues, subCategory: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>SIZES (comma separated)</label>
                <input
                  type="text"
                  name="sizes"
                  value={formValues.sizes}
                  onChange={(e) => setFormValues({ ...formValues, sizes: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>COLORS (comma separated)</label>
                <input
                  type="text"
                  name="colors"
                  placeholder="Black, White, Blue"
                  value={formValues.colors}
                  onChange={(e) => setFormValues({ ...formValues, colors: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>PLACEMENTS (comma separated keys)</label>
                <input
                  type="text"
                  name="placementKeys"
                  placeholder="home-hero, shop-spotlight"
                  value={formValues.placementKeys}
                  onChange={(e) => setFormValues({ ...formValues, placementKeys: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>TAGS (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="summer, cotton"
                  value={formValues.tags}
                  onChange={(e) => setFormValues({ ...formValues, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>STOCK</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formValues.stock}
                  onChange={(e) => setFormValues({ ...formValues, stock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>IMAGE URL (or upload below)</label>
                <input
                  type="text"
                  name="image"
                  placeholder="images/1.png"
                  value={formValues.image}
                  onChange={(e) => setFormValues({ ...formValues, image: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>UPLOAD IMAGE</label>
              <input type="file" name="imageFile" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label>VARIANTS EDITOR</label>
              <div className="form-row">
                <div className="form-group">
                  <label>COLOR</label>
                  <input
                    type="text"
                    value={variantDraft.color}
                    onChange={(e) => setVariantDraft({ ...variantDraft, color: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={variantDraft.sku}
                    onChange={(e) => setVariantDraft({ ...variantDraft, sku: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>STOCK</label>
                  <input
                    type="number"
                    min="0"
                    value={variantDraft.stock}
                    onChange={(e) => setVariantDraft({ ...variantDraft, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>PRICE</label>
                  <input
                    type="number"
                    min="0"
                    value={variantDraft.price}
                    onChange={(e) => setVariantDraft({ ...variantDraft, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>IMAGES (comma separated)</label>
                  <input
                    type="text"
                    value={variantDraft.images}
                    onChange={(e) => setVariantDraft({ ...variantDraft, images: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ACTIVE</label>
                  <select
                    value={variantDraft.isActive ? "true" : "false"}
                    onChange={(e) => setVariantDraft({ ...variantDraft, isActive: e.target.value === "true" })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={addVariantFromDraft}>ADD VARIANT</button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    try {
                      const parsed = parseVariantsJson(formValues.variants || "");
                      setVariantsList(parsed);
                      syncVariantsText(parsed);
                      setVariantsError("");
                    } catch (err) {
                      setVariantsError("Invalid variants JSON. Use an array of objects.");
                    }
                  }}
                >
                  LOAD FROM JSON
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => syncVariantsText(variantsList)}>
                  COPY TO JSON
                </button>
              </div>
              {variantsError ? (
                <p style={{ color: "#e63946", fontSize: 12, marginBottom: 10 }}>{variantsError}</p>
              ) : null}
              {variantsList.length ? (
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginBottom: 10 }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                      <th>COLOR</th>
                      <th>SKU</th>
                      <th>STOCK</th>
                      <th>PRICE</th>
                      <th>ACTIVE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantsList.map((v, idx) => (
                      <tr key={`${v.sku}-${idx}`} style={{ borderBottom: "1px solid #f3f3f3" }}>
                        <td>{v.color || "—"}</td>
                        <td>{v.sku || "—"}</td>
                        <td>{v.stock}</td>
                        <td>{v.price}</td>
                        <td>{v.isActive ? "YES" : "NO"}</td>
                        <td>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(idx)}>REMOVE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: 12, color: "#777" }}>No variants added yet.</p>
              )}
            </div>
            <div className="form-group">
              <label>VARIANTS JSON (optional)</label>
              <textarea
                name="variants"
                placeholder='[{"color":"Black","stock":10,"price":2499}]'
                value={formValues.variants}
                onChange={(e) => {
                  setFormValues({ ...formValues, variants: e.target.value });
                  setVariantsError("");
                }}
              />
            </div>
            <div className="form-group">
              <label>OTHER WEBSITE PRICES JSON</label>
              <textarea
                name="externalOffers"
                placeholder='[{"site":"Myntra","price":2999,"productName":"Same Product","productUrl":"https://..."}]'
                value={formValues.externalOffers}
                onChange={(e) => setFormValues({ ...formValues, externalOffers: e.target.value })}
              />
              <p style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                Add only real competitor listings here. Leave blank if you do not have verified prices yet.
              </p>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>FEATURED?</label>
                <select
                  name="isFeatured"
                  value={formValues.isFeatured}
                  onChange={(e) => setFormValues({ ...formValues, isFeatured: e.target.value })}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>STATUS</label>
                <select
                  name="isActive"
                  value={formValues.isActive}
                  onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <input type="hidden" name="_id" value={formValues._id} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="submit" className="btn btn-black" style={{ flex: 1 }}>SAVE PRODUCT</button>
              <button type="button" className="btn btn-outline" onClick={closeModal}>CANCEL</button>
            </div>
          </form>
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
