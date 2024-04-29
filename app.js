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




//Socket
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
  const { roomId } = req.body;

  // Find indexes of objects with the specified roomId
  const indexesToDelete = drawingData.reduce((acc, curr, index) => {
    if (curr.roomId === roomId) {
      acc.push(index);
    }
    return acc;
  }, []);

  // Remove objects with specified roomId from drawingData
  indexesToDelete.reverse().forEach(index => {
    drawingData.splice(index, 1);
  });

  // Emit event to notify clients
  io.emit('clearData');

  console.log(`Drawing data for roomId ${roomId} cleared successfully`);
  
  res.status(200).send(`Data for roomId ${roomId} cleared successfully`);
});

app.post('/clearallData', (req, res) => {
  console.log("Hello")
  drawingData = [];
  io.emit('clearData'); 
  res.status(200).send('Data cleared successfully');
});

//
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
