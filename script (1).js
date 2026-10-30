// ================= 1. INITIAL DATA & LOCAL STORAGE =================

// Default Users (For Role-Based Access: User & Admin)
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Admin User", email: "admin@test.com", pass: "1234", role: "Admin" }
];

// Default Recipes (with Calories + Macros: Protein, Carbs, Fats)
let recipes = JSON.parse(localStorage.getItem("recipes")) || [
  {
    id: 1,
    title: "Vegetable Masala Oats",
    category: "Breakfast",
    calories: 280,
    protein: 10,
    carbs: 48,
    fats: 5,
    ingredients: "Oats, Carrots, Peas, Onion, Spices",
    steps: "Boil veggies in water, add oats, and cook for 5 minutes."
  },
  {
    id: 2,
    title: "Grilled Paneer Salad",
    category: "Lunch",
    calories: 350,
    protein: 18,
    carbs: 10,
    fats: 22,
    ingredients: "Paneer, Cucumber, Tomatoes, Lemon, Black Pepper",
    steps: "Grill paneer cubes on pan and toss with chopped salad veggies."
  },
  {
    id: 3,
    title: "Dal Tadka & Brown Rice",
    category: "Dinner",
    calories: 420,
    protein: 14,
    carbs: 68,
    fats: 9,
    ingredients: "Yellow Dal, Brown Rice, Garlic, Cumin, Ghee",
    steps: "Pressure cook dal, add garlic tadka, and serve with boiled brown rice."
  }
];

// Backfill default macros if older recipes exist in localStorage without macros
recipes.forEach(r => {
  if (r.protein === undefined) r.protein = Math.round((r.calories * 0.15) / 4);
  if (r.carbs === undefined) r.carbs = Math.round((r.calories * 0.55) / 4);
  if (r.fats === undefined) r.fats = Math.round((r.calories * 0.30) / 9);
});

// Default Meal Bookings / Requests
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Stores the most recently created/updated recipe so Meal Planner auto-selects it
let lastCreatedRecipeId = null;

// One-time cleanup for legacy demo data
users = users.filter(u => u.email !== "user@test.com");
bookings = bookings.filter(b => b.bookedBy !== "Rahul Sharma");
if (currentUser && currentUser.email === "user@test.com") currentUser = null;
users.forEach(u => { if (u.name === "Chef Priya (Admin)") u.name = "Admin User"; });
if (currentUser && currentUser.name === "Chef Priya (Admin)") currentUser.name = "Admin User";

function saveToStorage() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("recipes", JSON.stringify(recipes));
  localStorage.setItem("bookings", JSON.stringify(bookings));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}
saveToStorage();

// ================= 2. LOGIN & REGISTRATION FUNCTIONS =================

function toggleAuth(type) {
  document.getElementById("loginForm").style.display = type === "login" ? "block" : "none";
  document.getElementById("registerForm").style.display = type === "register" ? "block" : "none";
}

function registerUser(event) {
  event.preventDefault();
  let name = document.getElementById("regName").value.trim();
  let email = document.getElementById("regEmail").value.trim();
  let pass = document.getElementById("regPass").value.trim();
  let role = document.getElementById("regRole").value;

  if (name.length < 2) {
    alert("Validation Error: Please enter your full name (at least 2 characters).");
    return;
  }
  if (pass.length < 4) {
    alert("Validation Error: Password must be at least 4 characters long!");
    return;
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    alert("Validation Error: An account with this email already exists. Please login instead.");
    return;
  }

  let newUser = { name, email, pass, role };
  users.push(newUser);
  currentUser = newUser;
  saveToStorage();
  startApp();
}

function loginUser(event) {
  event.preventDefault();
  let email = document.getElementById("loginEmail").value.trim();
  let pass = document.getElementById("loginPass").value.trim();

  let foundUser = users.find(u => u.email === email && u.pass === pass);
  if (foundUser) {
    currentUser = foundUser;
    saveToStorage();
    startApp();
  } else {
    alert("Invalid Email or Password! Try using the Quick Demo Login button below.");
  }
}

function demoLogin(roleType) {
  currentUser = users.find(u => u.role === roleType);
  if (!currentUser && roleType === "Admin") {
    currentUser = { name: "Admin User", email: "admin@test.com", pass: "1234", role: "Admin" };
    users.push(currentUser);
  }
  saveToStorage();
  startApp();
}

