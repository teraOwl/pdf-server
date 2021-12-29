// #!/usr/bin/env node
/**
 * Module dependencies.
 */
import express from "express";
import cors from "cors";
import pdfSocket from "../pdfSocket.js";
import { Server } from "socket.io";
import http from "http";
import getBooks from "../helpers/getBooks.js";
import getTopRatedBooks from "../helpers/getTopRatedBooks.js";
/**
 * Create express app
 */
var app = express();

app.use(express.static("public"));
app.use(cors());
app.get("/api/getBooks/:search", async ({ params: { search } }, res) => {
    console.log(search);
    let output = "error";
    try {
        output = await getBooks(search);
        // console.log(output);
    } catch (err) {
        console.log(err);
    }
    res.send(output).status(200).end();
});

app.get("/api/getTopRatedBooks/", async ({ params: { search } }, res) => {
    console.log(search);
    let output = "error";
    try {
        output = await getTopRatedBooks();
        console.log(output);
    } catch (err) {
        console.log(err);
    }
    res.send(output).status(200).end();
});

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || "3006");
app.set("port", port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);
var io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
pdfSocket(io);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    // debug("Listening on " + bind);
    console.log("Listening on " + bind);
}
