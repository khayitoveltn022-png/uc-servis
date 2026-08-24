const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

/*
========================================
SOZLAMALAR
========================================
*/

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "123456";

const G2BULK_API_KEY =
    process.env.G2BULK_API_KEY || "";


/*
========================================
EXPRESS
========================================
*/

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/*
========================================
INDEX VA ADMIN FAYLLARI
public PAPKA YO‘Q
========================================
*/

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin.html"
        )
    );

});


app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


/*
========================================
DATA FAYL
========================================
*/

const DATA_FILE =
    path.join(
        __dirname,
        "data.json"
    );


function defaultData(){

    return {

        orders: [],

        complaints: [],

        nextOrderId: 1

    };

}


function loadData(){

    try{

        if(
            !fs.existsSync(
                DATA_FILE
            )
        ){

            const data =
                defaultData();

            saveData(data);

            return data;

        }


        const text =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );


        const data =
            JSON.parse(text);


        if(!Array.isArray(data.orders)){

            data.orders = [];

        }


        if(!Array.isArray(data.complaints)){

            data.complaints = [];

        }


        if(
            !data.nextOrderId ||
            Number(data.nextOrderId) < 1
        ){

            data.nextOrderId = 1;

        }


        return data;

    }catch(error){

        console.error(
            "DATA LOAD ERROR:",
            error
        );

        return defaultData();

    }

}


function saveData(data){

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );

}


let db = loadData();


/*
========================================
YORDAMCHI FUNKSIYALAR
========================================
*/

function now(){

    return new Date()
        .toLocaleString(
            "uz-UZ",
            {
                timeZone:
                    "Asia/Tashkent"
            }
        );

}


function money(number){

    return Number(
        number || 0
    );

}


/*
========================================
ADMIN TEKSHIRISH
========================================
*/

function adminAuth(
    req,
    res,
    next
){

    const password =
        req.headers[
            "x-admin-password"
        ];


    if(
        !password ||
        password !== ADMIN_PASSWORD
    ){

        return res
            .status(401)
            .json({

                error:
                    "Admin parol noto‘g‘ri."

            });

    }


    next();

}


/*
========================================
HEALTH CHECK
========================================
*/

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            ok: true,

            message:
                "UC SERVIS ishlayapti",

            g2bulk:
                G2BULK_API_KEY
                ? "API key mavjud"
                : "API key mavjud emas",

            time:
                now()

        });

    }
);


/*
========================================
ADMIN LOGIN
========================================
*/

app.post(
    "/api/admin/login",
    (req, res) => {

        const password =
            String(
                req.body.password || ""
            );


        if(
            password !==
            ADMIN_PASSWORD
        ){

            return res
                .status(401)
                .json({

                    error:
                        "Admin parol noto‘g‘ri."

                });

        }


        res.json({

            ok: true,

            message:
                "Admin kirish muvaffaqiyatli."

        });

    }
);


/*
========================================
UC BUYURTMASI
========================================
*/

app.post(
    "/api/order",
    async (req, res) => {

        try{

            const {

                player_id,
                uc,
                price,
                phone,
                payment

            } = req.body;


            if(!player_id){

                return res
                    .status(400)
                    .json({

                        error:
                            "PUBG ID kiritilmagan."

                    });

            }


            if(!uc){

                return res
                    .status(400)
                    .json({

                        error:
                            "UC miqdori kiritilmagan."

                    });

            }


            if(!phone){

                return res
                    .status(400)
                    .json({

                        error:
                            "Telefon raqami kiritilmagan."

                    });

            }


            if(!price){

                return res
                    .status(400)
                    .json({

                        error:
                            "Narx aniqlanmadi."

                    });

            }


            const order = {

                id:
                    db.nextOrderId++,

                type:
                    "UC",

                player_id:
                    String(player_id),

                uc:
                    Number(uc),

                price:
                    money(price),

                phone:
                    String(phone),

                payment:
                    String(
                        payment ||
                        "Payme"
                    ),

                status:
                    "Kutilmoqda",

                createdAt:
                    now()

            };


            db.orders.push(
                order
            );


            saveData(db);


            res.json({

                ok: true,

                orderId:
                    order.id,

                status:
                    order.status

            });


        }catch(error){

            console.error(
                "UC ORDER ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    error:
                        "Buyurtma yaratishda xatolik."

                });

        }

    }
);


