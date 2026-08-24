const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const G2BULK_API_KEY = process.env.G2BULK_API_KEY;
const G2BULK_API = "https://api.g2bulk.com/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


// ==================================================
// G2BULK REQUEST
// ==================================================

async function g2Request(endpoint, options = {}) {

  if (!G2BULK_API_KEY) {
    throw new Error(
      "G2BULK_API_KEY Render Environment'da topilmadi."
    );
  }

  const response = await fetch(
    `${G2BULK_API}${endpoint}`,
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
  } catch {
    data = {
      success: false,
      error: text || "Noma'lum javob"
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `G2Bulk HTTP ${response.status}`
    );
  }

  if (data.success === false) {
    throw new Error(
      data.message ||
      data.error ||
      "G2Bulk xatosi"
    );
  }

  return data;
}


// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});


// ==================================================
// ADMIN
// ==================================================

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(__dirname, "admin.html")
  );
});


// ==================================================
// API STATUS
// ==================================================

app.get("/api/status", async (req, res) => {

  try {

    const data =
      await g2Request("/getMe");

    res.json({
      ok: true,
      message: "UC SERVIS + G2Bulk API ishlayapti",
      account: {
        user_id: data.user_id,
        username: data.username,
        first_name: data.first_name,
        balance: data.balance
      }
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ==================================================
// G2BULK BALANCE
// ==================================================

app.get("/api/balance", async (req, res) => {

  try {

    const data =
      await g2Request("/getMe");

    res.json({
      ok: true,
      balance: data.balance,
      currency: "USD"
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ==================================================
// PUBG GAMES
// ==================================================

app.get("/api/pubg/games", async (req, res) => {

  try {

    const data =
      await g2Request("/games");

    const games =
      Array.isArray(data.games)
        ? data.games
        : [];

    const pubg =
      games.find(game =>
        String(game.code)
          .toLowerCase()
          .includes("pubg")
      );

    res.json({
      ok: true,
      pubg: pubg || null,
      games
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


// ==================================================
// PUBG CATALOG
// ==================================================

app.get("/api/pubg/offers", async (req, res) => {

  try {

    /*
      G2Bulk hujjatida PUBG Mobile uchun
      catalogue game code sifatida pubgm ko'rsatilgan.
    */

    const data =
      await g2Request(
        "/games/pubgm/catalogue",
        {
          method: "GET"
        }
      );

    const catalogues =
      Array.isArray(data.catalogues)
        ? data.catalogues
        : [];

    res.json({
      ok: true,
      game: data.game || null,
      offers: catalogues
    });

  } catch (error) {

    res.status(
