import { songCard } from '../templates.js';

export default async function HomeView(app){
  const root = document.createElement('section');

  const h2 = document.createElement('h2');
  h2.className = 'section-title';
  h2.textContent = 'HOME';
  root.appendChild(h2);

  const sub = document.createElement('p');
  sub.className = 'section-sub';
  sub.textContent = 'Latest tracks';
  root.appendChild(sub);

  // pasek kategorii
  const ul = document.createElement('ul');
  ul.id = 'cats';
  ul.className = 'cats';
  ul.setAttribute('role','tablist');
  ul.setAttribute('aria-label','Filter by category');

  const categories = [...new Set(app.state.songs.flatMap(s => s.categories || []))].sort();
  categories.forEach(c => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    btn.dataset.cat = c;
    btn.setAttribute('aria-pressed','false');
    btn.textContent = c;
    li.appendChild(btn);
    ul.appendChild(li);
  });
  root.appendChild(ul);

  const list = document.createElement('div');
  list.id = 'songs';
  root.appendChild(list);

  let activeCat = null;

  function updateActiveButtons(){
    root.querySelectorAll('.cat-btn').forEach(btn=>{
      const isActive = btn.dataset.cat === activeCat;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function renderSongs(){
    const source = activeCat
      ? app.state.songs.filter(s => (s.categories || []).includes(activeCat))
      : app.state.songs;

    list.innerHTML = '';
    source.forEach(s => list.appendChild(songCard(s)));

    if (window.GreenAudioPlayer) {
      GreenAudioPlayer.init({ selector: '.player', stopOthersOnPlay: true });
    }
  }

  ul.addEventListener('click', (e)=>{
    const btn = e.target.closest('.cat-btn');
    if(!btn) return;
    const cat = btn.dataset.cat;
    activeCat = (activeCat === cat) ? null : cat; // toggle/reset
    updateActiveButtons();
    renderSongs();
  });

  renderSongs();
  updateActiveButtons();
  return root;
}
