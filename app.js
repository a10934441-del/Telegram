// app.js
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".navbar button");

const roulette = document.getElementById("roulette");
const resultBox = document.getElementById("result");
const inventoryBox = document.getElementById("inventory");
const balanceEl = document.getElementById("balance");

let balance = 10000;
let inventory = [];

const ITEMS = [
  { name: "Common", rarity: "common", chance: 70 },
  { name: "Rare", rarity: "rare", chance: 20 },
  { name: "Epic", rarity: "epic", chance: 7 },
  { name: "Legendary", rarity: "legendary", chance: 2.5 },
  { name: "Knife", rarity: "knife", chance: 0.5 }
];

function navigate(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

navButtons.forEach(btn => {
  btn.onclick = () => navigate(btn.dataset.nav);
});

document.querySelectorAll(".case-card").forEach(card => {
  card.onclick = () => navigate("screen-open");
});

function rollItem() {
  let roll = Math.random() * 100;
  let sum = 0;
  for (const item of ITEMS) {
    sum += item.chance;
    if (roll <= sum) return item;
  }
}

function buildRoulette(winItem) {
  roulette.innerHTML = "";
  const list = [];
  for (let i = 0; i < 45; i++) list.push(rollItem());
  const winIndex = 32;
  list[winIndex] = winItem;

  list.forEach(i => {
    const el = document.createElement("div");
    el.className = `item ${i.rarity}`;
    el.textContent = i.name;
    roulette.appendChild(el);
  });

  return winIndex;
}

document.getElementById("spin").onclick = () => {
  if (balance < 100) return;
  balance -= 100;
  balanceEl.textContent = balance.toLocaleString();

  resultBox.textContent = "";
  const winItem = rollItem();
  const index = buildRoulette(winItem);

  const itemWidth = 96;
  const center =
    roulette.parentElement.offsetWidth / 2 - itemWidth / 2;
  const targetX = -(index * itemWidth) + center;

  roulette.style.transition = "none";
  roulette.style.transform = "translateX(0)";

  requestAnimationFrame(() => {
    roulette.style.transition =
      "transform 4.2s cubic-bezier(0.08, 0.6, 0, 1)";
    roulette.style.transform = `translateX(${targetX}px)`;
  });

  setTimeout(() => {
    resultBox.innerHTML = `🔥 <b>${winItem.name}</b>`;
    inventory.push(winItem);
    renderInventory();
  }, 4300);
};

function renderInventory() {
  inventoryBox.innerHTML = "";
  inventory.forEach(i => {
    const el = document.createElement("div");
    el.className = `inventory-item ${i.rarity}`;
    el.textContent = i.name;
    inventoryBox.appendChild(el);
  });
}
