class Cell {
  constructor(position, color) {
    this.live = true;
    this.position = position;
    this.color = color;
  }  
}

module.exports = Cell;