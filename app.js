/**
 * Project Phoenix - Core Web Application Controller
 * Handles UI state transitions, decision tree navigation, Web Audio metronome & siren,
 * Web Speech synthesis, Geolocation, ICE contact management, and SVG rendering.
 */

class ProjectPhoenixApp {
  constructor() {
    this.protocols = PROTOCOLS;
    this.translations = TRANSLATIONS;
    this.analyzer = new EmergencyAnalyzer(PROTOCOLS);

    // App State
    this.lang = localStorage.getItem("phoenix_lang") || "en";
    this.currentProtocol = null;
    this.currentStep = null;
    this.stepHistory = [];
    this.highContrast = localStorage.getItem("phoenix_contrast") === "true";
    this.speechEnabled = localStorage.getItem("phoenix_speech") !== "false";
    this.speechRate = parseFloat(localStorage.getItem("phoenix_speech_rate")) || 1.0;
    this.selectedRegion = localStorage.getItem("phoenix_region") || "us";

    // Audio Context & Utilities
    this.audioCtx = null;
    this.metronomeInterval = null;
    this.metronomeBpm = 110;
    this.compressionCount = 0;
    this.metronomeRunning = false;

    this.sirenRunning = false;
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.strobeInterval = null;

    this.iceContacts = JSON.parse(localStorage.getItem("phoenix_ice")) || [
      { name: "Family ICE", phone: "911" }
    ];

    this.initDOM();
    this.bindEvents();
    this.applyTheme();
    this.updateLanguageUI();
    this.renderEmergencyGrid();
    this.initGeolocation();
  }

  initDOM() {
    // DOM Element References
    this.dom = {
      langSelect: document.getElementById("langSelect"),
      contrastToggle: document.getElementById("contrastToggle"),
      speechToggle: document.getElementById("speechToggle"),
      speechRateInput: document.getElementById("speechRateInput"),
      searchInput: document.getElementById("searchInput"),
      searchBtn: document.getElementById("searchBtn"),
      analyzerNotice: document.getElementById("analyzerNotice"),

      homeSection: document.getElementById("homeSection"),
      stepSection: document.getElementById("stepSection"),
      emergencyGrid: document.getElementById("emergencyGrid"),

      // Step View DOM
      protocolTitle: document.getElementById("protocolTitle"),
      stepTitle: document.getElementById("stepTitle"),
      stepInstruction: document.getElementById("stepInstruction"),
      stepDetail: document.getElementById("stepDetail"),
      stepWarning: document.getElementById("stepWarning"),
      diagramContainer: document.getElementById("diagramContainer"),
      optionsContainer: document.getElementById("optionsContainer"),
      toolContainer: document.getElementById("toolContainer"),
      btnBack: document.getElementById("btnBack"),
      btnHome: document.getElementById("btnHome"),

      // Metronome Tool DOM
      metronomeBox: document.getElementById("metronomeBox"),
      btnToggleMetronome: document.getElementById("btnToggleMetronome"),
      compressionCounter: document.getElementById("compressionCounter"),
      pulseIndicator: document.getElementById("pulseIndicator"),

      // Emergency Call & SOS
      regionSelect: document.getElementById("regionSelect"),
      btnCallEmergency: document.getElementById("btnCallEmergency"),
      btnSosModal: document.getElementById("btnSosModal"),
      sosModal: document.getElementById("sosModal"),
      btnCloseSos: document.getElementById("btnCloseSos"),
      btnToggleSiren: document.getElementById("btnToggleSiren"),
      btnToggleStrobe: document.getElementById("btnToggleStrobe"),
      strobeOverlay: document.getElementById("strobeOverlay"),

      // Location DOM
      latLongText: document.getElementById("latLongText"),
      accuracyText: document.getElementById("accuracyText"),
      btnCopyLocation: document.getElementById("btnCopyLocation"),

      // ICE Contacts DOM
      iceList: document.getElementById("iceList"),
      btnAddIce: document.getElementById("btnAddIce")
    };
  }

