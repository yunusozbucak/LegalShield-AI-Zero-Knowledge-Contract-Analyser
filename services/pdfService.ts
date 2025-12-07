/**
 * Extracts text from a PDF file using pdf.js
 * Note: This runs purely in the browser to avoid server upload of sensitive files for parsing.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        
        // window.pdfjsLib is loaded via CDN in index.html
        if (!window.pdfjsLib) {
          reject(new Error("PDF parsing library not loaded"));
          return;
        }

        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        // Iterate over all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Combine text items, adding spaces for readability
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + "\n\n";
        }

        resolve(fullText);
      } catch (error) {
        console.error("PDF Parsing Error:", error);
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};