/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

// Un seul écouteur DOMContentLoaded pour tout gérer
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    
    // Vérifier explicitement la présence des boutons avant manipulation
    const loginButton = document.querySelector('.login-button') || document.getElementById('login-link');
    const logoutButton = document.querySelector('.logout-button');
    
    console.log('Login button found:', loginButton);
    console.log('Logout button found:', logoutButton);
    
    // Par défaut, afficher le bouton login et cacher le bouton logout
    if (loginButton) {
        loginButton.style.display = 'block';
    }
    
    if (logoutButton) {
        logoutButton.style.display = 'none';
    }
    
    // Ajuster l'affichage selon l'état d'authentification
    const token = getCookie('token');
    
    if (token) {
        console.log('User is authenticated');
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) {
            logoutButton.style.display = 'block';
            logoutButton.addEventListener('click', logout);
        }
    } else {
        console.log('User is NOT authenticated');
        if (loginButton) loginButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
    }

    // Configurer le formulaire de connexion s'il existe
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form detected, setting up event listener');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await loginUser(email, password);
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        });
    }

    // Configurer le filtre de prix s'il existe
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

    // Ajouter un écouteur d'événement direct sur le select pour filtrer en temps réel
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', handlePriceFilter);
    }

    // Charger les places ou les détails selon la page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('place.html')) {
        // Page de détails d'une place
        const placeId = getPlaceIdFromURL();
        if (placeId) {
            checkAuthForPlaceDetails(placeId);
        } else {
            displayError("No place ID found in URL");
        }
    } else {
        // Page d'index ou autre
        fetchPlaces(token); // CHANGÉ: appel direct à fetchPlaces au lieu de checkAuthentication
    }

    // Ajoutez cette ligne à la fin de votre événement DOMContentLoaded
    setTimeout(function() {
        const loginButton = document.querySelector('.login-button') || document.getElementById('login-link');
        if (loginButton) {
            console.log('Forcing login button visibility');
            loginButton.setAttribute('style', 'display: block !important; visibility: visible !important;');
        }
    }, 500); // 500ms après le chargement
});

function getCookie(name) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    
    return cookieValue ? cookieValue.split('=')[1] : null;
}

function logout(event) {
    if (event) event.preventDefault();
    
    // Supprimer le cookie de token
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log('User logged out');
    
    // Rediriger vers la page d'accueil
    window.location.href = 'index.html';
}

// Garder cette fonction mais elle ne sera plus appelée directement
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

/**
 * Fetches places data from the API
 * @param {string} token - JWT authentication token (can be null)
 */
