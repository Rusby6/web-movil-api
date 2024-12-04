const API_KEY = 'a204e67b48d2966d314ceafd70eec77d'; // Reemplaza con tu API key de TMDb
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';
let currentPage = 1;
let currentQuery = '';
let currentContent = 'movies'; // Indica si estamos en "movies" o "series"

const moviesContainer = document.getElementById('movies-container');
const seriesContainer = document.getElementById('series-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const modal = document.getElementById('modal');
const movieDetails = document.getElementById('movie-details');
const closeModalButton = document.getElementById('close-modal');
const moviesTab = document.getElementById('movies-tab');
const seriesTab = document.getElementById('series-tab');

// Cambiar entre "Películas" y "Series"
moviesTab.addEventListener('click', () => switchContent('movies'));
seriesTab.addEventListener('click', () => switchContent('series'));

function switchContent(contentType) {
  currentContent = contentType;
  currentPage = 1;
  currentQuery = '';
  moviesTab.classList.toggle('active-tab', contentType === 'movies');
  seriesTab.classList.toggle('active-tab', contentType === 'series');
  moviesContainer.classList.toggle('hidden', contentType !== 'movies');
  seriesContainer.classList.toggle('hidden', contentType !== 'series');
  fetchContent();
}

// Obtener contenido basado en el tipo actual (películas o series)
async function fetchContent() {
  const type = currentContent === 'movies' ? 'movie' : 'tv';
  const endpoint = `${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=es&page=${currentPage}`;
  await fetchAndDisplayContent(endpoint);
}

// Buscar contenido
async function searchContent(query, page = 1) {
  const type = currentContent === 'movies' ? 'movie' : 'tv';
  const endpoint = `${BASE_URL}/search/${type}?api_key=${API_KEY}&language=es&query=${query}&page=${page}`;
  await fetchAndDisplayContent(endpoint);
}

// Función genérica para obtener y mostrar contenido
async function fetchAndDisplayContent(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (currentContent === 'movies') {
      displayMovies(data.results);
    } else {
      displaySeries(data.results);
    }
    updatePaginationButtons(data.page, data.total_pages);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
}

// Mostrar películas
function displayMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach((movie) => {
    const movieElement = createContentCard(movie, 'title');
    moviesContainer.appendChild(movieElement);
  });
}

// Mostrar series
function displaySeries(series) {
  seriesContainer.innerHTML = '';
  series.forEach((serie) => {
    const serieElement = createContentCard(serie, 'name');
    seriesContainer.appendChild(serieElement);
  });
}

// Crear una tarjeta de contenido (película o serie)
function createContentCard(content, titleKey) {
  const contentElement = document.createElement('div');
  contentElement.classList.add('movie');
  contentElement.innerHTML = `
    <img src="${IMAGE_BASE_URL}${content.poster_path}" alt="${content[titleKey]}">
    <h3>${content[titleKey]}</h3>
    <p>${content.release_date || content.first_air_date || ''}</p>
    <p>⭐ ${content.vote_average}</p>
    <p>${content.overview ? content.overview.substring(0, 100) + '...' : ''}</p>
  `;
  contentElement.addEventListener('click', () => openModal(content, titleKey));
  return contentElement;
}

// Manejo del modal para contenido (película o serie)
async function openModal(content, titleKey) {
  movieDetails.innerHTML = `
    <h2>${content[titleKey]}</h2>
    <img src="${IMAGE_BASE_URL}${content.poster_path}" alt="${content[titleKey]}">
    <p><strong>Fecha de lanzamiento:</strong> ${content.release_date || content.first_air_date || 'No disponible'}</p>
    <p><strong>Calificación:</strong> ⭐ ${content.vote_average}</p>
    <p><strong>Lenguaje original:</strong> ${content.original_language.toUpperCase()}</p>
    <p><strong>Resumen:</strong> ${content.overview || 'No disponible'}</p>
  `;
  modal.classList.remove('hidden');
}

// Eventos de búsqueda y navegación
searchButton.addEventListener('click', () => {
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  if (currentQuery) {
    searchContent(currentQuery, currentPage);
  } else {
    fetchContent();
  }
});

prevPageButton.addEventListener('click', () => {
  currentPage--;
  if (currentQuery) {
    searchContent(currentQuery, currentPage);
  } else {
    fetchContent();
  }
});

nextPageButton.addEventListener('click', () => {
  currentPage++;
  if (currentQuery) {
    searchContent(currentQuery, currentPage);
  } else {
    fetchContent();
  }
});

// Cierre del modal
closeModalButton.addEventListener('click', () => modal.classList.add('hidden'));

// Cargar contenido inicial
fetchContent();
