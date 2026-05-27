import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function bucketName(
bucket:string
){

if(bucket==="expertise")
return "Мастерство";

if(bucket==="relationships")
return "Связи";

if(bucket==="action_power")
return "Движение";

if(bucket==="stability")
return "Опора";

return "Путь";

}

export default async function Home({

searchParams,

}:{

searchParams:Promise<{
user?:string;
}>;

}){

const params=
await searchParams;

let query=

supabase

.from(
"grains"
)

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

if(
params.user
){

query=
query.eq(
"user_id",
params.user
);

}

const {

data:grains,

count

}=await query;

const total=(

k:string

)=>{

if(
!grains?.length
)
return 0;

return grains.reduce(

(
a:number,
b:any
)=>

a+
(
b[k]||0
),

0

);

};

const today=
new Date()
.toDateString();

const todayCount=

grains?.filter(

(g:any)=>

new Date(
g.created_at
)

.toDateString()

===today

)

.length || 0;

return(

<main className=

"p-8 max-w-4xl mx-auto"

>

<h1 className=

"text-4xl mb-8"

>

☕ MoreGrains

</h1>

<div className=

"mb-10 space-y-3"

>

<div>

☕ Чашка

<b>

{todayCount}

</b>

</div>

<div>

🫙 Банка

<b>

{count || 0}

</b>

</div>

</div>

<div className=

"space-y-6 mb-10"

>

<div>

🧠 Мастерство

<b>

{total(
"expertise"
)}

</b>

<br/>

<small>

обучение,
работа,
контент,
выступления

</small>

</div>

<div>

❤️ Связи

<b>

{total(
"relationships"
)}

</b>

<br/>

<small>

семья,
друзья,
близость

</small>

</div>

<div>

👐 Движение

<b>

{total(
"action_power"
)}

</b>

<br/>

<small>

спорт,
создание,
решения

</small>

</div>

<div>

🫀 Опора

<b>

{total(
"stability"
)}

</b>

<br/>

<small>

сон,
рефлексия,
устойчивость

</small>

</div>

</div>

<div className=

"space-y-5"

>

{

grains?.map(

(
g:any
)=>(

<div

key={g.id}

className=

"border rounded-xl p-5"

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

<div className=

"mt-2"

>

🫙

{

bucketName(
g.bucket
)

}

</div>

<div className=

"mt-4"

>

◌

{g.reason_to_value}

</div>

{

g.advice && (

<div className=

"mt-2 text-sm opacity-80"

>

→

{g.advice}

</div>

)

}

<div className=

"mt-4 text-sm"

>

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