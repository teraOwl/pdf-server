//To use a proxy you must:
//register in brightdata / iproyal and get the proxy credentials
//then add the proxy credentials to the sample.env file
//rename the sample.env to .env
import dontenv from 'dotenv';
dontenv.config();
export default {
    proxy: {
        host: process.env.hostProxy,
        port: process.env.portProxy,
        auth: {
            username: process.env.usernameProxy,
            password: process.env.passwordProxy
        }
    }
}
