# ElevenLabs Voice Studio 🎙️

A hyper-realistic Neural Text-to-Speech (TTS) Studio web application built with **HTML5, CSS3, and JavaScript**.

Powered by the **ElevenLabs API**, featuring model selection, voice persona configuration, real-time Web Audio API frequency visualizer, and a custom audio mastering player.

---

## ✨ Features

- **Model Selection Dropdown**:
  - `Eleven Multilingual v2`: State-of-the-art lifelike narration across 29+ languages.
  - `Eleven Flash v2.5`: Ultra-low latency (~75ms) lightweight model.
  - `Eleven Turbo v2.5`: High-speed generation with rich expressive nuance.
  - `Eleven English v1`: Classic expressive English narration.
  - `Eleven Turbo v2`: High-throughput English engine.
- **Voice Persona Selector**:
  - Curated set of renowned ElevenLabs voices: Rachel, Domi, Bella, Antoni, Elli, Josh, Arnold, Adam, Sam, Dave, George.
  - **Account Voice Sync**: One-click sync button to fetch your own custom cloned voices directly from your ElevenLabs account via `GET /v1/voices`.
- **Advanced Voice Fine-Tuning**:
  - *Stability*: Adjust consistency vs. dynamic expressive variation.
  - *Clarity + Similarity Boost*: Control resemblance to the original speaker.
  - *Style Exaggeration*: Amplify emotion and dramatic cadence.
  - *Speaker Boost*: Enhance presence and soundstage.
- **Real-Time Acoustic Visualizer**:
  - Canvas-rendered dynamic audio visualizer utilizing the browser's native **Web Audio API** (`AudioContext` and `AnalyserNode`).
  - Fluid animated spectrum bars synced with active narration.
- **Studio Audio Player**:
  - Play, pause, 5s rewind, 5s forward.
  - Smooth interactive scrub bar with time formatting.
  - Playback speed multiplier (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
  - Volume control and mute toggle.
  - Instant **MP3 Download** button.
- **Recent Takes History**:
  - Keeps track of generated takes during the session for instant replay.
- **Security & Privacy**:
  - Your API key is stored client-side in your browser's `localStorage` and sent directly to `api.elevenlabs.io`. No intermediate server.
- **Free Demo Mode**:
  - Want to test right away without spending API credits? Toggle **Demo Mode** to preview using the browser's built-in Web Speech API!

---

## 🚀 Getting Started

Since this project is built using vanilla web technologies, you don't need any build steps or complex dependencies:

### Option 1: Open Directly in Browser
Simply double-click `index.html` or open it with any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run with a Local Static Server
If you have Python or Node installed, you can start a local development server:

Using Python:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

Using Node.js:
```bash
npx serve .
```

---

## 🔑 Configuring Your ElevenLabs API Key

1. Sign up or log into [ElevenLabs](https://elevenlabs.io).
2. Go to your Profile settings -> [API Keys](https://elevenlabs.io/app/settings/api-keys) and copy your key (`xi-...`).
3. Click the **"API Key Required"** button at the top right of the application.
4. Paste your key and click **"Save & Connect"**.
5. Your custom account voices will automatically sync and appear in the voice dropdown!

---

## 🛠️ File Structure

- `index.html`: Modern semantic HTML5 markup with accessible controls, modal, and responsive studio layout.
- `styles.css`: Bespoke dark studio design system with glowing glassmorphism, fluid typography, and custom audio controls.
- `app.js`: Pure JavaScript architecture handling ElevenLabs REST endpoints, Web Audio API frequency analysis, canvas rendering, and session take history.
