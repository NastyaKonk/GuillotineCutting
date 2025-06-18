/* import { Sheet } from '../Model/Sheet.js';

export */ var BestFit = {
  cutBlocks: function (blocks, sheetWidth, sheetHeight) {
    blocks.sort((a, b) => b.area - a.area);
    const sheets = [];
    let currentSheet = new Sheet(sheetWidth, sheetHeight);

    for (const block of blocks) {
      let placed = false;
      
      for (const sheet of sheets) {
        if (BestFit.placeBlock(block, sheet)) {
          placed = true;
          break;
        }
      }

      if (!placed) {
        if (!BestFit.placeBlock(block, currentSheet)) {
          block.rotate();
          if (!BestFit.placeBlock(block, currentSheet)) {
            sheets.push(currentSheet);
            currentSheet = new Sheet(sheetWidth, sheetHeight);
            block.rotate();
            BestFit.placeBlock(block, currentSheet);
          }
        }
      }
    }

    sheets.push(currentSheet);
    return sheets;
  },

  placeBlock: function (block, sheet) {
    const fittingPosition = BestFit.findFittingPosition(block, sheet);
    if (fittingPosition) {
      BestFit.splitSheet(sheet, block, fittingPosition);
      return true;
    }
    return false;
  },

  findFittingPosition: function (block, sheet) {
    if (!sheet.availableSpaces) {
      sheet.availableSpaces = [{ x: 0, y: 0, w: sheet.w, h: sheet.h }];
    }

    for (const space of sheet.availableSpaces) {
      if (block.w <= space.w && block.h <= space.h) {
        return space;
      }
      if (block.h <= space.w && block.w <= space.h) {
        block.rotate();
        return space;
      }
    }
    return null;
  },

  splitSheet: function (sheet, block, space) {
    block.x = space.x;
    block.y = space.y;
    sheet.blocks.push(block);

    const newSpaces = [];
    
    if (space.w - block.w > 0) {
      newSpaces.push({ x: space.x + block.w, y: space.y, w: space.w - block.w, h: space.h });
    }
    if (space.h - block.h > 0) {
      newSpaces.push({ x: space.x, y: space.y + block.h, w: block.w, h: space.h - block.h });
    }
    
    sheet.availableSpaces = sheet.availableSpaces.filter(s => s !== space).concat(newSpaces);
  }
};

//module.exports = {  BestFit };
