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

const app = express();
const port = process.env.PORT || 3000;

// Setup file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Required for ES Modules (to get __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Replicate and OpenAI
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Estilos disponibles
const estilos = {
  "The New Yorker": "estilo elegante, línea clara, colores planos, estilo narrativo urbano moderno",
  "Estilo Tintin": "líneas negras, colores planos, iluminación limpia, estilo vintage europeo, fondo claro"
};

app.post('/convert', upload.single('image'), async (req, res) => {
  const styleKey = req.body.style;
  const imagePath = req.file.path;

  const promptBase = estilos[styleKey] || 'dibujo estilo ilustración, líneas limpias y colores planos';

  try {
    const prediction = await replicate.run(
      "lucataco/instant-id:14cf437d40dc72e587f2416d158b63e70d9389302ff9ee86f1309c61b6a06baa",
      {
        input: {
          image: fs.createReadStream(imagePath),
          prompt: `Retrato transformado en ${promptBase}`,
          seed: 42,
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      }
    );

    res.json({ output: prediction });
  } catch (error) {
    console.error('Error al generar imagen:', error);
    res.status(500).json({ error: 'Falló la generación de imagen.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
