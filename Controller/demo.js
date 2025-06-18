//import { runGeneticAlgorithm, } from '../Model/geneticAlgorithm.js';
// import { Block } from '../Model/Block.js';
// import  { runACO } from '../Model/antColonyAlgorithm.js'; // Update import for CommonJS module
// import { runSimulatedAnnealing } from '../Model/simulatedAnnealing.js';
// import { BestFit } from '../Model/BestFit.js';
// import { runHybridGeneticAlgorithm } from '../Model/hybridGeneticAlgorithm.js';


var Demo = {

  init: function () {
    // Initialize DOM elements
    Demo.el = {
      details: $('#details'),
      block_h: $('#block_h'),
      block_w: $('#block_w'),
      block_n: $('#block_n'),
      canvas: $('#canvas')[0],
      size_h: $('#size_h'),
      size_w: $('#size_w'),
      numSheets: $('#numSheets'),
      ratio: $('#ratio'),
      edit_block_n: $('#edit_block_n'),
      edit_block_w: $('#edit_block_w'),
      edit_block_h: $('#edit_block_h'),
      add_block: $('#add_block'),
      edit_block: $('#edit_block'),
      run_button: $('#run_button'), // Add a run button
      algorithm_select: $('#algorithm_select'), // Add algorithm select
      execution_time: $('#execution_time'), // Add execution time display
      efficiency: $('#efficiency'), // Add efficiency display
      toggle_details: $('#toggle_details') // Add toggle details switch
    };

    if (!Demo.el.canvas.getContext) // no support for canvas
      return false;

    // Get the 2D drawing context for the canvas
    Demo.el.draw = Demo.el.canvas.getContext("2d");

    $(Demo.el.add_block).click(function (event) {
      if (parseInt(Demo.el.size_h.val()) <= 3000 && parseInt(Demo.el.size_w.val()) <= 3000) {
        details.add_block();
        Demo.run(); // Run the algorithm after adding a block
      } else {
        var el = document.getElementById('size_report');
        el.style.display = 'block';
      }
    });

    $(Demo.el.edit_block).click(function (event) {
      details.edit_block();
      Demo.run(); // Run the algorithm after editing a block
    });

    // Set up event listeners for input changes
    Demo.el.size_h.change(function (ev) {
      if (parseInt(Demo.el.size_h.val()) <= 3000) {
        details.saveValuesToLocalStorage('size_h');
        var el = document.getElementById('size_report');
        el.style.display = 'none';
      } else {
        var el = document.getElementById('size_report');
        el.style.display = 'block';
      }
    });

    Demo.el.size_w.change(function (ev) {
      if (parseInt(Demo.el.size_h.val()) <= 3000) {
        details.saveValuesToLocalStorage('size_w');
        var el = document.getElementById('size_report');
        el.style.display = 'none';
      } else {
        var el = document.getElementById('size_report');
        el.style.display = 'block';
      }
    });

    Demo.el.block_h.change(function (ev) {
      details.saveValuesToLocalStorage('block_h');
    });

    Demo.el.block_w.change(function (ev) {
      details.saveValuesToLocalStorage('block_w');
    });

    Demo.el.block_n.change(function (ev) {
      details.saveValuesToLocalStorage('block_n');
    });

    // Set up event listeners for click events
    $(Demo.el.size_h).click(function (event) {
      var savedSH = localStorage.getItem('size_h');
      details.populateDropdownList('size_h', savedSH ? savedSH.split(',') : []);
    });

    $(Demo.el.size_w).click(function (event) {
      var savedSW = localStorage.getItem('size_w');
      details.populateDropdownList('size_w', savedSW ? savedSW.split(',') : []);
    });

    $(Demo.el.block_w).click(function (event) {
      var savedW = localStorage.getItem('block_w');
      details.populateDropdownList('block_w', savedW ? savedW.split(',') : []);
    });

    $(Demo.el.block_h).click(function (event) {
      var savedH = localStorage.getItem('block_h');
      details.populateDropdownList('block_h', savedH ? savedH.split(',') : []);
    });

    $(Demo.el.block_n).click(function (event) {
      var savedN = localStorage.getItem('block_n');
      details.populateDropdownList('block_n', savedN ? savedN.split(',') : []);
    });

    // Run the algorithm and redraw the canvas when the run button is clicked
    $(Demo.el.run_button).click(function (event) {
      Demo.run();
    });

    // Toggle the visibility of the details list
    $(Demo.el.toggle_details).change(function (event) {
      Demo.el.details.toggleClass('hidden');
    });
  },

  run: function () {
    var newBlocks = details.list.slice(0);
    if (newBlocks.length > 0) {
      var algorithm = Demo.el.algorithm_select.val();
      var resSheets;
      var startTime = performance.now(); // Start time measurement
      if (algorithm === "genetic") {
        // var result = runGeneticAlgorithm(5000, 0.01, 5000, newBlocks, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()));
        // resSheets = performCutting(result.cutting, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()));
        resSheets = runGeneticAlgorithm(5000, 0.01, 5000, newBlocks, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()), undefined, 'arithmetic');
      } else if (algorithm === "best_fit") {
        resSheets = BestFit.cutBlocks(newBlocks, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()));
      } else if (algorithm === "ant_colony") {
        resSheets = runACO(newBlocks, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()), 500, 1000, 1, 2, 0.5);
      } else if (algorithm === "simulated_annealing") {
        resSheets = runSimulatedAnnealing(newBlocks, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()));
      } else if (algorithm === "hybrid_genetic") {
        resSheets = runHybridGeneticAlgorithm(5000, 0.01, 5000, newBlocks, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()), 'arithmetic');
        //resSheets = performCutting(result.cutting, parseInt(Demo.el.size_w.val()), parseInt(Demo.el.size_h.val()));
      }


      var endTime = performance.now(); // End time measurement
      var executionTime = endTime - startTime; // Calculate execution time
      Demo.el.execution_time.text(`Час виконання: ${executionTime.toFixed(2)} ms`); // Display execution time

      var hCanvas = parseInt(Demo.el.size_h.val()) * resSheets.length;
      canvas.reset(parseInt(Demo.el.size_w.val()), hCanvas);
      canvas.blocks(resSheets, algorithm);
      details.report(resSheets.length, newBlocks, parseInt(Demo.el.size_w.val()), hCanvas);
      details.print_det();
    }
  },
}