  bindEvents() {
    // Language Switcher
    this.dom.langSelect.addEventListener("change", (e) => {
      this.lang = e.target.value;
      localStorage.setItem("phoenix_lang", this.lang);
      this.updateLanguageUI();
      this.renderEmergencyGrid();
      if (this.currentStep) {
        this.renderStep(this.currentStep);
      }
    });

    // High Contrast Toggle
    this.dom.contrastToggle.addEventListener("change", (e) => {
      this.highContrast = e.target.checked;
      localStorage.setItem("phoenix_contrast", this.highContrast);
      this.applyTheme();
    });

    // Voice Guidance Toggles
    this.dom.speechToggle.addEventListener("change", (e) => {
      this.speechEnabled = e.target.checked;
      localStorage.setItem("phoenix_speech", this.speechEnabled);
    });

    if (this.dom.speechRateInput) {
      this.dom.speechRateInput.addEventListener("change", (e) => {
        this.speechRate = parseFloat(e.target.value);
        localStorage.setItem("phoenix_speech_rate", this.speechRate);
      });
    }

    // Natural Language Search (Home)
    this.dom.searchBtn.addEventListener("click", () => this.handleSearch());
    this.dom.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Step Free-Text Search
    if (this.dom.stepSearchBtn) {
      this.dom.stepSearchBtn.addEventListener("click", () => this.handleStepSearch());
    }
    if (this.dom.stepSearchInput) {
      this.dom.stepSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleStepSearch();
      });
    }

    // Navigation Buttons
    this.dom.btnBack.addEventListener("click", () => this.goBackStep());
    this.dom.btnHome.addEventListener("click", () => this.goHome());

    // Metronome Button
    this.dom.btnToggleMetronome.addEventListener("click", () => this.toggleMetronome());

    // Region Direct Dialer
    const regionalNumbers = { us: "911", eu: "112", uk: "999", in: "108", au: "000", ca: "911" };
    this.dom.regionSelect.addEventListener("change", (e) => {
      this.selectedRegion = e.target.value;
      localStorage.setItem("phoenix_region", this.selectedRegion);
      const num = regionalNumbers[this.selectedRegion] || "911";
      this.dom.btnCallEmergency.href = `tel:${num}`;
      this.dom.btnCallEmergency.innerHTML = `🚨 ${TRANSLATIONS[this.lang].callEmergency} (${num})`;
    });

    // SOS Beacon Modal
    this.dom.btnSosModal.addEventListener("click", () => {
      this.dom.sosModal.classList.add("active");
    });
    this.dom.btnCloseSos.addEventListener("click", () => {
      this.dom.sosModal.classList.remove("active");
      this.stopSiren();
      this.stopStrobe();
    });

    this.dom.btnToggleSiren.addEventListener("click", () => this.toggleSiren());
    this.dom.btnToggleStrobe.addEventListener("click", () => this.toggleStrobe());

    // Location Helper
    this.dom.btnCopyLocation.addEventListener("click", () => this.copyLocationText());

    // ICE Contact
    this.dom.btnAddIce.addEventListener("click", () => this.addIceContact());

    this.renderIceContacts();
  }

  applyTheme() {
    if (this.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }

  updateLanguageUI() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        if (el.tagName === "INPUT" && el.type === "text") {
          el.placeholder = t[key];
        } else {
          el.innerText = t[key];
        }
      }
    });

    // Update call emergency button
    const regionalNumbers = { us: "911", eu: "112", uk: "999", in: "108", au: "000", ca: "911" };
    const num = regionalNumbers[this.selectedRegion] || "911";
    this.dom.btnCallEmergency.href = `tel:${num}`;
    this.dom.btnCallEmergency.innerHTML = `🚨 ${t.callEmergency} (${num})`;
  }

  renderEmergencyGrid() {
    this.dom.emergencyGrid.innerHTML = "";
    Object.values(this.protocols).forEach(proto => {
      const card = document.createElement("button");
      card.className = `emergency-card category-${proto.category.toLowerCase().replace(/[^a-z]/g, "")}`;
      card.innerHTML = `
        <div class="card-icon">${proto.icon}</div>
        <div class="card-title">${proto.title}</div>
        <div class="card-summary">${proto.summary}</div>
      `;
      card.addEventListener("click", () => this.startProtocol(proto.id));
      this.dom.emergencyGrid.appendChild(card);
    });
  }

  handleSearch() {
    const query = this.dom.searchInput.value.trim();
    if (!query) return;

    const result = this.analyzer.analyze(query);
    if (result.bestMatch) {
      this.dom.analyzerNotice.className = "analyzer-notice success";
      this.dom.analyzerNotice.innerHTML = `✓ Protocol Matched: <strong>${result.bestMatch.title}</strong> (${result.confidence}% match confidence)`;
      setTimeout(() => {
        this.startProtocol(result.bestMatch.id);
      }, 600);
    } else {
      this.dom.analyzerNotice.className = "analyzer-notice warning";
      this.dom.analyzerNotice.innerHTML = `⚠️ Low match confidence. Please select from the direct action protocols below or refine your query.`;
    }
  }

  handleStepSearch() {
    if (!this.currentStep || !this.currentStep.options) return;
    const query = this.dom.stepSearchInput.value.trim();
    if (!query) return;

    const result = this.analyzer.matchOptions(query, this.currentStep.options);
    if (result.bestMatch) {
      if (this.dom.stepAnalyzerNotice) this.dom.stepAnalyzerNotice.innerHTML = "";
      this.selectOption(result.bestMatch);
    } else {
      if (this.dom.stepAnalyzerNotice) {
        this.dom.stepAnalyzerNotice.className = "analyzer-notice warning";
        this.dom.stepAnalyzerNotice.innerHTML = `⚠️ No confident match. Please tap one of the options below instead.`;
      }
    }
  }

  selectOption(opt) {
    if (!opt) return;
    if (opt.nextStep === "HOME") {
      this.goHome();
    } else if (opt.nextStep.startsWith("GOTO_")) {
      const targetProto = opt.nextStep.replace("GOTO_", "");
      this.startProtocol(targetProto);
    } else {
      this.stepHistory.push(this.currentStep);
      const nextStepObj = this.currentProtocol.steps[opt.nextStep];
      if (nextStepObj) {
        this.renderStep(nextStepObj);
      }
    }
  }

  startProtocol(protocolId) {
    const proto = this.protocols[protocolId];
    if (!proto) return;

    this.currentProtocol = proto;
    this.stepHistory = [];
    this.dom.homeSection.style.display = "none";
    this.dom.stepSection.style.display = "block";
    this.dom.protocolTitle.innerText = proto.title;

    const initialStep = proto.steps[proto.initialStep];
    this.renderStep(initialStep);
  }

  renderStep(step) {
    this.currentStep = step;
    this.dom.stepTitle.innerText = step.title;
    this.dom.stepInstruction.innerText = step.instruction;
    
    this.dom.stepDetail.innerText = step.detail || "";
    this.dom.stepDetail.style.display = step.detail ? "block" : "none";

    this.dom.stepWarning.innerText = step.warning || "";
    this.dom.stepWarning.style.display = step.warning ? "block" : "none";

    // Clear step free-text input and notice
    if (this.dom.stepSearchInput) this.dom.stepSearchInput.value = "";
    if (this.dom.stepAnalyzerNotice) this.dom.stepAnalyzerNotice.innerHTML = "";

    // Speech Synthesis Readout
    if (this.speechEnabled) {
      this.speakText(`${step.title}. ${step.instruction}. ${step.warning || ""}`);
    }

    // Render SVG Diagram
    if (step.svgDiagram) {
      this.dom.diagramContainer.innerHTML = this.getSVGDiagram(step.svgDiagram);
      this.dom.diagramContainer.style.display = "block";
    } else {
      this.dom.diagramContainer.innerHTML = "";
      this.dom.diagramContainer.style.display = "none";
    }

    // Render Tool
    if (step.tool === "cpr_metronome") {
      this.dom.metronomeBox.style.display = "flex";
    } else {
      this.dom.metronomeBox.style.display = "none";
      if (this.metronomeRunning) this.stopMetronome();
    }

    // Render Response Options
    this.dom.optionsContainer.innerHTML = "";
    step.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn-option";
      btn.innerText = opt.text;
      btn.addEventListener("click", () => this.selectOption(opt));
      this.dom.optionsContainer.appendChild(btn);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  goBackStep() {
    if (this.stepHistory.length > 0) {
      const prevStep = this.stepHistory.pop();
      this.renderStep(prevStep);
    } else {
      this.goHome();
    }
  }

  goHome() {
    this.currentProtocol = null;
    this.currentStep = null;
    this.stepHistory = [];
    this.stopMetronome();
    if (this.dom.stepSearchInput) this.dom.stepSearchInput.value = "";
    if (this.dom.stepAnalyzerNotice) this.dom.stepAnalyzerNotice.innerHTML = "";
    this.dom.homeSection.style.display = "block";
    this.dom.stepSection.style.display = "none";
    this.dom.analyzerNotice.innerHTML = "";
  }

  // --- Web Speech API ---
  speakText(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;
    
    // Attempt language matching
    const langMap = { en: "en-US", es: "es-ES", fr: "fr-FR", hi: "hi-IN", de: "de-DE", zh: "zh-CN" };
    utterance.lang = langMap[this.lang] || "en-US";

    window.speechSynthesis.speak(utterance);
  }

  // --- Web Audio API CPR Metronome ---
  initAudioCtx() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
  }

  toggleMetronome() {
    if (this.metronomeRunning) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  startMetronome() {
    this.initAudioCtx();
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    this.metronomeRunning = true;
    this.dom.btnToggleMetronome.innerText = TRANSLATIONS[this.lang].stopMetronome || "Stop Metronome";
    this.dom.btnToggleMetronome.classList.add("active");

    const intervalMs = (60 / this.metronomeBpm) * 1000;
    this.compressionCount = 0;

    this.playClickSound();
    this.metronomeInterval = setInterval(() => {
      this.playClickSound();
    }, intervalMs);
  }

  stopMetronome() {
    this.metronomeRunning = false;
    if (this.metronomeInterval) {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
    this.dom.btnToggleMetronome.innerText = TRANSLATIONS[this.lang].startMetronome || "Start Audio Rhythm";
    this.dom.btnToggleMetronome.classList.remove("active");
  }

  playClickSound() {
    if (!this.audioCtx) return;

    this.compressionCount++;
    if (this.compressionCount > 30) {
      this.compressionCount = 1;
    }

    this.dom.compressionCounter.innerText = `${this.compressionCount} / 30`;

    // Pulse Visual Animation
    this.dom.pulseIndicator.classList.add("pulse-beat");
    setTimeout(() => this.dom.pulseIndicator.classList.remove("pulse-beat"), 150);

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    if (this.compressionCount === 30) {
      osc.frequency.setValueAtTime(880, now); // Higher pitch alert for 30th compression
      gain.gain.setValueAtTime(0.4, now);
    } else {
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.25, now);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // --- SOS Siren & Strobe ---
  toggleSiren() {
    if (this.sirenRunning) {
      this.stopSiren();
    } else {
      this.startSiren();
    }
  }

  startSiren() {
    this.initAudioCtx();
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    this.sirenRunning = true;
    this.dom.btnToggleSiren.innerText = "🛑 Stop Loud Siren";
    this.dom.btnToggleSiren.classList.add("active");

    const now = this.audioCtx.currentTime;
    this.sirenOsc1 = this.audioCtx.createOscillator();
    this.sirenGain = this.audioCtx.createGain();

    this.sirenOsc1.type = "sawtooth";
    this.sirenOsc1.frequency.setValueAtTime(700, now);
    
    // Frequency sweep for siren
    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(1.5, now); // 1.5 Hz cycle
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(300, now);

    lfo.connect(this.sirenOsc1.frequency);
    this.sirenGain.gain.setValueAtTime(0.3, now);

    this.sirenOsc1.connect(this.sirenGain);
    this.sirenGain.connect(this.audioCtx.destination);

    this.sirenOsc1.start(now);
    lfo.start(now);
  }

  stopSiren() {
    this.sirenRunning = false;
    if (this.sirenOsc1) {
      try { this.sirenOsc1.stop(); } catch (e) {}
      this.sirenOsc1 = null;
    }
    this.dom.btnToggleSiren.innerText = "🔊 Play Loud Siren";
    this.dom.btnToggleSiren.classList.remove("active");
  }

  toggleStrobe() {
    if (this.strobeInterval) {
      this.stopStrobe();
    } else {
      this.startStrobe();
    }
  }

  startStrobe() {
    this.dom.strobeOverlay.style.display = "block";
    this.dom.btnToggleStrobe.innerText = "🛑 Stop Screen Flash";
    this.dom.btnToggleStrobe.classList.add("active");

    let isRed = true;
    this.strobeInterval = setInterval(() => {
      this.dom.strobeOverlay.style.backgroundColor = isRed ? "#ff3b30" : "#ffffff";
      isRed = !isRed;
    }, 100);
  }

  stopStrobe() {
    if (this.strobeInterval) {
      clearInterval(this.strobeInterval);
      this.strobeInterval = null;
    }
    this.dom.strobeOverlay.style.display = "none";
    this.dom.btnToggleStrobe.innerText = "🚨 Start Screen Strobe";
    this.dom.btnToggleStrobe.classList.remove("active");
  }

  // --- Geolocation Helper ---
  initGeolocation() {
    if (!navigator.geolocation) {
      this.dom.latLongText.innerText = "Geolocation not supported on this device.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const long = pos.coords.longitude.toFixed(5);
        const acc = Math.round(pos.coords.accuracy);
        this.dom.latLongText.innerText = `Lat: ${lat}, Long: ${long}`;
        this.dom.accuracyText.innerText = `Accuracy: ±${acc} meters`;
        this.currentCoords = { lat, long, acc };
      },
      (err) => {
        this.dom.latLongText.innerText = "GPS Signal Unavailable (Offline mode)";
        this.dom.accuracyText.innerText = "Manual Location Shared Required";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  copyLocationText() {
    const text = this.currentCoords
      ? `EMERGENCY LOCATION HELP: Latitude ${this.currentCoords.lat}, Longitude ${this.currentCoords.long} (Accuracy ±${this.currentCoords.acc}m)`
      : "EMERGENCY LOCATION: Location coordinates currently acquiring...";

    navigator.clipboard.writeText(text).then(() => {
      alert("Location coordinates copied to clipboard!");
    });
  }

  // --- ICE Contact Manager ---
  renderIceContacts() {
    this.dom.iceList.innerHTML = "";
    this.iceContacts.forEach((contact, idx) => {
      const item = document.createElement("div");
      item.className = "ice-item";
      item.innerHTML = `
        <div><strong>${contact.name}</strong>: ${contact.phone}</div>
        <div>
          <a href="tel:${contact.phone}" class="btn-call-mini">📞 Call</a>
          <button class="btn-delete-mini" data-idx="${idx}">✕</button>
        </div>
      `;
      item.querySelector(".btn-delete-mini").addEventListener("click", () => {
        this.iceContacts.splice(idx, 1);
        localStorage.setItem("phoenix_ice", JSON.stringify(this.iceContacts));
        this.renderIceContacts();
      });
      this.dom.iceList.appendChild(item);
    });
  }

  addIceContact() {
    const name = prompt("Enter ICE Contact Name:");
    if (!name) return;
    const phone = prompt("Enter Phone Number:");
    if (!phone) return;

    this.iceContacts.push({ name, phone });
    localStorage.setItem("phoenix_ice", JSON.stringify(this.iceContacts));
    this.renderIceContacts();
  }

  // --- SVG Inline Diagrams ---
  getSVGDiagram(diagramKey) {
    const diagrams = {
      check_person: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <!-- Lying Person -->
          <circle cx="100" cy="110" r="22" fill="#32ade6"/>
          <rect x="122" y="100" width="160" height="30" rx="15" fill="#32ade6"/>
          <!-- Tapping Hands -->
          <path d="M 130 60 Q 150 85 140 100" stroke="#ff9500" stroke-width="6" fill="none" stroke-dasharray="6,6"/>
          <circle cx="140" cy="90" r="10" fill="#ff9500"/>
          <text x="200" y="45" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">Tap Shoulders & Shout 'Are You Okay?'</text>
        </svg>
      `,
      check_airway: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <!-- Head tilted back -->
          <circle cx="140" cy="90" r="24" fill="#32ade6"/>
          <path d="M 160 100 Q 190 120 250 120" stroke="#32ade6" stroke-width="24" stroke-linecap="round" fill="none"/>
          <!-- Airway arrow -->
          <path d="M 130 50 Q 145 70 160 90" stroke="#34c759" stroke-width="5" fill="none" marker-end="url(#arrow)"/>
          <text x="200" y="40" fill="#34c759" font-size="16" font-weight="bold" text-anchor="middle">Head Tilt & Chin Lift (Open Airway)</text>
        </svg>
      `,
      cpr_placement: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <!-- Torso -->
          <path d="M 120 50 C 180 30 220 30 280 50 L 280 170 C 220 190 180 190 120 170 Z" fill="#1e293b" stroke="#334155" stroke-width="4"/>
          <!-- Sternum Target -->
          <circle cx="200" cy="110" r="28" fill="rgba(255, 59, 48, 0.2)" stroke="#ff3b30" stroke-width="3" stroke-dasharray="4,4"/>
          <circle cx="200" cy="110" r="12" fill="#ff3b30"/>
          <!-- Compression Arrow -->
          <path d="M 200 40 L 200 85" stroke="#ff9500" stroke-width="6" stroke-linecap="round"/>
          <polygon points="190,85 210,85 200,100" fill="#ff9500"/>
          <text x="200" y="30" fill="#ff9500" font-size="15" font-weight="bold" text-anchor="middle">Push 2 Inches (5cm) Deep in Center</text>
        </svg>
      `,
      rescue_breaths: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <circle cx="160" cy="100" r="25" fill="#32ade6"/>
          <path d="M 130 90 L 110 90" stroke="#ff9500" stroke-width="6" stroke-linecap="round"/>
          <text x="200" y="45" fill="#32ade6" font-size="16" font-weight="bold" text-anchor="middle">2 Breaths (1 Sec Each) • Watch Chest Rise</text>
        </svg>
      `,
      heimlich: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <rect x="170" y="40" width="60" height="120" rx="20" fill="#32ade6"/>
          <!-- Hands around navel -->
          <circle cx="200" cy="110" r="16" fill="#ff3b30"/>
          <path d="M 200 135 L 200 95" stroke="#ff9500" stroke-width="6" stroke-linecap="round"/>
          <polygon points="190,95 210,95 200,80" fill="#ff9500"/>
          <text x="200" y="30" fill="#ff9500" font-size="15" font-weight="bold" text-anchor="middle">Inward & Upward Abdominal Thrusts</text>
        </svg>
      `,
      recovery_position: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <!-- Side Lying Body -->
          <ellipse cx="200" cy="110" rx="110" ry="30" fill="#34c759"/>
          <circle cx="100" cy="105" r="20" fill="#34c759"/>
          <path d="M 240 120 L 270 150" stroke="#34c759" stroke-width="12" stroke-linecap="round"/>
          <text x="200" y="45" fill="#34c759" font-size="16" font-weight="bold" text-anchor="middle">Side-Lying Recovery Position (Clear Airway)</text>
        </svg>
      `,
      direct_pressure: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <rect x="100" y="80" width="200" height="40" rx="10" fill="#e2e8f0"/>
          <!-- Bleeding Wound -->
          <circle cx="200" cy="100" r="15" fill="#ff3b30"/>
          <!-- Pressing Hand -->
          <circle cx="200" cy="70" r="22" fill="#ff9500"/>
          <path d="M 200 35 L 200 65" stroke="#ff3b30" stroke-width="6"/>
          <text x="200" y="30" fill="#ff3b30" font-size="16" font-weight="bold" text-anchor="middle">Continuous Direct Pressure on Wound</text>
        </svg>
      `,
      cool_water: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <!-- Faucet & Water -->
          <rect x="180" y="20" width="40" height="30" fill="#64748b"/>
          <path d="M 200 50 L 200 130" stroke="#00d4ff" stroke-width="8" stroke-dasharray="6,4"/>
          <!-- Limb -->
          <rect x="120" y="110" width="160" height="30" rx="10" fill="#ff9500"/>
          <text x="200" y="175" fill="#00d4ff" font-size="16" font-weight="bold" text-anchor="middle">Cool under running water for 10-20 min</text>
        </svg>
      `,
      fast_stroke: `
        <svg viewBox="0 0 400 200" width="100%" height="180">
          <rect width="400" height="200" rx="12" fill="#131a29"/>
          <text x="80" y="90" fill="#ff3b30" font-size="28" font-weight="900">F.A.S.T</text>
          <text x="180" y="60" fill="#ffffff" font-size="14">F - Face Drooping</text>
          <text x="180" y="90" fill="#ffffff" font-size="14">A - Arm Weakness</text>
          <text x="180" y="120" fill="#ffffff" font-size="14">S - Speech Difficulty</text>
          <text x="180" y="150" fill="#ff9500" font-size="15" font-weight="bold">T - Time to Call 911 / 112</text>
        </svg>
      `
    };

    return diagrams[diagramKey] || "";
  }
}

// Initialize application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.phoenixApp = new ProjectPhoenixApp();
});
