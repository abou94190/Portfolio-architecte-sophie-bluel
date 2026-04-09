// Importe les fonctions nécessaires
import { loginUser } from './login_service.js';
import {token_sauvegarde} from './token_service.js';

// Gère le chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    // Ajoute un écouteur d'événement pour le formulaire de connexion
    document.getElementById('user-login-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Crée un objet utilisateur avec les valeurs du formulaire
        const user = {
            email: document.querySelector('#email').value,
            password: document.querySelector('#password').value,
        };

        try {
            // Tente de connecter l'utilisateur via l'API
            const data = await loginUser(user);
            console.log("Authentification réussie.", data);

            // Sauvegarde le token et l'ID utilisateur
            token_sauvegarde(data);

            // Redirige vers la page d'accueil
            location.href = 'index.html';
        } catch (error) {
            // Affiche une alerte en cas d'erreur
            alert(error.message);
            console.error(error);
        }
    });
});