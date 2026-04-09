// Fonction pour sauvegarder le token et l'ID utilisateur dans le localStorage
export function token_sauvegarde(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
}

// Fonction pour vérifier si l'utilisateur est connecté (non implémentée)
export function isconnected() {
    // À implémenter
}