//@ts-check
import PDFDocument from "pdfkit";
import fillBook from "../helpers/PDFGenerator.js";
import { getMaxPage } from "../helpers/getMaxPage.js";
import { getValidUrl } from "../helpers/getValidUrl.js";
import { S3Manager } from "../S3Manager/S3Manager.js";

class Connection {
    constructor(socket, ip, ipManager) {
        this.socket = socket;
        this.ip = ip;
        this.id = socket.id;
        this.ipManager = ipManager;
        this.socket.on("message", async (urlBook) => {
            if (!(await S3Manager.successfullySent(urlBook, this))) {
                await this.sendScrapedBook(urlBook);
            }
        });
    }

    async sendScrapedBook(urlBook) {
        try {
            const url = await getValidUrl(urlBook);
            const maxPage = await getMaxPage(url);
            if (maxPage.length < 2) {
                throw new Error("Book not available");
            }
            this.sendMessage("maxPage", maxPage);
            this.createBook(url, maxPage);
        } catch (err) {
            console.log(err?.message);
            this.sendMessage("error", err.message);
            this.socket.disconnect();
        }
    }

    sendMessage(eventId, message) {
        this.socket.emit(eventId, message);
    }

    async createBook(url, maxPage) {
        var myDoc = new PDFDocument({ bufferPages: true });

        let buffers = [];
        myDoc.on("data", buffers.push.bind(buffers));

        myDoc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            this.sendMessage("message", pdfData);
            this.ipManager.incrementIpPages(this.ip, maxPage);
            S3Manager.upload(pdfData, url);
            this.socket.disconnect();
        });

        try {
            fillBook(myDoc, url, maxPage, this).then(() => {
                myDoc.end();
            });
        } catch (err) {
            throw err;
        }
    }
}

export default Connection;
