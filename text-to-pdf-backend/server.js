const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

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

// Generate and return a PDF file
app.post("/api/generate-pdf", async (req, res) => {
  const { text } = req.body;
  try {
    let uuid = crypto.randomUUID();
    const filePath = path.join(__dirname, "pdfs", uuid + ".pdf");
    const writeStream = fs.createWriteStream(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${uuid}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(writeStream);
    doc.text(text);
    doc.end();

    writeStream.on("close", async () => {
      try {
        const fileContent = await fs.promises.readFile(filePath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${uuid}.pdf`);
        res.send(fileContent);
      } catch (err) {
        console.error("Error reading PDF file:", err);
        res.status(500).send("Error generating PDF");
      }
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