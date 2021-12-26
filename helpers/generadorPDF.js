import cheerio from 'cheerio';
import getData from './getData.js';

async function fillBook(bookPDF, url) {
    console.log(url);
    let maxPage = 5;
    try{
        maxPage = await getMaxPage(url);
        console.log(maxPage)
    }catch(err){
    console.log(err)
    }

    let INITIAL_PAGE = 1;
    let currentPage = INITIAL_PAGE;
    
    while (currentPage <= maxPage) {
        let urlPage = `${url}?page=${currentPage}`;
        console.log(urlPage);
        
        const $ = await getCheerioHtml(urlPage);
        
        const lanes = Array.from($('.bookfont p')).length

        if (lanes > 2){
            bookPDF.addPage();
        }
        
        bookPDF.text(`PAGE ${currentPage}\n`, {
            bold: true,
            underline: true
        });
     
        
        $('.bookfont p').each(function (index, value) {
            let lane = $(this).text(); 
            if (lane.length > 0) {
                bookPDF.text(`${lane}\n`);
            }
        });
        currentPage++;
    }
}

async function getCheerioHtml(url) {
    const html = await getData(url);
    console.log(html);
    const $ = cheerio.load(html);
    return $;
}

async function getMaxPage(url) {
    const $ = await getCheerioHtml(url);

    let pageNumbers = [];
    $('select > option').each(function (index, value) {
        pageNumbers.push($(this).attr('value'));
    });
    let validPageNumbers = (pageNumbers.map(e => parseInt(e.replace(/\D/g, ''), 10))).filter(Boolean);
    const maxPage = Math.max(...validPageNumbers);
    return maxPage;
}

export default fillBook;

// (async() => await fillBook(new PDFDocument({ bufferPages: true }),'https://booksvooks.com/fullbook/timekeeper-pdf-tara-sim.html'))();