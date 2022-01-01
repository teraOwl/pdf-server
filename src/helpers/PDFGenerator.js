import cheerio from "cheerio";
import getData from "./getData.js";

async function fillBook(bookPDF, url, maxPage, connection) {

    try {
        let cheerioData = await getCheerioData(maxPage, url, connection);

        if (cheerioData.length > 0) {
            await writePDF(bookPDF, cheerioData, connection);
        } else {
            bookPDF.text(
                `Sorry, for some reason we couldn't get that book, read it online! ${url}\n`
            );
            throw new Error("err");
        }
    } catch (err) {
        throw new Error("Book couldn't be downloaded");
    }
}

async function getCheerioData(maxPage, url, connection) {
    const promises = getPromisesToScrapeConcurrently(maxPage, url, connection);
    let resolvedPromises = await Promise.all(promises);
    let cheerioData = resolvedPromises.map(cheerio.load);
    return cheerioData;
}

function getPromisesToScrapeConcurrently(maxPage, url, connection) {
    let pageCounter = 1;
    const promises = [];

    for (let currentPage = 1; currentPage <= maxPage; currentPage++) {
        let urlPage = `${url}?page=${currentPage}`;
        promises.push(
            Promise.resolve(getData(urlPage)).then((html) => {
                connection && connection.io.sockets.emit("progress", pageCounter++);
                return html;
            })
        );
    }
    return promises;
}

async function writePDF(bookPDF, cheerioData, connection) {
    const INITIAL_PAGE = 1;
    if (cheerioData.some($ =>  $(".bookfont img").length > 0)) {
        connection && connection.io.sockets.emit("fetchingImages", "Downloading images...");
    }
    bookPDF.font("./fonts/Roboto-Regular.ttf");
    writePageTitle(bookPDF, INITIAL_PAGE);
    await writePageContent(cheerioData[0], bookPDF);
    cheerioData.shift();
    let i = 0;
    for (let $ of cheerioData) {
        bookPDF.addPage();
        writePageTitle(bookPDF, i + 2);
        await writePageContent($, bookPDF);
        i++;
    }
}

async function writePageContent($, bookPDF) {
    const promisesToResolve = [];
    
    $(".bookfont p,.bookfont img").each(async function (index, value) {
        if ($(this).attr("src")) {
            let imgUrl = $(this).attr("src");
            imgUrl = `https://booksvooks.com/${imgUrl.split("../")[1]}`;
            promisesToResolve.push(
                new Promise((resolve, reject) => {
                    getData(imgUrl, "arraybuffer").then((data) => {
                        bookPDF.image(data,{
                            fit: [400, 400],
                            align: 'center',
                            valign: 'center'
                        });
                        resolve(true);
                    });
                })
            );
        }
        promisesToResolve.push(
            new Promise((resolve, reject) => {
                let lane = $(this).text();
                lane = lane.replace(/  +/g, " ");
                lane = lane.replace(/[\t]/gm, " ");
                if (lane.length > 0) {
                    bookPDF.text(`${lane}\n`, {
                        width: 410,
                        align: "justify",
                    });
                }
                resolve(true);
            })
        );
    });
    for (let promise of promisesToResolve) {
        await promise;
    }
}

function writePageTitle(bookPDF, i) {
    bookPDF.text(`PAGE ${i}\n`, {
        bold: true,
        underline: true,
    });
}

export default fillBook;

// (async() => await fillBook(new PDFDocument({ bufferPages: true }),'https://booksvooks.com/fullbook/timekeeper-pdf-tara-sim.html'))();
