import PDFDocument from 'pdfkit';
import fillBook  from './helpers/generadorPDF.js';

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
        var myDoc = new PDFDocument({ bufferPages: true });
        let buffers = [];
        myDoc.on("data", buffers.push.bind(buffers));
        myDoc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            this.sendMessage(pdfData);
        });
        
        (async () =>{
            fillBook(myDoc,value).then(() => myDoc.end());
        })();
    }

}

function pdfSocket(io) {
    io.on("connection", (socket) => {
        new Connection(io, socket);
    });
}

export default pdfSocket;
