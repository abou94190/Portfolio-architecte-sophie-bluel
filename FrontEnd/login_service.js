// Exporte une fonction asynchrone pour connecter un utilisateur
export async function loginUser(user) {
    try {
        // Envoie une requête POST à l'API de connexion
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
        });

        // Gère les différents codes de statut de la réponse
        switch (response.status) {
            case 500:
            case 503:
                throw new Error("Erreur côté serveur!");
            case 401:
            case 404:
                throw new Error("Email ou mot de passe incorrect!");
            case 200:
                return await response.json();
            default:
                throw new Error("Erreur inconnue!");
        }
    } catch (error) {
        throw error;
    }
}