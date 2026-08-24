<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>UC SERVIS</title>

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    background:#080b10;
    color:#ffffff;
    font-family:Arial,sans-serif;
}

header{
    background:#111722;
    padding:22px 15px;
    text-align:center;
    border-bottom:1px solid #293140;
}

header h1{
    margin:0;
    font-size:30px;
    color:#ffffff;
}

header p{
    margin:8px 0 0;
    color:#b8c0cc;
}

.container{
    max-width:800px;
    margin:auto;
    padding:18px;
}

.nav{
    display:flex;
    gap:8px;
    margin:20px 0;
}

.nav button{
    flex:1;
}

button{
    border:0;
    border-radius:10px;
    padding:13px 16px;
    background:#f5b400;
    color:#111111;
    font-weight:bold;
    cursor:pointer;
}

button:hover{
    opacity:.9;
}

.card,
.form{
    background:#151b25;
    border:1px solid #293342;
    border-radius:16px;
    padding:18px;
    margin:12px 0;
}

h2{
    color:#ffffff;
}

label{
    display:block;
    margin-top:10px;
    color:#ffffff;
    font-weight:bold;
}

input,
select,
textarea{
    width:100%;
    padding:14px;
    margin:7px 0 13px;
    border-radius:9px;
    border:1px solid #303a4a;
    background:#0d1219;
    color:#ffffff;
    outline:none;
    font-size:16px;
}

input::placeholder,
textarea::placeholder{
    color:#8993a3;
}

input:focus,
select:focus,
textarea:focus{
    border-color:#f5b400;
}

.total{
    margin:18px 0;
    padding:14px;
    background:#0d1219;
    border-radius:10px;
    font-size:21px;
    font-weight:bold;
    color:#ffffff;
}

#price{
    color:#ffffff;
    font-size:24px;
}

.small{
    color:#aab3c0;
    font-size:14px;
}

.ok{
    color:#65e68b;
    margin-top:12px;
    font-weight:bold;
}

.err{
    color:#ff7676;
    margin-top:12px;
    font-weight:bold;
}

.hidden{
    display:none;
}

.history{
    background:#151b25;
    border:1px solid #293342;
    border-radius:14px;
    padding:14px;
    margin:10px 0;
}

.status{
    color:#ffd447;
    font-weight:bold;
}

.author{
    text-align:center;
    color:#aeb6c3;
    margin:30px 0 10px;
    font-size:13px;
}

.uc-info{
    margin-top:10px;
    padding:10px;
    background:#10151e;
    border-radius:8px;
    color:#b8c0cc;
}

@media(max-width:500px){

    header h1{
        font-size:25px;
    }

    .nav button{
        padding:10px 5px;
        font-size:12px;
    }

}

</style>
</head>

<body>

<header>

<h1>🔥 UC SERVIS</h1>

<p>PUBG Mobile UC xizmatlari</p>

</header>


<div class="container">


<!-- NAVIGATION -->

<div class="nav">

<button onclick="page('shop')">
🛒 Buyurtma
</button>

<button onclick="page('history')">
📋 Buyurtmalar
</button>

<button onclick="page('complaint')">
📝 Murojaat
</button>

</div>


<!-- SHOP -->

<section id="shop">

<div class="form">

<h2>💎 UC buyurtma</h2>

<label>
UC miqdori
</label>

<input
id="uc"
type="number"
min="60"
max="30000"
step="1"
placeholder="Masalan: 60"
oninput="quote()"
>

<div class="small">
60–30 000 UC oralig‘ida miqdor kiriting.
</div>


<div class="total">

Jami:

<span id="price">0</span>

so‘m

</div>


<div id="ucInfo" class="uc-info">
UC miqdorini kiriting.
</div>


<label>
🆔 PUBG ID
</label>

<input
id="pubg"
type="text"
placeholder="PUBG ID"
>


<button
style="width:100%;"
onclick="checkPubg()"
>
🔎 PUBG ID ni tekshirish
</button>


<div id="pubgMsg"></div>


<label>
📱 Telefon
</label>

<input
id="phone"
type="text"
placeholder="+998 XX XXX XX XX"
>


<label>
💳 To‘lov
</label>

<select id="payment">

<option value="Payme">
Payme
</option>

<option value="Click">
Click
</option>

<option value="Uzcard">
Uzcard
</option>

<option value="Humo">
Humo
</option>

</select>


<button
style="width:100%; margin-top:8px;"
onclick="order()"
>

🛒 Buyurtma berish

