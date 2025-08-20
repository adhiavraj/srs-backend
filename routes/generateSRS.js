import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import PDFDocument from "pdfkit";

const router = express.Router();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

router.post("/", async (req, res) => {
  const { cover, introduction, generalDescription, specificRequirements } = req.body;

  try {
    // 🔹 Ask AI to generate structured SRS text
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: "You are an expert in writing structured Software Requirement Specifications (SRS). Format output cleanly.",
        },
        {
          role: "user",
          content: `
            Generate a detailed Software Requirement Specification document.

            Cover: ${cover}
            Introduction: ${introduction}
            General Description: ${generalDescription}
            Specific Requirements: ${specificRequirements}
          `,
        },
      ],
    });

    console.log("Incoming body:", req.body);
    console.log("Using API key:", process.env.OPENROUTER_API_KEY ? "✅ Present" : "❌ Missing");

    const srsText = completion.choices[0].message.content || "No SRS generated.";

    if(srsText) {
      console.log('SRS Text Generated from the Ai Model');
    } else {
      console.log("Failed to generate the Srs Text from Ai Model")
    }

    // 🔹 Generate PDF from AI response
    const doc = new PDFDocument({ margin: 50 });
    let chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="srs.pdf"',
        "Content-Length": pdfBuffer.length,
      });
      res.send(pdfBuffer);
    });

    // 🔹 Build the PDF
    doc.fontSize(18).text("Software Requirements Specification (SRS)", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Cover", { underline: true });
    doc.fontSize(12).text(cover || "N/A");
    doc.moveDown();

    doc.fontSize(14).text("Introduction", { underline: true });
    doc.fontSize(12).text(introduction || "N/A");
    doc.moveDown();

    doc.fontSize(14).text("General Description", { underline: true });
    doc.fontSize(12).text(generalDescription || "N/A");
    doc.moveDown();

    doc.fontSize(14).text("Specific Requirements", { underline: true });
    doc.fontSize(12).text(specificRequirements || "N/A");
    doc.moveDown();

    // 🔹 Append AI-generated formatted text at the end
    doc.addPage();
    doc.fontSize(14).text("AI-Generated Structured SRS", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(srsText, { align: "left" });

    doc.end();

  } catch (aiErr) {
    console.error("AI generation failed:", aiErr.response?.data || aiErr.message);
    return res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
