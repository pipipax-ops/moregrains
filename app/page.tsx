import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    user?: string;
  }>;
}) {

  const params =
    await searchParams;

  let query =
    supabase

      .from("grains")

      .select("*")

      .order(
        "created_at",
        {
          ascending:
            false
        }
      );

  if (
    params.user
  ) {

    query =
      query.eq(
        "user_id",
        params.user
      );

  }

  const {
    data: grains
  } = await query;

  const avg = (
    k: string
  ) => {

    if (
      !grains?.length
    ) return 0;

    return Math.round(

      grains.reduce(

        (
          a: number,
          b: any
        ) =>

          a +
          (
            b[k] || 0
          ),

        0

      ) /

      grains.length

    );

  };

  return (

<main className="p-10 max-w-4xl mx-auto">

<h1 className="text-4xl mb-6">

☕ MoreGrains

</h1>

<p className="mb-8">

Зёрен собрано:

{grains?.length || 0}

</p>

<div className="space-y-3 mb-10">

<div>

🧠 Экспертность:

{avg(
"expertise"
)}%

<br/>

<small>

Рост через знания,
обучение,
работу,
выступления

</small>

</div>

<div>

❤️ Близость:

{avg(
"relationships"
)}%

<br/>

<small>

Любовь,
дружба,
семья

</small>

</div>

<div>

👐 Сила действия:

{avg(
"action_power"
)}%

<br/>

<small>

Решения,
спорт,
движение

</small>

</div>

<div>

🫀 Внутренняя опора:

{avg(
"stability"
)}%

<br/>

<small>

Осознанность,
устойчивость

</small>

</div>

</div>

<div className="space-y-4">

{

grains?.map(
(
g:any
)=>(

<div
key={g.id}
className=
"border rounded p-4"
>

<div>

🗓

{

new Date(
g.created_at
)

.toLocaleString()

}

</div>

<div>

☕ Копилка:

{g.bucket}

</div>

<div>

🌱

{g.reason_to_value}

</div>

<div>

📈 Вклад:

🧠 +{g.expertise}

❤️ +{g.relationships}

👐 +{g.action_power}

🫀 +{g.stability}

</div>

</div>

)

)

}

</div>

</main>

);

}