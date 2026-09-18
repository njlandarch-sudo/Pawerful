import test from 'node:test';
import assert from 'node:assert';
import {
  parseAIResponse,
  validatePetAnalysis,
  parseAndValidateAIResponse,
  VALID_SAFETY_COLORS,
  REQUIRED_FIELDS,
} from '../api/response-parser.js';

const validSample = {
  breed: 'Golden Retriever',
  mode: 'Zoomies Mode',
  humanSafe: 'green',
  dogSafe: 'green',
  stats: [
    { label: 'Energy', value: 95 },
    { label: 'Sass', value: 40 },
    { label: 'Affection', value: 100 },
  ],
  diary: 'I ran in seven circles and then found my favorite squeaky toy!',
};

test('parseAIResponse - valid JSON directly', () => {
  const input = JSON.stringify(validSample);
  const result = parseAIResponse(input);
  assert.deepStrictEqual(result, validSample);
});

test('parseAIResponse - JSON inside Markdown code fences', () => {
  const fenced = `\`\`\`json\n${JSON.stringify(validSample, null, 2)}\n\`\`\``;
  const result = parseAIResponse(fenced);
  assert.deepStrictEqual(result, validSample);
});

test('parseAIResponse - JSON with surrounding explanatory text', () => {
  const surrounded = `Here is the pet analysis report for your photo:\n${JSON.stringify(validSample)}\nHope you enjoy this summary!`;
  const result = parseAIResponse(surrounded);
  assert.deepStrictEqual(result, validSample);
});

test('parseAIResponse - malformed JSON throws error', () => {
  assert.throws(() => {
    parseAIResponse('This is not json at all');
  }, /Failed to parse AI response/);

  assert.throws(() => {
    parseAIResponse('{ "breed": "Cat", "mode": ');
  }, /Failed to parse AI response/);

  assert.throws(() => {
    parseAIResponse('');
  }, /Empty or invalid response text/);
});

test('validatePetAnalysis - valid payload normalizes successfully', () => {
  const result = validatePetAnalysis(validSample);
  assert.strictEqual(result.breed, 'Golden Retriever');
  assert.strictEqual(result.humanSafe, 'green');
  assert.strictEqual(result.dogSafe, 'green');
  assert.strictEqual(result.stats.length, 3);
});

test('validatePetAnalysis - case-insensitivity on safety colors', () => {
  const sample = {
    ...validSample,
    humanSafe: 'YELLOW',
    dogSafe: 'Red',
  };
  const result = validatePetAnalysis(sample);
  assert.strictEqual(result.humanSafe, 'yellow');
  assert.strictEqual(result.dogSafe, 'red');
});

test('validatePetAnalysis - missing required fields throws error', () => {
  for (const field of REQUIRED_FIELDS) {
    const incomplete = { ...validSample };
    delete incomplete[field];
    assert.throws(() => {
      validatePetAnalysis(incomplete);
    }, new RegExp(`Missing required field: ${field}`));
  }
});

test('validatePetAnalysis - invalid safety colors throw error', () => {
  const invalidHuman = { ...validSample, humanSafe: 'blue' };
  assert.throws(() => {
    validatePetAnalysis(invalidHuman);
  }, /Invalid humanSafe safety color/);

  const invalidDog = { ...validSample, dogSafe: 'purple' };
  assert.throws(() => {
    validatePetAnalysis(invalidDog);
  }, /Invalid dogSafe safety color/);
});

test('validatePetAnalysis - stat values outside 0-100 throw error', () => {
  const tooHigh = {
    ...validSample,
    stats: [{ label: 'Energy', value: 101 }],
  };
  assert.throws(() => {
    validatePetAnalysis(tooHigh);
  }, /Stat value outside 0-100/);

  const negative = {
    ...validSample,
    stats: [{ label: 'Sass', value: -1 }],
  };
  assert.throws(() => {
    validatePetAnalysis(negative);
  }, /Stat value outside 0-100/);

  const nonNumeric = {
    ...validSample,
    stats: [{ label: 'Affection', value: 'very high' }],
  };
  assert.throws(() => {
    validatePetAnalysis(nonNumeric);
  }, /Stat value outside 0-100/);
});

test('parseAndValidateAIResponse - end-to-end markdown fenced valid response', () => {
  const fenced = `\`\`\`json\n${JSON.stringify(validSample)}\n\`\`\``;
  const result = parseAndValidateAIResponse(fenced);
  assert.strictEqual(result.breed, 'Golden Retriever');
  assert.strictEqual(result.stats[0].value, 95);
});
