import getData from "../helpers/getData.js";
import cheerio from "cheerio";
import {response} from 'express';

async function getTopRatedBooks(req, res = response) {
    try{
        const url = `https://booksvooks.com/`;
        const html = await getData(url);
        const $ = cheerio.load(html);
        const topRatedBooks =  $(".top-rated-books:nth-child(2) .row > div")
            .map(function (i, el) {
                return {
                    bookCover: $(this).find("img").attr("src"),
                    bookName: (() => {
                        const [, bookName, authorBook] = $(this).find(".author-custom").parent().text().match(/([^:]*)(?<!\sby\s).*\s*by\s*(.*)/i);
                        return `${bookName} by ${authorBook}`;
                    })(),
                    bookUrl: parseUrl($(this).find("a").attr("href")),
                };
            })
            .get();
            res.status(200).json(topRatedBooks);
    }catch(err){
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Contact admin'
        })
    }
   
}

function parseUrl(url) {
    const splitted = url.split("/");
    splitted.splice(3, 0, "fullbook");
    return splitted.join("/");
}

export default getTopRatedBooks;

