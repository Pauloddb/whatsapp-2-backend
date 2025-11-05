const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const port = 3000;

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});


const messages = [];

io.on('connection', (socket) => {
    console.log(`Novo cliente conectado: ${socket.id}`);

    socket.on('message', (data) => {
        console.log(`Mensagem recebida do cliente ${socket.id}: ${data.message}`);
        messages.push(data);
        io.emit('message', data);
    });


    socket.on('getMessages', (callback) => {
        callback(messages);
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});



server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});