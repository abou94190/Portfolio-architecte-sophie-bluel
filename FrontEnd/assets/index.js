import { fetchWorks } from './works_service.js';
import { fetchCategories } from './categories_service.js';

// ===========================
// ÉLÉMENTS DOM
// ===========================
const gallery = document.querySelector('.gallery');
const filtersContainer = document.querySelector('.filters');

const modal = document.getElementById('modal');
const modalGallery = document.getElementById('modal-works');
const modalAdd = document.getElementById('modal-edit');

// ===========================
// INITIALISATION
// ===========================
window.addEventListener('DOMContentLoaded', async () => {

    await loadGallery();
    await loadFilters();

    initAdminMode();
    initModalEvents();
    initAddWorkForm();
});

// ===========================
// CHARGEMENT GALERIE
// ===========================
async function loadGallery() {

    const works = await fetchWorks();

    gallery.innerHTML = '';

    works.forEach(work => {
        gallery.appendChild(createWorkCard(work));
    });
}

function createWorkCard(work) {

    const figure = document.createElement('figure');

    figure.classList.add(
        'gallery-item',
        `category-${work.categoryId}`
    );

    figure.dataset.id = work.id;

    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;

    return figure;
}

// ===========================
// FILTRES
// ===========================
async function loadFilters() {
    const categories = await fetchCategories();

    filtersContainer.innerHTML = '';

    const allCategory = { id: 0, name: 'Tous' };

    const allButton = createFilterButton(allCategory);
    filtersContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = createFilterButton(category);
        filtersContainer.appendChild(button);
    });
}

function createFilterButton(category) {

    const button = document.createElement('button');

    button.classList.add(
        'work-filter',
        'filters-design'
    );

    // bouton actif par défaut
    if (category.id === 0) {

        button.classList.add(
            'filter-active',
            'filter-all'
        );
    }

    button.textContent = category.name;

    button.addEventListener('click', () => {

        document
            .querySelectorAll('.work-filter')
            .forEach(btn => {
                btn.classList.remove('filter-active');
            });

        button.classList.add('filter-active');

        applyFilter(category.id);
    });

    return button;
}

function applyFilter(categoryId) {

    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {

        if (
            categoryId === 0 ||
            item.classList.contains(`category-${categoryId}`)
        ) {
            item.style.display = 'block';
        }

        else {
            item.style.display = 'none';
        }
    });
}

// ===========================
// MODE ADMIN
// ===========================
function initAdminMode() {

    const isConnected =
        localStorage.getItem('token') &&
        localStorage.getItem('userId');

    if (!isConnected) return;

    document.body.classList.add('admin-mode');

    document.getElementById('top-bar').style.display = 'flex';

    document.getElementById('nav-login-item').style.display = 'none';

    document.getElementById('nav-logout-item').style.display = 'block';

    document.getElementById('all-filters').style.display = 'none';

    document
        .getElementById('space-only-admin')
        .style.paddingBottom = '100px';

    document
        .getElementById('nav-logout')
        .addEventListener('click', logout);
}

function logout(event) {

    event.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    window.location.reload();
}

// ===========================
// MODALES
// ===========================
function initModalEvents() {

    document
        .getElementById('update-works')
        .addEventListener('click', openGalleryModal);

    modal.addEventListener('click', event => {

        if (event.target === modal) {
            closeModal();
        }
    });

    document
        .getElementById('button-to-close-first-window')
        .addEventListener('click', closeModal);

    document
        .getElementById('button-to-close-second-window')
        .addEventListener('click', closeModal);

    document
        .getElementById('modal-edit-add')
        .addEventListener('click', switchToAddModal);

    document
        .getElementById('arrow-return')
        .addEventListener('click', switchToGalleryModal);

    modalGallery.addEventListener('click', e => {
        e.stopPropagation();
    });

    modalAdd.addEventListener('click', e => {
        e.stopPropagation();
    });
}

async function openGalleryModal(event) {

    event.preventDefault();

    modal.style.display = 'flex';

    modalGallery.style.display = 'block';

    await refreshModalGallery();
}

function closeModal() {

    modal.style.display = 'none';

    modalGallery.style.display = 'none';

    modalAdd.style.display = 'none';

    resetAddForm();
}