function getTestBlocks(n) {
  const base = [
    new Block(50, 50, 1), new Block(50, 50, 2), new Block(60, 40, 3), new Block(60, 40, 4),
    new Block(70, 30, 5), new Block(10, 40, 6), new Block(10, 40, 7), new Block(30, 50, 8),
    new Block(30, 50, 9), new Block(80, 10, 10), new Block(10, 20, 11), new Block(10, 20, 12),
    new Block(10, 20, 13), new Block(10, 20, 14), new Block(30, 20, 15), new Block(30, 20, 16),
    new Block(75, 13, 17), new Block(75, 13, 18), new Block(12, 46, 19), new Block(12, 46, 20),
    new Block(45, 27, 21), new Block(45, 27, 22), new Block(56, 77, 23), new Block(56, 77, 24),
    new Block(83, 55, 25), new Block(83, 55, 26), new Block(23, 21, 27), new Block(23, 21, 28),
    new Block(33, 33, 29), new Block(33, 33, 30), new Block(63, 33, 31), new Block(63, 33, 32),
    new Block(19, 24, 33), new Block(19, 24, 34), new Block(24, 10, 35), new Block(24, 10, 36),
    new Block(56, 11, 37), new Block(56, 11, 38), new Block(69, 38, 39), new Block(69, 38, 40),
    new Block(25, 25, 41), new Block(25, 25, 42), new Block(35, 45, 43), new Block(35, 45, 44),
    new Block(55, 15, 45), new Block(15, 55, 46), new Block(15, 55, 47), new Block(45, 35, 48),
    new Block(45, 35, 49), new Block(85, 15, 50), new Block(15, 25, 51), new Block(15, 25, 52),
    new Block(15, 25, 53), new Block(15, 25, 54), new Block(35, 25, 55), new Block(35, 25, 56),
    new Block(77, 17, 57), new Block(77, 17, 58), new Block(14, 48, 59), new Block(14, 48, 60),
    new Block(41, 41, 61), new Block(41, 41, 62), new Block(61, 21, 63), new Block(61, 21, 64),
    new Block(22, 22, 65), new Block(22, 22, 66), new Block(32, 32, 67), new Block(32, 32, 68),
    new Block(62, 32, 69), new Block(62, 32, 70), new Block(18, 28, 71), new Block(18, 28, 72),
    new Block(28, 12, 73), new Block(28, 12, 74), new Block(58, 13, 75), new Block(58, 13, 76),
    new Block(71, 36, 77), new Block(71, 36, 78), new Block(44, 44, 79), new Block(44, 44, 80),
    new Block(21, 21, 81), new Block(21, 21, 82), new Block(31, 31, 83), new Block(31, 31, 84),
    new Block(61, 31, 85), new Block(61, 31, 86), new Block(17, 26, 87), new Block(17, 26, 88),
    new Block(26, 11, 89), new Block(26, 11, 90), new Block(57, 12, 91), new Block(57, 12, 92),
    new Block(70, 35, 93), new Block(70, 35, 94), new Block(43, 43, 95), new Block(43, 43, 96),
    new Block(20, 20, 97), new Block(20, 20, 98), new Block(30, 30, 99), new Block(30, 30, 100)
  ];
  // Для 20 — первые 20 из base40
  if (n === 20) return base.slice(0, 20);
  if (n === 40) return base.slice(0, 40);
  if (n === 60) return base.slice(0, 60);
  if (n === 80) return base.slice(0, 80);
  if (n === 100) return base;
  return [];
}

