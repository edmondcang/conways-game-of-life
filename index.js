const Cell = require('./src/Cell');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

const CREATE_CELL   = 0;
const UPDATE        = 1;
const SYSTEM        = 2;
const INIT          = 3;
const CREATE_MULTI  = 4;

const Cells = {};

const Left = -40;
const Right = Left * -1;
const Top = 40;
const Bottom = Top * -1;

var players = 0;

var willDie = [];
var willLive = [];

var neighbourMap = {};

function onConnection(socket) {

  players++;

  var color;

  socket.emit(SYSTEM, {
    status: 'connected',
    players: players,
  });

  socket.broadcast.emit(SYSTEM, { players: players });

  socket.on(CREATE_CELL, (position) => addCell(position, color));

  socket.on(CREATE_MULTI, (positions) => {
    for (var p of positions) {
      addCell(p, color);
    }
  });

  socket.on(INIT, (data) => {
    color = data;
  });

  socket.on('disconnect', () => {
    players--;
    socket.broadcast.emit(SYSTEM, { players: players });
  });
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

setInterval(() => {
  /** RULES
    * 1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    * 2. Any live cell with two or three live neighbours lives on to the next generation.
    * 3. Any live cell with more than three live neighbours dies, as if by overcrowding.
    * 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    */
  for (var pos in Cells) {
    let c = Cells[pos];
    if (!c.live) continue;

    let {x, y} = c.position;

    if (isOutBound(x, y)) {
      willDie.push(c);
      continue;
    }

    // List of neighbour positions
    let neighbourSpace = makeNeighbourSpace(x, y);

    // Count number of neighbours
    let n = 0;

    for (var p of neighbourSpace) {
      let px = p[0], py = p[1];
      
      if (hasCell(px, py)) {
        n++;
      }
      else {
        let index = `${px}:${py}`;
        let [r, g, b] = c.color;
        if (typeof neighbourMap[index] === typeof undefined) {
          neighbourMap[index] = {
            position: {x: px, y: py},
            color: [r, g, b],
            count: 0,
          };
        }
        let _n = neighbourMap[index];
        _n.count++;
        _n.color[0] = Math.floor((_n.color[0] + r) / 2);
        _n.color[1] = Math.floor((_n.color[1] + g) / 2);
        _n.color[2] = Math.floor((_n.color[2] + b) / 2);
      }
    }

    // Rule #1 & #3
    if (n < 2 || n > 3) {
      willDie.push(c);
    }
    // Rule #4
    else if (n == 3) {
      willLive.push(c);
    }
  }

  for (var position in neighbourMap) {
    let _n = neighbourMap[position];
    if (_n.count == 3) {
      let _c = Cells[position];

      if (!_c) {
        let {x, y} = _n.position;
        _c = addCell({x, y});
      }

      _c.color = _n.color;
    }
  }
  neighbourMap = {};

  for (var c of willDie) {
    let {x, y} = c.position;
    delete Cells[`${x}:${y}`];
  }
  willDie = [];

  io.sockets.emit(UPDATE, Cells);
}, 1000);

function getCell(x, y) {
  return Cells[`${x}:${y}`];
}

function hasCell(x, y) {
  return typeof getCell(x, y) !== typeof undefined;
}

function isOutBound(x, y) {
  return x <= Left || x >= Right || y <= Bottom || y >= Top;
}

function makeNeighbourSpace(x, y) {
  return [
    [x-1,y+1], [x+0,y+1], [x+1,y+1],
    [x-1,y+0],            [x+1,y+0],
    [x-1,y-1], [x+0,y-1], [x+1,y-1],
  ];
}

function addCell (position, color) {
  const { x, y } = position;

  const cell = new Cell(position, color);
  Cells[`${x}:${y}`] = cell;

  return cell;
}