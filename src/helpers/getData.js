process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
import axios from "axios-https-proxy-fix";
import options from "./options.js";
import UserAgent from "user-agents";

let getData = async (url, responseType) => {
    const optionsToUse = process.env.NODE_ENV === "production" ? options : {};
    // console.log(optionsToUse);
    const userAgent = new UserAgent({ deviceCategory: "mobile" });
    let UA = userAgent.random().data.userAgent;
    optionsToUse.headers = { "User-Agent": UA };
    optionsToUse.timeout = 10000;
    responseType && (optionsToUse.responseType = responseType);

    let body = "";
    let error = false;
    let errorCount = 0;

    do {
        try {
            const { data } = await axios.get(url, optionsToUse);
            body = data;
            error = false;
        } catch (err) {
            !err.message.includes("timeout") &&
                err.code !== "ECONNABORTED" &&
                (() => {
                    // console.log(optionsToUse);
                    console.log(err.message);
                    // console.log(err.code);
                    // console.log(url);
                })();

            err?.response?.status && console.log(err.response.status);
            // console.log((err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") &&err?.response?.status !== 404 &&err?.response?.status !== 503 &&errorCount < 30)
            error =
                (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") &&
                err?.response?.status !== 404 &&
                err?.response?.status !== 503 &&
                errorCount < 30;
            errorCount++;
        }
    } while (error);

    return body;
};

export default getData;
