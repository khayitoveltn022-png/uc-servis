const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const G2BULK_API_KEY = process.env.G2BULK_API_KEY;
const G2BULK_API = "https://api.g2bulk.com/v1";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "CHANGE_ME_ADMIN_PASSWORD";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


// =====================================================
// DATABASE
// =====================================================

const DB_FILE = path.join(__dirname, "database.json");

function loadDB() {

    if (!fs.existsSync(DB_FILE)) {

        const initial = {
            orders: [],
            complaints: []
        };

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(initial, null, 2)
        );

        return initial;
    }

    try {

        return JSON.parse(
            fs.readFileSync(DB_FILE, "utf8")
        );

    } catch {

        return {
            orders: [],
            complaints: []
        };

    }
}


function saveDB(data) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );

}


// =====================================================
// G2BULK REQUEST
// =====================================================

async function g2bulkRequest(endpoint, options = {}) {

    if (!G2BULK_API_KEY) {

        throw new Error(
            "G2BULK_API_KEY topilmadi."
        );

    }

    const response = await fetch(
        G2BULK_API + endpoint,
        {
            ...options,

            headers: {

                "X-API-Key":
                    G2BULK_API_KEY,

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            }

        }
    );

    const text =
        await response.text();

    let data;

    try {

        data =
            JSON.parse(text);

    } catch {

        data = {

            success: false,

            message: text

        };

    }


    if (
        !response.ok ||
        data.success === false
    ) {

        throw new Error(

            data.message ||
            data.error ||
            `G2Bulk HTTP ${response.status}`

        );

    }


    return data;

}


// =====================================================
// UC CATALOG
// =====================================================

const UC_CATALOG = {

    60: {
        name: "60 UC",
        price: 11500
    },

    325: {
        name: "325 UC",
        price: 63000
    },

    660: {
        name: "660 UC",
        price: 120000
    },

    985: {
        name: "985 UC",
        price: 186500
    },

    1320: {
        name: "1320 UC",
        price: 240000
    },

    1800: {
        name: "1800 UC",
        price: 295000
    },

    2460: {
        name: "2460 UC",
        price: 406000
    },

    3850: {
        name: "3850 UC",
        price: 547000
    },

    5650: {
        name: "5650 UC",
        price: 856000
    },

    8100: {
        name: "8100 UC",
        price: 1090000
    },

    11950: {
        name: "11950 UC",
        price: 1710000
    },

    16200: {
        name: "16200 UC",
        price: 2250000
    }

};


// =====================================================
// G2BULK CATALOG
// =====================================================

