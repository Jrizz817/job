import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server rodando na porta ${PORT}`);

// Função para converter mensagem de texto em JSON
function parseMessage(message) {
  const lines = message.split('\n');
  const data = {};
  lines.forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) data[key] = value;
  });
  return data;
}

// Broadcast apenas para clientes conectados no momento
function broadcastMessage(message) {
  const payload = JSON.stringify({ type: 'job_update', job: message });
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (msg) => {
    const job = parseMessage(msg.toString());
    console.log('Mensagem recebida:', job);

    // Envia apenas para clientes conectados agora
    broadcastMessage(job);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
