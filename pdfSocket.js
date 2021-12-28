import PDFDocument from 'pdfkit';
import fillBook  from './helpers/generadorPDF.js';

class Connection {
    constructor(io, socket) {
        this.socket = socket;
        const address = socket.handshake.headers['x-real-ip'] || socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || socket.request.connection.remoteAddress;
        const ip = address.split(':').slice(-1).join('');
        this.io = io;
        
        this.socket.on("message", (value) => this.handleMessage(value));
        this.socket.on('disconnect', function () {
            io.sockets.emit("disconnection", "user disconnected");
            console.log(`disconnected ${new Date().toLocaleString()} ip: ${ip}`);
          });

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
            this.socket.disconnect();
        });
        
        (async () =>{
            fillBook(myDoc,value,this).then(() => myDoc.end());
        })();
    }

}

function pdfSocket(io) {
    io.on("connection", (socket) => {
        
        new Connection(io, socket);
        console.log("connected");
    });
   
}

export default pdfSocket;
