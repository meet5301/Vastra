const brandToken = localStorage.getItem("vastra_brand_token");
const modal = document.getElementById("brandProductModal");
const productsBody = document.getElementById("brandProductsBody");
const profileForm = document.getElementById("brandProfileForm");
const productForm = document.getElementById("brandProductForm");
const modalTitle = document.getElementById("productModalTitle");
const notificationsList = document.getElementById("brandNotificationsList");
const unreadCountEl = document.getElementById("brandUnreadCount");
const galleryPreviewStrip = document.getElementById("galleryPreviewStrip");
const brandOrdersBody = document.getElementById("brandOrdersBody");

let currentEditId = "";
let productsState = [];

if (!brandToken) {
  window.location.href = "/brand/login";
}

function authHeaders(includeContentType = true) {
  const headers = { Authorization: `Bearer ${brandToken}` };
  if (includeContentType) headers["Content-Type"] = "application/json";
  return headers;
}

function openModal(editing = false) {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modalTitle.textContent = editing ? "Edit Product" : "Add Product";
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  productForm.reset();
  document.getElementById("pp_isActive").checked = true;
  document.getElementById("pp_isFeatured").checked = false;
  currentEditId = "";
  
  // Reset image preview and inputs
  const fileInput = document.getElementById("pp_imageFile");
  const galleryFileInput = document.getElementById("pp_galleryFiles");
  const imageUrlInput = document.getElementById("pp_imageUrl");
  const galleryUrlsInput = document.getElementById("pp_galleryUrls");
  const colorImageMapInput = document.getElementById("pp_colorImageMap");
  if (fileInput) {
    fileInput.value = "";
  }
  if (galleryFileInput) {
    galleryFileInput.value = "";
  }
  if (imageUrlInput) {
    imageUrlInput.value = "";
  }
  if (galleryUrlsInput) {
    galleryUrlsInput.value = "";
  }
  if (colorImageMapInput) {
    colorImageMapInput.value = "";
  }
  
  const fileLabel = document.querySelector(".file-input-label");
  const previewBox = document.getElementById("imagePreviewBox");
  const fileNameLabel = document.getElementById("fileLabel");
  if (fileLabel) fileLabel.classList.remove("has-file");
  if (previewBox) {
    previewBox.classList.add("empty");
    previewBox.textContent = "No image selected";
  }
  if (galleryPreviewStrip) {
    galleryPreviewStrip.innerHTML = "";
  }
  if (fileNameLabel) fileNameLabel.textContent = "Click to upload or drag and drop";
}

function parseMultilineOrCsv(value) {
  if (!value) return [];
  return String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseColorImageMap(value) {
  if (!value) return [];
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [colorPart, imagePart] = line.split("|");
      return {
        color: String(colorPart || "").trim(),
        image: String(imagePart || "").trim(),
      };
    })
    .filter((entry) => entry.color && entry.image);
}

