# Mark — Video Enhancer

A small site to upload a video and enhance it, either with a local ffmpeg
pass or an AI model.

## Running

```bash
npm install
npm start
```

Then open http://localhost:3000. A sample video is preloaded so you can try
it immediately; you can also upload your own.

## Enhance options

- **Local Enhance (ffmpeg)** — works out of the box, no API key or network
  access needed. Denoises, upscales 2x (lanczos), sharpens, lifts contrast/
  saturation, and smooths motion up to 60fps via frame interpolation.
- **AI Enhance (HuggingFace)** — extracts frames and runs each one through
  a hosted super-resolution model (`caidas/swin2SR-classical-sr-x2-64` by
  default) via the HuggingFace Inference API, then reassembles the video.
  Requires a free token from https://huggingface.co/settings/tokens set as
  `HF_TOKEN` (see `.env.example`), plus outbound network access to
  `huggingface.co`.
- **AI Enhance (Higsfield)** — stubbed out in `lib/higsfield.js`. Higsfield
  doesn't have a publicly documented REST API that could be verified while
  building this, so no endpoint is guessed at. Fill in `HIGSFIELD_API_URL`,
  `HIGSFIELD_API_KEY`, and the request logic in that file once you have
  Higsfield's actual API docs.

## Notes

- Uploaded/generated videos are stored under `public/uploads` and
  `public/processed` and are gitignored except for the bundled sample.
- The HuggingFace and Higsfield paths need real outbound network access;
  they're expected to fail in network-restricted sandboxes.