/*
========================================
G2BULK PUBG ID TEKSHIRISH
========================================
*/

app.post(
    "/api/pubg/validate",
    async (req, res) => {

        try{

            const playerId =
                String(
                    req.body.player_id ||
                    ""
                ).trim();


            if(!playerId){

                return res
                    .status(400)
                    .json({

                        error:
                            "PUBG ID kiritilmagan."

                    });

            }


            /*
            =================================
            G2BULK API
            =================================

            G2BULK API key Render
            Environment Variables orqali
            olinadi.

            Hozir player ID formatini
            tekshirish qilinmoqda.
            */


            if(
                !/^\d+$/.test(playerId)
            ){

                return res.json({

                    valid: false,

                    player_id:
                        playerId

                });

            }


            res.json({

                valid: true,

                player_id:
                    playerId,

                player_name:
                    null

            });


        }catch(error){

            console.error(
                "PUBG VALIDATE ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    error:
                        "PUBG ID tekshirishda xatolik."

                });

        }

    }
);


/*
========================================
G2BULK BUYURTMASI
========================================
*/

app.post(
    "/api/g2bulk/order",
    async (req, res) => {

        try{

            const {

                player_id,
                product_id,
                product_name,
                price,
                phone,
                payment

            } = req.body;


            if(!player_id){

                return res
                    .status(400)
                    .json({

                        error:
                            "PUBG ID kiritilmagan."

                    });

            }


            if(!product_id){

                return res
                    .status(400)
                    .json({

                        error:
                            "Mahsulot tanlanmagan."

                    });

            }


            if(!product_name){

                return res
                    .status(400)
                    .json({

                        error:
                            "Mahsulot nomi kiritilmagan."

                    });

            }


            if(!price){

                return res
                    .status(400)
                    .json({

                        error:
                            "Mahsulot narxi aniqlanmadi."

                    });

            }


            if(!phone){

                return res
                    .status(400)
                    .json({

                        error:
                            "Telefon raqami kiritilmagan."

                    });

            }


            const order = {

                id:
                    db.nextOrderId++,

                type:
                    "G2BULK",

                player_id:
                    String(player_id),

                product_id:
                    String(product_id),

                product_name:
                    String(product_name),

                price:
                    money(price),

                phone:
                    String(phone),

                payment:
                    String(
                        payment ||
                        "Payme"
                    ),

                status:
                    "Kutilmoqda",

                createdAt:
                    now()

            };


            db.orders.push(
                order
            );


            saveData(db);


            res.json({

                ok: true,

                orderId:
                    order.id,

                status:
                    order.status

            });


        }catch(error){

            console.error(
                "G2BULK ORDER ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    error:
                        "G2BULK buyurtmasida xatolik."

                });

        }

    }
);
/*
========================================
MIJOZ BUYURTMALARINI KO‘RISH
========================================
*/

app.get(
    "/api/orders",
    (req, res) => {

        const phone =
            String(
                req.query.phone || ""
            ).trim();


        if(!phone){

            return res
                .status(400)
                .json({

                    error:
                        "Telefon raqami kerak."

                });

        }


        const orders =
            db.orders.filter(
                order =>
                    String(
                        order.phone
                    ) === phone
            );


        res.json({

            orders

        });

    }
);


/*
========================================
MUROJAAT YUBORISH
========================================
*/

