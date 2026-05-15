// Ajout dynamique des travaux dans la galerie du portfolio
// Récupère les travaux existants depuis l'API
fetch("http://localhost:5678/api/works") 
    .then(function(response) {
        if(response.ok) {
            return response.json();
        }
    })
    .then(function(data) {
        let works = data;
        console.log(works);
        // Boucle sur chaque travail pour créer les éléments HTML correspondants
        works.forEach((work, index) => {
            // Crée une balise <figure> pour chaque travail
            let myFigure = document.createElement('figure');
            myFigure.setAttribute('class', `work-item category-id-0 category-id-${work.categoryId}`);
            myFigure.setAttribute('id', `work-item-${work.id}`);
            // Ajoute une balise <img> avec l'URL et le titre du travail
            let myImg = document.createElement('img');
            myImg.setAttribute('src', work.imageUrl);
            myImg.setAttribute('alt', work.title);
            myFigure.appendChild(myImg);
            // Ajoute une balise <figcaption> avec le titre du travail
            let myFigCaption = document.createElement('figcaption');
            myFigCaption.textContent = work.title;
            myFigure.appendChild(myFigCaption);
            // Ajoute la figure à la galerie
            document.querySelector("div.gallery").appendChild(myFigure);
        });
    })
    .catch(function(err) {
        console.log(err);
    });

