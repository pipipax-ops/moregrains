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

  let query = supabase

    .from("grains")

    .select(
      "*",
      {
        count:
          "exact"
      }
    )

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
    data: grains,
    count
  } = await query;

  const total = (
    k: string
  ) => {

    if (
      !grains?.length
    ) return 0;

    return grains.reduce(

      (
        a:number,
        b:any
      ) =>

        a +

        (
          b[k] || 0
        ),

      0

    );

  };

  return (

<main className="p-10 max-w-4xl mx-auto">

<h1 className="text-4xl mb-6">

☕ MoreGrains

</h1>

<p className="mb-8">

Зёрен собрано:

{count || 0}

</p>

<div className="space-y-4 mb-10">

<div>

🧠 Экспертность:

{total(
"expertise"
)}

<br/>

<small>

Рост через знания,
дегустации,
обучение,
работу,
выступления

</small>

</div>

<div>

❤️ Близость:

{total(
"relationships"
)}

<br/>

<small>

Любовь,
семья,
отношения,
друзья

</small>

</div>

<div>

👐 Сила действия:

{total(
"action_power"
)}

<br/>

<small>

Решения,
спорт,
движение,
инициатива

</small>

</div>

<div>

🫀 Внутренняя опора:

{total(
"stability"
)}

<br/>

<small>

Осознанность,
спокойствие,
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