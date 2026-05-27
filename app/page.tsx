import { createClient } from "@supabase/supabase-js";

const supabase = createClient(

process.env
.NEXT_PUBLIC_SUPABASE_URL!,

process.env
.NEXT_PUBLIC_SUPABASE_ANON_KEY!

);

function bucketName(
bucket:string
){

if(
bucket==="expertise"
)
return "Мастерство";

if(
bucket==="relationships"
)
return "Связи";

if(
bucket==="action_power"
)
return "Движение";

if(
bucket==="stability"
)
return "Опора";

return "Жизнь";

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

const value=

grains.reduce(

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

return Math.min(
5,
value
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

"p-10 max-w-4xl mx-auto"

>

<h1 className=

"text-4xl mb-8"

>

☕ MoreGrains

</h1>

<div className=

"mb-10 space-y-2"

>

<div>

◌ Чаша дня

<b>

{todayCount}

</b>

</div>

<div>

🫙 Всего зёрен

<b>

{count || 0}

</b>

</div>

</div>

<div className=

"space-y-5 mb-10"

>

<div>

🧠 Мастерство

{total(
"expertise"
)}/5

<br/>

<small>

дегустации,
обучение,
работа,
развитие

</small>

</div>

<div>

❤️ Связи

{total(
"relationships"
)}/5

<br/>

<small>

любовь,
семья,
друзья

</small>

</div>

<div>

👐 Движение

{total(
"action_power"
)}/5

<br/>

<small>

спорт,
решения,
действие

</small>

</div>

<div>

🫀 Опора

{total(
"stability"
)}/5

<br/>

<small>

спокойствие,
осознанность,
устойчивость

</small>

</div>

</div>

<div className=

"space-y-4"

>

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

🫙

{

bucketName(
g.bucket
)

}

</div>

<div className=

"mt-2"

>

🌱

{g.reason_to_value}

</div>

<div className=

"mt-2 text-sm"

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