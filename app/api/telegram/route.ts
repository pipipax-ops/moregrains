import OpenAI from "openai";
import { createClient }
from "@supabase/supabase-js";

const openai = new OpenAI({
 apiKey:
 process.env.OPENAI_API_KEY
});

const supabase =
createClient(

process.env
.NEXT_PUBLIC_SUPABASE_URL!,

process.env
.NEXT_PUBLIC_SUPABASE_ANON_KEY!

);

export async function POST(
req:Request
){

const body=
await req.json();

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
await openai.chat
.completions.create({

model:"gpt-4.1-mini",

response_format:{
type:"json_object"
},

messages:[

{
role:"system",

content:`

Верни JSON:

{

"reason_to_value":"",

"encouragement":"",

"advice":""

}

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
.message.content!
);

await supabase
.from("grains")
.insert({

raw_text:msg,

reason_to_value:
data.reason_to_value,

encouragement:
data.encouragement,

advice:
data.advice

});

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

chat_id:chatId,

text:

`
☕ +1 зерно

🌱 Ценность:

${data.reason_to_value}

💬 Поддержка:

${data.encouragement}

➡️ Шаг:

${data.advice}
`

})

}

);

return Response.json({
ok:true
});

}import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();

  const msg = body.message?.text;
  const chatId = body.message?.chat?.id;

  if (!msg || !chatId) {
    return Response.json({ ok: true });
  }

  const completion =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content: `
Ты ассистент MoreGrains.

Ответь:

☕ +1 зерно

Причина ценности:
...

Поддержка:
...
`
        },

        {
          role: "user",
          content: msg
        }
      ]
    });

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        chat_id: chatId,

        text:
          completion
            .choices[0]
            .message
            .content
      })
    }
  );

  return Response.json({
    ok: true
  });
}
