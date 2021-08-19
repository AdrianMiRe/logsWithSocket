import LogServer from "./classes/server";
import { SERVER_PORT } from "./global/environments";
import cors from 'cors';
import express from 'express'

const server = LogServer.instance;

server.app.use( express.urlencoded ( { extended: true } ) );
server.app.use( express.json())

// server.app.use( cors() );

server.start( () => {
    console.log(`Servidor corriendo en puerto ${SERVER_PORT}`)
});