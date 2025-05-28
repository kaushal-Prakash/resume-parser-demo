import fs from 'fs';
import PdfParse from 'pdf-parse';

const parseResume = async (req,res) => {
    try {
        const pdf = req.file.path;
        const dataBuffer = fs.readFileSync(pdf);

        const data = await PdfParse(dataBuffer);
        console.log(data);
    } catch (error) {
        console.error("Error parsing resume:", error);
        res.status(500).json({ error: "Failed to parse resume" });
    }
}

export {
    parseResume
}