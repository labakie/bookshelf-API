const { nanoid } = require('nanoid');
const bookshelf = require('./bookshelf');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = (readPage === pageCount);

  const newBook = {
    // eslint-disable-next-line max-len
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  bookshelf.push(newBook);

  const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Catatan gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  const readingBook = (reading === '1');
  const finishedBook = (finished === '1');

  if (name) {
    const allBooksUsingQuery = bookshelf.filter(
      (book) => book.name.toLowerCase().includes(name.toLowerCase()),
    );
    const response = h.response({
      status: 'success',
      data: {
        books: allBooksUsingQuery.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  if (reading) {
    if (readingBook) {
      const allBooksReading = bookshelf.filter(
        (book) => book.reading === true,
      );
      const response = h.response({
        status: 'success',
        data: {
          books: allBooksReading.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }

    if (readingBook === false) {
      const allBooksReading = bookshelf.filter(
        (book) => book.reading === false,
      );
      const response = h.response({
        status: 'success',
        data: {
          books: allBooksReading.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }
  }

  if (finished) {
    if (finishedBook) {
      const allBooksFinished = bookshelf.filter(
        (book) => book.finished === true,
      );
      const response = h.response({
        status: 'success',
        data: {
          books: allBooksFinished.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }

    if (finishedBook === false) {
      const allBooksFinished = bookshelf.filter(
        (book) => book.finished === false,
      );
      const response = h.response({
        status: 'success',
        data: {
          books: allBooksFinished.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      });
      response.code(200);
      return response;
    }
  }

  const allBooks = bookshelf.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: allBooks,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = bookshelf.filter((n) => n.id === bookId)[0];

  if (book === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  const response = h.response({
    status: 'success',
    data: {
      book,
    },
  });
  response.code(200);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();
  const index = bookshelf.findIndex((book) => book.id === bookId);

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  if (index !== -1) {
    bookshelf[index] = {
      // eslint-disable-next-line max-len
      ...bookshelf[index], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt,
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = bookshelf.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    bookshelf.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