// Массив кроссоверов (названия должны совпадать с вашей реализацией в runGeneticAlgorithm)
//const crossovers = [ 'one_point','arithmetic','ox', 'pmx'];
const crossovers = [ 'arithmetic'];


// Основная функция тестирования
function runGeneticAlgorithmTests() {
  const blockCounts = [20, 40, 60, 80, 100];
  //const blockCounts = [40];
  //const populationSizes = [1000, 2000, 3000, 4000, 5000];
  const populationSizes = [5000];
  const sheetWidth = 300;
  const sheetHeight = 300;
  const repeats = 5;

  blockCounts.forEach(blockCount => {
    const blocks = getTestBlocks(blockCount);
    populationSizes.forEach(popSize => {
      crossovers.forEach(crossoverType => {
        let totalTime = 0;
        let totalSheets = 0;
        let totalEfficiency = 0;
        for (let rep = 0; rep < repeats; rep++) {
          const startTime = performance.now();
          let resSheets = runGeneticAlgorithm(
            popSize, 0.01, popSize, blocks, sheetWidth, sheetHeight, undefined, crossoverType
          );
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          totalTime += executionTime;
          totalSheets += resSheets.length;
          totalEfficiency += parseFloat(calculateEfficiency(resSheets));
        }
        const avgTime = totalTime / repeats;
        const avgSheets = totalSheets / repeats;
        const avgEfficiency = totalEfficiency / repeats;
        console.log('='.repeat(60));
        console.log(`TEST: Blocks=${blockCount}, Population=${popSize}, Crossover=${crossoverType}`);
        console.log('-'.repeat(60));
        console.log(`Average Execution Time: ${avgTime.toFixed(2)} ms`);
        console.log(`Average Number of Sheets: ${avgSheets.toFixed(2)}`);
        console.log(`Average Efficiency: ${avgEfficiency.toFixed(2)}`);
        console.log('='.repeat(60) + '\n');
      });
    });
  });
}


