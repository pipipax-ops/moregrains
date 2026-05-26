import OpenAI from "openai";

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req:Request){

 const body=await req.json();

 const msg=
 body.message?.text;

 const chatId=
 body.message?.chat?.id;

 if(!msg){

return Response.json({
ok:true
});

 }

 const completion=
 await openai.chat.completions.create({

model:"gpt-4.1-mini",

messages:[

{
role:"system",

content:`

Ты ассистент MoreGrains.

Верни:

☕ +1 зерно

Причина ценности:
...

Поддержка:
...

`

},

{
role:"user",
content:msg
}

]

});

await fetch(

`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,

{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

chat_id:chatId,

text:
completion
.choices[0]
.message
.content

})

}

);

return Response.json({
ok:true
});

}