import { songCard } from '../templates.js';

export default async function SearchView(app) {
	const root = document.createElement('section');

	const h2 = document.createElement('h2');
	h2.className = 'section-title';
	h2.textContent = 'SEARCH';
	root.appendChild(h2);

	// formularz
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
	const empty = document.createElement('option');
	empty.value = '';
	empty.textContent = '—';
	select.appendChild(empty);
	const categories = [
		...new Set(app.state.songs.flatMap((s) => s.categories || [])),
	].sort();
	categories.forEach((c) => {
		const opt = document.createElement('option');
		opt.value = c;
		opt.textContent = c;
		select.appendChild(opt);
	});
	labCat.appendChild(select);

	const btnSearch = document.createElement('button');
	btnSearch.className = 'btn';
	btnSearch.type = 'submit';
	btnSearch.textContent = 'SEARCH';

	const btnClear = document.createElement('button');
	btnClear.className = 'btn';
	btnClear.type = 'button';
	btnClear.style.background = '#333';
	btnClear.textContent = 'CLEAR';

	form.appendChild(labName);
	form.appendChild(labCat);
	form.appendChild(btnSearch);
	form.appendChild(btnClear);
	root.appendChild(form);

	const counter = document.createElement('p');
	counter.id = 'counter';
	counter.className = 'section-sub';
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
		const author = (app.formatAuthor?.(song.author) || '').toLowerCase();
		return song.title.toLowerCase().includes(qv) || author.includes(qv);
	};
	const matchCat = (song, cat) => {
		if (!cat) return true;
		return (song.categories || []).includes(cat);
	};

	function render(items) {
		results.innerHTML = '';
		items.forEach((s) => results.appendChild(songCard(s)));
		counter.textContent = `We have found ${items.length} song${
			items.length === 1 ? '' : 's'
		}...`;
		nores.hidden = items.length !== 0;

		if (window.GreenAudioPlayer) {
			GreenAudioPlayer.init({ selector: '.player', stopOthersOnPlay: true });
		}
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const filtered = app.state.songs
			.filter((s) => matchName(s, q.value))
			.filter((s) => matchCat(s, select.value));
		render(filtered);
	});

	btnClear.addEventListener('click', () => {
		q.value = '';
		select.value = '';
		render(app.state.songs);
	});

	render(app.state.songs);
	return root;
}
