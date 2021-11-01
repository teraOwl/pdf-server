const PDFDocument = require("pdfkit");

class Connection {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;
        socket.on("message", (value) => this.handleMessage(value));
    }

    sendMessage(message) {
        this.io.sockets.emit("message", message);
    }

    handleMessage(value) {
      console.log(value);
        var myDoc = new PDFDocument({ bufferPages: true });
        let buffers = [];
        myDoc.on("data", buffers.push.bind(buffers));
        myDoc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            this.sendMessage(pdfData);
        });
        //TODO: get pdf data using value (url)
        myDoc.font("Times-Roman").fontSize(12).text(`${value}`);
        myDoc.end();
    }

}

function pdfSocket(io) {
    io.on("connection", (socket) => {
        new Connection(io, socket);
    });
}

module.exports = pdfSocket;
