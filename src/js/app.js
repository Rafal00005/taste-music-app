(function () {
	const API_BASE = 'http://localhost:3131';
	const FILES_BASE = 'http://localhost:3131';
	const AUTHORS = { 1: 'David Renda', 2: 'David Fesliyan', 3: 'Steve Oxen' };

	const app = {
		filesBase: FILES_BASE,
		state: {
			songs: [],
			authors: AUTHORS,
			playStats: JSON.parse(
				localStorage.getItem('playStats') || '{"categoryCounts":{}}'
			),
		},
		songCard(song) {
			const wrap = document.createElement('article');
			wrap.className = 'song';

			const title = document.createElement('h3');
			title.className = 'song__title';
			title.textContent = `${this.formatAuthor(song.author).toUpperCase()} – ${
				song.title
			}`;
			wrap.appendChild(title);

			// STRUKTURA: DIV.player zawiera AUDIO!
			const audioBox = document.createElement('div');
			audioBox.className = 'player'; // KLASA NA DIV-IE!

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
		},

		viewHome() {
			const root = document.createElement('section');

			const h2 = document.createElement('h2');
			h2.className = 'section-title';
			h2.textContent = 'HOME';
			root.appendChild(h2);

			const sub = document.createElement('p');
			sub.className = 'section-sub';
			sub.textContent = 'Latest tracks';
			root.appendChild(sub);

			const ul = document.createElement('ul');
			ul.className = 'cats';
			ul.id = 'cats';
			ul.setAttribute('role', 'tablist');
			const categories = [
				...new Set(this.state.songs.flatMap((s) => s.categories || [])),
			].sort();
			categories.forEach((c) => {
				const li = document.createElement('li');
				const btn = document.createElement('button');
				btn.className = 'cat-btn';
				btn.type = 'button';
				btn.dataset.cat = c;
				btn.setAttribute('aria-pressed', 'false');
				btn.textContent = c;
				li.appendChild(btn);
				ul.appendChild(li);
			});
			root.appendChild(ul);

			const list = document.createElement('div');
			list.id = 'songs';
			root.appendChild(list);

			let activeCat = null;
			const updateBtns = () => {
				root.querySelectorAll('.cat-btn').forEach((b) => {
					const on = b.dataset.cat === activeCat;
					b.classList.toggle('is-active', on);
					b.setAttribute('aria-pressed', String(on));
				});
			};
			const render = () => {
				const src = activeCat
					? this.state.songs.filter((s) =>
							(s.categories || []).includes(activeCat)
					  )
					: this.state.songs;
				list.innerHTML = '';
				src.forEach((s) => list.appendChild(this.songCard(s)));
				if (window.GreenAudioPlayer) {
					setTimeout(() => {
						GreenAudioPlayer.init({
							selector: '.player',
							stopOthersOnPlay: true,
							enableKeystrokes: true,
							showTooltips: true,
							outlineControls: true,
							showDownloadButton: true,
						});
					}, 200);
				}
			};
			ul.addEventListener('click', (e) => {
				const b = e.target.closest('.cat-btn');
				if (!b) return;
				activeCat = activeCat === b.dataset.cat ? null : b.dataset.cat;
				updateBtns();
				render();
			});
			render();
			updateBtns();
			// SUBSCRIBE SECTION
			const subscribe = document.createElement('section');
			subscribe.id = 'subscribe';

			const subscribeTitle = document.createElement('h2');
			subscribeTitle.textContent = 'SUBSCRIBE NOW';
			subscribe.appendChild(subscribeTitle);

			const banner = document.createElement('div');
			banner.className = 'banner';

			// Małe zdjęcie artysty (po prawej)
			const artist = document.createElement('img');
			artist.src = 'http://localhost:3131/images/artist.jpg';
			artist.className = 'artist';
			artist.alt = 'Artist';
			banner.appendChild(artist);

			// Tekst główny (na środku - "Dean Henson")
			const copy = document.createElement('div');
			copy.className = 'copy';
			copy.textContent = 'Dean Henson';
			banner.appendChild(copy);

			// Tekst dodatkowy (prawy dolny róg)
			const copySub = document.createElement('div');
			copySub.className = 'copy-sub';
			copySub.innerHTML = 'NEW ALBUM<br>Available only for subscribers';
			banner.appendChild(copySub);

			// Button
			const cta = document.createElement('button');
			cta.className = 'cta';
			cta.textContent = 'JOIN NOW';
			cta.addEventListener('click', () => {
				location.href = '#/join-now';
			});
			banner.appendChild(cta);

			subscribe.appendChild(banner);

			// "All rights reserved" POZA bannerem
			const copyFooter = document.createElement('div');
			copyFooter.className = 'copy-footer';
			copyFooter.textContent = 'All rights reserved';
			subscribe.appendChild(copyFooter);

			root.appendChild(subscribe);

			return root;
		},

		viewSearch() {
			const root = document.createElement('section');
			const h2 = document.createElement('h2');
			h2.className = 'section-title';
			h2.textContent = 'SEARCH';
			root.appendChild(h2);

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
			const labCat = document.createElement('label');
			labCat.textContent = 'Category';
			const select = document.createElement('select');
			select.id = 'cat';
			const opt0 = document.createElement('option');
			opt0.value = '';
			opt0.textContent = '—';
			select.appendChild(opt0);
			const categories = [
				...new Set(this.state.songs.flatMap((s) => s.categories || [])),
			].sort();
			categories.forEach((c) => {
				const o = document.createElement('option');
				o.value = c;
				o.textContent = c;
				select.appendChild(o);
			});
			labCat.appendChild(select);
			const btnS = document.createElement('button');
			btnS.className = 'btn';
			btnS.type = 'submit';
			btnS.textContent = 'SEARCH';
			const btnC = document.createElement('button');
			btnC.className = 'btn';
			btnC.type = 'button';
			btnC.style.background = '#333';
			btnC.textContent = 'CLEAR';
			form.appendChild(labName);
			form.appendChild(labCat);
			form.appendChild(btnS);
			form.appendChild(btnC);
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
			const matchCat = (song, cat) => {
				if (!cat) return true;
				return (song.categories || []).includes(cat);
			};

			const render = (items) => {
				results.innerHTML = '';
				items.forEach((s) => results.appendChild(this.songCard(s)));
				counter.textContent = `We have found ${items.length} song${
					items.length === 1 ? '' : 's'
				}...`;
				nores.hidden = items.length !== 0;
				if (window.GreenAudioPlayer) {
					setTimeout(() => {
						GreenAudioPlayer.init({
							selector: '.player',
							stopOthersOnPlay: true,
						});
					}, 200);
				}
			};

			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const list = this.state.songs
					.filter((s) => matchName(s, q.value))
					.filter((s) => matchCat(s, select.value));
				render(list);
			});
			btnC.addEventListener('click', () => {
				q.value = '';
				select.value = '';
				render(this.state.songs);
			});

			render(this.state.songs);
			return root;
		},

		viewDiscover() {
			const root = document.createElement('section');
			const h2 = document.createElement('h2');
			h2.className = 'section-title';
			h2.textContent = 'DISCOVER';
			root.appendChild(h2);
			const desc = document.createElement('p');
			desc.className = 'section-sub';
			desc.id = 'desc';
			desc.textContent = 'Give it a try!';
			root.appendChild(desc);
			const bar = document.createElement('div');
			bar.style.cssText =
				'display:flex;gap:8px;justify-content:center;margin:8px 0 20px;';
			const reset = document.createElement('button');
			reset.id = 'reset';
			reset.className = 'btn';
			reset.style.background = '#333';
			reset.textContent = 'Reset Discover';
			bar.appendChild(reset);
			root.appendChild(bar);
			const slot = document.createElement('div');
			slot.id = 'slot';
			root.appendChild(slot);

			const entries = Object.entries(
				(this.state.playStats && this.state.playStats.categoryCounts) || {}
			);
			let pool = this.state.songs;
			if (entries.length) {
				const max = Math.max(...entries.map(([, v]) => v));
				const tops = entries.filter(([, v]) => v === max).map(([k]) => k);
				const top = tops[Math.floor(Math.random() * tops.length)];
				const filtered = this.state.songs.filter((s) =>
					(s.categories || []).includes(top)
				);
				if (filtered.length) {
					pool = filtered;
					desc.textContent = `Based on your listening history — category: ${top}`;
				} else {
					desc.textContent = `No listening history yet — showing a random track`;
				}
			} else {
				desc.textContent = `No listening history yet — showing a random track`;
			}

			const chosen = pool[Math.floor(Math.random() * pool.length)];
			slot.appendChild(this.songCard(chosen));
			if (window.GreenAudioPlayer) {
				setTimeout(() => {
					GreenAudioPlayer.init({
						selector: '.player',
						stopOthersOnPlay: true,
					});
				}, 200);
			}
			reset.addEventListener('click', () => {
				this.state.playStats = { categoryCounts: {} };
				localStorage.setItem('playStats', JSON.stringify(this.state.playStats));
				const hash = location.hash || '#/discover';
				location.hash = '';
				location.hash = hash;
			});

			return root;
		},

		routes: {
			'/home': 'viewHome',
			'/search': 'viewSearch',
			'/discover': 'viewDiscover',
		},

		currentPath() {
			const hash = location.hash || '#/home';
			const path = hash.replace('#', '');
			return this.routes[path] ? path : '/home';
		},

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
		},

		async fetchSongs() {
			const res = await fetch(`${API_BASE}/songs`);
			this.state.songs = await res.json();
		},
		formatAuthor(id) {
			return this.state.authors[id] || `Author #${id}`;
		},
		onPlay(song) {
			const stats = this.state.playStats;
			if (!stats.categoryCounts) stats.categoryCounts = {};
			(song.categories || []).forEach((c) => {
				stats.categoryCounts[c] = (stats.categoryCounts[c] || 0) + 1;
			});
			localStorage.setItem('playStats', JSON.stringify(stats));
		},

		async init() {
			await this.fetchSongs();
			window.addEventListener('hashchange', () => this.renderRoute());
			await this.renderRoute();
		},
	};

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
