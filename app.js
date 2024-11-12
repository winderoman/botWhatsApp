
require("dotenv").config()
const { createBot, createProvider, addKeyword, EVENTS, createFlow } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
// const MongoAdapter = require('@bot-whatsapp/database/mongo')
const menuOptions = require("./constant/menuOptions");
const sendMessage = require('./Gemini');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const flowStart = addKeyword(EVENTS.WELCOME).addAnswer(menuOptions).addAction({ capture: true }, async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
    if (!["1", "2"].includes(ctx.body))
        return fallBack("Respuesta no válida, por favor selecciona una de las opciones.");

    if (ctx.body == "2") {
        return await flowDynamic("¡Hasta luego! Espero haberte sido de ayuda.")
    } else {
        return gotoFlow(flowAI)
    }
})

const flowAI = addKeyword(EVENTS.ACTION).addAnswer('¡Hola! en que puedo ayudarte?', { capture: true }, async (ctx, ctxFn) => {
    let response = await sendMessage(ctx.body)
    await ctxFn.flowDynamic(response)
    return ctxFn.gotoFlow(flowStart)
});

const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAnswer("", null, async (ctx, ctxFn) => {
   try {
        const buffer = await downloadMediaMessage(ctx, "buffer");
        const bufferBase64 = buffer.toString("base64");
        const response = await sendMessage.voiceToText(bufferBase64);
        await ctxFn.flowDynamic(response);
    } catch (error) {
        console.error("Error al procesar el mensaje de voz:", error);
    }

    
});


const main = async () => {
    // const adapterDB = new MongoAdapter({
    //     dbUri: process.env.DB_URI_MONGO,
    //     dbName: "chatDB",
    // })

    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowStart, flowAI, flowVoiceNote]);
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
