const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({path: '../.env'});
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSmartReplies(incomingMessage) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Generate 3 short, conversational, and natural replies to the following message. 
    Strictly format the output as a JSON array of strings. Do not include markdown formatting.
    Message: "${incomingMessage}"`;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    console.log("Raw API Output:", text);
    console.log("Parsed JSON:", JSON.parse(text));
  } catch (err) {
    console.error("Error generating smart replies:", err.message);
  }
}

generateSmartReplies("hello are you there");