function calculateEfficiency(sheets) {
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  sheets.forEach(sheet => {
    sheet.blocks.forEach(block => {
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
  let efficiency = (usedArea / totalArea) * 100 / sheets.length;
  return efficiency.toFixed(2);
}

// Тестовая функция для муравьиного алгоритма (ACO)
function runACOTests() {
  // Импортируйте runACO, если нужно: import { runACO } from '../Model/antColonyAlgorithm.js';
  //const blockCounts = [20, 40, 60, 80, 100];
  const blockCounts = [20, 40, 60, 80, 100];
  const antCounts = [100, 300, 500, 1000];
  //const iterationsArr = [1000, 2000, 3000, 4000];
  const iterationsArr = [1000];
  const sheetWidth = 300;
  const sheetHeight = 300;
  const repeats = 5;

  blockCounts.forEach(blockCount => {
    const blocks = getTestBlocks(blockCount);
    antCounts.forEach(antCount => {
      iterationsArr.forEach(iterations => {
        let totalTime = 0;
        let totalSheets = 0;
        let totalEfficiency = 0;
        for (let rep = 0; rep < repeats; rep++) {
          const startTime = performance.now();
          let resSheets = runACO(
            blocks, sheetWidth, sheetHeight,
            antCount, iterations, 1, 2, 0.5
          );
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          totalTime += executionTime;
          totalSheets += resSheets.length;
          totalEfficiency += parseFloat(calculateEfficiency(resSheets));
        }
        const avgTime = totalTime / repeats;
        const avgSheets = totalSheets / repeats;
        const avgEfficiency = totalEfficiency / repeats;
        console.log('='.repeat(60));
        console.log(`ACO TEST: Blocks=${blockCount}, Ants=${antCount}, Iterations=${iterations}`);
        console.log('-'.repeat(60));
        console.log(`Average Execution Time: ${avgTime.toFixed(2)} ms`);
        console.log(`Average Number of Sheets: ${avgSheets.toFixed(2)}`);
        console.log(`Average Efficiency: ${avgEfficiency.toFixed(2)}`);
        console.log('='.repeat(60) + '\n');
      });
    });
  });
}

// Тестовая функция для симуляции отжига (Simulated Annealing)
function runSimulatedAnnealingTests() {
  // Импортируйте runSimulatedAnnealing, если нужно: import { runSimulatedAnnealing } from '../Model/simulatedAnnealing.js';
  const blockCounts = [20, 40, 60, 80, 100];
  const initialTemperatures = [0.00001];
  const alpha = 0.5;
  const maxIterationsArr = [1e6, 1e7, 1e8, 1e9];
  const sheetWidth = 300;
  const sheetHeight = 300;
  const repeats = 5;
  const maxIterations = 1; // Default max iterations for Simulated Annealing

  blockCounts.forEach(blockCount => {
    const blocks = getTestBlocks(blockCount);
    initialTemperatures.forEach(initialTemperature => {
        //maxIterationsArr.forEach(maxIterations => {
          let totalTime = 0;
          let totalSheets = 0;
          let totalEfficiency = 0;
          for (let rep = 0; rep < repeats; rep++) {
            const startTime = performance.now();
            let resSheets = runSimulatedAnnealing(
              blocks, sheetWidth, sheetHeight,
              {
                initialTemperature,
                alpha,
                maxIterations
              }
            );
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            totalTime += executionTime;
            totalSheets += resSheets.length;
            totalEfficiency += parseFloat(calculateEfficiency(resSheets));
          }
          const avgTime = totalTime / repeats;
          const avgSheets = totalSheets / repeats;
          const avgEfficiency = totalEfficiency / repeats;
          console.log('='.repeat(60));
          console.log(`SA TEST: Blocks=${blockCount}, T0=${initialTemperature}, alpha=${alpha}, maxIter=${maxIterations}`);
          console.log('-'.repeat(60));
          console.log(`Average Execution Time: ${avgTime.toFixed(2)} ms`);
          console.log(`Average Number of Sheets: ${avgSheets.toFixed(2)}`);
          console.log(`Average Efficiency: ${avgEfficiency.toFixed(2)}`);
          console.log('='.repeat(60) + '\n');
        });
    //});
  });
}

// Тестовая функция для алгоритма Best Fit
function runBestFitTests() {
  const blockCounts = [20, 40, 60, 80, 100];
  const sheetWidth = 300;
  const sheetHeight = 300;
  const repeats = 5;

  blockCounts.forEach(blockCount => {
    const blocks = getTestBlocks(blockCount);
    let totalTime = 0;
    let totalSheets = 0;
    let totalEfficiency = 0;
    for (let rep = 0; rep < repeats; rep++) {
      const startTime = performance.now();
      let resSheets = BestFit.cutBlocks(blocks, sheetWidth, sheetHeight);
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      totalTime += executionTime;
      totalSheets += resSheets.length;
      totalEfficiency += parseFloat(calculateEfficiency(resSheets));
    }
    const avgTime = totalTime / repeats;
    const avgSheets = totalSheets / repeats;
    const avgEfficiency = totalEfficiency / repeats;
    console.log('='.repeat(60));
    console.log(`BEST FIT TEST: Blocks=${blockCount}`);
    console.log('-'.repeat(60));
    console.log(`Average Execution Time: ${avgTime.toFixed(2)} ms`);
    console.log(`Average Number of Sheets: ${avgSheets.toFixed(2)}`);
    console.log(`Average Efficiency: ${avgEfficiency.toFixed(2)}`);
    console.log('='.repeat(60) + '\n');
  });
}

// Тестовая функция для гибридного алгоритма (Hybrid Genetic)
function runHybridGeneticAlgorithmTests() {
  const blockCounts = [20, 40, 60, 80, 100];
  const populationSizes = [5000];
  const sheetWidth = 300;
  const sheetHeight = 300;
  const repeats = 5;
  const crossoverType = 'arithmetic'; // Используем OX кроссовер

  blockCounts.forEach(blockCount => {
    const blocks = getTestBlocks(blockCount);
    populationSizes.forEach(popSize => {
      let totalTime = 0;
      let totalSheets = 0;
      let totalEfficiency = 0;
      for (let rep = 0; rep < repeats; rep++) {
        const startTime = performance.now();
        let resSheets = runHybridGeneticAlgorithm(
          popSize, 0.01, popSize, blocks, sheetWidth, sheetHeight,  crossoverType
        );
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        totalTime += executionTime;
        totalSheets += resSheets.length;
        totalEfficiency += parseFloat(calculateEfficiency(resSheets));
      }
      const avgTime = totalTime / repeats;
      const avgSheets = totalSheets / repeats;
      const avgEfficiency = totalEfficiency / repeats;
      console.log('='.repeat(60));
      console.log(`HYBRID GENETIC TEST: Blocks=${blockCount}, Population=${popSize}`);
      console.log('-'.repeat(60));
      console.log(`Average Execution Time: ${avgTime.toFixed(2)} ms`);
      console.log(`Average Number of Sheets: ${avgSheets.toFixed(2)}`);
      console.log(`Average Efficiency: ${avgEfficiency.toFixed(2)}`);
      console.log('='.repeat(60) + '\n');
    });
  });
}

// Run the program with predefined data
// Переместите вызов runWithPredefinedData() после $(Demo.init), чтобы все window.* были уже определены
$(Demo.init);

//runSimulatedAnnealingTests();
//runACOTests();
//runGeneticAlgorithmTests();
//runBestFitTests();
//runBestFitTests();
//runHybridGeneticAlgorithmTests()

