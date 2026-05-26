require("dotenv").config({ path: ".env.local" });

const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const bot = new TelegramBot(
 process.env.TELEGRAM_BOT_TOKEN,
 {
   polling: {
     interval: 300,
     autoStart: true,
     params: {
       timeout: 10
     }
   }
 }
);

bot.on("polling_error", (err)=>{

 console.log(
   "TG ERROR:",
   err.message
 );

});

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

bot.on("message", async (msg)=>{

 const userText = msg.text;

 const completion =
 await openai.chat.completions.create({

 model:"gpt-4.1-mini",

 response_format:{type:"json_object"},

 messages:[

{
role:"system",

content:`

Ты психологический ассистент MoreGrains.

Из текста пользователя выдели:

Верни JSON:

{

"category":"",

"emotion":"",

"reason_to_value":"",

"expertise":0,

"relationships":0,

"action_power":0,

"stability":0,

"encouragement":"",

"advice":""

}

Шкалы:

expertise:

знания, рост, навыки

relationships:

близость, контакт, открытость

action_power:

действия, смелость, лидерство

stability:

самоопора, забота о себе, устойчивость

encouragement:

короткая поддерживающая фраза

advice:

одно маленькое действие

`
},

{
role:"user",
content:userText
}

]

});

const data =
JSON.parse(
completion.choices[0].message.content
);

await supabase
.from("grains")
.insert({

raw_text:userText,

category:data.category,

emotion:data.emotion,

reason_to_value:data.reason_to_value,

expertise:data.expertise,

relationships:data.relationships,

action_power:data.action_power,

stability:data.stability

});

await bot.sendMessage(

msg.chat.id,

`
☕ +1 зерно

👤 Наполненность

🧠 Экспертность:
${data.expertise}%

❤️ Близость:
${data.relationships}%

👐 Сила действия:
${data.action_power}%

🫀 Внутренняя опора:
${data.stability}%

🌱 Причина ценности:

${data.reason_to_value}

💬 Поддержка:

${data.encouragement}

➡️ Маленький шаг:

${data.advice}

`
);

});

console.log("BOT STARTED");