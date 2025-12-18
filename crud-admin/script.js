const API_URL = "http://localhost:6400/products";

const productList = document.getElementById("productList");
const modal = document.getElementById("modal");
const form = document.getElementById("productForm");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const modalTitle = document.getElementById("modalTitle");
const productIdField = document.getElementById("productId");
const themeToggle = document.getElementById("themeToggle");
const priceInput = document.getElementById("price");

let products = [];

/* 🌙 Theme Toggle */
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const icon = themeToggle.querySelector("i");
  if (document.body.classList.contains("dark")) {
    icon.classList.replace("fa-moon", "fa-sun");
    localStorage.setItem("theme", "dark");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    localStorage.setItem("theme", "light");
  }
};

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
}

/* 💰 FORMAT RUPIAH */
function formatRupiah(value) {
  let num = parseFloat(String(value).replace(/[^\d.]/g, ""));
  if (isNaN(num)) num = 0;
  return "Rp " + num.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function unformatRupiah(value) {
  return value.replace(/[^\d]/g, "");
}

/* 🎹 Auto-format harga */
priceInput.addEventListener("input", (e) => {
  const input = e.target;
  const rawValue = unformatRupiah(input.value);
  if (!rawValue) {
    input.value = "";
    return;
  }
  const selectionStart = input.selectionStart;
  const lengthBefore = input.value.length;

  input.value = formatRupiah(rawValue);

  const lengthAfter = input.value.length;
  const diff = lengthAfter - lengthBefore;
  input.setSelectionRange(selectionStart + diff, selectionStart + diff);
});

/* 🚫 Batasi input hanya angka */
priceInput.addEventListener("keypress", (e) => {
  if (!/[0-9]/.test(e.key)) e.preventDefault();
});

/* 🔹 FETCH PRODUCTS */
async function loadProducts() {
  const res = await fetch(API_URL);
  products = await res.json();
  renderProducts();
}

/* 🔹 RENDER PRODUCTS */
function renderProducts() {
  productList.innerHTML = products
    .map(
      (p) => `
      <div class="card">
        <img src="${p.image}" alt="${p.title}" />
        <h3>${p.title}</h3>
        <p>${p.category}</p>
        <p class="price">${formatRupiah(p.price)}</p>
        <div class="actions">
          <button class="icon-btn edit" onclick="editProduct(${p.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn delete" onclick="confirmDelete(${p.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

/* 🔹 ADD PRODUCT */
addBtn.onclick = () => {
  modal.classList.remove("hidden");
  form.reset();
  modalTitle.textContent = "Add Product";
  productIdField.value = "";
};

/* 🔹 CANCEL */
cancelBtn.onclick = () => modal.classList.add("hidden");

/* 🔹 SUBMIT (ADD / EDIT) */
form.onsubmit = async (e) => {
  e.preventDefault();

  const rawPrice = parseFloat(unformatRupiah(priceInput.value));

  const data = {
    title: title.value,
    price: rawPrice,
    description: description.value,
    image: image.value,
    category: category.value,
    rating: rating.value ? JSON.parse(rating.value) : {},
  };

  if (productIdField.value) {
    await fetch(`${API_URL}/${productIdField.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    Swal.fire({
      title: "Updated!",
      text: "Produk berhasil diperbarui",
      icon: "success",
      confirmButtonText: "OK",
      showClass: { popup: "swal-animate-show" },
      hideClass: { popup: "swal-animate-hide" },
      customClass: { confirmButton: "swal2-confirm-blue" },
      buttonsStyling: false,
    });
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    Swal.fire({
      title: "Added!",
      text: "Produk berhasil ditambahkan",
      icon: "success",
      confirmButtonText: "OK",
      showClass: { popup: "swal-animate-show" },
      hideClass: { popup: "swal-animate-hide" },
      customClass: { confirmButton: "swal2-confirm-blue" },
      buttonsStyling: false,
    });
  }

  modal.classList.add("hidden");
  loadProducts();
};

/* 🔹 EDIT PRODUCT */
function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;

  modal.classList.remove("hidden");
  modalTitle.textContent = "Edit Product";
  productIdField.value = p.id;
  title.value = p.title;
  priceInput.value = formatRupiah(p.price);
  description.value = p.description;
  image.value = p.image;
  category.value = p.category;
  rating.value = JSON.stringify(p.rating || {});
}

/* 🔹 DELETE PRODUCT */
async function confirmDelete(id) {
  const result = await Swal.fire({
    title: "Hapus Produk?",
    text: "Data yang dihapus tidak dapat dikembalikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    showClass: { popup: "swal-animate-show" },
    hideClass: { popup: "swal-animate-hide" },
    customClass: {
      confirmButton: "swal2-confirm-red",
      cancelButton: "swal2-cancel-gray",
    },
    buttonsStyling: false,
  });

  if (result.isConfirmed) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    Swal.fire({
      title: "Terhapus!",
      text: "Produk berhasil dihapus.",
      icon: "success",
      confirmButtonText: "OK",
      showClass: { popup: "swal-animate-show" },
      hideClass: { popup: "swal-animate-hide" },
      customClass: { confirmButton: "swal2-confirm-blue" },
      buttonsStyling: false,
    });
    loadProducts();
  }
}

/* 🚀 LOAD AWAL */
loadProducts();
