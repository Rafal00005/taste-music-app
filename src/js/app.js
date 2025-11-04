(function () {
	const API_BASE = 'http://localhost:3131';
	const FILES_BASE = 'http://localhost:3131';
	const AUTHORS = { 1: 'David Renda', 2: 'David Fesliyan', 3: 'Steve Oxen' };

	class App {
		constructor() {
			this.filesBase = FILES_BASE;
			this.state = {
				songs: [],
				authors: AUTHORS,
				playStats: JSON.parse(
					localStorage.getItem('playStats') || '{"categoryCounts":{}}'
				),
			};
			this.routes = {
				'/home': 'viewHome',
				'/search': 'viewSearch',
				'/discover': 'viewDiscover',
			};
		}

		songCard(song) {
			const wrap = document.createElement('article');
			wrap.className = 'song';

			const title = document.createElement('h3');
			title.className = 'song__title';
			title.textContent = `${this.formatAuthor(song.author).toUpperCase()} – ${
				song.title
			}`;
			wrap.appendChild(title);

			const audioBox = document.createElement('div');
			audioBox.className = 'player';

			const audio = document.createElement('audio');
			audio.preload = 'metadata';
			audio.src = `${this.filesBase}/songs/${song.filename}`;
			audio.addEventListener('play', () => this.onPlay(song));

			audioBox.appendChild(audio);
			wrap.appendChild(audioBox);

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

		initPlayers(root = document) {
			if (!window.GreenAudioPlayer) return;
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

		viewHome() {
			const root = document.createElement('section');

			// KATEGORIE - zgodnie z designem: Categories: Slow, Melancholy, Fun, Powerful
			const allowedCategories = ['Slow', 'Melancholy', 'Fun', 'Powerful'];

			// KATEGORIE - kontener w jednej linii
			const categoriesContainer = document.createElement('p');
			categoriesContainer.className = 'section-sub';
			categoriesContainer.style.marginBottom = '25px';

			// Dodaj "Categories: " jako span z większym fontem i jaśniejszym kolorem
			const categoriesLabel = document.createElement('span');
			categoriesLabel.textContent = 'Categories: ';
			categoriesLabel.style.fontSize = '13px'; // większy niż kategorie
			categoriesLabel.style.color = '#e9e9e9'; // bardziej biały
			categoriesLabel.style.fontWeight = '490';
			categoriesLabel.style.letterSpacing = '0.15em';

			categoriesContainer.appendChild(categoriesLabel);

			// Lista piosenek
			const list = document.createElement('div');
			list.id = 'songs';

			// Zmienna do śledzenia aktualnie wybranej kategorii
			let activeCategory = null;

			// Funkcja renderująca piosenki
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
				this.initPlayers(root);
			};

			// Stwórz przyciski kategorii w jednej linii
			allowedCategories.forEach((category, index) => {
				const btn = document.createElement('span');
				btn.className = 'cat-btn-inline';
				btn.textContent = category;
				btn.style.cursor = 'pointer';
				btn.style.opacity = '0.85';
				btn.style.fontSize = '12px'; // mniejszy font niż "Categories:"
				btn.style.color = '#fefefeff'; // szary kolor
				btn.style.transition = 'all 0.2s';
				btn.style.marginLeft = '14px';
				btn.style.fontFamily = 'system-ui, Arial, sans-serif';
				btn.style.letterSpacing = '0.15em'; // większy rozstaw
				btn.style.fontWeight = '455'; // trochę grubsze

				btn.addEventListener('click', () => {
					// Jeśli kliknięto już aktywną kategorię - RESET
					if (
						activeCategory &&
						activeCategory.toLowerCase() === category.toLowerCase()
					) {
						activeCategory = null;
						renderSongs(null);
						// Usuń klasę aktywną ze wszystkich przycisków
						categoriesContainer
							.querySelectorAll('.cat-btn-inline')
							.forEach((b) => {
								b.style.fontWeight = 'normal';
								b.style.color = '#b0b0b0ff';
								b.style.opacity = '0.65';
							});
					} else {
						// Nowa kategoria
						activeCategory = category;
						renderSongs(category);
						// Usuń styl aktywny ze wszystkich przycisków
						categoriesContainer
							.querySelectorAll('.cat-btn-inline')
							.forEach((b) => {
								b.style.fontWeight = 'normal';
								b.style.color = '#d1cfcfff';
								b.style.opacity = '0.65';
							});
						// Dodaj styl aktywny do klikniętego przycisku
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

				// Dodaj przecinek i spację między kategoriami (oprócz ostatniej)
				if (index < allowedCategories.length - 1) {
					const separator = document.createElement('span');
					separator.textContent = ', ';
					separator.style.color = '#efefefff'; // szary jak kategorie
					separator.style.opacity = '0.6';
					categoriesContainer.appendChild(separator);
				}
			});

			root.appendChild(categoriesContainer);

			// Renderuj wszystkie piosenki na start
			this.state.songs.forEach((s) => list.appendChild(this.songCard(s)));
			root.appendChild(list);

			this.initPlayers(root);

			// SUBSCRIBE SECTION
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
			copy.innerHTML = 'Dean<br>Hen<span class="red">son</span>';
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
			cta.addEventListener('click', () => {
				location.href = '#/join-now';
			});
			banner.appendChild(cta);

			subscribe.appendChild(banner);

			root.appendChild(subscribe);

			return root;
		}

		viewSearch() {
			const root = document.createElement('section');

			// DODAJ TYTUŁ "SEARCH"
			const title = document.createElement('h2');
			title.className = 'section-title';
			title.textContent = 'SEARCH';
			root.appendChild(title);

			const form = document.createElement('form');
			form.className = 'search-form';
			form.id = 'searchForm';

			const labName = document.createElement('label');
			labName.textContent = 'Name';
			const q = document.createElement('input');
			q.id = 'q';
			q.type = 'text';
			q.placeholder = 'Song title or author';
			labName.appendChild(q);

			const btnS = document.createElement('button');
			btnS.className = 'btn';
			btnS.type = 'submit';
			btnS.textContent = 'SEARCH';

			form.appendChild(labName);
			form.appendChild(btnS);
			root.appendChild(form);

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

			const matchName = (song, query) => {
				if (!query) return true;
				const qv = query.trim().toLowerCase();
				const author = (this.formatAuthor(song.author) || '').toLowerCase();
				return song.title.toLowerCase().includes(qv) || author.includes(qv);
			};

			const render = (items) => {
				results.innerHTML = '';
				items.forEach((s) => results.appendChild(this.songCard(s)));

				counter.textContent = `We have found ${items.length} song${
					items.length === 1 ? '' : 's'
				}...`;
				nores.hidden = items.length !== 0;

				this.initPlayers(root);
			};

			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const list = this.state.songs.filter((s) => matchName(s, q.value));
				render(list);
			});

			render(this.state.songs);

			return root;
		}

		viewDiscover() {
			const root = document.createElement('section');

			const desc = document.createElement('p');
			desc.className = 'section-sub';
			desc.id = 'desc';
			desc.textContent = 'Give it a try!';
			root.appendChild(desc);

			const slot = document.createElement('div');
			slot.id = 'slot';
			root.appendChild(slot);

			// Losowa piosenka
			const chosen =
				this.state.songs[Math.floor(Math.random() * this.state.songs.length)];
			slot.appendChild(this.songCard(chosen));

			this.initPlayers(root);
			return root;
		}

		currentPath() {
			const hash = location.hash || '#/home';
			const path = hash.replace('#', '');
			return this.routes[path] ? path : '/home';
		}

		async renderRoute() {
			const path = this.currentPath();
			document.querySelectorAll('nav a').forEach((a) => {
				a.classList.toggle('active', a.getAttribute('href') === '#' + path);
			});
			const viewName = this.routes[path];
			const view = this[viewName]();
			const mount = document.getElementById('view');
			mount.innerHTML = '';
			mount.appendChild(view);
			if (window.GreenAudioPlayer) {
				setTimeout(() => {
					GreenAudioPlayer.init({
						selector: '.player',
						stopOthersOnPlay: true,
					});
				}, 200);
			}
		}

		async fetchSongs() {
			const res = await fetch(`${API_BASE}/songs`);
			this.state.songs = await res.json();
		}

		formatAuthor(id) {
			return this.state.authors[id] || `Author #${id}`;
		}

		onPlay(song) {
			const stats = this.state.playStats;
			if (!stats.categoryCounts) stats.categoryCounts = {};
			(song.categories || []).forEach((c) => {
				stats.categoryCounts[c] = (stats.categoryCounts[c] || 0) + 1;
			});
			localStorage.setItem('playStats', JSON.stringify(stats));
		}

		async init() {
			await this.fetchSongs();
			window.addEventListener('hashchange', () => this.renderRoute());
			await this.renderRoute();
		}
	}

	const app = new App();
	window.app = app;

	function waitForPlayer() {
		if (window.GreenAudioPlayer) {
			setTimeout(() => app.init(), 200);
		} else {
			setTimeout(waitForPlayer, 200);
		}
	}

	waitForPlayer();
})();
