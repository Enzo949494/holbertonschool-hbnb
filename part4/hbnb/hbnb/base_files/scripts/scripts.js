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
});

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