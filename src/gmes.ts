import gmesData from "@/gmes.json";

const FILTER_OPTIMIZE_ON = import.meta.env.PUBLIC_FILTER_OPTIMIZE === "true";
const gmes_text = FILTER_OPTIMIZE_ON ? "gᾰmes" : "games";

(() => {
	const target = document.querySelector("#gmeContainer");
	const searchInput = document.getElementById("search_games");

	searchInput.placeholder = `Search from ${gmesData.length} ${gmes_text}`;

	if (!target) {
		console.error("Target container #gmeContainer not found.");
		return;
	}

	if (!searchInput) {
		console.error("Search input with id 'search' not found.");
		return;
	}

	target.innerHTML = `<p class="text-center font-sans text-slate-500">Loading ${gmes_text}...</p>`;

	const allGmes = [...gmesData].sort((a, b) =>
		a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
	);

	const renderGmes = (gmesToRender) => {
		if (gmesToRender.length === 0) {
			target.innerHTML = `<p class="text-center font-sans text-slate-500">No ${gmes_text} found.</p>`;
			return;
		}

		target.innerHTML = `
  <div class="flex flex-wrap justify-center gap-2.5 p-2.5">
    ${gmesToRender
				.map((gme) => {
					const thumb_url = gme.thumb
						? `https://raw.githubusercontent.com/Galaxy-Vortex/asseting-bromine/main/${gme.thumb}`
						: null;
					const thumb_html = thumb_url
						? `<img src="${thumb_url}" alt="${gme.title}" class="w-full h-40 object-cover rounded-lg mb-2"/>`
						: `<div class="w-full h-40 rounded-lg bg-slate-800 mb-2 flex items-center justify-center"><p class="text-slate-500">No Image</p></div>`;

					return `
      <div
        onclick="opengme('${gme.file_name}', '${gme.title}', '${gme.frame}')"
        class="bg-slate-900 border border-slate-700 rounded-xl p-3 m-2 inline-block w-64 text-center shadow-sm transition-transform duration-200 hover:scale-105 cursor-pointer"
      >
        ${thumb_html}
        <h3 class="mt-2 font-medium truncate">${gme.title}</h3>
      </div>
    `;
				})
				.join("")}
  </div>
`;
	};

	searchInput.addEventListener("input", (event) => {
		const searchQuery = event.target.value.toLowerCase();
		const filteredGmes = allGmes.filter((gme) =>
			gme.title.toLowerCase().includes(searchQuery),
		);
		renderGmes(filteredGmes);
	});

	renderGmes(allGmes);

	window.opengme = async (file_name, title, frameGme) => {
		const frame = document.getElementById("gmePageFrame");
		const container = document.getElementById("gmePageContainer");
		const titleEl = document.getElementById("gmePageTitle");

		titleEl.textContent = title;
		container.classList.remove("hidden");
		document.body.style.overflow = "hidden";

		if (frameGme == "true") {
			// Directly load raw.githack URL
			frame.src = `https://raw.githack.com/Galaxy-Vortex/asseting-bromine/main/${file_name}`;
		} else {
			delete frame.dataset.loaded;
			frame.onload = async () => {
				if (frame.dataset.loaded) return;
				const doc = frame.contentDocument;

				const html = await fetch(
					`https://raw.githubusercontent.com/Galaxy-Vortex/asseting-bromine/main/${file_name}`,
				).then((r) => r.text());

				doc.open();
				doc.write(html);
				doc.close();

				// Re-run scripts
				doc.querySelectorAll("script").forEach((s) => {
					const script = doc.createElement("script");
					script.src = s.src || "";
					if (!s.src) script.textContent = s.textContent;
					s.replaceWith(script);
				});

				frame.dataset.loaded = true;
			};

			frame.src = "/asdf.html";
		}
	};

	window.closegme = () => {
		const gmePageContainer = document.getElementById("gmePageContainer");
		const gmePageFrame = document.getElementById("gmePageFrame");

		gmePageFrame.src = "";
		gmePageContainer.classList.add("hidden");
		document.body.style.overflow = "";
	};

	document.getElementById("backBtn").addEventListener("click", () => {
		closegme();
	});
})();
