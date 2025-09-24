import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// 他オリジンからのアクセスを許可
app.use(cors());

// 外部URL取得用プロキシ
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URLが必要です");

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");
    res.set("Content-Type", contentType);

    if (contentType && contentType.includes("text/html")) {
      let html = await response.text();

      // HTML内のリンク・画像・CSS・JSを書き換え
      html = html.replace(/(href|src)=["'](http[^"']+)["']/g,
        (m, attr, url) => `${attr}="/proxy?url=${encodeURIComponent(url)}"`);

      // CSS内のurl()も書き換え
      html = html.replace(/url\((http[^)]+)\)/g,
        (m, url) => `url(/proxy?url=${encodeURIComponent(url)})`);

      res.send(html);
    } else {
      // 画像やCSSなどバイナリデータも返す
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(500).send("取得失敗: " + err);
  }
});

app.listen(PORT, () => {
  console.log(`プロキシサーバー起動: http://localhost:${PORT}/proxy?url=https://example.com`);
});
