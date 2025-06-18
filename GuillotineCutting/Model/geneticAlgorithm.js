/**
 * Новый генетический алгоритм гильотинного раскроя с корректным гильотинным размещением блоков.
 * Формат входа/выхода: массив листов с blocks, где block: {w, h, num}, x, y, orientation.
 */
function runGeneticAlgorithm(populationSize, mutationRate, generations, blocks, sheetWidth, sheetHeight, initialPopulation, crossoverType) {
    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Проверка пересечения как в geneticWITHOUTGuillotine
    function areRectanglesIntersecting(rect1, rect2) {
        // Аналогично geneticWITHOUTGuillotine.js.js
        let rect1Width, rect1Height, rect2Width, rect2Height;
        if (rect1.orientation === "horizontal") {
            rect1Width = rect1.h;
            rect1Height = rect1.w;
        } else {
            rect1Width = rect1.w;
            rect1Height = rect1.h;
        }
        if (rect2.orientation === "horizontal") {
            rect2Width = rect2.h;
            rect2Height = rect2.w;
        } else {
            rect2Width = rect2.w;
            rect2Height = rect2.h;
        }
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

    // Проверка, что размещение гильотинное (каждый блок размещён в левом верхнем углу свободной области)
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
                // Блок должен быть размещён строго в левом углу области
                if (
                    bx === area.x && by === area.y &&
                    w <= area.w && h <= area.h
                ) {
                    // Проверка на пересечение с предыдущими
                    let ok = true;
                    for (let k = 0; k < i; k++) {
                        let prev = blocks[k];
                        if (areRectanglesIntersecting(block, prev)) {
                            ok = false;
                            break;
                        }
                    }
                    if (!ok) continue;
                    // После размещения делим область только на две части (гильотинный разрез)
                    let newAreas = [];
                    if (area.w - w > 0) {
                        newAreas.push({ x: area.x + w, y: area.y, w: area.w - w, h: h });
                    }
                    if (area.h - h > 0) {
                        newAreas.push({ x: area.x, y: area.y + h, w: area.w, h: area.h - h });
                    }
                    // Остальные области не трогаем
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

    // Получить свободные гильотинные области (только после последовательных разрезов)
    function getFreeGuillotineAreas(blocks, sheetWidth, sheetHeight) {
        let areas = [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }];
        for (const block of blocks) {
            let w = block.orientation === "vertical" ? block.w : block.h;
            let h = block.orientation === "vertical" ? block.h : block.w;
            let bx = block.x, by = block.y;
            let newAreas = [];
            for (let j = 0; j < areas.length; j++) {
                let area = areas[j];
                // Только если блок размещён строго в левом углу области
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

    // Генерация случайного гильотинного раскроя (размещаем блоки только в левом углу свободной области)
    function createRandomGuillotineCutting(blocks, sheetWidth, sheetHeight) {
        const sheets = [];
        let remaining = blocks.slice();
        const MAX_ATTEMPTS = 1000; // Ограничение на количество попыток расстановки
        while (remaining.length > 0) {
            let placed = [];
            let used = Array(remaining.length).fill(false);
            let availableSpaces = [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }];
            let attempts = 0;
            for (let i = 0; i < remaining.length; i++) {
                let block = { ...remaining[i] };
                // Пробуем оба варианта ориентации
                let orientations = ["vertical", "horizontal"];
                let placedBlock = null;
                for (let orientation of orientations) {
                    let w = orientation === "vertical" ? block.w : block.h;
                    let h = orientation === "vertical" ? block.h : block.w;
                    for (let j = 0; j < availableSpaces.length; j++) {
                        let area = availableSpaces[j];
                        // Только левый верхний угол
                        if (w <= area.w && h <= area.h) {
                            let x = area.x;
                            let y = area.y;
                            let newBlock = {
                                x,
                                y,
                                orientation,
                                w: block.w,
                                h: block.h,
                                num: block.num
                            };
                            // Проверка на пересечение
                            let ok = true;
                            for (let b of placed) {
                                if (areRectanglesIntersecting(newBlock, b)) {
                                    ok = false;
                                    break;
                                }
                            }
                            if (!ok) continue;
                            // Проверка гильотинности
                            let testPlaced = placed.concat([newBlock]);
                            if (isGuillotine(testPlaced, sheetWidth, sheetHeight)) {
                                placedBlock = { ...newBlock };
                                // После размещения делим область только на две части
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
                attempts++;
                if (attempts >= MAX_ATTEMPTS) {
                    break;
                }
            }
            if (placed.length === 0) break;
            sheets.push(placed);
            remaining = remaining.filter((_, idx) => !used[idx]);
        }
        return sheets;
    }

    function createInitialPopulation(populationSize, blocks, sheetWidth, sheetHeight) {
        const population = [];
        for (let i = 0; i < populationSize; i++) {
            let shuffled = blocks.slice();
            for (let j = shuffled.length - 1; j > 0; j--) {
                let k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }
            const randomSheets = createRandomGuillotineCutting(shuffled, sheetWidth, sheetHeight);
            population.push({ sheets: randomSheets });
        }
        return population;
    }

    // Мутация: три вида — перестановка, смена ориентации, перемещение в допустимую область, а также перенос блока между листами (с гильотинными ограничениями)
    function mutate(individual, mutationRate, sheetWidth, sheetHeight) {
        let sheets = individual.sheets.map(sheet => sheet.map(b => ({ ...b })));
        if (Math.random() < mutationRate) {
            const mutationType = Math.random();
            // 1. Перестановка двух блоков на одном листе
            if (mutationType < 0.25) {
                let sheetIdx = Math.floor(Math.random() * sheets.length);
                let sheet = sheets[sheetIdx];
                if (sheet.length < 2) return sheets;
                let idx1 = Math.floor(Math.random() * sheet.length);
                let idx2 = Math.floor(Math.random() * sheet.length);
                while (idx2 === idx1) idx2 = Math.floor(Math.random() * sheet.length);
                let newSheet = sheet.slice();
                [newSheet[idx1], newSheet[idx2]] = [newSheet[idx2], newSheet[idx1]];
                if (isGuillotine(newSheet, sheetWidth, sheetHeight)) {
                    sheets[sheetIdx] = newSheet;
                }
            }
            // 2. Смена ориентации блока (если возможно)
            else if (mutationType < 0.5) {
                let sheetIdx = Math.floor(Math.random() * sheets.length);
                let sheet = sheets[sheetIdx];
                if (sheet.length === 0) return sheets;
                let blockIdx = Math.floor(Math.random() * sheet.length);
                let block = sheet[blockIdx];
                let newOrientation = block.orientation === "vertical" ? "horizontal" : "vertical";
                let newBlock = { ...block, orientation: newOrientation };
                let newSheet = sheet.slice();
                newSheet[blockIdx] = newBlock;
                if (isGuillotine(newSheet, sheetWidth, sheetHeight)) {
                    sheets[sheetIdx] = newSheet;
                }
            }
            // 3. Перемещение блока в случайную допустимую область (левый верхний угол свободной области)
            else if (mutationType < 0.75) {
                let sheetIdx = Math.floor(Math.random() * sheets.length);
                let sheet = sheets[sheetIdx];
                if (sheet.length === 0) return sheets;
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
                        sheets[sheetIdx] = newSheet;
                    }
                }
            }
            // 4. Перенос блока между листами (если листов больше одного)
            //else {
                if (sheets.length > 1) {
                    let fromSheetIdx = Math.floor(Math.random() * sheets.length);
                    let toSheetIdx = Math.floor(Math.random() * sheets.length);
                    while (toSheetIdx === fromSheetIdx) {
                        toSheetIdx = Math.floor(Math.random() * sheets.length);
                    }
                    let fromSheet = sheets[fromSheetIdx];
                    let toSheet = sheets[toSheetIdx];
                    if (fromSheet.length > 0) {
                        let blockIdx = Math.floor(Math.random() * fromSheet.length);
                        let block = fromSheet[blockIdx];
                        let orientations = ["vertical", "horizontal"];
                        let otherBlocks = toSheet;
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
                            let newToSheet = otherBlocks.concat([newBlock]);
                            let newFromSheet = fromSheet.slice(0, blockIdx).concat(fromSheet.slice(blockIdx + 1));
                            if (isGuillotine(newToSheet, sheetWidth, sheetHeight) && isGuillotine(newFromSheet, sheetWidth, sheetHeight)) {
                                sheets[toSheetIdx] = newToSheet;
                                sheets[fromSheetIdx] = newFromSheet;
                            }
                        }
                    }
                }
            //}
        }
        return sheets;
    }

    // --- Кроссоверы ---

    // One-point crossover (по умолчанию используется)
    function onePointCrossover(parent1, parent2, sheetWidth, sheetHeight) {
        let blocks1 = [];
        parent1.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks1.push({ ...b, sheetIndex: idx })));
        let blocks2 = [];
        parent2.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks2.push({ ...b, sheetIndex: idx })));
        let point = Math.floor(Math.random() * blocks1.length);

        let childBlocks = [];
        for (let i = 0; i < blocks1.length; i++) {
            let src = i < point ? blocks1[i] : blocks2[i];
            let orig = blocks1[i] || src;
            childBlocks.push({
                x: src.x,
                y: src.y,
                orientation: src.orientation,
                w: orig.w,
                h: orig.h,
                num: orig.num,
                sheetIndex: src.sheetIndex
            });
        }
        let maxSheetIndex = Math.max(0, ...childBlocks.map(b => b.sheetIndex != null ? b.sheetIndex : 0));
        let sheets = Array.from({ length: maxSheetIndex + 1 }, () => []);
        childBlocks.forEach(b => {
            if (b.sheetIndex != null && sheets[b.sheetIndex]) {
                sheets[b.sheetIndex].push({
                    x: b.x,
                    y: b.y,
                    orientation: b.orientation,
                    w: b.w,
                    h: b.h,
                    num: b.num
                });
            }
        });
        let valid = true;
        for (let i = 0; i < sheets.length; i++) {
            if (!isGuillotine(sheets[i], sheetWidth, sheetHeight)) {
                valid = false;
                break;
            }
            for (let j = 0; j < sheets[i].length; j++) {
                let b1 = sheets[i][j];
                if (b1.x < 0 || b1.y < 0 || b1.x + (b1.orientation === "vertical" ? b1.w : b1.h) > sheetWidth || b1.y + (b1.orientation === "vertical" ? b1.h : b1.w) > sheetHeight) {
                    valid = false;
                    break;
                }
                for (let k = 0; k < sheets[i].length; k++) {
                    if (k === j) continue;
                    let b2 = sheets[i][k];
                    if (areRectanglesIntersecting(b1, b2)) {
                        valid = false;
                        break;
                    }
                }
                if (!valid) break;
            }
            if (!valid) break;
        }
        if (valid) {
            for (let i = 0; i < sheets.length; i++) {
                if (!isGuillotine(sheets[i], sheetWidth, sheetHeight)) {
                    valid = false;
                    break;
                }
            }
        }
        if (!valid) return [parent1, parent2];
        return [{ sheets }, { sheets: sheets.map(sheet => sheet.map(b => ({ ...b }))) }];
    }

    // --- Arithmetic Crossover ---
    
    function arithmeticCrossover(parent1, parent2, sheetWidth, sheetHeight) {
        let alpha = Math.random();
        let blocks1 = [];
        parent1.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks1.push({ ...b, sheetIndex: idx })));
        let blocks2 = [];
        parent2.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks2.push({ ...b, sheetIndex: idx })));
        let childBlocks = [];
        for (let i = 0; i < blocks1.length; i++) {
            let b1 = blocks1[i], b2 = blocks2[i];
            childBlocks.push({
                x: Math.round(alpha * b1.x + (1 - alpha) * b2.x),
                y: Math.round(alpha * b1.y + (1 - alpha) * b2.y),
                orientation: Math.random() < 0.5 ? b1.orientation : b2.orientation,
                w: b1.w,
                h: b1.h,
                num: b1.num,
                sheetIndex: Math.random() < 0.5 ? b1.sheetIndex : b2.sheetIndex
            });
        }
        let maxSheetIndex = Math.max(0, ...childBlocks.map(b => b.sheetIndex != null ? b.sheetIndex : 0));
        let sheets = Array.from({ length: maxSheetIndex + 1 }, () => []);
        childBlocks.forEach(b => {
            if (b.sheetIndex != null && sheets[b.sheetIndex]) {
                sheets[b.sheetIndex].push({
                    x: b.x,
                    y: b.y,
                    orientation: b.orientation,
                    w: b.w,
                    h: b.h,
                    num: b.num
                });
            }
        });
        // Проверки как обычно
        let valid = true;
        for (let i = 0; i < sheets.length; i++) {
            if (!isGuillotine(sheets[i], sheetWidth, sheetHeight)) {
                valid = false;
                break;
            }
            for (let j = 0; j < sheets[i].length; j++) {
                let b1 = sheets[i][j];
                if (b1.x < 0 || b1.y < 0 || b1.x + (b1.orientation === "vertical" ? b1.w : b1.h) > sheetWidth || b1.y + (b1.orientation === "vertical" ? b1.h : b1.w) > sheetHeight) {
                    valid = false;
                    break;
                }
                for (let k = 0; k < sheets[i].length; k++) {
                    if (k === j) continue;
                    let b2 = sheets[i][k];
                    if (areRectanglesIntersecting(b1, b2)) {
                        valid = false;
                        break;
                    }
                }
                if (!valid) break;
            }
            if (!valid) break;
        }
        if (valid) {
            for (let i = 0; i < sheets.length; i++) {
                if (!isGuillotine(sheets[i], sheetWidth, sheetHeight)) {
                    valid = false;
                    break;
                }
            }
        }
        if (!valid) return [parent1, parent2];
        return [{ sheets }, { sheets: sheets.map(sheet => sheet.map(b => ({ ...b }))) }];
    }
    

    // --- Order Crossover (OX) ---
    
    function orderCrossover(parent1, parent2, sheetWidth, sheetHeight) {
        let blocks1 = [];
        parent1.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks1.push({ ...b, sheetIndex: idx })));
        let blocks2 = [];
        parent2.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks2.push({ ...b, sheetIndex: idx })));
        let size = blocks1.length;
        let start = Math.floor(Math.random() * size);
        let end = Math.floor(Math.random() * size);
        if (start > end) [start, end] = [end, start];

        function ox(parentA, parentB) {
            let child = Array(size).fill(null);
            for (let i = start; i <= end; i++) child[i] = parentA[i];
            let fillIdx = (end + 1) % size;
            for (let i = 0; i < size; i++) {
                let candidate = parentB[(end + 1 + i) % size];
                // Проверка на null и на наличие num
                if (candidate && !child.some(b => b && b.num === candidate.num)) {
                    child[fillIdx] = candidate;
                    fillIdx = (fillIdx + 1) % size;
                }
            }
            // Удаляем возможные null из результата
            return child.filter(b => b !== null);
        }
        let childBlocks1 = ox(blocks1, blocks2);
        let childBlocks2 = ox(blocks2, blocks1);

        function blocksToSheets(childBlocks) {
            // Фильтруем null и undefined
            let filteredBlocks = childBlocks.filter(b => b && b.sheetIndex != null);
            let maxSheetIndex = Math.max(0, ...filteredBlocks.map(b => b.sheetIndex));
            let sheets = Array.from({ length: maxSheetIndex + 1 }, () => []);
            filteredBlocks.forEach(b => {
                if (sheets[b.sheetIndex]) {
                    sheets[b.sheetIndex].push({
                        x: b.x,
                        y: b.y,
                        orientation: b.orientation,
                        w: b.w,
                        h: b.h,
                        num: b.num
                    });
                }
            });
            return sheets;
        }
        let sheets1 = blocksToSheets(childBlocks1);
        let sheets2 = blocksToSheets(childBlocks2);

        function validSheets(sheets) {
            for (let i = 0; i < sheets.length; i++) {
                if (!isGuillotine(sheets[i], sheetWidth, sheetHeight)) return false;
                for (let j = 0; j < sheets[i].length; j++) {
                    let b1 = sheets[i][j];
                    if (b1.x < 0 || b1.y < 0 || b1.x + (b1.orientation === "vertical" ? b1.w : b1.h) > sheetWidth || b1.y + (b1.orientation === "vertical" ? b1.h : b1.w) > sheetHeight) {
                        return false;
                    }
                    for (let k = 0; k < sheets[i].length; k++) {
                        if (k === j) continue;
                        let b2 = sheets[i][k];
                        if (areRectanglesIntersecting(b1, b2)) return false;
                    }
                }
            }
            return true;
        }
        if (!validSheets(sheets1) || !validSheets(sheets2)) return [parent1, parent2];
        return [{ sheets: sheets1 }, { sheets: sheets2 }];
    }
    

    // --- Partially Mapped Crossover (PMX) ---
    function pmxCrossover(parent1, parent2, sheetWidth, sheetHeight) {
        let blocks1 = [];
        parent1.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks1.push({ ...b, sheetIndex: idx })));
        let blocks2 = [];
        parent2.sheets.forEach((sheet, idx) => sheet.forEach(b => blocks2.push({ ...b, sheetIndex: idx })));
        let size = blocks1.length;
        let maxAttempts = 10; // Ограничение числа попыток
        let attempt = 0;

        function pmx(parentA, parentB, start, end) {
            let child = Array(size).fill(null);
            let mapping = {};
            for (let i = start; i <= end; i++) {
                child[i] = parentA[i];
                mapping[parentA[i].num] = parentB[i].num;
            }
            for (let i = 0; i < size; i++) {
                if (i >= start && i <= end) continue;
                let candidate = parentB[i];
                let mappedNum = candidate.num;
                let visited = new Set();
                // Защита от зацикливания
                while (Object.values(mapping).includes(mappedNum)) {
                    if (visited.has(mappedNum)) break;
                    visited.add(mappedNum);
                    mappedNum = mapping[mappedNum];
                }
                let block = blocks1.find(b => b.num === mappedNum) || candidate;
                child[i] = block;
            }
            return child;
        }

        let sheets1, sheets2;
        while (attempt < maxAttempts) {
            let start = Math.floor(Math.random() * size);
            let end = Math.floor(Math.random() * size);
            if (start > end) [start, end] = [end, start];

            let childBlocks1 = pmx(blocks1, blocks2, start, end);
            let childBlocks2 = pmx(blocks2, blocks1, start, end);

            function blocksToSheets(childBlocks) {
                let filteredBlocks = childBlocks.filter(b => b && b.sheetIndex != null);
                let maxSheetIndex = Math.max(0, ...filteredBlocks.map(b => b.sheetIndex));
                let sheets = Array.from({ length: maxSheetIndex + 1 }, () => []);
                filteredBlocks.forEach(b => {
                    if (sheets[b.sheetIndex]) {
                        sheets[b.sheetIndex].push({
                            x: b.x,
                            y: b.y,
                            orientation: b.orientation,
                            w: b.w,
                            h: b.h,
                            num: b.num
                        });
                    }
                });
                return sheets;
            }
            sheets1 = blocksToSheets(childBlocks1);
            sheets2 = blocksToSheets(childBlocks2);

            function validSheets(sheets) {
                for (let i = 0; i < sheets.length; i++) {
                    if (!isGuillotine(sheets[i], sheetWidth, sheetHeight)) return false;
                    for (let j = 0; j < sheets[i].length; j++) {
                        let b1 = sheets[i][j];
                        if (b1.x < 0 || b1.y < 0 || b1.x + (b1.orientation === "vertical" ? b1.w : b1.h) > sheetWidth || b1.y + (b1.orientation === "vertical" ? b1.h : b1.w) > sheetHeight) {
                            return false;
                        }
                        for (let k = 0; k < sheets[i].length; k++) {
                            if (k === j) continue;
                            let b2 = sheets[i][k];
                            if (areRectanglesIntersecting(b1, b2)) return false;
                        }
                    }
                }
                return true;
            }
            if (validSheets(sheets1) && validSheets(sheets2)) {
                return [{ sheets: sheets1 }, { sheets: sheets2 }];
            }
            attempt++;
        }
        // Если не удалось получить валидные потомки за maxAttempts, вернуть родителей
        return [parent1, parent2];
    }

    // --- Основная функция crossover ---
    function crossover(parent1, parent2, sheetWidth, sheetHeight) {
        if (crossoverType === 'pmx') {
            return pmxCrossover(parent1, parent2, sheetWidth, sheetHeight);
        } else if (crossoverType === 'ox') {
            return orderCrossover(parent1, parent2, sheetWidth, sheetHeight);
        } else if (crossoverType === 'one_point') {
            return onePointCrossover(parent1, parent2, sheetWidth, sheetHeight);
        } else if (crossoverType === 'arithmetic') {
            return arithmeticCrossover(parent1, parent2, sheetWidth, sheetHeight);
        } else {
            // fallback
            return pmxCrossover(parent1, parent2, sheetWidth, sheetHeight);
        }
    }

    function evaluateFitness(sheets, sheetWidth, sheetHeight) {
        let usedArea = 0;
        sheets.forEach(sheet => {
            sheet.forEach(b => {
                usedArea += b.w * b.h;
            });
        });
        let totalArea = sheets.length * sheetWidth * sheetHeight;
        // Сначала минимизируем количество листов (чем меньше, тем лучше), затем максимизируем заполненность
        // Используем большое число для приоритета количества листов
        return (usedArea / totalArea);
    }
 
    /* // Эффективность размещения: отношение занятой площади к минимальному прямоугольнику, покрывающему все блоки
    function calculateEfficiency(sheets) {
        let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
        sheets.forEach(sheet => {
            sheet.blocks .forEach(block => {
                minX = Math.min(minX, block.x);
                minY = Math.min(minY, block.y);
                maxX = Math.max(maxX, block.x + (block.w ? block.w : block.block.w));
                maxY = Math.max(maxY, block.y + (block.h ? block.h : block.block.h));
            });
        });
        let totalArea = (maxX - minX) * (maxY - minY);
        let usedArea = sheets.reduce((sum, sheet) => {
            return sum + sheet.blocks.reduce((blockSum, block) => {
                return blockSum + (block.w ? block.w * block.h : block.block.w * block.block.h);
            }, 0);
        }, 0);
        return (usedArea / totalArea) - sheets.length * 100000; // Возвращаем в процентах
    }

    function evaluateFitness(sheets, sheetWidth, sheetHeight) {
        // sheets - массив листов, каждый лист - массив блоков
        // Для совместимости с calculateEfficiency, преобразуем к формату [{blocks: [...]}, ...]
        let sheetsForEfficiency = sheets.map(sheet => ({
            blocks: sheet.map(b => ({
                x: b.x,
                y: b.y,
                w: b.w,
                h: b.h,
                block: { w: b.w, h: b.h, num: b.num }
            }))
        }));
        let efficiency = calculateEfficiency(sheetsForEfficiency);
        // Сильно штрафуем за количество листов, эффективность — второстепенно
        return efficiency;
    }
 */
 
    function tournamentSelection(population, tournamentSize) {
        let bestIndividual = population[Math.floor(Math.random() * population.length)];
        for (let i = 1; i < tournamentSize; i++) {
            const randomIndividual = population[Math.floor(Math.random() * population.length)];
            if (evaluateFitness(randomIndividual.sheets, sheetWidth, sheetHeight) > evaluateFitness(bestIndividual.sheets, sheetWidth, sheetHeight)) {
                bestIndividual = randomIndividual;
            }
        }
        return bestIndividual;
    }

    function selectParents(population) {
        const parent1 = tournamentSelection(population, 2);
        let parent2 = tournamentSelection(population, 2);
        while (parent2 === parent1) {
            parent2 = tournamentSelection(population, 2);
        }
        return [parent1, parent2];
    }

    // Используем initialPopulation, если передан
    let population = initialPopulation && Array.isArray(initialPopulation) && initialPopulation.length === populationSize
        ? initialPopulation
        : createInitialPopulation(populationSize, blocks, sheetWidth, sheetHeight);

    // --- Додаємо лічильник спроб без покращення ---
    let bestFitness = -Infinity;
    let bestIndividual;
    let noImprovementTries = 0;
    const maxNoImprovementTries = 200;

    for (let generation = 0; generation < generations; generation++) {
        if (noImprovementTries >= maxNoImprovementTries) break;
        const newPopulation = [];
        while (newPopulation.length < populationSize) {
            const [parent1, parent2] = selectParents(population);
            let [child1, child2] = crossover(parent1, parent2, sheetWidth, sheetHeight);
            child1.sheets = mutate(child1, mutationRate, sheetWidth, sheetHeight);
            child2.sheets = mutate(child2, mutationRate, sheetWidth, sheetHeight);
            newPopulation.push(child1);
            newPopulation.push(child2);
        }
        population = newPopulation;

        // Оценка найкращего індивіда в поточному поколінні
        let generationBestFitness = -Infinity;
        let generationBestIndividual = null;
        for (let i = 0; i < population.length; i++) {
            const fitness = evaluateFitness(population[i].sheets, sheetWidth, sheetHeight);
            if (fitness > generationBestFitness) {
                generationBestFitness = fitness;
                generationBestIndividual = population[i];
            }
        }
        if (generationBestFitness > bestFitness) {
            bestFitness = generationBestFitness;
            bestIndividual = generationBestIndividual;
            noImprovementTries = 0;
        } else {
            noImprovementTries++;
        }
    }

    // Якщо bestIndividual ще не визначено (наприклад, якщо populationSize = 0)
    if (!bestIndividual) {
        for (let i = 0; i < population.length; i++) {
            const fitness = evaluateFitness(population[i].sheets, sheetWidth, sheetHeight);
            if (fitness > bestFitness) {
                bestFitness = fitness;
                bestIndividual = population[i];
            }
        }
    }

    return bestIndividual.sheets.map(sheet => ({
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

//module.exports = { runGeneticAlgorithm};