const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const G2BULK_API_KEY = process.env.G2BULK_API_KEY;
const G2BULK_API = "https://api.g2bulk.com/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


// ================================
// G2BULK API REQUEST
// ================================

async function g2bulk(endpoint, options = {}) {

  if (!G2BULK_API_KEY) {
    throw new Error(
      "G2BULK_API_KEY Render Environment'da topilmadi."
    );
  }

  const response = await fetch(
    G2BULK_API + endpoint,
    {
      ...options,
      headers: {
        "X-API-Key": G2BULK_API_KEY,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    data = {
      error: text
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      "G2Bulk API xatosi: HTTP " + response.status
    );
  }

  return data;
}


// ================================
// HOME
// ================================

app.get("/", function (req, res) {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});


// ================================
// ADMIN
// ================================

app.get("/admin", function (req, res) {

  res.sendFile(
    path.join(__dirname, "admin.html")
  );

});


// ================================
// STATUS
// ================================

app.get("/api/status", async function (req, res) {

  try {

    const data = await g2bulk("/getMe");

    res.json({
      ok: true,
      message: "UC SERVIS + G2Bulk API ishlayapti",
      account: data
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ================================
// BALANCE
// ================================

app.get("/api/balance", async function (req, res) {

  try {

    const data = await g2bulk("/getMe");

    res.json({
      ok: true,
      balance: data.balance || 0,
      account: data
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ================================
// GAMES
// ================================

app.get("/api/games", async function (req, res) {

  try {

    const data = await g2bulk("/games");

    res.json({
      ok: true,
      games: data.games || data
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ================================
// PUBG CATALOG
// ================================

app.get("/api/pubg/offers", async function (req, res) {

  try {

    const data = await g2bulk(
      "/games/pubgm/catalogue"
    );

    const offers =
      data.catalogues ||
      data.offers ||
      data.products ||
      [];

    res.json({
      ok: true,
      offers: offers
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ================================
// PUBG ID VALIDATION
// ================================

app.post("/api/pubg/validate", async function (req, res) {

  try {

    const playerId =
      String(req.body.player_id || "").trim();

    if (!playerId) {

      return res.status(400).json({
        ok: false,
        error: "PUBG ID kiriting."
      });

    }

    const data = await g2bulk(
      "/games/checkPlayerId",
      {
        method: "POST",

        body: JSON.stringify({
          game: "pubgm",
          user_id: playerId
        })
      }
    );

    res.json({
      ok: true,
      valid: data.valid !== false,
      player_name:
        data.name ||
        data.player_name ||
        null,
      data: data
    });

  } catch (error) {

    res.status(400).json({
      ok: false,
      error: error.message
    });

  }

});


// ================================
// TEST ORDER
// ================================

app.post("/api/order", async function (req, res) {

  return res.status(403).json({
    ok: false,
    error:
      "Real UC buyurtmasi hozircha o'chirilgan. Avval G2Bulk API katalogi va to'lov tizimini tekshiramiz."
  });

});


// ================================
// HEALTH CHECK
// ================================

app.get("/health", function (req, res) {

  res.json({
    ok: true,
    service: "UC SERVIS",
    server: "online"
  });

});


// ================================
// SERVER
// ================================

app.listen(
  PORT,
  "0.0.0.0",
  function () {

    console.log(
      "UC SERVIS server ishga tushdi: " + PORT
    );

  }
);
