const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const admin = require("firebase-admin");

// Load Firebase credentials
const serviceAccount = require("./texttopdfconverter-95c62-firebase-adminsdk-fbsvc-5076fd6fe6.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "texttopdfconverter-95c62.firebasestorage.app", // ✅ Fixed Firebase bucket name
});

const bucket = admin.storage().bucket();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "pdfs")));

// Ensure the 'pdfs' directory exists
if (!fs.existsSync(path.join(__dirname, "pdfs"))) {
  fs.mkdirSync(path.join(__dirname, "pdfs"));
}

// Generate and upload PDF to Firebase Storage
app.post("/api/generate-pdf", async (req, res) => {
  const { text } = req.body;
  try {
    let uuid = crypto.randomUUID();
    const fileName = `${uuid}.pdf`;
    const tempPath = path.join(__dirname, fileName);

    console.log(`📄 Generating PDF: ${fileName}`);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(tempPath);
    doc.pipe(writeStream);
    doc.text(text);
    doc.end();

    writeStream.on("finish", async () => {
      try {
        console.log(`📤 Uploading PDF to Firebase: ${fileName}`);
        await bucket.upload(tempPath, {
          destination: `pdfs/${fileName}`,
          metadata: { contentType: "application/pdf" },
        });

        // Get public URL
        const file = bucket.file(`pdfs/${fileName}`);
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2030",
        });

        console.log(`✅ PDF successfully uploaded: ${url}`);

        // Delete local temp file
        fs.unlinkSync(tempPath);

        res.json({ success: true, pdfUrl: url });
      } catch (uploadErr) {
        console.error("🚨 Firebase upload error:", uploadErr);
        res.status(500).send("Error uploading PDF to Firebase");
      }
    });
  } catch (err) {
    console.error("🚨 PDF generation error:", err);
    res.status(500).send("Error generating PDF");
  }
});

// Route to render all PDFs
app.get("/allpdfs", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "pdfs/" });

    const pdfFiles = files.map(file => ({
      name: file.name.replace("pdfs/", ""),
      url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`, // ✅ Correct Firebase Storage URL format
      created: file.metadata.timeCreated, // Upload timestamp
      size: (file.metadata.size / 1024).toFixed(2) + " KB", // ✅ Convert bytes to KB
    }));

    res.render("allpdfs", { pdfFiles });
  } catch (err) {
    console.error("🚨 Error fetching PDFs from Firebase:", err);
    res.status(500).send("Error loading PDFs");
  }
});

// Route to serve individual PDFs
app.get("/pdfs/:filename", async (req, res) => {
  const { filename } = req.params;
  try {
    const file = bucket.file(`pdfs/${filename}`);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    res.redirect(url);
  } catch (err) {
    console.error("🚨 Error fetching PDF URL:", err);
    res.status(404).send("PDF not found");
  }
});

// Route to delete a PDF
app.post("/delete-pdf", async (req, res) => {
  const { filename } = req.body;
  
  try {
    await bucket.file(`pdfs/${filename}`).delete();
    console.log(`🗑 Deleted PDF: ${filename}`);
    res.json({ success: true, message: "File deleted successfully" });
  } catch (err) {
    console.error("🚨 Error deleting PDF:", err);
    res.status(500).json({ success: false, message: "Error deleting file" });
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
