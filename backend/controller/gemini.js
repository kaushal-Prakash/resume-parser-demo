// In gimini.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const prompt = `
You're a document parser for resumes. Extract structured information from the attached PDF.

📌 Specific Instructions:
- Scan the entire resume for links (even at the bottom of the document).
- Identify and assign social/contact links based on these rules:
  - "linkedin.com" → linkedin
  - "github.com" → github
  - "vercel.app", "netlify.app" → portfolio
  - "leetcode.com" → leetcode
- Populate both 'socialLinks' and 'contact' accordingly.
- Return ONLY a stringified JSON object. No extra text.
- Also give a formatted content in each fielg. (example: "helloiamuser" should be "Hello I am User")

JSON structure:
{
  "firstname": "",
  "lastname": "",
  "about": "",
  "title": "",
  "yearOfExperience": 0,
  "education": [],
  "experience": [],
  "skills": [],
  "socialLinks": [
    { "name": "Linkedin", "url": "" },
    { "name": "Github", "url": "" },
    { "name": "Leetcode", "url": "" },
    { "name": "Portfolio", "url": "" }
  ],
  "contact": {
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "leetcode": ""
  }
}
`;

const getJson = async (req, res) => {
  try {
    const text = req.body.text;
    const ai = new GoogleGenAI({ apiKey: process.env.GMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${text} \n\n${prompt}`,
    });

    const textResponse = response.text;
    let jsonResponse = textResponse.replace(/```json|```/g, "").trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonResponse);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      console.error("Raw AI Response:", jsonResponse);
      return res
        .status(400)
        .json({
          error: "Invalid JSON format from AI",
          details: jsonError.message,
          aiResponse: jsonResponse,
        });
    }
    return res.status(200).json(parsedJson);
  } catch (error) {
    console.error("Error in getJson:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export { getJson };
