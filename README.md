# personalized-recipe-and-meal-planner
# 🍲 Personalized Recipe Box & Meal Planner

A simple, responsive project website to save your own recipes, automatically calculate calories and macros, plan meals, and manage diet requests with a role-based workflow.

Built with **HTML, CSS and JavaScript** (no frameworks needed).

## ✨ Features

- **Login & Registration** with two roles:
  - **User** (Student / Cook): saves recipes and books meals
  - **Admin** (Nutritionist / Chef): reviews requests and updates their status
- **Quick demo login** as Admin for easy presentation
- **Dashboard & Reports**
  - Total recipes, total bookings
  - Pending, approved and completed request counts
  - Average calories, protein, carbs and fats per recipe
  - Category breakdown report (Breakfast, Lunch, Dinner, Snack)
- **Recipe Box**
  - Add, view, edit and delete recipes
  - **Auto-calculation** of calories and macros (protein, carbs, fats) from the ingredients and weights you type, e.g. `Oats(100g), Carrots(50g), Peas(30g)`
  - Search by recipe name or ingredient
  - Filter by meal category
- **Meal Planner & Diet Requests**
  - Book a meal for a date; the day and meal category fill in automatically
  - Add a special request or diet note (e.g. "less oil", "extra protein")
  - Track each request's status and update it through the workflow

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and forms |
| CSS3 | Styling and layout |
| JavaScript | Logic, calculations and interactivity |

## 📁 Project Structure

```
├── index.html    # Main page (login, dashboard, recipes, planner)
├── style.css     # Styling
├── script.js     # All the application logic
└── README.md     # Project documentation
```

## 🚀 How to Run

1. Download or clone this repository.
2. Open `index.html` in any web browser (Chrome, Edge, Firefox).
3. Register a new account, or use **Login as Admin** on the login page for a quick demo.

No installation or server is required.

## 📖 How to Use

1. **Register / Login** and choose a role.
2. Go to **Recipe Box** and add a recipe. Type the ingredients with weights and the calories and macros fill in automatically.
3. Go to **Meal Planner & Requests**, choose a recipe and submit a booking.
4. The Admin updates the request status (Pending → Approved → Completed).
5. Check the **Dashboard** for reports and nutrition summaries.


---
⭐ If you like this project, give it a star!
