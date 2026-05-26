async function getStats() {
  return [];
}

export default async function Home() {

  const grains = await getStats();

  const avg = (k: string) => {

    if (grains.length === 0) return 0;

    return Math.round(
      grains.reduce(
        (a: number, b: any) =>
          a + (b[k] || 0),
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
        Зёрен собрано: {grains.length}
      </p>

      <div className="mt-8 space-y-4">

        <div>
          🧠 Экспертность: {avg("expertise")}%
        </div>

        <div>
          ❤️ Близость: {avg("relationships")}%
        </div>

        <div>
          👐 Сила действия: {avg("action_power")}%
        </div>

        <div>
          🫀 Внутренняя опора: {avg("stability")}%
        </div>

      </div>

    </main>
  );
}