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
        origin: 'https://whatsapp-2-bxkt.onrender.com',
        methods: ['GET', 'POST']
    }
});


let messages = [];
let users = [];

app.get('/getOnlineUsers', (req, res) => {
    res.json({ users: users.length });
});


app.get('/getMessages', (req, res) => {
    res.json({ messages: messages });
});



io.on('connection', (socket) => {
    io.emit('updateOnlineUsers', users.push(socket.id));

    console.log(`Novo cliente conectado: ${socket.id}`);


    socket.on('message', (data) => {
        console.log(`Mensagem recebida do cliente ${socket.id}: ${data.message}`);
        messages.push(data);
        io.emit('message', data);
    });


    socket.on('deleteMessage', (id) => {
        messages = messages.filter(message => message.id !== id);
        io.emit('deleteMessage', id);
    });


    socket.on('disconnect', () => {
        users = users.filter(id => id !== socket.id);
        io.emit('updateOnlineUsers', users.length);

        console.log(`Cliente desconectado: ${socket.id}`);
    });
});



server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

