const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const HF_MODEL = process.env.HF_MODEL || 'caidas/swin2SR-classical-sr-x2-64';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}\n${stderr.slice(-2000)}`));
    });
  });
}

async function upscaleFrame(token, framePath) {
  const bytes = fs.readFileSync(framePath);
  const res = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: bytes,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HuggingFace Inference API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Unexpected response from model (model may be loading): ${text.slice(0, 500)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(framePath, Buffer.from(arrayBuffer));
}

/**
 * AI enhancement via HuggingFace Inference API: extracts frames, runs each
 * one through a hosted super-resolution model (Swin2SR by default), then
 * reassembles the video at the original frame rate and re-attaches audio.
 *
 * Requires HF_TOKEN (a free token from https://huggingface.co/settings/tokens)
 * and outbound network access to huggingface.co, which this sandbox's
 * network policy currently blocks - so this path only runs where both are
 * available (e.g. once deployed).
 *
 * maxFrames caps how many frames get processed, since each frame is one
 * API call; the rest are left at their original resolution before
 * re-encoding, keeping runtime bounded for a demo.
 */
async function aiEnhance(inputPath, outputPath, { maxFrames = 48 } = {}) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      'HF_TOKEN is not set. Get a free token at https://huggingface.co/settings/tokens ' +
      'and set it as an environment variable to enable AI enhancement.'
    );
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-enhance-'));
  const framesDir = path.join(workDir, 'frames');
  fs.mkdirSync(framesDir);

  try {
    await runFfmpeg([
      '-y', '-i', inputPath,
      '-vframes', String(maxFrames),
      path.join(framesDir, 'frame-%05d.png'),
    ]);

    const frameFiles = fs.readdirSync(framesDir).sort();
    if (frameFiles.length === 0) {
      throw new Error('No frames were extracted from the input video.');
    }

    for (const file of frameFiles) {
      await upscaleFrame(token, path.join(framesDir, file));
    }

    const probeFps = await getFps(inputPath);
    const framesPattern = path.join(framesDir, 'frame-%05d.png');

    await runFfmpeg([
      '-y',
      '-framerate', probeFps,
      '-i', framesPattern,
      '-i', inputPath,
      '-map', '0:v:0',
      '-map', '1:a:0?',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-shortest',
      outputPath,
    ]);

    return outputPath;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function getFps(inputPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=r_frame_rate',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ]);
    let out = '';
    proc.stdout.on('data', (chunk) => { out += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(out.trim() || '24');
      else reject(new Error('ffprobe failed to read frame rate'));
    });
  });
}

module.exports = { aiEnhance };
