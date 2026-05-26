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

  const msg = body.message?.text;
  const chatId = body.message?.chat?.id;

  if (!msg || !chatId) {
    return Response.json({ ok: true });
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

  const { count } = await supabase
  .from("grains")
  .select("*", {
    count: "exact",
    head: true
  });

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

📈 Общая статистика

Зёрен собрано:

${count ?? 0}

🔥 Последняя серия:

${total}

🌱 Причина ценности:

${data.reason_to_value}

💬 Поддержка:

${data.encouragement}

➡️ Следующий шаг:

${data.advice}

`

      })

    }
  );

  return Response.json({
    ok: true
  });

}
