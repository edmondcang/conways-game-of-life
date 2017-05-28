import Coordinates from './src/Coordinates';

const CREATE_CELL   = 0;
const UPDATE        = 1;
const SYSTEM        = 2;
const INIT          = 3;
const CREATE_MULTI  = 4;

const socket = io();
const canvas = document.getElementById('app');
const color = document.getElementById('color');
const nPlayers = document.getElementById('n-players');
const dispX = document.getElementById('disp-x');
const dispY = document.getElementById('disp-y');

const ctx = canvas.getContext('2d');

const coord = new Coordinates(ctx, dispX, dispY);

const State = {
  color: randColor(),
  cells: {},
};

color.style = 'background:' + rgbListToStr(State.color);

canvas.addEventListener('mousedown', onMouseDown, false);

const navBtns = document.getElementsByClassName('ctl-btn')
for (var i = 0; i < navBtns.length; i++) {
  navBtns[i].addEventListener('mousedown', onNav, false);
}

coord.render();

socket.on(SYSTEM, ({status, players}) => {
  if (status == 'connected') {
    socket.emit(INIT, State.color);
  }
  nPlayers.innerText = players || '';
});

socket.on(CREATE_CELL, data => console.log(data));
socket.on(UPDATE, cells => {
  State.cells = cells;
  drawCells();
});

window.addEventListener('resize', onResize, false);
onResize();

function drawCells() {
  let {cells} = State;
  coord.render(() => {
    for (var pos in cells) {
      let c = cells[pos];
      if (c.live) {
        let {x, y} = c.position;
        coord.draw({x, y}, rgbListToStr(c.color));
      }
    }
  });
}

function onNav(e) {
  switch (e.target.id) {
    case 'ctl-spawn-beehive':
      spawnBeehive();
      break;
    case 'ctl-spawn-blinker':
      spawnBlinker();
      break;
    case 'ctl-spawn-glider':
      spawnGlider();
      break;
  }

  drawCells();
}

function randPosition() {
  let margin = 35;
  let x = Math.floor(Math.random() * margin * 2) -1 * margin;
  let y = Math.floor(Math.random() * margin * 2) -1 * margin;

  return {x, y};
}

function spawnGlider() {
  let positions = [];

  let {x, y} = randPosition();
  addCell(x, y);
  positions.push({x, y});

  x++;
  addCell(x, y);
  positions.push({x, y});

  x++;
  addCell(x, y);
  positions.push({x, y});

  y++;
  addCell(x, y);
  positions.push({x, y});

  y++; x--;
  addCell(x, y);
  positions.push({x, y});

  socket.emit(CREATE_MULTI, positions);
}

function spawnBlinker() {
  let positions = [];

  let {x, y} = randPosition();
  addCell(x, y);
  positions.push({x, y});

  y++;
  addCell(x, y);
  positions.push({x, y});

  y++;
  addCell(x, y);
  positions.push({x, y});

  socket.emit(CREATE_MULTI, positions);
}

function spawnBeehive() {
  let positions = [];

  let {x, y} = randPosition();
  addCell(x, y);
  positions.push({x, y});

  x++; y++;
  addCell(x, y);
  positions.push({x, y});

  x++;
  addCell(x, y);
  positions.push({x, y});

  x++; y--;
  addCell(x, y);
  positions.push({x, y});

  x--; y--;
  addCell(x, y);
  positions.push({x, y});

  x--;
  addCell(x, y);
  positions.push({x, y});

  socket.emit(CREATE_MULTI, positions);
}

function addCell(x, y) {
  State.cells[`${x}:${y}`] = {
    position: {x, y},
    color: State.color,
    live: true,
  };
}

function onMouseDown(e){
  const { clientX, clientY } = e;
  switch (e.button) {
    case 0:
      const { x, y } = coord.convert(clientX, clientY);
      socket.emit(CREATE_CELL, {x, y});
      addCell(x, y);
      drawCells();
      break;
  }
}

// make the canvas fill its parent
function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  coord.render();
}

function randColor () {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return [r,g,b];
}

function rgbListToStr(color) {
  let r = color[0];
  let g = color[1];
  let b = color[2];
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}