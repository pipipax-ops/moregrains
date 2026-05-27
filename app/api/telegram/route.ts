import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function bucketName(
bucket:string
){

if(bucket==="expertise")
return "Мастерство";

if(bucket==="relationships")
return "Связи";

if(bucket==="action_power")
return "Движение";

if(bucket==="stability")
return "Опора";

return "Путь";

}

export async function POST(
req:Request
){

const body=
await req.json();

let msg=
body.message?.text;

const chatId=
body.message?.chat?.id;

const userId=
body.message?.from?.id
?.toString();

const voice=
body.message?.voice;

if(voice){

const fileInfo=
await fetch(

`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${voice.file_id}`

);

const fileData=
await fileInfo.json();

const filePath=
fileData.result.file_path;

const audioUrl=

`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;

const audioRes=
await fetch(
audioUrl
);

const audioBlob=
await audioRes.blob();

const form=
new FormData();

form.append(
"file",
audioBlob,
"voice.ogg"
);

form.append(
"model",
"gpt-4o-mini-transcribe"
);

const transcript=
await fetch(

"https://api.openai.com/v1/audio/transcriptions",

{

method:"POST",

headers:{

Authorization:

`Bearer ${process.env.OPENAI_API_KEY}`

},

body:form

}

);

const textData=
await transcript.json();

msg=
textData.text;

}

if(
!msg||
!chatId
){

return Response.json({
ok:true
});

}

const completion=
await openai.chat
.completions.create({

model:
"gpt-4.1-mini",

response_format:{
type:
"json_object"
},

messages:[

{

role:"system",

content:`

Верни JSON:

{

"reason_to_value":"",

"advice":"",

"bucket":""

}

Выбери ТОЛЬКО ОДНУ главную банку.

Никогда не выбирай несколько.

🧠 expertise

работа,
обучение,
создание,
контент,
выступления

❤️ relationships

семья,
любовь,
друзья,
отношения

👐 action_power

спорт,
действие,
инициатива,
решение

🫀 stability

рефлексия,
смысл,
сон,
осознанность,
спокойствие

Примеры:

"Сделал бота"

bucket=expertise

"Задался смыслом жизни"

bucket=stability

"Пошёл тренироваться"

bucket=action_power

reason_to_value:

до 10 слов

advice:

до 6 слов

`

},

{

role:"user",

content:msg

}

]

});

const data=
JSON.parse(

completion
.choices[0]
.message
.content!

);

let expertise=0;
let relationships=0;
let action_power=0;
let stability=0;

if(
data.bucket==="expertise"
)
expertise=1;

if(
data.bucket==="relationships"
)
relationships=1;

if(
data.bucket==="action_power"
)
action_power=1;

if(
data.bucket==="stability"
)
stability=1;

await supabase

.from(
"grains"
)

.insert({

user_id:userId,

raw_text:msg,

reason_to_value:
data.reason_to_value,

advice:
data.advice,

bucket:
data.bucket,

expertise,

relationships,

action_power,

stability

});

const {
count
}=await supabase

.from(
"grains"
)

.select(
"id",
{
count:"exact",
head:true
}
)

.eq(
"user_id",
userId
);

const today=
new Date()
.toDateString();

const {
data:todayGrains
}=await supabase

.from(
"grains"
)

.select(
"created_at"
)

.eq(
"user_id",
userId
);

const todayCount=

todayGrains?.filter(

(g:any)=>

new Date(
g.created_at
)

.toDateString()

===today

)

.length || 0;

await fetch(

`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,

{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({

chat_id:
chatId,

parse_mode:
"Markdown",

text:

`☕ +1 зерно · ☕ ${todayCount} · 🫙 ${count ?? 0}

_Главная банка_

*${bucketName(
data.bucket
)}*

🧠 ${expertise} · ❤️ ${relationships} · 👐 ${action_power} · 🫀 ${stability}

———

${data.reason_to_value}

→ ${data.advice}

⌁ https://moregrains.vercel.app?user=${userId}

`

})

}

);

return Response.json({
ok:true
});

}