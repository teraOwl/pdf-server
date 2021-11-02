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
    do {
        try {
            let { data } = await axios.get(url, options);
            body = data;
            error = false;
        } catch (err) {
            error = true;
        }
    } while (error);

    return body;
};

// (async () => {
//     for (let i = 0; i < 2; i++) {
//         console.log(await getData("http://lumtest.com/myip.json", options));
//     }
// })();
export default getData;
