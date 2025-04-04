const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const Replicate = require("replicate");

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Replicate con tu token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Carpeta temporal donde se guarda la imagen
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/convert", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const style = req.body.style;

    // Usamos un modelo de Replicate real, en este caso "tstramer/tinify"
    const modelId = "tstramer/tinify";

    const output = await replicate.run(modelId, {
      input: {
        image: fs.createReadStream(imagePath),
      },
    });

    // Descargar la imagen procesada desde la URL generada por Replicate
    const response = await fetch(output);
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).send("Error al procesar la imagen");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
