export const VALID_SAFETY_COLORS = ['green', 'yellow', 'red'];
export const REQUIRED_FIELDS = ['breed', 'mode', 'humanSafe', 'dogSafe', 'stats', 'diary'];

/**
 * Extracts and parses a JSON object from AI model response text.
 * Handles clean JSON, Markdown code fences (```json ... ```), and surrounding text.
 *
 * @param {string} text
 * @returns {object}
 */
export function parseAIResponse(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Empty or invalid response text');
  }

  // Strip code fences if present
  let clean = text.replace(/```(?:json)?\n?/gi, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    // If direct parse fails, try extracting the first outermost JSON object
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // Fall through to error
      }
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Validates that parsed AI response adheres to the Pet Analysis schema contract.
 *
 * @param {any} data
 * @returns {object} Validated and normalized data
 */
export function validatePetAnalysis(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Analysis response must be a JSON object');
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (typeof data.breed !== 'string' || !data.breed.trim()) {
    throw new Error('Field "breed" must be a non-empty string');
  }

  if (typeof data.mode !== 'string' || !data.mode.trim()) {
    throw new Error('Field "mode" must be a non-empty string');
  }

  if (typeof data.diary !== 'string' || !data.diary.trim()) {
    throw new Error('Field "diary" must be a non-empty string');
  }

  // Validate safety colors
  const humanSafe = String(data.humanSafe).toLowerCase().trim();
  if (!VALID_SAFETY_COLORS.includes(humanSafe)) {
    throw new Error(`Invalid humanSafe safety color: "${data.humanSafe}". Expected green, yellow, or red.`);
  }

  const dogSafe = String(data.dogSafe).toLowerCase().trim();
  if (!VALID_SAFETY_COLORS.includes(dogSafe)) {
    throw new Error(`Invalid dogSafe safety color: "${data.dogSafe}". Expected green, yellow, or red.`);
  }

  // Validate stats
  if (!Array.isArray(data.stats)) {
    throw new Error('Field "stats" must be an array');
  }

  const validatedStats = data.stats.map((stat, idx) => {
    if (!stat || typeof stat !== 'object') {
      throw new Error(`Stat at index ${idx} must be an object`);
    }
    if (typeof stat.label !== 'string' || !stat.label.trim()) {
      throw new Error(`Stat at index ${idx} missing valid label`);
    }
    const num = Number(stat.value);
    if (Number.isNaN(num) || num < 0 || num > 100) {
      throw new Error(`Stat value outside 0-100 for "${stat.label}": ${stat.value}`);
    }
    return {
      label: stat.label.trim(),
      value: num,
    };
  });

  return {
    ...data,
    humanSafe,
    dogSafe,
    stats: validatedStats,
  };
}

/**
 * Parses and validates an AI response string.
 *
 * @param {string} text
 * @returns {object}
 */
export function parseAndValidateAIResponse(text) {
  const parsed = parseAIResponse(text);
  return validatePetAnalysis(parsed);
}