const G2BULK_CATALOG = [

    {
        id: "first_purchase_pack",
        name: "First Purchase Pack",
        price: 12517,
        catalogue_name: "First Purchase Pack"
    },

    {
        id: "prime_1_month",
        name: "Prime (1 Month)",
        price: 12517,
        catalogue_name: "Prime (1 Month)"
    },

    {
        id: "weekly_deal_pack_1",
        name: "Weekly Deal Pack 1",
        price: 12702,
        catalogue_name: "Weekly Deal Pack 1"
    },

    {
        id: "60_wow_coins",
        name: "60 WOW Coins",
        price: 12773,
        catalogue_name: "60 WOW Coins"
    },

    {
        id: "firearm_materials",
        name: "Upgradable Firearm Materials Pack",
        price: 37495,
        catalogue_name:
            "Upgradable Firearm Materials Pack"
    },

    {
        id: "prime_3_months",
        name: "Prime (3 Months)",
        price: 37552,
        catalogue_name: "Prime (3 Months)"
    },

    {
        id: "weekly_deal_pack_2",
        name: "Weekly Deal Pack 2",
        price: 37936,
        catalogue_name: "Weekly Deal Pack 2"
    },

    {
        id: "weekly_mythic_emblem",
        name: "Weekly Mythic Emblem Value Pack",
        price: 37936,
        catalogue_name:
            "Weekly Mythic Emblem Value Pack"
    },

    {
        id: "mythic_emblem_pack",
        name: "Mythic Emblem Pack",
        price: 62430,
        catalogue_name:
            "Mythic Emblem Pack"
    },

    {
        id: "325_wow_coins",
        name: "325 WOW Coins",
        price: 65290,
        catalogue_name: "325 WOW Coins"
    },

    {
        id: "prime_6_months",
        name: "Prime (6 Months)",
        price: 69471,
        catalogue_name:
            "Prime (6 Months)"
    },

    {
        id: "elite_pass_1_50",
        name: "Elite Pass LV1-50",
        price: 69735,
        catalogue_name:
            "Elite Pass LV1-50"
    },

    {
        id: "prime_plus_1_month",
        name: "Prime Plus (1 Month)",
        price: 115785,
        catalogue_name:
            "Prime Plus (1 Month)"
    },

    {
        id: "660_wow_coins",
        name: "660 WOW Coins",
        price: 120786,
        catalogue_name:
            "660 WOW Coins"
    },

    {
        id: "prime_12_months",
        name: "Prime (12 Months)",
        price: 138942,
        catalogue_name:
            "Prime (12 Months)"
    },

    {
        id: "elite_pass_1_100",
        name: "Elite Pass LV1-100",
        price: 140679,
        catalogue_name:
            "Elite Pass LV1-100"
    },

    {
        id: "1800_wow_coins",
        name: "1800 WOW Coins",
        price: 302095,
        catalogue_name:
            "1800 WOW Coins"
    },

    {
        id: "elite_pass_plus",
        name: "Elite Pass Plus LV1-100",
        price: 344501,
        catalogue_name:
            "Elite Pass Plus LV1-100"
    },

    {
        id: "prime_plus_3_months",
        name: "Prime Plus (3 Months)",
        price: 347357,
        catalogue_name:
            "Prime Plus (3 Months)"
    },

    {
        id: "3850_wow_coins",
        name: "3850 WOW Coins",
        price: 604334,
        catalogue_name:
            "3850 WOW Coins"
    },

    {
        id: "prime_plus_6_months",
        name: "Prime Plus (6 Months)",
        price: 684187,
        catalogue_name:
            "Prime Plus (6 Months)"
    },

    {
        id: "8100_wow_coins",
        name: "8100 WOW Coins",
        price: 1208656,
        catalogue_name:
            "8100 WOW Coins"
    },

    {
        id: "prime_plus_12_months",
        name: "Prime Plus (12 Months)",
        price: 1493548,
        catalogue_name:
            "Prime Plus (12 Months)"
    }

];


// =====================================================
// ADMIN SESSIONS
// =====================================================

const adminSessions = new Set();


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(__dirname, "admin.html")
    );

});


// =====================================================
// STATUS
// =====================================================

app.get("/api/status", (req, res) => {

    res.json({

        ok: true,

        message:
            "UC SERVIS server ishlayapti",

        time:
            new Date().toISOString()

    });

});


// =====================================================
// PUBLIC CATALOG
// =====================================================

app.get("/api/catalog", (req, res) => {

    res.json({

        ok: true,

        uc: Object.entries(
            UC_CATALOG
        ).map(([amount, item]) => ({

            amount: Number(amount),

            name: item.name,

            price: item.price

        })),

        g2bulk: G2BULK_CATALOG

    });

});


// =====================================================
// G2BULK STATUS
// =====================================================

