
require("dotenv").config();
const promptInstructions = require("./constant/InstructionsAI");
let genAIInstance;
async function main() {
  if (!genAIInstance) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  const model = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: promptInstructions });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hola" }],
      },
      {
        role: "model",
        parts: [{ text: "¡Hola! Bienvenido a Restaurante El Sabor! ¿En qué puedo ayudarte hoy?" }],
      },
    ],
  });

  return { chat, model }
}

const voiceToText = async (base64AudioFile) => {
  let { model } = await main()
  const voiceResult = await model.generateContent([
    {
      inlineData: {
        mimeType: "audio/ogg",
        data: base64AudioFile
      }
    },
  ]);
  return voiceResult.response.text();
}

async function sendMessage(message) {
  let { chat } = await main()
  let result = await chat.sendMessage(message);
  return result.response.text();
}

sendMessage.voiceToText = voiceToText;
module.exports = sendMessage;
