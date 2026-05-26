export default async function Home(){

const grains=await getStats();

const avg=(k:string)=>

Math.round(
grains.reduce(
(a:any,b:any)=>
a+b[k],0
)
/Math.max(
grains.length,1
)
);

return(

<main className="p-10">

<h1 className="text-4xl">

☕ MoreGrains

</h1>

<p>

Зёрен собрано:
{grains.length}

</p>

<div className="mt-8">

🧠 Экспертность:
{avg("expertise")}%

</div>

<div>

❤️ Близость:
{avg("relationships")}%

</div>

<div>

👐 Сила действия:
{avg("action_power")}%

</div>

<div>

🫀 Внутренняя опора:
{avg("stability")}%

</div>

</main>

)

}