app.get(
    "/api/g2bulk/status",
    async (req, res) => {

        try {

            const data =
                await g2bulkRequest(
                    "/getMe"
                );

            res.json({

                ok: true,

                message:
                    "G2Bulk API ulandi.",

                data

            });

        } catch (error) {

            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// G2BULK BALANCE
// =====================================================

app.get(
    "/api/balance",
    async (req, res) => {

        try {

            const data =
                await g2bulkRequest(
                    "/getMe"
                );

            res.json({

                ok: true,

                data

            });

        } catch (error) {

            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// G2BULK ORIGINAL CATALOGUE
// =====================================================

app.get(
    "/api/pubg/catalogue",
    async (req, res) => {

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

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// PUBG ID VALIDATION
// =====================================================

app.post(
    "/api/pubg/validate",
    async (req, res) => {

        try {

            const playerId =
                String(
                    req.body.player_id || ""
                ).trim();


            if (!playerId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "PUBG ID kiriting."

                });

            }


            const data =
                await g2bulkRequest(
                    "/games/checkPlayerId",
                    {

                        method: "POST",

                        body:
                            JSON.stringify({

                                game: "pubgm",

                                user_id:
                                    playerId

                            })

                    }
                );


            res.json({

                ok: true,

                valid:
                    data.valid,

                player_name:
                    data.name ||
                    data.player_name ||
                    null,

                data

            });

        } catch (error) {

            res.status(400).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// SAVE ORDER
// =====================================================

function saveOrder(order) {

    const db = loadDB();

    db.orders.push(order);

    saveDB(db);

}


// =====================================================
// CUSTOMER UC ORDER
// =====================================================

app.post(
    "/api/order",
    (req, res) => {

        const {

            player_id,
            uc,
            price,
            phone,
            payment

        } = req.body;


        const playerId =
            String(
                player_id || ""
            ).trim();

        const amount =
            Number(uc);

        const clientPrice =
            Number(price);


        if (!playerId) {

            return res.status(400).json({

                ok: false,

                error:
                    "PUBG ID kiritilmagan."

            });

        }


        if (!UC_CATALOG[amount]) {

            return res.status(400).json({

                ok: false,

                error:
                    "Bu UC paketi mavjud emas."

            });

        }


        const realPrice =
            UC_CATALOG[amount].price;


        if (
            clientPrice !== realPrice
        ) {

            return res.status(400).json({

                ok: false,

                error:
                    "Narx noto‘g‘ri."

            });

        }


        if (!phone) {

            return res.status(400).json({

                ok: false,

                error:
                    "Telefon raqami kiritilmagan."

            });

        }


        const orderId =
            "UC" + Date.now();


        const order = {

            id: orderId,

            type: "UC",

            player_id:
                playerId,

            uc:
                amount,

            price:
                realPrice,

            phone,

            payment,

            status:
                "pending",

            createdAt:
                new Date().toISOString()

        };


        saveOrder(order);


        console.log(
            "UC ORDER:",
            order
        );


        res.json({

            ok: true,

            orderId,

            message:
                "UC buyurtma qabul qilindi.",

            order

        });

    }
);


// =====================================================
// G2BULK CUSTOMER ORDER
// =====================================================

app.post(
    "/api/g2bulk/customer-order",
    (req, res) => {

        const {

            product_id,
            player_id,
            phone,
            payment

        } = req.body;


        const playerId =
            String(
                player_id || ""
            ).trim();


        const product =
            G2BULK_CATALOG.find(
                item =>
                    item.id === product_id
            );


        if (!product) {

            return res.status(400).json({

                ok: false,

                error:
                    "G2Bulk mahsuloti topilmadi."

            });

        }


        if (!playerId) {

            return res.status(400).json({

                ok: false,

                error:
                    "PUBG ID kiritilmagan."

            });

        }


        if (!phone) {

            return res.status(400).json({

                ok: false,

                error:
                    "Telefon raqami kiritilmagan."

            });

        }


        const orderId =
            "G2B" + Date.now();


        const order = {

            id: orderId,

            type:
                "G2BULK",

            product_id:
                product.id,

            product:
                product.name,

            catalogue_name:
                product.catalogue_name,

            player_id:
                playerId,

            price:
                product.price,

            phone,

            payment,

            status:
                "pending",

            g2bulk_status:
                "not_sent",

            g2bulk_order_id:
                null,

            createdAt:
                new Date().toISOString()

        };


        saveOrder(order);


        console.log(
            "G2BULK CUSTOMER ORDER:",
            order
        );


        res.json({

            ok: true,

            orderId,

            message:
                "G2Bulk buyurtma qabul qilindi.",

            order

        });

    }
);


// =====================================================
// REAL G2BULK ORDER
// =====================================================

app.post(
    "/api/g2bulk/order",
    async (req, res) => {

        try {

            const {

                player_id,
                uc,
                remark

            } = req.body;


            const playerId =
                String(
                    player_id || ""
                ).trim();


            const amount =
                Number(uc);


            if (!playerId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "PUBG ID kiritilmagan."

                });

            }


            if (!UC_CATALOG[amount]) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "Bu UC miqdori G2Bulk katalogida mavjud emas."

                });

            }


            const catalogueMap = {

                60:
                    "60",

                325:
                    "325",

                660:
                    "660",

                985:
                    "985",

                1320:
                    "1320",

                1800:
                    "1800 UC (discounted)",

                2460:
                    "2460",

                3850:
                    "3850 UC (discounted)",

                5650:
                    "5650",

                8100:
                    "8100 UC (discounted)",

                11950:
                    "11950",

                16200:
                    "16200"

            };


            const catalogueName =
                catalogueMap[amount];


            if (!catalogueName) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "G2Bulk katalog nomi topilmadi."

                });

            }


            const validation =
                await g2bulkRequest(
                    "/games/checkPlayerId",
                    {

                        method: "POST",

                        body:
                            JSON.stringify({

                                game:
                                    "pubgm",

                                user_id:
                                    playerId

                            })

                    }
                );


            if (
                validation.valid === false ||
                validation.valid === "false"
            ) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "PUBG ID tasdiqlanmadi.",

                    validation

                });

            }


            const order =
                await g2bulkRequest(
                    "/games/pubgm/order",
                    {

                        method: "POST",

                        body:
                            JSON.stringify({

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
                    "G2Bulk UC buyurtmasi yaratildi.",

                catalogue_name:
                    catalogueName,

                player_id:
                    playerId,

                uc:
                    amount,

                order

            });

        } catch (error) {

            res.status(400).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// G2BULK ORDER STATUS
// =====================================================

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

                        body:
                            JSON.stringify({

                                order_id:
                                    orderId

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

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// CUSTOMER ORDER HISTORY
// =====================================================

app.get(
    "/api/orders",
    (req, res) => {

        const phone =
            String(
                req.query.phone || ""
            ).trim();


        const db =
            loadDB();


        let orders =
            db.orders;


        if (phone) {

            orders =
                orders.filter(
                    order =>
                        String(
                            order.phone
                        ) === phone
                );

        }


        res.json({

            ok: true,

            orders

        });

    }
);


// =====================================================
// COMPLAINT
// =====================================================

app.post(
    "/api/complaints",
    (req, res) => {

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


        const db =
            loadDB();


        const complaint = {

            id:
                "CMP" + Date.now(),

            phone,

            text,

            createdAt:
                new Date().toISOString(),

            status:
                "new"

        };


        db.complaints.push(
            complaint
        );


        saveDB(db);


        res.json({

            ok: true,

            message:
                "Murojaat yuborildi.",

            complaint

        });

    }
);


// =====================================================
// ADMIN LOGIN
// =====================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        const password =
            String(
                req.body.password || ""
            );


        if (
            password !==
            ADMIN_PASSWORD
        ) {

            return res.status(401).json({

                ok: false,

                error:
                    "Admin parol noto‘g‘ri."

            });

        }


        const token =
            crypto
                .randomBytes(32)
                .toString("hex");


        adminSessions.add(token);


        res.json({

            ok: true,

            token

        });

    }
);


// =====================================================
// ADMIN AUTH
// =====================================================

function adminAuth(
    req,
    res,
    next
) {

    const auth =
        req.headers.authorization || "";


    const token =
        auth.startsWith("Bearer ")
            ? auth.slice(7)
            : "";


    if (
        !token ||
        !adminSessions.has(token)
    ) {

        return res.status(401).json({

            ok: false,

            error:
                "Admin ruxsati yo‘q."

        });

    }


    next();

}


// =====================================================
// ADMIN DATA
// =====================================================

app.get(
    "/api/admin/orders",
    adminAuth,
    (req, res) => {

        const db =
            loadDB();


        res.json({

            ok: true,

            orders:
                db.orders

        });

    }
);


app.get(
    "/api/admin/complaints",
    adminAuth,
    (req, res) => {

        const db =
            loadDB();


        res.json({

            ok: true,

            complaints:
                db.complaints

        });

    }
);


// =====================================================
// ADMIN ORDER STATUS
// =====================================================

app.post(
    "/api/admin/order/status",
    adminAuth,
    (req, res) => {

        const {

            id,
            status

        } = req.body;


        const allowed = [

            "pending",
            "paid",
            "processing",
            "completed",
            "cancelled"

        ];


        if (
            !allowed.includes(status)
        ) {

            return res.status(400).json({

                ok: false,

                error:
                    "Status noto‘g‘ri."

            });

        }


        const db =
            loadDB();


        const order =
            db.orders.find(
                item =>
                    item.id === id
            );


        if (!order) {

            return res.status(404).json({

                ok: false,

                error:
                    "Buyurtma topilmadi."

            });

        }


        order.status =
            status;


        order.updatedAt =
            new Date().toISOString();


        saveDB(db);


        res.json({

            ok: true,

            order

        });

    }
);


// =====================================================
// ADMIN LOGOUT
// =====================================================

app.post(
    "/api/admin/logout",
    adminAuth,
    (req, res) => {

        const auth =
            req.headers.authorization || "";

        const token =
            auth.slice(7);

        adminSessions.delete(
            token
        );

        res.json({

            ok: true

        });

    }
);


// =====================================================
// WEBHOOK
// =====================================================

app.post(
    "/webhook/order-status",
    (req, res) => {

        console.log(
            "G2BULK WEBHOOK:",
            JSON.stringify(
                req.body
            )
        );

        res.json({

            ok: true

        });

    }
);


// =====================================================
// START
// =====================================================

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
