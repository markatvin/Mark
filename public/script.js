const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const originalVideo = document.getElementById('original-video');
const enhancedVideo = document.getElementById('enhanced-video');
const statusEl = document.getElementById('status');
const downloadLink = document.getElementById('download-link');

const btnLocal = document.getElementById('btn-local');
const btnAi = document.getElementById('btn-ai');
const btnHigsfield = document.getElementById('btn-higsfield');

let currentVideoUrl = null;

async function loadSample() {
  const res = await fetch('/api/sample');
  const data = await res.json();
  setCurrentVideo(data.url, 'sample-explosion-of-colour.mp4 (preloaded)');
}

function setCurrentVideo(url, label) {
  currentVideoUrl = url;
  originalVideo.src = url;
  fileName.textContent = label;
  enhancedVideo.removeAttribute('src');
  downloadLink.style.display = 'none';
  statusEl.textContent = '';
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  statusEl.textContent = 'Uploading...';
  const formData = new FormData();
  formData.append('video', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) {
    statusEl.textContent = `Upload failed: ${data.error}`;
    return;
  }
  setCurrentVideo(data.url, file.name);
});

function setButtonsDisabled(disabled) {
  btnLocal.disabled = disabled;
  btnAi.disabled = disabled;
  btnHigsfield.disabled = disabled;
}

async function enhance(mode, label) {
  if (!currentVideoUrl) return;
  setButtonsDisabled(true);
  statusEl.textContent = `Running ${label}... this can take a while.`;
  try {
    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: currentVideoUrl, mode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Enhancement failed.');
    enhancedVideo.src = data.url;
    downloadLink.href = data.url;
    downloadLink.style.display = 'inline-block';
    statusEl.textContent = `${label} complete.`;
  } catch (err) {
    statusEl.textContent = `${label} failed: ${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
}

btnLocal.addEventListener('click', () => enhance('local', 'Local Enhance (ffmpeg)'));
btnAi.addEventListener('click', () => enhance('ai', 'AI Enhance (HuggingFace)'));
btnHigsfield.addEventListener('click', () => enhance('higsfield', 'AI Enhance (Higsfield)'));

loadSample();
