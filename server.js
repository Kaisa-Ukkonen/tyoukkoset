/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const { parse } = require("url");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 3000;
const app = next({ dev: false }); // production
const handle = app.getRequestHandler();

/**
 * 🍪 Parsitaan cookiet käsin
 */
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift().trim();
    const value = decodeURIComponent(parts.join("="));
    list[key] = value;
  });

  return list;
}

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const pathname = parsedUrl.pathname || "";

      // 🔐 ADMIN-SUOJAUS
      if (pathname.startsWith("/admin")) {
        // Sallitaan login-sivu ja login API ilman tokenia
        if (
          pathname === "/admin/login" ||
          pathname.startsWith("/api/login")
        ) {
          return handle(req, res, parsedUrl);
        }

        const cookies = parseCookies(req);
        const token = cookies.admin_token;

        if (!token) {
          res.statusCode = 302;
          res.setHeader("Location", "/admin/login");
          return res.end();
        }

        try {
          jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          res.statusCode = 302;
          res.setHeader("Location", "/admin/login");
          return res.end();
        }
      }

      // Kaikki muut pyynnöt Next.js:lle
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("server error", err);
      res.statusCode = 500;
      res.end("internal error");
    }
  }).listen(port, () => {
    console.log("🚀 Production server running on port " + port);
  });
});
