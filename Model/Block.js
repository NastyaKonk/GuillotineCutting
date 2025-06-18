class Block {
  constructor(w, h, num) {
    this.w = w; // Width of the block
    this.h = h; // Height of the block
    //this.isPlaced = false; // Indicates if the block is placed on a sheet
    this.x = 0; // X-coordinate of the block's position on the sheet
    this.y = 0; // Y-coordinate of the block's position on the sheet
    this.num = num; // A unique identifier for the block
    this.area = w * h; // Area of the block
    this.rotation = 0; // 0 - horizontal, 1 - vertical (current rotation state)
  }

  // Method to rotate the block
  rotate() {
    [this.w, this.h] = [this.h, this.w]; // Swap the width and height values
    this.rotation = this.rotation === 0 ? 1 : 0; // Toggle the rotation state between horizontal and vertical
  }
}