function renderGalleryPreview(images) {
  if (!galleryPreviewStrip) return;
  if (!images?.length) {
    galleryPreviewStrip.innerHTML = "";
    return;
  }

  galleryPreviewStrip.innerHTML = images
    .map(
      (img) => `<div class="gallery-preview-item"><img src="${img}" alt="Gallery Preview"></div>`
    )
    .join("");
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeAndCompressDataUrl(dataUrl, maxWidth = 1200, maxHeight = 1500, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const targetAspect = 4 / 5;
      const sourceAspect = img.width / img.height;

      let sx = 0;
      let sy = 0;
      let sw = img.width;
      let sh = img.height;

      // Center crop to a catalog-friendly 4:5 aspect ratio.
      if (sourceAspect > targetAspect) {
        sw = Math.round(img.height * targetAspect);
        sx = Math.round((img.width - sw) / 2);
      } else if (sourceAspect < targetAspect) {
        sh = Math.round(img.width / targetAspect);
        sy = Math.round((img.height - sh) / 2);
      }

      const scale = Math.min(maxWidth / sw, maxHeight / sh, 1);
      const width = Math.round(sw * scale);
      const height = Math.round(sh * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

      const optimized = canvas.toDataURL("image/jpeg", quality);
      resolve(optimized);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function processImageFile(file) {
  const raw = await readFileAsDataURL(file);
  return resizeAndCompressDataUrl(raw);
}

async function processMultipleFiles(fileList) {
  const files = Array.from(fileList || []);
  const outputs = [];
  for (const file of files) {
    outputs.push(await processImageFile(file));
  }
  return outputs;
}

function toCsvArray(value) {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function fillProfileForm(user) {
  const bp = user.brandProfile || {};
  document.getElementById("bp_brandName").value = bp.brandName || "";
  document.getElementById("bp_contactPhone").value = bp.contactPhone || "";
  document.getElementById("bp_website").value = bp.website || "";
  document.getElementById("bp_companyName").value = bp.companyName || "";
  document.getElementById("bp_about").value = bp.about || "";
}

function renderProducts(products) {
  if (!products.length) {
    productsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color:#999; padding: 2rem;">No products yet. Add your first listing to get started.</td></tr>';
    return;
  }

  productsBody.innerHTML = products
    .map((p) => {
      const price = Math.round(Number(p.price || 0)).toLocaleString("en-IN");
      const discountPrice = p.discountPrice ? Math.round(Number(p.discountPrice)).toLocaleString("en-IN") : null;
      const statusClass = p.isActive ? "status-active" : "status-inactive";
      const statusText = p.isActive ? "ACTIVE" : "INACTIVE";
      const discount = discountPrice ? Math.round(((Number(p.price) - Number(p.discountPrice)) / Number(p.price)) * 100) : 0;
      return `
        <tr>
          <td><strong>${p.name || ""}</strong>${p.isFeatured ? '<br><span style="font-size: 11px; color: #c9a84c;">⭐ Featured</span>' : ''}</td>
          <td>${discountPrice ? '<span style="text-decoration: line-through; color: #999;">Rs. ' + price + '</span><br>Rs. ' + discountPrice + ' <span style="color: #d72828; font-weight: 600;">-' + discount + '%</span>' : 'Rs. ' + price}</td>
          <td>${p.stock ?? 0}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>${p.material || p.fit ? '<span style="font-size: 12px; color: #666;">' + (p.material || '') + (p.fit && p.material ? ' • ' : '') + (p.fit || '') + '</span>' : '-'}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-sm btn-edit" data-action="edit" data-id="${p._id}">EDIT</button>
              <button class="btn-sm btn-delete" data-action="delete" data-id="${p._id}">DELETE</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadProfile() {
  const res = await fetch("/api/brand/me", { headers: authHeaders(false) });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Failed to load brand profile");
    return null;
  }
  fillProfileForm(data.user);
  return data.user;
}

async function loadProducts() {
  const res = await fetch("/api/brand/products", { headers: authHeaders(false) });
  const data = await res.json();
  productsState = data.products || [];
  renderProducts(productsState);
  return productsState;
}

function formatNotifTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderNotifications(notifications, unreadCount) {
  if (unreadCountEl) {
    unreadCountEl.textContent = `${unreadCount || 0} UNREAD`;
  }

  if (!notificationsList) return;
  if (!notifications?.length) {
    notificationsList.className = "empty-state";
    notificationsList.innerHTML = "<p>No notifications yet.</p>";
    return;
  }

  notificationsList.className = "";
  notificationsList.innerHTML = notifications
    .map(
      (n) => `
        <div class="notification-item ${n.read ? "" : "unread"}">
          <div class="notification-title">${n.title || "Update"}</div>
          <div class="notification-message">${n.message || ""}</div>
          <div class="notification-meta">
            <span>${formatNotifTime(n.createdAt)}</span>
            ${
              n.read
                ? '<span style="font-weight:600; color:#5f7b67;">READ</span>'
                : `<button class="btn-sm btn-edit" data-action="read-notification" data-id="${n._id}">MARK READ</button>`
            }
          </div>
        </div>
      `
    )
    .join("");
}

function formatCompactDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
}

function renderBrandOrders(orders) {
  if (!brandOrdersBody) return;

  if (!orders || orders.length === 0) {
    brandOrdersBody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;color:#999;padding:1.5rem;">No order lines yet for your products.</td></tr>';
    return;
  }

  brandOrdersBody.innerHTML = orders
    .map((order) => {
      const orderCode = String(order._id || "").slice(-8).toUpperCase();
      const customer = order.customer?.username || "Guest";
      const customerEmail = order.customer?.email || "";
      const itemSummary = (order.items || [])
        .map((item) => `${item.name || "Item"} x${item.quantity || 1}`)
        .join("<br>");
      const refund = order.refundStatus || "-";

      return `
        <tr>
          <td style="font-family:monospace;">#${orderCode}</td>
          <td>
            <strong>${customer}</strong>
            ${customerEmail ? `<br><span style="font-size:12px;color:#888;">${customerEmail}</span>` : ""}
          </td>
          <td style="font-size:12px;line-height:1.5;">${itemSummary}</td>
          <td>Rs. ${Math.round(order.brandLineTotal || 0).toLocaleString("en-IN")}</td>
          <td>${order.orderStatus || "Processing"}</td>
          <td>${refund}</td>
          <td>${formatCompactDate(order.createdAt)}</td>
        </tr>`;
    })
    .join("");
}

async function loadBrandOrders() {
  const res = await fetch("/api/brand/orders?limit=50", { headers: authHeaders(false) });
  const data = await res.json();
  if (!data.success) {
    renderBrandOrders([]);
    return;
  }
  renderBrandOrders(data.orders || []);
}

async function loadNotifications() {
  const res = await fetch("/api/brand/notifications?limit=20", { headers: authHeaders(false) });
  const data = await res.json();
  if (!data.success) {
    renderNotifications([], 0);
    return;
  }
  renderNotifications(data.notifications || [], data.unreadCount || 0);
}

async function markNotificationRead(id) {
  const res = await fetch(`/api/brand/notifications/${id}/read`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Failed to update notification");
    return;
  }
  await loadNotifications();
}

async function saveProfile(e, profileUser) {
  e.preventDefault();
  const payload = {
    username: profileUser?.username || "",
    brandName: document.getElementById("bp_brandName").value.trim(),
    contactPhone: document.getElementById("bp_contactPhone").value.trim(),
    website: document.getElementById("bp_website").value.trim(),
    companyName: document.getElementById("bp_companyName").value.trim(),
    about: document.getElementById("bp_about").value.trim(),
  };

  const res = await fetch("/api/brand/me", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Failed to update profile");
    return;
  }
  alert("Brand profile updated");
}

function fillProductForm(product) {
  document.getElementById("pp_name").value = product.name || "";
  document.getElementById("pp_price").value = product.price || 0;
  document.getElementById("pp_image").value = product.image || "";
  const imageUrlInput = document.getElementById("pp_imageUrl");
  if (imageUrlInput) imageUrlInput.value = product.image || "";
  const galleryUrlsInput = document.getElementById("pp_galleryUrls");
  if (galleryUrlsInput) galleryUrlsInput.value = (product.galleryImages || []).join("\n");
  const colorImageMapInput = document.getElementById("pp_colorImageMap");
  if (colorImageMapInput) {
    colorImageMapInput.value = (product.colorImages || [])
      .map((entry) => `${entry.color}|${entry.image}`)
      .join("\n");
  }
  document.getElementById("pp_category").value = product.category || "Men";
  document.getElementById("pp_subCategory").value = product.subCategory || "";
  document.getElementById("pp_sizes").value = (product.sizes || []).join(", ");
  document.getElementById("pp_colors").value = (product.colors || []).join(", ");
  document.getElementById("pp_stock").value = product.stock || 0;
  document.getElementById("pp_tags").value = (product.tags || []).join(", ");
  document.getElementById("pp_description").value = product.description || "";
  document.getElementById("pp_isActive").checked = product.isActive !== false;
  
  // New fields
  document.getElementById("pp_discountPrice").value = product.discountPrice || "";
  document.getElementById("pp_lowStockAlert").value = product.lowStockAlert || "";
  document.getElementById("pp_material").value = product.material || "";
  document.getElementById("pp_fit").value = product.fit || "Regular";
  document.getElementById("pp_isFeatured").checked = product.isFeatured || false;

  // Show image preview if editing
  if (product.image) {
    const previewBox = document.getElementById("imagePreviewBox");
    previewBox.classList.remove("empty");
    previewBox.innerHTML = '<img src="' + product.image + '" alt="Preview">';
  }
  renderGalleryPreview(product.galleryImages || []);
}

async function saveProduct(e) {
  e.preventDefault();

  // Media pipeline: resize + compress primary and gallery images.
  let imageValue = "";
  const fileInput = document.getElementById("pp_imageFile");
  const galleryFileInput = document.getElementById("pp_galleryFiles");
  const imageUrlInput = document.getElementById("pp_imageUrl");
  const galleryUrlsInput = document.getElementById("pp_galleryUrls");
  const colorImageMapInput = document.getElementById("pp_colorImageMap");
  let galleryImages = [];
  
  if (fileInput && fileInput.files.length > 0) {
    imageValue = await processImageFile(fileInput.files[0]);
  }

  if (!imageValue && imageUrlInput && imageUrlInput.value.trim()) {
    imageValue = imageUrlInput.value.trim();
  }

  if (galleryFileInput && galleryFileInput.files.length > 0) {
    galleryImages = await processMultipleFiles(galleryFileInput.files);
  }

  const galleryFromUrls = parseMultilineOrCsv(galleryUrlsInput?.value || "");
  galleryImages = [...galleryImages, ...galleryFromUrls].filter(Boolean);

  if (!imageValue) {
    if (galleryImages.length > 0) {
      imageValue = galleryImages[0];
      galleryImages = galleryImages.slice(1);
    } else {
      alert("Please select an image or provide an image URL");
      return;
    }
  }

  const colorImages = parseColorImageMap(colorImageMapInput?.value || "");

  await sendProductData(imageValue, galleryImages, colorImages);
}

async function sendProductData(imageValue, galleryImages = [], colorImages = []) {
  const payload = {
    name: document.getElementById("pp_name").value.trim(),
    price: Number(document.getElementById("pp_price").value || 0),
    image: imageValue,
    category: document.getElementById("pp_category").value,
    subCategory: document.getElementById("pp_subCategory").value.trim(),
    sizes: toCsvArray(document.getElementById("pp_sizes").value),
    colors: toCsvArray(document.getElementById("pp_colors").value),
    stock: Number(document.getElementById("pp_stock").value || 0),
    tags: toCsvArray(document.getElementById("pp_tags").value),
    description: document.getElementById("pp_description").value.trim(),
    isActive: document.getElementById("pp_isActive").checked,
    
    // New fields
    discountPrice: document.getElementById("pp_discountPrice").value ? Number(document.getElementById("pp_discountPrice").value) : null,
    lowStockAlert: document.getElementById("pp_lowStockAlert").value ? Number(document.getElementById("pp_lowStockAlert").value) : null,
    material: document.getElementById("pp_material").value.trim(),
    fit: document.getElementById("pp_fit").value,
    isFeatured: document.getElementById("pp_isFeatured").checked,
    galleryImages,
    colorImages,
  };

  const isEdit = Boolean(currentEditId);
  const res = await fetch(isEdit ? `/api/brand/products/${currentEditId}` : "/api/brand/products", {
    method: isEdit ? "PUT" : "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!data.success) {
    alert(data.message || "Failed to save product");
    return;
  }

  closeModal();
  await loadProducts();
}

async function deleteProduct(id) {
  if (!window.confirm("Delete this product?")) return;

  const res = await fetch(`/api/brand/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Delete failed");
    return;
  }

  await loadProducts();
}

(async function init() {
  let profileUser = await loadProfile();
  await loadProducts();
  await loadBrandOrders();
  await loadNotifications();

  // Update navbar with user info
  const userNameDisplay = document.getElementById("dashboardUserName");
  if (userNameDisplay && profileUser) {
    userNameDisplay.textContent = profileUser.brandProfile?.brandName || profileUser.username || "Brand Seller";
  }

  profileForm.addEventListener("submit", (e) => saveProfile(e, profileUser));
  productForm.addEventListener("submit", saveProduct);

  document.getElementById("addProductBtn").addEventListener("click", () => {
    currentEditId = "";
    productForm.reset();
    document.getElementById("pp_isActive").checked = true;
    openModal(false);
  });

  document.getElementById("cancelProductModal").addEventListener("click", closeModal);
  const cancelBtn = document.getElementById("cancelProductModalBtn");
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  
  document.getElementById("brandLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem("vastra_brand_token");
    localStorage.removeItem("vastra_brand_user");
    window.location.href = "/brand/login";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  productsBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "delete") {
      await deleteProduct(id);
      return;
    }

    if (action === "edit") {
      const product = productsState.find((p) => p._id === id);
      if (!product) return;
      currentEditId = id;
      fillProductForm(product);
      openModal(true);
    }
  });

  if (notificationsList) {
    notificationsList.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action='read-notification']");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      if (!id) return;
      await markNotificationRead(id);
    });
  }

  const galleryFileInput = document.getElementById("pp_galleryFiles");
  if (galleryFileInput) {
    galleryFileInput.addEventListener("change", async (e) => {
      const files = e.target.files;
      if (!files || !files.length) {
        renderGalleryPreview([]);
        return;
      }
      const processed = await processMultipleFiles(files);
      renderGalleryPreview(processed);
    });
  }
})();
