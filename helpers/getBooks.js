import getData from "./getData.js";
import cheerio from "cheerio";

async function getBooks(search) {
    const $ = await getCheerio(search);
    let books = await getUrlAndName($);
    books = await getCoverAndIsbn(books);
    return books;
}

export default getBooks;

async function getCoverAndIsbn(books) {
    books = await Promise.all(
        books.map(async (book) => {
            const [, bookName, authorBook] = book.name.match(/([^:]*)(?<!by).* by (.*)/i);

            const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName} by ${authorBook}`;
            let { items } = await getData(googleApiUrl);
            book.isbn = getIsbn(items, book);
            if (!book.isbn) {
                console.log(`${googleApiUrl} failed`);
                return;
            }
            book.cover = `https://covers.openlibrary.org/b/isbn/${book.isbn}.jpg`;
            return book;
        })
    );
    return books;
}

function getIsbn(items, book) {
    return items.find(({ volumeInfo: { title, authors = [] } }, i) => {
        if (title.includes("'")) {
            title = title.replaceAll("'", "");
        }
        const [, bookName, authorBook] = book.name.match(/([^:]*)(?<!by).* by (.*)/i);
        let { validAuthor, validTitle } = getValidation(authorBook, authors, bookName, title);
        return validTitle && validAuthor;
    })?.volumeInfo?.industryIdentifiers[0]?.identifier;
}

function getValidation(authorBook, authors, bookName, title) {
    const regexpAuthor = new RegExp(authorBook, "i");
    const validAuthor = authors && authors.some((author) => author.match(regexpAuthor) !== null);
    const validTitle = bookName.toLowerCase().includes(title.toLowerCase());
    return { validAuthor, validTitle };
}

async function getUrlAndName($) {
    return $(".adj a")
        .map(function (i, el) {
            const url = $(this).attr("href");
            const name = $(this).text();
            const splitted = url.split("/");
            splitted.splice(3, 0, "fullbook");
            return { url: splitted.join("/"), name };
        })
        .get();
}
async function getCheerio(search) {
    const urlSearch = `https://booksvooks.com/search.html?q=${search}`;
    const html = await getData(urlSearch);
    const $ = cheerio.load(html);
    return $;
}
