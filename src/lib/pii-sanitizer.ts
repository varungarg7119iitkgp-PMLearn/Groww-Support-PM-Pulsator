const PII_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // Email addresses
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[REDACTED_EMAIL]",
  },

  // Aadhaar numbers (12 digits, optionally grouped as 4-4-4)
  {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: "[REDACTED_AADHAAR]",
  },

  // PAN numbers (Indian: ABCPD1234E format)
  {
    pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: "[REDACTED_PAN]",
  },

  // Indian phone numbers (+91, 0-prefixed, 10-digit)
  {
    pattern:
      /(?:\+91[\s-]?|0)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/g,
    replacement: "[REDACTED_PHONE]",
  },

  // International phone numbers (+ country code)
  {
    pattern: /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{2,4}[\s-]?\d{2,4}[\s-]?\d{0,4}/g,
    replacement: "[REDACTED_PHONE]",
  },
];

export function sanitizePII(text: string): string {
  let sanitized = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

export function containsPII(text: string): boolean {
  return PII_PATTERNS.some(({ pattern }) => {
    const fresh = new RegExp(pattern.source, pattern.flags);
    return fresh.test(text);
  });
}
