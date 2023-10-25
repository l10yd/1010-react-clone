import React, { useState, useEffect } from "react";
import "./App.css";
import Grid from "./Grid";

//фигуры, массивы состоят из позиций клеток
const shapes = [
  [[0, 0], [0, 1], [0, 2]], // 3-horizontal line
  [[0, 0], [1, 0], [2, 0]], // 3-vertical line
  [[0, 0], [0, 1], [0, 2], [0, 3]], // 4-horizontal line
  [[0, 0], [1, 0], [2, 0], [3, 0]], // 4-vertical line
  [[0, 0], [0, 1], [1, 0]], // small Г-shape
  [[0, 0], [0, 1], [1, 1]], // small -Г-shape
  [[1, 0], [0, 1], [1, 1]], // small -L-shape
  [[0, 0], [1, 0], [1, 1]], // small L-shape
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], //big L-shape
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], //big L-shape 90deg
  [[0, 2], [1, 2], [2, 2], [2, 1], [2, 0]], //big L-shape 180deg
  [[2, 2], [2, 1], [2, 0], [1, 0], [0, 0]], //big L-shape 270deg
  [[0, 0]], // 1-square
  [[0, 0], [0, 1], [1, 0], [1, 1]], // 2-square
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], //3-square
];

//цветовые темы для клеток и фона
const themes = {
  light: {
    colors: {
      red: "red",
      orange: "orange",
      yellow: "yellow",
      green: "green",
      blue: "blue",
      indigo: "indigo",
      violet: "violet",
    },
    background: "#f0f0f0",
    tileborder: "#ccc",
  },
  dark: {
    colors: {
      red: "#ff5733",
      orange: "#ffa600",
      yellow: "#ffd700",
      green: "#57ff33",
      blue: "#3364ff",
      indigo: "#8333ff",
      violet: "#ff33ff",
    },
    background: "#222",
    tileborder: "black",
  },
  neon: {
    colors: {
      red: "#FF00FF",
      orange: "#FF00CC",
      yellow: "#9900FF",
      green: "#CC00FF",
      blue: "#9D00FF",
      indigo: "#CC00FF",
      violet: "#6E0DD0",
    },
    background: "#000000",
    tileborder: "#222",
  },
};

