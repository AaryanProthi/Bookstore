
const container = document.getElementById("books-container");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

let currentBookIndex = 0;
let books = [];

const fetchBooks = async () => {
  let totalItems = 0;
  let uniqueBooks = new Set();

  while (uniqueBooks.size < 20) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=novels&maxResults=37&startIndex=${totalItems}`
    );
    const data = await response.json();

    const bookItems = data.items || [];

    bookItems.forEach((item) => {
      const volumeInfo = item.volumeInfo;
      const bookId = item.id;
      const bookTitle = volumeInfo.title;
      const pageCount = volumeInfo.pageCount || 128;

      if (
        pageCount < 200 &&
        !volumeInfo.printType.includes("Magazine") &&
        !uniqueBooks.has(bookId)
      ) {
        uniqueBooks.add(bookId);

        const book = {
          title: bookTitle,
          author: volumeInfo.authors ? volumeInfo.authors[0] : "Unknown",
          genre: volumeInfo.categories ? volumeInfo.categories[0] : "Unknown",
          pages: pageCount,
          coverImageUrl: volumeInfo.imageLinks
            ? volumeInfo.imageLinks.thumbnail
            : "noimage.jpg",
          summary: volumeInfo.description || bookTitle,
        };

        books.push(book);
      }
    });

    totalItems += bookItems.length;

    if (totalItems >= data.totalItems) {
      break;
    }
  }

  renderBook();
};

function renderBook() {

  const bookDiv = document.createElement("div");
  bookDiv.className = "book";
  bookDiv.innerHTML = `
    <img src="${books[currentBookIndex].coverImageUrl}" alt="Book Cover">
    <h2 class="book-title">${books[currentBookIndex].title}</h2>
    <p>Author: ${books[currentBookIndex].author}</p>
    <p>Genre: ${books[currentBookIndex].genre}</p>
    <p>Number of Pages: ${books[currentBookIndex].pages}</p>
  `;

  bookDiv.addEventListener("click", showBookDetails);

  container.innerHTML = "";
  container.appendChild(bookDiv);
}

function showBookDetails() {
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const closeModalButton = document.getElementById("close-button");

  const book = books[currentBookIndex];

  modalContent.innerHTML = `
    
    <p>${book.summary.substring(0, 1020)}</p>
  `;

  modal.style.display = "block";

  closeModalButton.addEventListener("click", closeModal);
  window.addEventListener("click", outsideClick);
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function outsideClick(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

function showNextBook() {
  const currentBook = container.querySelector(".book");
  currentBook.style.animation = "slide-out-left 0.5s forwards";

  currentBook.addEventListener("animationend", function () {
    currentBookIndex++;
    if (currentBookIndex >= books.length) {
      currentBookIndex = 0;
    }
    renderBook();
    const newBook = container.querySelector(".book");
    newBook.style.animation = "slide-in-right 0.5s forwards";
  });
}

function showPreviousBook() {
  const currentBook = container.querySelector(".book");
  currentBook.style.animation = "slide-out-right 0.5s forwards";

  currentBook.addEventListener("animationend", function () {
    currentBookIndex--;
    if (currentBookIndex < 0) {
      currentBookIndex = books.length - 1;
    }
    renderBook();
    const newBook = container.querySelector(".book");
    newBook.style.animation = "slide-in-left 0.5s forwards";
  });
}

nextButton.addEventListener("click", showNextBook);
previousButton.addEventListener("click", showPreviousBook);

fetchBooks();
