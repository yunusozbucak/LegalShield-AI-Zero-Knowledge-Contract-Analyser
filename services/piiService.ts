
/**
 * PII (Personally Identifiable Information) Masking Service
 * Uses Regex patterns to detect and redact sensitive data before API transmission.
 */

export const maskPII = (text: string): { maskedText: string; piiMap: Map<string, string> } => {
  const piiMap = new Map<string, string>();
  let maskedText = text;
  let counter = 0;

  // Helper to replace and store mapping
  const replaceAndStore = (regex: RegExp, type: string) => {
    maskedText = maskedText.replace(regex, (match) => {
      // Avoid re-masking already masked items or overlapping matches if regex isn't perfect
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

  // 2. TCKN (11 digits) & Phone Numbers
  // Generic ID (11 digits)
  replaceAndStore(/\b\d{11}\b/g, 'ID');
  // Phone (+90 5XX... or 05XX... or international)
  replaceAndStore(
    /(?:\+90|0)?\s*[5]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g, 
    'PHONE'
  );

  // 3. Monetary Values (e.g., 150.000 USD, 100 TL, $500)
  replaceAndStore(
    /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s*(?:USD|TL|TRY|EUR|EURO|DOLAR|LİRA|£|\$|€)\b/gi, 
    'MONEY'
  );

  // 4. Dates (DD.MM.YYYY or DD/MM/YYYY)
  replaceAndStore(
    /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, 
    'DATE'
  );

  // 5. Corporate Entities (Inc, LLC, FZ-LLC, A.Ş. etc.) - Run BEFORE generic names
  replaceAndStore(
    /\b(?:[A-ZÀ-ÿ][a-zÀ-ÿ0-9&]+\s+){0,3}[A-ZÀ-ÿ][a-zÀ-ÿ0-9&]+\s*(?:Inc\.|LLC|FZ-LLC|Ltd\.|Corp\.|GmbH|Co\.|A\.Ş\.|Ltd\.\s*Şti\.|Tic\.\s*A\.Ş\.|Limited|Şirketi|Holding)\b/g,
    'ENTITY'
  );

  // 6. Names (Heuristic: Two Capitalized Words)
  // Targeting "Name Surname" style patterns.
  replaceAndStore(
    /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}\b/g, 
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
