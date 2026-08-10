/**
 * Project Phoenix - Offline Emergency Decision Trees & Protocol Database
 * Evidence-based First Response Guidance & Multilingual Dictionary
 */

const PROTOCOLS = {
  cpr: {
    id: "cpr",
    title: "CPR & Cardiac Arrest",
    icon: "🫀",
    category: "Critical",
    summary: "Immediate CPR for unresponsive person who is not breathing normally.",
    keywords: ["cpr", "cardiac arrest", "collapsed", "no pulse", "not breathing", "stopped breathing", "heart stopped", "unresponsive", "fainting"],
    initialStep: "check_responsiveness",
    steps: {
      check_responsiveness: {
        id: "check_responsiveness",
        title: "1. Check Responsiveness",
        instruction: "Tap the person firmly on their shoulders and shout loudly: 'Are you okay?'",
        detail: "Look for any body movement, eye opening, or vocal response.",
        warning: "Call Emergency Services (911 / 112) or ask someone nearby to call immediately!",
        svgDiagram: "check_person",
        options: [
          { text: "Person Responds / Awake", nextStep: "recovery_position_guide" },
          { text: "No Response / Unresponsive", nextStep: "check_breathing" }
        ]
      },
      check_breathing: {
        id: "check_breathing",
        title: "2. Check Breathing (5–10 Seconds)",
        instruction: "Tilt head back slightly, lift chin. Watch chest for rising/falling for 10 seconds.",
        detail: "Gasping or irregular snoring-like breaths are NOT normal breathing.",
        svgDiagram: "check_airway",
        options: [
          { text: "Breathing Normally", nextStep: "recovery_position_guide" },
          { text: "Not Breathing / Only Gasping", nextStep: "cpr_start" },
          { text: "Unsure / Need Help", nextStep: "cpr_start" }
        ]
      },
      cpr_start: {
        id: "cpr_start",
        title: "3. Start Chest Compressions",
        instruction: "Place heel of one hand in center of chest. Interlock other hand on top. Push hard & fast down 2 inches (5 cm).",
        detail: "Rate: 100 to 120 compressions per minute. Allow chest to fully recoil after each push.",
        warning: "Use the CPR Metronome below to maintain the correct rhythmic pace (110 BPM).",
        svgDiagram: "cpr_placement",
        tool: "cpr_metronome",
        options: [
          { text: "30 Compressions Completed -> Give Rescue Breaths (If Trained)", nextStep: "cpr_breaths" },
          { text: "Hands-Only CPR (Continuous Compressions)", nextStep: "cpr_continuous" },
          { text: "AED / Defibrillator Arrived", nextStep: "aed_guidance" }
        ]
      },
      cpr_breaths: {
        id: "cpr_breaths",
        title: "4. Rescue Breaths (30 : 2 Ratio)",
        instruction: "Pinch nose, cover person's mouth with yours, blow for 1 second until chest rises. Give 2 breaths.",
        detail: "Immediately resume 30 chest compressions after 2 breaths. Do not delay compressions for more than 10 seconds.",
        svgDiagram: "rescue_breaths",
        tool: "cpr_metronome",
        options: [
          { text: "Continue 30:2 Cycle", nextStep: "cpr_start" },
          { text: "Person Starts Moving / Breathing", nextStep: "recovery_position_guide" },
          { text: "AED Arrived", nextStep: "aed_guidance" }
        ]
      },
      cpr_continuous: {
        id: "cpr_continuous",
        title: "4. Continuous Hands-Only CPR",
        instruction: "Keep pushing hard and fast in center of chest without stopping until paramedics arrive or AED is ready.",
        detail: "Switch compressions with another person every 2 minutes if tired to maintain compression depth.",
        tool: "cpr_metronome",
        options: [
          { text: "Person Revives / Moves", nextStep: "recovery_position_guide" },
          { text: "AED Available", nextStep: "aed_guidance" }
        ]
      },
      aed_guidance: {
        id: "aed_guidance",
        title: "5. AED (Automated External Defibrillator)",
        instruction: "Turn on AED. Attach pads to bare chest as shown on AED illustrations. Follow AED voice prompts.",
        detail: "Ensure no one touches the person while AED is analyzing rhythm or delivering a shock.",
        svgDiagram: "aed_pads",
        options: [
          { text: "Shock Delivered / Resume CPR", nextStep: "cpr_start" },
          { text: "Person Breathing / Conscious", nextStep: "recovery_position_guide" }
        ]
      },
      recovery_position_guide: {
        id: "recovery_position_guide",
        title: "Recovery Position",
        instruction: "Place person on their side with head tilted back to keep airway clear and prevent choking on fluids.",
        detail: "Bend top leg at knee for stability. Continually monitor breathing until help arrives.",
        svgDiagram: "recovery_position",
        options: [
          { text: "Breathing Changed / Stopped -> Restart CPR", nextStep: "cpr_start" },
          { text: "Paramedics Arrived", nextStep: "finished_step" }
        ]
      },
      finished_step: {
        id: "finished_step",
        title: "Emergency Handover",
        instruction: "Stay with person. Inform medical team when symptoms started and what first-aid actions were performed.",
        detail: "Keep person warm and calm.",
        options: [
          { text: "Back to Home / Main Menu", nextStep: "HOME" }
        ]
      }
    }
  },

  choking: {
    id: "choking",
    title: "Choking (Airway Obstruction)",
    icon: "🫁",
    category: "Critical",
    summary: "Immediate action for adult, child, or infant unable to breathe or speak due to blockage.",
    keywords: ["choking", "choke", "food stuck", "can't breathe", "cannot speak", "heimlich", "airway block", "strangling"],
    initialStep: "assess_choking",
    steps: {
      assess_choking: {
        id: "assess_choking",
        title: "1. Assess Choking Severity",
        instruction: "Is the person coughing forcefully, OR silent/unable to speak, cough, or breathe?",
        detail: "If coughing forcefully, encourage them to keep coughing. Do NOT slap their back while coughing.",
        svgDiagram: "choking_assess",
        options: [
          { text: "Coughing Forcefully", nextStep: "encourage_cough" },
          { text: "Silent / Cannot Speak / Turning Blue", nextStep: "check_age" }
        ]
      },
      encourage_cough: {
        id: "encourage_cough",
        title: "Encourage Coughing",
        instruction: "Stay with person and encourage them to cough out the obstruction naturally.",
        detail: "If coughing turns silent or weak, immediately switch to active abdominal thrusts.",
        options: [
          { text: "Object Cleared / Breathing Normally", nextStep: "finished_step" },
          { text: "Worse: Silent or Unable to Breathe", nextStep: "check_age" }
        ]
      },
      check_age: {
        id: "check_age",
        title: "Select Person's Age",
        instruction: "Is the person an Adult/Child (over 1 year old) or an Infant (under 1 year old)?",
        options: [
          { text: "Adult / Child (> 1 yr)", nextStep: "back_blows_adult" },
          { text: "Infant (< 1 yr)", nextStep: "infant_choking" }
        ]
      },
      back_blows_adult: {
        id: "back_blows_adult",
        title: "2. Give 5 Back Blows",
        instruction: "Stand beside and slightly behind. Lean person forward. Deliver 5 firm blows between shoulder blades with heel of hand.",
        detail: "Leaning forward ensures the object comes OUT rather than sliding deeper.",
        svgDiagram: "back_blows",
        options: [
          { text: "Object Cleared / Breathing", nextStep: "finished_step" },
          { text: "Object Still Stuck -> Perform Abdominal Thrusts", nextStep: "heimlich_maneuver" }
        ]
      },
      heimlich_maneuver: {
        id: "heimlich_maneuver",
        title: "3. 5 Abdominal Thrusts (Heimlich)",
        instruction: "Stand behind person. Wrap arms around waist. Place fist above navel below ribs. Grasp fist with other hand and pull inward and upward sharply 5 times.",
        detail: "Alternate between 5 back blows and 5 abdominal thrusts until object is dislodged.",
        warning: "Call 911 / 112 immediately if not already done!",
        svgDiagram: "heimlich",
        options: [
          { text: "Object Cleared", nextStep: "finished_step" },
          { text: "Repeat Cycle (5 Back Blows & 5 Thrusts)", nextStep: "back_blows_adult" },
          { text: "Person Became Unconscious / Collapsed", nextStep: "choking_unconscious" }
        ]
      },
      infant_choking: {
        id: "infant_choking",
        title: "Infant Choking (5 Back Slaps)",
        instruction: "Lay infant face down along your forearm, supporting head/jaw. Deliver 5 firm back slaps between shoulder blades.",
        detail: "Keep infant's head lower than their chest.",
        svgDiagram: "infant_back_blows",
        options: [
          { text: "Object Cleared", nextStep: "finished_step" },
          { text: "Object Stuck -> Give 5 Chest Thrusts", nextStep: "infant_chest_thrusts" }
        ]
      },
      infant_chest_thrusts: {
        id: "infant_chest_thrusts",
        title: "Infant 5 Chest Thrusts",
        instruction: "Turn infant face up on forearm. Place 2 fingers on center of breastbone. Deliver 5 quick chest thrusts about 1.5 inches deep.",
        detail: "Repeat 5 back slaps and 5 chest thrusts until object comes out or infant loses consciousness.",
        svgDiagram: "infant_chest_thrusts",
        options: [
          { text: "Object Cleared", nextStep: "finished_step" },
          { text: "Infant Unconscious -> Start CPR", nextStep: "choking_unconscious" }
        ]
      },
      choking_unconscious: {
        id: "choking_unconscious",
        title: "Person Unconscious - Start CPR",
        instruction: "Lower person gently to ground. Begin chest compressions. Before giving rescue breaths, open mouth and look for object (remove ONLY if clearly visible).",
        detail: "Do NOT perform blind finger sweeps.",
        warning: "Call 911 / 112 immediately!",
        options: [
          { text: "Go to Full CPR Protocol", nextStep: "GOTO_cpr" }
        ]
      },
      finished_step: {
        id: "finished_step",
        title: "Choking Resolved",
        instruction: "Ensure person is breathing comfortably. Medical evaluation is recommended after Heimlich maneuver or internal thrusts.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  bleeding: {
    id: "bleeding",
    title: "Severe Bleeding & Hemorrhage",
    icon: "🩸",
    category: "Severe",
    summary: "Control heavy arterial or venous bleeding, prevent hemorrhagic shock.",
    keywords: ["bleeding", "blood", "wound", "cut", "stab", "gunshot", "hemorrhage", "gushing", "arterial"],
    initialStep: "safety_direct_pressure",
    steps: {
      safety_direct_pressure: {
        id: "safety_direct_pressure",
        title: "1. Apply Firm Direct Pressure",
        instruction: "Press hard directly on wound using clean cloth, gauze, or bare hands if no cloth available.",
        detail: "Maintain continuous, firm pressure without lifting cloth to check wound for at least 10 minutes.",
        warning: "Wear protective gloves if available to avoid bloodborne pathogens.",
        svgDiagram: "direct_pressure",
        options: [
          { text: "Bleeding Controlled / Slowed", nextStep: "bandage_wound" },
          { text: "Blood Soaking Through / Heavy Gushing", nextStep: "add_more_pressure" }
        ]
      },
      add_more_pressure: {
        id: "add_more_pressure",
        title: "2. Add Dressing & Increase Pressure",
        instruction: "Do NOT remove original soaked cloth. Add more thick padding on top and push down harder with both hands.",
        detail: "If wound is on arm or leg and severe arterial bleeding continues, prepare tourniquet.",
        options: [
          { text: "Bleeding Controlled", nextStep: "bandage_wound" },
          { text: "Limb Wound Bleeding Uncontrolled -> Tourniquet Needed", nextStep: "apply_tourniquet" }
        ]
      },
      apply_tourniquet: {
        id: "apply_tourniquet",
        title: "3. Apply Tourniquet (Limbs Only)",
        instruction: "Place commercial tourniquet (or cloth strap + rod) 2–3 inches ABOVE wound (closer to heart, not on joint). Tighten windlass until bleeding stops completely.",
        detail: "Note exact time tourniquet was applied. Do NOT loosen tourniquet once tight.",
        warning: "Call 911 / 112 immediately. Inform emergency services tourniquet is applied.",
        svgDiagram: "tourniquet",
        options: [
          { text: "Bleeding Stopped -> Treat Shock", nextStep: "treat_shock" }
        ]
      },
      bandage_wound: {
        id: "bandage_wound",
        title: "4. Secure Bandage",
        instruction: "Wrap roller bandage firmly over pads to keep pressure intact. Ensure fingers/toes beyond wrap maintain pulse and normal skin color.",
        options: [
          { text: "Check for Shock", nextStep: "treat_shock" }
        ]
      },
      treat_shock: {
        id: "treat_shock",
        title: "5. Prevent & Treat Shock",
        instruction: "Lay person flat on back. Elevate legs 12 inches if no spine/leg injury. Cover with blanket to maintain body temperature.",
        detail: "Do NOT give foods or drinks.",
        svgDiagram: "treat_shock",
        options: [
          { text: "Paramedics Arrived", nextStep: "finished_step" }
        ]
      },
      finished_step: {
        id: "finished_step",
        title: "Bleeding Managed",
        instruction: "Keep pressure on wound until emergency personnel take over.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  burns: {
    id: "burns",
    title: "Burns & Scalds",
    icon: "🔥",
    category: "Moderate/Severe",
    summary: "Immediate cooling and protective dressing for heat, chemical, or electrical burns.",
    keywords: ["burn", "scald", "hot water", "fire", "chemical burn", "electrical shock", "blister", "singed"],
    initialStep: "stop_burn",
    steps: {
      stop_burn: {
        id: "stop_burn",
        title: "1. Stop Burn Source & Cool Immediately",
        instruction: "Cool burn with clean cool running water for AT LEAST 10 to 20 minutes.",
        detail: "Do NOT use ice, icy water, butter, oil, or toothpaste on burn.",
        warning: "For electrical burns, ensure power source is isolated before touching person!",
        svgDiagram: "cool_water",
        options: [
          { text: "Cooling Started -> Next Step", nextStep: "remove_jewelry" }
        ]
      },
      remove_jewelry: {
        id: "remove_jewelry",
        title: "2. Remove Constrictive Items",
        instruction: "Gently remove rings, watches, belts, or tight clothes before swelling occurs.",
        detail: "Do NOT peel away clothing stuck to charred or melted burn areas.",
        options: [
          { text: "Done -> Cover Burn", nextStep: "cover_burn" }
        ]
      },
      cover_burn: {
        id: "cover_burn",
        title: "3. Cover Burn Cleanly",
        instruction: "Cover burn loosely with clean plastic cling wrap, sterile non-stick pad, or clean sheet.",
        detail: "Do NOT break blisters.",
        svgDiagram: "cover_burn",
        options: [
          { text: "Check Burn Severity", nextStep: "assess_severity" }
        ]
      },
      assess_severity: {
        id: "assess_severity",
        title: "4. Assess Need for Emergency Care",
        instruction: "Call 911 / 112 if: burn is larger than person's palm, on face/hands/joints/genitals, chemical/electrical, or patient is child/elderly.",
        options: [
          { text: "Severe Burn -> Emergency Services Called", nextStep: "finished_step" },
          { text: "Minor Burn -> Monitor & Clean", nextStep: "finished_step" }
        ]
      },
      finished_step: {
        id: "finished_step",
        title: "Burn First Aid Complete",
        instruction: "Keep patient warm and hydrated if conscious.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  stroke: {
    id: "stroke",
    title: "Stroke (FAST Test)",
    icon: "🧠",
    category: "Critical",
    summary: "Recognize acute stroke signs using FAST criteria and seek immediate medical help.",
    keywords: ["stroke", "fast", "facial drop", "slurred speech", "numbness", "arm weakness", "brain attack", "paralysis"],
    initialStep: "fast_face",
    steps: {
      fast_face: {
        id: "fast_face",
        title: "F - Face Drooping",
        instruction: "Ask the person to smile. Does one side of their face droop or look uneven?",
        svgDiagram: "fast_stroke",
        options: [
          { text: "Yes (Face Drooping)", nextStep: "fast_arms" },
          { text: "No / Unsure", nextStep: "fast_arms" }
        ]
      },
      fast_arms: {
        id: "fast_arms",
        title: "A - Arm Weakness",
        instruction: "Ask person to raise both arms. Does one arm drift downward or fail to rise?",
        svgDiagram: "fast_stroke",
        options: [
          { text: "Yes (Arm Weakness)", nextStep: "fast_speech" },
          { text: "No / Unsure", nextStep: "fast_speech" }
        ]
      },
      fast_speech: {
        id: "fast_speech",
        title: "S - Speech Difficulty",
        instruction: "Ask person to repeat a simple phrase: 'The sky is blue'. Is speech slurred, strange, or impossible?",
        svgDiagram: "fast_stroke",
        options: [
          { text: "Yes (Speech Impaired)", nextStep: "fast_time" },
          { text: "No / Unsure", nextStep: "fast_time" }
        ]
      },
      fast_time: {
        id: "fast_time",
        title: "T - Time to Call Emergency Services",
        instruction: "If ANY of these signs are present (Face, Arm, Speech), call 911 / 112 IMMEDIATELY!",
        detail: "Note exact time symptoms first started. Time is critical for clot-busting stroke treatments.",
        warning: "Do NOT give food, drinks, or aspirin during suspected stroke.",
        options: [
          { text: "Called 911/112 -> Place in Safe Position", nextStep: "stroke_position" }
        ]
      },
      stroke_position: {
        id: "stroke_position",
        title: "Stroke Care Position",
        instruction: "Keep person sitting up slightly or in recovery position if sleepy. Reassure them continuously.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  unconscious: {
    id: "unconscious",
    title: "Unresponsive / Fainting",
    icon: "🛏️",
    category: "Critical",
    summary: "Evaluation and airway protection for unresponsive or passed-out person.",
    keywords: ["unconscious", "passed out", "fainted", "unresponsive", "collapsed", "blackout", "coma"],
    initialStep: "check_responsiveness",
    steps: {
      check_responsiveness: {
        id: "check_responsiveness",
        title: "1. Shake & Shout",
        instruction: "Tap shoulders firmly and ask loudly: 'Are you okay?'",
        options: [
          { text: "No Response", nextStep: "check_airway_breathing" },
          { text: "Awake / Responded", nextStep: "fainting_care" }
        ]
      },
      check_airway_breathing: {
        id: "check_airway_breathing",
        title: "2. Check Airway & Breathing",
        instruction: "Tilt head back, lift chin. Watch chest for 10 seconds.",
        svgDiagram: "check_airway",
        options: [
          { text: "Breathing Normally", nextStep: "place_recovery_position" },
          { text: "Not Breathing Normally", nextStep: "GOTO_cpr" }
        ]
      },
      place_recovery_position: {
        id: "place_recovery_position",
        title: "3. Place in Recovery Position",
        instruction: "Roll person onto side, support head, bend top knee to keep airway open and clear of vomit.",
        detail: "Call 911 / 112 and check breathing every minute.",
        svgDiagram: "recovery_position",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      },
      fainting_care: {
        id: "fainting_care",
        title: "Fainting Recovery",
        instruction: "Keep person lying down flat for 10-15 minutes. Elevate legs 12 inches to restore brain blood flow.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  seizure: {
    id: "seizure",
    title: "Seizures & Convulsions",
    icon: "⚡",
    category: "Severe",
    summary: "Protect individual from self-injury during fitting/seizure.",
    keywords: ["seizure", "convulsions", "epilepsy", "shaking", "fitting", "foaming at mouth", "spasms"],
    initialStep: "protect_head",
    steps: {
      protect_head: {
        id: "protect_head",
        title: "1. Protect Person from Harm",
        instruction: "Clear dangerous objects (furniture, hard items) away. Cushion person's head with folded jacket or pillow.",
        detail: "Note start time of seizure.",
        warning: "Do NOT hold person down or force anything into their mouth!",
        svgDiagram: "seizure_protect",
        options: [
          { text: "Seizure Active -> Monitor", nextStep: "seizure_active" },
          { text: "Seizure Stopped", nextStep: "post_seizure" }
        ]
      },
      seizure_active: {
        id: "seizure_active",
        title: "2. Active Seizure Rules",
        instruction: "Stay calm. Keep bystanders back. Do NOT restrain limbs.",
        detail: "Call 911 / 112 if seizure lasts longer than 5 minutes, repeats, or patient is pregnant/diabetic.",
        options: [
          { text: "Seizure Ended", nextStep: "post_seizure" }
        ]
      },
      post_seizure: {
        id: "post_seizure",
        title: "3. Post-Seizure Care",
        instruction: "Roll person onto side into recovery position. Gently wipe fluids from mouth. Speak calmly as they regain consciousness.",
        svgDiagram: "recovery_position",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  anaphylaxis: {
    id: "anaphylaxis",
    title: "Severe Allergic Reaction (Anaphylaxis)",
    icon: "🐝",
    category: "Critical",
    summary: "Rapid treatment for severe allergic swelling, hives, or breathing distress.",
    keywords: ["anaphylaxis", "allergic reaction", "epipen", "bee sting", "peanut allergy", "swelling face", "hives", "throat closing"],
    initialStep: "epipen_check",
    steps: {
      epipen_check: {
        id: "epipen_check",
        title: "1. Check for Epinephrine Auto-Injector (EpiPen)",
        instruction: "Does the person have an EpiPen / Auto-Injector available?",
        warning: "Call 911 / 112 immediately! Anaphylaxis can progress rapidly.",
        options: [
          { text: "Yes (EpiPen Available)", nextStep: "use_epipen" },
          { text: "No EpiPen", nextStep: "position_patient" }
        ]
      },
      use_epipen: {
        id: "use_epipen",
        title: "2. Administer EpiPen",
        instruction: "Pull off blue safety cap. Press orange tip firmly into outer mid-thigh until it clicks. Hold firmly in place for 3 full seconds.",
        detail: "Massage injection site for 10 seconds. EpiPen can be administered through clothing if necessary.",
        svgDiagram: "epipen_use",
        options: [
          { text: "Injected -> Position Patient", nextStep: "position_patient" }
        ]
      },
      position_patient: {
        id: "position_patient",
        title: "3. Patient Positioning",
        instruction: "Lay person flat on back. If breathing is difficult, allow them to sit up slightly. If vomiting or dizzy, lay flat with legs elevated.",
        detail: "A second dose of epinephrine may be given after 5–15 minutes if symptoms persist and emergency help has not arrived.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  poisoning: {
    id: "poisoning",
    title: "Poisoning & Toxic Ingestion",
    icon: "🧪",
    category: "Severe",
    summary: "First aid for swallowed, inhaled, or skin-contact chemicals or drugs.",
    keywords: ["poison", "toxic", "swallowed chemical", "overdose", "bleach", "pills", "poisoning", "venom"],
    initialStep: "identify_substance",
    steps: {
      identify_substance: {
        id: "identify_substance",
        title: "1. Identify Substance & Call Poison Control",
        instruction: "Find chemical container, plant, or medication bottle. Call Poison Control or 911 / 112 immediately.",
        warning: "Do NOT induce vomiting unless explicitly directed by Poison Control / Doctor!",
        options: [
          { text: "Inhaled Gas / Fumes", nextStep: "inhaled_poison" },
          { text: "Skin / Eye Chemical Contact", nextStep: "skin_flush" },
          { text: "Swallowed Toxic Substance", nextStep: "swallowed_poison" }
        ]
      },
      inhaled_poison: {
        id: "inhaled_poison",
        title: "Inhaled Fumes First Aid",
        instruction: "Immediately move person to fresh air. Open doors and windows. Monitor breathing.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      },
      skin_flush: {
        id: "skin_flush",
        title: "Skin / Eye Flush",
        instruction: "Flush affected eyes or skin with lukewarm running water for 15 to 20 minutes. Remove contaminated clothes.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      },
      swallowed_poison: {
        id: "swallowed_poison",
        title: "Swallowed Poison Guidelines",
        instruction: "Wipe person's mouth. Have container ready to read chemical ingredients to emergency dispatchers.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  heart_attack: {
    id: "heart_attack",
    title: "Chest Pain / Heart Attack",
    icon: "🫀",
    category: "Critical",
    summary: "First response for suspected myocardial infarction / acute chest pressure.",
    keywords: ["heart attack", "chest pain", "tightness", "arm pain", "jaw pain", "heart pressure", "shortness of breath"],
    initialStep: "assess_chest_pain",
    steps: {
      assess_chest_pain: {
        id: "assess_chest_pain",
        title: "1. Recognize Symptoms & Call 911",
        instruction: "Symptoms: Heavy chest pressure, pain spreading to jaw/left arm, cold sweat, dizziness, shortness of breath.",
        warning: "Call 911 / 112 IMMEDIATELY! Do not drive patient yourself.",
        options: [
          { text: "Called Emergency Services -> Rest Patient", nextStep: "rest_position" }
        ]
      },
      rest_position: {
        id: "rest_position",
        title: "2. Comfortable Sitting Position",
        instruction: "Seat person on floor leaning back against wall with knees bent to relieve heart strain. Loosen tight collars and belts.",
        options: [
          { text: "Check Aspirin Suitability", nextStep: "aspirin_check" }
        ]
      },
      aspirin_check: {
        id: "aspirin_check",
        title: "3. Consider Aspirin (300 mg)",
        instruction: "If conscious, not allergic, and not taking blood thinners, have patient chew 1 adult Aspirin (300 mg) slowly.",
        detail: "Chewing aspirin speeds absorption into bloodstream to hinder blood clots.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  heatstroke: {
    id: "heatstroke",
    title: "Heatstroke & Severe Heat Illness",
    icon: "☀️",
    category: "Moderate/Severe",
    summary: "Rapid cooling procedures for extreme body overheating.",
    keywords: ["heatstroke", "sunstroke", "overheating", "high fever", "hot skin", "heat exhaustion", "dehydration"],
    initialStep: "rapid_cooling",
    steps: {
      rapid_cooling: {
        id: "rapid_cooling",
        title: "1. Rapid Cooling Action",
        instruction: "Move person into shade or air conditioning. Apply cold wet sheets, ice packs to armpits/neck/groin, or spray with cool water.",
        warning: "Call 911 / 112 if skin is hot/dry, person is confused, or vomiting!",
        svgDiagram: "cool_water",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  },

  fracture: {
    id: "fracture",
    title: "Bone Fracture & Trauma",
    icon: "🦴",
    category: "Moderate",
    summary: "Immobilization and pain reduction for suspected broken bones.",
    keywords: ["fracture", "broken bone", "sprain", "dislocation", "trauma", "deformed limb", "swollen joint"],
    initialStep: "immobilize_limb",
    steps: {
      immobilize_limb: {
        id: "immobilize_limb",
        title: "1. Immobilize & Support",
        instruction: "Do NOT attempt to straighten or realign broken limb. Support injured area in position found using padding or rolled towels.",
        detail: "Apply ice pack wrapped in cloth for 20 minutes to diminish swelling.",
        options: [{ text: "Back to Main Menu", nextStep: "HOME" }]
      }
    }
  }
};

/**
 * Multilingual Translations for Project Phoenix
 */
const TRANSLATIONS = {
  en: {
    appTitle: "PHOENIX EMERGENCY ASSISTANT",
    appSubtitle: "Offline Decision Support System • Step-by-Step Guidance",
    searchPlaceholder: "Search emergency or describe situation (e.g. 'collapsed not breathing', 'choking baby')...",
    searchBtn: "Analyze Situation",
    emergencyGridTitle: "Direct Action Protocols",
    cprMetronomeTitle: "CPR Compression Metronome (110 BPM)",
    startMetronome: "Start Audio Rhythm",
    stopMetronome: "Stop Metronome",
    sosBeacon: "SOS Beacon & Strobe",
    callEmergency: "Call Emergency",
    locationTitle: "Your Location & GPS",
    copyLocation: "Copy Coordinates",
    iceContacts: "ICE Emergency Contacts",
    speechVoice: "Voice Guidance",
    speechSpeed: "Speed",
    highContrast: "High Contrast UI",
    langName: "English"
  },
  es: {
    appTitle: "ASISTENTE DE EMERGENCIA PHOENIX",
    appSubtitle: "Sistema de Soporte Offline • Guía Paso a Paso",
    searchPlaceholder: "Describa la emergencia (ej. 'desmayado no respira', 'bebé atragantado')...",
    searchBtn: "Analizar Situación",
    emergencyGridTitle: "Protocolos de Acción Directa",
    cprMetronomeTitle: "Metrónomo de RCP (110 BPM)",
    startMetronome: "Iniciar Ritmo Audio",
    stopMetronome: "Detener Metrónomo",
    sosBeacon: "Faro SOS y Estroboscopio",
    callEmergency: "Llamar Emergencias",
    locationTitle: "Su Ubicación GPS",
    copyLocation: "Copiar Coordenadas",
    iceContacts: "Contactos de Emergencia ICE",
    speechVoice: "Voz de Guía",
    speechSpeed: "Velocidad",
    highContrast: "Alto Contraste",
    langName: "Español"
  },
  fr: {
    appTitle: "ASSISTANT D'URGENCE PHOENIX",
    appSubtitle: "Système de Décision Hors Ligne • Guidage Pas à Pas",
    searchPlaceholder: "Décrivez la situation (ex: 'évanoui ne respire pas', 'bébé s'étouffe')...",
    searchBtn: "Analyser la Situation",
    emergencyGridTitle: "Protocole d'Action Directe",
    cprMetronomeTitle: "Métronome de RCP (110 BPM)",
    startMetronome: "Lancer le Rythme",
    stopMetronome: "Arrêter le Métronome",
    sosBeacon: "Balise SOS & Flash",
    callEmergency: "Appeler les Secours",
    locationTitle: "Votre Position GPS",
    copyLocation: "Copier Coordonnées",
    iceContacts: "Contacts d'Urgence ICE",
    speechVoice: "Guidage Vocal",
    speechSpeed: "Vitesse",
    highContrast: "Haut Contraste",
    langName: "Français"
  },
  hi: {
    appTitle: "फीनिक्स आपातकालीन सहायक",
    appSubtitle: "ऑफलाइन निर्णय सहायता प्रणाली • चरण-दर-चरण मार्गदर्शन",
    searchPlaceholder: "स्थिति दर्ज करें (जैसे 'सांस नहीं आ रही', 'गले में खाना अटका')...",
    searchBtn: "विश्लेषण करें",
    emergencyGridTitle: "आपातकालीन प्रोटोकॉल",
    cprMetronomeTitle: "सीपीआर मेट्रोनोम (110 BPM)",
    startMetronome: "बीट शुरू करें",
    stopMetronome: "मेट्रोनोम बंद करें",
    sosBeacon: "एसओएस बीकन और फ्लैश",
    callEmergency: "आपातकालीन कॉल करें",
    locationTitle: "आपकी जीपीएस स्थिति",
    copyLocation: "निर्देशांक कॉपी करें",
    iceContacts: "आपातकालीन संपर्क (ICE)",
    speechVoice: "आवाज मार्गदर्शन",
    speechSpeed: "गति",
    highContrast: "उच्च विपरीत्य (हाई कंट्रास्ट)",
    langName: "हिन्दी"
  },
  de: {
    appTitle: "PHOENIX NOTFALL ASSISTENT",
    appSubtitle: "Offline-Entscheidungssystem • Schritt-für-Schritt Anleitung",
    searchPlaceholder: "Notfall beschreiben (z.B. 'bewusstlos atmet nicht', 'Kind verschluckt')...",
    searchBtn: "Situation Analysieren",
    emergencyGridTitle: "Direkte Protokolle",
    cprMetronomeTitle: "HLW-Metronom (110 BPM)",
    startMetronome: "Rhythmus Starten",
    stopMetronome: "Metronom Stoppen",
    sosBeacon: "SOS Signal & Stroboskop",
    callEmergency: "Notruf Wählen",
    locationTitle: "Ihr Standort GPS",
    copyLocation: "Koordinaten Kopieren",
    iceContacts: "ICE Notfallkontakte",
    speechVoice: "Sprachführung",
    speechSpeed: "Geschwindigkeit",
    highContrast: "Hoher Kontrast",
    langName: "Deutsch"
  },
  zh: {
    appTitle: "PHOENIX 离线急救决策助手",
    appSubtitle: "离线急救决策支持系统 • 一步一指令",
    searchPlaceholder: "描述急救状况 (例如: '倒地无呼吸', '婴儿噎呛')...",
    searchBtn: "分析状况",
    emergencyGridTitle: "快速急救指南",
    cprMetronomeTitle: "心肺复苏 (CPR) 节拍器 (110 BPM)",
    startMetronome: "启动按压节奏",
    stopMetronome: "停止节拍器",
    sosBeacon: "SOS 警报与闪光",
    callEmergency: "拨打急救电话",
    locationTitle: "您的 GPS 位置",
    copyLocation: "复制经纬度",
    iceContacts: "紧急联系人 (ICE)",
    speechVoice: "语音朗读",
    speechSpeed: "语速",
    highContrast: "高对比度模式",
    langName: "中文"
  }
};