</button>


<div id="msg"></div>

</div>

</section>



<!-- HISTORY -->

<section
id="history"
class="hidden"
>

<div class="form">

<h2>📋 Buyurtmalarim</h2>

<input
id="hphone"
placeholder="Telefon raqamingiz"
>

<button
style="width:100%;"
onclick="historyLoad()"
>
Ko‘rish
</button>

</div>

<div id="list"></div>

</section>



<!-- COMPLAINT -->

<section
id="complaint"
class="hidden"
>

<div class="form">

<h2>📝 Shikoyat / murojaat</h2>

<input
id="cphone"
placeholder="Telefon"
>

<textarea
id="ctext"
rows="6"
placeholder="Murojaatingiz..."
></textarea>

<button
style="width:100%;"
onclick="complaint()"
>
Yuborish
</button>

<div id="cmsg"></div>

</div>

</section>



<div class="author">

Muallif: khayitovEldor

</div>

</div>



<script>


// ==========================================
// UC SOTUV NARXLARI
// ==========================================

const prices = [

[60,11500],
[120,23000],
[180,34500],
[240,46000],
[300,57500],
[360,69000],
[420,80500],
[480,92000],
[540,103500],
[600,115000],
[660,117000],
[720,126000],
[840,147000],
[960,223500],
[1080,251500],
[1200,279500],
[1500,346000],
[1800,392500],
[2000,439000],
[2500,545500],
[3000,651500],
[4000,864500],
[5000,1064000],
[6000,1263500],
[8000,1662500],
[10000,2061500],
[15000,3059000],
[20000,4056500],
[25000,5054000],
[30000,6051500]

];


// ==========================================
// PUL FORMAT
// ==========================================

function money(number){

    return Number(number || 0)
        .toLocaleString("uz-UZ");

}


// ==========================================
// UC NARXINI HISOBLASH
// ==========================================

function localQuote(q){

    q = Number(q);

    if(
        !Number.isFinite(q) ||
        q < 60 ||
        q > 30000
    ){
        return null;
    }


    // Aniq narx
    for(
        let i=0;
        i<prices.length;
        i++
    ){

        if(
            q === prices[i][0]
        ){

            return prices[i][1];

        }

    }


    // Oraliq narx
    for(
        let i=0;
        i<prices.length-1;
        i++
    ){

        const x1 = prices[i][0];
        const y1 = prices[i][1];

        const x2 = prices[i+1][0];
        const y2 = prices[i+1][1];


        if(
            q > x1 &&
            q < x2
        ){

            return Math.round(

                y1 +

                (q-x1) *

                (y2-y1) /

                (x2-x1)

            );

        }

    }


    return null;

}


// ==========================================
// NARXNI KO‘RSATISH
// ==========================================

function quote(){

    const input =
        document.getElementById("uc");

    const price =
        document.getElementById("price");

    const info =
        document.getElementById("ucInfo");


    const q =
        Number(input.value);


    const p =
        localQuote(q);


    if(p){

        price.textContent =
            money(p);


        info.textContent =
            q.toLocaleString("uz-UZ") +
            " UC narxi: " +
            money(p) +
            " so‘m";

    }
    else{

        price.textContent =
            "0";

        info.textContent =
            "60–30 000 UC oralig‘ida miqdor kiriting.";

    }

}


// ==========================================
// PUBG ID TEKSHIRISH
// ==========================================

async function checkPubg(){

    const playerId =
        document
        .getElementById("pubg")
        .value
        .trim();


    const msg =
        document
        .getElementById("pubgMsg");


    if(!playerId){

        msg.className = "err";

        msg.textContent =
            "PUBG ID kiriting.";

        return;

    }


    msg.className = "small";

    msg.textContent =
        "⏳ PUBG ID tekshirilmoqda...";


    try{

        const response =
            await fetch(
                "/api/pubg/validate",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            player_id:playerId
                        })
                }
            );


        const data =
            await response.json();


        if(
            !response.ok ||
            !data.ok
        ){

            throw new Error(
                data.error ||
                "PUBG ID tasdiqlanmadi."
            );

        }


        msg.className = "ok";

        msg.textContent =
            "✅ PUBG ID tasdiqlandi!" +
            (
                data.player_name
                ? " Nick: " +
                  data.player_name
                : ""
            );


    }
    catch(error){

        msg.className = "err";

        msg.textContent =
            "❌ " +
            error.message;

    }

}


// ==========================================
// BUYURTMA
// ==========================================

