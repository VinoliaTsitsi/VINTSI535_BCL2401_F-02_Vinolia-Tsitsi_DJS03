import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Function to render book previews
function renderBookPreviews(books, targetElement) {
    const fragment = document.createDocumentFragment();
    books.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const element = createBookElement(book);
        fragment.appendChild(element);
    });
    targetElement.appendChild(fragment);
}

// Function to create a single book preview element
function createBookElement(book) {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', book.id);

    element.innerHTML = `
        <img
            class="preview__image"
            src="${book.image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${book.title}</h3>
            <div class="preview__author">${authors[book.author]}</div>
        </div>
    `;
    return element;
}

// Function to apply filters to books
function applyFilters(formData, books) {
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {
        let genreMatch = filters.genre === 'any';

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) {
                genreMatch = true;
            }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        ) {
            result.push(book);
        }
    }

    return result;
}

// Function to update the "Show more" button
function updateListButton(button, remaining) {
    button.disabled = remaining <= 0;
    button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining})</span>
    `;
}

// Function to handle "Show more" button click
function handleShowMore(button, matches) {
    const fragment = document.createDocumentFragment();
    const start = page * BOOKS_PER_PAGE;
    const end = (page + 1) * BOOKS_PER_PAGE;

    for (const book of matches.slice(start, end)) {
        const element = createBookElement(book);
        fragment.appendChild(element);
    }

    document.querySelector('[data-list-items]').appendChild(fragment);
    page++;
    updateListButton(button, Math.max(0, matches.length - (page * BOOKS_PER_PAGE)));
}

// Initial page and matches
let page = 1;
let matches = books;

// Render initial book previews
renderBookPreviews(matches, document.querySelector('[data-list-items]'));

// Populate genre select options
populateSelectOptions('[data-search-genres]', genres);

// Populate author select options
populateSelectOptions('[data-search-authors]', authors);

// Set theme based on prefers-color-scheme
setTheme();

// Set initial list button text and disable if no more matches
const listButton = document.querySelector('[data-list-button]');
updateListButton(listButton, Math.max(0, matches.length - (page * BOOKS_PER_PAGE)));

// Event listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    setTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = applyFilters(formData, books);
    page = 1;
    matches = result;

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    }

    document.querySelector('[data-list-items]').innerHTML = '';
    renderBookPreviews(matches, document.querySelector('[data-list-items]'));
    updateListButton(listButton, Math.max(0, matches.length - (page * BOOKS_PER_PAGE)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-list-button]').addEventListener('click', () => {
    handleShowMore(listButton, matches);
});

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
        if (active) break;

        if (node?.dataset?.preview) {
            active = books.find(book => book.id === node.dataset.preview);
        }
    }

    if (active) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = active.description;
    }
});

// Helper function to populate select options
function populateSelectOptions(selector, options) {
    const selectElement = document.querySelector(selector);
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = 'any';
    defaultOption.innerText = 'All';
    fragment.appendChild(defaultOption);
    for (const [id, name] of Object.entries(options)) {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    }
    selectElement.appendChild(fragment);
}

// Helper function to set theme
function setTheme(theme) {
    if (theme === 'night' || (theme !== 'day' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.querySelector('[data-settings-theme]').value = 'night';
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.querySelector('[data-settings-theme]').value = 'day';
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}