app.post(
    "/api/complaints",
    (req, res) => {

        try{

            const {
                phone,
                text
            } = req.body;


            if(!phone){

                return res
                    .status(400)
                    .json({

                        error:
                            "Telefon raqami kerak."

                    });

            }


            if(!text){

                return res
                    .status(400)
                    .json({

                        error:
                            "Murojaat matni kerak."

                    });

            }


            const complaint = {

                id:
                    db.complaints.length + 1,

                phone:
                    String(phone),

                text:
                    String(text),

                status:
                    "Yangi",

                createdAt:
                    now()

            };


            db.complaints.push(
                complaint
            );


            saveData(db);


            res.json({

                ok: true,

                complaintId:
                    complaint.id

            });


        }catch(error){

            console.error(
                "COMPLAINT ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    error:
                        "Murojaat yuborishda xatolik."

                });

        }

    }
);


/*
========================================
ADMIN — BUYURTMALAR
========================================
*/

app.get(
    "/api/admin/orders",
    adminAuth,
    (req, res) => {

        res.json({

            orders:
                db.orders
                    .slice()
                    .reverse()

        });

    }
);


/*
========================================
ADMIN — MUROJAATLAR
========================================
*/

app.get(
    "/api/admin/complaints",
    adminAuth,
    (req, res) => {

        res.json({

            complaints:
                db.complaints
                    .slice()
                    .reverse()

        });

    }
);


/*
========================================
ADMIN — BUYURTMA STATUSINI O‘ZGARTIRISH
========================================
*/

app.patch(
    "/api/admin/orders/:id",
    adminAuth,
    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        const order =
            db.orders.find(
                item =>
                    Number(item.id) === id
            );


        if(!order){

            return res
                .status(404)
                .json({

                    error:
                        "Buyurtma topilmadi."

                });

        }


        const status =
            String(
                req.body.status || ""
            ).trim();


        if(!status){

            return res
                .status(400)
                .json({

                    error:
                        "Status kiritilmagan."

                });

        }


        order.status =
            status;


        order.updatedAt =
            now();


        saveData(db);


        res.json({

            ok: true,

            order

        });

    }
);


/*
========================================
ADMIN — MUROJAAT STATUSINI O‘ZGARTIRISH
========================================
*/

app.patch(
    "/api/admin/complaints/:id",
    adminAuth,
    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        const complaint =
            db.complaints.find(
                item =>
                    Number(item.id) === id
            );


        if(!complaint){

            return res
                .status(404)
                .json({

                    error:
                        "Murojaat topilmadi."

                });

        }


        const status =
            String(
                req.body.status || ""
            ).trim();


        if(!status){

            return res
                .status(400)
                .json({

                    error:
                        "Status kiritilmagan."

                });

        }


        complaint.status =
            status;


        complaint.updatedAt =
            now();


        saveData(db);


        res.json({

            ok: true,

            complaint

        });

    }
);


/*
========================================
ADMIN — STATISTIKA
========================================
*/

app.get(
    "/api/admin/stats",
    adminAuth,
    (req, res) => {

        const totalOrders =
            db.orders.length;


        const totalComplaints =
            db.complaints.length;


        const completedOrders =
            db.orders.filter(
                order =>
                    order.status ===
                    "Tugallandi"
            ).length;


        const totalRevenue =
            db.orders.reduce(
                (sum, order) =>
                    sum +
                    Number(
                        order.price || 0
                    ),
                0
            );


        res.json({

            totalOrders,

            totalComplaints,

            completedOrders,

            totalRevenue

        });

    }
);


/*
========================================
NOMA'LUM API YO‘LLARI
========================================
*/

app.use(
    "/api",
    (req, res) => {

        res
            .status(404)
            .json({

                error:
                    "API manzili topilmadi."

            });

    }
);


/*
========================================
NOMA'LUM SAHIFALAR
========================================
*/

app.use(
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/*
========================================
SERVER
========================================
*/

app.listen(
    PORT,
    () => {

        console.log(
            `UC SERVIS server ${PORT}-portda ishga tushdi`
        );

        console.log(
            "G2BULK API:",
            G2BULK_API_KEY
                ? "API KEY mavjud"
                : "API KEY mavjud emas"
        );

    }
);
