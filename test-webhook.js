import http from 'http';

const data = JSON.stringify({
  action: "updated",
  application_id: "4540681882931971",
  data: {"id":"123456"},
  date: "2021-11-01T02:02:02Z",
  entity: "preapproval",
  id: "123456",
  type: "subscription_preapproval",
  version: 8
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhooks/mercadopago',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
