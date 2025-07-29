# 🌙 Lucidia – Dream Journal App

Lucidia is a **private, personal journal** web app where you can write, edit, and reflect on your thoughts — with the help of an integrated **AI writing assistant**. It’s built with **Node.js**, **Express**, **MongoDB**, **Quill.js**, and uses the **Together AI API** for smart journaling suggestions.


> ✨ “Dear Diary, Today I...” — because your story deserves a space.

---

## 🛠️ Tech Stack

- **Frontend**: EJS, Bootstrap 5, Quill.js    
- **Backend**: Node.js, Express.js
- **Templating Engine**: EJS-Mate Layouts
- **Storage**: MongoDB (local or Atlas) 
- **Version Control**: Git & GitHub
- **Security**: sanitize-html, session management
- **AI API**: [Together.xyz](https://www.together.xyz/) - Mistral 7B 

---

## ✨ Features

- 🧠 **AI Writing Assistant** – Suggests emotionally reflective and vivid diary entry continuations (limited to 5/day).
- 🔐 **User Authentication** – Sign up and login securely with Passport.js.
- 📓 **Create / Read / Update / Delete (CRUD)** for journal entries.
- 💬 **Quill.js Rich Text Editor** – Clean and intuitive journaling experience.
- 🛡️ **XSS-Safe Input** – Content is sanitized on server before storing.
- 🎯 **Daily AI Usage Limit** – Prevents AI abuse with custom middleware.
- 🌙 **Dark Themed UI** – Simple and modern Bootstrap + custom styling.

---

## 🚀 Getting Started

### 1. Clone the repository

bash
git clone https://github.com/your-username/lucidia-journal.git
cd lucidia-journal

### 2. Install dependencies
npm install

⚙️ Setup
Create a .env file in the root with:

TOGETHER_API_KEY=your_together_api_key
SESSION_SECRET=some_strong_secret
MONGO_URL=mongodb://localhost:27017/lucidia

Run MongoDB locally or setup MongoDB Atlas.

Start the server:

nodemon app.js
Visit: http://localhost:3000
