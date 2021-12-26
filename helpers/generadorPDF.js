import cheerio from "cheerio";
import getData from "./getData.js";

async function fillBook(bookPDF, url) {
    console.log(url);
    let maxPage = 5;
    try {
        maxPage = await getMaxPage(url);
        console.log(maxPage);
    } catch (err) {
        console.log(err);
    }

    let INITIAL_PAGE = 1;
    let currentPage = INITIAL_PAGE;
    const promises = [];

    while (currentPage <= maxPage) {
        let urlPage = `${url}?page=${currentPage}`;
        console.log(urlPage);

        promises.push(getCheerioHtml(urlPage));
        currentPage++;
    }
    let resolvedPromises = await Promise.all(promises);
    
    resolvedPromises = resolvedPromises.filter(($) => Array.from($(".bookfont p")).length > 5);
    
    writePageTitle(bookPDF, INITIAL_PAGE);
    writePageText(resolvedPromises[0], bookPDF);
    resolvedPromises.shift();
    resolvedPromises.forEach(($, i) => {
        bookPDF.addPage();
        writePageTitle(bookPDF, i+2);
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

async function getCheerioHtml(url) {
    const html = await getData(url);
    // console.log(html);
    const $ = cheerio.load(html);
    return $;
}

async function getMaxPage(url) {
    const $ = await getCheerioHtml(url);

    let pageNumbers = [];
    $("select > option").each(function (index, value) {
        pageNumbers.push($(this).attr("value"));
    });
    let validPageNumbers = pageNumbers
        .map((e) => parseInt(e.replace(/\D/g, ""), 10))
        .filter(Boolean);
    const maxPage = Math.max(...validPageNumbers);
    return maxPage;
}

export default fillBook;

// (async() => await fillBook(new PDFDocument({ bufferPages: true }),'https://booksvooks.com/fullbook/timekeeper-pdf-tara-sim.html'))();

