/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await loginUser(email, password);
            } catch (error) {
                // Afficher une alerte d'erreur
                alert('Login failed: ' + error.message);
            }
        });
    }

    // Check authentication and set up places listing
    checkAuthentication();

    // Configurer l'écouteur d'événement sur le bouton de filtrage statique
    const filterButton = document.getElementById('apply-filter');
    if (filterButton) {
        filterButton.addEventListener('click', function() {
            const priceFilter = document.getElementById('price-filter');
            if (priceFilter) {
                const selectedPrice = priceFilter.value;
                console.log('Applying filter with price:', selectedPrice);
                handlePriceFilter({ target: { value: selectedPrice } });
            }
        });
    }

    // Ajouter un écouteur d'événement direct sur le select pour filtrer en temps réel (optionnel)
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', handlePriceFilter);
    }

    // Supprimer la partie qui créait dynamiquement un bouton puisque nous l'avons maintenant en HTML
});

function getCookie(name) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    
    return cookieValue ? cookieValue.split('=')[1] : null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
        } else {
            loginLink.style.display = 'none';
        }
    }

    // Fetch places data regardless of authentication status
    fetchPlaces(token);
}

async function fetchPlaces(token) {
    const apiUrl = 'http://localhost:5000/api/v1/places';
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add token to headers if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayPlaces(data);
            // Store places data for filtering
            window.allPlaces = data;
        } else {
            console.error('Failed to fetch places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    
    if (!placesList) return;
    
    // Clear current content
    placesList.innerHTML = '';
    
    if (places.length === 0) {
        placesList.innerHTML = '<p>No places found.</p>';
        return;
    }
    
    // Display each place
    places.forEach(place => {
        const placeElement = document.createElement('div');
        placeElement.className = 'place';
        // Make sure price is stored as a number
        const price = parseInt(place.price_by_night || 0, 10);
        placeElement.setAttribute('data-price', price);
        console.log('Setting place price attribute:', price);
        
        placeElement.innerHTML = `
            <h2>${place.name}</h2>
            <div class="price_by_night">$${place.price_by_night || 'N/A'}</div>
            <div class="information">
                <div class="max_guest">${place.max_guest || 0} Guest${place.max_guest !== 1 ? 's' : ''}</div>
                <div class="number_rooms">${place.number_rooms || 0} Bedroom${place.number_rooms !== 1 ? 's' : ''}</div>
                <div class="number_bathrooms">${place.number_bathrooms || 0} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>
            </div>
            <div class="description">${place.description || 'No description available.'}</div>
        `;
        
        placesList.appendChild(placeElement);
    });
}

function handlePriceFilter(event) {
    const maxPrice = typeof event === 'object' && event.target ? event.target.value : event;
    console.log('Filtrage par prix activé. Prix maximum sélectionné:', maxPrice);
    
    // Utiliser les classes correctes qui correspondent à votre HTML
    const places = document.querySelectorAll('.place-card');
    console.log('Nombre d\'annonces trouvées:', places.length);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    places.forEach(place => {
        // Extraire le prix du texte de l'élément avec la classe 'price'
        const priceElement = place.querySelector('.price');
        if (!priceElement) {
            console.log('Élément de prix non trouvé pour une place');
            return;
        }
        
        // Format attendu: "$120 per night" - extraire seulement le nombre
        const priceText = priceElement.textContent;
        const priceMatch = priceText.match(/\$(\d+)/);
        
        if (!priceMatch) {
            console.log('Format de prix non reconnu:', priceText);
            return;
        }
        
        const price = parseInt(priceMatch[1], 10);
        console.log(`Annonce: prix=${price}, limite=${maxPrice}`);
        
        if (maxPrice === 'all') {
            place.style.display = 'flex'; // ou 'block' selon votre CSS
            visibleCount++;
        } else {
            const priceLimit = parseInt(maxPrice, 10);
            if (price <= priceLimit) {
                place.style.display = 'flex'; // ou 'block' selon votre CSS
                visibleCount++;
            } else {
                place.style.display = 'none';
                hiddenCount++;
            }
        }
    });
    
    console.log(`Résultat du filtrage: ${visibleCount} annonces visibles, ${hiddenCount} annonces masquées`);
}

async function loginUser(email, password) {
    const apiUrl = 'http://localhost:5000/api/v1/auth/login';
    
    console.log('Attempting login with:', { email, url: apiUrl });
    
    try {
        // Afficher les détails de la requête
        console.log('Request details:', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            // Ajoutez ceci pour voir les erreurs réseau détaillées
            mode: 'cors'
        });
        
        // Afficher les détails de la réponse
        console.log('Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: [...response.headers.entries()]
        });
        
        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            
            // Créer un élément pour afficher le message de succès
            const loginForm = document.getElementById('login-form');
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.color = 'green';
            successMessage.style.padding = '10px';
            successMessage.style.marginTop = '10px';
            successMessage.textContent = 'Connexion réussie! Redirection vers la page d\'accueil...';
            
            // Insérer le message après le formulaire
            loginForm.parentNode.insertBefore(successMessage, loginForm.nextSibling);
            
            // Masquer le formulaire si vous le souhaitez
            loginForm.style.display = 'none';
            
            console.log('Login successful. Token:', data.access_token);
            
            // Ajouter la redirection ici
            setTimeout(() => {
                window.location.href = 'index.html';  // Redirection vers index.html dans le même dossier
            }, 1500);
            
            return data;
        } else {
            let errorText = await response.text();
            console.error('Error response text:', errorText);
            
            let errorMessage = 'Login failed: ';
            try {
                // Tenter de parser la réponse comme JSON
                const errorData = JSON.parse(errorText);
                errorMessage += errorData.error || response.statusText;
            } catch (e) {
                // Si ce n'est pas du JSON valide
                errorMessage += response.statusText;
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Fonction séparée pour appliquer le filtre de prix
function applyPriceFilter(maxPrice) {
    console.log('Applying price filter with max price:', maxPrice);
    const places = document.querySelectorAll('.place');
    console.log('Found places:', places.length);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    places.forEach(place => {
        const priceStr = place.getAttribute('data-price');
        const price = parseInt(priceStr, 10);
        console.log(`Place price=${price}, limit=${maxPrice}`);
        
        if (maxPrice === 'all') {
            place.style.display = 'block';
            visibleCount++;
        } else {
            const priceLimit = parseInt(maxPrice, 10);
            if (price <= priceLimit) {
                place.style.display = 'block';
                visibleCount++;
            } else {
                place.style.display = 'none';
                hiddenCount++;
            }
        }
    });
    
    console.log(`Filter result: ${visibleCount} visible, ${hiddenCount} hidden`);
}

// Fonction simple de filtrage par prix - Corrigée
function filterPlacesByPrice(maxPrice) {
    console.log('Filtering places with max price:', maxPrice);
    const places = document.querySelectorAll('.place');
    console.log('Number of places found:', places.length);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    places.forEach(place => {
        const priceStr = place.getAttribute('data-price');
        console.log(`Place price attribute: ${priceStr}`);
        const price = parseInt(priceStr, 10);
        
        if (maxPrice === 'all') {
            place.style.display = 'block';
            visibleCount++;
        } else {
            const priceLimit = parseInt(maxPrice, 10);
            console.log(`Comparing price ${price} with limit ${priceLimit}`);
            if (price <= priceLimit) {
                place.style.display = 'block';
                visibleCount++;
            } else {
                place.style.display = 'none';
                hiddenCount++;
            }
        }
    });
    
    console.log(`Filter results: ${visibleCount} places visible, ${hiddenCount} places hidden`);
}