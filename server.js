const express = require("express");
const path = require("path");

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
        throw new Error("G2BULK_API_KEY topilmadi.");
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
            success: false,
            message: text
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
// UC → G2BULK CATALOGUE
// =====================================

const G2BULK_CATALOGUE = {

    60: "60",
    325: "325",
    660: "660",
    985: "985",
    1320: "1320",

    1800: "1800 UC (discounted)",

    2460: "2460",

    3850: "3850 UC (discounted)",

    5650: "5650",

    8100: "8100 UC (discounted)",

    11950: "11950",

    16200: "16200"

};


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

app.get("/api/status", (req, res) => {

    res.json({
        ok: true,
        message: "UC SERVIS server ishlayapti",
        time: new Date().toISOString()
    });

});


// =====================================
// G2BULK STATUS
// =====================================

app.get("/api/g2bulk/status", async (req, res) => {

    try {

        const data =
            await g2bulkRequest("/getMe");

        res.json({
            ok: true,
            message: "G2Bulk API ulandi.",
            data
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
            data
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// PUBG CATALOGUE
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
// PUBG ID VALIDATION
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
            player_name:
                data.name ||
                data.player_name ||
                null,
            data
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            error: error.message
        });

    }

});


// =====================================
// REAL G2BULK ORDER
// =====================================
//
// Bu endpoint REAL UC sotib oladi.
// =====================================

app.post("/api/g2bulk/order", async (req, res) => {

    try {

        const {
            player_id,
            uc,
            remark
        } = req.body;


        const playerId =
            String(player_id || "").trim();


        const amount =
            Number(uc);


        if (!playerId) {

            return res.status(400).json({
                ok: false,
                error: "PUBG ID kiritilmagan."
            });

        }


        if (!amount) {

            return res.status(400).json({
                ok: false,
                error: "UC miqdori kiritilmagan."
            });

        }


        const catalogueName =
            G2BULK_CATALOGUE[amount];


        if (!catalogueName) {

            return res.status(400).json({
                ok: false,
                error:
                    "Bu UC miqdori G2Bulk katalogida mavjud emas.",
                available:
                    Object.keys(
                        G2BULK_CATALOGUE
                    ).map(Number)
            });

        }


        // =================================
        // PLAYER ID VALIDATION
        // =================================

        const validation =
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


        if (
            validation.valid === false ||
            validation.valid === "false"
        ) {

            return res.status(400).json({
                ok: false,
                error: "PUBG ID tasdiqlanmadi.",
                validation
            });

        }


        // =================================
        // CREATE REAL ORDER
        // =================================

        const order =
            await g2bulkRequest(
                "/games/pubgm/order",
                {
                    method: "POST",

                    body: JSON.stringify({

                        catalogue_name:
                            catalogueName,

                        player_id:
                            playerId,

                        remark:
                            remark ||
                            `UC SERVIS - ${amount} UC`

                    })
                }
            );


        res.json({

            ok: true,

            message:
                "G2Bulk buyurtmasi yaratildi.",

            catalogue_name:
                catalogueName,

            player_id:
                playerId,

            uc:
                amount,

            order:
                order

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

app.post(
    "/api/g2bulk/order/status",
    async (req, res) => {

        try {

            const orderId =
                req.body.order_id;

            if (!orderId) {

                return res.status(400).json({
                    ok: false,
                    error:
                        "G2Bulk order ID kiritilmagan."
                });

            }

            const data =
                await g2bulkRequest(
                    "/games/order/status",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            order_id: orderId
                        })
                    }
                );

            res.json({
                ok: true,
                data
            });

        } catch (error) {

            res.status(400).json({
                ok: false,
                error: error.message
            });

        }

    }
);


// =====================================
// ORDER BY ID
// =====================================

app.get(
    "/api/g2bulk/order/:id",
    async (req, res) => {

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

    }
);


// =====================================
// CUSTOMER ORDER
// =====================================
//
// Hozircha mijoz buyurtmasini qabul qiladi.
// G2Bulk'ga pul sarflashni avtomatik
// boshlamaydi.
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


    if (!price) {

        return res.status(400).json({
            ok: false,
            error: "Narx aniqlanmadi."
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
        "UC SERVIS ORDER:",
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
// ORDERS HISTORY
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
// WEBHOOK
// =====================================

app.post(
    "/webhook/order-status",
    (req, res) => {

        console.log(
            "G2BULK WEBHOOK:",
            JSON.stringify(req.body)
        );

        res.json({
            ok: true
        });

    }
);


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
