const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

// Configurar carpeta de carga
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

app.use(express.static("public")); // Por si tenés frontend embebido
app.use(express.json());

app.post("/convert", upload.single("image"), (req, res) => {
  const style = req.body.style;
  const imagePath = req.file.path;

  console.log("Estilo solicitado:", style);
  console.log("Imagen cargada:", imagePath);

  // Simular procesamiento
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error("Error leyendo la imagen:", err);
      return res.status(500).send("Error al procesar imagen");
    }

    res.set("Content-Type", req.file.mimetype);
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
