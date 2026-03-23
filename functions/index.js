const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const fetch = require("node-fetch");

// Claude API 프록시
exports.claudeProxy = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { model, max_tokens, messages } = req.body;
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: { message: "API key not configured" } });
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens,
          messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: { message: error.message } });
    }
  });
});
