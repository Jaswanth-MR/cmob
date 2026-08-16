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

  const normalize = text => (text || "").toLowerCase();

  function detectGuide(text) {
    const q = normalize(text);
    if (/earthquake|earth quake|tremor|shaking|seismic/.test(q)) return GUIDES.earthquake;
    if (/flood|flooding|water rising|heavy rain/.test(q)) return GUIDES.flood;
    if (/cyclone|hurricane|typhoon|severe storm|storm/.test(q)) return GUIDES.cyclone;
    if (/wildfire|forest fire|bushfire|fire smoke/.test(q)) return GUIDES.wildfire;
    if (/heatwave|heat wave|extreme heat|hot weather/.test(q)) return GUIDES.heatwave;
    return DEFAULT_GUIDE;
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
          <input id="survivalSearchInput" class="search-input" placeholder="Enter disaster (e.g. flood, earthquake, cyclone)..." aria-label="Disaster type">
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

    const run = () => {
      const input = document.getElementById("survivalSearchInput");
      const query = input.value.trim();
      renderGuide(detectGuide(query), query || "general preparedness");
    };
    document.getElementById("survivalSearchBtn").addEventListener("click", run);
    document.getElementById("survivalSearchInput").addEventListener("keypress", e => { if (e.key === "Enter") run(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
