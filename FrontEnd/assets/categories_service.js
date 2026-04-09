// Exporte une fonction asynchrone pour récupérer les catégories depuis l'API
export async function fetchCategories() {
    try {
        // Effectue une requête GET vers l'API pour obtenir les catégories
        const response = await fetch("http://localhost:5678/api/categories");
        // Vérifie si la réponse est OK, sinon lance une erreur
        if (!response.ok) throw new Error("Erreur lors de la récupération des catégories");
        // Convertit la réponse en JSON
        let categories = await response.json();
        // Ajoute une catégorie "Tous" au début du tableau
        categories.unshift({ id: 0, name: 'Tous' });
        // Retourne les catégories
        return categories;
    } catch (error) {
        // En cas d'erreur, affiche l'erreur dans la console et retourne un tableau vide
        console.error(error);
        return [];
    }
}