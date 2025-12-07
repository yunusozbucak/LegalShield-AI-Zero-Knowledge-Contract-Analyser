
/**
 * PII (Personally Identifiable Information) Masking Service
 * Uses Regex patterns to detect and redact sensitive data before API transmission.
 * Refactored to use STRICT REGEX LITERALS to prevent runtime "new RegExp" parsing errors and White Screen crashes.
 */

export const maskPII = (text: string): { maskedText: string; piiMap: Map<string, string> } => {
  const piiMap = new Map<string, string>();
  let maskedText = text;
  let counter = 0;

  // Helper to replace and store mapping
  const replaceAndStore = (regex: RegExp, type: string) => {
    maskedText = maskedText.replace(regex, (match) => {
      // Avoid re-masking already masked items or overlapping matches
      if (match.startsWith('[REDACTED_')) return match;
      
      counter++;
      const placeholder = `[REDACTED_${type}_${counter}]`;
      piiMap.set(placeholder, match);
      return placeholder;
    });
  };

  // 1. Email Addresses
  replaceAndStore(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, 
    'EMAIL'
  );

  // 2. ID (11 digits)
  replaceAndStore(
    /\b\d{11}\b/g,
    'ID'
  );
  
  // Phone (+90 5XX... or 05XX... or international)
  replaceAndStore(
    /(?:\+90|0)?\s*[5]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g, 
    'PHONE'
  );

  // 3. Monetary Values
  // Matches: 150.000 USD, 100 TL, $500, etc.
  // Using Unicode escapes in literal: \u00A3(£), \u20AC(€), \u0130(İ), \u0024($)
  replaceAndStore(
    /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s*(?:USD|TL|TRY|EUR|EURO|DOLAR|L\u0130RA|\u00A3|\u0024|\u20AC)\b/gi,
    'MONEY'
  );

  // 4. Dates (DD.MM.YYYY or DD/MM/YYYY)
  replaceAndStore(
    /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g,
    'DATE'
  );

  // 5. Corporate Entities (Inc, LLC, FZ-LLC, A.Ş. etc.)
  // We use ranges to cover accented characters safely.
  // \u00C0-\u00FF covers standard western accents (Ç, Ö, Ü, etc.)
  // \u015E(Ş), \u015F(ş), \u011E(Ğ), \u011F(ğ), \u0130(İ), \u0131(ı)
  
  // Expanded Regex Literal for Entity Detection
  // Pattern: (Word+Space up to 3 times) + Word + Suffix
  replaceAndStore(
    /\b(?:[A-Za-z\u00C0-\u00FF\u015E\u015F\u011E\u011F\u0130\u01310-9&]+\s+){0,3}[A-Za-z\u00C0-\u00FF\u015E\u015F\u011E\u011F\u0130\u01310-9&]+\s*(?:Inc\.|LLC|FZ-LLC|Ltd\.|Corp\.|GmbH|Co\.|A\.\u015E\.|Ltd\.\s*\u015Eti\.|Tic\.\s*A\.\u015E\.|Limited|\u015Eirketi|Holding)\b/g,
    'ENTITY'
  );

  // 6. Names (Heuristic: Two Capitalized Words)
  // Targeting "Name Surname" style patterns.
  // Upper: A-Z + Western Accents (\u00C0-\u00D6\u00D8-\u00DE) + Turkish Upper (\u015E\u011E\u0130)
  // Lower: a-z + Western Accents (\u00DF-\u00F6\u00F8-\u00FF) + Turkish Lower (\u015F\u011F\u0131)
  replaceAndStore(
    /\b[A-Z\u00C0-\u00D6\u00D8-\u00DE\u015E\u011E\u0130][a-z\u00DF-\u00F6\u00F8-\u00FF\u015F\u011F\u0131]{2,}\s+[A-Z\u00C0-\u00D6\u00D8-\u00DE\u015E\u011E\u0130][a-z\u00DF-\u00F6\u00F8-\u00FF\u015F\u011F\u0131]{2,}\b/g, 
    'PERSON'
  );

  return { maskedText, piiMap };
};

export const unmaskPII = (obj: any, piiMap: Map<string, string>): any => {
  if (!obj) return obj;
  
  // Convert JSON object to string to perform global replacement
  let jsonString = JSON.stringify(obj);

  // Iterate over the map and restore original values
  piiMap.forEach((originalValue, placeholder) => {
    // Escape the original value to ensure it doesn't break the JSON structure
    const safeValue = JSON.stringify(originalValue).slice(1, -1);

    // Replace all occurrences using split/join
    jsonString = jsonString.split(placeholder).join(safeValue);
  });

  // Parse back to object
  return JSON.parse(jsonString);
};
