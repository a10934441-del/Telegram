// app.js
const tg = window.Telegram.WebApp;
tg.expand();

const screens = document.querySelectorAll(".screen");
document.querySelectorAll(".navbar button").forEach(b=>{
  b.onclick=()=>navigate(b.dataset.nav);
});

function navigate(id){
  screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

let balance = 10000;
let inventory = [];
let cooldown = false;

const ITEMS = [
  { id:1, name:"Stone", price:50, img:"assets/stone.png", chance:60 },
  { id:2, name:"Crystal", price:200, img:"assets/crystal.png", chance:30 },
  { id:3, name:"Relic", price:1000, img:"assets/relic.png", chance:9 },
  { id:4, name:"Artifact", price:5000, img:"assets/artifact.png", chance:1 }
];

const caseItemsBox = document.getElementById("case-items");
ITEMS.forEach(i=>{
  const d=document.createElement("div");
  d.className="preview-item";
  d.innerHTML=`<img src="${i.img}"><small>${i.name}</small>`;
  caseItemsBox.appendChild(d);
});

function roll(){
  let r=Math.random()*100,sum=0;
  for(const i of ITEMS){ sum+=i.chance; if(r<=sum) return i; }
}

const roulette=document.getElementById("roulette");
const spinBtn=document.getElementById("spin");
const cooldownBox=document.getElementById("cooldown");

spinBtn.onclick=()=>{
  if(cooldown||balance<100) return;
  cooldown=true;
  balance-=100;
  updateBalance();
  cooldownBox.textContent="Открытие...";
  roulette.innerHTML="";
  const win=roll();
  const list=[];
  for(let i=0;i<40;i++) list.push(roll());
  list[30]=win;
  list.forEach(it=>{
    const el=document.createElement("div");
    el.className="item";
    el.innerHTML=`<img src="${it.img}" width="48"><small>${it.name}</small>`;
    roulette.appendChild(el);
  });
  roulette.style.transition="none";
  roulette.style.transform="translateX(0)";
  requestAnimationFrame(()=>{
    roulette.style.transition="transform 4s cubic-bezier(.08,.6,0,1)";
    roulette.style.transform="translateX(-2800px)";
  });
  setTimeout(()=>{
    inventory.push(win);
    renderInventory();
    cooldownBox.textContent="";
    cooldown=false;
  },4200);
};

function renderInventory(){
  const box=document.getElementById("inventory");
  box.innerHTML="";
  inventory.forEach(i=>{
    const d=document.createElement("div");
    d.className="inventory-item";
    d.innerHTML=`<img src="${i.img}"><small>${i.name}<br>${i.price}🪙</small>`;
    box.appendChild(d);
  });
}

document.getElementById("coinflip").onclick=()=>{
  if(!inventory.length) return;
  const item=inventory.pop();
  if(Math.random()>0.5){
    item.price*=2;
    inventory.push(item);
    document.getElementById("minigame-result").textContent="Победа!";
  }else{
    document.getElementById("minigame-result").textContent="Проигрыш!";
  }
  renderInventory();
};

function updateBalance(){
  document.getElementById("balance").textContent=balance;
}

const user=tg.initDataUnsafe?.user;
if(user){
  document.getElementById("username").textContent=user.username||user.first_name;
  document.getElementById("avatar").src=user.photo_url||"assets/avatar.png";
  document.getElementById("ref").value=`https://t.me/yourbot?start=${user.id}`;
}  
