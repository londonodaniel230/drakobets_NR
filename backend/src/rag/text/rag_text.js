const { embedText } = require("../utils/embeddings");

async function ragText(db, question) {
    const col = db.collection("chunks_dinamico");

    const vector = await embedText(question);

    const pipeline = [
        {
            $search: {
                index: "vector_index_text",
                knnBeta: {
                    path: "embedding",
                    vector,
                    k: 5
                }
            }
        },
        {
            $project: {
                contenido: 1,
                source: 1,
                _score: { $meta: "searchScore" }
            }
        }
    ];

    const results = await col.aggregate(pipeline).toArray();
    const context = results.map(r => r.contenido).join("\n\n");

    return { results, context };
}

module.exports = { ragText };
