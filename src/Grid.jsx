import React from "react";

// сетка клеток
const Grid = React.memo(({ grid, tileBorderColor }) => (
  <div>
    {grid.map((rowArr, rowIndex) => (
      <div key={rowIndex} style={{ display: "flex" }}>
        {rowArr.map((color, colIndex) => (
          <div
            className="tile"
            key={colIndex}
            style={{
              backgroundColor: color,
              borderColor: tileBorderColor,
            }}
          />
        ))}
      </div>
    ))}
  </div>
));

export default Grid;