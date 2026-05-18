import { fetchWorks, deleteWork, addWork } from './works_service.js';
import { fetchCategories } from './categories_service.js';
import { token_sauvegarde } from './token_service.js';
 
// =============================================
// CHARGEMENT INITIAL : travaux + filtres
// =============================================
fetchWorks().then(works => works.forEach(ajouterWorkDansGalerie));
 
fetchCategories().then(categories => {
    categories.forEach(category => {
        let myButton = document.createElement('button');
        myButton.classList.add('work-filter', 'filters-design');
        if (category.id === 0) myButton.classList.add('filter-active', 'filter-all');
        myButton.setAttribute('data-filter', category.id);
        myButton.textContent = category.name;
        document.querySelector("div.filters").appendChild(myButton);
 
        myButton.addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelectorAll('.work-filter').forEach(btn => btn.classList.remove('filter-active'));
            event.currentTarget.classList.add('filter-active');
            const categoryId = event.currentTarget.getAttribute('data-filter');
            document.querySelectorAll('.work-item').forEach(item => item.style.display = 'none');
            document.querySelectorAll('.work-item.category-id-' + categoryId).forEach(item => item.style.display = 'block');
        });
    });
});
 

// =============================================
// HELPER : créer un <figure> dans la galerie principale
// =============================================
function ajouterWorkDansGalerie(work) {
    let myFigure = document.createElement('figure');
    myFigure.className = 'work-item category-id-0 category-id-' + work.categoryId;
    myFigure.id = 'work-item-' + work.id;
    let myImg = document.createElement('img');
    myImg.src = work.imageUrl;
    myImg.alt = work.title;
    myFigure.appendChild(myImg);
    let myFigCaption = document.createElement('figcaption');
    myFigCaption.textContent = work.title;
    myFigure.appendChild(myFigCaption);
    document.querySelector("div.gallery").appendChild(myFigure);
}

// =============================================
// HELPER : réinitialiser le formulaire d'ajout
// =============================================
function resetFormulaire() {
    if (document.getElementById('form-image-preview')) {
        document.getElementById('form-image-preview').remove();
    }
    document.getElementById('modal-edit-work-form').reset();
    document.getElementById('photo-add-icon').style.display = 'block';
    document.getElementById('new-image').style.display = 'block';
    document.getElementById('photo-size').style.display = 'block';
    document.getElementById('modal-edit-new-photo').style.padding = '30px 0 19px 0';
    document.getElementById('submit-new-work').style.backgroundColor = '#A7A7A7';
}

