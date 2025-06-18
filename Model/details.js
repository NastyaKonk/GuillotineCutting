var details = {
    list: [],

    add_block: function() {
      var result = [];
      if((parseInt(Demo.el.block_w.val()) <= parseInt(Demo.el.size_w.val()) && parseInt(Demo.el.block_h.val()) <= (Demo.el.size_h.val())) || (parseInt(Demo.el.block_h.val()) <= parseInt(Demo.el.size_w.val()) && parseInt(Demo.el.block_w.val()) <= (Demo.el.size_h.val()))){
        result.push( new Block(parseInt(Demo.el.block_w.val()), parseInt(Demo.el.block_h.val()), parseInt(Demo.el.block_n.val()),));
      }

      for (i = 0 ; i < result.length ; i++) {
        for (j = 0 ; j < result[i].num ; j++) {
          var newNum;
          if (details.list.length == 0) {
            newNum = 1;
          } else {
            newNum =  details.list[details.list.length - 1].num + 1;
          }
          //details.list.push({num: newNum, w: result[i].w, h: result[i].h, area: result[i].w * result[i].h});  
          details.list.push(new Block(result[i].w, result[i].h, newNum));
        }
      }
      Demo.run();
    },

    edit_block: function(){
      var result = [];
      let exist = false;
      //let newEl = {num: Demo.el.edit_block_n.val(), w: Demo.el.edit_block_w.val(), h: Demo.el.edit_block_h.val(), area: Demo.el.edit_block_w.val() * Demo.el.edit_block_h.val()}
      let newEl = new Block(parseInt(Demo.el.edit_block_w.val()), parseInt(Demo.el.edit_block_h.val()), parseInt(Demo.el.edit_block_n.val()));

      for(const item of details.list)
      {
        if(item.num == newEl.num)
        {
          item.w = newEl.w;
          item.h = newEl.h;
          exist = true;
        }
      }

      if(!exist && !(newEl.num > details.list.length)){
        details.list.splice(newEl.num-1, 0, newEl)
      }

      Demo.run();
    },

    del_block: function(id) {
      var newArray = details.list.filter(el => el.num != id);
      details.list.length = 0;
      newArray.forEach(element => {
        details.list.push(element);
      });
      Demo.run();
    },
        
    print_det: function() {
      var det = document.getElementById("details");
      det.innerHTML = '';
      details.list.forEach(element => {
        // Создаем элемент кнопки
        var closeButton = document.createElement('button');
        // Устанавливаем идентификатор
        closeButton.className = 'delButton';
        closeButton.id = element.num;
        // Устанавливаем текст кнопки (в данном случае символ "X")
        closeButton.innerText = 'X';

        // Добавляем обработчик события клика
        closeButton.addEventListener('click', function() {
          details.del_block(closeButton.id);
        });
    
        // Создаем текстовый узел с содержимым, которое нужно добавить после кнопки
        var textNode = document.createTextNode(element.num + ". " + element.w + " x " + element.h);
    
        // Создаем контейнерный элемент, чтобы поместить кнопку и текстовый узел вместе
        var container = document.createElement('div');
        // Добавляем текстовый узел в контейнер
        container.append(textNode);
        // Добавляем кнопку в контейнер
        container.append(closeButton);
    
        // Добавляем контейнер с кнопкой и текстом в детали
        Demo.el.details.append(container);
      });  
    },
    //   // Get blocks from Demo.blocks.list and create new blocks
    // var blocks = details.list.slice(0);
    //   var newMass = [];
    //   for (let i = 0; i < blocks.length; i++) {
    //     const block = blocks[i];
    //     var newBlock = new Block(block.w, block.h, block.num); 
    //     newMass.push(newBlock);
    //   }
    //   return newMass;
    // },

    populateDropdownList: function(element, values) {
      var dropdownList = document.getElementById(element).nextElementSibling;
    
      // Clearing the list before filling
      dropdownList.innerHTML = '';
    
      // Populate the list with values
      values.forEach(function(value) {
        var listItem = document.createElement('li');
        listItem.textContent = value;
        dropdownList.appendChild(listItem);
      });
    
      if(dropdownList.style.display === "block"){
        dropdownList.style.display = "none";
      }else{
        dropdownList.style.display = "block";
      }
    
      // List item click handler
      dropdownList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
          var selectedValue = event.target.textContent;
          document.getElementById(element).value = selectedValue;
          dropdownList.style.display = "none";
          Demo.run();
        }
      });
    },

    saveValuesToLocalStorage: function(name) {
    
      // Limiting the number of stored values
      var maxValues = 4;
  
      switch (name) {
        case 'block_h':
          var block_h = Demo.el.block_h.val();
  
          // Get previous values from local storage
          var savedH = localStorage.getItem('block_h') || '';
  
          // Adding the current values to the array of previous values
          var valuesH = savedH.split(',');
          valuesH.unshift(block_h);
  
          if (valuesH.length > maxValues) {
            valuesH = valuesH.slice(0, maxValues);
          }
          // Saving arrays of values to local storage
          localStorage.setItem('block_h', valuesH.join(','));
  
          break;
        case 'block_w':
          var block_w = Demo.el.block_w.val();
  
          var savedW = localStorage.getItem('block_w') || '';
  
          var valuesW = savedW.split(',');
          valuesW.unshift(block_w);
  
          if (valuesW.length > maxValues) {
            valuesW = valuesW.slice(0, maxValues);
          }
  
          localStorage.setItem('block_w', valuesW.join(','));
  
          break;
        case 'block_n':
          var block_n = Demo.el.block_n.val();
  
          var savedN = localStorage.getItem('block_n') || '';
  
          var valuesN = savedN.split(',');
          valuesN.unshift(block_n);
          if (valuesN.length > maxValues) {
            valuesN = valuesN.slice(0, maxValues);
          }
  
          localStorage.setItem('block_n', valuesN.join(','));
  
          break;
        case 'size_h':
          var size_h = Demo.el.size_h.val();
  
          var savedSH = localStorage.getItem('size_h') || '';
  
          var valuesSH = savedSH.split(',');
          valuesSH.unshift(size_h);
  
          if (valuesSH.length > maxValues) {
            valuesSH = valuesSH.slice(0, maxValues);
          }
          localStorage.setItem('size_h', valuesSH.join(','));
  
          break;
        case 'size_w':
          var size_w = Demo.el.size_w.val();
  
          var savedSW = localStorage.getItem('size_w') || '';
          var valuesSW = savedSW.split(',');
          valuesSW.unshift(size_w);
  
          if (valuesSW.length > maxValues) {
            valuesSW = valuesSW.slice(0, maxValues);
          }
  
          localStorage.setItem('size_w', valuesSW.join(','));
  
          break;
      }
    },

    report: function(sheets, blocks, w, h ) {
      var fit = 0, block, n, len = blocks.length;
      for (n = 0 ; n < len ; n++) {
         block = blocks[n];
           fit += block.area;
      }
      Demo.el.ratio.text(Math.round(100 * fit / (w * h)));
      Demo.el.numSheets.html(("Кількість листів: " + sheets + " шт"));
    },
  };