import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUAu5TwvkZvHPXGX1ou-cE79KCPCFk0Hc",
  authDomain: "hellogames-3566b.firebaseapp.com",
  projectId: "hellogames-3566b",
  storageBucket: "hellogames-3566b.appspot.com",
  messagingSenderId: "911778987452",
  appId: "1:911778987452:web:9f1892121a87ea60907fb9",
  measurementId: "G-GFM5ZQXFG5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const gameList = document.getElementById('game-list');
const featuredList = document.getElementById('featured-list');
const searchInput = document.getElementById('game-search');
const categoryBtns = document.querySelectorAll('.category-btn');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');

// Check for logged in user
function checkAuthState() {
  const name = localStorage.getItem('playerName');
  if (name) {
    document.getElementById('player-name-display').textContent = `Welcome back, ${name}!`;
    document.querySelector('.auth-buttons').style.display = 'none';
  }
}

// Load games with optional category filter
async function loadGames(category = 'all') {
  gameList.innerHTML = '<div class="loader">Loading games...</div>';
  
  try {
    let gamesQuery;
    if (category === 'all') {
      gamesQuery = query(collection(db, "games"), orderBy('name'));
    } else {
      gamesQuery = query(collection(db, "games"), where('category', '==', category), orderBy('name'));
    }

    const querySnapshot = await getDocs(gamesQuery);
    gameList.innerHTML = '';

    if (querySnapshot.empty) {
      gameList.innerHTML = '<div class="no-games">No games found in this category. Check back later!</div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const game = doc.data();
      createGameCard(game, gameList);
    });
  } catch (error) {
    console.error("Error loading games: ", error);
    gameList.innerHTML = '<div class="error">Oops! Failed to load games. Please try again later.</div>';
  }
}

// Load featured games
async function loadFeaturedGames() {
  featuredList.innerHTML = '<div class="loader">Loading featured games...</div>';
  
  try {
    const featuredQuery = query(collection(db, "games"), where('featured', '==', true), limit(4));
    const querySnapshot = await getDocs(featuredQuery);
    featuredList.innerHTML = '';

    if (querySnapshot.empty) {
      featuredList.innerHTML = '<div class="no-games">No featured games at the moment. Check back soon!</div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const game = doc.data();
      createGameCard(game, featuredList, true);
    });
  } catch (error) {
    console.error("Error loading featured games: ", error);
    featuredList.innerHTML = '<div class="error">Whoops! Couldn\'t load featured games.</div>';
  }
}

// Create game card element
function createGameCard(game, container, isFeatured = false) {
  const a = document.createElement('a');
  a.href = `play.html?game=${encodeURIComponent(game.link)}&title=${encodeURIComponent(game.name)}&img=${encodeURIComponent(game.image)}&desc=${encodeURIComponent(game.description || '')}`;
  a.className = `game-card ${game.size || 'small'} ${isFeatured ? 'featured' : ''}`;
  a.setAttribute('data-category', game.category || 'other');

  const img = document.createElement('img');
  img.src = game.image;
  img.alt = game.name;
  img.loading = "lazy";

  const overlay = document.createElement('div');
  overlay.className = 'game-overlay';

  const title = document.createElement('h3');
  title.className = 'game-title';
  title.textContent = game.name;

  const category = document.createElement('span');
  category.className = 'game-category';
  category.textContent = game.category || 'General';

  overlay.appendChild(title);
  overlay.appendChild(category);
  
  if (game.size === 'big') {
    const wrapper = document.createElement('div');
    wrapper.className = 'game-image-wrapper';
    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
    a.appendChild(wrapper);
  } else {
    a.appendChild(img);
    a.appendChild(overlay);
  }

  if (isFeatured) {
    const featuredBadge = document.createElement('span');
    featuredBadge.className = 'featured-badge';
    featuredBadge.innerHTML = '<i class="fas fa-star"></i> Featured';
    a.appendChild(featuredBadge);
  }

  container.appendChild(a);
}

// Initialize page
function init() {
  checkAuthState();
  loadGames();
  loadFeaturedGames();

  // Event listeners
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadGames(btn.dataset.category);
    });
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
      const title = card.querySelector('.game-title').textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
  });

  signupBtn.addEventListener('click', () => {
    window.location.href = 'signup.html';
  });

  loginBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);