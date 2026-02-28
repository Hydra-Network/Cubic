const search = document.getElementById("search_games");
const games = document.getElementById("games");
const cards = Array.from(games.querySelectorAll(".game-card"));
const openGames = new Map();
let activeGame = null;
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

function loadFrame(data) {
	const { frame, file_name, frameGame } = data;
	if (frameGame == "true") {
		frame.src = `https://raw.githack.com/hydra-network/hydra-assets/main/gmes/${file_name}`;
	} else {
		frame.onload = async function() {
			if (this.dataset.loaded) return;
			const doc = this.contentDocument;
			const html = await fetch(
				`https://cdn.jsdelivr.net/gh/hydra-network/hydra-assets@main/gmes/${file_name}`,
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
}

function hideFrames() {
	document
		.getElementById("game")
		.querySelectorAll("iframe")
		.forEach((f) => {
			f.src = "about:blank";
			delete f.dataset.loaded;
			f.classList.add("hidden");
		});
}

function showGame(key) {
	const data = openGames.get(key);
	if (!data || !data.frame) return;
	activeGame = key;
	hideFrames();
	const container = document.getElementById("game");
	container.classList.remove("hidden");
	data.frame.classList.remove("hidden");
	document.getElementById("title").textContent = data.title;
	document.body.style.overflow = "hidden";

	loadFrame(data);
	data.frame.focus();

	document.querySelectorAll(".sidebar-game-item").forEach((el) => {
		const isActive = el.id === `sidebar-${key}`;
		el.classList.toggle("bg-elevated", isActive);
		el.classList.toggle("border-active", isActive);
		el.classList.toggle("bg-card", !isActive);
		el.classList.toggle("border-subtle", !isActive);
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
		"opacity-50 group-hover:opacity-100 p-1 transition-opacity text-muted";
	btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
	btn.onclick = (e) => {
		e.stopPropagation();
		closeAll(key);
	};

	item.onclick = () => showGame(key);
	item.append(span, btn);
	list.appendChild(item);
	console.log("Added to sidebar:", key);
}

function closeAll(key) {
	console.log("Closing game:", key);
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
	activeGame = key;
	hideFrames();
	const container = document.getElementById("game");
	const frame = document.createElement("iframe");
	frame.id = `frame-${key}`;
	frame.title = "game";

	const data = { title, file_name, frameGame, frame };
	openGames.set(key, data);
	updateSidebar();

	document.getElementById("title").textContent = title;
	container.classList.remove("hidden");
	document.body.style.overflow = "hidden";

	loadFrame(data);
	container.append(frame);
};

function minimize() {
	const data = openGames.get(activeGame);
	if (!document.getElementById(`sidebar-${activeGame}`)) {
		addToSidebar(activeGame, data.title);
	}
	hideFrames();
	document.getElementById("game").classList.add("hidden");
	document.body.style.overflow = "";

	activeGame = null;
}
function close() {
	hideFrames();
	document.getElementById("game").classList.add("hidden");
	document.body.style.overflow = "";
}

document.getElementById("minimizeGame").addEventListener("click", minimize);
document.getElementById("closeGame").addEventListener("click", close);

document.getElementById("close_all_games").addEventListener("click", () => {
	[...openGames.keys()].forEach(closeAll);
});
