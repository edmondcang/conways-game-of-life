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
      spawn('beehive');
      break;
    case 'ctl-spawn-blinker':
      spawn('blinker');
      break;
    case 'ctl-spawn-beacon':
      spawn('beacon');
      break;
    case 'ctl-spawn-glider':
      spawn('glider');
      break;
    case 'ctl-spawn-spaceship':
      spawn('spaceship');
      break;
  }

  drawCells();
}

function makePattern(x, y) {
  return {
    'beehive': [
      [x,y], [x+1,y+1], [x+2,y+1], [x+3,y],
      [x+1,y-1], [x+2,y-1],
    ],
    'blinker': [
      [x,y], [x+1,y], [x+2,y],
    ],
    'beacon': [
      [x,y], [x+1,y],
      [x,y+1], [x+1,y+1],
      [x+2,y+2], [x+3,y+2],
      [x+2,y+3], [x+3,y+3],
    ],
    'glider': [
            [x+1,y+2],
                    [x+2,y+1],
      [x, y],[x+1,y],[x+2,y],
    ],
    'spaceship': [
                [x,y],[x+1,y],[x+2,y],[x+3,y],
      [x-1,y-1],                      [x+3,y-1],
                                      [x+3,y-2],
      [x-1,y-3],                      [x+2,y-3],
    ],
  };
}

function randPosition() {
  let margin = 35;
  let x = Math.floor(Math.random() * margin * 2) -1 * margin;
  let y = Math.floor(Math.random() * margin * 2) -1 * margin;

  return {x, y};
}

function sequence(list) {
  let positions = [];
  for (var p of list) {
    addCell(p[0], p[1]);
    positions.push({x: p[0], y: p[1]});
  }
  socket.emit(CREATE_MULTI, positions);
}

function spawn(name) {
  let {x, y} = randPosition();
  let patterns = makePattern(x, y);
  sequence(patterns[name]);
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