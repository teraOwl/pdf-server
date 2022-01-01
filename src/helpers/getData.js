process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
import axios from "axios-https-proxy-fix";
import options from "./options.js";
import UserAgent from "user-agents";

let getData = async (url) => {
    const userAgent = new UserAgent({ deviceCategory: "mobile" });
    let UA = userAgent.random().data.userAgent;
    options.headers = { "User-Agent": UA };
    let body = "";
    let error = false;
    let errorCount = 0;
    do {
        try {
            const {data} = process.env.NODE_ENV === "development" ? await axios.get(url)  :  await axios.get(url, options);
            body = data;
            error = false;
        } catch (err) {
            error = ( err?.response?.status !== 404 && err?.response?.status !==  503 && errorCount < 100);
            errorCount++;
        } 
    } while (error);
    // console.log(body);
    return body;
};

export default getData;
