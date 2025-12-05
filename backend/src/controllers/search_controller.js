const { connectDB } = require("../config/db");
const { ragText } = require("../rag/text/rag_text");
const { ragImage } = require("../rag/image/rag_image");

exports.search = async (req, res) => {
    const { type, query, imageBase64 } = req.body;

    const db = await connectDB();

    if (type === "t2t") return res.json(await ragText(db, query));
    if (type === "t2i") return res.json(await ragImage(db, query));
    if (type === "i2i") return res.json(await ragImage(db, imageBase64));
    if (type === "i2t") return res.json(await ragText(db, imageBase64));

    return res.status(400).json({ error: "Tipo inválido" });
};
