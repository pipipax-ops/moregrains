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

  const params = await searchParams;

  let query = supabase
    .from("grains")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (params.user) {

    query = query.eq(
      "user_id",
      params.user
    );

  }

  const {
    data: grains
  } = await query;

  const avg = (k: string) => {

    if (!grains?.length)
      return 0;

    return Math.round(

      grains.reduce(

        (
          a: number,
          b: any
        ) =>

          a + (
            b[k] || 0
          ),

        0

      ) / grains.length

    );

  };

  return (

    <main className="p-10">

      <h1 className="text-4xl mb-6">

        ☕ MoreGrains

      </h1>

      <p>

        Зёрен собрано:

        {grains?.length || 0}

      </p>

      <div className="mt-8 space-y-4">

        <div>
          🧠 Экспертность:
          {avg(
            "expertise"
          )}%
        </div>

        <div>
          ❤️ Близость:
          {avg(
            "relationships"
          )}%
        </div>

        <div>
          👐 Сила действия:
          {avg(
            "action_power"
          )}%
        </div>

        <div>
          🫀 Внутренняя опора:
          {avg(
            "stability"
          )}%
        </div>

      </div>

      <div className="mt-10">

        {

          grains?.map(
            (g: any) => (

              <div
                key={g.id}
                className="border p-4 mb-4 rounded"
              >

                <div>

                  🌱

                  {g.reason_to_value}

                </div>

                <div>

                  💬

                  {g.encouragement}

                </div>

                <div>

                  ➡️

                  {g.advice}

                </div>

              </div>

            )
          )

        }

      </div>

    </main>

  );

}