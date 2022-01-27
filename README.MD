# HOW TO INSTALL
`git clone https://github.com/teraOwl/pdf-server.git`


`git clone https://github.com/teraOwl/pdf-client.git`


`cd ./pdf-client`


`npm install`


`cd ../pdf-server`


`npm install`


`npm run devClient`


Recommended: Rename sample-env file to .env and config it.
## Available Scripts

### Development
`npm run devClient`

Runs the app in the development mode.\
Open [http://localhost:3074](http://localhost:3074) to view it in the browser.

You can also use [http://localhost:3006](http://localhost:3006) to check pre-production. You will need to exec `npm run deploy` first.

### Production (optional)
 `npm run deploy`

Builds the app for production to the `book-server/public` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Heroku deploy (optional)
You will need a heroku app.


You will need to config .env-production in [pdf-client](https://github.com/teraOwl/book-client)

Commit changes if needed.

Run `git push heroku master` to deploy.
