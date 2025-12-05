const axios = require("axios");
const { EMBEDDINGS_API } = require("../../config/env");

async function embedText(text) {
    const res = await axios.post(`${EMBEDDINGS_API}/text`, { text });
    return res.data.embedding;
}

async function embedImage(base64) {
    const res = await axios.post(`${EMBEDDINGS_API}/image`, { image: base64 });
    return res.data.embedding;
}

module.exports = { embedText, embedImage };
