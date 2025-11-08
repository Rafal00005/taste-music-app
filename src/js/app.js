// Immediately Invoked Function Expression (IIFE) – isolates variables from the global scope
// Natychmiastowo wywoływana funkcja (IIFE) – izoluje zmienne od globalnego scope
(function () {
	// === Configuration constants ===
	// === Stałe konfiguracyjne ===
	const API_BASE = 'http://localhost:3131'; // endpoint API to fetch the song list (JSON)
	// endpoint API do pobierania listy utworów (JSON)
	const FILES_BASE = 'http://localhost:3131'; // base URL for audio/images (to build URLs)
	// baza plików audio/obrazów (do budowania URL-i)
	const AUTHORS = { 1: 'David Renda', 2: 'David Fesliyan', 3: 'Steve Oxen' }; // id->name mapping
	// mapowanie id->nazwisko

	// Main application class – holds state, routing, and view methods
	// Główna klasa aplikacji – trzyma stan, routing i metody widoków
	class App {
		constructor() {
			this.filesBase = FILES_BASE;
			// Minimal application state
			// Minimalny stan aplikacji
			this.state = {
				songs: [], // full list of songs fetched from API
				// pełna lista utworów pobrana z API
				authors: AUTHORS, // authors dictionary
				// słownik autorów
				// Playback statistics (persisted in localStorage)
				// Statystyki odtworzeń (persist w localStorage)
				playStats: JSON.parse(
					localStorage.getItem('playStats') || '{"categoryCounts":{}}'
				),
			};
			// Simple hash-based router – maps path to a view method
			// Prosty router oparty o hash – mapuje ścieżkę na metodę widoku
			this.routes = {
				'/home': 'viewHome',
				'/search': 'viewSearch',
				'/discover': 'viewDiscover',
			};
		}
		// ADDED: Function to transform texts to uppercase (per client requirement)
		//  DODANE: Funkcja do zamiany tekstów na uppercase (zgodnie z wymogiem klienta)
		applyUppercase(scope = document) {
			scope.querySelectorAll('[data-upper]').forEach((el) => {
				el.textContent = el.textContent.toUpperCase();
			});
		}

		// Builds a single song card (DOM) – title, player, meta
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

			// Container for GreenAudioPlayer
			// Kontener dla GreenAudioPlayer
			const audioBox = document.createElement('div');
			audioBox.className = 'player';

			const audio = document.createElement('audio');
			audio.preload = 'metadata';
			audio.src = `${this.filesBase}/songs/${song.filename}`; // audio file path
			// Hook: register plays (increments category counter)
			// Hook: rejestrowanie odsłuchań (zwiększa licznik kategorii)
			audio.addEventListener('play', () => this.onPlay(song));

			audioBox.appendChild(audio);
			wrap.appendChild(audioBox);

			// Meta section: categories + ranking position
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

		// Initialize GreenAudioPlayer for newly created nodes
		// Inicjalizacja GreenAudioPlayer dla nowo utworzonych węzłów
		initPlayers(root = document) {
			if (!window.GreenAudioPlayer) return; // safety: SDK not loaded yet
			// bezpieczeństwo: SDK jeszcze nie załadowane
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

		// === View: Home ===
		// === Widok: Home ===
		viewHome() {
			const root = document.createElement('section');

			// Allowed categories for filtering (consistent with design)
			// Dozwolone kategorie do filtrowania (spójne z designem)
			const allowedCategories = ['Slow', 'Melancholy', 'Fun', 'Powerful'];

			// "Categories" bar (inline)
			// Pasek "Categories" (inline)
			const categoriesContainer = document.createElement('p');
			categoriesContainer.className = 'section-sub';
			categoriesContainer.style.marginBottom = '25px';

			// Label
			// Label
			const categoriesLabel = document.createElement('span');
			categoriesLabel.textContent = 'Categories: ';
			categoriesLabel.style.fontSize = '13px';
			categoriesLabel.style.color = '#e9e9e9';
			categoriesLabel.style.fontWeight = '490';
			categoriesLabel.style.letterSpacing = '0.15em';
			categoriesContainer.appendChild(categoriesLabel);

			// Song list (mount)
			// Lista utworów (mount)
			const list = document.createElement('div');
			list.id = 'songs';

			// Currently selected category (null = no filter)
			// Aktualnie wybrana kategoria (null = brak filtra)
			let activeCategory = null;

			// Rerender the list with an optional category filter
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
				this.initPlayers(root); // important: after DOM insert we must activate the player
				// ważne: po DOM insert musimy aktywować player
			};

			// Generate category buttons + active/hover logic
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
					// Clicking the active category = reset filter
					// Kliknięcie w aktywną kategorię = reset filtra
					if (
						activeCategory &&
						activeCategory.toLowerCase() === category.toLowerCase()
					) {
						activeCategory = null;
						renderSongs(null);
						// Reset active styles
						// Reset stylów aktywności
						categoriesContainer
							.querySelectorAll('.cat-btn-inline')
							.forEach((b) => {
								b.style.fontWeight = 'normal';
								b.style.color = '#b0b0b0ff';
								b.style.opacity = '0.65';
							});
					} else {
						// Set new category and highlight the active button
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
					// On hover, brighten if not the active category
					// Jeśli nieaktywna kategoria – rozjaśnij przy hover
					if (
						!activeCategory ||
						activeCategory.toLowerCase() !== category.toLowerCase()
					) {
						btn.style.opacity = '1';
					}
				});

				btn.addEventListener('mouseleave', () => {
					// On leave, dim back if not the active category
					// Po wyjściu – ściemnij jeśli nieaktywna
					if (
						!activeCategory ||
						activeCategory.toLowerCase() !== category.toLowerCase()
					) {
						btn.style.opacity = '0.65';
					}
				});

				categoriesContainer.appendChild(btn);

				// Separator between categories (aesthetics)
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

			// Initial render: all songs
			// Render startowy: wszystkie utwory
			this.state.songs.forEach((s) => list.appendChild(this.songCard(s)));
			root.appendChild(list);
			this.initPlayers(root);

			// "Subscribe" section (promotional banner)
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
			copy.innerHTML = copy.innerHTML =
				'<span class="name-dean">Dean</span><br><span class="name-hen">Hen</span><span class="name-son red">son</span>';
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
			// Simple navigation redirect to a pseudo-route join-now
			// Prosty nawigacyjny redirect do pseudo-trasy join-now
			cta.addEventListener('click', () => {
				location.href = '#/join-now';
			});
			banner.appendChild(cta);

			subscribe.appendChild(banner);
			root.appendChild(subscribe);

			return root;
		}

		// === View: Search ===
		// === Widok: Search ===
		viewSearch() {
			const root = document.createElement('section');

			// Section header
			// Nagłówek sekcji
			const title = document.createElement('h2');
			title.className = 'section-title section-title--search';
			title.textContent = 'SEARCH';
			root.appendChild(title);

			// Search form by title/author
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

			// Results counter + results container + "no results" info
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

			// Matcher: compares q with title or author (case-insensitive)
			// Matcher: porównuje q z tytułem lub autorem (case-insensitive)
			const matchName = (song, query) => {
				if (!query) return true;
				const qv = query.trim().toLowerCase();
				// author string from id (lowercased)
				// autor jako string z id (lowercase)
				const author = (this.formatAuthor(song.author) || '').toLowerCase();
				return song.title.toLowerCase().includes(qv) || author.includes(qv);
			};

			// Render search results and refresh players
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

			// Handle form submit
			// Obsługa submitu formularza
			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const list = this.state.songs.filter((s) => matchName(s, q.value));
				render(list);
			});

			// Start: show everything
			// Start: pokaż wszystko
			render(this.state.songs);

			return root;
		}

		// === View: Discover ===
		// === Widok: Discover ===
		viewDiscover() {
			const root = document.createElement('section');

			// BIG header "DISCOVER"
			// DUŻY nagłówek "DISCOVER"
			const title = document.createElement('h2');
			title.className = 'section-title section-title--discover';
			title.textContent = 'DISCOVER';
			root.appendChild(title);

			// Subtitle
			// Podtytuł
			const desc = document.createElement('p');
			desc.className = 'section-sub';
			desc.id = 'desc';
			desc.textContent = 'Give it a try!';
			root.appendChild(desc);

			// Slot for the song card
			// Miejsce na kartę piosenki
			const slot = document.createElement('div');
			slot.id = 'slot';
			root.appendChild(slot);
			// Random song — personalized by most played category
			// Losowy utwór — spersonalizowany wg najczęściej słuchanej kategorii
			const counts = this.state.playStats.categoryCounts || {};
			const topCat = Object.keys(counts).sort(
				(a, b) => counts[b] - counts[a]
			)[0];

			let chosen;
			if (topCat) {
				const pool = this.state.songs.filter((s) =>
					(s.categories || []).includes(topCat)
				);
				chosen = pool[Math.floor(Math.random() * pool.length)];
				// change subtitle so the user knows why this pick
				// zmień podtytuł, żeby użytkownik wiedział dlaczego taki wybór
				desc.textContent = `Your most played category: ${topCat}`;
			} else {
				chosen =
					this.state.songs[Math.floor(Math.random() * this.state.songs.length)];
				desc.textContent = 'Give it a try!';
			}

			slot.appendChild(this.songCard(chosen));

			this.initPlayers(root);
			return root;
		}

		// Returns current hash path (fallback to /home)
		// Zwraca aktualną ścieżkę hash (fallback na /home)
		currentPath() {
			const hash = location.hash || '#/home';
			const path = hash.replace('#', '');
			return this.routes[path] ? path : '/home';
		}

		// Renders the view for the current route and highlights the active nav link
		// Renderuje widok dla aktualnej trasy i podświetla aktywny link w nav
		async renderRoute() {
			const path = this.currentPath();
			document.querySelectorAll('nav a').forEach((a) => {
				a.classList.toggle('active', a.getAttribute('href') === '#' + path);
			});
			const viewName = this.routes[path];
			const view = this[viewName](); // invoke the view method
			// wywołanie metody widoku
			const mount = document.getElementById('view');
			mount.innerHTML = '';
			mount.appendChild(view);
			// Extra GAP init (in case something mounted asynchronously)
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

		// Fetches the song list from the API and saves it in state
		// Pobiera listę utworów z API i zapisuje w state
		async fetchSongs() {
			const res = await fetch(`${API_BASE}/songs`);
			this.state.songs = await res.json();
		}

		// Converts author id to name (fallback: "Author #<id>")
		// Zamienia id autora na nazwę (fallback: "Author #<id>")
		formatAuthor(id) {
			return this.state.authors[id] || `Author #${id}`;
		}

		// Registers a play (increments category counters in localStorage)
		// Rejestruje odsłuch (inkrementuje liczniki kategorii w localStorage)
		onPlay(song) {
			const stats = this.state.playStats;
			if (!stats.categoryCounts) stats.categoryCounts = {};
			(song.categories || []).forEach((c) => {
				stats.categoryCounts[c] = (stats.categoryCounts[c] || 0) + 1;
			});
			localStorage.setItem('playStats', JSON.stringify(stats));
		}

		// App init: 1) fetch data 2) listen to hash changes 3) render the view
		// Inicjalizacja aplikacji: 1) pobierz dane 2) nasłuchuj zmiany hash 3) wyrenderuj widok
		async init() {
			await this.fetchSongs();
			window.addEventListener('hashchange', () => this.renderRoute());
			await this.renderRoute();
		}
	}

	// App instance – export to window for debugging (optional)
	// Instancja app – export na window do debugowania (opcjonalne)
	const app = new App();
	window.app = app;

	// Waits until GreenAudioPlayer library is available, then starts the app
	// Czeka aż biblioteka GreenAudioPlayer będzie dostępna, potem startuje app
	function waitForPlayer() {
		if (window.GreenAudioPlayer) {
			setTimeout(() => app.init(), 200); // short pause: DOM + GAP ready
			// krótka pauza: DOM + GAP gotowe
		} else {
			setTimeout(waitForPlayer, 200); // retry every 200 ms
			// retry co 200 ms
		}
	}

	waitForPlayer();
})();