// =============================================
// DOM READY
// =============================================
document.addEventListener('DOMContentLoaded', function () {

    // --- MODE ADMIN : affichage conditionnel ---
    if (localStorage.getItem('token') && localStorage.getItem('userId')) {
        document.querySelector('body').classList.add('connected');
        document.getElementById('top-bar').style.display = 'flex';
        document.getElementById('all-filters').style.display = 'none';
        document.getElementById('space-only-admin').style.paddingBottom = '100px';
        // Swap login ↔ logout dans le nav
        document.getElementById('nav-login-item').style.display = 'none';
        document.getElementById('nav-logout-item').style.display = 'block';
    }

    // --- DÉCONNEXION ---
    document.getElementById('nav-logout').addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        document.querySelector('body').classList.remove('connected');
        document.getElementById('top-bar').style.display = 'none';
        document.getElementById('all-filters').style.display = 'flex';
        document.getElementById('space-only-admin').style.paddingBottom = '0';
        document.getElementById('nav-login-item').style.display = 'block';
        document.getElementById('nav-logout-item').style.display = 'none';
    });

    // --- OUVRIR MODALE (bouton "modifier") ---
    document.getElementById('update-works').addEventListener('click', function (event) {
        event.preventDefault();

        fetch("http://localhost:5678/api/works")
            .then(function (response) {
                if (response.ok) return response.json();
            })
            .then(function (works) {
                // Vide la modale avant de la remplir
                document.getElementById('modal-works-content').innerHTML = '';

                works.forEach(function (work) {
                    let myFigure = document.createElement('figure');
                    myFigure.className = 'work-item category-id-0 category-id-' + work.categoryId;
                    myFigure.id = 'work-item-popup-' + work.id;

                    let myImg = document.createElement('img');
                    myImg.src = work.imageUrl;
                    myImg.alt = work.title;
                    myFigure.appendChild(myImg);


                    let trashIcon = document.createElement('i');
                    trashIcon.className = 'fa-solid fa-trash-can trash';
                    myFigure.appendChild(trashIcon);

                    // Suppression d'un travail
                    trashIcon.addEventListener('click', function (event) {
                        event.preventDefault();
                        if (confirm("Voulez-vous supprimer cet élément ?")) {
                            fetch('http://localhost:5678/api/works/' + work.id, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                                }
                            })
                            .then(function (response) {
                                if (response.status === 200 || response.status === 204) {
                                    let galItem = document.getElementById('work-item-' + work.id);
                                    if (galItem) galItem.remove();
                                    let modalItem = document.getElementById('work-item-popup-' + work.id);
                                    if (modalItem) modalItem.remove();
                                } else if (response.status === 401) {
                                    alert("Suppression impossible : non autorisé.");
                                } else {
                                    alert("Comportement inattendu !");
                                }
                            })
                            .catch(function (err) {
                                console.error(err);
                            });
                        }
                    });

                    document.getElementById('modal-works-content').appendChild(myFigure);
                });

                // Affiche la modale
                document.getElementById('modal').style.display = 'flex';
                document.getElementById('modal-works').style.display = 'block';
            })
            .catch(function (err) {
                console.error(err);
            });
    });

    // --- FERMETURE MODALE (clic sur l'overlay) ---
    document.getElementById('modal').addEventListener('click', function (event) {
        // Ferme uniquement si on clique sur l'overlay et pas sur une modale enfant
        if (event.target === document.getElementById('modal')) {
            fermerToutesModales();
        }
    });

    // Empêche la propagation des clics dans les fenêtres de la modale
    document.getElementById('modal-works').addEventListener('click', function (e) { e.stopPropagation(); });
    document.getElementById('modal-edit').addEventListener('click', function (e) { e.stopPropagation(); });

    // --- FERMETURE via bouton X (fenêtre 1) ---
    document.getElementById('button-to-close-first-window').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('modal').style.display = 'none';
        document.getElementById('modal-works').style.display = 'none';
    });

    // --- FERMETURE via bouton X (fenêtre 2) ---
    document.getElementById('button-to-close-second-window').addEventListener('click', function (event) {
        event.preventDefault();
        fermerToutesModales();
    });

    function fermerToutesModales() {
        document.getElementById('modal').style.display = 'none';
        document.getElementById('modal-works').style.display = 'none';
        document.getElementById('modal-edit').style.display = 'none';
        resetFormulaire();
    }

    // --- NAVIGATION : fenêtre 1 → fenêtre 2 ---
    document.getElementById('modal-edit-add').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('modal-works').style.display = 'none';
        document.getElementById('modal-edit').style.display = 'block';
    });

    // --- RETOUR : fenêtre 2 → fenêtre 1 ---
    document.getElementById('arrow-return').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('modal-edit').style.display = 'none';
        document.getElementById('modal-works').style.display = 'block';
        resetFormulaire();
    });

    // --- CHARGEMENT des catégories dans le <select> ---
    fetch("http://localhost:5678/api/categories")
        .then(function (response) {
            if (response.ok) return response.json();
        })
        .then(function (categories) {
            categories.forEach(function (category) {
                let myOption = document.createElement('option');
                myOption.value = category.id;
                myOption.textContent = category.name;
                document.querySelector("select.choice-category").appendChild(myOption);
            });
        })
        .catch(function (err) {
            console.error(err);
        });

    // --- APERÇU de l'image sélectionnée ---
    document.getElementById('form-image').addEventListener('change', function () {
        let fileInput = this;
        const maxFileSize = 4 * 1024 * 1024; // 4 Mo

        if (fileInput.files[0].size > maxFileSize) {
            alert("Le fichier sélectionné est trop volumineux. La taille maximale est de 4 Mo.");
            fileInput.value = '';
            return;
        }

        // Supprime un éventuel aperçu précédent
        let existing = document.getElementById('form-image-preview');
        if (existing) existing.remove();

        let myPreviewImage = document.createElement('img');
        myPreviewImage.id = 'form-image-preview';
        myPreviewImage.src = URL.createObjectURL(fileInput.files[0]);
        myPreviewImage.style.height = '169px';
        myPreviewImage.style.display = 'block';
        document.getElementById('modal-edit-new-photo').appendChild(myPreviewImage);

        document.getElementById('photo-add-icon').style.display = 'none';
        document.getElementById('new-image').style.display = 'none';
        document.getElementById('photo-size').style.display = 'none';
        document.getElementById('modal-edit-new-photo').style.padding = '0';

        verifierChamps();
    });

    // --- VALIDATION des champs du formulaire ---
    document.getElementById('form-title').addEventListener('input', verifierChamps);
    document.getElementById('form-category').addEventListener('change', verifierChamps);

    function verifierChamps() {
        let title = document.getElementById('form-title').value.trim();
        let category = document.getElementById('form-category').value;
        let image = document.getElementById('form-image').files;
        let submitBtn = document.getElementById('submit-new-work');
        submitBtn.style.backgroundColor = (title && category && image.length > 0) ? '#1D6154' : '#A7A7A7';
    }

    // --- SOUMISSION du formulaire d'ajout ---
    document.getElementById('modal-edit-work-form').addEventListener('submit', function (event) {
        event.preventDefault();

        let formData = new FormData();
        formData.append('title', document.getElementById('form-title').value);
        formData.append('category', document.getElementById('form-category').value);
        formData.append('image', document.getElementById('form-image').files[0]);

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: formData
        })
        .then(function (response) {
            if (response.status === 200 || response.status === 201) return response.json();
            if (response.status === 400 || response.status === 404) throw new Error("Impossible d'ajouter le projet !");
            throw new Error("Erreur inattendue !");
        })
        .then(function (json) {
            ajouterWorkDansGalerie(json);
            // Ferme la modale et réinitialise
            document.getElementById('modal').style.display = 'none';
            document.getElementById('modal-edit').style.display = 'none';
            resetFormulaire();
        })
        .catch(function (err) {
            alert(err.message);
            console.error(err);
        });
    });
});