// Ajout des filtres de catégories pour filtrer les travaux dans la galerie
// Récupère les catégories existantes depuis l'API
fetch("http://localhost:5678/api/categories")
    .then(function(response) {
        if(response.ok) {
            return response.json();
        }
    })
    .then(function(data) {
        let categories = data;
        // Ajoute une catégorie "Tous" au début du tableau
        categories.unshift({id: 0, name: 'Tous'});
        console.log(categories);
        // Boucle sur chaque catégorie pour créer les boutons de filtre
        categories.forEach((category, index) => {
            // Crée un bouton pour chaque catégorie
            let myButton = document.createElement('button');
            myButton.classList.add('work-filter');
            myButton.classList.add('filters-design');
            if(category.id === 0) myButton.classList.add('filter-active', 'filter-all');
            myButton.setAttribute('data-filter', category.id);
            myButton.textContent = category.name;
            // Ajoute le bouton à la div des filtres
            document.querySelector("div.filters").appendChild(myButton);
            // Gère l'événement de clic pour filtrer les travaux
            myButton.addEventListener('click', function(event) {
                event.preventDefault();
                // Met à jour l'état actif des filtres
                document.querySelectorAll('.work-filter').forEach((workFilter) => {
                    workFilter.classList.remove('filter-active');
                });
                event.target.classList.add('filter-active');
                // Filtre les travaux en fonction de la catégorie sélectionnée
                let categoryId = myButton.getAttribute('data-filter');
                document.querySelectorAll('.work-item').forEach(workItem => {
                    workItem.style.display = 'none';
                });
                document.querySelectorAll(`.work-item.category-id-${categoryId}`).forEach(workItem => {
                    workItem.style.display = 'block';
                });
            });
        });
    })
    .catch(function(err) {
        console.log(err);
    });

    // Gère le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Vérifie si un token et un userId sont présents dans le localStorage (mode admin)
    if(localStorage.getItem('token') != null && localStorage.getItem('userId') != null) {
        // Applique les styles pour le mode admin
        document.querySelector('body').classList.add('connected');
        let topBar = document.getElementById('top-bar');
        topBar.style.display = "flex";
        let filters = document.getElementById('all-filters');
        filters.style.display = "none";
        let space = document.getElementById('space-only-admin');
        space.style.paddingBottom = "100px";
        let introduction = document.getElementById('space-introduction-in-mode-admin');
        introduction.style.marginTop = "-50px";
    }

    // Gère la déconnexion
    document.getElementById('nav-logout').addEventListener('click', function(event) {
        event.preventDefault();
        // Supprime les données du localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        // Réinitialise les styles après déconnexion
        document.querySelector('body').classList.remove(`connected`);
        let topBar = document.getElementById('top-bar');
        topBar.style.display = "none";
        let filters = document.getElementById('all-filters');
        filters.style.display = "flex";
        let space = document.getElementById('space-only-admin');
        space.style.paddingBottom = "0";
    });

    // Ouvre la modale pour modifier les travaux en mode admin
    document.getElementById('update-works').addEventListener('click', function(event) {
        event.preventDefault();
        // Récupère les travaux depuis l'API pour les afficher dans la modale
        fetch("http://localhost:5678/api/works")
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                }
            })
            .then(function(data) {
                let works = data;
                // Supprime les anciens travaux de la modale
                document.querySelector('#modal-works.modal-gallery .modal-content').innerText = '';
                // Ajoute chaque travail à la modale
                works.forEach((work, index) => {
                    // Crée une figure pour chaque travail
                    let myFigure = document.createElement('figure');
                    myFigure.setAttribute('class', `work-item category-id-0 category-id-${work.categoryId}`);
                    myFigure.setAttribute('id', `work-item-popup-${work.id}`);
                    // Ajoute l'image du travail
                    let myImg = document.createElement('img');
                    myImg.setAttribute('src', work.imageUrl);
                    myImg.setAttribute('alt', work.title);
                    myFigure.appendChild(myImg);
                    // Ajoute une légende "éditer"
                    let myFigCaption = document.createElement('figcaption');
                    myFigCaption.textContent = 'éditer';
                    myFigure.appendChild(myFigCaption);
                    // Ajoute une icône de déplacement
                    let crossDragDrop = document.createElement('i');
                    crossDragDrop.classList.add('fa-solid','fa-arrows-up-down-left-right', 'cross');
                    myFigure.appendChild(crossDragDrop);
                    // Ajoute une icône de suppression
                    let trashIcon = document.createElement('i');
                    trashIcon.classList.add('fa-solid', 'fa-trash-can', 'trash');
                    myFigure.appendChild(trashIcon);
                    // Gère la suppression d'un travail
                    trashIcon.addEventListener('click', function(event) {
                        event.preventDefault();
                        if(confirm("Voulez-vous supprimer cet élément ?")) {
                            // Supprime le travail via l'API
                            fetch(`http://localhost:5678/api/works/${work.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                                }
                            })
                            .then(function(response) {
                                switch(response.status) {
                                    case 500:
                                    case 503:
                                        alert("Comportement inattendu!");
                                    break;
                                    case 401:
                                        alert("Suppresion impossible!");
                                    break;
                                    case 200:
                                    case 204:
                                        console.log("Projet supprimé.");
                                        // Supprime le travail de la page
                                        document.getElementById(`work-item-${work.id}`).remove();
                                        console.log(`work-item-${work.id}`);
                                        // Supprime le travail de la modale
                                        document.getElementById(`work-item-popup-${work.id}`).remove();
                                        console.log(`work-item-popup-${work.id}`);
                                    break;
                                    default:
                                        alert("Erreur inconnue!");
                                    break;
                                }
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                        }
                    });
                    // Ajoute la figure à la modale
                    document.querySelector("div.modal-content").appendChild(myFigure);
                    // Ouvre la modale
                    let modal = document.getElementById('modal');
                    modal.style.display = "flex";
                    let modalWorks = document.getElementById('modal-works');
                    modalWorks.style.display = "block";
                });
            })
            .catch(function(err) {
                console.log(err);
            });
    });

    // Gère la fermeture des modales
    document.querySelectorAll('#modal-works').forEach(modalWorks => {
        modalWorks.addEventListener('click', function(event) {
            event.stopPropagation();
        });
        document.querySelectorAll('#modal-edit').forEach(modalEdit => {
            modalEdit.addEventListener('click', function(event) {
                event.stopPropagation();
            });
            // Ferme les modales en cliquant à l'extérieur
            document.getElementById('modal').addEventListener('click', function(event) {
                event.preventDefault();
                let modal = document.getElementById('modal');
                modal.style.display = "none";
                let modalWorks = document.getElementById('modal-works');
                modalWorks.style.display = "none";
                let modalEdit = document.getElementById('modal-edit');
                modalEdit.style.display = "none";
                // Réinitialise le formulaire d'édition
                if(document.getElementById('form-image-preview') != null) {
                    document.getElementById('form-image-preview').remove();
                }
                document.getElementById('modal-edit-work-form').reset();    
                let iconNewPhoto = document.getElementById('photo-add-icon');
                iconNewPhoto.style.display= "block";
                let buttonNewPhoto = document.getElementById('new-image');
                buttonNewPhoto.style.display= "block";
                let photoMaxSize = document.getElementById('photo-size');
                photoMaxSize.style.display= "block";    
                let modalEditPhoto = document.getElementById('modal-edit-new-photo');
                modalEditPhoto.style.padding = "30px 0 19px 0";
                document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
            });
        });
    });

    // Ferme la première modale avec le bouton "x"
    document.getElementById('button-to-close-first-window').addEventListener('click', function(event) {
        event.preventDefault();
        let modal = document.getElementById('modal');
        modal.style.display = "none";
        let modalWorks = document.getElementById('modal-works');
        modalWorks.style.display = "none";
    });

    // Ferme la deuxième modale avec le bouton "x"
    document.getElementById('button-to-close-second-window').addEventListener('click', function(event) {
        event.preventDefault();
        let modal = document.getElementById('modal');
        modal.style.display = "none";
        let modalEdit = document.getElementById('modal-edit');
        modalEdit.style.display = "none";
        // Réinitialise le formulaire d'édition
        if(document.getElementById('form-image-preview') != null) {
            document.getElementById('form-image-preview').remove();
        }
        document.getElementById('modal-edit-work-form').reset();
        let iconNewPhoto = document.getElementById('photo-add-icon');
        iconNewPhoto.style.display= "block";
        let buttonNewPhoto = document.getElementById('new-image');
        buttonNewPhoto.style.display= "block";
        let photoMaxSize = document.getElementById('photo-size');
        photoMaxSize.style.display= "block";    
        let modalEditPhoto = document.getElementById('modal-edit-new-photo');
        modalEditPhoto.style.padding = "30px 0 19px 0";
        document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
    });

    // Ouvre la deuxième modale pour ajouter une photo
    document.getElementById('modal-edit-add').addEventListener('click', function(event) {
        event.preventDefault();
        let modalWorks = document.getElementById('modal-works');
        modalWorks.style.display = "none";
        let modalEdit = document.getElementById('modal-edit');
        modalEdit.style.display = "block";
    });

    // Retour à la première modale avec la flèche
    document.getElementById('arrow-return').addEventListener('click', function(event) {
        event.preventDefault();
        let modalWorks = document.getElementById('modal-works');
        modalWorks.style.display = "block";
        let modalEdit = document.getElementById('modal-edit');
        modalEdit.style.display = "none";
        // Réinitialise le formulaire d'édition
        if(document.getElementById('form-image-preview') != null) {
            document.getElementById('form-image-preview').remove();
        }
        document.getElementById('modal-edit-work-form').reset();
        let iconNewPhoto = document.getElementById('photo-add-icon');
        iconNewPhoto.style.display= "block";
        let buttonNewPhoto = document.getElementById('new-image');
        buttonNewPhoto.style.display= "block";
        let photoMaxSize = document.getElementById('photo-size');
        photoMaxSize.style.display= "block";    
        let modalEditPhoto = document.getElementById('modal-edit-new-photo');
        modalEditPhoto.style.padding = "30px 0 19px 0";
        document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
    });
    
    // Récupère les catégories pour les options du formulaire d'édition
    fetch("http://localhost:5678/api/categories")
        .then(function(response) {
            if(response.ok) {
                return response.json();
            }
        })
        .then(function(data) {
            let categories = data;
            // Ajoute chaque catégorie comme option dans le select
            categories.forEach((category, index) => {
                let myOption = document.createElement('option');
                myOption.setAttribute('value', category.id);
                myOption.textContent = category.name;
                document.querySelector("select.choice-category").appendChild(myOption);
            });
        })
        .catch(function(err) {
            console.log(err);
        });

    // Gère la soumission du formulaire d'ajout de travail
    document.getElementById('modal-edit-work-form').addEventListener('submit', function(event) {
        event.preventDefault();
        let formData = new FormData();
        formData.append('title', document.getElementById('form-title').value);
        formData.append('category', document.getElementById('form-category').value);
        formData.append('image', document.getElementById('form-image').files[0]);
        // Envoie les données du formulaire à l'API
        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
            body: formData
        })
        .then(function(response) {
            switch(response.status) {
                case 500:
                case 503:
                    alert("Erreur inattendue!");
                break;
                case 400:
                case 404:
                    alert("Impossible d'ajouter le nouveau projet!");
                break;
                case 200:
                case 201:
                    console.log("Projet ajouté avec succés!");
                    return response.json();
                break;
                default:
                    alert("Erreur inconnue!");
                break;
            }
        })
        .then(function(json) {
            console.log(json);
            // Crée un nouvel élément HTML pour le travail ajouté
            let myFigure = document.createElement('figure');
            myFigure.setAttribute('class', `work-item category-id-0 category-id-${json.categoryId}`);
            myFigure.setAttribute('id', `work-item-${json.id}`);
            let myImg = document.createElement('img');
            myImg.setAttribute('src', json.imageUrl);
            myImg.setAttribute('alt', json.title);
            myFigure.appendChild(myImg);
            let myFigCaption = document.createElement('figcaption');
            myFigCaption.textContent = json.title;
            myFigure.appendChild(myFigCaption);
            document.querySelector("div.gallery").appendChild(myFigure);
            // Ferme la modale et réinitialise le formulaire
            let modal = document.getElementById('modal');
            modal.style.display = "none";
            let modalEdit = document.getElementById('modal-edit');
            modalEdit.style.display = "none";
            if(document.getElementById('form-image-preview') != null) {
                document.getElementById('form-image-preview').remove();
            }
            document.getElementById('modal-edit-work-form').reset();
            let iconNewPhoto = document.getElementById('photo-add-icon');
            iconNewPhoto.style.display= "block";
            let buttonNewPhoto = document.getElementById('new-image');
            buttonNewPhoto.style.display= "block";
            let photoMaxSize = document.getElementById('photo-size');
            photoMaxSize.style.display= "block";    
            let modalEditPhoto = document.getElementById('modal-edit-new-photo');
            modalEditPhoto.style.padding = "30px 0 19px 0";
            document.getElementById('submit-new-work').style.backgroundColor= "#A7A7A7";
        })
        .catch(function(err) {
            console.log(err);
        });
    });

    // Vérifie la taille du fichier image
    document.getElementById('form-image').addEventListener('change', () => {
        let fileInput = document.getElementById('form-image');
        const maxFileSize = 4 * 1024 * 1024; // 4MB
        if(fileInput.files[0].size > maxFileSize) {
            alert("Le fichier sélectionné est trop volumineux. La taille maximale est de 4 Mo.");
            document.getElementById('form-image').value = '';
        }
        else {
            if(fileInput.files.length > 0) {
                // Crée un aperçu de l'image
                let myPreviewImage = document.createElement('img');
                myPreviewImage.setAttribute('id','form-image-preview');
                myPreviewImage.src = URL.createObjectURL(fileInput.files[0]);
                document.querySelector('#modal-edit-new-photo').appendChild(myPreviewImage);
                myPreviewImage.style.display = "block";    
                myPreviewImage.style.height ="169px";
                let iconNewPhoto = document.getElementById('photo-add-icon');
                iconNewPhoto.style.display= "none";
                let buttonNewPhoto = document.getElementById('new-image');
                buttonNewPhoto.style.display= "none";
                let photoMaxSize = document.getElementById('photo-size');
                photoMaxSize.style.display= "none";    
                let modalEditPhoto = document.getElementById('modal-edit-new-photo');
                modalEditPhoto.style.padding = "0";
            }
        }
    });

    // Vérifie les champs du formulaire pour activer/désactiver le bouton de soumission
    document.getElementById('form-title').addEventListener('input', checkNewProjectFields);
    document.getElementById('form-category').addEventListener('input', checkNewProjectFields);
    document.getElementById('form-image').addEventListener('input', checkNewProjectFields);

    function checkNewProjectFields() {
        let title = document.getElementById('form-title');
        let category = document.getElementById('form-category');
        let image = document.getElementById('form-image');
        let submitWork = document.getElementById('submit-new-work');
        if(title.value.trim() === "" || category.value.trim() === "" || image.files.length === 0) {
            submitWork.style.backgroundColor= "#A7A7A7";
        } else {
            submitWork.style.backgroundColor= "#1D6154";
        }
    };
});