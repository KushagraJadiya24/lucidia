# 🌙 Lucidia – Your AI-Powered Private Journal 🧠📝

Lucidia is a beautiful, minimalistic journaling app built using **Express.js**, **EJS**, and **Bootstrap**. Designed with aesthetics and simplicity in mind, Lucidia helps users reflect on their thoughts and emotions by writing entries in a serene, glassy-paper styled UI. It's designed to help users reflect, write, and grow — privately and powerfully.


> ✨ “Dear Diary, Today I...” — because your story deserves a space.

---

## 🛠️ Tech Stack

- **Frontend**: EJS templating, Bootstrap 5, Custom CSS
- **Backend**: Node.js, Express.js
- **Templating Engine**: EJS-Mate Layouts
- **Storage**: MongoDB (via Mongoose)
- **Version Control**: Git & GitHub
- **AI Assist**: Together AI (text generation) 
- **Auth** : Express-session based sessions 
- **Security** :Content encryption middleware 

---

## 💡 Features

- 🛡️ **Private Journaling**: Secure session-based authentication for personal use.
- ✍️ **Rich Text Editing**: Intuitive writing experience using **Quill.js**.
- 🤖 **AI Writing Assistant**: Generate ideas, rephrase entries, or overcome writer’s block using **Together AI integration**.
- 🗃️ **Entry Management**: Create, edit, view, and delete journal entries easily.
- 🔐 **End-to-End Encryption**: Journal content is encrypted before saving to ensure privacy.

---

## 🚀 Getting Started

### 1. Clone the repository

bash
git clone https://github.com/your-username/lucidia-journal.git
cd lucidia-journal

### 2. Install dependencies
npm install

3. **Set up environment variables**
Create a `.env` file in the root directory with the following:
```env
SESSION_SECRET=your_secret_key
MONGODB_URI=your_mongodb_uri
TOGETHER_API_KEY=your_together_ai_key
```

4. **Run the app**
```bash
npm start
```

Visit `http://localhost:3000` in your browser.

## 🤝 Contributing

Pull requests are welcome! If you’d like to contribute, please fork the repo and use a feature branch.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [Quill.js](https://quilljs.com/)
- [Together AI](https://www.together.ai/)
- [Express.js](https://expressjs.com/)
