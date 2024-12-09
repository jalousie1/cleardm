import express from 'express';
import cors from 'cors';
import { DiscordDeleter } from './index.js';

const app = express();
const ports = [3000, 3001, 3002, 3003]; // Lista de portas alternativas

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Endpoints
app.post('/api/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token not provided' });
    }

    const deleter = new DiscordDeleter(token);
    const isValid = await deleter.verifyToken();
    
    res.json({ valid: isValid });
});

app.post('/api/channels', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token not provided' });
    }

    const deleter = new DiscordDeleter(token);
    const channels = await deleter.getDMChannels();
    
    res.json({ channels });
});

app.post('/api/messages', async (req, res) => {
    const { token, channelId } = req.body;
    if (!token || !channelId) {
        return res.status(400).json({ error: 'Token or channelId not provided' });
    }

    const deleter = new DiscordDeleter(token);
    const messages = await deleter.getMessages(channelId);
    
    res.json({ messages });
});

app.post('/api/delete', async (req, res) => {
    const { token, channelId, messageId } = req.body;
    if (!token || !channelId || !messageId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const deleter = new DiscordDeleter(token);
    const success = await deleter.deleteMessage(channelId, messageId);
    
    res.json({ success });
});

// Função para tentar iniciar o servidor em diferentes portas
async function startServer() {
    for (const port of ports) {
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(port)
                    .once('error', err => {
                        if (err.code === 'EADDRINUSE') {
                            console.log(`Port ${port} is busy, trying next port...`);
                            resolve(false);
                        } else {
                            reject(err);
                        }
                    })
                    .once('listening', () => {
                        console.log(`Server running at http://localhost:${port}`);
                        resolve(true);
                    });
            });
            return; // Se o servidor iniciar com sucesso, sai da função
        } catch (err) {
            console.error(`Error starting server on port ${port}:`, err);
        }
    }
    
    // Se chegou aqui, nenhuma porta estava disponível
    console.error('Could not start server. All ports are in use.');
    process.exit(1);
}

// Iniciar o servidor
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
