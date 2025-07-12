/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

/* Array to store selected products */
let selectedProducts = [];

/* Array to store complete conversation history for full memory */
let conversationHistory = [];

/* Variable to store the most recent generated routine */
let currentRoutine = null;

/* Enhanced conversation memory - store important context and personal details */
let conversationContext = {
  userName: null,
  userPreferences: [],
  skinConcerns: [],
  routineGoals: [],
  previousRecommendations: [],
  personalDetails: {},
  importantTopics: [],
  questionsAsked: [],
  fullConversationSummary: "",
};

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Initialize chat window with welcome message */
chatWindow.innerHTML = `
  <div class="chat-bubble chat-bubble-ai">
    <strong style="color: var(--primary-red);">
      <i class="fa-solid fa-robot"></i> L'Oré:
    </strong><br>
    <div style="margin-top: 8px; line-height: 1.6;">
      Hello! I'm L'Oé your L'Oréal beauty advisor. I can help you build personalized routines, answer questions about products, and provide advice on skincare, haircare, makeup, and fragrance. What's your name, and how can I help you today?
    </div>
  </div>
`;

/* Add message to conversation history and display */
function addMessageToConversation(sender, message, isRoutine = false) {
  // Add to conversation history for context with timestamp
  const conversationEntry = {
    role: sender === "user" ? "user" : "assistant",
    content: message,
    timestamp: new Date(),
    sender: sender,
    isRoutine: isRoutine,
  };

  conversationHistory.push(conversationEntry);

  // Extract and store important information from user messages
  if (sender === "user") {
    extractPersonalInformation(message);
  }

  // Create message HTML with proper chat bubble styling
  let messageHTML = "";

  if (sender === "user") {
    const userName = conversationContext.userName
      ? conversationContext.userName
      : "You";
    messageHTML = `
      <div class="chat-bubble chat-bubble-user">
        <strong style="color: var(--primary-red);">${userName}:</strong><br>
        <div style="margin-top: 4px;">${message}</div>
      </div>
    `;
  } else if (isRoutine) {
    messageHTML = `
      <div class="chat-bubble chat-bubble-routine">
        <h3 style="color: var(--primary-red); margin-bottom: 15px;">
          <i class="fa-solid fa-sparkles"></i> Your Personalized Routine
        </h3>
        <div style="line-height: 1.6; white-space: pre-line;">${message}</div>
        <div style="margin-top: 15px; padding: 10px; background: rgba(227, 165, 53, 0.1); border-radius: 4px; font-size: 14px; color: var(--primary-red);">
          <i class="fa-solid fa-lightbulb"></i> <strong>Tip:</strong> Ask me any follow-up questions about this routine!
        </div>
      </div>
    `;
  } else {
    messageHTML = `
      <div class="chat-bubble chat-bubble-ai">
        <strong style="color: var(--primary-red);">
          <i class="fa-solid fa-robot"></i> L'Oré:
        </strong><br>
        <div style="margin-top: 8px; line-height: 1.6; white-space: pre-line;">${message}</div>
      </div>
    `;
  }

  // Append to chat window (preserving previous messages)
  chatWindow.innerHTML += messageHTML;

  // Scroll to bottom to show latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Extract personal information from user messages */
function extractPersonalInformation(message) {
  const lowerMessage = message.toLowerCase();

  // Extract name if user introduces themselves
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /i am (\w+)/i,
    /call me (\w+)/i,
    /this is (\w+)/i,
  ];

  namePatterns.forEach((pattern) => {
    const match = message.match(pattern);
    if (match && match[1] && !conversationContext.userName) {
      conversationContext.userName =
        match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  });

  // Extract skin concerns from user messages
  const skinConcerns = [
    "acne",
    "dry skin",
    "oily skin",
    "sensitive skin",
    "aging",
    "wrinkles",
    "dark spots",
    "hyperpigmentation",
    "rosacea",
    "eczema",
    "blackheads",
    "large pores",
    "fine lines",
    "dark circles",
    "puffy eyes",
  ];

  skinConcerns.forEach((concern) => {
    if (
      lowerMessage.includes(concern) &&
      !conversationContext.skinConcerns.includes(concern)
    ) {
      conversationContext.skinConcerns.push(concern);
    }
  });

  // Extract preferences from user messages
  const preferences = [
    "morning routine",
    "evening routine",
    "quick routine",
    "minimal routine",
    "natural products",
    "organic",
    "cruelty-free",
    "vegan",
    "fragrance-free",
    "budget-friendly",
    "luxury",
    "drugstore",
    "korean skincare",
    "anti-aging",
  ];

  preferences.forEach((pref) => {
    if (
      lowerMessage.includes(pref) &&
      !conversationContext.userPreferences.includes(pref)
    ) {
      conversationContext.userPreferences.push(pref);
    }
  });

  // Store routine goals
  const goals = [
    "anti-aging",
    "hydration",
    "brightening",
    "acne treatment",
    "oil control",
    "even skin tone",
    "reduce wrinkles",
    "prevent breakouts",
    "glow",
    "firm skin",
  ];

  goals.forEach((goal) => {
    if (
      lowerMessage.includes(goal) &&
      !conversationContext.routineGoals.includes(goal)
    ) {
      conversationContext.routineGoals.push(goal);
    }
  });

  // Store personal details mentioned
  const personalKeywords = [
    "age",
    "skin type",
    "allergies",
    "budget",
    "pregnant",
    "sensitive",
    "dermatologist",
    "medications",
    "climate",
    "lifestyle",
  ];

  personalKeywords.forEach((keyword) => {
    if (lowerMessage.includes(keyword)) {
      if (!conversationContext.personalDetails[keyword]) {
        conversationContext.personalDetails[keyword] = [];
      }
      conversationContext.personalDetails[keyword].push(message);
    }
  });

  // Track important topics discussed
  const importantTopics = [
    "routine",
    "products",
    "ingredients",
    "concerns",
    "goals",
    "budget",
    "recommendations",
  ];

  importantTopics.forEach((topic) => {
    if (
      lowerMessage.includes(topic) &&
      !conversationContext.importantTopics.includes(topic)
    ) {
      conversationContext.importantTopics.push(topic);
    }
  });
}

/* Create comprehensive conversation summary for AI context */
function createConversationSummary() {
  const summary = {
    userName: conversationContext.userName,
    skinConcerns: conversationContext.skinConcerns,
    preferences: conversationContext.userPreferences,
    goals: conversationContext.routineGoals,
    personalDetails: conversationContext.personalDetails,
    selectedProducts: selectedProducts.map((p) => `${p.brand} ${p.name}`),
    currentRoutine: currentRoutine ? "Has generated routine" : "No routine yet",
    conversationLength: conversationHistory.length,
    topicsDiscussed: conversationContext.importantTopics,
  };

  return summary;
}

/* Send chat message with enhanced conversation context to OpenAI */
async function sendChatMessage(userMessage) {
  try {
    // Check if the message is related to beauty topics
    if (!isValidBeautyTopic(userMessage)) {
      return "I'm here to help with beauty, skincare, haircare, makeup, and fragrance questions. Please ask me something related to these topics or about your routine!";
    }

    // Create comprehensive context about the user
    const userContext = createConversationSummary();
    const contextString = `
User Profile:
- Name: ${userContext.userName || "Not provided"}
- Skin Concerns: ${userContext.skinConcerns.join(", ") || "None mentioned"}
- Preferences: ${userContext.preferences.join(", ") || "None mentioned"}
- Goals: ${userContext.goals.join(", ") || "None mentioned"}
- Selected Products: ${
      userContext.selectedProducts.join(", ") || "None selected"
    }
- Current Routine Status: ${userContext.currentRoutine}
- Topics Discussed: ${userContext.topicsDiscussed.join(", ") || "None"}

Personal Details Mentioned:
${
  Object.entries(userContext.personalDetails)
    .map(([key, values]) => `- ${key}: ${values[values.length - 1]}`)
    .join("\n") || "None"
}`;

    // Build messages array with FULL conversation history for complete memory
    const messages = [
      {
        role: "system",
        content: `You are L'Oréal AI, a helpful beauty and skincare advisor. You have perfect memory of our entire conversation. Always remember the user's name, preferences, concerns, and everything they've told you. Be personal and reference previous parts of our conversation when relevant. 

Current User Context:
${contextString}

Provide personalized advice about routines, products, skincare, haircare, makeup, and fragrance. Be friendly, informative, and professional. Always use their name when you know it, and reference things they've mentioned before to show you remember our conversation.`,
      },
    ];

    // Add ALL conversation history (not just recent) for complete memory
    // Only limit if conversation gets extremely long (over 100 messages)
    const historyToInclude =
      conversationHistory.length > 100
        ? conversationHistory.slice(-100)
        : conversationHistory;

    historyToInclude.forEach((entry) => {
      messages.push({
        role: entry.role,
        content: entry.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    // Make API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`, // From secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 1200, // Increased for more detailed responses
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return aiResponse;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
}

/* Show loading message */
function showLoadingMessage() {
  const loadingHTML = `
    <div id="loading-message" class="chat-bubble chat-bubble-ai">
      <strong style="color: var(--primary-red);">
        <i class="fa-solid fa-robot"></i> L'Oré:
      </strong><br>
      <div style="margin-top: 8px;">
        L'Oré is typing... <i class="fa-solid fa-spinner fa-spin"></i>
      </div>
    </div>
  `;

  chatWindow.innerHTML += loadingHTML;
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Remove loading message */
function removeLoadingMessage() {
  const loadingElement = document.getElementById("loading-message");
  if (loadingElement) {
    loadingElement.remove();
  }
}

/* Check if user question is related to allowed topics */
function isValidBeautyTopic(message) {
  const allowedTopics = [
    "routine",
    "skincare",
    "haircare",
    "makeup",
    "fragrance",
    "beauty",
    "skin",
    "hair",
    "face",
    "moisturizer",
    "cleanser",
    "serum",
    "cream",
    "foundation",
    "mascara",
    "lipstick",
    "shampoo",
    "conditioner",
    "perfume",
    "acne",
    "wrinkles",
    "dry skin",
    "oily skin",
    "sensitive skin",
    "aging",
    "product",
    "application",
    "step",
    "order",
    "frequency",
    "amount",
    "tip",
    "ingredient",
    "vitamin",
    "retinol",
    "hyaluronic",
    "ceramide",
    "spf",
    "sunscreen",
    "name",
    "hi",
    "hello",
    "help",
    "recommend",
    "advice",
    "routine",
    "my",
    "i",
  ];

  const lowerMessage = message.toLowerCase();
  return allowedTopics.some((topic) => lowerMessage.includes(topic));
}

/* Enhanced chat form submission handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  // Check if user entered a message
  if (!userMessage) return;

  // Add user message to conversation
  addMessageToConversation("user", userMessage);

  // Clear input field and show loading
  userInput.value = "";
  showLoadingMessage();

  try {
    // Send message to OpenAI and get response
    const aiResponse = await sendChatMessage(userMessage);

    // Remove loading message
    removeLoadingMessage();

    // Add AI response to conversation
    addMessageToConversation("assistant", aiResponse);
  } catch (error) {
    console.error("Error in chat:", error);

    // Remove loading message
    removeLoadingMessage();

    // Add error message to conversation
    addMessageToConversation(
      "assistant",
      "Sorry, there was an error processing your message. Please try again."
    );
  }
});

/* Generate routine using OpenAI based on selected products */
async function generateRoutineFromProducts() {
  // Check if user has selected any products
  if (selectedProducts.length === 0) {
    addMessageToConversation(
      "assistant",
      "Please select at least one product to generate a routine."
    );
    return;
  }

  // Show loading message
  showLoadingMessage();

  try {
    // Prepare the products data for OpenAI
    const productsData = selectedProducts.map((product) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
    }));

    // Create personalized prompt including user context
    const userContext = createConversationSummary();
    const personalizedPrompt = `Based on the following selected products and user profile, create a personalized routine with step-by-step instructions.

User Profile:
- Name: ${userContext.userName || "User"}
- Skin Concerns: ${userContext.skinConcerns.join(", ") || "General skincare"}
- Preferences: ${userContext.preferences.join(", ") || "Standard routine"}
- Goals: ${userContext.goals.join(", ") || "Healthy skin"}

Selected Products:
${productsData
  .map(
    (product) =>
      `• ${product.brand} ${product.name} (${product.category}): ${product.description}`
  )
  .join("\n")}

Please provide:
1. A clear morning and/or evening routine tailored to their specific concerns and goals
2. Order of application with timing
3. How much to use and frequency
4. Any special tips or warnings based on their mentioned concerns
5. Expected benefits relevant to their goals

Address the user by name if known, and reference their specific concerns and preferences mentioned in our conversation.`;

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
              "You are a professional L'Oréal beauty and skincare consultant who creates personalized routines. Remember the user's name, concerns, and preferences from the conversation. Be detailed, helpful, and personal.",
          },
          {
            role: "user",
            content: personalizedPrompt,
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

    // Store the current routine for context in follow-up questions
    currentRoutine = routine;

    // Remove loading message
    removeLoadingMessage();

    // Add routine to conversation
    addMessageToConversation("assistant", routine, true);
  } catch (error) {
    console.error("Error generating routine:", error);

    // Remove loading message
    removeLoadingMessage();

    // Add error message to conversation
    addMessageToConversation(
      "assistant",
      "Sorry, there was an error generating your routine. Please try again later."
    );
  }
}

/* Add event listener to generate routine button */
generateRoutineBtn.addEventListener("click", generateRoutineFromProducts);

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

/* Initialize selected products list */
updateSelectedProductsList();
