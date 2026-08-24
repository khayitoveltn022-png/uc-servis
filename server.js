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


// =====================================
// G2BULK REQUEST
// =====================================

async function g2bulkRequest(endpoint, options = {}) {

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
            message: text || "G2Bulk noma'lum javob qaytardi."
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


// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// =====================================
// ADMIN
// =====================================

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(__dirname, "admin.html")
    );

});


// =====================================
// SERVER STATUS
// =====================================

app.get("/api/status", async (req, res) => {

    res.json({
        ok: true,
        message: "UC SERVIS server ishlayapti",
        time: new Date().toISOString()
    });

});


// =====================================
// G2BULK STATUS / API KEY TEST
// =====================================

app.get("/api/g2bulk/status", async (req, res) => {

    try {

        const data =
            await g2bulkRequest("/getMe");

        res.json({
            ok: true,
            message: "G2Bulk API ulandi.",
            balance: data.balance,
            username: data.username
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// G2BULK BALANCE
// =====================================

app.get("/api/balance", async (req, res) => {

    try {

        const data =
            await g2bulkRequest("/getMe");

        res.json({
            ok: true,
            balance: data.balance,
            username: data.username
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// PUBG CATALOG
// =====================================

app.get("/api/pubg/catalogue", async (req, res) => {

    try {

        const data =
            await g2bulkRequest(
                "/games/pubgm/catalogue",
                {
                    method: "GET"
                }
            );

        res.json(data);

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// PUBG PLAYER VALIDATION
// =====================================

app.post("/api/pubg/validate", async (req, res) => {

    try {

        const playerId =
            String(
                req.body.player_id || ""
            ).trim();

        if (!playerId) {

            return res.status(400).json({
                ok: false,
                error: "PUBG ID kiriting."
            });

        }


        const data =
            await g2bulkRequest(
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
            valid: data.valid,
            player_name: data.name || null,
            openid: data.openid || null
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// G2BULK PLACE ORDER
// =====================================
//
// MUHIM:
// Bu endpoint real UC sotib oladi.
// Uni faqat mijoz to'lovi tasdiqlangandan
// keyin chaqirish kerak.
// =====================================

app.post("/api/g2bulk/order", async (req, res) => {

    try {

        const {
            player_id,
            catalogue_name,
            remark
        } = req.body;


        if (!player_id) {

            return res.status(400).json({
                ok: false,
                error: "PUBG ID kiritilmagan."
            });

        }


        if (!catalogue_name) {

            return res.status(400).json({
                ok: false,
                error: "UC paketi tanlanmagan."
            });

        }


        // PUBG ID validation

        const validation =
            await g2bulkRequest(
                "/games/checkPlayerId",
                {
                    method: "POST",

                    body: JSON.stringify({

                        game: "pubgm",

                        user_id:
                            String(player_id).trim()

                    })
                }
            );


        if (
            !validation.valid ||
            validation.valid !== "valid"
        ) {

            return res.status(400).json({
                ok: false,
                error: "PUBG ID tasdiqlanmadi.",
                validation
            });

        }


        // Idempotency key
        // Bir xil order ikki marta
        // yuborilib ketishidan himoya.

        const idempotencyKey =
            crypto.randomUUID();


        const orderRemark =
            remark ||
            `UC SERVIS ${Date.now()}`;


        // REAL G2BULK ORDER

        const order =
            await g2bulkRequest(
                "/games/pubgm/order",
                {
                    method: "POST",

                    headers: {
                        "X-Idempotency-Key":
                            idempotencyKey
                    },

                    body: JSON.stringify({

                        catalogue_name:
                            catalogue_name,

                        player_id:
                            String(player_id).trim(),

                        remark:
                            orderRemark

                    })
                }
            );


        res.json({
            ok: true,

            message:
                "G2Bulk buyurtmasi yaratildi.",

            player_name:
                validation.name || null,

            order:
                order.order || order

        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// G2BULK ORDER STATUS
// =====================================

app.post("/api/g2bulk/order/status", async (req, res) => {

    try {

        const {
            order_id
        } = req.body;


        if (!order_id) {

            return res.status(400).json({
                ok: false,
                error: "G2Bulk order_id kiritilmagan."
            });

        }


        const data =
            await g2bulkRequest(
                "/games/order/status",
                {
                    method: "POST",

                    body: JSON.stringify({
                        order_id: order_id
                    })
                }
            );


        res.json({
            ok: true,
            data: data
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// G2BULK ORDER BY ID
// =====================================

app.get("/api/g2bulk/order/:id", async (req, res) => {

    try {

        const id =
            encodeURIComponent(
                req.params.id
            );


        const data =
            await g2bulkRequest(
                `/orders/${id}`,
                {
                    method: "GET"
                }
            );


        res.json({
            ok: true,
            order: data
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// WEBHOOK
// =====================================
//
// G2Bulk callback yuborsa shu endpoint
// statusni qabul qiladi.
// =====================================

app.post("/webhook/order-status", (req, res) => {

    console.log(
        "G2BULK WEBHOOK:",
        JSON.stringify(req.body)
    );

    res.status(200).json({
        ok: true
    });

});


// =====================================
// FRONTEND ORDER
// =====================================
//
// Hozirgi saytning buyurtmasi.
// Bu endpoint G2Bulk'ga avtomatik pul
// sarflamaydi.
// Avval to'lov tasdiqlanishi kerak.
// =====================================

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


    console.log(
        "YANGI UC BUYURTMA:",
        {
            orderId,
            player_id,
            uc,
            price,
            phone,
            payment
        }
    );


    res.json({

        ok: true,

        orderId,

        message:
            "Buyurtma qabul qilindi.",

        order: {

            id: orderId,

            player_id,

            uc,

            price,

            phone,

            payment,

            status: "pending",

            createdAt:
                new Date()
                    .toLocaleString("uz-UZ")

        }

    });

});


// =====================================
// ORDERS
// =====================================

app.get("/api/orders", (req, res) => {

    res.json({
        ok: true,
        orders: []
    });

});


// =====================================
// COMPLAINTS
// =====================================

app.post("/api/complaints", (req, res) => {

    const {
        phone,
        text
    } = req.body;


    if (!phone || !text) {

        return res.status(400).json({
            ok: false,
            error:
                "Telefon va murojaatni kiriting."
        });

    }


    console.log(
        "MUROJAAT:",
        {
            phone,
            text
        }
    );


    res.json({
        ok: true,
        message:
            "Murojaat yuborildi."
    });

});


// =====================================
// SERVER START
// =====================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "🔥 UC SERVIS server ishga tushdi: " +
            PORT
        );

    }
);
