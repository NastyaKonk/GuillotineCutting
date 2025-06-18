function runACO(blocks, sheetWidth, sheetHeight, antCount = 30, iterations = 100, alpha = 1, beta = 2, evaporation = 0.5) {
    // --- 1. Pheromone initialization ---
    // Key: `${blockIdx}_${x}_${y}_${orientation}`
    const pheromones = {};
    const getKey = (blockIdx, x, y, orientation) => `${blockIdx}_${x}_${y}_${orientation}`;

    // Discretize coordinates (to avoid too many options)
    const step = Math.max(1, Math.floor(Math.min(sheetWidth, sheetHeight) / 20));

    // Initialize pheromones for all possible positions and orientations
    for (let b = 0; b < blocks.length; b++) {
        for (let orientation of ["vertical", "horizontal"]) {
            let w = orientation === "vertical" ? blocks[b].w : blocks[b].h;
            let h = orientation === "vertical" ? blocks[b].h : blocks[b].w;
            for (let x = 0; x <= sheetWidth - w; x += step) {
                for (let y = 0; y <= sheetHeight - h; y += step) {
                    pheromones[getKey(b, x, y, orientation)] = 1.0;
                }
            }
        }
    }

    let bestSolution = null;
    let bestFitness = -Infinity;

    // --- Add counter for attempts without improvement ---
    let noImprovementTries = 0;
    const maxNoImprovementTries = 200;

    // --- 2. Main ACO loop ---
    for (let iter = 0; iter < iterations; iter++) {
        if (noImprovementTries >= maxNoImprovementTries) break;
        const antSolutions = [];
        for (let ant = 0; ant < antCount; ant++) {
            // Each ant builds a solution
            let remaining = blocks.map((b, idx) => ({ ...b, idx }));
            let sheets = [];
            while (remaining.length > 0) {
                let placed = [];
                let used = Array(remaining.length).fill(false);
                let availableSpaces = [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }];
                for (let i = 0; i < remaining.length; i++) {
                    let block = remaining[i];
                    let candidates = [];
                    for (let orientation of ["vertical", "horizontal"]) {
                        let w = orientation === "vertical" ? block.w : block.h;
                        let h = orientation === "vertical" ? block.h : block.w;
                        for (let area of availableSpaces) {
                            if (w <= area.w && h <= area.h) {
                                let x = area.x, y = area.y;
                                // Heuristic: block area
                                let heuristic = w * h;
                                let pher = pheromones[getKey(block.idx, x, y, orientation)] || 1.0;
                                candidates.push({
                                    x, y, orientation, w, h, idx: block.idx,
                                    score: Math.pow(pher, alpha) * Math.pow(heuristic, beta)
                                });
                            }
                        }
                    }
                    if (candidates.length === 0) continue;
                    // Roulette wheel selection
                    let sumScore = candidates.reduce((s, c) => s + c.score, 0);
                    let r = Math.random() * sumScore;
                    let acc = 0, chosen = null;
                    for (let c of candidates) {
                        acc += c.score;
                        if (acc >= r) {
                            chosen = c;
                            break;
                        }
                    }
                    if (!chosen) chosen = candidates[0];
                    // Check for intersection with already placed blocks
                    let ok = true;
                    for (let b of placed) {
                        if (areRectanglesIntersecting(
                            { x: chosen.x, y: chosen.y, w: block.w, h: block.h, orientation: chosen.orientation },
                            { x: b.x, y: b.y, w: b.w, h: b.h, orientation: b.orientation }
                        )) {
                            ok = false;
                            break;
                        }
                    }
                    if (!ok) continue;
                    // Check guillotine property
                    let testPlaced = placed.concat([{
                        x: chosen.x, y: chosen.y, w: block.w, h: block.h, orientation: chosen.orientation, num: block.num
                    }]);
                    if (!isGuillotine(testPlaced, sheetWidth, sheetHeight)) continue;
                    // Place block
                    placed.push({
                        x: chosen.x, y: chosen.y, w: block.w, h: block.h, orientation: chosen.orientation, num: block.num
                    });
                    used[i] = true;
                    // Update free areas (guillotine cut)
                    let areaIdx = availableSpaces.findIndex(a => a.x === chosen.x && a.y === chosen.y && a.w >= chosen.w && a.h >= chosen.h);
                    if (areaIdx !== -1) {
                        let area = availableSpaces[areaIdx];
                        let newSpaces = [];
                        if (area.w - chosen.w > 0) {
                            newSpaces.push({ x: area.x + chosen.w, y: area.y, w: area.w - chosen.w, h: chosen.h });
                        }
                        if (area.h - chosen.h > 0) {
                            newSpaces.push({ x: area.x, y: area.y + chosen.h, w: area.w, h: area.h - chosen.h });
                        }
                        availableSpaces = availableSpaces.filter((_, idx) => idx !== areaIdx).concat(newSpaces);
                    }
                }
                if (placed.length === 0) break;
                sheets.push(placed);
                remaining = remaining.filter((_, idx) => !used[idx]);
            }
            antSolutions.push(sheets);
        }

        // --- 3. Evaluation and pheromone update ---
        // Evaporation
        for (let key in pheromones) {
            pheromones[key] *= (1 - evaporation);
            if (pheromones[key] < 1e-6) pheromones[key] = 1e-6;
        }
        // Reinforce pheromones on best solutions
        let improved = false;
        for (let sheets of antSolutions) {
            let fitness = calculateFitness(sheets, sheetWidth, sheetHeight);
            if (fitness > bestFitness) {
                bestFitness = fitness;
                bestSolution = sheets;
                improved = true;
            }
            // Strengthen pheromones for all placed blocks
            sheets.forEach((sheet) => {
                sheet.forEach((b, idx) => {
                    let key = getKey(idx, b.x, b.y, b.orientation);
                    pheromones[key] += fitness;
                });
            });
        }
        if (improved) {
            noImprovementTries = 0;
        } else {
            noImprovementTries++;
        }
    }

    // --- 4. Format result ---
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

    // --- Helper functions ---
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
                    // After placement, divide the area into two parts only (guillotine cut)
                    let newAreas = [];
                    if (area.w - w > 0) {
                        newAreas.push({ x: area.x + w, y: area.y, w: area.w - w, h: h });
                    }
                    if (area.h - h > 0) {
                        newAreas.push({ x: area.x, y: area.y + h, w: area.w, h: area.h - h });
                    }
                    // Leave other areas untouched
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

    function calculateFitness(sheets, sheetWidth, sheetHeight) {
        let usedArea = 0;
        sheets.forEach(sheet => {
            sheet.forEach(b => {
                usedArea += b.w * b.h;
            });
        });
        let totalArea = sheets.length * sheetWidth * sheetHeight;
        return usedArea / totalArea;
    }
}

// Export for use in other modules
//module.exports = { runACO };