function logoutUser() {
  currentUser = null;
  saveToStorage();
  document.getElementById("appSection").style.display = "none";
  document.getElementById("authSection").style.display = "flex";
}

// ================= 3. NAVIGATION & TODAY'S DATE/DAY AUTO-SELECT =================

function startApp() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  document.getElementById("welcomeUser").innerText = `${currentUser.name} (${currentUser.role})`;

  setTodayDateAndDay();
  showSection("dashboard");
}

function showSection(sectionId) {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("recipes").style.display = "none";
  document.getElementById("planner").style.display = "none";

  document.getElementById(sectionId).style.display = "block";
  refreshAllData();
}

function refreshAllData() {
  updateDashboard();
  displayRecipes();
  populateRecipeDropdown();
  displayBookings();
}

// Automatically sets today's date and day in the Meal Planner and Dashboard header
function setTodayDateAndDay() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDayName = days[now.getDay()];

  // Format local YYYY-MM-DD for the date input
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  const dateInput = document.getElementById("bookDate");
  const daySelect = document.getElementById("bookDay");
  if (dateInput) dateInput.value = formattedDate;
  if (daySelect) daySelect.value = todayDayName;

  // Show nice formatted date on Dashboard
  const badge = document.getElementById("dashboardDateBadge");
  if (badge) {
    badge.innerText = `📅 ${todayDayName}, ${now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  }
}

// When the user picks a different date in the calendar, update the Day dropdown automatically
function syncDayFromDate() {
  const dateVal = document.getElementById("bookDate").value;
  if (!dateVal) return;
  const parts = dateVal.split("-");
  const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  document.getElementById("bookDay").value = days[selectedDate.getDay()];
}

// ================= 4. RECIPE CRUD & CALORIE + MACROS CALCULATOR =================

// Nutrition DB per 100g / 100ml: { cal, pro, carb, fat }
const foodNutritionDB = {
  // Grains & Carbs
  "oats":          { cal: 380, pro: 13.0, carb: 67.0, fat: 6.5 },
  "brown rice":    { cal: 112, pro: 2.6,  carb: 23.5, fat: 0.9 },
  "rice":          { cal: 130, pro: 2.7,  carb: 28.0, fat: 0.3 },
  "roti":          { cal: 290, pro: 9.0,  carb: 55.0, fat: 3.5 },
  "bread":         { cal: 265, pro: 9.0,  carb: 49.0, fat: 3.2 },
  "pasta":         { cal: 150, pro: 5.5,  carb: 30.0, fat: 0.9 },
  "noodles":       { cal: 140, pro: 4.5,  carb: 26.0, fat: 2.0 },
  "poha":          { cal: 180, pro: 3.2,  carb: 38.0, fat: 1.5 },
  "upma":          { cal: 190, pro: 4.5,  carb: 32.0, fat: 5.0 },
  "quinoa":        { cal: 120, pro: 4.4,  carb: 21.3, fat: 1.9 },
  "corn":          { cal: 96,  pro: 3.4,  carb: 21.0, fat: 1.5 },

  // Proteins, Dairy & Fats
  "paneer":        { cal: 265, pro: 18.3, carb: 3.4,  fat: 20.8 },
  "tofu":          { cal: 76,  pro: 8.0,  carb: 1.9,  fat: 4.8 },
  "chicken":       { cal: 239, pro: 27.0, carb: 0.0,  fat: 14.0 },
  "egg":           { cal: 155, pro: 13.0, carb: 1.1,  fat: 11.0 },
  "fish":          { cal: 205, pro: 22.0, carb: 0.0,  fat: 12.0 },
  "dal":           { cal: 116, pro: 9.0,  carb: 20.0, fat: 0.4 },
  "rajma":         { cal: 127, pro: 8.7,  carb: 22.8, fat: 0.5 },
  "chole":         { cal: 164, pro: 8.9,  carb: 27.4, fat: 2.6 },
  "soya":          { cal: 345, pro: 52.0, carb: 33.0, fat: 0.5 },
  "milk":          { cal: 65,  pro: 3.3,  carb: 4.8,  fat: 3.6 },
  "curd":          { cal: 60,  pro: 3.5,  carb: 4.7,  fat: 3.3 },
  "yogurt":        { cal: 60,  pro: 3.5,  carb: 4.7,  fat: 3.3 },
  "cheese":        { cal: 400, pro: 25.0, carb: 1.3,  fat: 33.0 },
  "peanut butter": { cal: 588, pro: 25.0, carb: 20.0, fat: 50.0 },
  "butter":        { cal: 717, pro: 0.9,  carb: 0.1,  fat: 81.0 },
  "ghee":          { cal: 900, pro: 0.0,  carb: 0.0,  fat: 100.0 },
  "oil":           { cal: 884, pro: 0.0,  carb: 0.0,  fat: 100.0 },

  // Sweeteners, Nuts & Dry Fruits
  "honey":         { cal: 304, pro: 0.3,  carb: 82.0, fat: 0.0 },
  "sugar":         { cal: 387, pro: 0.0,  carb: 100.0,fat: 0.0 },
  "jaggery":       { cal: 383, pro: 0.4,  carb: 98.0, fat: 0.1 },
  "peanuts":       { cal: 567, pro: 25.8, carb: 16.1, fat: 49.2 },
  "almonds":       { cal: 579, pro: 21.2, carb: 21.6, fat: 49.9 },
  "cashew":        { cal: 553, pro: 18.2, carb: 30.2, fat: 43.8 },
  "walnut":        { cal: 654, pro: 15.2, carb: 13.7, fat: 65.2 },
  "dates":         { cal: 282, pro: 2.5,  carb: 75.0, fat: 0.4 },

  // Fruits & Veggies
  "sweet potato":  { cal: 86,  pro: 1.6,  carb: 20.1, fat: 0.1 },
  "potato":        { cal: 87,  pro: 1.9,  carb: 20.1, fat: 0.1 },
  "banana":        { cal: 89,  pro: 1.1,  carb: 22.8, fat: 0.3 },
  "apple":         { cal: 52,  pro: 0.3,  carb: 13.8, fat: 0.2 },
  "mango":         { cal: 60,  pro: 0.8,  carb: 15.0, fat: 0.4 },
  "avocado":       { cal: 160, pro: 2.0,  carb: 8.5,  fat: 14.7 },
  "broccoli":      { cal: 34,  pro: 2.8,  carb: 6.6,  fat: 0.4 },
  "spinach":       { cal: 23,  pro: 2.9,  carb: 3.6,  fat: 0.4 },
  "mushroom":      { cal: 22,  pro: 3.1,  carb: 3.3,  fat: 0.3 },
  "tomato":        { cal: 18,  pro: 0.9,  carb: 3.9,  fat: 0.2 },
  "onion":         { cal: 40,  pro: 1.1,  carb: 9.3,  fat: 0.1 },
  "carrot":        { cal: 41,  pro: 0.9,  carb: 9.6,  fat: 0.2 },
  "peas":          { cal: 81,  pro: 5.4,  carb: 14.5, fat: 0.4 },
  "cucumber":      { cal: 15,  pro: 0.7,  carb: 3.6,  fat: 0.1 },
  "salad":         { cal: 35,  pro: 1.5,  carb: 6.5,  fat: 0.3 },
  "veggies":       { cal: 50,  pro: 2.0,  carb: 9.5,  fat: 0.4 },
  "soup":          { cal: 60,  pro: 2.5,  carb: 8.0,  fat: 1.8 }
};

function autoCalculateNutrition() {
  let titleText = document.getElementById("recTitle").value.toLowerCase();
  let ingText = document.getElementById("recIngredients").value.toLowerCase();

  let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;

  // Sort keys longest-first so "brown rice" matches before "rice"
  const sortedFoods = Object.keys(foodNutritionDB).sort((a, b) => b.length - a.length);

  // 1. Parse comma-separated ingredients
  let items = ingText.split(",");
  items.forEach(item => {
    for (let food of sortedFoods) {
      if (item.includes(food)) {
        let nut = foodNutritionDB[food];
        let weightInGrams = 100; // Default 100g if no weight is specified

        let match = item.match(/(\d+(\.\d+)?)\s*(kg|g|gm|ml|l)\b/i);
        if (match) {
          let amount = parseFloat(match[1]);
          let unit = match[3].toLowerCase();
          weightInGrams = (unit === "kg" || unit === "l") ? amount * 1000 : amount;
        }

        let factor = weightInGrams / 100;
        totalCal += nut.cal * factor;
        totalPro += nut.pro * factor;
        totalCarb += nut.carb * factor;
        totalFat += nut.fat * factor;
        break;
      }
    }
  });

  // 2. Fallback: If ingredients haven't matched yet, estimate from Recipe Name
  if (totalCal === 0 && titleText.trim() !== "") {
    for (let food of sortedFoods) {
      if (titleText.includes(food)) {
        let nut = foodNutritionDB[food];
        totalCal += nut.cal;
        totalPro += nut.pro;
        totalCarb += nut.carb;
        totalFat += nut.fat;
      }
    }
  }

  // 3. Populate Calories, Protein, Carbs, and Fats fields
  if (totalCal > 0) {
    document.getElementById("recCalories").value = Math.round(totalCal);
    document.getElementById("recProtein").value = Number(totalPro.toFixed(1));
    document.getElementById("recCarbs").value = Number(totalCarb.toFixed(1));
    document.getElementById("recFats").value = Number(totalFat.toFixed(1));
  }
}

function saveRecipe(event) {
  event.preventDefault();

  let editId = document.getElementById("editRecipeId").value;
  let title = document.getElementById("recTitle").value.trim();
  let category = document.getElementById("recCategory").value;
  let calories = Number(document.getElementById("recCalories").value);
  let protein = Number(document.getElementById("recProtein").value) || 0;
  let carbs = Number(document.getElementById("recCarbs").value) || 0;
  let fats = Number(document.getElementById("recFats").value) || 0;
  let ingredients = document.getElementById("recIngredients").value.trim();
  let steps = document.getElementById("recSteps").value.trim();

  if (calories <= 0 || calories > 3000) {
    alert("Validation Error: Please enter valid calories between 1 and 3000.");
    return;
  }

  if (editId) {
    let index = recipes.findIndex(r => r.id == editId);
    recipes[index] = { id: Number(editId), title, category, calories, protein, carbs, fats, ingredients, steps };
    lastCreatedRecipeId = Number(editId);
    alert(`Recipe updated! "${title}" (${category}) is now auto-selected in the Meal Planner.`);
  } else {
    let newId = Date.now();
    let newRecipe = { id: newId, title, category, calories, protein, carbs, fats, ingredients, steps };
    recipes.push(newRecipe);
    lastCreatedRecipeId = newId;
    alert(`New Recipe added! "${title}" and its category (${category}) have been auto-selected in the Meal Planner.`);
  }

  resetRecipeForm();
  saveToStorage();
  refreshAllData();
}

function displayRecipes() {
  let searchText = document.getElementById("searchInput").value.toLowerCase();
  let categoryFilter = document.getElementById("filterCategory").value;
  let listDiv = document.getElementById("recipeList");

  let filteredRecipes = recipes.filter(r => {
    let matchesSearch = r.title.toLowerCase().includes(searchText) || r.ingredients.toLowerCase().includes(searchText);
    let matchesCat = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (filteredRecipes.length === 0) {
    listDiv.innerHTML = "<p class='empty-msg'>No recipes found matching your search.</p>";
    return;
  }

  listDiv.innerHTML = filteredRecipes.map(r => `
    <div class="recipe-card">
      <div class="recipe-card-top">
        <span class="badge">${r.category}</span>
        <span class="cal-tag">🔥 ${r.calories} kcal</span>
      </div>
      <h4>${r.title}</h4>
      <div class="macro-pills">
        <span class="pill pill-pro">💪 P: ${r.protein || 0}g</span>
        <span class="pill pill-carb">🌾 C: ${r.carbs || 0}g</span>
        <span class="pill pill-fat">🥑 F: ${r.fats || 0}g</span>
      </div>
      <p><strong>Ingredients:</strong> ${r.ingredients}</p>
      <p><strong>Steps:</strong> ${r.steps}</p>
      <div class="card-actions">
        <button class="btn-secondary" onclick="planThisRecipe(${r.id})">📅 Plan Meal</button>
        <button class="btn-secondary" onclick="editRecipe(${r.id})">✏️ Edit</button>
        <button class="btn-danger" onclick="deleteRecipe(${r.id})">🗑️ Delete</button>
      </div>
    </div>
  `).join("");
}

// Jump directly to Meal Planner with this recipe & its category pre-selected
function planThisRecipe(id) {
  lastCreatedRecipeId = id;
  showSection("planner");
}

function editRecipe(id) {
  let rec = recipes.find(r => r.id === id);
  if (!rec) return;

  document.getElementById("formHeading").innerText = "Edit Recipe";
  document.getElementById("editRecipeId").value = rec.id;
  document.getElementById("recTitle").value = rec.title;
  document.getElementById("recCategory").value = rec.category;
  document.getElementById("recCalories").value = rec.calories;
  document.getElementById("recProtein").value = rec.protein || 0;
  document.getElementById("recCarbs").value = rec.carbs || 0;
  document.getElementById("recFats").value = rec.fats || 0;
  document.getElementById("recIngredients").value = rec.ingredients;
  document.getElementById("recSteps").value = rec.steps;

  document.getElementById("saveBtn").innerText = "Update Recipe";
  document.getElementById("cancelEditBtn").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetRecipeForm() {
  document.getElementById("recipeForm").reset();
  document.getElementById("editRecipeId").value = "";
  document.getElementById("formHeading").innerText = "Add New Recipe";
  document.getElementById("saveBtn").innerText = "Save Recipe";
  document.getElementById("cancelEditBtn").style.display = "none";
}

function deleteRecipe(id) {
  if (confirm("Are you sure you want to delete this recipe?")) {
    recipes = recipes.filter(r => r.id !== id);
    saveToStorage();
    refreshAllData();
  }
}

// ================= 5. MEAL PLANNER & AUTO-CATEGORY SYNC =================

function populateRecipeDropdown() {
  let select = document.getElementById("bookRecipe");
  if (!select) return;

  select.innerHTML = recipes.map(r =>
    `<option value="${r.title}">${r.title} (${r.category} • ${r.calories} kcal)</option>`
  ).join("");

  // If user just created/edited or clicked "Plan Meal" on a recipe, select it automatically
  if (lastCreatedRecipeId) {
    let targetRecipe = recipes.find(r => r.id === lastCreatedRecipeId);
    if (targetRecipe) {
      select.value = targetRecipe.title;
      document.getElementById("bookMealTime").value = targetRecipe.category;
    }
  } else {
    syncMealTimeWithRecipe();
  }
}

// Automatically selects the Meal Time (Breakfast/Lunch/Dinner/Snack) matching the chosen recipe
function syncMealTimeWithRecipe() {
  let selectedTitle = document.getElementById("bookRecipe").value;
  let foundRecipe = recipes.find(r => r.title === selectedTitle);
  if (foundRecipe) {
    document.getElementById("bookMealTime").value = foundRecipe.category;
  }
}

function canManageBooking(b) {
  return currentUser.role === "Admin"
    || b.bookedByEmail === currentUser.email
    || (!b.bookedByEmail && b.bookedBy === currentUser.name);
}

function getVisibleBookings() {
  return bookings.filter(b => canManageBooking(b));
}

function addBooking(event) {
  event.preventDefault();

  if (recipes.length === 0 || !document.getElementById("bookRecipe").value) {
    alert("Validation Error: Please add a recipe in the Recipe Box before booking a meal.");
    return;
  }

  let newBooking = {
    id: Date.now(),
    date: document.getElementById("bookDate").value,
    day: document.getElementById("bookDay").value,
    mealTime: document.getElementById("bookMealTime").value,
    recipeTitle: document.getElementById("bookRecipe").value,
    notes: document.getElementById("bookNotes").value.trim() || "Standard Prep",
    bookedBy: currentUser.name,
    bookedByEmail: currentUser.email,
    status: "Pending"
  };

  bookings.push(newBooking);
  document.getElementById("bookingForm").reset();
  setTodayDateAndDay(); // Re-select today's date & day after reset
  syncMealTimeWithRecipe(); // Keep category synced with selected recipe
  saveToStorage();
  refreshAllData();
  alert("Meal booked successfully!");
}

function displayBookings() {
  let tbody = document.getElementById("bookingTableBody");
  let hint = document.getElementById("roleHintText");

  if (currentUser.role === "Admin") {
    hint.innerText = "👨‍🍳 Admin Access: You can view all user requests, approve them, or mark meals as Completed.";
  } else {
    hint.innerText = "👤 User Access: You can view your own meal bookings, mark them Completed, or delete them. (Admin approves pending requests).";
  }

  let visibleBookings = getVisibleBookings();

  if (visibleBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No meal bookings yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = visibleBookings.map(b => {
    let rec = recipes.find(r => r.title === b.recipeTitle);
    let macroSubtext = rec
      ? `<div class="table-macros">🔥 ${rec.calories} kcal | P: ${rec.protein}g • C: ${rec.carbs}g • F: ${rec.fats}g</div>`
      : "";

    let statusOptions = currentUser.role === "Admin"
      ? `<option value="Pending" ${b.status === "Pending" ? "selected" : ""}>Pending</option>
         <option value="Approved" ${b.status === "Approved" ? "selected" : ""}>Approved</option>
         <option value="Completed" ${b.status === "Completed" ? "selected" : ""}>Completed</option>`
      : `<option value="Pending" ${b.status === "Pending" ? "selected" : ""}>Pending</option>
         ${b.status === "Approved" ? `<option value="Approved" selected disabled>Approved</option>` : ""}
         <option value="Completed" ${b.status === "Completed" ? "selected" : ""}>Completed</option>`;

    return `
      <tr>
        <td><strong>${b.day}</strong><br><small class="muted-date">${b.date || "Today"}</small></td>
        <td><span class="badge">${b.mealTime}</span></td>
        <td><strong>${b.recipeTitle}</strong>${macroSubtext}</td>
        <td>${b.notes}</td>
        <td>${b.bookedBy}</td>
        <td><span class="status-badge status-${b.status}">${b.status}</span></td>
        <td class="action-cell">
          <select onchange="updateBookingStatus(${b.id}, this.value)">
            ${statusOptions}
          </select>
          <button class="btn-danger" onclick="deleteBooking(${b.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function updateBookingStatus(id, newStatus) {
  let booking = bookings.find(b => b.id === id);
  if (!booking || !canManageBooking(booking)) return;
  if (newStatus === "Approved" && currentUser.role !== "Admin") return;

  booking.status = newStatus;
  saveToStorage();
  refreshAllData();
}

