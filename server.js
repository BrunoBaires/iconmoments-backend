import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crea la carpeta 'uploads' si no existe
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración del servidor
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuración de multer para guardar imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Endpoint principal
app.post('/convert', upload.single('image'), async (req, res) => {
  const imagePath = req.file?.path;
  const style = req.body?.style;

  if (!imagePath || !style) {
    return res.status(400).json({ error: 'Faltan datos (imagen o estilo)' });
  }

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const modelVersion = {
      tintin: "tintin-model-id",
      crayon: "crayon-model-id",
      newyorker: "newyorker-model-id"
    }[style];

    if (!modelVersion) {
      return res.status(400).json({ error: 'Estilo no reconocido' });
    }

    const output = await replicate.run(modelVersion, {
      input: { image: fs.createReadStream(imagePath) }
    });

    const response = await fetch(output);
    const blob = await response.blob();

    res.setHeader("Content-Type", blob.type);
    blob.arrayBuffer().then(buffer => res.end(Buffer.from(buffer)));
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

