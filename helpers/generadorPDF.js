import cheerio from "cheerio";
import getData from "./getData.js";


async function fillBook(bookPDF, url, maxPage, connection) {
 
    console.log(url);
    
    try {
        let cheerioData = await getCheerioData(maxPage, url, connection);

        if (cheerioData.length > 0){
            writePDF(bookPDF, cheerioData);
        }else{
            bookPDF.text(`Sorry, for some reason we couldn't get that book, read it online! ${url}\n`);
            throw new Error();
        }
    } catch (err) {
        console.log(err);
        throw new Error("Book couldn't be downloaded");
    }

}

async function getCheerioData(maxPage, url, connection) {
    const promises = getPromisesToScrapeConcurrently(maxPage, url, connection);
    let resolvedPromises = await Promise.all(promises);
    let cheerioData = resolvedPromises.map(cheerio.load);
    cheerioData = cheerioData.filter(($) => Array.from($(".bookfont p")).length > 5);
    return cheerioData;
}

function getPromisesToScrapeConcurrently(maxPage, url, connection) {
    let pageCounter = 1;
    const promises = [];

    for (let currentPage = 1; currentPage <= maxPage; currentPage++) {
        let urlPage = `${url}?page=${currentPage}`;
        promises.push(Promise.resolve(getData(urlPage)).then((html) => {
            connection && connection.io.sockets.emit("progress", pageCounter++);
            return html;
        }));
    }
    return promises;
}

function writePDF(bookPDF, cheerioData) {
    const INITIAL_PAGE = 1;
    writePageTitle(bookPDF, INITIAL_PAGE);
    writePageText(cheerioData[0], bookPDF);
    cheerioData.shift();
    cheerioData.forEach(($, i) => {
        bookPDF.addPage();
        writePageTitle(bookPDF, i + 2);
        writePageText($, bookPDF);
    });
}

function writePageText($, bookPDF) {
    $(".bookfont p").each(function (index, value) {
        let lane = $(this).text();
        if (lane.length > 0) {
            bookPDF.text(`${lane}\n`);
        }
    });
}

function writePageTitle(bookPDF, i) {
    bookPDF.text(`PAGE ${i}\n`, {
        bold: true,
        underline: true,
    });
}

export default fillBook;

// (async() => await fillBook(new PDFDocument({ bufferPages: true }),'https://booksvooks.com/fullbook/timekeeper-pdf-tara-sim.html'))();
