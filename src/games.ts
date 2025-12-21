const search = document.getElementById("search_games");
const games = document.getElementById("games");
const cards = Array.from(games.querySelectorAll(".game-card"));
const openGames = new Map();

search.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();

  if (q === "") {
    cards.forEach((card) => {
      card.parentNode.style.display = "";
    });
    return;
  }

  cards.forEach((card) => {
    const match = card.getAttribute("data-title").toLowerCase().includes(q);
    card.parentNode.style.display = match ? "inline-block" : "none";
  });
});

games.addEventListener("click", (e) => {
  const card = e.target.closest(".game-card");
  if (!card) return;
  const fn = card.dataset.file;
  const t = card.dataset.title;
  if (fn && t) window.opengame(fn, t, card.dataset.frame);
});

games.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".game-card");
  if (!card) return;
  e.preventDefault();
  const fn = card.dataset.file;
  const t = card.dataset.title;
  if (fn && t) window.opengame(fn, t, card.dataset.frame);
});

document.getElementById("sidebar_search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  document
    .querySelectorAll("#opened_games .sidebar-game-item")
    .forEach((item) => {
      const t = (item.dataset.title || "").toLowerCase();
      item.style.display = t.includes(q) ? "flex" : "none";
    });
});

function updateSidebar() {
  const hint = document.getElementById("no_games_hint");
  const btn = document.getElementById("close_all_games");
  hint.style.display = openGames.size ? "none" : "block";
  btn.disabled = !openGames.size;
}

function hideFrames() {
  document
    .getElementById("game")
    .querySelectorAll("iframe")
    .forEach((f) => f.classList.add("hidden"));
}

function showGame(key) {
  const data = openGames.get(key);
  if (!data || !data.frame) return;

  hideFrames();
  const container = document.getElementById("game");
  container.classList.remove("hidden");
  data.frame.classList.remove("hidden");
  document.getElementById("title").textContent = data.title;
  document.body.style.overflow = "hidden";
  data.frame.focus();

  document.querySelectorAll(".sidebar-game-item").forEach((el) => {
    const isActive = el.id === `sidebar-${key}`;
    el.className = `border ${isActive ? "bg-elevated border-active" : "bg-card border-subtle"}`;
  });
}

function addToSidebar(key, title) {
  const list = document.getElementById("opened_games");
  const item = document.createElement("div");
  item.id = `sidebar-${key}`;
  item.dataset.title = title;
  item.className =
    "sidebar-game-item group flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 bg-card border border-subtle";

  const span = document.createElement("span");
  span.className = "flex-1 text-sm truncate text-secondary";
  span.textContent = title;

  const btn = document.createElement("button");
  btn.className =
    "opacity-0 group-hover:opacity-100 p-1 transition-opacity text-muted";
  btn.innerHTML = `<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
  btn.onclick = (e) => {
    e.stopPropagation();
    closeGame(key);
  };

  item.onclick = () => showGame(key);
  item.append(span, btn);
  list.appendChild(item);
}

function closeGame(key) {
  const data = openGames.get(key);
  if (data && data.frame) {
    data.frame.src = "about:blank";
    data.frame.remove();
  }
  document.getElementById(`sidebar-${key}`)?.remove();
  openGames.delete(key);
  updateSidebar();

  const container = document.getElementById("game");
  if (!container.querySelector("iframe")) {
    if (openGames.size) {
      showGame(openGames.keys().next().value);
    } else {
      container.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }
}

window.opengame = async (file_name, title, frameGame) => {
  const key = file_name.replace(/[^a-zA-Z0-9]/g, "_");
  if (openGames.has(key)) {
    showGame(key);
    return;
  }

  hideFrames();
  const container = document.getElementById("game");
  const frame = document.createElement("iframe");
  frame.id = `frame-${key}`;
  frame.title = "game";

  openGames.set(key, { title, file_name, frameGame, frame });
  addToSidebar(key, title);
  updateSidebar();

  document.getElementById("title").textContent = title;
  container.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (frameGame == "true") {
    frame.src = `https://raw.githack.com/hydra-network/asseting-bromine/main/${file_name}`;
  } else {
    frame.onload = async function () {
      if (this.dataset.loaded) return;
      const doc = this.contentDocument;
      const html = await fetch(
        `https://cdn.jsdelivr.net/gh/hydra-network/asseting-bromine@main/${file_name}`,
      ).then((r) => r.text());

      doc.open();
      doc.write(html);
      doc.close();
      doc.querySelectorAll("script").forEach((s) => {
        const ns = doc.createElement("script");
        ns.src = s.src || "";
        if (!s.src) ns.textContent = s.textContent;
        s.replaceWith(ns);
      });
      this.dataset.loaded = "1";
    };
    frame.src = "/blank.html";
  }
  container.append(frame);
};

window.closegame = () => {
  hideFrames();
  document.getElementById("game").classList.add("hidden");
  document.body.style.overflow = "";
};

document.getElementById("back").addEventListener("click", closegame);
document.getElementById("close_all_games").addEventListener("click", () => {
  [...openGames.keys()].forEach(closeGame);
});
