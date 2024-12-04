const API_KEY = 'a204e67b48d2966d314ceafd70eec77d'; // API key de TMDb
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';
let currentPage = 1;
let currentQuery = '';
let currentContent = 'movies'; // Indica si estamos en "movies", "series", o "cinema"

const moviesContainer = document.getElementById('movies-container');
const seriesContainer = document.getElementById('series-container');
const cinemaContainer = document.getElementById('cinema-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const modal = document.getElementById('modal');
const movieDetails = document.getElementById('movie-details');
const closeModalButton = document.getElementById('close-modal');
const moviesTab = document.getElementById('movies-tab');
const seriesTab = document.getElementById('series-tab');
const cinemaTab = document.getElementById('cinema-tab');

// Cambiar entre "Películas", "Series", y "En Cines"
moviesTab.addEventListener('click', () => switchContent('movies'));
seriesTab.addEventListener('click', () => switchContent('series'));
cinemaTab.addEventListener('click', () => switchContent('cinema'));

function switchContent(contentType) {
  currentContent = contentType;
  currentPage = 1;
  currentQuery = '';
  moviesTab.classList.toggle('active-tab', contentType === 'movies');
  seriesTab.classList.toggle('active-tab', contentType === 'series');
  cinemaTab.classList.toggle('active-tab', contentType === 'cinema');
  moviesContainer.classList.toggle('hidden', contentType !== 'movies');
  seriesContainer.classList.toggle('hidden', contentType !== 'series');
  cinemaContainer.classList.toggle('hidden', contentType !== 'cinema');
  fetchContent();
}

// Obtener contenido basado en el tipo actual
async function fetchContent() {
  let endpoint;
  if (currentContent === 'movies') {
    endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es&page=${currentPage}`;
  } else if (currentContent === 'series') {
    endpoint = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es&page=${currentPage}`;
  } else if (currentContent === 'cinema') {
    endpoint = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es&page=${currentPage}`;
  }
  await fetchAndDisplayContent(endpoint);
}

// Mostrar contenido basado en el tipo
async function fetchAndDisplayContent(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (currentContent === 'movies') {
      displayMovies(data.results);
    } else if (currentContent === 'series') {
      displaySeries(data.results);
    } else if (currentContent === 'cinema') {
      displayCinema(data.results);
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
    const seriesElement = createContentCard(serie, 'name');
    seriesContainer.appendChild(seriesElement);
  });
}

// Mostrar películas en cines
function displayCinema(movies) {
  cinemaContainer.innerHTML = '';
  movies.forEach((movie) => {
    const movieElement = createContentCard(movie, 'title');
    cinemaContainer.appendChild(movieElement);
  });
}

// Crear tarjeta de contenido
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
  contentElement.addEventListener('click', () => openModal(content.id, titleKey));
  return contentElement;
}

// Abrir modal
async function openModal(id, type) {
  const endpoint = `${BASE_URL}/${type === 'title' ? 'movie' : 'tv'}/${id}?api_key=${API_KEY}&language=es`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    movieDetails.innerHTML = `
      <h2>${data.title || data.name}</h2>
      <img src="${IMAGE_BASE_URL}${data.poster_path}" alt="${data.title || data.name}">
      <p>${data.overview}</p>
    `;
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Error al obtener los detalles:', error);
  }
}

// Cerrar modal
closeModalButton.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Actualizar botones de paginación
function updatePaginationButtons(page, totalPages) {
  prevPageButton.disabled = page === 1;
  nextPageButton.disabled = page === totalPages;
}

// Manejo de búsqueda
searchButton.addEventListener('click', () => {
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  if (currentQuery) {
    searchContent(currentQuery, currentPage);
  } else {
    fetchContent();
  }
});

// Buscar contenido
async function searchContent(query, page) {
  const endpoint = `${BASE_URL}/search/${currentContent === 'movies' ? 'movie' : 'tv'}?api_key=${API_KEY}&language=es&query=${query}&page=${page}`;
  await fetchAndDisplayContent(endpoint);
}

// Eventos de paginación
prevPageButton.addEventListener('click', () => {
  currentPage--;
  fetchContent();
});

nextPageButton.addEventListener('click', () => {
  currentPage++;
  fetchContent();
});

// Inicializar
fetchContent();
