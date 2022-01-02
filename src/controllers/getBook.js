import getData from "../helpers/getData.js";
import cheerio from "cheerio";
import {response} from 'express';

async function getBook(req, res = response) {
    const { params: { bookNameQuery } } = req;
    try{
        const $ = await getCheerio(bookNameQuery);
        let books = await getUrlAndName($);
        
        if (books.length > 0) {
            books = await getCover(books);
            books = books.map((book) => ({ ...book, bookUrl: parseUrl(book.bookUrl) }));
        }
        res.status(200).json(books);
    }catch(err){
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Contact admin'
        })
    }
}

async function getCheerio(bookNameQuery) {
    const urlSearch = `https://booksvooks.com/search.html?q=${bookNameQuery}`;
    const html = await getData(urlSearch);
    const $ = cheerio.load(html);
    return $;
}

async function getUrlAndName($) {
    return $(".adj a")
        .map(function (i, el) {
            const bookUrl = $(this).attr("href").replace("'", "");
            const bookName = $(this).text();
            return { bookUrl, bookName };
        })
        .get();
}

async function getCover(books) {
    const promisesToScrapeConcurrently = books.map(({ bookUrl }) => getData(bookUrl));
    const booksRawHtml = await Promise.all(promisesToScrapeConcurrently);
    booksRawHtml.forEach((bookRawData, i) => {
        const $ = cheerio.load(bookRawData);
        books[i].bookCover = $('[property="og:image"]').attr("content");
    });

    //Warning: notValidCovers will reference to books array! Consider using structuredClone.
    let notValidCovers = books.filter((book) => book.bookCover.startsWith("/assets/"));
    await resolveNotValidCovers(notValidCovers);

    return books;
}

async function resolveNotValidCovers(notValidCovers) {
    notValidCovers = await Promise.all(
        notValidCovers.map(async (book) => {
            const [, bookName, authorBook] = book.bookName.match(/([^:]*)(?<!\sby\s).*\s*by\s*(.*)/i);

            const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName} by ${authorBook}&langRestrict=en`;
            let { items } = await getData(googleApiUrl);
            book.bookCover = getGoogleCover(items, book);
        })
    );
}

function getGoogleCover(items, book) {
    const authorFound = items.find(({ volumeInfo: { title, authors = [] } }, i) => {
        if (title.includes("'")) {
            title = title.replaceAll("'", "");
        }
        const [, bookName, authorBook] = book.bookName.match(/([^:]*)(?<!by).*\s*by\s*(.*)/i);
        let { validAuthor, validTitle } = getValidation(authorBook, authors, bookName, title);
        return validTitle && validAuthor;
    });
    return authorFound && authorFound?.volumeInfo?.imageLinks?.thumbnail.split('&zoom')[0];
}

function getValidation(authorBook, authors, bookName, title) {
    const normalizeAuthor = (author) => author.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const regexpAuthor = new RegExp(authorBook, "i");
    const validAuthor =
        authors && authors.some((author) => normalizeAuthor(author).match(regexpAuthor) !== null);
    const validTitle = bookName.toLowerCase().includes(title.toLowerCase());
    return { validAuthor, validTitle };
}

function parseUrl(url) {
    const splitted = url.split("/");
    splitted.splice(3, 0, "fullbook");
    return splitted.join("/");
}
 
export default getBook;





