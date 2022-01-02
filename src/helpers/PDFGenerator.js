import cheerio from "cheerio";
import getData from "./getData.js";

async function fillBook(bookPDF, url, maxPage, connection) {
    try {
        let cheerioData = await getCheerioData(maxPage, url, connection);
        connection.sendMessage("processing", "Parsing pdf...");
        await fillPdf(cheerioData, bookPDF);
    } catch (err) {
        console.log(err);
        throw new Error("Book couldn't be downloaded");
    }
}

async function getCheerioData(maxPage, url, connection) {
    const promises = getPromisesToScrapeConcurrently(maxPage, url, connection);
    let resolvedPromises = await Promise.all(promises);
    return resolvedPromises;
}

function getPromisesToScrapeConcurrently(maxPage, url, connection) {
    let pageCounter = 1;
    const promises = [];

    for (let currentPage = 1; currentPage <= maxPage; currentPage++) {
        let urlPage = `${url}?page=${currentPage}`;
        promises.push(
            Promise.resolve(getData(urlPage)).then(async (html) => {
                connection && connection.sendMessage("progress", pageCounter++);
                let $ = cheerio.load(html);
                return getPageContent($);
            })
        );
    }
    return promises;
}

async function getPageContent($) {
    const pageContent = [];
    $(".bookfont p,.bookfont img").each(async function (index, value) {
        if ($(this).attr("src")) {
            let imgUrl = $(this).attr("src");
            imgUrl = `https://booksvooks.com/${imgUrl.split("../")[1]}`;
            pageContent.push(imgUrl);
        }

        let line = $(this).text();
        line = line.replace(/  +/g, " ");
        line = line.replace(/[\t]/gm, " ");
        if (line.length > 0) {
            pageContent.push(line);
        }
    });
    return pageContent;
}

async function fillPdf(cheerioData, bookPDF) {
    let count = 1;
    for (const page of cheerioData) {
        let previousText = false;
        writePageTitle(bookPDF, count++);
        for (let line of page) {
            if (line.startsWith("https://booksvooks.com/")) {
                try {
                    await writeImage(line, bookPDF, previousText);
                } catch (err) {
                    console.log(err);
                }
            } else {
               previousText = writeLine(line, bookPDF);
            }
        }
        bookPDF.addPage();
    }
    return count;
}

function writePageTitle(bookPDF, i) {
    bookPDF.text(`PAGE ${i}\n`, {
        bold: true,
        underline: true,
    });
}

function writeLine(line, bookPDF) {
    let previousText = false;
    line = line.replace(/  +/g, " ");
    line = line.replace(/[\t]/gm, " ");
    line = line.trim();
    if (line.length > 2) {
        previousText = true;
        bookPDF.text(`${line}\n`, {
            width: 410,
            align: "justify",
        });
    }
    return previousText;
}

async function writeImage(imageUrl, bookPDF, previousText) {
    let imageParsed = await getData(imageUrl, "arraybuffer");
    var img = bookPDF.openImage(imageParsed);
    let options = {
        fit: [img.width, img.height],
        align: "left",
        valign: "top",
    };

    if (img.width > bookPDF.page.width || img.height > bookPDF.page.height) {
        if (previousText) {
            bookPDF.addPage();
        }
        options.fit = [bookPDF.page.width, bookPDF.page.height - 100];
    }
    bookPDF.image(imageParsed, options);
}

export default fillBook;