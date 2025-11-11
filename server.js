const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');


const UserSchema = require('./models/UserModel');
const MessageSchema = require('./models/MessageModel');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;



app.use(express.json());
app.use(cors());


const mongodb_uri = process.env.MONGODB_URI || '';

mongoose.connect(mongodb_uri)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));







const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});



let onlineUsers = [];



app.get('/ping', (req, res) => {
    console.log('Recebido PING do cliente.');
    res.status(200).send('PONG');
});



app.get('/getMessages', async (req, res) => {
    try {
        const messages = await MessageSchema.find();
        res.json({ messages: messages });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});



app.post('/addUser', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const newUser = {
        username: username,
        password: password
    }


    const existingUser = await UserSchema.findOne({ username: newUser.username, password: newUser.password });

    if (existingUser) {
        res.json({ status: false, message: 'Usuário já cadastrado!' });
    } else {
        try {
            await UserSchema.create(newUser);
            res.json({ status: true, message: 'Usuário cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            res.status(500).json({ status: false, message: 'Erro ao cadastrar usuário' });
        }
    }
});



app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const existingUser = await UserSchema.findOne({ username: username, password: password });

        if (existingUser) {
            res.json({ status: true, message: 'Usuário logado com sucesso!' });
        } else {
            res.json({ status: false, message: 'Usuário não encontrado!' });
        }
    } catch (error) {
        console.error('Erro ao logar usuário:', error);
        res.status(500).json({ status: false, message: 'Erro ao logar usuário' });
    }
});




io.on('connection', (socket) => {
    onlineUsers.push(socket.id);
    io.emit('updateOnlineUsers', onlineUsers.length);

    console.log(`Novo cliente conectado: ${socket.id}`);


    socket.on('message', async (data) => {
        console.log(`Mensagem recebida do cliente ${socket.id}: ${data.message}`);

        try {
            await MessageSchema.create(data);
            io.emit('message', data);
        } catch (error) {
            console.error('Erro ao cadastrar mensagem:', error);
        }
    });


    socket.on('deleteMessage', async (id) => {
        try {
            const result = await MessageSchema.deleteOne({ id: id });

            if (result.deletedCount > 0) {
                io.emit('deleteMessage', id);
            }
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
        }
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
