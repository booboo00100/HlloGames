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

// Create game card element with size handling
function createGameCard(game, container, isFeatured = false) {
  const a = document.createElement('a');
  a.href = `play.html?game=${encodeURIComponent(game.link)}&title=${encodeURIComponent(game.name)}&img=${encodeURIComponent(game.image)}&desc=${encodeURIComponent(game.description || '')}`;
  
  // Set size class based on game.size from Firebase
  let sizeClass = '';
  if (game.size === 'small') {
    sizeClass = 'size-small';
  } else if (game.size === 'medium') {
    sizeClass = 'size-medium'; 
  } else if (game.size === 'big') {
    sizeClass = 'size-big';
  }
  
  a.className = `game-card ${sizeClass} ${isFeatured ? 'featured' : ''}`;
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
  
  // Only wrap in div if size is big (for special styling)
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



// Cookie Consent Functionality
document.addEventListener('DOMContentLoaded', function() {
  const cookieBanner = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');
  
  // Check if user has already made a choice
  if (!getCookie('cookie_consent')) {
    // Show banner if no choice was made
    cookieBanner.style.display = 'block';
    
    // Set a cookie that expires in 30 days
    const setConsentCookie = (value) => {
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `cookie_consent=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
      
      // If accepted, also set the Google Analytics cookie
      if (value === 'accepted') {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA ID
      }
      
      cookieBanner.style.display = 'none';
    };
    
    // Button event listeners
    acceptBtn.addEventListener('click', () => setConsentCookie('accepted'));
    rejectBtn.addEventListener('click', () => setConsentCookie('rejected'));
  }
  
  // Helper function to get cookie value
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}



// PWA Installation Handling
let deferredPrompt;
const installButton = document.getElementById('installBtn');
const installBanner = document.getElementById('installBanner');

// Only show install elements if they exist
if (installButton || installBanner) {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button if it exists
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', installPWA);
    }
    
    // Show banner if it exists (optional)
    if (installBanner) {
      installBanner.style.display = 'flex';
      document.getElementById('installLater').addEventListener('click', () => {
        installBanner.style.display = 'none';
      });
    }
  });
}

function installPWA() {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      // Hide the install button/banner after successful installation
      if (installButton) installButton.style.display = 'none';
      if (installBanner) installBanner.style.display = 'none';
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt variable
    deferredPrompt = null;
  });
}

// Track successful installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  // You can send analytics here
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_installed');
  }
});

// Check if the app is running as a PWA
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Hide install elements if already running as PWA
if (isRunningAsPWA()) {
  if (installButton) installButton.style.display = 'none';
  if (installBanner) installBanner.style.display = 'none';
}
