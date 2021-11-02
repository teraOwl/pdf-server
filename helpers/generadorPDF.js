import cheerio from 'cheerio';
import PDFDocument from 'pdfkit';
import getData from './getData.js';

// const generarLibroPDF = (async (doc, url) => {
//     await writeBook(doc, url);
// })

// async function writeBook(url,res) {
//     console.log(res)
//     let bookStream = configureStream(res);
//     await fillBook(bookStream, url);
//     bookStream.end();
// }

// function configureStream(res) {
//     let bookPDF = new PDFDocument({ bufferPages: true });

//     let buffers = [];
//     bookPDF.on('data', buffers.push.bind(buffers));
//     bookPDF.on('end', () => {

//         let pdfData = Buffer.concat(buffers);
//         res.writeHead(200, {
//             'Content-Length': Buffer.byteLength(pdfData),
//             'Content-Type': 'application/pdf',
//             'Content-disposition': 'attachment;filename=test.pdf',
//         })
//             .end(pdfData);

//     });
//     return bookPDF;
// }

async function fillBook(bookPDF, url) {
    console.log('hola?')
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

        if (currentPage === INITIAL_PAGE) {
        //    let urlArr = url.split('fullbook/');
            // let urlAux = urlArr[0].concat(urlArr[1]);
            // bookPDF.font("Times-Roman").fontSize(25).text($(`a[href="${urlAux}"]`).text().concat('\n\n'),{
            //     bold: true
            // });
            // bookPDF.font("fonts/Roboto-Regular.ttf").fontSize(14);
        }else if (lanes > 2){
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
    // const get = bent('GET','string')
    // let html = await get(url)
    
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