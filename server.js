const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


// ============================
// HOME
// ============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ============================
// ADMIN
// ============================

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});


// ============================
// SERVER TEST
// ============================

app.get("/api/status", (req, res) => {

    res.json({
        ok: true,
        message: "UC SERVIS server ishlayapti",
        time: new Date().toISOString()
    });

});


// ============================
// BALANCE TEST
// ============================

app.get("/api/balance", (req, res) => {

    res.json({
        ok: true,
        balance: "G2Bulk API ulanadi"
    });

});


// ============================
// PUBG VALIDATE
// ============================

app.post("/api/pubg/validate", (req, res) => {

    const playerId =
        String(req.body.player_id || "").trim();

    if (!playerId) {

        return res.status(400).json({
            ok: false,
            error: "PUBG ID kiriting."
        });

    }

    res.json({
        ok: true,
        valid: true,
        player_name: null,
        message: "PUBG ID qabul qilindi."
    });

});


// ============================
// ORDER
// ============================

app.post("/api/order", (req, res) => {

    const {
        player_id,
        uc,
        price,
        phone,
        payment
    } = req.body;

    if (!player_id) {

        return res.status(400).json({
            ok: false,
            error: "PUBG ID kiritilmagan."
        });

    }

    if (!uc) {

        return res.status(400).json({
            ok: false,
            error: "UC miqdori kiritilmagan."
        });

    }

    if (!phone) {

        return res.status(400).json({
            ok: false,
            error: "Telefon raqami kiritilmagan."
        });

    }

    const orderId =
        "UC" + Date.now();

    res.json({
        ok: true,
        orderId: orderId,
        message: "Buyurtma qabul qilindi.",
        order: {
            id: orderId,
            player_id: player_id,
            uc: uc,
            price: price,
            phone: phone,
            payment: payment,
            status: "pending",
            createdAt: new Date().toLocaleString("uz-UZ")
        }
    });

});


// ============================
// ORDERS
// ============================

app.get("/api/orders", (req, res) => {

    res.json({
        ok: true,
        orders: []
    });

});


// ============================
// COMPLAINTS
// ============================

app.post("/api/complaints", (req, res) => {

    const {
        phone,
        text
    } = req.body;

    if (!phone || !text) {

        return res.status(400).json({
            ok: false,
            error: "Telefon va murojaatni kiriting."
        });

    }

    res.json({
        ok: true,
        message: "Murojaat yuborildi."
    });

});


// ============================
// SERVER START
// ============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        "UC SERVIS server ishga tushdi: " + PORT
    );

});
