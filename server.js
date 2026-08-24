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
// G2BULK API
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
    } catch {
        data = {
            error: text
        };
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "G2Bulk API xatosi: HTTP " +
            response.status
        );
    }

    return data;
}


// ================================
// HOME
// ================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ================================
// ADMIN
// ================================

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(__dirname, "admin.html")
    );

});


// ================================
// HEALTH
// ================================

app.get("/health", (req, res) => {

    res.json({
        ok: true,
        service: "UC SERVIS",
        server: "online"
    });

});


// ================================
// G2BULK STATUS
// ================================

app.get("/api/status", async (req, res) => {

    try {

        const data =
            await g2bulk("/getMe");

        res.json({
            ok: true,
            message:
                "UC SERVIS + G2Bulk API ishlayapti",
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
// G2BULK BALANCE
// ================================

app.get("/api/balance", async (req, res) => {

    try {

        const data =
            await g2bulk("/getMe");

        res.json({
            ok: true,
            balance:
                data.balance || 0,
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

app.get("/api/games", async (req, res) => {

    try {

        const data =
            await g2bulk("/games");

        res.json({
            ok: true,
            games:
                data.games || data
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

app.get("/api/pubg/offers", async (req, res) => {

    try {

        const data =
            await g2bulk(
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

app.post("/api/pubg/validate", async (req, res) => {

    try {

        const playerId =
            String(
                req.body.player_id ||