function App() {
  //стейт хуки из переменной и сеттера
  const [isDragging, setIsDragging] = useState(false);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [selectedShapeColor, setSelectedShapeColor] = useState(null);
  const [shapePosition, setShapePosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState(Array(10).fill(Array(10).fill(null)));
  const [hiddenCells, setHiddenCells] = useState(Array(10).fill(Array(10).fill(false)));
  const [randomShapes, setRandomShapes] = useState([]);
  const [newShapesInitialPosition, setNewShapesInitialPosition] = useState({ x: -90, y: 550 });
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [isClearingGrid, setIsClearingGrid] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
  const [tileBorderColor, setTileBorderColor] = useState("#ccc");

  //таймер для курсора мыши при наведении на фигуру
  let leaveTimeout = 0;

  //сработает только 1 раз ([]) при старте приложения
  //загружает score, maxScore, игровое поле, фигуры (создает их, если 1 раз), тему (светлая по дефолту)
  useEffect(() => {
    const savedScore = parseInt(localStorage.getItem('score'), 10);
    const savedMaxScore = parseInt(localStorage.getItem('maxScore'), 10);
    const savedTheme = localStorage.getItem('theme');
    const savedGrid = JSON.parse(localStorage.getItem('grid'));
    const savedRandomShapes = JSON.parse(localStorage.getItem('randomShapes'));

    setScore(savedScore || 0);
    setMaxScore(savedMaxScore || 0);
    setCurrentTheme(savedTheme || 'light');
    setGrid(savedGrid || Array(10).fill(Array(10).fill(null)));
    setRandomShapes(savedRandomShapes || []);

    if (savedTheme) {
      document.body.style.backgroundColor = themes[savedTheme].background;
      setTileBorderColor(themes[savedTheme].tileborder);
    }
    else {
      setCurrentTheme('light');
    }

    if (!savedRandomShapes) {
      generateRandomShapes();
    }
  }, []);

  //случайный цвет, вызывается при генерации 3х рандомных фигур  
  const getRandomColor = () => {

    const colors = themes[currentTheme].colors;
    const colorNames = Object.keys(colors);

    const randomIndex = Math.floor(Math.random() * colorNames.length);
    return colors[colorNames[randomIndex]];
  };

  //ищет ключ цвета по его значению в объекте themes
  const getColorKey = (color) => {
    for (const theme in themes) {
      for (const key in themes[theme].colors) {
        if (themes[theme].colors[key] === color) {
          return key;
        }
      }
    }
    return null;
  };

  // Функция для смены темы
  const toggleTheme = () => {
    //выбирает следующую по индексу тему
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const newTheme = themeKeys[(currentIndex + 1) % themeKeys.length];
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Обновляет цвета фигур
    const updatedRandomShapes = randomShapes.map((shapeData) => {
      return {
        ...shapeData,
        color: themes[newTheme].colors[getColorKey(shapeData.color)],
      };
    });
    setRandomShapes(updatedRandomShapes);
    localStorage.setItem('randomShapes', JSON.stringify(updatedRandomShapes));

    //обновляет сетку
    const updatedGrid = grid.map((row) => row.map((color) => {
      return color !== null ? themes[newTheme].colors[getColorKey(color)] : null;
    }));
    setTileBorderColor(themes[newTheme].tileborder);
    setGrid(updatedGrid);
    localStorage.setItem('grid', JSON.stringify(updatedGrid));

    //обновляет цвет фона
    document.body.style.backgroundColor = themes[newTheme].background;

  };


  //обновляет Score на текущий, если вызывается без аргумента - сбрасывает на 0
  const updateScore = (value) => {
    const newScore = (value === undefined ? 0 : score + value);
    setScore(newScore);
    localStorage.setItem('score', newScore);
    if (value !== undefined && score + value >= maxScore) {
      setMaxScore(score + value);
      localStorage.setItem('maxScore', score + value);
    }
  };

  // gameover, Clear the grid and generate new shapes
  const gameReset = async () => {
    setIsClearingGrid(true);
    await clearGrid(grid);
    setIsClearingGrid(false);
    updateScore();
    generateRandomShapes();
    localStorage.setItem('grid', JSON.stringify(grid));
  }

  //проверяет, можно ли разместить фигуру где-то на игровом поле (для геймовера)
  //используется в handleMouseUp
  const canPlaceShapeOnGrid = (shape, grid) => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const validPlacement = shape.every(([dx, dy]) => {
          const newRow = row + dx;
          const newCol = col + dy;
          return newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && grid[newRow][newCol] === null;
        });

        if (validPlacement) {
          return true;
        }
      }
    }
    return false;
  };

  //создает 3 случайные фигуры и добавляет их в массив randomShapes
  const generateRandomShapes = async () => {
    const newRandomShapes = Array(3)
      .fill(null)
      .map((_, index) => {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        //cчитаем длину и высоту фигуры лол
        //вообще они должны быть в массиве фигур shapes, но нет
        //надо переделать shapes в коллекцию
        const calculateShapeSize = (shape) => shape.reduce((max, [dx, dy]) => [Math.max(max[0], dx), Math.max(max[1], dy)], [-Infinity, -Infinity]).map((val) => val + 1);
        const [lengthY, lengthX] = calculateShapeSize(shape);

        let x = newShapesInitialPosition.x + (250 - lengthX * 50) / 2 + index * 250;
        let y = newShapesInitialPosition.y + (250 - lengthY * 50) / 2;

        return {
          shape,
          color: getRandomColor(),
          placed: false,
          position: { x, y },
        };
      });
    setRandomShapes(newRandomShapes);
    localStorage.setItem('randomShapes', JSON.stringify(newRandomShapes));
    //редкое событие, когда ни одну из 3х фигур нельзя поставить сразу после генерации
    if (newRandomShapes.every((shapeData) => !canPlaceShapeOnGrid(shapeData.shape, grid))) {
      gameReset();
    }
  };

  //проверяет строки и столбцы, в которых есть по 10 заполенных клеток, сразу их очищает
  //и возвращает количество ощиченных строк и столбцов
  const checkAndClearRowsAndColumns = async (newGrid) => {
    const rowsToClear = new Array(10).fill(true);
    const columnsToClear = new Array(10).fill(true);

    // Проверка строк и столбцов, которые нужно очистить
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (newGrid[row][col] === null) {
          rowsToClear[row] = false;
          columnsToClear[col] = false;
        }
      }
    }

    const clearedRowsPromises = [];
    const clearedColumnsPromises = [];

    for (let row = 0; row < 10; row++) {
      if (rowsToClear[row]) {
        clearedRowsPromises.push(clearRow(newGrid, row, 25));
      }
    }

    for (let col = 0; col < 10; col++) {
      if (columnsToClear[col]) {
        clearedColumnsPromises.push(clearColumn(newGrid, col, 25));
      }
    }

    // ждем выполнения очистки всех строк и столбцов 
    await Promise.all([...clearedRowsPromises, ...clearedColumnsPromises]);

    const clearedRowsAndColumns = { rows: [], columns: [] };

    for (let row = 0; row < 10; row++) {
      if (rowsToClear[row]) {
        clearedRowsAndColumns.rows.push(row);
      }
    }

    for (let col = 0; col < 10; col++) {
      if (columnsToClear[col]) {
        clearedRowsAndColumns.columns.push(col);
      }
    }

    return clearedRowsAndColumns;
  };

  //очищает все полученное поле целиком
  const clearGrid = async (grid) => {
    const clearColumnPromises = [];
    // все столбцы сверху вниз одновременно
    for (let i = 0; i < 10; i++) {
      clearColumnPromises.push(clearColumn(grid, i, 100));
    }
    //ждем очистки всех столбцов
    await Promise.all([...clearColumnPromises]);
  };

  //очистка строки
  const clearRow = async (grid, row, time) => {
    for (let col = 0; col < 10; col++) {
      if (grid[row][col] !== null) {
        grid[row][col] = null;
        setGrid([...grid]);
        await sleep(time); // Подождать перед удалением следующей клетки
      }
    }
  };

  //очистка столбца
  const clearColumn = async (grid, col, time) => {
    for (let row = 0; row < 10; row++) {
      if (grid[row][col] !== null) {
        grid[row][col] = null;
        setGrid([...grid]);
        await sleep(time);
      }
    }
  };

  //вспомогательный для таймаутов на promise
  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  //обработчик зажатой мыши (любая клавиша лол)
  const handleMouseDown = (e, dx, dy, index, color) => {
    if (isClearingGrid) return; // Блокировка действий пользователя во время очистки поля
    e.preventDefault();
    setIsDragging(true);
    setSelectedShapeIndex(index);
    setSelectedShapeColor(color);
    // устанавливаем начальную позицию фигуры и смещение точки клика относительно начальной позиции
    const initialPosition = randomShapes[index].position;
    setShapePosition({ x: initialPosition.x, y: initialPosition.y });
    setDragOffset({
      x: e.clientX - initialPosition.x || e.touches[0].clientX - dragOffset.x,
      y: e.clientY - initialPosition.y || e.touches[0].clientY - dragOffset.y,
    });
  };

  //обработчик отпущенной после зажатия ЛКМ
  const handleMouseUp = async () => {
    if (isDragging && selectedShapeColor) {
      setIsDragging(false);

      const { x, y } = shapePosition;
      const row = Math.floor(y / 50);
      const col = Math.floor(x / 50);

      // проверяет, можно ли поставить фигуру на выбранное место, возвращает bool
      const shape = randomShapes[selectedShapeIndex].shape;
      const validPlacement = shape.every(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        return newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length && grid[newRow][newCol] === null;
      });

      //если можно, то заполняет клетки цветом фигуры
      if (validPlacement) {
        const newGrid = grid.map((rowArr, rowIndex) => {
          return rowArr.map((cell, colIndex) => {
            if (shape.some(([dx, dy]) => rowIndex === row + dx && colIndex === col + dy)) {
              return selectedShapeColor;
            }
            return cell;
          });
        });

        // Удаление размещенной фигуры из randomShapes
        const updatedShapes = [...randomShapes];
        updatedShapes.splice(selectedShapeIndex, 1);
        setRandomShapes(updatedShapes);
        localStorage.setItem('randomShapes', JSON.stringify(updatedShapes));

        //сброс фигуры
        setSelectedShapeIndex(null);
        setSelectedShapeColor(null);

        // Опустошение полностью заполненных строк и столбцов
        const clearedRowsAndColumns = await checkAndClearRowsAndColumns(newGrid);
        // а также возвращает количество очищенных 
        const cleared = clearedRowsAndColumns.rows.length + clearedRowsAndColumns.columns.length;

        setGrid(newGrid);
        localStorage.setItem('grid', JSON.stringify(newGrid));
        updateScore(shape.length * 10 + cleared * 100);

        // Генерация новых фигур, если все фигуры размещены
        if (updatedShapes.length === 0) {
          generateRandomShapes();
        }

        //проверка на геймовер
        if (updatedShapes.every((shapeData) => !canPlaceShapeOnGrid(shapeData.shape, newGrid)) && updatedShapes.length !== 0) {
          gameReset();
        }
      }

      //сброс фигуры
      setSelectedShapeIndex(null);
      setSelectedShapeColor(null);
    }
  };

  //обработчик движения мыши
  const handleMouseMove = (e) => {
    if (isDragging && selectedShapeColor) {
      const { clientX, clientY } = e;
      /*setShapePosition({ x: clientX - dragOffset.x || e.touches[0].clientX - dragOffset.x, 
                        y: clientY - dragOffset.y || e.touches[0].clientY - dragOffset.y});}*/
      setShapePosition({ x: clientX - dragOffset.x, y: clientY - dragOffset.y });
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(leaveTimeout); // Очистить таймер, чтобы отменить возврат
  };

  const handleMouseLeave = () => {
    // Поставить фигуру в начальное положение после короткой задержки
    leaveTimeout = setTimeout(() => {
      setSelectedShapeIndex(null);
      setSelectedShapeColor(null);
      setIsDragging(false);
    }, 100);
  };

  return (
    <div className="App"
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    /*onTouchUp={handleMouseUp}
    onTouchMove={handleMouseMove}*/
    >

      <div className="scoreboard">
        <span>
          Score: {score} Best: {maxScore}
        </span>
      </div>

      <div>
        <button className="reset-button" onClick={gameReset}>
          Reset
        </button>
      </div>

      <div>
        <button className="theme-button" onClick={toggleTheme}>
          Theme
        </button>
      </div>

      {/* рендер сетки клеток */}      
      <Grid grid={grid} tileBorderColor={tileBorderColor} />

      {/* рендер 3х случайных фигур */}
      {randomShapes.map((shapeColor, shapeIndex) =>
        shapeColor.shape.map(([dx, dy], index) => (
          <div
            className="shape-block"
            key={`${shapeIndex}-${index}`}
            style={{
              backgroundColor: shapeColor.color,
              borderColor: tileBorderColor,
              top: shapeIndex === selectedShapeIndex ? shapePosition.y - 25 + dx * 52 : shapeColor.position.y - 25 + dx * 52,
              left: shapeIndex === selectedShapeIndex ? shapePosition.x - 25 + dy * 52 : shapeColor.position.x - 25 + dy * 52,
              cursor: isDragging && selectedShapeIndex === shapeIndex ? "grabbing" : "grab",
            }}
            draggable="true"
            onMouseDown={(e) => handleMouseDown(e, dx * 50, dy * 50, shapeIndex, shapeColor.color)}
          /*onTouchDown={(e) => handleMouseDown(e, dx * 50, dy * 50, shapeIndex, shapeColor.color)}*/
          />
        ))
      )}
    </div>
  );
}

export default App;