function switchToAddModal() {

    modalGallery.style.display = 'none';

    modalAdd.style.display = 'block';
}

function switchToGalleryModal() {

    modalAdd.style.display = 'none';

    modalGallery.style.display = 'block';

    resetAddForm();
}

// ===========================
// CONTENU MODALE
// ===========================
async function refreshModalGallery() {

    const container =
        document.getElementById('modal-works-content');

    container.innerHTML = '';

    const works = await fetchWorks();

    works.forEach(work => {

        const figure = document.createElement('figure');

        figure.classList.add('modal-work');

        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <button class="delete-work-btn">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        figure
            .querySelector('.delete-work-btn')
            .addEventListener('click', () => {
                deleteProject(work.id);
            });

        container.appendChild(figure);
    });
}

// ===========================
// SUPPRESSION PROJET
// ===========================
async function deleteProject(workId) {

    const confirmed = confirm(
        'Voulez-vous supprimer ce projet ?'
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `http://localhost:5678/api/works/${workId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Erreur suppression');
        }

        await loadGallery();

        await refreshModalGallery();

    } catch (error) {

        console.error(error);

        alert('Impossible de supprimer le projet.');
    }
}

// ===========================
// FORMULAIRE AJOUT
// ===========================
function initAddWorkForm() {

    const form =
        document.getElementById('modal-edit-work-form');

    const imageInput =
        document.getElementById('form-image');

    imageInput.addEventListener(
        'change',
        handleImagePreview
    );

    form.addEventListener(
        'submit',
        submitNewProject
    );

    document
        .getElementById('form-title')
        .addEventListener('input', validateForm);

    document
        .getElementById('form-category')
        .addEventListener('change', validateForm);
}

// ===========================
// APERÇU IMAGE
// ===========================
function handleImagePreview(event) {

    const file = event.target.files[0];

    if (!file) return;

    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {

        alert('Image trop volumineuse (4 Mo max).');

        event.target.value = '';

        return;
    }

    const oldPreview =
        document.getElementById('form-image-preview');

    if (oldPreview) {
        oldPreview.remove();
    }

    const img = document.createElement('img');

    img.id = 'form-image-preview';

    img.src = URL.createObjectURL(file);

    img.style.height = '169px';

    document
        .getElementById('modal-edit-new-photo')
        .appendChild(img);

    document.getElementById('photo-add-icon').style.display = 'none';

    document.getElementById('new-image').style.display = 'none';

    document.getElementById('photo-size').style.display = 'none';

    document.getElementById('modal-edit-new-photo').style.padding = '0';

    validateForm();
}

// ===========================
// VALIDATION FORMULAIRE
// ===========================
function validateForm() {

    const title =
        document.getElementById('form-title')
        .value
        .trim();

    const category =
        document.getElementById('form-category')
        .value;

    const image =
        document.getElementById('form-image')
        .files;

    const submitBtn =
        document.getElementById('submit-new-work');

    const formIsValid =
        title &&
        category &&
        image.length > 0;

    submitBtn.style.backgroundColor =
        formIsValid
            ? '#1D6154'
            : '#A7A7A7';
}

// ===========================
// ENVOI NOUVEAU PROJET
// ===========================
async function submitNewProject(event) {

    event.preventDefault();

    const formData = new FormData();

    formData.append(
        'title',
        document.getElementById('form-title').value
    );

    formData.append(
        'category',
        document.getElementById('form-category').value
    );

    formData.append(
        'image',
        document.getElementById('form-image').files[0]
    );

    try {

        const response = await fetch(
            'http://localhost:5678/api/works',
            {
                method: 'POST',
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(
                'Impossible d’ajouter le projet'
            );
        }

        await loadGallery();

        closeModal();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}

// ===========================
// RESET FORMULAIRE
// ===========================
function resetAddForm() {

    document
        .getElementById('modal-edit-work-form')
        .reset();

    const preview =
        document.getElementById('form-image-preview');

    if (preview) {
        preview.remove();
    }

    document.getElementById('photo-add-icon').style.display = 'block';

    document.getElementById('new-image').style.display = 'block';

    document.getElementById('photo-size').style.display = 'block';

    document.getElementById('modal-edit-new-photo').style.padding =
        '30px 0 19px 0';

    document.getElementById('submit-new-work').style.backgroundColor =
        '#A7A7A7';
}