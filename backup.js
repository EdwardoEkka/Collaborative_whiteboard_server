const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let drawingData = []; 
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('initialDraw', drawingData);

  socket.on('draw', (data) => {
    drawingData.push(data);
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


app.post('/clearData', (req, res) => {
  console.log("Hello")
  drawingData = [];
  io.emit('clearData'); 
  res.status(200).send('Data cleared successfully');
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
