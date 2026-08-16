/*
 * Project Phoenix - Offline Disaster Survival Guide
 * A practical, resource-aware guide for disaster preparedness and response.
 */

(() => {
  const GUIDES = {
    earthquake: {
      icon: "🌎", title: "Earthquake Survival Guide",
      summary: "Protect yourself from falling objects, then prepare for aftershocks and evacuation.",
      immediate: ["Drop, cover, and hold on. Protect your head and neck.", "Stay away from windows, glass, shelves, and heavy objects.", "When shaking stops, check for immediate hazards and be ready for aftershocks."],
      kit: ["Drinking water", "Ready-to-eat food", "Flashlight", "Phone + power bank", "First-aid supplies", "Whistle", "Essential medicines", "Important documents"],
      use: ["Use a sturdy table or desk for cover if one is nearby.", "Use a backpack or bag to keep essential items together.", "Use a phone flashlight sparingly to preserve battery."],
      avoid: ["Do not run outside while the ground is shaking.", "Do not use elevators during or immediately after an earthquake.", "Do not enter visibly damaged buildings until authorities say it is safe."],
      next: ["Keep shoes and essential items accessible in case of broken glass or debris.", "Check on nearby family members if it is safe to do so.", "Follow official evacuation or shelter instructions." ]
    },
    flood: {
      icon: "🌊", title: "Flood Survival Guide",
      summary: "Move away from rising water and avoid contact with potentially contaminated floodwater.",
      immediate: ["Move to higher ground or a higher safe level when flooding threatens.", "Keep away from moving water, drains, bridges, and submerged roads.", "Follow evacuation orders immediately when issued."],
      kit: ["Safe drinking water", "Sealed food", "Flashlight", "Phone + power bank", "First-aid supplies", "Essential medicines", "Documents in waterproof packaging", "Basic hygiene supplies"],
      use: ["Use sealed bags or containers to keep documents and electronics dry.", "Use available clean containers to store safe drinking water.", "Use a whistle or phone to signal for help if stranded."],
      avoid: ["Never walk or drive through moving or unknown-depth floodwater.", "Do not touch electrical equipment if you are wet or standing in water.", "Do not drink floodwater."],
      next: ["Conserve safe drinking water and phone battery.", "Keep emergency contacts and location information ready.", "Return to evacuated areas only after authorities say it is safe." ]
    },
    cyclone: {
      icon: "🌀", title: "Cyclone / Severe Storm Guide",
      summary: "Shelter from wind and debris, monitor official warnings, and prepare for power or communication loss.",
      immediate: ["Stay indoors in a sturdy building and move away from windows.", "Secure yourself in the safest interior area available.", "Monitor official warnings and evacuation instructions."],
      kit: ["Water", "Non-perishable food", "Flashlight", "Battery/radio backup", "Phone + power bank", "First-aid supplies", "Medicines", "Important documents"],
      use: ["Charge phones and power banks before conditions worsen.", "Use sturdy furniture as protection from flying debris if necessary.", "Keep emergency supplies together so they can be carried quickly."],
      avoid: ["Do not go outside during the dangerous part of the storm.", "Do not approach fallen power lines.", "Do not ignore evacuation orders."],
      next: ["Expect possible power, water, and communications interruptions.", "Use stored safe water and food conservatively.", "Wait for official all-clear information before leaving shelter." ]
    },
    wildfire: {
      icon: "🔥", title: "Wildfire Survival Guide",
      summary: "Get away from fire and smoke early. Evacuation and clean air take priority over property.",
      immediate: ["Follow evacuation orders and leave early when instructed.", "Move away from fire and dense smoke toward the designated safe area.", "Keep doors and windows closed when authorities advise sheltering from smoke."],
      kit: ["Water", "Food", "Phone + charger/power bank", "Essential medicines", "Important documents", "Protective clothing", "N95 or equivalent particulate mask if available"],
      use: ["Keep essential documents and medicines together for rapid evacuation.", "Use a phone for official alerts and navigation while conserving battery.", "Use a clean cloth only as a temporary comfort measure; it is not a substitute for a proper particulate respirator."],
      avoid: ["Do not delay evacuation to protect belongings.", "Do not drive into smoke or closed roads.", "Do not approach the fire to take photos or investigate."],
      next: ["Stay in the designated safe location until authorities provide further instructions.", "Monitor air-quality and emergency alerts when available.", "Check on family members remotely if direct contact is unsafe." ]
    },
    heatwave: {
      icon: "☀️", title: "Heatwave Survival Guide",
      summary: "Reduce heat exposure, stay hydrated, and seek a cooler location when possible.",
      immediate: ["Move to a cool or shaded place.", "Drink safe water regularly; do not wait until you feel extremely thirsty.", "Reduce strenuous activity during the hottest part of the day."],
      kit: ["Safe drinking water", "Light clothing", "Hat or sun protection", "Phone", "Essential medicines", "Oral rehydration supplies if already available"],
      use: ["Use curtains or shutters to reduce direct sunlight indoors.", "Use fans or other safe cooling methods when available.", "Check on children, older adults, and others who may need help staying cool."],
      avoid: ["Do not leave people or pets in parked vehicles.", "Avoid strenuous activity in extreme heat.", "Do not ignore signs of serious heat illness; seek medical help."],
      next: ["Keep drinking safe fluids and take regular cooling breaks.", "Use official heat alerts to plan outdoor activity.", "Seek medical attention for confusion, fainting, or severe symptoms." ]
    }
  };

  const DEFAULT_GUIDE = {
    icon: "🧭", title: "General Disaster Survival Guide",
    summary: "Protect life first, get reliable information, and prepare to shelter or evacuate.",
    immediate: ["Move away from the immediate hazard and follow official emergency instructions.", "Check yourself and people nearby for urgent danger.", "Keep your phone available for emergency alerts and communication."],
    kit: ["Safe drinking water", "Ready-to-eat food", "Flashlight", "Phone + power bank", "First-aid supplies", "Essential medicines", "Important documents", "Whistle"],
    use: ["Prioritize items you already have rather than searching for specialized equipment.", "Keep essentials together in a bag that can be carried quickly.", "Conserve phone battery and use official alerts as your primary information source."],
    avoid: ["Do not enter an unsafe area to retrieve belongings.", "Do not follow unverified emergency claims on social media.", "Do not take unnecessary risks to improvise equipment for a dangerous task."],
    next: ["Identify the safest nearby shelter or evacuation route.", "Keep family communication plans simple and agreed in advance.", "Continue monitoring official emergency information." ]
  };

  // Keyword list used for both exact/partial matching and typo-tolerant fuzzy matching.
  // Each entry maps a searchable phrase -> the guide key it should resolve to.
  const KEYWORDS = [
    { word: "earthquake", key: "earthquake" },
    { word: "earth quake", key: "earthquake" },
    { word: "tremor", key: "earthquake" },
    { word: "shaking", key: "earthquake" },
    { word: "seismic", key: "earthquake" },
    { word: "flood", key: "flood" },
    { word: "flooding", key: "flood" },
    { word: "water rising", key: "flood" },
    { word: "heavy rain", key: "flood" },
    { word: "cyclone", key: "cyclone" },
    { word: "hurricane", key: "cyclone" },
    { word: "typhoon", key: "cyclone" },
    { word: "severe storm", key: "cyclone" },
    { word: "storm", key: "cyclone" },
    { word: "wildfire", key: "wildfire" },
    { word: "forest fire", key: "wildfire" },
    { word: "bushfire", key: "wildfire" },
    { word: "fire smoke", key: "wildfire" },
    { word: "heatwave", key: "heatwave" },
    { word: "heat wave", key: "heatwave" },
    { word: "extreme heat", key: "heatwave" },
    { word: "hot weather", key: "heatwave" }
  ];

  // Friendly display list for the dropdown (one entry per disaster).
  const GUIDE_OPTIONS = [
    { key: "earthquake", label: "🌎 Earthquake" },
    { key: "flood", label: "🌊 Flood" },
    { key: "cyclone", label: "🌀 Cyclone / Severe Storm" },
    { key: "wildfire", label: "🔥 Wildfire" },
    { key: "heatwave", label: "☀️ Heatwave" }
  ];

  const normalize = text => (text || "").toLowerCase().trim();

  // Classic Levenshtein edit-distance, used to tolerate typos (e.g. "erthquake").
  function editDistance(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[m][n];
  }

  // How many typos we tolerate scales gently with word length so short words
  // ("flood") aren't matched too loosely, while longer words ("earthquake")
  // can absorb a couple of mistakes.
  function maxAllowedDistance(len) {
    if (len <= 4) return 1;
    if (len <= 7) return 2;
    return 3;
  }

  // Finds the best fuzzy match for a query against a single word, checking
  // both the whole query and its individual tokens (so "the eartquake hit"
  // still matches "earthquake").
  function bestDistanceForWord(query, word) {
    let best = editDistance(query, word);
    const tokens = query.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      best = Math.min(best, editDistance(token, word));
    }
    return best;
  }

  function detectGuide(text) {
    const q = normalize(text);
    if (!q) return DEFAULT_GUIDE;

    // 1) Exact / substring match first (fast path, handles multi-word phrases).
    for (const { word, key } of KEYWORDS) {
      if (q.includes(word)) return GUIDES[key];
    }

    // 2) Typo-tolerant fuzzy match against each known keyword.
    let bestKey = null;
    let bestScore = Infinity;
    for (const { word, key } of KEYWORDS) {
      const dist = bestDistanceForWord(q, word);
      const allowed = maxAllowedDistance(word.length);
      if (dist <= allowed && dist < bestScore) {
        bestScore = dist;
        bestKey = key;
      }
    }
    if (bestKey) return GUIDES[bestKey];

    return DEFAULT_GUIDE;
  }

  // Returns up to `limit` suggested guide options for the live dropdown,
  // ranked by how closely they match the current text (typo-tolerant).
  function suggestGuides(text, limit = 5) {
    const q = normalize(text);
    if (!q) return GUIDE_OPTIONS;

    const scored = GUIDE_OPTIONS.map(opt => {
      let best = Infinity;
      for (const { word, key } of KEYWORDS) {
        if (key !== opt.key) continue;
        if (word.includes(q) || q.includes(word)) { best = 0; break; }
        best = Math.min(best, bestDistanceForWord(q, word));
      }
      return { ...opt, score: best };
    });

    return scored
      .filter(o => o.score <= maxAllowedDistance(Math.max(q.length, 4)))
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  function section(title, items, numbered = false) {
    const list = items.map((item, i) => `<li>${numbered ? `<strong>${i + 1}.</strong> ` : ""}${item}</li>`).join("");
    return `<section class="survival-section"><h3>${title}</h3><ul>${list}</ul></section>`;
  }

  function renderGuide(guide, query) {
    const root = document.getElementById("survivalGuideContent");
    if (!root) return;
    root.innerHTML = `
      <div class="survival-hero">
        <div class="survival-hero-icon">${guide.icon}</div>
        <div><div class="survival-title">${guide.title}</div><div class="survival-summary">${guide.summary}</div></div>
      </div>
      <div class="survival-alert"><strong>Safety first:</strong> This guide supports emergency decisions; follow local authorities and emergency services when they provide instructions.</div>
      ${section("⚡ Immediate Actions", guide.immediate, true)}
      ${section("🎒 Essential Survival Kit", guide.kit)}
      ${section("🛠️ Use What You Have", guide.use)}
      ${section("❌ Avoid These Mistakes", guide.avoid)}
      ${section("🕐 Next 24 Hours", guide.next)}
      <div class="survival-footer">Guide selected from: <strong>${query || "general preparedness"}</strong>. You can search another disaster above.</div>
    `;
  }

  function init() {
    const home = document.getElementById("homeSection");
    const step = document.getElementById("stepSection");
    if (!home || !step) return;

    const button = document.createElement("button");
    button.id = "btnSurvivalGuide";
    button.className = "survival-launch-btn";
    button.innerHTML = "🧭 Open Survival Guide";
    home.insertBefore(button, home.querySelector(".section-heading"));

    const panel = document.createElement("section");
    panel.id = "survivalGuideSection";
    panel.style.display = "none";
    panel.innerHTML = `
      <div class="survival-container">
        <div class="survival-header">
          <button id="btnCloseSurvival" class="btn-nav-mini">← Back</button>
          <div><div class="survival-header-title">🧭 SURVIVAL GUIDE</div><div class="survival-header-subtitle">Offline disaster preparedness & response</div></div>
        </div>
        <div class="survival-search">
          <div class="survival-search-input-wrap">
            <input id="survivalSearchInput" class="search-input" placeholder="Enter disaster (e.g. flood, earthquake, cyclone)..." aria-label="Disaster type" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="survivalDropdown">
            <ul id="survivalDropdown" class="survival-dropdown" role="listbox" hidden></ul>
          </div>
          <button id="survivalSearchBtn" class="btn-search">Guide</button>
        </div>
        <div id="survivalGuideContent"></div>
      </div>`;
    home.parentNode.insertBefore(panel, step);

    button.addEventListener("click", () => {
      home.style.display = "none";
      step.style.display = "none";
      panel.style.display = "block";
      renderGuide(DEFAULT_GUIDE, "general preparedness");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.getElementById("btnCloseSurvival").addEventListener("click", () => {
      panel.style.display = "none";
      home.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const input = document.getElementById("survivalSearchInput");
    const dropdown = document.getElementById("survivalDropdown");
    let activeIndex = -1;

    const closeDropdown = () => {
      dropdown.hidden = true;
      dropdown.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    };

    const openDropdown = (options) => {
      if (!options.length) { closeDropdown(); return; }
      dropdown.innerHTML = options.map((opt, i) =>
        `<li role="option" data-key="${opt.key}" class="survival-dropdown-item${i === activeIndex ? " active" : ""}">${opt.label}</li>`
      ).join("");
      dropdown.hidden = false;
      input.setAttribute("aria-expanded", "true");
    };

    const selectGuide = (key, label) => {
      input.value = label.replace(/^\S+\s/, ""); // strip leading emoji
      closeDropdown();
      renderGuide(GUIDES[key] || DEFAULT_GUIDE, input.value);
    };

    const run = () => {
      const query = input.value.trim();
      closeDropdown();
      renderGuide(detectGuide(query), query || "general preparedness");
    };

    input.addEventListener("input", () => {
      activeIndex = -1;
      openDropdown(suggestGuides(input.value));
    });

    input.addEventListener("focus", () => {
      openDropdown(suggestGuides(input.value));
    });

    input.addEventListener("keydown", e => {
      const items = dropdown.querySelectorAll(".survival-dropdown-item");
      if (e.key === "ArrowDown" && items.length) {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle("active", i === activeIndex));
      } else if (e.key === "ArrowUp" && items.length) {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle("active", i === activeIndex));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          const key = items[activeIndex].getAttribute("data-key");
          selectGuide(key, items[activeIndex].textContent);
        } else {
          run();
        }
      } else if (e.key === "Escape") {
        closeDropdown();
      }
    });

    dropdown.addEventListener("mousedown", e => {
      const item = e.target.closest(".survival-dropdown-item");
      if (!item) return;
      e.preventDefault();
      selectGuide(item.getAttribute("data-key"), item.textContent);
    });

    document.addEventListener("click", e => {
      if (!e.target.closest(".survival-search-input-wrap")) closeDropdown();
    });

    document.getElementById("survivalSearchBtn").addEventListener("click", run);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
