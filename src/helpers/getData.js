process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
import axios from "axios-https-proxy-fix";
import options from "./options.js";
import UserAgent from "user-agents";

let getData = async (url, responseType) => {
    
    const optionsToUse = (process.env.NODE_ENV === "production") ? options : {};

    const userAgent = new UserAgent({ deviceCategory: "mobile" });
    let UA = userAgent.random().data.userAgent;
    optionsToUse.headers = { "User-Agent": UA };
    responseType && (optionsToUse.responseType = responseType);
    
    let body = "";
    let error = false;
    let errorCount = 0;
    if (url.includes("https://www.googleapis.com")){
        console.log(url);
    }
    do {
        try {
            const {data} =  await axios.get(url, optionsToUse);
            body = data;
            error = false;
        } catch (err) {
            console.log(err.message);
            error = ( err?.response?.status !== 404 && err?.response?.status !==  503 && errorCount < 10);
            errorCount++;
        } 
    } while (error);
    
    return body;
};

export default getData;
