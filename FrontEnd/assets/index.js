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