function fetchPlaces(token) {
    try {
        console.log('Attempting to fetch places with token:', token ? "Token present" : "No token");
        
        // Vérifier si le conteneur des places existe avant de continuer
        const placesList = document.getElementById('places-list');
        if (!placesList) {
            console.log('Places list container not found, probably not on index page');
            return; // Ne pas continuer si on n'est pas sur la page d'index
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add Authorization header only if token is available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Utiliser l'URL avec slash à la fin pour éviter la redirection
        fetch('http://localhost:5000/api/v1/places/', {
            method: 'GET',
            headers: headers,
            credentials: 'include' // Pour inclure les cookies
        })
        .then(response => {
            console.log('Places response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch places: ${response.status} ${response.statusText}`);
            }
            
            return response.json();
        })
        .then(placesData => {
            console.log('Places data received:', placesData);
            
            if (placesData && Array.isArray(placesData)) {
                displayPlaces(placesData);
                window.allPlaces = placesData; // Stocker pour référence future
            } else {
                console.error('Invalid places data format:', placesData);
                throw new Error('Invalid data format received from server');
            }
        })
        .catch(error => {
            console.error("Error fetching places:", error);
            placesList.innerHTML = '<p class="error-message">Failed to load places. Please try again later.</p>';
        });
        
    } catch (error) {
        console.error("Error in fetchPlaces function:", error);
    }
}

/**
 * Displays places on the page
 * @param {Array} places - Array of place objects
 */
function displayPlaces(places) {
    // Débogage détaillé pour voir la structure exacte des données
    console.log('Raw places data to display:', places);
    
    // Vérifier la structure du premier objet si disponible
    if (places && places.length > 0) {
        console.log('Structure du premier objet place:', places[0]);
    }
    
    // Clear the current content of the places list
    const placesList = document.getElementById('places-list');
    if (!placesList) {
        console.error('Places list element not found');
        return;
    }
    
    placesList.innerHTML = '';
    
    if (!places || places.length === 0) {
        placesList.innerHTML = '<p style="text-align: center; margin-top: 20px;">Aucune place disponible pour le moment.</p>';
        return;
    }
    
    // Créer un conteneur flex pour les cartes de places
    const placesContainer = document.createElement('div');
    placesContainer.className = 'places-container';
    
    // Iterate over the places data
    places.forEach(place => {
        // For each place, create a div element and set its content
        const placeElement = document.createElement('div');
        placeElement.className = 'place-card';
        
        // Support multiple possible property names
        const id = place.id;
        const name = findPropertyValue(place, ['name', 'title', 'place_name']);
        const description = findPropertyValue(place, ['description', 'desc']);
        const price = findPropertyValue(place, ['price_by_night', 'price', 'price_per_night', 'nightly_price']);
        
        // Ne pas utiliser d'image du tout, on supprime cette ligne
        // const image = findPropertyValue(place, ['image_url', 'thumbnail']) || '../images/default-place.jpg';
        
        // Set price attribute for filtering
        placeElement.dataset.price = price || 0;
        
        // Supprimer complètement la balise img au lieu d'utiliser une image par défaut
        placeElement.innerHTML = `
            <div class="place-info">
                <h3>${name || 'Sans nom'}</h3>
                <p>${description ? (description.substring(0, 100) + (description.length > 100 ? '...' : '')) : 'Pas de description disponible'}</p>
                <div class="price">$${price || 0} per night</div>
                <a href="place.html?id=${id}" class="details-button">View Details</a>
            </div>
        `;
        
        // Append the created element to the places container
        placesContainer.appendChild(placeElement);
    });
    
    // Add the container to the places list
    placesList.appendChild(placesContainer);
    
    // Appliquer le filtre initial
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter && priceFilter.value && priceFilter.value !== 'all') {
        handlePriceFilter({ target: { value: priceFilter.value } });
    }
}

/**
 * Helper function to find a property value using multiple possible property names
 * @param {Object} obj - Object to search in
 * @param {Array} propNames - Array of possible property names
 * @returns {*} - Found value or undefined
 */
function findPropertyValue(obj, propNames) {
    if (!obj) return undefined;
    
    for (const prop of propNames) {
        if (obj[prop] !== undefined) {
            return obj[prop];
        }
    }
    return undefined;
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

/**
 * Extracts the place ID from URL query parameters
 * @returns {string|null} The place ID or null if not found
 */
function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Checks authentication for place details page
 * @param {string} placeId - ID of the place to fetch
 */
function checkAuthForPlaceDetails(placeId) {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        // User not authenticated, hide review form
        if (addReviewSection) {
            addReviewSection.style.display = 'none';
        }
    } else {
        // User is authenticated, show review form
        if (addReviewSection) {
            addReviewSection.style.display = 'block';
            
            // Set up review form submission handler
            setupReviewForm(token, placeId);
        }
    }
    
    // Regardless of authentication, fetch and display place details
    fetchPlaceDetails(token, placeId);
}

/**
 * Fetches place details from the API
 * @param {string} token - JWT authentication token (can be null)
 * @param {string} placeId - ID of the place to fetch
 */
async function fetchPlaceDetails(token, placeId) {
    try {
        const apiUrl = `http://localhost:5000/api/v1/places/${placeId}`;
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
        
        if (!response.ok) {
            throw new Error(`Failed to fetch place details: ${response.statusText}`);
        }
        
        const placeData = await response.json();
        displayPlaceDetails(placeData);
        
        // Also fetch reviews for this place
        fetchReviews(token, placeId);
        
    } catch (error) {
        console.error("Error fetching place details:", error);
        displayError("Failed to load place details. Please try again later.");
    }
}

/**
 * Fetches reviews for a specific place
 * @param {string} token - JWT authentication token (can be null)
 * @param {string} placeId - ID of the place to fetch reviews for
 */
