const express = require("express");
var cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();

// Need to update cors to only our domain when hosted
app.use(cors());

const uploadDir = path.join(__dirname, "uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use("/uploads", express.static(uploadDir));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize the filename
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, safeFilename);
  },
});

const upload = multer({ storage: storage });

app.post("/uploads", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const inputFile = path.join(uploadDir, req.file.filename);
  const outputFile = path.join(uploadDir, `processed_${req.file.filename}`);

  let realesrganPath;
  realesrganPath = path.join(__dirname, "executable");

  const model = "model";
  const cmd = `"${realesrganPath}" -i "${inputFile}" -o "${outputFile}" -n ${model}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error processing image: ${stderr}`);
      return res.status(500).send(`Error processing image: ${stderr}`);
    }

    console.log(`Image processed successfully: ${outputFile}`);
    res.send(`/uploads/processed_${req.file.filename}`);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
