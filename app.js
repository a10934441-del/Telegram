const tg = Telegram.WebApp;
tg.expand();

// ===== USER =====
const user = tg.initDataUnsafe?.user || {};
document.getElementById("username").textContent = user.username || "Player";
document.getElementById("avatar").src =
  user.photo_url || "https://via.placeholder.com/64";

// ===== STATE =====
let balance = 100;
let inventory = [];
let cooldown = false;

const STORAGE_KEY = "miniapp_save_v1";

// ===== ITEMS =====
const items = [
  { id: 1, name: "Ракета", price: 50, chance: 1.4 },
  { id: 2, name: "Мишка", price: 15, chance: 10 },
  { id: 3, name: "Сердце", price: 15, chance: 10 },
  { id: 4, name: "Роза", price: 25, chance: 34 },
  { id: 5, name: "Подарок", price: 25, chance: 34 }
];

const view = document.getElementById("view");
const balanceEl = document.getElementById("balance");

// ===== SAVE / LOAD =====
function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ balance, inventory })
  );
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    balance = data.balance ?? balance;
    inventory = data.inventory ?? inventory;
  } catch {}
}

// ===== UI =====
function updateBalance() {
  balanceEl.textContent = balance;
}

// ===== RANDOM =====
function weightedRandom() {
  const pool = [];
  items.forEach(i => {
    for (let x = 0; x < i.chance * 10; x++) pool.push(i);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

// ===== CASES =====
function renderCases() {
  view.innerHTML = `
    <div class="case">
      <div class="roller" id="roller">
        ${items.map(i => `<div class="item">${i.name}</div>`).join("")}
      </div>
      <button class="btn" id="spin">Открыть кейс · 25 💎</button>
    </div>

    <h3>Возможные призы</h3>
    ${items.map(i =>
      `<div class="card">${i.name} — ${i.price} 💎 · ${i.chance}%</div>`
    ).join("")}
  `;
  document.getElementById("spin").onclick = spin;
}

function spin() {
  if (cooldown || balance < 25) return;
  cooldown = true;
  balance -= 25;
  updateBalance();
  saveState();

  const win = weightedRandom();
  const index = items.findIndex(i => i.id === win.id);
  const roller = document.getElementById("roller");

  roller.style.transition = "transform 4s cubic-bezier(.1,.8,.2,1)";
  roller.style.transform = `translateX(-${index * 130}px)`;

  setTimeout(() => {
    inventory.push(win);
    saveState();
    tg.showAlert(`Вы выиграли: ${win.name}`);
    cooldown = false;
  }, 4200);
}

// ===== INVENTORY =====
function renderInventory() {
  view.innerHTML = inventory.length === 0
    ? `<div class="card">Инвентарь пуст</div>`
    : inventory.map((i, idx) => `
      <div class="card">
        ${i.name} — ${i.price} 💎
        <button class="btn" onclick="sell(${idx})">Продать</button>
      </div>
    `).join("");
}

function sell(index) {
  balance += inventory[index].price;
  inventory.splice(index, 1);
  updateBalance();
  saveState();
  renderInventory();
}

// ===== GAMES =====
function renderGames() {
  view.innerHTML = `
    <div class="card">
      <h3>Риск ×2</h3>
      <button class="btn" onclick="risk()">Поставить 10 💎</button>
    </div>
  `;
}

function risk() {
  if (balance < 10) return;
  balance -= 10;

  if (Math.random() > 0.5) {
    balance += 20;
    tg.showAlert("Вы выиграли!");
  } else {
    tg.showAlert("Вы проиграли");
  }

  updateBalance();
  saveState();
}

// ===== PROFILE =====
function renderProfile() {
  view.innerHTML = `
    <div class="card">
      <h3>${user.username || "Player"}</h3>
      <p>Баланс: ${balance} 💎</p>
    </div>
    <div class="card">
      <h4>Реферальная ссылка</h4>
      <input value="https://t.me/yourbot?start=${user.id}" readonly>
    </div>
  `;
}

// ===== NAV =====
document.querySelectorAll(".bottom button").forEach(btn => {
  btn.onclick = () => {
    const tab = btn.dataset.tab;
    if (tab === "cases") renderCases();
    if (tab === "inventory") renderInventory();
    if (tab === "games") renderGames();
    if (tab === "profile") renderProfile();
  };
});

// ===== INIT =====
loadState();
updateBalance();
renderCases();

window.addEventListener("beforeunload", saveState);
tg.onEvent("viewportChanged", saveState);
