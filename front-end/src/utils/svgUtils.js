import blobshape from "blobshape";

export function getRandomColor() {
    return "#" + Math.random().toString(16).substr(-6);
  }
  
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
export function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;       
}

export function generateShapeProps() {
    return {
      size: 250,
      growth: getRandomInt(2, 9),
      edges: getRandomInt(3, 15),
      eyes_pos: getRandomInt(1, 5)
    };
  }

  export function getRandomBlobShape() {
    var growth = getRandomInt(2, 9);
    var edges = getRandomInt(3, 15);

    if (edges + growth > 19) {
        edges = edges - 2;
        growth = growth - 2;
    }

    let path = blobshape({
        size: 250,
        growth: growth,
        edges: edges,
        seed: null
    }).path
    console.log(path);
    return path;
}

