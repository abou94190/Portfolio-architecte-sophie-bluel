// Exporte une fonction asynchrone pour récupérer les travaux depuis l'API
export async function fetchWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error("Erreur lors de la récupération des œuvres");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Exporte une fonction asynchrone pour supprimer un travail
export async function deleteWork(workId, token) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (![200, 204].includes(response.status)) {
            throw new Error("Suppression impossible");
        }

        console.log(`Projet ${workId} supprimé.`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Exporte une fonction asynchrone pour ajouter un travail
export async function addWork(formData, token) {
    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (![200, 201].includes(response.status)) {
            throw new Error("Erreur lors de l'ajout du projet");
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}