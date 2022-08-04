
const RENDER_EVENT = 'render-book';
const bookshelfs = [];
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'Bookshelf_Apps';

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Peramban Tidak Support Local Storage');
    return false;
  }
  return true;
}

  function generateId() {
    return +new Date();
  }

function generateBookshelfObject(id, title, author, year, isCompleted){
  return {
    id, 
    title,
    author,
    year,
    isCompleted
  }
}

// mencari buku berdasarkan judul
function search() {
  let value, book_item, bookTitle, i;

  value = document.getElementById('searchBookTitle').value.toLocaleLowerCase();
  book_item = document.getElementsByClassName('book_item');

  for (i =0; i < book_item.length; i++) {
    bookTitle = book_item[i].getElementsByTagName('h3');
    if(bookTitle[0].innerHTML.toLocaleLowerCase().indexOf(value) > -1){
      book_item[i].style.display = '';
    } else {
      book_item[i].style.display = 'none';
    }
  }
};

function addBookshelf() {
  const inputBookTitle = document.getElementById('inputBookTitle').value;
  const inputBookAuthor = document.getElementById('inputBookAuthor').value;
  const inputBookYear = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generateID = generateId();
  const bookshelfObject = generateBookshelfObject(generateID ,inputBookTitle, inputBookAuthor, inputBookYear, isCompleted);
  bookshelfs.push(bookshelfObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// membuat list buku
function makeBookshelf(bookshelfObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookshelfObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = 'Penulis :' + bookshelfObject.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = 'Tahun Terbit :' + bookshelfObject.year;

  const article = document.createElement('article');
  article.classList.add('book_item');
  article.append(bookTitle, bookAuthor, bookYear);
  article.setAttribute('id',`book-${bookshelfObject.id}`);

  if (bookshelfObject.isCompleted) {
    const undoGreenButton = document.createElement('button');
    undoGreenButton.classList.add('undoGreen');
    // undoGreenButton.innerText = 'Belum Selesai dibaca';

    undoGreenButton.addEventListener('click', function() {
      undoBookshelfFromComplete(bookshelfObject.id);
    });

    const redTrashButton = document.createElement('button');
    redTrashButton.classList.add('redTrash');
    // redTrashButton.innerText = 'Hapus Buku';

    redTrashButton.addEventListener('click', function() {
      removeBookshelfFromList(bookshelfObject.id);
    });

    const buttonActionContainer = document.createElement('div');
    buttonActionContainer.classList.add('action');
    buttonActionContainer.append(undoGreenButton, redTrashButton);

    article.append(buttonActionContainer);
  } else {
    const greenDoneButton = document.createElement('button');
    greenDoneButton.classList.add('greenDone');
    // greenDoneButton.innerText = 'Selesai Dibaca';

    greenDoneButton.addEventListener('click', function() {
      addBookshelfToCompleteList(bookshelfObject.id);
    });

    const redTrashButton = document.createElement('button');
    redTrashButton.classList.add('redTrash');
    // redTrashButton.innerText =  'Hapus Buku';

    redTrashButton.addEventListener('click', function() {
      removeBookshelfFromList(bookshelfObject.id);
    });

    const blueEditButton = document.createElement('button');
    blueEditButton.classList.add('blueEdit');

    // function edit belum jadi
    blueEditButton.addEventListener('click', function() {
      editBookshelfOnList(bookshelfObject.id);
    });

    const buttonActionContainer = document.createElement('div');
    buttonActionContainer.classList.add('action');
    buttonActionContainer.append(greenDoneButton, redTrashButton, blueEditButton);

    article.append(buttonActionContainer);
  }

  return article;
}

// memindahkan buku selesai dibaca
function addBookshelfToCompleteList(bookshelfId) {
  const bookshelfTarget = findBookshelf(bookshelfId);
  const confirmation = confirm('Sudah selesai Dibaca?')
  
  if(confirmation == true) {
    if (bookshelfTarget == null) return;

    bookshelfTarget.isCompleted = true;
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookshelf(bookshelfId) {
  for (const bookshelfItem of bookshelfs) {
    if (bookshelfItem.id === bookshelfId) {
      return bookshelfItem;
    }
  }
  return null;
}

// menghapus buku
function removeBookshelfFromList(bookshelfId) {
  const bookshelfTarget = findBookshelfIndex(bookshelfId);
  const confirmation = confirm('Yakin Buku Dihapus?' );
  if(confirmation == true) {
    if (bookshelfTarget === -1) return;

    bookshelfs.splice(bookshelfTarget, 1);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookshelfIndex(bookshelfId) {
  for (const index in bookshelfs) {
    if (bookshelfs[index].id === bookshelfId) {
      return index;
    }
  }
  return -1;
}

// perpindahan buku ke belum dibaca
function undoBookshelfFromComplete(bookshelfId) {
  const bookshelfTarget  = findBookshelf(bookshelfId);
  const confirmation = confirm('Ingin Membaca Ulanng?');

  if(confirmation == true) {
    if (bookshelfTarget == null) return;

    bookshelfTarget.isCompleted = false;
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelfs);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// mengambil data agar tidak hilang saat reload
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null ) {
    for (const doBook of data) {
      bookshelfs.push(doBook);
    }
  }
//   jangan lupa dengan function dibawah, agar data bisa dirender
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function() {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  incompleteBookshelfList.innerHTML ='';
  completeBookshelfList.innerHTML = '';

  for (const bookshelfItem of bookshelfs) {
    const bookshelfElement = makeBookshelf(bookshelfItem);

    if (bookshelfItem.isCompleted) {
      completeBookshelfList.append(bookshelfElement);
    } else {
      incompleteBookshelfList.append(bookshelfElement);
    }
  }
});

// log update data pada console
document.addEventListener(SAVED_EVENT, function () {
  console.log('Updated Local Storage Success');
});

document.addEventListener('DOMContentLoaded', function() {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function(event) {
    event.preventDefault();
    addBookshelf();
  });

  const searchBookTitle = document.getElementById('searchBook');
  searchBookTitle.addEventListener('submit',function(event){
    event.preventDefault();
    search();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
