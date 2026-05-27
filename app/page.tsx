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

searchParams:
Promise<{
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
count:"exact"
}
)

.order(
"created_at",
{
ascending:false
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

const total=(k:string)=>{

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

"max-w-4xl mx-auto p-8"

>

<h1 className=

"text-5xl mb-8"

>

☕ MoreGrains

</h1>

<div className=

"border rounded-xl p-5 mb-8"

>

<div className=

"text-lg"

>

☕ <i>Чашка</i>

<b>

{todayCount}

</b>

·

🫙 <b>

Банка

</b>

{count||0}

</div>

</div>

<div className=

"grid gap-4 mb-8"

>

<div>

🧠 <b>

Мастерство

</b>

—

{total(
"expertise"
)}

</div>

<small>

обучение ·
контент ·
создание

</small>

<div>

❤️ <b>

Связи

</b>

—

{total(
"relationships"
)}

</div>

<small>

любовь ·
семья ·
друзья

</small>

<div>

👐 <b>

Движение

</b>

—

{total(
"action_power"
)}

</div>

<small>

спорт ·
действие ·
решения

</small>

<div>

🫀 <b>

Опора

</b>

—

{total(
"stability"
)}

</div>

<small>

рефлексия ·
сон ·
спокойствие

</small>

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

"border rounded-xl p-5"

>

<div className=

"text-sm opacity-70"

>

🗓 {

new Date(
g.created_at
)

.toLocaleString()

}

</div>

<div className=

"mt-2"

>

🫙 <b>

{

bucketName(
g.bucket
)

}

</b>

</div>

<div className=

"mt-4 italic"

>

{

g.reason_to_value

}

</div>

{

g.advice && (

<div className=

"mt-2 underline"

>

→ {

g.advice

}

</div>

)

}

<div className=

"mt-4"

>

🧠 {

g.expertise

}

·

❤️ {

g.relationships

}

·

👐 {

g.action_power

}

·

🫀 {

g.stability

}

</div>

</div>

)

)

}

</div>

</main>

);

}