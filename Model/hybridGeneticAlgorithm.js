/* import { BestFit } from '../Model/BestFit.js';
import { runGeneticAlgorithm, } from '../Model/geneticAlgorithm.js';

export */ function runHybridGeneticAlgorithm(populationSize, mutationRate, generations, blocks, sheetWidth, sheetHeight, crossoverType) {

    // 1. Сформировать начальную популяцию с помощью BestFit
    function createBestFitPopulation(populationSize, blocks, sheetWidth, sheetHeight) {
        const population = [];
        for (let i = 0; i < populationSize; i++) {
            // Перемешиваем блоки для разнообразия
            let shuffled = blocks.slice();
            for (let j = shuffled.length - 1; j > 0; j--) {
                let k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }
            // BestFit.cutBlocks возвращает массив листов (Sheet), преобразуем к формату для генетического алгоритма
            let sheets = BestFit.cutBlocks(shuffled, sheetWidth, sheetHeight).map(sheet => {
                // sheet.blocks: [{w, h, num, x, y, ...}]
                return sheet.blocks.map(b => ({
                    x: b.x,
                    y: b.y,
                    orientation: "vertical", // BestFit не использует ориентацию, по умолчанию vertical
                    w: b.w,
                    h: b.h,
                    num: b.num
                }));
            });
            population.push({ sheets });
        }
        return population;
    }

    // 2. Запустить генетический алгоритм, передав ему начальную популяцию
    // Для этого модифицируем runGeneticAlgorithm: если передан параметр initialPopulation, используем его
    // Здесь предполагается, что runGeneticAlgorithm экспортируется как функция и принимает опциональный initialPopulation

    // Создаём начальную популяцию через BestFit
    const initialPopulation = createBestFitPopulation(populationSize, blocks, sheetWidth, sheetHeight);

    // Запускаем генетический алгоритм с этой популяцией
    // runGeneticAlgorithm должен быть модифицирован для поддержки initialPopulation (см. geneticAlgorithm.js)
    return runGeneticAlgorithm(populationSize, mutationRate, generations, blocks, sheetWidth, sheetHeight, initialPopulation, crossoverType);
}

//module.exports = { runHybridGeneticAlgorithm};