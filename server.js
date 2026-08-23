const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;
const FAZER_API_KEY = process.env.FAZER_API_KEY;
const FAZER_API = "https://api.fzr.cards/api/v2";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// STATIC FILES
// ===============================
app.use(express.static(__dirname));

// ===============================
// FAZERCARDS REQUEST
// ===============================
async function fazerRequest(endpoint, options = {}) {
  if (!FAZER_API_KEY) {
    throw new Error("FAZER_API_KEY Render Environment'da topilmadi.");
  }

  const response = await fetch(`${FAZER_API}${endpoint}`, {
    ...options,
    headers: {
      "X-API-Key": FAZER_API_KEY,
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
      ok: false,
      error: text || "Noma'lum javob"
    };
  }

  if (!response.ok || data.ok === false) {
    const error = data.error || `FazerCards HTTP ${response.status}`;
    throw new Error(error);
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
// API TEST
// ===============================
app.get("/api/status", async (req, res) => {
  try {
    const data = await fazerRequest("/me");

    res.json({
      ok: true,
      message: "UC SERVIS + FazerCards API ishlayapti",
      account: {
        login: data.login,
        email: data.email,
        plan: data.plan,
        subscriptionActive: data.subscriptionActive
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
// FAZERCARDS BALANCE
// ===============================
app.get("/api/balance", async (req, res) => {
  try {
    const data = await fazerRequest("/balance");

    res.json(data);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// PUBG CATEGORY
// ===============================
app.get("/api/pubg/category", async (req, res) => {
  try {
    const data = await fazerRequest("/topups?limit=100");

    const items = Array.isArray(data.items) ? data.items : [];

    const pubg = items.find(item =>
      String(item.name || "")
        .toLowerCase()
        .includes("pubg")
    );

    if (!pubg) {
      return res.status(404).json({
        ok: false,
        error: "PUBG Mobile FazerCards katalogida topilmadi.",
        categories: items
      });
    }

    res.json({
      ok: true,
      category: pubg
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// PUBG OFFERS
// ===============================
app.get("/api/pubg/offers", async (req, res) => {
  try {
    const categories = await fazerRequest("/topups?limit=100");

    const items = Array.isArray(categories.items)
      ? categories.items
      : [];

    const pubg = items.find(item =>
      String(item.name || "")
        .toLowerCase()
        .includes("pubg")
    );

    if (!pubg) {
      return res.status(404).json({
        ok: false,
        error: "PUBG Mobile category topilmadi."
      });
    }

    const offers = await fazerRequest(
      `/topups/offers?category_id=${encodeURIComponent(
        pubg.category_id
      )}`
    );

    res.json({
      ok: true,
      category: pubg,
      offers: offers.offers || [],
      fields: offers.fields || []
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
    const { player_id } = req.body;

    if (!player_id) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID kiriting."
      });
    }

    const result = await fazerRequest(
      "/topups/validate-id",
      {
        method: "POST",
        body: JSON.stringify({
          category_id: "pubg_mobile",
          fields: {
            player_id: String(player_id).trim()
          }
        })
      }
    );

    res.json(result);
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
// MUHIM:
// Bu endpoint real FazerCards buyurtmasini yaratadi.
// Uni mijoz to'lovi tasdiqlangandan keyin chaqirish kerak.
// ===============================
app.post("/api/order", async (req, res) => {
  try {
    const {
      player_id,
      offer_id,
      category_id,
      fields
    } = req.body;

    if (!player_id) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID kiritilmagan."
      });
    }

    if (!offer_id) {
      return res.status(400).json({
        ok: false,
        error: "UC offer_id kiritilmagan."
      });
    }

    if (!category_id) {
      return res.status(400).json({
        ok: false,
        error: "category_id kiritilmagan."
      });
    }

    // Avval PUBG ID tekshiriladi
    const validation = await fazerRequest(
      "/topups/validate-id",
      {
        method: "POST",
        body: JSON.stringify({
          category_id,
          fields: {
            player_id: String(player_id).trim()
          }
        })
      }
    );

    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        error: "PUBG ID tasdiqlanmadi.",
        validation
      });
    }

    // Duplicate orderdan himoya
    const idempotencyKey = crypto.randomUUID();

    const orderFields = {
      player_id: String(player_id).trim(),
      ...(fields || {})
    };

    const order = await fazerRequest(
      "/topups/order",
      {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          category_id,
          offer_id,
          fields: orderFields
        })
      }
    );

    res.json({
      ok: true,
      message: "Buyurtma FazerCards'ga yuborildi.",
      player_name: validation.player_name || null,
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
// ORDER STATUS
// ===============================
app.get("/api/order/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const data = await fazerRequest(
      `/orders/${encodeURIComponent(orderId)}`
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ===============================
// SERVER
// ===============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`UC SERVIS server ishga tushdi: ${PORT}`);
});
