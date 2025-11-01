import { songCard } from '../templates.js';

export default async function HomeView(app) {
	// 1) Zbierz unikalne kategorie z danych
	const categories = [
		...new Set(app.state.songs.flatMap((s) => s.categories || [])),
	].sort();

	// 2) UI
	const root = document.createElement('section');
	root.innerHTML = `
    <h2 class="section-title">HOME</h2>
    <p class="section-sub">Latest tracks</p>

    <ul class="cats" id="cats" role="tablist" aria-label="Filter by category">
      ${categories
				.map(
					(c) => `
        <li><button type="button" class="cat-btn" data-cat="${c}" aria-pressed="false">${c}</button></li>
      `
				)
				.join('')}
    </ul>

    <div id="songs"></div>
  `;

	const listEl = root.querySelector('#songs');
	const catBar = root.querySelector('#cats');

	// 3) Stan aktywnej kategorii (null = wszystkie)
	let activeCat = null;

	// 4) Render utworów z filtrem
	function renderSongs() {
		const source = activeCat
			? app.state.songs.filter((s) => (s.categories || []).includes(activeCat))
			: app.state.songs;

		listEl.innerHTML = '';
		source.forEach((s) => listEl.appendChild(songCard(s)));

		// Po dynamicznym wstawieniu <audio> – odpal plugin dla nowych elementów:
		if (window.GreenAudioPlayer) {
			GreenAudioPlayer.init({ selector: '.player', stopOthersOnPlay: true });
		}
	}

	// 5) Styl aktywnego przycisku
	function updateActiveButtons() {
		root.querySelectorAll('.cat-btn').forEach((btn) => {
			const isActive = btn.dataset.cat === activeCat;
			btn.classList.toggle('is-active', isActive);
			btn.setAttribute('aria-pressed', String(isActive));
		});
	}

	// 6) Klik: wybór kategorii lub reset (kliknięcie aktywnej)
	catBar.addEventListener('click', (e) => {
		const btn = e.target.closest('.cat-btn');
		if (!btn) return;
		const cat = btn.dataset.cat;
		activeCat = activeCat === cat ? null : cat;
		updateActiveButtons();
		renderSongs();
	});

	// 7) Start
	renderSongs();
	updateActiveButtons();

	return root;
}
