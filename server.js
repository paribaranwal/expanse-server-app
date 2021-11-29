const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { response } = require('express');

const app = express();

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/status', (request, response) => response.json({clients: clients.length}));

const PORT = 4000;

let clients = [];
let myExpanses = {
    'entertainment': {
        label: 'Entertainment',
        value: 1300,
        limit: 1000
    },
    'pharmacy': {
        label: 'Pharmacy',
        value: 300,
        limit: 500
    },
    'groceries': {
        label: 'Groceries',
        value: 900,
        limit: 1200
    },
    'fashion': {
        label: 'Fashion',
        value: 500,
        limit: 1000
    }
};

function eventsHandler(request, response, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      "access-control-allow-origin": "*"
    };
    response.writeHead(200, headers);
  
    const data = `data: ${JSON.stringify(myExpanses)}\n\n`;
  
    response.write(data);
  
    const clientId = Date.now();
  
    const newClient = {
      id: clientId,
      response
    };
  
    clients.push(newClient);
  
    request.on('close', () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter(client => client.id !== clientId);
    });
};
  
app.get('/expanses', eventsHandler);
function sendEventsToAll(newFact) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`))
}
app.post('/add-expanse', (req, res) => {
    const newExpanse = req.body;
    const category = Object.keys(myExpanses).find((e) => e === newExpanse.category);
    if (category) {
        myExpanses[category].value = parseFloat(parseFloat(myExpanses[category].value, 10) + parseFloat(newExpanse.amount, 10));
    }
    res.json(newExpanse);
    return sendEventsToAll(myExpanses);
});
app.listen(PORT, () => {
  console.log(`Expanse Events service listening at http://localhost:${PORT}`)
})