export const routes = {
	'/home': () => import('./views/home.js'),
	'/search': () => import('./views/search.js'),
	'/discover': () => import('./views/discover.js'),
};

export function currentPath() {
	const hash = location.hash || '#/home';
	const path = hash.replace('#', '');
	return routes[path] ? path : '/home';
}

export async function renderRoute(app) {
	const path = currentPath();

	// aktywna zakładka
	document.querySelectorAll('nav a').forEach((a) => {
		a.classList.toggle('active', a.getAttribute('href') === '#' + path);
	});

	// dynamiczny import i render widoku
	const mod = await routes[path]();
	const view = await mod.default(app);
	const mount = document.getElementById('view');
	mount.innerHTML = '';
	mount.appendChild(view);

	// inicjalizacja playera dla nowo wstawionych <audio>
	if (window.GreenAudioPlayer) {
		GreenAudioPlayer.init({ selector: '.player', stopOthersOnPlay: true });
	}
}
