// Natychmiastowo wywoływana funkcja (IIFE) – izoluje zmienne od globalnego scope
(function () {
	// === Stałe konfiguracyjne ===
	const API_BASE = 'http://localhost:3131'; // endpoint API do pobierania listy utworów (JSON)
	const FILES_BASE = 'http://localhost:3131'; // baza plików audio/obrazów (do budowania URL-i)
	const AUTHORS = { 1: 'David Renda', 2: 'David Fesliyan', 3: 'Steve Oxen' }; // mapowanie id->nazwisko

	// Główna klasa aplikacji – trzyma stan, routing i metody widoków
	class App {
		constructor() {
			this.filesBase = FILES_BASE;
			// Minimalny stan aplikacji
			this.state = {
				songs: [], // pełna lista utworów pobrana z API
				authors: AUTHORS, // słownik autorów
				// Statystyki odtworzeń (persist w localStorage)
				playStats: JSON.parse(
					localStorage.getItem('playStats') || '{"categoryCounts":{}}'
				),
			};
			// Prosty router oparty o hash – mapuje ścieżkę na metodę widoku
			this.routes = {
				'/home': 'viewHome',
				'/search': 'viewSearch',
				'/discover': 'viewDiscover',
			};
		}
        //  DODANE: Funkcja do zamiany tekstów na uppercase (zgodnie z wymogiem klienta)
		applyUppercase(scope = document) {
			scope.querySelectorAll('[data-upper]').forEach((el) => {
				el.textContent = el.textContent.toUpperCase();
			});
		}

		// Buduje kartę pojedynczego utworu (DOM) – tytuł, player, meta
		songCard(song) {
			const wrap = document.createElement('article');
			wrap.className = 'song';

			const title = document.createElement('h3');
			title.className = 'song__title';
			title.textContent = `${this.formatAuthor(song.author).toUpperCase()} – ${
				song.title
			}`;
			wrap.appendChild(title);

			// Kontener dla GreenAudioPlayer
			const audioBox = document.createElement('div');
			audioBox.className = 'player';

			const audio = document.createElement('audio');
			audio.preload = 'metadata';
			audio.src = `${this.filesBase}/songs/${song.filename}`; // ścieżka do pliku audio
			// Hook: rejestrowanie odsłuchań (zwiększa licznik kategorii)
			audio.addEventListener('play', () => this.onPlay(song));

			audioBox.appendChild(audio);
			wrap.appendChild(audioBox);

			// Sekcja meta: kategorie + pozycja w rankingu
			const meta = document.createElement('div');
			meta.className = 'song__meta';
			const cats = document.createElement('span');
			cats.textContent = `Categories: ${(song.categories || []).join(', ')}`;
			const rank = document.createElement('span');
			rank.textContent = `#${song.ranking} in the ranking`;
			meta.appendChild(cats);
			meta.appendChild(rank);
			wrap.appendChild(meta);
			return wrap;
		}

		// Inicjalizacja GreenAudioPlayer dla nowo utworzonych węzłów
		initPlayers(root = document) {
			if (!window.GreenAudioPlayer) return; // bezpieczeństwo: SDK jeszcze nie załadowane
			const nodes = root.querySelectorAll('.player:not([data-gap-init])');
			if (!nodes.length) return;
			nodes.forEach((n) => n.setAttribute('data-gap-init', '1'));
			GreenAudioPlayer.init({
				selector: '.player[data-gap-init="1"]',
				stopOthersOnPlay: true,
				enableKeystrokes: true,
				showTooltips: true,
				outlineControls: true,
				showDownloadButton: true,
			});
		}

		// === Widok: Home ===
		viewHome() {
			const root = document.createElement('section');

			// Dozwolone kategorie do filtrowania (spójne z designem)
			const allowedCategories = ['Slow', 'Melancholy', 'Fun', 'Powerful'];

			// Pasek "Categories" (inline)
			const categoriesContainer = document.createElement('p');
			categoriesContainer.className = 'section-sub';
			categoriesContainer.style.marginBottom = '25px';

			// Label
			const categoriesLabel = document.createElement('span');
			categoriesLabel.textContent = 'Categories: ';
			categoriesLabel.style.fontSize = '13px';
			categoriesLabel.style.color = '#e9e9e9';
			categoriesLabel.style.fontWeight = '490';
			categoriesLabel.style.letterSpacing = '0.15em';
			categoriesContainer.appendChild(categoriesLabel);

			// Lista utworów (mount)
			const list = document.createElement('div');
			list.id = 'songs';

			// Aktualnie wybrana kategoria (null = brak filtra)
			let activeCategory = null;

			// Rerender listy z opcjonalnym filtrem po kategorii
			const renderSongs = (category = null) => {
				list.innerHTML = '';
				const filteredSongs = category
					? this.state.songs.filter((s) =>
							(s.categories || []).some(
								(cat) => cat.toLowerCase() === category.toLowerCase()
							)
					  )
					: this.state.songs;

				filteredSongs.forEach((s) => list.appendChild(this.songCard(s)));
				this.initPlayers(root); // ważne: po DOM insert musimy aktywować player
			};

			// Generowanie przycisków kategorii + logika aktyw/hover
			allowedCategories.forEach((category, index) => {
				const btn = document.createElement('span');
				btn.className = 'cat-btn-inline';
				btn.textContent = category;
				btn.style.cursor = 'pointer';
				btn.style.opacity = '0.85';
				btn.style.fontSize = '12px';
				btn.style.color = '#fefefeff';
				btn.style.transition = 'all 0.2s';
				btn.style.marginLeft = '14px';
				btn.style.fontFamily = 'system-ui, Arial, sans-serif';
				btn.style.letterSpacing = '0.15em';
				btn.style.fontWeight = '455';

				btn.addEventListener('click', () => {
					// Kliknięcie w aktywną kategorię = reset filtra
					if (
						activeCategory &&
						activeCategory.toLowerCase() === category.toLowerCase()
					) {
						activeCategory = null;
						renderSongs(null);
						// Reset stylów aktywności
						categoriesContainer
							.querySelectorAll('.cat-btn-inline')
							.forEach((b) => {
								b.style.fontWeight = 'normal';
								b.style.color = '#b0b0b0ff';
								b.style.opacity = '0.65';
							});
					} else {
						// Ustaw nową kategorię i podświetl aktywny przycisk
						activeCategory = category;
						renderSongs(category);
						categoriesContainer
							.querySelectorAll('.cat-btn-inline')
							.forEach((b) => {
								b.style.fontWeight = 'normal';
								b.style.color = '#d1cfcfff';
								b.style.opacity = '0.65';
							});
						btn.style.fontWeight = '700';
						btn.style.color = 'var(--accent)';
						btn.style.opacity = '1';
					}
				});

				btn.addEventListener('mouseenter', () => {
					if (
						!activeCategory ||
						activeCategory.toLowerCase() !== category.toLowerCase()
					) {
						btn.style.opacity = '1';
					}
				});

				btn.addEventListener('mouseleave', () => {
					if (
						!activeCategory ||
						activeCategory.toLowerCase() !== category.toLowerCase()
					) {
						btn.style.opacity = '0.65';
					}
				});

				categoriesContainer.appendChild(btn);

				// Separator między kategoriami (estetyka)
				if (index < allowedCategories.length - 1) {
					const separator = document.createElement('span');
					separator.textContent = ', ';
					separator.style.color = '#efefefff';
					separator.style.opacity = '0.6';
					categoriesContainer.appendChild(separator);
				}
			});

			root.appendChild(categoriesContainer);

			// Render startowy: wszystkie utwory
			this.state.songs.forEach((s) => list.appendChild(this.songCard(s)));
			root.appendChild(list);
			this.initPlayers(root);

			// Sekcja "Subscribe" (baner promocyjny)
			const subscribe = document.createElement('section');
			subscribe.id = 'subscribe';

			const banner = document.createElement('div');
			banner.className = 'banner';

			const subscribeTitle = document.createElement('h2');
			subscribeTitle.className = 'title';
			subscribeTitle.textContent = 'SUBSCRIBE NOW';
			banner.appendChild(subscribeTitle);

			const artist = document.createElement('img');
			artist.src = 'http://localhost:3131/images/artist.jpg';
			artist.className = 'artist';
			artist.alt = 'Artist';
			banner.appendChild(artist);

			const copy = document.createElement('div');
			copy.className = 'copy-main';
			copy.innerHTML = copy.innerHTML = '<span class="name-dean">Dean</span><br><span class="name-hen">Hen</span><span class="name-son red">son</span>';
			banner.appendChild(copy);

			const copySub = document.createElement('div');
			copySub.className = 'copy-sub';
			const copySubTitle = document.createElement('div');
			copySubTitle.className = 'copy-sub-title';
			copySubTitle.textContent = 'NEW ALBUM';
			const copySubText = document.createElement('div');
			copySubText.className = 'copy-sub-text';
			copySubText.textContent = 'Available only for subscribers';
			copySub.appendChild(copySubTitle);
			copySub.appendChild(copySubText);
			banner.appendChild(copySub);

			const cta = document.createElement('button');
			cta.className = 'cta';
			cta.textContent = 'JOIN NOW';
			// Prosty nawigacyjny redirect do pseudo-trasy join-now
			cta.addEventListener('click', () => {
				location.href = '#/join-now';
			});
			banner.appendChild(cta);

			subscribe.appendChild(banner);
			root.appendChild(subscribe);

			return root;
		}

		// === Widok: Search ===
		viewSearch() {
			const root = document.createElement('section');

			// Nagłówek sekcji
			const title = document.createElement('h2');
			title.className = 'section-title section-title--search';
			title.textContent = 'SEARCH';
			root.appendChild(title);

			// Formularz wyszukiwania po tytule/autorzę
			const form = document.createElement('form');
			form.className = 'search-form';
			form.id = 'searchForm';

			const labName = document.createElement('label');
			labName.textContent = 'Name';
			const q = document.createElement('input');
			q.id = 'q';
			q.type = 'text';
			
			labName.appendChild(q);

			const btnS = document.createElement('button');
			btnS.className = 'btn';
			btnS.type = 'submit';
			btnS.textContent = 'SEARCH';

			form.appendChild(labName);
			form.appendChild(btnS);
			root.appendChild(form);

			// Licznik wyników + kontener wyników + info o braku
			const counter = document.createElement('p');
			counter.className = 'section-sub';
			counter.id = 'counter';
			root.appendChild(counter);

			const results = document.createElement('div');
			results.id = 'results';
			root.appendChild(results);

			const nores = document.createElement('p');
			nores.id = 'no-results';
			nores.textContent = 'No results match your criteria.';
			nores.hidden = true;
			root.appendChild(nores);

			// Matcher: porównuje q z tytułem lub autorem (case-insensitive)
			const matchName = (song, query) => {
				if (!query) return true;
				const qv = query.trim().toLowerCase();
				const author = (this.formatAuthor(song.author) || '').toLowerCase();
				return song.title.toLowerCase().includes(qv) || author.includes(qv);
			};

			// Render wyników wyszukiwania i odświeżenie playerów
			const render = (items) => {
				results.innerHTML = '';
				items.forEach((s) => results.appendChild(this.songCard(s)));

				counter.textContent = `We have found ${items.length} song${
					items.length === 1 ? '' : 's'
				}...`;
				nores.hidden = items.length !== 0;

				this.initPlayers(root);
			};

			// Obsługa submitu formularza
			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const list = this.state.songs.filter((s) => matchName(s, q.value));
				render(list);
			});

			// Start: pokaż wszystko
			render(this.state.songs);

			return root;
		}

		// === Widok: Discover ===
		viewDiscover() {
			const root = document.createElement('section');

			// DUŻY nagłówek "DISCOVER"
			const title = document.createElement('h2');
			title.className = 'section-title section-title--discover';
			title.textContent = 'DISCOVER';
			root.appendChild(title);

			// Podtytuł
			const desc = document.createElement('p');
			desc.className = 'section-sub';
			desc.id = 'desc';
			desc.textContent = 'Give it a try!';
			root.appendChild(desc);

			// Miejsce na kartę piosenki
			const slot = document.createElement('div');
			slot.id = 'slot';
			root.appendChild(slot);

			// Losowy utwór
			const chosen =
				this.state.songs[Math.floor(Math.random() * this.state.songs.length)];
			slot.appendChild(this.songCard(chosen));

			this.initPlayers(root);
			return root;
		}

		// Zwraca aktualną ścieżkę hash (fallback na /home)
		currentPath() {
			const hash = location.hash || '#/home';
			const path = hash.replace('#', '');
			return this.routes[path] ? path : '/home';
		}

		// Renderuje widok dla aktualnej trasy i podświetla aktywny link w nav
		async renderRoute() {
			const path = this.currentPath();
			document.querySelectorAll('nav a').forEach((a) => {
				a.classList.toggle('active', a.getAttribute('href') === '#' + path);
			});
			const viewName = this.routes[path];
			const view = this[viewName](); // wywołanie metody widoku
			const mount = document.getElementById('view');
			mount.innerHTML = '';
			mount.appendChild(view);
			// Dodatkowa inicjalizacja GAP (gdyby coś się podmontowało asynchronicznie)
			if (window.GreenAudioPlayer) {
				setTimeout(() => {
					GreenAudioPlayer.init({
						selector: '.player',
						stopOthersOnPlay: true,
					});
				}, 200);
			}
		}

		// Pobiera listę utworów z API i zapisuje w state
		async fetchSongs() {
			const res = await fetch(`${API_BASE}/songs`);
			this.state.songs = await res.json();
		}

		// Zamienia id autora na nazwę (fallback: "Author #<id>")
		formatAuthor(id) {
			return this.state.authors[id] || `Author #${id}`;
		}

		// Rejestruje odsłuch (inkrementuje liczniki kategorii w localStorage)
		onPlay(song) {
			const stats = this.state.playStats;
			if (!stats.categoryCounts) stats.categoryCounts = {};
			(song.categories || []).forEach((c) => {
				stats.categoryCounts[c] = (stats.categoryCounts[c] || 0) + 1;
			});
			localStorage.setItem('playStats', JSON.stringify(stats));
		}

		// Inicjalizacja aplikacji: 1) pobierz dane 2) nasłuchuj zmiany hash 3) wyrenderuj widok
		async init() {
			await this.fetchSongs();
			window.addEventListener('hashchange', () => this.renderRoute());
			await this.renderRoute();
		}
	}

	// Instancja app – export na window do debugowania (opcjonalne)
	const app = new App();
	window.app = app;

	// Czeka aż biblioteka GreenAudioPlayer będzie dostępna, potem startuje app
	function waitForPlayer() {
		if (window.GreenAudioPlayer) {
			setTimeout(() => app.init(), 200); // krótka pauza: DOM + GAP gotowe
		} else {
			setTimeout(waitForPlayer, 200); // retry co 200 ms
		}
	}

	waitForPlayer();
})();
