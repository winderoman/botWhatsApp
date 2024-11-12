
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
  try {
    let { model } = await main();
    const voiceResult = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/ogg",
          data: base64AudioFile,
        },
      },
    ]);
    return voiceResult.response.text();
  } catch (error) {
    console.error("Error en voiceToText:", error);
    throw new Error("No se pudo convertir el audio a texto.");
  }
}

async function sendMessage(message) {
  try {
    let { chat } = await main();
    let result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Error en sendMessage:", error);
    throw new Error("Error al enviar el mensaje.");
  }
}

sendMessage.voiceToText = voiceToText;
module.exports = sendMessage;
