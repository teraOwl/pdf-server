import getData from "./getData.js";

export async function getValidUrl(url) {
    let html = await getData(url);
    
    if (html.length < 100){
        url = parseUrl(url);
        html = await getData(url);
        if (html.length < 100){
            throw new Error("Book not found"); 
        }
    }

    return url;
}

function parseUrl(url) {
    const splitted = url.split("/");
    //Some urls could be /fullbook/ or /scrolablehtml/
    splitted[3] = "scrolablehtml";
    return splitted.join("/");
};