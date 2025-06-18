function areRectanglesIntersecting(rect1, rect2) {
    let rect1Width = rect1.orientation === "vertical" ? rect1.w : rect1.h;
    let rect1Height = rect1.orientation === "vertical" ? rect1.h : rect1.w;
    let rect2Width = rect2.orientation === "vertical" ? rect2.w : rect2.h;
    let rect2Height = rect2.orientation === "vertical" ? rect2.h : rect2.w;
    if (
        rect1.x + rect1Width <= rect2.x ||
        rect2.x + rect2Width <= rect1.x ||
        rect1.y + rect1Height <= rect2.y ||
        rect2.y + rect2Height <= rect1.y
    ) {
        return false;
    }
    return true;
}

// Check if the placement of blocks on the sheet is guillotine
function isGuillotine(blocks, sheetWidth, sheetHeight) {
    let areas = [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }];
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        let w = block.orientation === "vertical" ? block.w : block.h;
        let h = block.orientation === "vertical" ? block.h : block.w;
        let bx = block.x, by = block.y;
        let found = false;
        for (let j = 0; j < areas.length; j++) {
            let area = areas[j];
            if (
                bx === area.x && by === area.y &&
                w <= area.w && h <= area.h
            ) {
                // Check for intersection with previous blocks
                let ok = true;
                for (let k = 0; k < i; k++) {
                    let prev = blocks[k];
                    if (areRectanglesIntersecting(block, prev)) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) continue;
                // After placement, split the area into only two parts (guillotine cut)
                let newAreas = [];
                if (area.w - w > 0) {
                    newAreas.push({ x: area.x + w, y: area.y, w: area.w - w, h: h });
                }
                if (area.h - h > 0) {
                    newAreas.push({ x: area.x, y: area.y + h, w: area.w, h: area.h - h });
                }
                // Do not touch the other areas
                for (let k = 0; k < areas.length; k++) {
                    if (k !== j) newAreas.push(areas[k]);
                }
                areas = newAreas.filter(a => a.w > 0 && a.h > 0);
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

// Get free guillotine areas
function getFreeGuillotineAreas(blocks, sheetWidth, sheetHeight) {
    let areas = [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }];
    for (const block of blocks) {
        let w = block.orientation === "vertical" ? block.w : block.h;
        let h = block.orientation === "vertical" ? block.h : block.w;
        let bx = block.x, by = block.y;
        let newAreas = [];
        for (let j = 0; j < areas.length; j++) {
            let area = areas[j];
            if (bx === area.x && by === area.y && w <= area.w && h <= area.h) {
                if (area.w - w > 0) {
                    newAreas.push({ x: area.x + w, y: area.y, w: area.w - w, h: h });
                }
                if (area.h - h > 0) {
                    newAreas.push({ x: area.x, y: area.y + h, w: area.w, h: area.h - h });
                }
            } else {
                newAreas.push(area);
            }
        }
        areas = newAreas.filter(a => a.w > 0 && a.h > 0);
    }
    return areas;
}

// Generate a random guillotine cutting (initial solution)
function generateInitialSolution(blocks, sheetWidth, sheetHeight) {
    let remaining = blocks.slice();
    let sheets = [];
    while (remaining.length > 0) {
        let placed = [];
        let used = Array(remaining.length).fill(false);
        let availableSpaces = [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }];
        for (let i = 0; i < remaining.length; i++) {
            let block = { ...remaining[i] };
            let orientations = ["vertical", "horizontal"];
            let placedBlock = null;
            for (let orientation of orientations) {
                let w = orientation === "vertical" ? block.w : block.h;
                let h = orientation === "vertical" ? block.h : block.w;
                for (let j = 0; j < availableSpaces.length; j++) {
                    let area = availableSpaces[j];
                    if (w <= area.w && h <= area.h) {
                        let x = area.x, y = area.y;
                        let newBlock = {
                            x, y, orientation,
                            w: block.w, h: block.h, num: block.num
                        };
                        let ok = true;
                        for (let b of placed) {
                            if (areRectanglesIntersecting(newBlock, b)) {
                                ok = false;
                                break;
                            }
                        }
                        if (!ok) continue;
                        let testPlaced = placed.concat([newBlock]);
                        if (isGuillotine(testPlaced, sheetWidth, sheetHeight)) {
                            placedBlock = { ...newBlock };
                            let newSpaces = [];
                            if (area.w - w > 0) {
                                newSpaces.push({ x: area.x + w, y: area.y, w: area.w - w, h: h });
                            }
                            if (area.h - h > 0) {
                                newSpaces.push({ x: area.x, y: area.y + h, w: area.w, h: area.h - h });
                            }
                            availableSpaces = availableSpaces.filter((_, idx) => idx !== j).concat(newSpaces);
                            break;
                        }
                    }
                }
                if (placedBlock) break;
            }
            if (placedBlock) {
                placed.push(placedBlock);
                used[i] = true;
            }
        }
        if (placed.length === 0) break;
        sheets.push(placed);
        remaining = remaining.filter((_, idx) => !used[idx]);
    }
    return sheets;
}

