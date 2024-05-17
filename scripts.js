import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'; 

//Function to render book previews
function renderBookPreviews(book, targetElement){
    const fragment = document.createDocumentFragment(); 
    books.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const element = createBookElement(book); 
        fragment.appendChild(element); 
    }); 
    targetElement.appendChild(fragment); 
}

//Function to create a single book preview element 
function createBookElement(book){
    const element = document.createElement('button')
    element.classlist = 'preview'; 
    element.setAttributeNS('data-preview', book.id); 

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

//Function to apply filters to books
function applyFilters(formData, books){
    const filters = object.fromEntries(formData)
    const result = []; 

    for (const book of books){
        let genreMatch = filters.genre === 'any'; 

        for (const singleGenre of book.genres) {
            if (genreMatch) break; 
            if (singleGenre === filters.genre) {
                genreMatch = true
            }
        }
        if (
            (filters.title.trim()=== '' || book.title.toLowerCase().includes(filters.title.toLowerCase()))&&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        ) {
            result.push(book); 
        }
    }
    return result; 
}

//"Update show more button function"
function updateListButton(button, remaining) {
    button.disabled = remaining <= 0; 
    button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remaining})</span>
    `; 
}

//Function to handle the show more button functionalities when clicked
function handleShowMore(button, matches) {
    const fragment = document.createDocumentFragement(); 
    const start = page * BOOKS_PER_PAGE; 
    const end = (page + 1) * BOOKS_PER_PAGE; 

    for (const book of matches.slice(start, end)) {
        const element = createBookElement(book); 
        fragment.appendChild(element); 
    }
    document.querySelector('[data-list-items]').appendChild(fragment); 
    page++; 
    updateListButton(button, Math.max(0, matches.length - (pahe * BOOKS_PER_PAGE))); 
}

//Pages and matches
let page = 1;
let matches = books

//Render initial book previews
renderBookPreviews(matches, document.querySelector('[data-list-items]'));

//populate Selact options
populateSelecteOptions('[data-search-genre]', genres); 
populateSelecteOptions('[data-search-genre]', authors);
setTheme(); 

// Set initial list button text and disable if no one matches
const listbutton = document.querySelector('[data-list-button]'); 
updateListButton(listbutton, Math.max(0, matches.length - (page * BOOKS_PER_PAGE))); 

//Event listiners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})