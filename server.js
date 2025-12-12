/* eslint-disable @typescript-eslint/no-var-requires */
// server.js — tuotantopalvelin Next.js:lle cPanelia varten
console.log("🚀 server.js käynnistyi!");
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = false;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      handle(req, res);
    } catch (err) {
      console.error("Server error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, () => {
    console.log("🚀 Next.js server running on port " + port);
  });
});
