import cheerio from "cheerio";
import getData from "./getData.js";

export async function getMaxPage(url) {
    const $ = await getCheerioHtml(url);
    const maxPage = $('#demo select option:last-child').attr('value');
    return maxPage;
}

async function getCheerioHtml(url) {
    const html = await getData(url);
    const $ = cheerio.load(html);
    return $;
}