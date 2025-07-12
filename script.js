/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

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

/* Generate routine using OpenAI based on selected products */
async function generateRoutineFromProducts() {
  // Check if user has selected any products
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML =
      '<p style="color: var(--primary-red);">Please select at least one product to generate a routine.</p>';
    return;
  }

  // Show loading message
  chatWindow.innerHTML =
    '<p>Generating your personalized routine... <i class="fa-solid fa-spinner fa-spin"></i></p>';

  try {
    // Prepare the products data for OpenAI
    const productsData = selectedProducts.map((product) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
    }));

    // Create the prompt for OpenAI
    const prompt = `You are a professional beauty and skincare consultant. Based on the following selected products, create a personalized routine with step-by-step instructions.

Selected Products:
${productsData
  .map(
    (product) =>
      `• ${product.brand} ${product.name} (${product.category}): ${product.description}`
  )
  .join("\n")}

Please provide:
1. A clear morning and/or evening routine
2. Order of application with timing
3. How much to use and frequency
4. Any special tips or warnings
5. Expected benefits

Format the response in a friendly, easy-to-follow manner with clear steps.`;

    // Make API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`, // From secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional beauty and skincare consultant who creates personalized routines. Be detailed and helpful.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    // Check if the API call was successful
    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    // Parse the response
    const data = await response.json();
    const routine = data.choices[0].message.content;

    // Display the generated routine in the chat window
    chatWindow.innerHTML = `
      <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary-gold);">
        <h3 style="color: var(--primary-red); margin-bottom: 15px;">
          <i class="fa-solid fa-sparkles"></i> Your Personalized Routine
        </h3>
        <div style="line-height: 1.6; white-space: pre-line;">${routine}</div>
      </div>
    `;
  } catch (error) {
    console.error("Error generating routine:", error);
    chatWindow.innerHTML = `
      <p style="color: var(--primary-red);">
        <i class="fa-solid fa-exclamation-triangle"></i> 
        Sorry, there was an error generating your routine. Please try again later.
      </p>
    `;
  }
}

/* Send chat message with selected products context to OpenAI */
async function sendChatMessage(userMessage) {
  try {
    // Create context about selected products for the chat
    const productsContext =
      selectedProducts.length > 0
        ? `\n\nUser's currently selected products: ${selectedProducts
            .map((p) => `${p.brand} ${p.name} (${p.category})`)
            .join(", ")}`
        : "";

    // Create the prompt for OpenAI
    const systemPrompt = `You are a helpful beauty and skincare advisor. Provide personalized advice about routines, products, and skincare concerns. Be friendly, informative, and professional.${productsContext}`;

    // Make API call to OpenAI for chat
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`, // From secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
}

/* Add event listener to generate routine button */
generateRoutineBtn.addEventListener("click", generateRoutineFromProducts);

/* Chat form submission handler with OpenAI integration */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  // Check if user entered a message
  if (!userMessage) return;

  // Clear input field and show loading
  userInput.value = "";
  chatWindow.innerHTML =
    '<p>Thinking... <i class="fa-solid fa-spinner fa-spin"></i></p>';

  try {
    // Send message to OpenAI and get response
    const aiResponse = await sendChatMessage(userMessage);

    // Display the conversation in the chat window
    chatWindow.innerHTML = `
      <div style="margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 3px solid var(--primary-gold);">
        <strong style="color: var(--primary-red);">You:</strong> ${userMessage}
      </div>
      <div style="padding: 15px; background: #f0f8ff; border-radius: 6px; border-left: 4px solid var(--primary-gold);">
        <strong style="color: var(--primary-red);">
          <i class="fa-solid fa-robot"></i>L'Oré AI:
        </strong><br>
        <div style="margin-top: 8px; line-height: 1.6; white-space: pre-line;">${aiResponse}</div>
      </div>
    `;
  } catch (error) {
    console.error("Error in chat:", error);
    chatWindow.innerHTML = `
      <div style="margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 3px solid var(--primary-gold);">
        <strong style="color: var(--primary-red);">You:</strong> ${userMessage}
      </div>
      <p style="color: var(--primary-red); padding: 15px; background: #ffe6e6; border-radius: 6px;">
        <i class="fa-solid fa-exclamation-triangle"></i> 
        Sorry, there was an error processing your message. Please try again.
      </p>
    `;
  }
});

/* Initialize selected products list */
updateSelectedProductsList();
