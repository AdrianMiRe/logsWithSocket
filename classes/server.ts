import express from 'express';
import { SERVER_PORT } from '../global/environments';
import { Server } from 'socket.io';
import * as socket from '../sockets/sockets';
import { createServer } from 'http';

export default class LogServer {
    private static _instance: LogServer;

    app: express.Application;
    port: number;

    io: Server;
    server: any;

    private httpServer = createServer();

    private constructor () {
        this.app = express();
        this.port = SERVER_PORT;
        
        this.httpServer = createServer(this.app);
        this.io = new Server( this.httpServer, { cors: { origin: "*" }, transports:['polling','websocket'] } );
        
        this.socketListener();
    }

    public static get instance() {
        return this._instance || ( this._instance = new this() );
    }

    private socketListener() {
        console.log('Escuchando conexiones');
        this.io.on('connection', cliente => {
            console.log(`Cliente conectado..${cliente.id}`);

            socket.saveAction(cliente, this.io);

            socket.disconnect(cliente);
        });
    }

    start ( callback: any ) {
        this.httpServer.listen(this.port, "localhost", callback);
    }
}
