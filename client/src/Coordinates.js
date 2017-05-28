const BG_COLOR = '#000';
const LINE_COLOR = '#444';
const LINE_WIDTH = .5;
const UNIT_SIZE = 10;
const BORDER_COLOR = 'red';
const BORDER_WIDTH = 1;

export default class Coordinates {
  constructor(ctx, dispX, dispY) {
    this.ctx = ctx;
    this.w = ctx.canvas.clientWidth;
    this.h = ctx.canvas.clientHeight;
    this.dispX = dispX;
    this.dispY = dispY;

    ctx.canvas.addEventListener('mousemove', e => {
      const {x, y} = this.convert(e.clientX, e.clientY);
      dispX.innerText = x;
      dispY.innerText = y;
    });
  }

  convert(x, y) {
    const { w, h } = this;

    x = w/2 - x;
    y = h/2 - y;

    x *= -1;

    x = Math.floor(x / UNIT_SIZE);
    y = Math.floor(y / UNIT_SIZE);

    return {x, y};
  }

  revert(x, y) {
    const { w, h } = this;

    x *= UNIT_SIZE;
    y *= UNIT_SIZE;

    x = w/2 + x;
    y = h/2 - y;

    y -= UNIT_SIZE;

    return {x, y};
  }

  updateSize() {
    const { ctx } = this;
    this.w = ctx.canvas.clientWidth;
    this.h = ctx.canvas.clientHeight;
  }

  draw(position, color) {
    const { ctx } = this;

    let { x, y } = this.revert(position.x, position.y);

    ctx.save();

    ctx.fillStyle = color;

    ctx.fillRect(x, y, UNIT_SIZE, UNIT_SIZE - LINE_WIDTH);

    ctx.restore();
  }

  render(cb) {
    this.updateSize();

    const { ctx, w, h } = this;

    ctx.save();
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0,w,h);

    // Draw border
    let border = this.revert(-40, 40);
    ctx.save();
    ctx.strokeStyle = BORDER_COLOR;
    ctx.LINE_WIDTH = BORDER_WIDTH;
    ctx.beginPath();

    ctx.strokeRect(border.x, border.y, 80 * UNIT_SIZE, 80 * UNIT_SIZE);

    ctx.stroke();
    ctx.restore();

    // Draw centre mark
    ctx.save();
    ctx.fillStyle = '#111';
    
    let x = w/2;
    let y = h/2;

    ctx.fillRect(x - UNIT_SIZE, y - UNIT_SIZE, UNIT_SIZE * 2, UNIT_SIZE * 2);

    ctx.save();
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.beginPath();

    // Draw columns
    for (var i = x; i > 0; i -= UNIT_SIZE) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
    }
    for (var i = x + UNIT_SIZE; i < w; i += UNIT_SIZE) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
    }

    // Draw rows
    for (var i = y; i > 0; i -= UNIT_SIZE) {
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
    }
    for (var i = y + UNIT_SIZE; i < h; i += UNIT_SIZE) {
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
    }

    ctx.stroke();
    ctx.restore();

    cb && cb();
  }
}

