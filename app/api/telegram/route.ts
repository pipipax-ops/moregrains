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

  const chatId =
    body.message?.chat?.id;

  const userId =
    body.message?.from?.id
      ?.toString();

  const username =
    body.message?.from
      ?.username
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
      fileData.result
        .file_path;

    const audioUrl =

`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;

    const audioRes =
      await fetch(
        audioUrl
      );

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

          method: "POST",

          headers: {

            Authorization:

`Bearer ${process.env.OPENAI_API_KEY}`

          },

          body: form

        }

      );

    const textData =
      await transcript
        .json();

    msg = textData.text;

  }

  if (
    !msg ||
    !chatId
  ) {

    return Response.json({
      ok: true
    });

  }

  const completion =
    await openai
      .chat
      .completions
      .create({

        model:
          "gpt-4.1-mini",

        response_format: {
          type:
            "json_object"
        },

        messages: [

          {

            role:
              "system",

            content: `

Верни JSON:

{

"reason_to_value":"",

"encouragement":"",

"advice":"",

"expertise":0,

"relationships":0,

"action_power":0,

"stability":0,

"bucket":""

}

Правила:

expertise:

обучение,
работа,
знания,
выступления

relationships:

любовь,
семья,
друзья

action_power:

действия,
спорт,
решения

stability:

осознанность,
спокойствие

bucket:

главная область роста

`

          },

          {

            role:
              "user",

            content:
              msg

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

  await supabase

    .from(
      "grains"
    )

    .insert({

      user_id:
        userId,

      username:
        username,

      raw_text:
        msg,

      reason_to_value:
        data
          .reason_to_value,

      encouragement:
        data
          .encouragement,

      advice:
        data
          .advice,

      expertise:
        data
          .expertise,

      relationships:
        data
          .relationships,

      action_power:
        data
          .action_power,

      stability:
        data
          .stability,

      bucket:
        data
          .bucket

    });

  const { count } =

    await supabase

      .from(
        "grains"
      )

      .select(
        "*",
        {
          count:
            "exact",

          head:
            true
        }
      )

      .eq(
        "user_id",
        userId
      );

  await fetch(

`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,

    {

      method:
        "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body:
        JSON.stringify({

          chat_id:
            chatId,

          text:

`☕ +1 зерно

👤 ${username}

📈 Твои результаты

Зёрен:

${count ?? 0}

🗂 Копилка:

${data.bucket}

🧠 +${data.expertise}

❤️ +${data.relationships}

👐 +${data.action_power}

🫀 +${data.stability}

🌱

${data.reason_to_value}

💬

${data.encouragement}

➡️

${data.advice}

📊 История:

https://moregrains.vercel.app?user=${userId}

`

        })

    }

  );

  return Response.json({
    ok: true
  });

}