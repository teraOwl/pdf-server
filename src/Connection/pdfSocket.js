import PDFDocument from "pdfkit";
import fillBook from "./helpers/PDFGenerator.js";
import { getMaxPage } from "./helpers/getMaxPage.js";
import { getValidUrl } from "./helpers/getValidUrl.js";
let ipsToday = { day: new Date().getDate() };

const MAX_PAGES_PER_DAY = 500;
class Connection {
    constructor(io, socket, ip) {
        this.socket = socket;
        this.io = io;
        this.ip = ip;

        this.socket.on("message", async (urlAPI) => {
            try {
                const url = await getValidUrl(urlAPI);
                const maxPage = await getMaxPage(url);
                this.io.sockets.emit("maxPage", maxPage);
                await this.createBook(url, maxPage);
            } catch (err) {
                console.log(err)?.message;
                this.io.sockets.emit("error", err.message);
                this.socket.disconnect();
            }
        });
    }

    sendMessage(message) {
        this.io.sockets.emit("message", message);
    }

    async createBook(url, maxPage) {
        var myDoc = new PDFDocument({ bufferPages: true });
        let buffers = [];
        myDoc.on("data", buffers.push.bind(buffers));

        myDoc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            this.sendMessage(pdfData);
            this.incrementIpPages(maxPage);
            this.socket.disconnect();
        });
        try {
            await fillBook(myDoc, url, maxPage, this);
            myDoc.end();
        } catch (err) {
            throw err;
        }
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
    ipsToday = ipsToday.day !== new Date().getDate() ? { day: new Date().getDate() } : ipsToday;

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
