const {nanoid} = require('nanoid');
const books = require('./books');

//Kriteria 3 : API dapat menyimpan buku
const addBookHandler = (request, h) => {
    const cekNameProperty = request.payload.hasOwnProperty('name');
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;
    
    //Client tidak melampirkan properti name pada request body
    if (!cekNameProperty) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      }).code(400);
      return response;
    }
    
    const id = nanoid(16);
    const finished = pageCount === readPage ? true : false;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        id,
        finished,
        insertedAt,
        updatedAt,
    };

    if (pageCount >= readPage) {
        books.push(newBook);
      }

    const isSuccess = books.filter((bk) => bk.id === id).length > 0;

    //Jika buku berhasil dimasukkan
    if (isSuccess) {
        const response = h.response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        }).code(201);
        return response;

    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    } else if (readPage > pageCount) {
        const response = h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
        return response;
    }

    // Server gagal memasukkan buku karena alasan umum
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
      }).code(500);
      return response;
};

//Kriteria 4 : API dapat menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
    const {name, reading, finished} = request.query;

    if (name !== undefined) {
      const BooksName = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
      const response = h.response({
            status: 'success',
            data: {
              books: BooksName.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
              })),
            },
          }).code(200);
      return response;
    
    } else if (reading !== undefined) {
      const BooksReading = books.filter((book) => Number(book.reading) === Number(reading),
      );
      const response = h.response({
            status: 'success',
            data: {
              books: BooksReading.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
              })),
            },
          }).code(200);
      return response;
    
    } else if (finished !== undefined){
      const BooksFinished = books.filter(
          (book) => book.finished == finished,
      );
  
      const response = h.response({
            status: 'success',
            data: {
              books: BooksFinished.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
              })),
            },
          }).code(200);
      return response;
    
    } else {
      const response = h.response( {
        status: 'success',
        data: {
          books: books.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      } ).code(200);
      return response;
    }
  };

const getBookByIdHandler = (request, h) => {
    const { id } = request.params;
      
    const book = books.filter((bk) => bk.id === id)[0];
     
    //Jika buku dengan id yang dilampirkan ditemukan
    if (book !== undefined) {
      const response = h.response({
        status: "success",
        data: {
          book,
        },
      }).code(200);
      return response;
    }

    //Jika buku dengan id yang dilampirkan tidak ditemukan
    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      }).code(404);
      return response;
};

//Kriteria 6 : API dapat mengubah data buku
const editBookByIdHandler = (request, h) => {
    const cekNameProperty = request.payload.hasOwnProperty('name');
    const {readPage, pageCount} = request.payload;
    const cekReadPage = readPage <= pageCount;
    
    //Client tidak melampirkan properti name pada request body
    if (!cekNameProperty) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      }).code(400);
      return response;

    //Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    } else if (!cekReadPage) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
      return response;
    } else if (cekNameProperty && cekReadPage) {
      const {id} = request.params;

      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

    const updatedAt = new Date().toISOString();

    const index = books.findIndex((bk) => bk.id === id);

    if (index !== -1) {
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };

      //Jika buku berhasil diperbarui
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      }).code(200);
      return response;
    }

    //Jika buku gagal diperbarui
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
    return response;
  }
};

//Kriteria 7 : API dapat menghapus buku
const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params;
  
    const index = books.findIndex((bk) => bk.id === id);
  
    if (index !== -1) {
      books.splice(index, 1);
      //Jika id dimiliki oleh salah satu buku
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }).code(200);
      return response;
    }
    
    //Jika id yang dilampirkan tidak dimiliki oleh buku manapun
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
    return response;
  };

  module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};