async function order(){

    const q =
        Number(
            document
            .getElementById("uc")
            .value
        );


    const pubgId =
        document
        .getElementById("pubg")
        .value
        .trim();


    const phone =
        document
        .getElementById("phone")
        .value
        .trim();


    const payment =
        document
        .getElementById("payment")
        .value;


    const msg =
        document
        .getElementById("msg");


    const price =
        localQuote(q);


    if(!price){

        show(
            "msg",
            "UC miqdori 60–30 000 oralig‘ida bo‘lishi kerak.",
            true
        );

        return;

    }


    if(!pubgId){

        show(
            "msg",
            "PUBG ID kiriting.",
            true
        );

        return;

    }


    if(!phone){

        show(
            "msg",
            "Telefon raqamingizni kiriting.",
            true
        );

        return;

    }


    /*
      Hozircha serverga buyurtma yuboramiz.
    */

    try{

        const response =
            await fetch(
                "/api/order",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            player_id:
                                pubgId,

                            uc:q,

                            price:price,

                            phone:phone,

                            payment:payment

                        })

                }
            );


        const data =
            await response.json();


        if(!response.ok){

            throw new Error(
                data.error ||
                "Buyurtma yuborilmadi."
            );

        }


        show(
            "msg",
            "✅ Buyurtma qabul qilindi."
        );


    }
    catch(error){

        show(
            "msg",
            error.message,
            true
        );

    }

}


// ==========================================
// TARIX
// ==========================================

async function historyLoad(){

    const phone =
        document
        .getElementById("hphone")
        .value
        .trim();


    const list =
        document
        .getElementById("list");


    if(!phone){

        list.innerHTML =
            '<div class="card">Telefon raqamingizni kiriting.</div>';

        return;

    }


    try{

        const response =
            await fetch(
                "/api/orders?phone=" +
                encodeURIComponent(phone)
            );


        const data =
            await response.json();


        if(
            !response.ok ||
            !data.orders
        ){

            list.innerHTML =
                '<div class="card">Buyurtmalarni olish imkoni bo‘lmadi.</div>';

            return;

        }


        if(
            data.orders.length === 0
        ){

            list.innerHTML =
                '<div class="card">Buyurtma topilmadi.</div>';

            return;

        }


        list.innerHTML =
            data.orders
            .slice()
            .reverse()
            .map(function(order){

                return `

                <div class="history">

                    <b>
                        Buyurtma #${order.id}
                    </b>

                    <p>
                        💎 ${Number(order.uc).toLocaleString()}
                        UC
                    </p>

                    <p>
                        💰 ${money(order.price)}
                        so‘m
                    </p>

                    <p class="status">
                        ${order.status}
                    </p>

                    <p class="small">
                        ${order.createdAt || ""}
                    </p>

                </div>

                `;

            })
            .join("");


    }
    catch(error){

        list.innerHTML =
            '<div class="card">' +
            error.message +
            '</div>';

    }

}


// ==========================================
// MUROJAAT
// ==========================================

async function complaint(){

    const phone =
        document
        .getElementById("cphone")
        .value
        .trim();


    const text =
        document
        .getElementById("ctext")
        .value
        .trim();


    if(!phone || !text){

        show(
            "cmsg",
            "Telefon va murojaatni kiriting.",
            true
        );

        return;

    }


    try{

        const response =
            await fetch(
                "/api/complaints",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            phone:phone,
                            text:text
                        })
                }
            );


        const data =
            await response.json();


        if(!response.ok){

            throw new Error(
                data.error ||
                "Murojaat yuborilmadi."
            );

        }


        show(
            "cmsg",
            "✅ Murojaat yuborildi."
        );


        document
        .getElementById("ctext")
        .value = "";


    }
    catch(error){

        show(
            "cmsg",
            error.message,
            true
        );

    }

}


// ==========================================
// XABAR
// ==========================================

function show(
    id,
    text,
    error
){

    const element =
        document.getElementById(id);


    element.className =
        error
        ? "err"
        : "ok";


    element.textContent =
        text;

}


// ==========================================
// SAHIFA
// ==========================================

function page(id){

    const pages = [
        "shop",
        "history",
        "complaint"
    ];


    pages.forEach(function(name){

        document
        .getElementById(name)
        .classList
        .add("hidden");

    });


    document
    .getElementById(id)
    .classList
    .remove("hidden");

}


// ==========================================
// START
// ==========================================

page("shop");

</script>

</body>
</html>
