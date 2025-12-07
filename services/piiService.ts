
/**
 * PII (Personally Identifiable Information) Masking Service
 * Uses Regex patterns to detect and redact sensitive data before API transmission.
 * Refactored to use strictly ASCII-safe Unicode Escape Sequences to prevent Vercel build/encoding errors.
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
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 
    'EMAIL'
  );

  // 2. ID (11 digits) & Phone Numbers
  replaceAndStore(/\b\d{11}\b/g, 'ID');
  
  // Phone (+90 5XX... or 05XX... or international)
  replaceAndStore(
    /(?:\+90|0)?\s*[5]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g, 
    'PHONE'
  );

  // 3. Monetary Values
  // Matches: 150.000 USD, 100 TL, $500, etc.
  // Using Unicode escapes to avoid encoding issues:
  // \u00A3 = Pound
  // \u20AC = Euro
  // \u0130 = Capital I with dot (for LIRA)
  // \u0024 = Dollar ($)
  const moneyPattern = "\\b\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d+)?\\s*(?:USD|TL|TRY|EUR|EURO|DOLAR|L\\u0130RA|\\u00A3|\\u0024|\\u20AC)\\b";
  replaceAndStore(new RegExp(moneyPattern, 'gi'), 'MONEY');

  // 4. Dates (DD.MM.YYYY or DD/MM/YYYY)
  replaceAndStore(
    /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, 
    'DATE'
  );

  // 5. Corporate Entities (Inc, LLC, FZ-LLC, A.Ş. etc.)
  // We use ranges to cover accented characters safely without literal UTF-8 chars in source.
  // \u00C0-\u00FF : Standard Latin-1 Supplement (covers many western accents: Ç, Ö, Ü, etc.)
  // \u015E : S with cedilla (Ş)
  // \u015F : s with cedilla (ş)
  // \u011E : G with breve (Ğ)
  // \u011F : g with breve (ğ)
  // \u0130 : I with dot (İ)
  // \u0131 : i without dot (ı)
  
  const extendedChars = "\\u00C0-\\u00FF\\u015E\\u015F\\u011E\\u011F\\u0130\\u0131";
  const alpha = `A-Za-z${extendedChars}0-9&`;
  
  const suffixes = [
    "Inc\\.", "LLC", "FZ-LLC", "Ltd\\.", "Corp\\.", "GmbH", "Co\\.",
    "A\\.\\u015E\\.", "Ltd\\.\\s*\\u015Eti\\.", "Tic\\.\\s*A\\.\\u015E\\.",
    "Limited", "\\u015Eirketi", "Holding"
  ].join("|");

  // Regex: (Word+Space)*3 + Word + Suffix
  const entityPattern = `\\b(?:[${alpha}]+\\s+){0,3}[${alpha}]+\\s*(?:${suffixes})\\b`;
  replaceAndStore(new RegExp(entityPattern, 'g'), 'ENTITY');

  // 6. Names (Heuristic: Two Capitalized Words)
  // Targeting "Name Surname" style patterns.
  
  // Upper case extended: A-Z + \u00C0-\u00D6 (A-O) + \u00D8-\u00DE (O-Thorn) + Turkish Upper (Ş, Ğ, İ, Ö, Ü, Ç is in Latin-1)
  const upper = `A-Z\\u00C0-\\u00D6\\u00D8-\\u00DE\\u015E\\u011E\\u0130`;
  
  // Lower case extended: a-z + \u00DF-\u00F6 + \u00F8-\u00FF + Turkish Lower (ş, ğ, ı, ö, ü, ç)
  const lower = `a-z\\u00DF-\\u00F6\\u00F8-\\u00FF\\u015F\\u011F\\u0131`;
  
  const namePattern = `\\b[${upper}][${lower}]{2,}\\s+[${upper}][${lower}]{2,}\\b`;
  replaceAndStore(new RegExp(namePattern, 'g'), 'PERSON');

  return { maskedText, piiMap };
};

export const unmaskPII = (obj: any, piiMap: Map<string, string>): any => {
  if (!obj) return obj;
  
  // Convert JSON object to string to perform global replacement
  let jsonString = JSON.stringify(obj);

  // Iterate over the map and restore original values
  piiMap.forEach((originalValue, placeholder) => {
    // Escape the original value to ensure it doesn't break the JSON structure
    // We slice(1, -1) to remove the quotes added by stringify
    const safeValue = JSON.stringify(originalValue).slice(1, -1);

    // Replace all occurrences using split/join for global replacement capability without regex special char issues
    jsonString = jsonString.split(placeholder).join(safeValue);
  });

  // Parse back to object
  return JSON.parse(jsonString);
};
