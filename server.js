import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server rodando na porta ${PORT}`);

// Armazena todos os jobs em memória
const jobs = [];

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

// Envia a lista completa de jobs para todos os clientes
function broadcastJobs() {
  const payload = JSON.stringify({ type: 'jobs_update', jobs });
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  // Envia os jobs atuais assim que conecta
  ws.send(JSON.stringify({ type: 'jobs_update', jobs }));

  ws.on('message', (msg) => {
    const text = msg.toString();
    const job = parseMessage(text);

    // Adiciona ou atualiza job existente
    const index = jobs.findIndex(j => j.Job === job.Job);
    if (index >= 0) {
      jobs[index] = { ...jobs[index], ...job };
    } else {
      jobs.push(job);
    }

    console.log('Jobs atuais:', jobs);

    // Broadcast para todos os clientes
    broadcastJobs();
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
