class Grid {

    constructor(mapText) {
        this.grid = mapText.split("\n");
        this.width =  this.grid.length;
        this.height = this.grid[0].length;
        this.maxSize = 3;
    }

    get(x, y) {
        return this.grid[y][x];
    }

    isOOB(x, y, size) {
        return x < 0 || y < 0 || (x + size) > this.width || (y + size) > this.height;
    }
}
