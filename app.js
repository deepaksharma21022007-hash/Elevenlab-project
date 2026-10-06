/**
 * ElevenLabs Voice Studio — Core Application Logic
 * Pure Vanilla JavaScript implementation with Web Audio API Visualizer
 */

(function () {
  'use strict';

  // --- Configuration & Constants ---
  const STORAGE_KEYS = {
    API_KEY: 'elevenlabs_api_key',
    SETTINGS: 'elevenlabs_user_settings',
    HISTORY: 'elevenlabs_takes_history',
    DEMO_MODE: 'elevenlabs_demo_mode'
  };

  const PRESETS = {
    scifi: "Earth had long since become a faded memory in our navigational charts. Across the expanse of the Perseus Arm, our engines hummed in deep harmony with the quiet pulse of deep space.",
    podcast: "Welcome back to Tech Frontiers! In today's episode, we're diving deep into neural voice synthesis, synthetic media, and how real-time generative audio is reshaping human storytelling.",
    audiobook: "The ancient oak door groaned on its iron hinges, admitting a draft that set the hearth flames dancing. Elena paused on the threshold, her lantern casting long shadows across forgotten maps.",
    product: "Introducing the all-new Studio Engine: Designed from the atom up for cinematic clarity, near-zero latency, and unparalleled emotional precision. This is sound, reimagined."
  };

  const MODEL_METADATA = {
    eleven_multilingual_v2: {
      tier: 'Multilingual',
      desc: 'State-of-the-art lifelike delivery across 29+ languages with deep emotional range.'
    },
    eleven_flash_v2_5: {
      tier: 'Ultra Fast',
      desc: 'Next-gen lightweight model with ultra-low latency (~75ms) for real-time speech.'
    },
    eleven_turbo_v2_5: {
      tier: 'High Speed',
      desc: 'Optimized high-speed model with incredible naturalness and expressive nuance.'
    },
    eleven_monolingual_v1: {
      tier: 'Classic English',
      desc: 'Original acclaimed model fine-tuned for expressive English narration.'
    },
    eleven_turbo_v2: {
      tier: 'Turbo English',
      desc: 'High-throughput English model tailored for responsive developer pipelines.'
    }
  };

  const VOICE_DESCRIPTIONS = {
    '21m00Tcm4TlvDq8ikWAM': 'Ideal for audiobooks, educational videos, and corporate narration.',
    'AZnzlk1XvdvUeBnXmlld': 'Strong, confident, and energetic tone for announcements.',
    'EXAVITQu4vr4xnSDxMaL': 'Warm, empathetic, and gentle for meditation or emotional stories.',
    'ErXwobaYiN019PkySvjV': 'Friendly, well-rounded conversational male voice.',
    'MF3mGyEYCl7XYWbV9V6O': 'Young, bright, and vibrant narration style.',
    'TxGEqnHWrfWFTfGW9XjX': 'Deep, resonant, and authoritative documentary tone.',
    'VR6AewLTigWG4xSOukaG': 'Crisp, articulate narrative delivery.',
    'pNInz6obpgDQGcFmaJgB': 'Bold, cinematic trailer and audiobook narration.',
    'yoZ06aMxZJJ28mfd3POQ': 'Dynamic, slightly raspy character voice.',
    'CYw3kZ02Hs0563khs1Fj': 'Conversational British accent with engaging pacing.',
    'JBFqnCBsd6RMkjVDRZzb': 'Warm, classic British storyteller tone.'
  };

  const DEFAULT_API_KEY = 'sk_2183f5c5c6b8db47cd3b5fc9533f81bf47de66765c65e537';

  const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  let state = {
    apiKey: (savedKey && savedKey.trim().length > 0) ? savedKey : DEFAULT_API_KEY,
    isDemoMode: localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true',
    currentBlobUrl: null,
    currentBlob: null,
    isPlaying: false,
    currentSpeedIndex: 1, // 1.0x
    speedOptions: [0.75, 1.0, 1.25, 1.5, 2.0],
    isGenerating: false,
    history: [],
    customVoices: []
  };

  // --- DOM Elements ---
  const elements = {
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    wordCount: document.getElementById('wordCount'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    modelSelect: document.getElementById('modelSelect'),
    modelTierBadge: document.getElementById('modelTierBadge'),
    modelDesc: document.getElementById('modelDesc'),
    voiceSelect: document.getElementById('voiceSelect'),
    voiceDesc: document.getElementById('voiceDesc'),
    refreshVoicesBtn: document.getElementById('refreshVoicesBtn'),
    toggleSettingsBtn: document.getElementById('toggleSettingsBtn'),
    advancedSettingsBody: document.getElementById('advancedSettingsBody'),
    stabilitySlider: document.getElementById('stabilitySlider'),
    stabilityVal: document.getElementById('stabilityVal'),
    similaritySlider: document.getElementById('similaritySlider'),
    similarityVal: document.getElementById('similarityVal'),
    styleSlider: document.getElementById('styleSlider'),
    styleVal: document.getElementById('styleVal'),
    speakerBoostToggle: document.getElementById('speakerBoostToggle'),
    generatePlayBtn: document.getElementById('generatePlayBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    mainBtnIcon: document.getElementById('mainBtnIcon'),
    mainBtnText: document.getElementById('mainBtnText'),
    mainBtnSub: document.getElementById('mainBtnSub'),
    nativeAudio: document.getElementById('nativeAudio'),
    visualizerCanvas: document.getElementById('visualizerCanvas'),
    visualizerOverlay: document.getElementById('visualizerOverlay'),
    playbackBadge: document.getElementById('playbackBadge'),
    playbackBadgeText: document.getElementById('playbackBadgeText'),
    currentVoiceAvatar: document.getElementById('currentVoiceAvatar'),
    currentVoiceTitle: document.getElementById('currentVoiceTitle'),
    currentModelMeta: document.getElementById('currentModelMeta'),
    downloadBtn: document.getElementById('downloadBtn'),
    currentTimeLabel: document.getElementById('currentTimeLabel'),
    durationTimeLabel: document.getElementById('durationTimeLabel'),
    scrubBar: document.getElementById('scrubBar'),
    progressBar: document.getElementById('progressBar'),
    progressHandle: document.getElementById('progressHandle'),
    bufferedBar: document.getElementById('bufferedBar'),
    playerPlayPauseBtn: document.getElementById('playerPlayPauseBtn'),
    playerPlayIcon: document.getElementById('playerPlayIcon'),
    playerPauseIcon: document.getElementById('playerPauseIcon'),
    rewindBtn: document.getElementById('rewindBtn'),
    forwardBtn: document.getElementById('forwardBtn'),
    speedBtn: document.getElementById('speedBtn'),
    muteBtn: document.getElementById('muteBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    historyList: document.getElementById('historyList'),
    emptyHistoryMsg: document.getElementById('emptyHistoryMsg'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    // Header & Modal
    apiKeyBtn: document.getElementById('apiKeyBtn'),
    apiStatusDot: document.getElementById('apiStatusDot'),
    apiStatusText: document.getElementById('apiStatusText'),
    demoModeToggle: document.getElementById('demoModeToggle'),
    demoModeText: document.getElementById('demoModeText'),
    apiModal: document.getElementById('apiModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
    eyeIcon: document.getElementById('eyeIcon'),
    saveKeyBtn: document.getElementById('saveKeyBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    removeKeyBtn: document.getElementById('removeKeyBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Web Audio & Visualizer Setup ---
  let audioContext = null;
  let analyserNode = null;
  let sourceNode = null;
  let visualizerAnimationId = null;
  let canvasCtx = null;
  let simulatedFreqData = new Uint8Array(64);

  function initAudioContext() {
    if (!audioContext) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioContext = new AudioCtxClass();
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 128; // 64 frequency data bins
        analyserNode.smoothingTimeConstant = 0.8;

        try {
          sourceNode = audioContext.createMediaElementSource(elements.nativeAudio);
          sourceNode.connect(analyserNode);
          analyserNode.connect(audioContext.destination);
        } catch (err) {
          console.warn('Audio node connection notice:', err);
        }
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function resizeCanvas() {
    const canvas = elements.visualizerCanvas;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    if (canvasCtx) {
      canvasCtx.scale(dpr, dpr);
    }
  }

  function initVisualizer() {
    const canvas = elements.visualizerCanvas;
    canvasCtx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    renderVisualizerLoop();
  }

  function renderVisualizerLoop() {
    visualizerAnimationId = requestAnimationFrame(renderVisualizerLoop);

    const canvas = elements.visualizerCanvas;
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;

    canvasCtx.clearRect(0, 0, width, height);

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    if (state.isPlaying && analyserNode && !state.isDemoMode) {
      analyserNode.getByteFrequencyData(dataArray);
    } else if (state.isPlaying && state.isDemoMode) {
      // Simulate pleasant bouncing spectrum for demo mode
      for (let i = 0; i < simulatedFreqData.length; i++) {
        const target = Math.random() * 200 + 40;
        simulatedFreqData[i] += (target - simulatedFreqData[i]) * 0.25;
        dataArray[i] = simulatedFreqData[i];
      }
    } else {
      // Idle gentle subtle sine wave
      const time = Date.now() * 0.003;
      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, height / 2);
      for (let x = 0; x < width; x += 4) {
        const y = height / 2 + Math.sin(x * 0.02 + time) * 6 * Math.sin(x / width * Math.PI);
        canvasCtx.lineTo(x, y);
      }
      canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
      canvasCtx.restore();
      return;
    }

    // Draw Modern Glowing Frequency Spectrum
    const barCount = 38;
    const spacing = 5;
    const totalSpacing = spacing * (barCount - 1);
    const barWidth = Math.max(3, (width - 40 - totalSpacing) / barCount);
    const startX = (width - (barCount * barWidth + totalSpacing)) / 2;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * bufferLength);
      const value = dataArray[dataIndex] || 0;
      const percent = value / 255;
      const minBarH = 4;
      const barHeight = Math.max(minBarH, percent * (height * 0.78));

      const x = startX + i * (barWidth + spacing);
      const y = (height - barHeight) / 2;

      // Gradient fill (Cyan -> Violet -> Indigo)
      const gradient = canvasCtx.createLinearGradient(0, y + barHeight, 0, y);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#06b6d4');

      canvasCtx.fillStyle = gradient;
      canvasCtx.shadowColor = 'rgba(168, 85, 247, 0.4)';
      canvasCtx.shadowBlur = 8;

      // Draw rounded bar
      roundRect(canvasCtx, x, y, barWidth, barHeight, barWidth / 2);
      canvasCtx.fill();
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  // --- Toast Notification System ---
  function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => toast.remove(), 250);
    }, 4500);
  }

  // --- API Key & State Management ---
  function updateApiStatus() {
    if (state.apiKey && state.apiKey.trim().length > 0) {
      elements.apiStatusDot.classList.add('configured');
      elements.apiStatusText.textContent = 'API Key Connected';
      elements.apiKeyBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
      elements.apiStatusDot.classList.remove('configured');
      elements.apiStatusText.textContent = state.isDemoMode ? 'Demo Mode Active' : 'API Key Required';
      elements.apiKeyBtn.style.borderColor = state.isDemoMode ? 'rgba(6, 182, 212, 0.4)' : 'rgba(245, 158, 11, 0.4)';
    }

    if (state.isDemoMode) {
      elements.demoModeToggle.classList.add('active');
      elements.demoModeText.textContent = 'Demo Mode: On';
    } else {
      elements.demoModeToggle.classList.remove('active');
      elements.demoModeText.textContent = 'Demo Mode: Off';
    }
  }

  function openApiModal() {
    elements.apiKeyInput.value = state.apiKey;
    elements.apiModal.classList.add('open');
    elements.apiKeyInput.focus();
  }

  function closeApiModal() {
    elements.apiModal.classList.remove('open');
  }

  function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    if (!key) {
      showToast('API Key Missing', 'Please enter a valid ElevenLabs key or use Demo Mode.', 'error');
      return;
    }
    state.apiKey = key;
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    updateApiStatus();
    closeApiModal();
    showToast('Key Connected', 'Your ElevenLabs API key has been securely saved in your browser.', 'success');

    // Auto-fetch account voices
    fetchAccountVoices(true);
  }

  function removeApiKey() {
    state.apiKey = '';
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    elements.apiKeyInput.value = '';
    updateApiStatus();
    closeApiModal();
    showToast('Key Removed', 'API key was cleared from local storage.', 'info');
  }

  function toggleDemoMode() {
    state.isDemoMode = !state.isDemoMode;
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, state.isDemoMode);
    updateApiStatus();
    if (state.isDemoMode) {
      showToast('Demo Mode Activated', 'Narration will now use browser voice synthesis without needing API credits!', 'info');
    } else {
      showToast('Demo Mode Deactivated', 'Switched back to ElevenLabs neural speech engine.', 'info');
    }
  }

  // --- Voice & Model Management ---
  // Helper to safely get the selected voice display name
  function getSelectedVoiceName() {
    const sel = elements.voiceSelect;
    if (!sel || sel.selectedIndex < 0 || !sel.options[sel.selectedIndex]) {
      return 'Voice';
    }
    const text = sel.options[sel.selectedIndex].text;
    return text.includes('—') ? text.split('—')[0].trim() : text.trim();
  }

  // Helper to safely get the selected model display name
  function getSelectedModelName() {
    const sel = elements.modelSelect;
    if (!sel || sel.selectedIndex < 0 || !sel.options[sel.selectedIndex]) {
      return 'ElevenLabs Model';
    }
    const text = sel.options[sel.selectedIndex].text;
    return text.includes('(') ? text.split('(')[0].trim() : text.trim();
  }

  function updateModelInfo() {
    const modelId = elements.modelSelect.value;
    const meta = MODEL_METADATA[modelId] || { tier: 'Neural', desc: 'High-fidelity audio generation.' };
    elements.modelTierBadge.textContent = meta.tier;
    elements.modelDesc.textContent = meta.desc;
    const modelTitle = getSelectedModelName();
    elements.currentModelMeta.textContent = `${modelTitle} • 44.1 kHz`;
  }

  function updateVoiceInfo() {
    const voiceId = elements.voiceSelect.value;
    const voiceName = getSelectedVoiceName();
    elements.currentVoiceTitle.textContent = voiceName;
    elements.currentVoiceAvatar.textContent = voiceName.charAt(0).toUpperCase() || 'V';

    const desc = VOICE_DESCRIPTIONS[voiceId] || 'High-fidelity ElevenLabs voice persona.';
    elements.voiceDesc.textContent = desc;
  }

  async function fetchAccountVoices(silent = false) {
    if (!state.apiKey) {
      if (!silent) {
        showToast('API Key Required', 'Please configure your ElevenLabs API key first to sync account voices.', 'error');
        openApiModal();
      }
      return;
    }

    elements.refreshVoicesBtn.classList.add('loading');
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': state.apiKey
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // If key does not have voices_read permission, keep built-in voices without error
          console.warn('Voice sync notice: API key does not have voices_read permission. Using built-in voice set.');
          if (!silent) {
            showToast('Voice Sync Notice', 'Your API key does not have voices_read permission; standard built-in voices remain active.', 'info');
          }
          return;
        }
        throw new Error(`Status ${response.status}: Failed to fetch voices.`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.voices) && data.voices.length > 0) {
        state.customVoices = data.voices;
        populateVoiceSelect(data.voices);
        if (!silent) {
          showToast('Voices Synced', `Loaded ${data.voices.length} voices directly from your ElevenLabs account!`, 'success');
        }
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        showToast('Sync Failed', 'Could not fetch voices. Please verify your API key.', 'error');
      }
    } finally {
      elements.refreshVoicesBtn.classList.remove('loading');
    }
  }

  function populateVoiceSelect(voices) {
    const currentSelected = elements.voiceSelect.value;
    elements.voiceSelect.innerHTML = '';

    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voice_id;
      const category = v.category ? `[${v.category}] ` : '';
      const labels = v.labels ? Object.values(v.labels).slice(0, 2).join(', ') : '';
      opt.textContent = `${v.name} — ${category}${labels}`;
      elements.voiceSelect.appendChild(opt);
    });

    if (currentSelected && [...elements.voiceSelect.options].some(o => o.value === currentSelected)) {
      elements.voiceSelect.value = currentSelected;
    }
    updateVoiceInfo();
  }

  // --- Narration Generation ---
  async function generateNarration() {
    const text = elements.textInput.value.trim();
    if (!text) {
      showToast('Text Required', 'Please enter or paste some text content to narrate.', 'error');
      elements.textInput.focus();
      return;
    }

    initAudioContext();

    if (!state.apiKey && !state.isDemoMode) {
      showToast('API Key Required', 'Enter your ElevenLabs API key or turn on Demo Mode to test.', 'error');
      openApiModal();
      return;
    }

    setGeneratingState(true);

    if (state.isDemoMode) {
      handleDemoNarration(text);
      return;
    }

    try {
      const voiceId = elements.voiceSelect.value;
      const modelId = elements.modelSelect.value;
      const stability = parseFloat(elements.stabilitySlider.value);
      const similarityBoost = parseFloat(elements.similaritySlider.value);
      const style = parseFloat(elements.styleSlider.value);
      const useSpeakerBoost = elements.speakerBoostToggle.checked;

      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const payload = {
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: stability,
          similarity_boost: similarityBoost,
          style: style,
          use_speaker_boost: useSpeakerBoost
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': state.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMessage = `Generation failed (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson) {
            if (typeof errJson.detail === 'string') {
              errMessage = errJson.detail;
            } else if (errJson.detail && errJson.detail.message) {
              errMessage = errJson.detail.message;
            } else if (Array.isArray(errJson.detail) && errJson.detail.length > 0) {
              errMessage = errJson.detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
            } else if (errJson.message) {
              errMessage = errJson.message;
            }
          }
        } catch (_) {}

        if (response.status === 402) {
          errMessage = 'This voice requires a paid ElevenLabs plan. Please switch to Adam, Antoni, Bella, Arnold, or George (which work on free accounts) or upgrade your subscription.';
        }

        throw new Error(errMessage);
      }

      const audioBlob = await response.blob();
      state.currentBlob = audioBlob;
      if (state.currentBlobUrl) {
        URL.revokeObjectURL(state.currentBlobUrl);
      }
      state.currentBlobUrl = URL.createObjectURL(audioBlob);

      // Load into audio element and play
      loadAudioSource(state.currentBlobUrl);

      // Add to session history
      const voiceName = getSelectedVoiceName();
      addHistoryItem({
        voiceName,
        text,
        blobUrl: state.currentBlobUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      showToast('Narration Ready', 'ElevenLabs neural speech successfully generated.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Speech Generation Failed', err.message || 'Please check your connection and quota.', 'error');
    } finally {
      setGeneratingState(false);
    }
  }

  function handleDemoNarration(text) {
    if (!('speechSynthesis' in window)) {
      showToast('Speech Synthesis Unsupported', 'Your browser does not support Web Speech API.', 'error');
      setGeneratingState(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = state.speedOptions[state.currentSpeedIndex] || 1.0;

    // Pick a browser voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(v => v.lang.startsWith('en')) || voices[0];
      utterance.voice = preferred;
    }

    utterance.onstart = () => {
      setGeneratingState(false);
      state.isPlaying = true;
      updatePlaybackUI(true);
      elements.visualizerOverlay.classList.add('hidden');
    };

    utterance.onend = () => {
      state.isPlaying = false;
      updatePlaybackUI(false);
      elements.visualizerOverlay.classList.remove('hidden');
    };

    utterance.onerror = (e) => {
      setGeneratingState(false);
      state.isPlaying = false;
      updatePlaybackUI(false);
      showToast('Demo Narration Error', 'Could not play speech synthesis.', 'error');
    };

    window.speechSynthesis.speak(utterance);
    showToast('Demo Narration Playing', 'Playing via Web Speech API (Demo Mode).', 'info');
  }

  function setGeneratingState(isGen) {
    state.isGenerating = isGen;
    if (isGen) {
      elements.loadingSpinner.classList.add('active');
      elements.generatePlayBtn.disabled = true;
      elements.mainBtnText.textContent = 'Synthesizing...';
      elements.mainBtnSub.textContent = 'Rendering neural audio waves';
    } else {
      elements.loadingSpinner.classList.remove('active');
      elements.generatePlayBtn.disabled = false;
      elements.mainBtnText.textContent = 'Start Narration';
      elements.mainBtnSub.textContent = 'Generate audio stream via ElevenLabs';
    }
  }

  function loadAudioSource(srcUrl) {
    elements.nativeAudio.src = srcUrl;
    elements.nativeAudio.playbackRate = state.speedOptions[state.currentSpeedIndex] || 1.0;
    elements.nativeAudio.play().then(() => {
      state.isPlaying = true;
      updatePlaybackUI(true);
    }).catch(err => {
      console.warn('Autoplay prevented:', err);
    });

    elements.playerPlayPauseBtn.disabled = false;
    elements.rewindBtn.disabled = false;
    elements.forwardBtn.disabled = false;
    elements.downloadBtn.disabled = false;
    elements.visualizerOverlay.classList.add('hidden');
  }

  // --- Player UI & Native Audio Listeners ---
  function setupAudioPlayer() {
    const audio = elements.nativeAudio;

    audio.addEventListener('timeupdate', () => {
      const current = audio.currentTime;
      const duration = audio.duration || 0;
      elements.currentTimeLabel.textContent = formatTime(current);

      if (duration > 0) {
        const percent = (current / duration) * 100;
        elements.progressBar.style.width = `${percent}%`;
        elements.progressHandle.style.left = `${percent}%`;
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      elements.durationTimeLabel.textContent = formatTime(audio.duration || 0);
    });

    audio.addEventListener('progress', () => {
      if (audio.buffered.length > 0 && audio.duration) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const percent = (bufferedEnd / audio.duration) * 100;
        elements.bufferedBar.style.width = `${percent}%`;
      }
    });

    audio.addEventListener('play', () => {
      state.isPlaying = true;
      updatePlaybackUI(true);
    });

    audio.addEventListener('pause', () => {
      state.isPlaying = false;
      updatePlaybackUI(false);
    });

    audio.addEventListener('ended', () => {
      state.isPlaying = false;
      updatePlaybackUI(false);
      elements.progressBar.style.width = '0%';
      elements.progressHandle.style.left = '0%';
      elements.currentTimeLabel.textContent = '0:00';
    });

    // Scrub Bar Interaction
    elements.scrubBar.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = elements.scrubBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(pos * audio.duration, audio.duration));
    });

    // Play / Pause Toggle
    elements.playerPlayPauseBtn.addEventListener('click', () => {
      if (state.isDemoMode && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          state.isPlaying = true;
          updatePlaybackUI(true);
        } else {
          window.speechSynthesis.pause();
          state.isPlaying = false;
          updatePlaybackUI(false);
        }
        return;
      }

      if (!audio.src) {
        generateNarration();
        return;
      }

      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    // Skip Forward / Back
    elements.rewindBtn.addEventListener('click', () => {
      if (audio.src) audio.currentTime = Math.max(0, audio.currentTime - 5);
    });

    elements.forwardBtn.addEventListener('click', () => {
      if (audio.src && audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    });

    // Speed Cycle
    elements.speedBtn.addEventListener('click', () => {
      state.currentSpeedIndex = (state.currentSpeedIndex + 1) % state.speedOptions.length;
      const speed = state.speedOptions[state.currentSpeedIndex];
      elements.speedBtn.textContent = `${speed}x`;
      audio.playbackRate = speed;
    });

    // Volume & Mute
    elements.volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.volume = val;
      audio.muted = (val === 0);
    });

    elements.muteBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      elements.volumeSlider.value = audio.muted ? 0 : audio.volume;
    });

    // Download Audio
    elements.downloadBtn.addEventListener('click', () => {
      if (!state.currentBlobUrl) return;
      const a = document.createElement('a');
      a.href = state.currentBlobUrl;
      const voice = getSelectedVoiceName();
      a.download = `elevenlabs_${voice.toLowerCase()}_narration.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Download Started', 'Narration MP3 saved.', 'success');
    });
  }

  function updatePlaybackUI(isPlaying) {
    if (isPlaying) {
      elements.playerPlayIcon.classList.add('hidden');
      elements.playerPauseIcon.classList.remove('hidden');
      elements.playbackBadge.classList.add('playing');
      elements.playbackBadgeText.textContent = 'Streaming';
    } else {
      elements.playerPlayIcon.classList.remove('hidden');
      elements.playerPauseIcon.classList.add('hidden');
      elements.playbackBadge.classList.remove('playing');
      elements.playbackBadgeText.textContent = 'Idle';
    }
  }

  function formatTime(secs) {
    const totalSecs = Math.floor(secs);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // --- Generation History Management ---
  function addHistoryItem(item) {
    state.history.unshift(item);
    if (state.history.length > 8) state.history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.emptyHistoryMsg.style.display = 'block';
      elements.historyList.querySelectorAll('.history-item').forEach(el => el.remove());
      return;
    }

    elements.emptyHistoryMsg.style.display = 'none';
    elements.historyList.querySelectorAll('.history-item').forEach(el => el.remove());

    state.history.forEach((h, idx) => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `
        <div class="history-item-meta">
          <div class="history-item-top">
            <span class="history-voice">${escapeHtml(h.voiceName)}</span>
            <span class="history-time">${h.timestamp}</span>
          </div>
          <p class="history-preview">${escapeHtml(h.text)}</p>
        </div>
        <div class="history-actions">
          <button class="icon-btn replay-btn" title="Load & Replay" data-idx="${idx}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        </div>
      `;

      row.querySelector('.replay-btn').addEventListener('click', () => {
        elements.textInput.value = h.text;
        updateTextCounters();
        if (h.blobUrl) {
          loadAudioSource(h.blobUrl);
          showToast('Take Loaded', `Replaying take narrated by ${h.voiceName}`, 'info');
        }
      });

      elements.historyList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Text Input & Presets ---
  function updateTextCounters() {
    const text = elements.textInput.value;
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    elements.charCount.textContent = `${chars} character${chars === 1 ? '' : 's'}`;
    elements.wordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;
  }

  function setupTextControls() {
    elements.textInput.addEventListener('input', updateTextCounters);

    elements.pasteBtn.addEventListener('click', async () => {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          elements.textInput.value = clipText;
          updateTextCounters();
          showToast('Pasted Content', 'Clipboard text loaded into script editor.', 'info');
        }
      } catch (err) {
        showToast('Clipboard Notice', 'Please use Ctrl+V / Cmd+V to paste manually.', 'info');
      }
    });

    elements.clearBtn.addEventListener('click', () => {
      elements.textInput.value = '';
      updateTextCounters();
    });

    // Sample Presets
    document.querySelectorAll('.sample-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const key = pill.getAttribute('data-preset');
        if (PRESETS[key]) {
          elements.textInput.value = PRESETS[key];
          updateTextCounters();
        }
      });
    });
  }

  // --- Voice Settings Sliders ---
  function setupTuningControls() {
    elements.toggleSettingsBtn.addEventListener('click', () => {
      const card = elements.toggleSettingsBtn.closest('.accordion-card');
      const isCollapsed = elements.advancedSettingsBody.classList.contains('collapsed');
      if (isCollapsed) {
        elements.advancedSettingsBody.classList.remove('collapsed');
        card.classList.add('open');
      } else {
        elements.advancedSettingsBody.classList.add('collapsed');
        card.classList.remove('open');
      }
    });

    elements.stabilitySlider.addEventListener('input', (e) => {
      elements.stabilityVal.textContent = parseFloat(e.target.value).toFixed(2);
    });

    elements.similaritySlider.addEventListener('input', (e) => {
      elements.similarityVal.textContent = parseFloat(e.target.value).toFixed(2);
    });

    elements.styleSlider.addEventListener('input', (e) => {
      elements.styleVal.textContent = parseFloat(e.target.value).toFixed(2);
    });

    elements.modelSelect.addEventListener('change', updateModelInfo);
    elements.voiceSelect.addEventListener('change', updateVoiceInfo);
    elements.refreshVoicesBtn.addEventListener('click', () => fetchAccountVoices(false));
  }

  // --- Setup Modal & Visibility ---
  function setupModalEvents() {
    elements.apiKeyBtn.addEventListener('click', openApiModal);
    elements.closeModalBtn.addEventListener('click', closeApiModal);
    elements.cancelModalBtn.addEventListener('click', closeApiModal);
    elements.saveKeyBtn.addEventListener('click', saveApiKey);
    elements.removeKeyBtn.addEventListener('click', removeApiKey);
    elements.demoModeToggle.addEventListener('click', toggleDemoMode);

    elements.toggleKeyVisibility.addEventListener('click', () => {
      const isPassword = elements.apiKeyInput.type === 'password';
      elements.apiKeyInput.type = isPassword ? 'text' : 'password';
      elements.eyeIcon.innerHTML = isPassword
        ? `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>`
        : `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
    });

    // Close on backdrop click
    elements.apiModal.addEventListener('click', (e) => {
      if (e.target === elements.apiModal) closeApiModal();
    });

    elements.clearHistoryBtn.addEventListener('click', () => {
      state.history = [];
      renderHistory();
    });
  }

  // --- Initialization ---
  function init() {
    setupTextControls();
    setupTuningControls();
    setupAudioPlayer();
    setupModalEvents();
    initVisualizer();

    elements.generatePlayBtn.addEventListener('click', generateNarration);

    // Initial default text
    elements.textInput.value = PRESETS.scifi;
    updateTextCounters();
    updateModelInfo();
    updateVoiceInfo();
    updateApiStatus();

    // If API key is present on load, quietly fetch user's custom voices
    if (state.apiKey) {
      fetchAccountVoices(true);
    }
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
