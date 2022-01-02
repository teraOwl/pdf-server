//@ts-check
import Connection from '../Connection/Connection.js';
// import S3 from 'aws-sdk/clients/s3';

// let day = 2;
class SocketManager {
    constructor(socket, ipManager) {
        this.ipManager = ipManager;
        const ip = this.getIp(socket);
        console.log(this.ipManager);
        this.setupSocket(socket, ip);
        if (this.isValidSocket(socket, ip)) {
            new Connection(socket, ip, this.ipManager);
        }
    }

    isValidSocket(socket, ip) {
        if (this.ipManager.validQuota(ip)) {
            socket.emit(
                "exceed",
                "You have reached your limit of pages today, come back tomorrow!"
            );
            socket.disconnect();
        }

        return socket.connected;
    }

    setupSocket(socket, ip) {
        this.ipManager.renewDay();
        this.ipManager.add(ip);
        socket.on("disconnect", this.logDisconnectionInfo(ip));
    }

    getIp(socket) {
        const address =
            socket.handshake.headers["x-real-ip"] ||
            socket.handshake.headers["x-forwarded-for"] ||
            socket.handshake.address ||
            socket.request.connection.remoteAddress;
        const ip = address.split(":").slice(-1).join("");
        return ip;
    }

    logDisconnectionInfo(ip) {
        return () =>
            console.log(
                `disconnected ${new Date().toLocaleString()} ip: ${JSON.stringify(this.ipManager.getIpData(ip))}`
            );
    }
}

export default SocketManager;