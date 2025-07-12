/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Array to store selected products */
let selectedProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <button class="add-product-btn" onclick="addProductToSelected(${product.id})" title="Add to selected products">
        <i class="fa-solid fa-plus"></i>
      </button>
      <button class="toggle-description-btn" onclick="showDescriptionModal(${product.id})" title="View product description">
        <i class="fa-solid fa-info"></i>
      </button>
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");
}

/* Show product description in a modal */
async function showDescriptionModal(productId) {
  // Get all products to find the selected one
  const allProducts = await loadProducts();
  const product = allProducts.find((p) => p.id === productId);

  if (!product) return;

  // Create modal HTML with full description
  const modalHTML = `
    <div class="description-modal" onclick="closeDescriptionModal(event)">
      <div class="modal-content">
        <button class="modal-close" onclick="closeDescriptionModal()" title="Close description">
          <i class="fa-solid fa-times"></i>
        </button>
        <div class="modal-header">
          <img src="${product.image}" alt="${product.name}" class="modal-image">
          <div class="modal-title">
            <h3>${product.name}</h3>
            <p class="modal-brand">${product.brand}</p>
          </div>
        </div>
        <div class="modal-body">
          <h4>Product Description</h4>
          <p>${product.description}</p>
        </div>
        <div class="modal-actions">
          <button class="modal-add-btn" onclick="addProductToSelected(${product.id}); closeDescriptionModal();">
            <i class="fa-solid fa-plus"></i> Add to Routine
          </button>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Focus on the modal for accessibility
  document.querySelector(".modal-content").focus();

  // Prevent body scrolling when modal is open
  document.body.style.overflow = "hidden";
}

/* Close the description modal */
function closeDescriptionModal(event) {
  // Only close if clicking the backdrop or close button
  if (
    !event ||
    event.target.classList.contains("description-modal") ||
    event.target.closest(".modal-close")
  ) {
    const modal = document.querySelector(".description-modal");
    if (modal) {
      modal.remove();
      document.body.style.overflow = "auto"; // Restore body scrolling
    }
  }
}

/* Add keyboard support for modal */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDescriptionModal();
  }
});

/* Add product to selected products when plus button is clicked */
async function addProductToSelected(productId) {
  // Get all products to find the selected one
  const allProducts = await loadProducts();
  const product = allProducts.find((p) => p.id === productId);

  if (!product) return;

  // Check if product is already selected to avoid duplicates
  const existingProduct = selectedProducts.find((p) => p.id === productId);

  if (!existingProduct) {
    // Add to selected products array
    selectedProducts.push(product);

    // Update the selected products display
    updateSelectedProductsList();

    // Give visual feedback that product was added
    const productCard = document.querySelector(
      `[data-product-id="${productId}"]`
    );
    if (productCard) {
      productCard.classList.add("just-added");
      // Remove the feedback class after animation
      setTimeout(() => {
        productCard.classList.remove("just-added");
      }, 500);
    }
  }
}

/* Update the selected products display section */
function updateSelectedProductsList() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = "<p>No products selected yet</p>";
    return;
  }

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="selected-product-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="selected-product-info">
          <h4>${product.name}</h4>
          <p>${product.brand}</p>
        </div>
        <button class="remove-product-btn" onclick="removeSelectedProduct(${product.id})" title="Remove from selected products">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `
    )
    .join("");
}

/* Remove product from selected list */
function removeSelectedProduct(productId) {
  // Remove from selected products array
  selectedProducts = selectedProducts.filter(
    (product) => product.id !== productId
  );

  // Update the display
  updateSelectedProductsList();
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});

/* Initialize selected products list */
updateSelectedProductsList();
