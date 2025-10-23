import { WebSocketServer } from 'ws';
import fetch from 'node-fetch'; // npm install node-fetch@3

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server rodando na porta ${PORT}`);

function parseMessage(message) {
  const lines = message.split('\n');
  const data = {};
  lines.forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) data[key] = value;
  });
  return data;
}

function broadcastMessage(message) {
  const payload = JSON.stringify({ type: 'job_update', job: message });
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}

async function autoRequest() {
  try {
    const response = await fetch('https://web-6rqn.onrender.com/');
    const text = await response.text();
    console.log('Resposta da URL:', text);
  } catch (err) {
    console.error('Erro na requisição automática:', err);
  }
}

// Executa a cada 2 minutos
setInterval(autoRequest, 120000);

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (msg) => {
    const job = parseMessage(msg.toString());
    console.log('Mensagem recebida:', job);
    broadcastMessage(job);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
