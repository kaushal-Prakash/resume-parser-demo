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

    // Improved text extraction with better formatting
    const formattedText = parsedData.Pages.map(page => {
      // Sort text elements by their vertical position (y-coordinate)
      const sortedTexts = page.Texts
        .map(textObj => ({
          text: decodeURIComponent(textObj.R.map(r => r.T).join("")),
          y: textObj.y,
          x: textObj.x
        }))
        .sort((a, b) => a.y - b.y || a.x - b.x);

      // Group text by lines based on y-position
      let currentY = null;
      let currentLine = [];
      const lines = [];

      for (const textObj of sortedTexts) {
        if (currentY === null || Math.abs(textObj.y - currentY) < 1) {
          // Same line
          currentLine.push(textObj.text);
        } else {
          // New line
          if (currentLine.length > 0) {
            lines.push(currentLine.join(" "));
          }
          currentLine = [textObj.text];
        }
        currentY = textObj.y;
      }

      // Add the last line
      if (currentLine.length > 0) {
        lines.push(currentLine.join(" "));
      }

      return lines.join("\n");
    }).join("\n\n"); // Separate pages with double newlines

    // Clean up the text
    const cleanedText = formattedText
      .replace(/\s+/g, " ") // Normalize spaces
      .replace(/(\n\s*){2,}/g, "\n\n") // Normalize line breaks
      .trim();

    console.log("Extracted text:\n", cleanedText);

    return res.status(200).json({ text: cleanedText });
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