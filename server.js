const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://whatsapp-2-bxkt.onrender.com',
        methods: ['GET', 'POST']
    }
});


let messages = [];
let onlineUsers = [];
let users = [];


app.get('/getMessages', (req, res) => {
    res.json({ messages: messages });
});


app.post('/addUser', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const newUser = {
        username: username,
        password: password
    }

    console.log(newUser, users)
    if (!users.find(user => user.username === newUser.username && user.password === newUser.password)){
        users.push(newUser);
        res.json({ status: true, message: 'Usuário cadastrado com sucesso!' });
    } else {
        res.json({ status: false, message: 'Usuário já cadastrado!' });
    }
});


app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (users.find(user => user.username === username && user.password === password)){
        res.json({ status: true, message: 'Usuário logado com sucesso!' });
    } else {
        res.json({ status: false, message: 'Usuário não encontrado!' });
    }
});


io.on('connection', (socket) => {
    onlineUsers.push(socket.id);
    console.log(onlineUsers.length);
    io.emit('updateOnlineUsers', onlineUsers.length);

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
        onlineUsers = onlineUsers.filter(id => id !== socket.id);
        io.emit('updateOnlineUsers', onlineUsers.length);

        console.log(`Cliente desconectado: ${socket.id}`);
    });
});



server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