function deleteBooking(id) {
  let booking = bookings.find(b => b.id === id);
  if (!booking || !canManageBooking(booking)) return;

  if (confirm("Are you sure you want to delete this booking?")) {
    bookings = bookings.filter(b => b.id !== id);
    saveToStorage();
    refreshAllData();
  }
}

// ================= 6. DASHBOARD & NUTRITION REPORTS =================

function updateDashboard() {
  let visible = getVisibleBookings();

  document.getElementById("totalRecipesCount").innerText = recipes.length;
  document.getElementById("totalBookingsCount").innerText = visible.length;
  document.getElementById("pendingCount").innerText = visible.filter(b => b.status === "Pending").length;
  document.getElementById("approvedCount").innerText = visible.filter(b => b.status === "Approved").length;
  document.getElementById("completedCount").innerText = visible.filter(b => b.status === "Completed").length;

  // Calculate average calories & macros across all recipes
  if (recipes.length > 0) {
    let totalCal = recipes.reduce((s, r) => s + (Number(r.calories) || 0), 0);
    let totalPro = recipes.reduce((s, r) => s + (Number(r.protein) || 0), 0);
    let totalCarb = recipes.reduce((s, r) => s + (Number(r.carbs) || 0), 0);
    let totalFat = recipes.reduce((s, r) => s + (Number(r.fats) || 0), 0);

    document.getElementById("avgCalories").innerText = `${Math.round(totalCal / recipes.length)} kcal`;
    document.getElementById("avgProtein").innerText = `${(totalPro / recipes.length).toFixed(1)} g`;
    document.getElementById("avgCarbs").innerText = `${(totalCarb / recipes.length).toFixed(1)} g`;
    document.getElementById("avgFats").innerText = `${(totalFat / recipes.length).toFixed(1)} g`;
  } else {
    document.getElementById("avgCalories").innerText = "0 kcal";
    document.getElementById("avgProtein").innerText = "0 g";
    document.getElementById("avgCarbs").innerText = "0 g";
    document.getElementById("avgFats").innerText = "0 g";
  }

  // Category Report with Average Calories & Progress Bar
  let categories = ["Breakfast", "Lunch", "Dinner", "Snack"];
  let reportBody = document.getElementById("categoryReportBody");

  reportBody.innerHTML = categories.map(cat => {
    let catRecipes = recipes.filter(r => r.category === cat);
    let count = catRecipes.length;
    let avgCal = count > 0
      ? Math.round(catRecipes.reduce((s, r) => s + Number(r.calories), 0) / count)
      : 0;
    let percent = recipes.length > 0 ? Math.round((count / recipes.length) * 100) : 0;

    return `
      <tr>
        <td><span class="badge">${cat}</span></td>
        <td><strong>${count}</strong> recipe(s)</td>
        <td>${avgCal > 0 ? avgCal + " kcal" : "—"}</td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar" style="width: ${percent}%"></div>
          </div>
          <small class="percent-text">${percent}% of recipes</small>
        </td>
      </tr>
    `;
  }).join("");
}

// Auto-start if user is already logged in
if (currentUser) {
  startApp();
}