// Mutation of the solution: generate a neighbor
function generateNeighbor(sheets, sheetWidth, sheetHeight) {
    let newSheets = sheets.map(sheet => sheet.map(b => ({ ...b })));
    let mutationType = Math.random();
    // 1. Swap two blocks on one sheet
    if (mutationType < 0.33) {
        let sheetIdx = Math.floor(Math.random() * newSheets.length);
        let sheet = newSheets[sheetIdx];
        if (sheet.length < 2) return newSheets;
        let idx1 = Math.floor(Math.random() * sheet.length);
        let idx2 = Math.floor(Math.random() * sheet.length);
        while (idx2 === idx1) idx2 = Math.floor(Math.random() * sheet.length);
        let newSheet = sheet.slice();
        [newSheet[idx1], newSheet[idx2]] = [newSheet[idx2], newSheet[idx1]];
        if (isGuillotine(newSheet, sheetWidth, sheetHeight)) {
            newSheets[sheetIdx] = newSheet;
        }
    }
    // 2. Change block orientation
    else if (mutationType < 0.66) {
        let sheetIdx = Math.floor(Math.random() * newSheets.length);
        let sheet = newSheets[sheetIdx];
        if (sheet.length === 0) return newSheets;
        let blockIdx = Math.floor(Math.random() * sheet.length);
        let block = sheet[blockIdx];
        let newOrientation = block.orientation === "vertical" ? "horizontal" : "vertical";
        let newBlock = { ...block, orientation: newOrientation };
        let newSheet = sheet.slice();
        newSheet[blockIdx] = newBlock;
        if (isGuillotine(newSheet, sheetWidth, sheetHeight)) {
            newSheets[sheetIdx] = newSheet;
        }
    }
    // 3. Move block to a random valid area
    else {
        let sheetIdx = Math.floor(Math.random() * newSheets.length);
        let sheet = newSheets[sheetIdx];
        if (sheet.length === 0) return newSheets;
        let blockIdx = Math.floor(Math.random() * sheet.length);
        let block = sheet[blockIdx];
        let orientations = ["vertical", "horizontal"];
        let otherBlocks = sheet.filter((_, i) => i !== blockIdx);
        let freeAreas = getFreeGuillotineAreas(otherBlocks, sheetWidth, sheetHeight);
        let candidates = [];
        for (let orientation of orientations) {
            let w = orientation === "vertical" ? block.w : block.h;
            let h = orientation === "vertical" ? block.h : block.w;
            for (let area of freeAreas) {
                if (w <= area.w && h <= area.h) {
                    candidates.push({
                        x: area.x,
                        y: area.y,
                        orientation
                    });
                }
            }
        }
        if (candidates.length > 0) {
            let chosen = candidates[Math.floor(Math.random() * candidates.length)];
            let newBlock = {
                x: chosen.x,
                y: chosen.y,
                orientation: chosen.orientation,
                w: block.w,
                h: block.h,
                num: block.num
            };
            let newSheet = otherBlocks.concat([newBlock]);
            if (isGuillotine(newSheet, sheetWidth, sheetHeight)) {
                newSheets[sheetIdx] = newSheet;
            }
        }
    }
    return newSheets;
}

// Solution evaluation: energy (the higher, the better, returns fill ratio)
function calculateEnergy(sheets, sheetWidth, sheetHeight) {
    let usedArea = 0;
    sheets.forEach(sheet => {
        sheet.forEach(b => {
            usedArea += b.w * b.h;
        });
    });
    let totalArea = sheets.length * sheetWidth * sheetHeight;
    return usedArea / totalArea; // energy: чем больше, тем лучше
}

// Main simulated annealing algorithm
function runSimulatedAnnealing(blocks, sheetWidth, sheetHeight, options = {}) {
    const {
        initialTemperature = 1000.0,
        finalTemperature = 1e-4,
        alpha = 0.98,
        maxIterations = 1000
    } = options;

    let currentSolution = generateInitialSolution(blocks, sheetWidth, sheetHeight);
    let currentEnergy = calculateEnergy(currentSolution, sheetWidth, sheetHeight);
    let bestSolution = currentSolution;
    let bestEnergy = currentEnergy;
    let temperature = initialTemperature;

    for (let iter = 0; iter < maxIterations && temperature > finalTemperature; iter++) {
        let newSolution = generateNeighbor(currentSolution, sheetWidth, sheetHeight);
        let newEnergy = calculateEnergy(newSolution, sheetWidth, sheetHeight);

        // Now maximize energy: accept better or worse with probability
        if (newEnergy > currentEnergy || Math.random() < Math.exp((newEnergy - currentEnergy) / temperature)) {
            currentSolution = newSolution;
            currentEnergy = newEnergy;
            if (newEnergy > bestEnergy) {
                bestSolution = newSolution;
                bestEnergy = newEnergy;
            }
        }
        temperature *= alpha;
    }

    // Convert result to format [{width, height, blocks: [...]}, ...]
    return bestSolution.map(sheet => ({
        width: sheetWidth,
        height: sheetHeight,
        blocks: sheet.map(b => ({
            block: { w: b.w, h: b.h, num: b.num },
            x: b.x,
            y: b.y,
            orientation: b.orientation
        }))
    }));
}

// Export for use in other modules
//module.exports = { runSimulatedAnnealing };
