require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const { localEnhance } = require('./lib/localEnhance');
const { aiEnhance } = require('./lib/aiEnhance');
const { higsfieldEnhance } = require('./lib/higsfield');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
const processedDir = path.join(__dirname, 'public', 'processed');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(processedDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      cb(null, safeName);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('video/'));
  },
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/sample', (_req, res) => {
  res.json({ url: '/uploads/sample-explosion-of-colour.mp4' });
});

app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

function resolveInputPath(relativeUrl) {
  const filename = path.basename(relativeUrl);
  const uploadPath = path.join(uploadsDir, filename);
  if (fs.existsSync(uploadPath)) return uploadPath;
  const processedPath = path.join(processedDir, filename);
  if (fs.existsSync(processedPath)) return processedPath;
  return null;
}

app.post('/api/enhance', async (req, res) => {
  const { videoUrl, mode } = req.body || {};
  if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required.' });

  const inputPath = resolveInputPath(videoUrl);
  if (!inputPath) return res.status(404).json({ error: 'Video not found.' });

  const outName = `${Date.now()}-${mode || 'local'}-enhanced.mp4`;
  const outputPath = path.join(processedDir, outName);

  try {
    if (mode === 'ai') {
      await aiEnhance(inputPath, outputPath);
    } else if (mode === 'higsfield') {
      await higsfieldEnhance(inputPath, outputPath);
    } else {
      await localEnhance(inputPath, outputPath);
    }
    res.json({ url: `/processed/${outName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Video enhancer running at http://localhost:${PORT}`);
});
