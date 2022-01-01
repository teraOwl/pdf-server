import PDFDocument from "pdfkit";
import fillBook from "./helpers/generadorPDF.js";
import { getMaxPage } from "./helpers/getMaxPage.js";
import { getValidUrl } from "./helpers/getValidUrl.js";

let ipsToday = { day: new Date().getDate() };

const MAX_PAGES_PER_DAY = 200;
class Connection {
    constructor(io, socket, ip) {
        this.socket = socket;
        this.io = io;
        this.ip = ip;

        this.socket.on("message", async (value) => {
            try {
                const url = await getValidUrl(value);
                const maxPage = await getMaxPage(url);
                console.log(maxPage);
                this.io.sockets.emit("maxPage", maxPage);
                this.createBook(value, maxPage);
            } catch (err) {
                console.log(err);
                this.io.sockets.emit("error", err.message);
                this.socket.disconnect();
            }
        });
    }

    sendMessage(message) {
        this.io.sockets.emit("message", message);
    }

    createBook(value, maxPage) {
        var myDoc = new PDFDocument({ bufferPages: true });
        let buffers = [];
        myDoc.on("data", buffers.push.bind(buffers));
        myDoc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            this.sendMessage(pdfData);
            this.incrementIpPages(maxPage);
            this.socket.disconnect();
            console.log(this.socket.connected);
        });

        (async () => {
            fillBook(myDoc, value, maxPage, this).then(() => myDoc.end());
        })();
    }

    incrementIpPages(maxPage) {
        ipsToday[this.ip].pages += parseInt(maxPage);
    }
}

function pdfSocket(io) {
    io.on("connection", (socket) => {
        const ip = getIp(socket);
        console.log(ipsToday);
        setupSocket(socket, ip);
        if (isValidSocket(socket, ip)) {
            new Connection(io, socket, ip);
        }
    });
}

function isValidSocket(socket, ip) {
    if (ipsToday[ip].pages > MAX_PAGES_PER_DAY) {
        socket.emit("exceed", "You have reached your limit of pages today, come back tomorrow!");
        socket.disconnect();
    }

    return socket.connected;
}

function setupSocket(socket, ip) {
    ipsToday = ipsToday.day !== new Date().getDate() ? {day: new Date().getDate()} : ipsToday;
    
    socket.on("disconnect", logDisconnectionInfo(ip));

    ipsToday[ip] = ipsToday[ip] ?? { pages: 1 }; 
}

function getIp(socket) {
    const address =
        socket.handshake.headers["x-real-ip"] ||
        socket.handshake.headers["x-forwarded-for"] ||
        socket.handshake.address ||
        socket.request.connection.remoteAddress;
    const ip = address.split(":").slice(-1).join("");
    return ip;
}

function logDisconnectionInfo(ip) {
    return () =>
        console.log(
            `disconnected ${new Date().toLocaleString()} ip: ${JSON.stringify(ipsToday[ip])}`
        );
}

export default pdfSocket;
