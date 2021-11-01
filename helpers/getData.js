process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
import axios from 'axios-https-proxy-fix';
import options from './options.js';
import UserAgent from 'user-agents';

let getData =  async (url) => { 
    const userAgent = new UserAgent({ deviceCategory: 'mobile' })
    let UA = userAgent.random().data.userAgent;
    options.headers = {'User-Agent': UA};
    let {data} = await axios.get(url, options);
    return data;
};


export default getData;
