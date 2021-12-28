import cheerio from "cheerio";
import getData from "./getData.js";

let pageCounter = 1;
async function fillBook(bookPDF, url, connection) {
    pageCounter = 1;
    console.log(url);
    let pageNotFound = false;
    
    try {
        await fill(url, bookPDF,connection);
    } catch (err) {
        console.log(err);
        pageNotFound = true;
    }

    if (pageNotFound) {
        url = parseUrl(url);
        console.log(url);
        try{
            await fill(url, bookPDF,connection);
        }catch(err){
            console.log(err);
        }
    }

}

function parseUrl(url) {
    const splitted = url.split("/");
    //Some urls could be /fullbook/ or /scrolablehtml/
    splitted[3] = "scrolablehtml";
    return splitted.join("/");
};

async function fill(url, bookPDF,connection) {
    
    const maxPage = await getMaxPage(url);
    console.log(`maxPage: ${maxPage}`);
    if (!maxPage) {
        throw new Error("Book couldn't be reached")
    }
    connection.io.sockets.emit("maxPage", maxPage);
    let INITIAL_PAGE = 1;
    let currentPage = INITIAL_PAGE;
    const promises = [];

    while (currentPage <= maxPage) {
        let urlPage = `${url}?page=${currentPage}`;
        // console.log(urlPage);
        const promise = getCheerioHtml(urlPage,connection);
        promises.push(promise);
        currentPage++;
    }
    let resolvedPromises = await Promise.all(promises);

    resolvedPromises = resolvedPromises.filter(($) => Array.from($(".bookfont p")).length > 5);
    if (resolvedPromises.length > 0){
        writePageTitle(bookPDF, INITIAL_PAGE);
        writePageText(resolvedPromises[0], bookPDF);
        resolvedPromises.shift();
        resolvedPromises.forEach(($, i) => {
            bookPDF.addPage();
            writePageTitle(bookPDF, i + 2);
            writePageText($, bookPDF);
            
        });
    }else{
        bookPDF.text(`Book couldn't be reached\n`);
    }
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

async function getCheerioHtml(url,connection) {
 
    const html = await getData(url);
    if (connection){
        connection.io.sockets.emit("progress", pageCounter++);
    }

    // console.log(html);
    const $ = cheerio.load(html);
    return $;
}

async function getMaxPage(url) {
    const $ = await getCheerioHtml(url);
    const maxPage = $('select option:last-child').attr('value');
    return maxPage;
}

export default fillBook;

// (async() => await fillBook(new PDFDocument({ bufferPages: true }),'https://booksvooks.com/fullbook/timekeeper-pdf-tara-sim.html'))();
