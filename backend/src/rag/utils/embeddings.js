import axios from "axios";
import { EMBEDDINGS_API } from "../../config/env.js";

export async function embedText(text) {
    const res = await axios.post(`${EMBEDDINGS_API}/text`, { text });
    return res.data.embedding;
}

export async function embedImage(base64) {
    const res = await axios.post(`${EMBEDDINGS_API}/image`, { image: base64 });
    return res.data.embedding;
}

export async function embedTextCLIP(text) {
  const res = await axios.post(`${EMBEDDINGS_API}/text-clip`, { text });
  return res.data.embedding;
}