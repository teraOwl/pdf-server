// #!/usr/bin/env node
//@ts-check
/**
 * Module dependencies.
 */
import express from "express";
import cors from "cors";
import bookRoute from '../src/routes/book.js';
import topRatedBooksRoute from '../src/routes/topRatedBooks.js';
import { configureServer, normalizePort } from "../src/Server/Server.js";
import http from "http";

const app = express();

app.use(express.static("public"));
app.use(cors())
app.use(express.json());
app.use('/api/getBooks', bookRoute)
app.use('/api/getTopRatedBooks', topRatedBooksRoute)

const port = normalizePort(process.env.PORT || "3006");
app.set(port);

const server = http.createServer(app);
configureServer(server,port);

