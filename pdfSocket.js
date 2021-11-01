import PDFDocument from 'pdfkit';
// const PDFDocument = require("pdfkit");
import fillBook  from './helpers/generadorPDF.js';

// const { fillBook } = require('./helpers/generadorPDF');
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
            // let wait = new Promise((resolve,reject)=>{
            //     setTimeout(() => {
            //         resolve();
            //     }, 50000);
            // })
            // wait.then(() => myDoc.end());
            fillBook(myDoc,value).then(() => myDoc.end());
            // await fillBook(myDoc,value);
            // myDoc.end();
            
        })();
    }

}

function pdfSocket(io) {
    io.on("connection", (socket) => {
        new Connection(io, socket);
    });
}

export default pdfSocket;
