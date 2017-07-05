let ws = require('ws');

const searchDB = require('./searchDB');

module.exports = function (server) {
  let wss = new ws.Server({ server: server });

  wss.on('connection', function (ws) {
    ws.on('message', function (message) {
      // Parse message
      let request;
      try {
        request = JSON.parse(message);
      } catch (e) {
        ws.send(JSON.stringify({ error: 'Error parsing message' }));
        return;
      }

      // Send data
      searchDB(request.query, request.offset)
        .then(results => ws.send(JSON.stringify({
          seqNum: request.seqNum,
          data: results
        })))
        .catch(err => {
          ws.send(JSON.stringify({
            seqNum: request.seqNum,
            data: [],
            error: new Error('Error searching DB.')
          }));
          console.error(err);
        });
    });
  });
};
