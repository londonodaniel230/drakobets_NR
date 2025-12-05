const Groq = require("groq-sdk");
const { GROQ_API_KEY } = require("../../config/env");

const client = new Groq({ apiKey: GROQ_API_KEY });

async function askLLM(context, question) {
    const prompt = `
Eres un asistente experto en deportes y apuestas.
Usa solamente el CONTEXTO para responder.

CONTEXTO:
${context}

PREGUNTA:
${question}
`;

    const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
}

module.exports = { askLLM };
