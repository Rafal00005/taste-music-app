import { songCard } from '../templates.js';

export default async function SearchView(app) {
	// Zbierz unikalne kategorie:
	const categories = [
		...new Set(app.state.songs.flatMap((s) => s.categories || [])),
	].sort();

	// UI
	const root = document.createElement('section');
	root.innerHTML = `
    <h2 class="section-title">SEARCH</h2>
    <form id="searchForm" class="search-form">
      <label>
        Name
        <input id="q" type="text" placeholder="Song title or author" />
      </label>
      <label>
        Category
        <select id="cat">
          <option value="">—</option>
          ${categories
						.map((c) => `<option value="${c}">${c}</option>`)
						.join('')}
        </select>
      </label>
      <button class="btn" type="submit">SEARCH</button>
      <button class="btn" type="button" id="clear" style="background:#333;">CLEAR</button>
    </form>

    <p id="counter" class="section-sub"></p>
    <div id="results"></div>
    <p id="no-results" hidden>No results match your criteria.</p>
  `;

	const form = root.querySelector('#searchForm');
	const qIn = root.querySelector('#q');
	const catIn = root.querySelector('#cat');
	const resEl = root.querySelector('#results');
	const count = root.querySelector('#counter');
	const empty = root.querySelector('#no-results');
	const clearBtn = root.querySelector('#clear');

	// Reużywalne filtry (case-insensitive)
	const matchName = (song, query) => {
		if (!query) return true;
		const q = query.trim().toLowerCase();
		// autor jest ID → zamieniamy na string nazwiska przez app.formatAuthor
		const authorName = (app.formatAuthor?.(song.author) || '').toLowerCase();
		return song.title.toLowerCase().includes(q) || authorName.includes(q);
	};

	const matchCat = (song, cat) => {
		if (!cat) return true;
		return (song.categories || []).includes(cat);
	};

	function render(list) {
		resEl.innerHTML = '';
		list.forEach((s) => resEl.appendChild(songCard(s)));
		count.textContent = `We have found ${list.length} song${
			list.length === 1 ? '' : 's'
		}...`;
		empty.hidden = list.length !== 0;

		// Po wstrzyknięciu nowych <audio> trzeba zainicjalizować plugin dla tych elementów:
		if (window.GreenAudioPlayer) {
			GreenAudioPlayer.init({ selector: '.player', stopOthersOnPlay: true });
		}
	}

	// 4 scenariusze – start wyszukiwania dopiero po SUBMIT
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const q = qIn.value || '';
		const cat = catIn.value || '';

		const filtered = app.state.songs
			.filter((s) => matchName(s, q)) // jeśli q puste → true
			.filter((s) => matchCat(s, cat)); // jeśli cat pusty → true

		render(filtered);
	});

	// CLEAR – czyści formularz i pokazuje wszystkie
	clearBtn.addEventListener('click', () => {
		qIn.value = '';
		catIn.value = '';
		render(app.state.songs);
	});

	// Widok startowy (zgodnie ze specyfikacją: pusto = wszystkie)
	render(app.state.songs);

	return root;
}
