# Text to PDF Converter

## 🚀 About
A **Text to PDF Converter** web service and Chrome extension that allows users to generate PDFs from selected text or entire web pages. The PDFs are stored in **Firebase Storage** and can be accessed anytime via a web interface.

## 🌟 Features
- ✅ Generate PDFs from selected text or full web pages.
- ✅ Store PDFs in **Firebase Storage** for easy access.
- ✅ List all generated PDFs on a dedicated web page.
- ✅ Chrome extension for seamless integration.
- ✅ Secure **Google Authentication** for managing PDFs.
- ✅ Hosted on **Render** for easy deployment.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, PDFKit, Firebase Admin SDK
- **Frontend:** HTML, Tailwind CSS, Firebase Authentication
- **Storage:** Firebase Cloud Storage
- **Deployment:** Render
- **Browser Extension:** Chrome Extension (Manifest v3)

---

## 📖 Setup Guide

### 📌 Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **NPM** (comes with Node.js)
- **Google Firebase Account** (for cloud storage and authentication)
- **Render Account** (for hosting the backend)

### 📥 Clone the Repository
```sh
git clone https://github.com/krishna31102004/text-to-pdf-backend.git
cd text-to-pdf-backend
```

### 📦 Install Dependencies
```sh
npm install
```

### 🔧 Setup Firebase Storage
1. Go to **Firebase Console** → **Storage**.
2. Create a new bucket with the name:
   ```
   texttopdfconverter-95c62.appspot.com
   ```
3. Download the Firebase Admin SDK JSON file.
4. Place the file inside the project root and **add it to `.gitignore`**.

### ▶️ Run Locally
```sh
npm start
```
Server runs at: `http://localhost:5001`

---

## 🌍 Deploy on Render
1. Push your changes to GitHub.
2. Go to [Render](https://dashboard.render.com/), create a new **Web Service**.
3. Connect your GitHub repo.
4. Set the **Root Directory** to `text-to-pdf-backend`.
5. Add **Environment Variables**:
   - `GOOGLE_APPLICATION_CREDENTIALS = /etc/secrets/texttopdfconverter-95c62-firebase-adminsdk-fbsvc-5076fd6fe6.json`
6. Deploy and grab your API URL.

---

## 📄 API Endpoints
### 🎯 Generate PDF
#### `POST /api/generate-pdf`
**Request:**
```json
{
  "text": "Hello, this is a test PDF."
}
```
**Response:**
```json
{
  "success": true,
  "pdfUrl": "https://storage.googleapis.com/.../your-file.pdf"
}
```

### 📜 List All PDFs
#### `GET /allpdfs`
Returns a list of stored PDFs.

---

## 🌐 Chrome Extension Setup
### 📥 Load the Extension
1. Open **Chrome** and go to `chrome://extensions/`.
2. Enable **Developer Mode** (top right corner).
3. Click **Load unpacked**.
4. Select the `chrome-extension` folder.

### 🔹 Usage
1. Right-click on any page and select **Convert page text to PDF**.
2. The generated PDF will be stored in **Firebase** and accessible via the web UI.

---

## 🔥 Demo
🚀 Live Backend: [Text to PDF API](https://texttopdfconverter2.onrender.com/)  
🌐 Web UI: [View PDFs](https://texttopdfconverter2.onrender.com/allpdfs)

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License
MIT License © 2025 Krishna Balaji