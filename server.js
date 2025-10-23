// server.js
import { WebSocketServer } from 'ws';

// Porta da Render geralmente é process.env.PORT
const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server rodando na porta ${PORT}`);

// Função para converter mensagem do tipo "Gen: $$$\nJob: 123" para JSON
function parseMessage(message) {
  const lines = message.split('\n');
  const data = {};
  lines.forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) data[key] = value;
  });
  return data;
}

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (msg) => {
    const text = msg.toString();
    const parsed = parseMessage(text);
    console.log('Mensagem recebida:', parsed);

    // Opcional: enviar de volta como JSON
    ws.send(JSON.stringify({ status: 'ok', received: parsed }));
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
