import getData from "./getData.js";
import cheerio from "cheerio";

async function getTopRatedBooks() {
    const url = `https://booksvooks.com/`;
    const html = await getData(url);
    const $ = cheerio.load(html);
    return $(".top-rated-books:nth-child(2) .row > div")
        .map(function (i, el) {
            return {
                cover: $(this).find("img").attr("src"),
                name: $(this).find(".author-custom").parent().text().replace("\n", ""),
                url: parseUrl($(this).find("a").attr("href")),
            };
        })
        .get();
}

export default getTopRatedBooks;

function parseUrl(url) {
    const splitted = url.split("/");
    splitted.splice(3, 0, "fullbook");
    return splitted.join("/");
}
