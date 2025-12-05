const { ragText } = require("../text/rag_text");
const { ragImage } = require("../image/rag_image");

async function ragHybrid(db, question) {
    const text = await ragText(db, question);
    const images = await ragImage(db, question);

    const context = `
=== CONTEXTO TEXTO ===
${text.context}

=== CONTEXTO IMAGENES ===
${images.context}
`;

    return {
        results: [...text.results, ...images.results],
        context
    };
}

module.exports = { ragHybrid };
