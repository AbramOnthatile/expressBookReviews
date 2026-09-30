const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = () => Promise.resolve(books);


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "User already exists." });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res, next) {
  getBooks()
    .then((bookList) => res.type("json").send(JSON.stringify(bookList, null, 2)))
    .catch(next);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res, next) {
  getBooks()
    .then((bookList) => {
      const book = bookList[req.params.isbn];
      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }
      return res.json(book);
    })
    .catch(next);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res, next) {
  getBooks()
    .then((bookList) => Object.keys(bookList)
      .map((isbn) => bookList[isbn])
      .filter((book) => book.author === req.params.author))
    .then((matchingBooks) => res.json(matchingBooks))
    .catch(next);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res, next) {
  getBooks()
    .then((bookList) => Object.keys(bookList)
      .map((isbn) => bookList[isbn])
      .filter((book) => book.title === req.params.title))
    .then((matchingBooks) => res.json(matchingBooks))
    .catch(next);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  return res.json(book.reviews);
});

module.exports.general = public_users;
