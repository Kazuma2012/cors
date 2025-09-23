import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// プロキシエンドポイント
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing url parameter");

  try {
    const r = await fetch(target);
    const text = await r.text();

    // CORS許可
    res.set("Access-Control-Allow-Origin", "*");
    res.send(text);
  } catch (err) {
    res.status(500).send("Fetch error: " + err);
  }
});

// Renderが自動でPORTを割り当てる
app.listen(PORT, () =>
  console.log(`✅ Proxy running on port ${PORT}`)
);
