//To use a proxy you must:
//register in brightdata / iproyal and get the proxy credentials
//then add the proxy credentials to the sample.env file
//rename the sample.env to .env

export default {
    proxy: {
        host: process.env.host,
        port: process.env.port,
        auth: {
            username: process.env.username,
            password: process.env.password
        }
    }
}
