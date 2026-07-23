const { spawn } = require('child_process');

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}\n${stderr.slice(-2000)}`));
    });
  });
}

/**
 * Local, deterministic enhancement pass: denoise, 2x upscale (lanczos),
 * unsharp mask, and a mild color/contrast lift. Runs entirely with
 * ffmpeg, no external API or model download required.
 *
 * Motion-compensated frame interpolation (minterpolate with mci/aobmc)
 * was tried here but takes several minutes even on a short 1080p clip -
 * too slow to be a usable "enhance" button - so it's left out in favor
 * of a pass that finishes in seconds.
 */
async function localEnhance(inputPath, outputPath) {
  const filters = [
    'hqdn3d=2:1:2:1',
    'scale=iw*2:ih*2:flags=lanczos',
    'unsharp=5:5:0.8:5:5:0.4',
    'eq=contrast=1.06:saturation=1.12:brightness=0.01',
  ].join(',');

  const args = [
    '-y',
    '-i', inputPath,
    '-vf', filters,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    outputPath,
  ];

  await runFfmpeg(args);
  return outputPath;
}

module.exports = { localEnhance };
