import { app } from './app.js';

export function songCard(song) {
	const wrap = document.createElement('article');
	wrap.className = 'song';

	const title = document.createElement('h3');
	title.className = 'song__title';
	const authorName = app.formatAuthor(song.author).toUpperCase();
	title.textContent = `${authorName} – ${song.title}`;
	wrap.appendChild(title);

	const audioBox = document.createElement('div');
	const audio = document.createElement('audio');
	audio.className = 'player';
	audio.setAttribute('preload', 'metadata');
	audio.src = `/songs/${song.filename}`;
	audio.addEventListener('play', () => app.onPlay(song));
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
