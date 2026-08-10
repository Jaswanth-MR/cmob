/**
 * Project Phoenix - Emergency Situation Analyzer (Client-side NLP)
 * Performs offline natural language query matching against emergency protocols
 */

const SYNONYMS = {
  cpr: ["cpr", "cardiac arrest", "collapsed", "no pulse", "not breathing", "stopped breathing", "heart stopped", "unresponsive", "fainting", "dead", "pulse free", "no heartbeat"],
  choking: ["choking", "choke", "food stuck", "can't breathe", "cannot speak", "heimlich", "airway block", "strangling", "swallowed coin", "gasping for air"],
  bleeding: ["bleeding", "blood", "wound", "cut", "stab", "gunshot", "hemorrhage", "gushing", "arterial", "slashed", "severed", "soaking blood"],
  burns: ["burn", "scald", "hot water", "fire", "chemical burn", "electrical shock", "blister", "singed", "boiling water", "acid", "flame"],
  stroke: ["stroke", "fast", "facial drop", "slurred speech", "numbness", "arm weakness", "brain attack", "paralysis", "face drooping", "can't talk"],
  unconscious: ["unconscious", "passed out", "fainted", "unresponsive", "collapsed", "blackout", "coma", "knocked out", "dizzy"],
  seizure: ["seizure", "convulsions", "epilepsy", "shaking", "fitting", "foaming at mouth", "spasms", "epileptic", "jerking"],
  anaphylaxis: ["anaphylaxis", "allergic reaction", "epipen", "bee sting", "peanut allergy", "swelling face", "hives", "throat closing", "allergy", "swollen tongue"],
  poisoning: ["poison", "toxic", "swallowed chemical", "overdose", "bleach", "pills", "poisoning", "venom", "swallowed pills", "detergent", "rat poison"],
  heart_attack: ["heart attack", "chest pain", "tightness", "arm pain", "jaw pain", "heart pressure", "shortness of breath", "myocardial", "chest squeeze"],
  heatstroke: ["heatstroke", "sunstroke", "overheating", "high fever", "hot skin", "heat exhaustion", "dehydration", "sun stroke", "too hot"],
  fracture: ["fracture", "broken bone", "sprain", "dislocation", "trauma", "deformed limb", "swollen joint", "broken leg", "broken arm", "twisted ankle"]
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class EmergencyAnalyzer {
  constructor(protocols) {
    this.protocols = protocols;
  }

  /**
   * Analyzes free-text user description and returns ranked protocol matches.
   * @param {string} query 
   * @returns {Object} { bestMatch, scores, confidence }
   */
  analyze(query) {
    if (!query || typeof query !== "string") {
      return { bestMatch: null, scores: [], confidence: 0 };
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
    // Ignore tokens shorter than 3 characters for general protocol matching
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length >= 3);

    const scores = [];

    for (const [key, protocol] of Object.entries(this.protocols)) {
      let score = 0;
      const keywords = protocol.keywords || [];
      const synonymList = SYNONYMS[key] || [];

      // 1. Direct phrase matching using word boundary regex (\bphrase\b)
      for (const kw of keywords) {
        const regex = new RegExp('\\b' + escapeRegExp(kw.toLowerCase()) + '\\b', 'i');
        if (regex.test(cleanQuery)) {
          score += 40;
        }
      }

      // 2. Synonym phrase matching using word boundary regex (\bphrase\b)
      for (const syn of synonymList) {
        const regex = new RegExp('\\b' + escapeRegExp(syn.toLowerCase()) + '\\b', 'i');
        if (regex.test(cleanQuery)) {
          score += 30;
        }
      }

      // 3. Token-level matching: only match if query token equals a whole word in the keyword/synonym phrase
      for (const token of queryTokens) {
        for (const kw of keywords) {
          const kwWords = kw.toLowerCase().split(/\s+/);
          if (kwWords.includes(token)) {
            score += 10;
          }
        }
        for (const syn of synonymList) {
          const synWords = syn.toLowerCase().split(/\s+/);
          if (synWords.includes(token)) {
            score += 8;
          }
        }
      }

      scores.push({
        protocolId: key,
        protocol: protocol,
        score: score
      });
    }

    // Sort scores descending
    scores.sort((a, b) => b.score - a.score);

    const topMatch = scores[0];
    const confidence = topMatch && topMatch.score > 0 
      ? Math.min(100, Math.round((topMatch.score / 80) * 100))
      : 0;

    return {
      bestMatch: confidence >= 25 ? topMatch.protocol : null,
      topScore: topMatch ? topMatch.score : 0,
      confidence: confidence,
      allScores: scores
    };
  }

  /**
   * Scores typed text against a step's option text values using whole-word matching.
   * @param {string} query 
   * @param {Array} options 
   * @returns {Object} { bestMatch, score }
   */
  matchOptions(query, options) {
    if (!query || typeof query !== "string" || !options || !Array.isArray(options) || options.length === 0) {
      return { bestMatch: null, score: 0 };
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
    if (!cleanQuery) {
      return { bestMatch: null, score: 0 };
    }

    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length >= 2);

    const scoredOptions = options.map(opt => {
      let score = 0;
      const cleanOptionText = opt.text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
      const optionWords = cleanOptionText.split(/\s+/);

      // Whole phrase match using word boundary
      const phraseRegex = new RegExp('\\b' + escapeRegExp(cleanQuery) + '\\b', 'i');
      if (phraseRegex.test(cleanOptionText)) {
        score += 35;
      }

      // Reverse phrase check if option text is short (e.g., "Yes")
      const optRegex = new RegExp('\\b' + escapeRegExp(cleanOptionText) + '\\b', 'i');
      if (optRegex.test(cleanQuery)) {
        score += 35;
      }

      // Word-overlap matching: query token equals a whole word in option text
      for (const token of queryTokens) {
        if (token.length >= 3 || token === "yes" || token === "no") {
          if (optionWords.includes(token)) {
            score += 15;
          }
        }
      }

      // Common affirmative / negative intent heuristics
      const affirmativeWords = ["yes", "yeah", "yep", "true", "correct", "awake", "responds", "breathing", "cleared", "good", "alive"];
      const negativeWords = ["no", "nope", "false", "unresponsive", "silent", "bad", "collapsed", "stopped", "worse", "not"];

      const queryHasAffirmative = queryTokens.some(t => affirmativeWords.includes(t));
      const queryHasNegative = queryTokens.some(t => negativeWords.includes(t));

      const optHasAffirmative = optionWords.some(w => ["yes", "awake", "responds", "cleared", "normal", "normally"].includes(w));
      const optHasNegative = optionWords.some(w => ["no", "unresponsive", "silent", "not", "unable", "worse", "unconscious"].includes(w));

      if (queryHasAffirmative && optHasAffirmative) {
        score += 20;
      }
      if (queryHasNegative && optHasNegative) {
        score += 20;
      }

      return { option: opt, score };
    });

    scoredOptions.sort((a, b) => b.score - a.score);

    const top = scoredOptions[0];
    const isConfident = top && top.score >= 15;

    return {
      bestMatch: isConfident ? top.option : null,
      score: top ? top.score : 0
    };
  }
}

