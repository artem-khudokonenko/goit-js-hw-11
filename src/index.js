import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const el = {
  formEl: document.querySelector('.search-form'),
  divGaleri: document.querySelector('.gallery'),
  btnLoadmore: document.querySelector('.load-more'),
};
let gallery = new SimpleLightbox('.gallery a');
gallery.on('show.simplelightbox', function () {
  // do something…
});
let pageLoad = 1;
async function getRequest(search, page) {
  const PARAMS = new URLSearchParams({
    key: '38335625-92e156940938af54f0acf44e6',
    q: `${search}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });
  const response = await axios.get(`${BASE_URL}?${PARAMS}`);

  return response;
}
function getMarkap(arr) {
  const marcap = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
  <div class="photo-card">
      <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
          <p class="info-item">
          <b>Likes</b>: ${likes}
          </p>
          <p class="info-item">
            <b>Views</b>: ${views}
          </p>
          <p class="info-item">
            <b>Comments</b>: ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>: ${downloads}
          </p>
        </div>
      </a>
    </div>
  `
    )
    .join('');
  return marcap;
}
let search;
el.btnLoadmore.hidden = true;
el.formEl.addEventListener('submit', inputSearch);
async function inputSearch(e) {
  e.preventDefault();
  const { searchQuery } = e.currentTarget.elements;
  search = searchQuery.value;
  el.divGaleri.innerHTML = '';
  if (el.divGaleri) {
    el.btnLoadmore.hidden = true;
  }
  pageLoad = 1;
  try {
    const getFetch = await getRequest(search, pageLoad);
    const fetchHits = getFetch.data.hits;
    const result = getMarkap(fetchHits);
    el.divGaleri.insertAdjacentHTML('beforeend', result);
    gallery.refresh();
    el.btnLoadmore.hidden = false;

    if (getFetch.data.total === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      el.btnLoadmore.hidden = true;
    } else if (
      getFetch.data.hits.length * pageLoad >=
      getFetch.data.totalHits
    ) {
      el.btnLoadmore.hidden = true;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      Notiflix.Notify.success(
        `Hooray! We found ${getFetch.data.totalHits} images.`
      );
    }
    return;
  } catch (error) {
    console.log(error);
  }
}

el.btnLoadmore.addEventListener('click', loadMore);
async function loadMore(e) {
  e.preventDefault();
  pageLoad += 1;

  const getFetch = await getRequest(search, pageLoad);
  if (getFetch.data.hits.length * pageLoad >= getFetch.data.totalHits) {
    el.btnLoadmore.hidden = true;
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  const fetchHits = getFetch.data.hits;
  const result = getMarkap(fetchHits);
  el.divGaleri.insertAdjacentHTML('beforeend', result);
  gallery.refresh();
  return;
}
