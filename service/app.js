require('dotenv').config();

const PubSub = require('@google-cloud/pubsub').PubSub;
const pubsub = new PubSub();
const sub_leitura = pubsub.subscription('sub_leitura');
const sub_acao = pubsub.subscription('sub_acao');
let leituras_recebidas=[];
let acoes_recebidas=[];

const messageHandler = message => {
  console.log(`###-Read Received-###`);
  console.log(`Id: ${message.id}:`);
  console.log(`Data: ${message.data}`);
  console.log(`tAttributes: ${message.attributes}`);
  leituras_recebidas.push({id: message.id, message: message.data+""});
	
  // Ack the messae
  message.ack();
};

sub_leitura.on('message', messageHandler);

const messageHandler2 = message => {
  console.log(`###-Action Received-###`);
  console.log(`Id: ${message.id}:`);
  console.log(`Data: ${message.data}`);
  console.log(`tAttributes: ${message.attributes}`);
  acoes_recebidas.push({id: message.id, message: message.data+""});
	
  // Ack the messae
  message.ack();
};

sub_acao.on('message', messageHandler2);

const express = require('express');
const app = express();

app.get('/pull_leitura', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(JSON.stringify(leituras_recebidas));
  leituras_recebidas=[];
});

app.get('/pull_acao', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(JSON.stringify(acoes_recebidas));
  acoes_recebidas=[];
});

app.get('/push_acao', (req, res) => {
  if(req.query.message !== null){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  pubsub.topic('acao').publish(Buffer.from(req.query.message))	
    .then(messageId => {
      console.log(`Message ${messageId} published.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  res.end('1');
  }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
