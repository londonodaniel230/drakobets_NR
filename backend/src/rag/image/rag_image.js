const { embedText, embedImage } = require("../utils/embeddings");

async function ragImage(db, input) {
    const col = db.collection("media");

    const vector =
        typeof input === "string"
            ? await embedText(input)
            : await embedImage(input);

    const pipeline = [
        {
            $search: {
                index: "vector_index_images",
                knnBeta: {
                    path: "image_embedding",
                    vector,
                    k: 5
                }
            }
        },
        {
            $project: {
                title: 1,
                url: 1,
                caption: 1,
                _score: { $meta: "searchScore" }
            }
        }
    ];

    const results = await col.aggregate(pipeline).toArray();

    const context = results
        .map(r => `Imagen: ${r.title}\nDescripción: ${r.caption}`)
        .join("\n\n");

    return { results, context };
}

module.exports = { ragImage };
