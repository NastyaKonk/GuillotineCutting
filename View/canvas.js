var canvas = {
    reset: function(width, height) {
      Demo.el.canvas.width  = width  + 1;
      Demo.el.canvas.height = height + 1;
      Demo.el.draw.clearRect(0, 0, Demo.el.canvas.width, Demo.el.canvas.height);
    },

    rect:  function(x, y, w, h, color, num) {
      Demo.el.draw.fillStyle = color;
      Demo.el.draw.fillRect(x + 0.5, y + 0.5, w, h);
      // Центрируем номер внутри блока, обычный (не жирный) шрифт
      Demo.el.draw.fillStyle = '#222';
      Demo.el.draw.font = "13px Inter, Arial, sans-serif";
      Demo.el.draw.textAlign = "center";
      Demo.el.draw.textBaseline = "middle";
      Demo.el.draw.fillText(
        num.toString(),
        x + 0.5 + w / 2,
        y + 0.5 + h / 2
      );
    },

    stroke: function(x, y, w, h) {
      Demo.el.draw.save();
      Demo.el.draw.strokeStyle = "#90caf9";
      Demo.el.draw.lineWidth = 1;
      Demo.el.draw.strokeRect(x + 0.5, y + 0.5, w, h);
      Demo.el.draw.restore();
    },

    blocks: function(sheets, algorithm) {
        var diffSheets = 0;
        for (let i = 0; i < sheets.length; i++) {
          for (let n = 0 ; n < sheets[i].blocks.length ; n++) {
            var block = sheets[i].blocks[n];
            if (algorithm === "genetic" || algorithm === "hybrid_genetic" || algorithm === "simulated_annealing" || algorithm === "ant_colony") {            
              if (block.orientation === "vertical") {
                  canvas.rect(block.x, block.y + diffSheets, block.block.w, block.block.h, canvas.color(n), block.block.num);
                  canvas.stroke(block.x, block.y + diffSheets, block.block.w, block.block.h);
              }else{
                  canvas.rect(block.x, block.y + diffSheets, block.block.h, block.block.w, canvas.color(n), block.block.num);
                  canvas.stroke(block.x, block.y + diffSheets, block.block.h, block.block.w);
                }
            } else {
              canvas.rect(block.x, block.y + diffSheets, block.w, block.h, canvas.color(n), block.num);
              canvas.stroke(block.x, block.y + diffSheets, block.w, block.h);
            }
          }
          // Граница между листами — серая
          Demo.el.draw.save();
          Demo.el.draw.strokeStyle = "#cccccc";
          Demo.el.draw.lineWidth = 1;
          Demo.el.draw.strokeRect(0, diffSheets, parseInt(Demo.el.size_w.val()), 1);
          Demo.el.draw.restore();
          diffSheets += parseInt(Demo.el.size_h.val());
        }
        canvas.calculateEfficiency(sheets); // Calculate efficiency after drawing blocks
    },

    calculateEfficiency: function(sheets) {
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
        Demo.el.efficiency.text(`Оцінка: ${efficiency.toFixed(2)}%`);
    },

    saveToPdf: function () {
      var doc = new jsPDF();

      // Получение данных изображения в формате base64
      var imgData = Demo.el.canvas.toDataURL('image/png');

      // Получение ширины и высоты элемента <canvas>
        var canvasWidth = Demo.el.canvas.width;
        var canvasHeight = Demo.el.canvas.height;

        // Определение доступной ширины и высоты в PDF
        var availableWidth = 210;  // Здесь указываете доступную ширину в PDF
        var availableHeight = 290; // Здесь указываете доступную высоту в PDF

        // Масштабирование изображения
        var scale = Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight);
        var imageWidth = canvasWidth * scale;
        var imageHeight = canvasHeight * scale;
      
      // Добавление изображения в PDF
      doc.addImage(imgData, 'PNG', 0, 0, imageWidth, imageHeight);

      // Сохранение PDF-файла
      doc.save('canvas_image.pdf');
    },

    color: function(n) {
        var cols =["#b3e5fc"];
        return cols[n % cols.length];
      },
  };