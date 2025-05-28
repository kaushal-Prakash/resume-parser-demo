import fs from "fs/promises";
import PDFParser from "pdf2json";

const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const pdfPath = req.file.path;

  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const pdfParser = new PDFParser();

    const parsedData = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", (parsedData) => {
        resolve(parsedData);
      });
      
      pdfParser.on("pdfParser_dataError", (error) => {
        reject(new Error(`PDF parsing error: ${error}`));
      });
      
      pdfParser.parseBuffer(dataBuffer);
    });

    if (!parsedData?.Pages || !Array.isArray(parsedData.Pages)) {
      throw new Error("No pages found in PDF");
    }

    // Simple text extraction with basic formatting
    let resultText = "";
    
    for (const page of parsedData.Pages) {
      let pageText = "";
      let lastY = 0;
      
      // Sort text elements by vertical position
      const sortedTexts = page.Texts
        .map(textObj => ({
          text: decodeURIComponent(textObj.R.map(r => r.T).join("")),
          y: textObj.y
        }))
        .sort((a, b) => a.y - b.y);

      for (const textObj of sortedTexts) {
        // Add newline when we detect a significant vertical move
        if (textObj.y - lastY > 5) { // Adjust this threshold as needed
          pageText += "\n";
        }
        pageText += textObj.text + " ";
        lastY = textObj.y;
      }
      
      resultText += pageText + "\n\n"; // Separate pages with double newline
    }

    // Basic cleanup
    resultText = resultText
      .replace(/\s+/g, " ")       // Collapse multiple spaces
      .replace(/\n /g, "\n")      // Remove spaces after newlines
      .replace(/ \n/g, "\n")      // Remove spaces before newlines
      .replace(/(\n){3,}/g, "\n\n") // Limit consecutive newlines
      .trim();

    return res.status(200).json({ text: resultText });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return res.status(500).json({
      error: "Failed to parse resume",
      details: error.message,
    });
  } finally {
    try {
      await fs.unlink(pdfPath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
  }
};

export { parseResume };