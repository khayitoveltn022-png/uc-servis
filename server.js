const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const G2BULK_API_KEY = process.env.G2BULK_API_KEY;
const G2BULK_API = "https://api.g2bulk.com/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// STATIC FILES
// ===============================
app.use(express.static(__dirname));

// ===============================
// G2BULK REQUEST
// ===============================
async function g2bulkRequest(endpoint, options = {}) {
  if (!G2BULK_API_KEY) {
    throw new Error("G2BULK_API_KEY Render Environment'da topilmadi.");
  }

  const response = await fetch(`${G2BULK_API}${endpoint}`, {
    ...options,
    headers: {
      "X-API-Key": G2BULK_API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      success: false,
      error: text || "Noma'lum G2Bulk javobi"
    };
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
      data.error ||
      `G2Bulk HTTP ${response.status}`
    );
  }

  return data;
}

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===============================
// ADMIN
// ===============================
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ===============================
// G2BULK STATUS
// ===============================
app.get("/api/status", async (req, res) => {
  try {
    const data = await g2bulkRequest("/getMe");

    res.json({
      ok: true,
      message: "UC SERVIS + G2Bulk API ishlayapti",
      account: {
        user_id: data.user_id,
        username: data.username,
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

// ===============================
// G2BULK BALANCE
// ===============================
app.get("/api/balance", async (req, res) => {
  try {
    const data = await g2bulkRequest("/getMe");

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

// ===============================
// PUBG MOBILE GAMES
// ===============================
app.get("/api/pubg/game", async (req, res) => {
  try {
    const data = await g2bulkRequest("/games");

    const games = Array.isArray(data.games)
      ? data.games
      : [];

    const pubg = games.find(game =>
      String(game.code || "")
        .toLowerCase()
        .includes("pubg")
    );

    if (!pubg) {
      return res.status(404).json({
        ok: false,
        error: "PUBG Mobile G2Bulk katalogida topilmadi.",
        games
      });
    }

    res.json({
      ok: true,
      game: pubg
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// PUBG CATALOG
// ===============================
// Mijozga faqat sotuv narxi qaytariladi.
// G2Bulk tannarxi qaytarilmaydi.
// ===============================
app.get("/api/pubg/offers", async (req, res) => {
  try {
    const data = await g2bulkRequest("/games/pubgm/catalogue");

    const catalogues = Array.isArray(data.catalogues)
      ? data.catalogues
      : [];

    // UC SERVIS SOTUV NARXLARI
    const sellPrices = {
      "60 UC": 12000,
      "325 UC": 65000,
      "660 UC": 125000,
      "985 UC": 190000,
      "1320 UC": 250000,
      "1800 UC": 330000,
      "2460 UC": 450000,
      "3850 UC": 690000,
      "5650 UC": 950000,
      "8100 UC": 1400000,
      "11950 UC": 1950000,
      "16200 UC": 2600000
    };

    const offers = catalogues
      .filter(item => sellPrices[item.name] !== undefined)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: sellPrices[item.name]
      }));

    res.json({
      ok: true,
      offers
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// PUBG PLAYER ID VALIDATION
// ===============================
app.post("/api/pubg/validate", async (req, res) => {
  try {
    const player_id = String(req.body.player_id || "").trim();

    if (!player_id) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID kiriting."
      });
    }

    const result = await g2bulkRequest(
      "/games/checkPlayerId",
      {
        method: "POST",
        body: JSON.stringify({
          game: "pubgm",
          user_id: player_id
        })
      }
    );

    if (result.valid !== "valid" && result.valid !== true) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID tasdiqlanmadi.",
        result
      });
    }

    res.json({
      ok: true,
      valid: true,
      player_name: result.name || null,
      player_id
    });

  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// REAL PUBG ORDER
// ===============================
// Eslatma:
// Bu endpoint G2Bulk balansidan REAL pul yechadi.
// Faqat mijoz to'lovi tasdiqlangandan keyin chaqirilishi kerak.
// ===============================
app.post("/api/order", async (req, res) => {
  try {
    const {
      player_id,
      catalogue_name
    } = req.body;

    const cleanPlayerId = String(player_id || "").trim();
    const cleanCatalogue = String(catalogue_name || "").trim();

    if (!cleanPlayerId) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID kiritilmagan."
      });
    }

    if (!cleanCatalogue) {
      return res.status(400).json({
        ok: false,
        error: "UC paketi tanlanmagan."
      });
    }

    // Faqat ruxsat berilgan katalog nomlari
    const allowedCatalogues = new Set([
      "60 UC",
      "325 UC",
      "660 UC",
      "985 UC",
      "1320 UC",
      "1800 UC",
      "2460 UC",
      "3850 UC",
      "5650 UC",
      "8100 UC",
      "11950 UC",
      "16200 UC"
    ]);

    if (!allowedCatalogues.has(cleanCatalogue)) {
      return res.status(400).json({
        ok: false,
        error: "Noto'g'ri UC paketi."
      });
    }

    // ===============================
    // 1. PLAYER ID TEKSHIRISH
    // ===============================
    const validation = await g2bulkRequest(
      "/games/checkPlayerId",
      {
        method: "POST",
        body: JSON.stringify({
          game: "pubgm",
          user_id: cleanPlayerId
        })
      }
    );

    if (
      validation.valid !== "valid" &&
      validation.valid !== true
    ) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID tasdiqlanmadi."
      });
    }

    // ===============================
    // 2. G2BULK REAL BUYURTMA
    // ===============================
    const idempotencyKey = crypto.randomUUID();

    const order = await g2bulkRequest(
      "/games/pubgm/order",
      {
        method: "POST",
        headers: {
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          catalogue_name: cleanCatalogue,
          player_id: cleanPlayerId,
          remark: "UC SERVIS"
        })
      }
    );

    res.json({
      ok: true,
      message: "Buyurtma G2Bulk'ga yuborildi.",
      player_name: validation.name || null,
      order: order.order || order
    });

  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// G2BULK ORDER STATUS
// ===============================
app.post("/api/order/status", async (req, res) => {
  try {
    const {
      order_id
    } = req.body;

    if (!order_id) {
      return res.status(400).json({
        ok: false,
        error: "G2Bulk order_id kerak."
      });
    }

    const data = await g2bulkRequest(
      "/games/order/status",
      {
        method: "POST",
        body: JSON.stringify({
          order_id
        })
      }
    );

    res.json({
      ok: true,
      order: data
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// G2BULK WEBHOOK
// ===============================
// G2Bulk order COMPLETED yoki FAILED
// bo'lganda shu endpointga xabar yuboradi.
// ===============================
app.post("/webhook/g2bulk", (req, res) => {
  try {
    const data = req.body;

    console.log("G2BULK WEBHOOK:", data);

    // Hozircha faqat qabul qilamiz.
    // Keyingi bosqichda database/order statusga
    // bog'laymiz.

    res.status(200).json({
      ok: true
    });

  } catch (error) {
    console.error("Webhook error:", error);

    res.status(500).json({
      ok: false
    });
  }
});

// ===============================
// SERVER
// ===============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`UC SERVIS + G2Bulk server ishga tushdi: ${PORT}`);
});
