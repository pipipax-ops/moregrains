import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {

  const body = await req.json();

 let msg = body.message?.text;

const chatId = body.message?.chat?.id;
const userId =
body.message?.from?.id?.toString();

const username =
body.message?.from?.username
|| "anonymous";

const voice =
body.message?.voice;

if (voice) {

const fileInfo =
await fetch(

`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${voice.file_id}`

);

const fileData =
await fileInfo.json();

const filePath =
fileData.result.file_path;

const audioUrl =

`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;

const audioRes =
await fetch(audioUrl);

const audioBlob =
await audioRes.blob();

const form =
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

const transcript =
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

const textData =
await transcript.json();

msg = textData.text;

}

if (!msg || !chatId) {

return Response.json({
ok:true
});

}

  const completion =
    await openai.chat.completions.create({

      model: "gpt-4.1-mini",

      response_format: {
        type: "json_object"
      },

      messages: [

        {
          role: "system",

          content: `

Верни JSON:

{
 "reason_to_value":"",
 "encouragement":"",
 "advice":""
}

`
        },

        {
          role: "user",
          content: msg
        }

      ]

    });

  const data =
    JSON.parse(
      completion
        .choices[0]
        .message
        .content!
    );

  const { count } =
await supabase

.from("grains")

.select("*",{

count:"exact",
head:true

})

.eq(
"user_id",
userId
);

const { data: lastGrains } = await supabase
  .from("grains")
  .select("*")
  .order(
    "created_at",
    { ascending: false }
  )
  .limit(5);

const total =
  lastGrains?.length || 1;
  await supabase
.from("grains")
.insert({

user_id:userId,

username:username,

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

      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

        chat_id: chatId,

        text:

`☕ +1 зерно

👤 ${username}

📈 Твои зёрна:
${count ?? 0}

🎤 Распознано:

${msg}

🌱 ${data.reason_to_value}

💬 ${data.encouragement}

➡️ ${data.advice}`

      })

    }
  );

  return Response.json({
    ok: true
  });

}
