document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // --- Gestion du formulaire de connexion ---
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            window.location.href = 'index.html';
          } else {
            alert('Login failed: ' + response.statusText);
          }
        } catch (error) {
          console.error('Erreur réseau ou autre', error);
          alert('Impossible de se connecter pour le moment.');
        }
      });
    }

    // --- Vérification d'authentification ---
    checkAuthentication();
  });

  // Récupère un cookie par son nom
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';')[0];
  }

  // Affiche ou masque le lien login et lance fetch si connecté
  function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
      if (loginLink) loginLink.style.display = 'block';
    } else {
      if (loginLink) loginLink.style.display = 'none';
      fetchPlaces(token);
    }
  }

  // Récupère les lieux depuis l'API
  async function fetchPlaces(token) {
    try {
      const response = await fetch('http://localhost:5000/api/places', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        displayPlaces(data);
        setupFilter();
      } else {
        alert("Échec du chargement des lieux.");
      }
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
    }
  }

  // Affiche dynamiquement les lieux
  function displayPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;
    container.innerHTML = '';

    places.forEach(place => {
      const card = document.createElement('article');
      card.classList.add('place-card');
      card.dataset.price = place.price_per_night;

      card.innerHTML = `
        <h3>${place.name}</h3>
        <p>Prix par nuit : $${place.price_per_night}</p>
        <button class="details-button">Voir les détails</button>
      `;
      container.appendChild(card);
    });
  }

  // Met en place le filtre de prix
  function setupFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    // Ajoute les options
    ['10', '50', '100', 'All'].forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      priceFilter.appendChild(opt);
    });

    // Gère le filtrage
    priceFilter.addEventListener('change', (event) => {
      const selected = event.target.value;
      const cards = document.querySelectorAll('.place-card');

      cards.forEach(card => {
        const price = parseFloat(card.dataset.price);
        if (selected === 'All' || price <= parseFloat(selected)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