async function fetchReviews(token, placeId) {
    try {
        const apiUrl = `http://localhost:5000/api/v1/places/${placeId}/reviews`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        
        const reviewsData = await response.json();
        displayReviews(reviewsData);
        
    } catch (error) {
        console.error("Error fetching reviews:", error);
        // Don't show error for reviews, just log it
    }
}

/**
 * Displays place details on the page
 * @param {Object} place - Place data from the API
 */
function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    
    if (!placeDetailsSection) return;
    
    // Log pour voir la structure de l'objet place
    console.log("Place details received:", place);
    
    // Clear any existing content
    placeDetailsSection.innerHTML = '';
    
    // Use helper function to find property values
    const name = findPropertyValue(place, ['name', 'title', 'place_name']) || 'Unknown Place';
    const price = findPropertyValue(place, ['price_by_night', 'price', 'price_per_night']) || 0;
    const city = findPropertyValue(place, ['city', 'location_city']) || '';
    const state = findPropertyValue(place, ['state', 'location_state']) || '';
    const description = findPropertyValue(place, ['description', 'desc']) || 'No description available';
    const amenities = place.amenities || [];
    
    // Create place details HTML structure
    const detailsHTML = `
        <div class="place-details">
            <h1>${name}</h1>
            <div class="price">$${price} per night</div>
            <div class="location">${city}${city && state ? ', ' : ''}${state}</div>
            <div class="description">${description}</div>
            
            <div class="amenities">
                <h2>Amenities</h2>
                <ul>
                    ${amenities.length > 0 ? amenities.map(amenity => 
                        `<li>${typeof amenity === 'object' ? (amenity.name || 'Unknown') : amenity}</li>`
                    ).join('') : 'No amenities listed'}
                </ul>
            </div>
        </div>
    `;
    
    placeDetailsSection.innerHTML = detailsHTML;
}

/**
 * Displays reviews for the place
 * @param {Array} reviews - Array of review objects
 */
function displayReviews(reviews) {
    const reviewsSection = document.getElementById('reviews');
    
    if (!reviewsSection) return;
    
    // Clear any existing content
    reviewsSection.innerHTML = '<h2>Reviews</h2>';
    
    if (!reviews || reviews.length === 0) {
        reviewsSection.innerHTML += '<p>No reviews yet. Be the first to leave a review!</p>';
        return;
    }
    
    // Create a container for all reviews
    const reviewsContainer = document.createElement('div');
    reviewsContainer.className = 'reviews-container';
    
    // Add each review
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        // Format date
        const reviewDate = new Date(review.created_at).toLocaleDateString();
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <span class="review-author">${review.user_name || 'Anonymous'}</span>
                <span class="review-date">${reviewDate}</span>
            </div>
            <div class="review-text">${review.text}</div>
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });
    
    reviewsSection.appendChild(reviewsContainer);
}

/**
 * Sets up the review form submission handler
 * @param {string} token - JWT authentication token
 * @param {string} placeId - ID of the place
 */
function setupReviewForm(token, placeId) {
    const reviewForm = document.getElementById('review-form');
    
    if (!reviewForm) return;
    
    reviewForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const reviewText = document.getElementById('review-text').value;
        
        if (!reviewText.trim()) {
            alert('Please enter a review');
            return;
        }
        
        try {
            const apiUrl = `http://localhost:5000/api/v1/places/${placeId}/reviews`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: reviewText
                }),
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to submit review: ${response.statusText}`);
            }
            
            // Clear the form
            document.getElementById('review-text').value = '';
            
            // Refresh reviews after submission
            fetchReviews(token, placeId);
            
            alert('Review submitted successfully!');
            
        } catch (error) {
            console.error("Error submitting review:", error);
            alert('Failed to submit review. Please try again.');
        }
    });
}

/**
 * Displays an error message on the page
 * @param {string} message - Error message to display
 */
function displayError(message) {
    const placeDetailsSection = document.getElementById('place-details');
    if (placeDetailsSection) {
        placeDetailsSection.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Ajout de window.onload pour une dernière vérification
window.onload = function() {
    console.log("Window fully loaded, final check for login button");
    const loginButton = document.querySelector('.login-button') || document.getElementById('login-link');
    
    if (loginButton) {
        console.log("Final attempt to force login button visibility");
        loginButton.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important;');
    }
};
