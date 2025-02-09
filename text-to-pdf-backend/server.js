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
  storageBucket: "texttopdfconverter-95c62.appspot.com",
});

const bucket = admin.storage().bucket();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Fixed view directory
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
    
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(tempPath);
    doc.pipe(writeStream);
    doc.text(text);
    doc.end();
    
    writeStream.on("finish", async () => {
      // Upload to Firebase
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
      
      // Delete local temp file
      fs.unlinkSync(tempPath);
      
      res.json({ success: true, pdfUrl: url });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

app.get("/", (req, res) => {
  res.redirect("/allpdfs");
});

// Route to render all PDFs
app.get("/allpdfs", (req, res) => {
  const pdfDir = path.join(__dirname, "pdfs");

  fs.readdir(pdfDir, (err, files) => {
    if (err) {
      console.error("Error reading PDFs directory:", err);
      return res.status(500).send("Error loading PDFs");
    }
    res.render("allpdfs", { pdfFiles: files });
  });
});

// Route to serve individual PDFs
app.get("/pdfs/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "pdfs", filename);

  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      console.error("Error accessing PDF file:", err);
      return res.status(404).send("PDF not found");
    }
    res.sendFile(filePath);
  });
});

// Start the server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);