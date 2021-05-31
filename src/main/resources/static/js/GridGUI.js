class GridGUI extends GUI {

    constructor (container, mapText) {
        // construct a GUI in the given container
        super(container);
        this.map = new Grid(mapText);
        
        // legal actions passed into the search
        this.config = {};
        this.config.actions = [ [1, 1], [-1, -1], [1, -1], [-1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]];
        this.config.actionCosts = [141, 141, 141, 141, 100, 100, 100, 100];
        this.config.tiebreak = 'lessh';
        this.config.weight = 1;
        this.config.heuristic = 'diag';

		this.pixelWidth = 768;
		this.pixelHeight = 768;
		this.sqSize = this.pixelWidth / this.map.width;
	
        this.showIterations = false;
        this.drawInfo = true;
        this.step = false;
        this.stepping = false;
        this.drawMethod = 'info';
        this.showGrid = true;
        this.animspeed = 1;
        
        // object size and maximum size, for this assignment it is 1
        this.osize = 1;
        this.maxSize = 1;
        this.mx = -1;
        this.my = -1;
        this.gx = -1;
        this.gy = -1;
        this.omx = -1;
        this.omy = -1;

        ggui = this;

        // the colors used to draw the map
        this.colors = ["#777777", "#00ff00", "#0055ff"];
        this.pathTime = 0;  // time it took to calculate the previous path

        this.setHTML();
        this.addEventListeners();
        this.setDrawMethod();
        this.drawBackground();
        this.drawGrid();
        this.setAlgorithm();
    }

    // draw the foreground, is called every 'frame'
    draw() {

        // start the draw timer
        let t0 = performance.now();
        // clear the foreground to white
        this.fg_ctx.clearRect(0, 0, this.bg.width, this.bg.height);
        // if the left mouse button is down in a valid location
        if (this.omx != -1) {
        
            if (this.showIterations) {
                if (!this.stepping) {
                    for (let a=0; a<this.animspeed; a++) { this.search.searchIteration(); }
                } else if (this.step) {
                    this.search.searchIteration();
                    this.step = false;
                }
            } else {
                let setTime = this.search.inProgress;
                let tt0 = performance.now();
                while (this.search.inProgress) { this.search.searchIteration(); }
                let tt1 = performance.now();
                if (setTime) { this.pathTime = Math.round(tt1 - tt0); this.displaySearchInfo(this.testDiv); }
            }
            
            let ix = this.omx;
            let iy = this.omy;
            
            let open = this.search.getOpen();
            // draw the remaining fringe of the BFS
            for (let i = 0; this.drawInfo && i < open.length; i++) {
                this.drawAgent(open[i][0], open[i][1], this.osize, '#ffcc00');
            }

            // draw the expanded states from the BFS
            let closed = this.search.getClosed();
            for (let i = 0; this.drawInfo && i <closed.length; i++) {
                this.drawAgent(closed[i][0], closed[i][1], this.osize, '#ff0000');
            }

            // draw the path returned by the user's algorithm
            for (let i = 0; i < this.search.path.length; i++) {
                ix += this.search.path[i][0];
                iy += this.search.path[i][1];
                this.drawAgent(ix, iy, this.osize, '#ffffff');
            }
            // draw the agent in yellow
            this.drawAgent(this.omx, this.omy, this.osize, '#ffffff');
        }

        if (this.mx != -1 && this.mouse == 3) {
			for (let x=0; x < this.map.width; x++) {
				for (let y=0; y < this.map.height; y++) {
					if (this.search.isConnected(this.mx, this.my, x, y, this.osize)) {
						this.drawAgent(x, y, 1, '#ff22ff');
					}
				}
			}
		}

        // if the mouse is on the screen, draw the current location
        if (this.mx != -1) {
            this.drawAgent(this.mx, this.my, this.osize, '#ffffff');
        }

        // if there's a search in progress, draw the goal
        // if the mouse is on the screen, draw the current location
        if (this.search.inProgress) {
            this.drawAgent(this.search.gx, this.search.gy, this.osize, '#ffffff');
        }

        this.drawGrid();

        // calculate how long the drawing took
        let t1 = performance.now();
        let ms = Math.round(t1 - t0);
        // print on screen how long the drawing and path-finding took
        //this.fg_ctx.fillStyle = "#ffffff";
        //this.fg_ctx.fillText("Mouse Pos: (" + this.mx + "," + this.my + ")", 5, this.bg.height - 53);
        //this.fg_ctx.fillText("H(n): " + (this.search.gx == -1 ? 'No Goal Selected' : this.search.estimateCost(this.mx, this.my, this.search.gx, this.search.gy)), 5, this.bg.height - 38);
        //this.fg_ctx.fillText("Compute Time: " + this.pathTime + " ms", 5, this.bg.height - 23);
        //this.fg_ctx.fillText("Path Cost: " + this.search.cost, 5, this.bg.height - 8);
    }

    drawAgent(x, y, size, color) {
        this.fg_ctx.fillStyle = color;
        for (let sx = 0; sx < size; sx++) {
            for (let sy = 0; sy < size; sy++) {
                this.fg_ctx.fillRect((x + sx) * this.sqSize, (y + sy) * this.sqSize, this.sqSize, this.sqSize);
            }
        }
    }

    drawGrid() {
        // draw horizontal lines
		if (this.showGrid) {
			this.fg_ctx.fillStyle = "#000000";
			for (let y = 0; y <= this.map.height; y++) {
				this.fg_ctx.fillRect(0, y * this.sqSize, this.fg.width, 1);
			}
			for (let x = 0; x <= this.map.width; x++) {
				this.fg_ctx.fillRect(x * this.sqSize, 0, 1, this.fg.height);
			}
		}
    }

    // draw the background map, is called once on construction
    drawBackground() {
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                this.bg_ctx.fillStyle = this.colors[this.map.get(x, y) - '0'];
                this.bg_ctx.fillRect(x * this.sqSize, y * this.sqSize, this.sqSize, this.sqSize);
            }
        }
        
    }

    drawNodeLine(node, color) {
        if (node.parent == null) { return; }
        var half = this.sqSize / 2;
        this.fg_ctx.fillStyle = color;
        ox1 = node.x * this.sqSize + half;
        oy1 = node.y * this.sqSize + half;
        ox2 = ox1 - (node.action[0] / 3) * this.sqSize;
        oy2 = oy1 - (node.action[1] / 3) * this.sqSize;
        this.drawLine(ox1, oy1, ox2, oy2, color);
    }

    drawLine(x1, y1, x2, y2, color) {
        this.fg_ctx.fillStyle = color;
        this.fg_ctx.beginPath();
        this.fg_ctx.moveTo(x1, y1);
        this.fg_ctx.lineTo(x2, y2);
        this.fg_ctx.stroke();
    }

    addEventListeners() {

        this.fg.gui = this;
        this.fg.addEventListener('mousemove', function (evt) {
            let mousePos = this.gui.getMousePos(this, evt);
            let newmx = Math.floor(mousePos.x / this.gui.sqSize);
            let newmy = Math.floor(mousePos.y / this.gui.sqSize);
            
            // if this is a new mouse position
            if (this.gui.mouse == 1) {
                this.gui.gx = this.gui.mx;
                this.gui.gy = this.gui.my;
                this.gui.startSearch();
            }
    
            this.gui.mx = newmx;
            this.gui.my = newmy;
    
        }, false);
    
        this.fg.addEventListener('mousedown', function (evt) {
            let mousePos = this.gui.getMousePos(this, evt);
            this.gui.mouse = evt.which;
    
            if (this.gui.mouse == 1) {
                if (this.gui.omx != -1 && this.gui.omx == this.gui.gx && this.gui.omy == this.gui.gy) {
                    this.gui.gx = this.gui.mx;
                    this.gui.gy = this.gui.my;
                    this.gui.startSearch();
                } else {
                    this.gui.omx = Math.floor(mousePos.x / this.gui.sqSize);
                    this.gui.omy = Math.floor(mousePos.y / this.gui.sqSize);
                    this.gui.gx = this.gui.mx;
                    this.gui.gy = this.gui.my;
                    this.gui.startSearch();
                }
            }
    
            if (this.gui.mouse == 2) {
                this.gui.osize++;
                if (this.gui.osize > this.gui.maxSize) { this.gui.osize = 1; }
            }
        }, false);
    
        this.fg.addEventListener('mouseup', function (e) {
            this.gui.mouse = -1;
            //this.omx = -1;
            //this.omy = -1;
        }, false);
    
        this.fg.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    setAnimationSpeed(value) {
        this.animspeed = parseInt(value);
    }

    setObjectSize(value) {
        this.osize = parseInt(value);
		this.startSearch();
    }

    setAStarWeight(value) {
        this.config.weight = parseFloat(value);
        this.startSearch();
    }

    setAStarTiebreak(value) {
        this.config.tiebreak = value;
        this.setAlgorithm(this.algorithm);
    }

    setHeuristic(value) {
        this.config.heuristic = value;
        this.setAlgorithm(this.algorithm);
    }

    setLegalActions(value) {
        if (value == 'card') {
            this.config.actions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            this.config.actionCosts = [100, 100, 100, 100];
        }
        if (value == 'diag') {
            this.config.actions = [ [1, 1], [-1, -1], [1, -1], [-1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]];
            this.config.actionCosts = [141, 141, 141, 141, 100, 100, 100, 100];
        }
        this.setAlgorithm(this.algorithm);
    }

    setMap(value) {
        this.map = new Grid(document.getElementById(value).value); 
        this.sqSize = this.pixelWidth / this.map.width;
        this.bg_ctx.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
        this.omx = -1;
        this.omy = -1;
        this.gx = -1;
        this.gy = -1;
        this.drawBackground();
        this.drawGrid();
        this.setAlgorithm(this.algorithm);
    }

    setAlgorithm() {
        let t0 = performance.now();
        this.pathTime = 0;
        let algorithm = document.getElementById('selectalgorithm').value;
        this.hideElements(['astartiebreak', 'astarweight']);
        document.getElementById('heuristic').disabled = true;
        if (algorithm == 'bfs') { 
            this.search = new Search_BFS(this.map, this.config); 
        } else if (algorithm == 'dfs') { 
            this.search = new Search_DFS(this.map, this.config); 
        } else if (algorithm == 'ucs') { 
            this.search = new Search_UCS(this.map, this.config); 
        } else if (algorithm == 'gbefs') { 
            this.search = new Search_GreedyBeFS(this.map, this.config); 
            document.getElementById('heuristic').disabled = false; 
        } else if (algorithm == 'astar') { 
            this.search = new Search_AStar(this.map, this.config); 
            this.showElements(['astartiebreak']);
            document.getElementById('heuristic').disabled = false; 
        } else if (algorithm == 'student') { 
            this.search = new Search_Student(this.map, this.config); 
            document.getElementById('heuristic').disabled = false; 
        } else if (algorithm == 'wastar') { 
            this.search = new Search_WAStar(this.map, this.config); 
            this.showElements(['astarweight']);
            document.getElementById('heuristic').disabled = false;
        }
        let t1 = performance.now();
        console.log("Search constructor time: ", t1-t0);
        this.startSearch();
    }

    setDrawMethod() {
        this.drawMethod = document.getElementById('drawMethodSelect').value;
        this.hideElements(['StepButton', 'AnimSpeedSelect']);
        if (this.drawMethod == 'info')      { this.showIterations = false; this.drawInfo = true; this.stepping = false;  }
        else if (this.drawMethod == 'path') { this.showIterations = false; this.drawInfo = false; this.stepping = false;  }
        else if (this.drawMethod == 'iter') { this.showIterations = true; this.drawInfo = true; this.stepping = false; this.showElements(['AnimSpeedSelect']); }
        else if (this.drawMethod == 'step') { this.showIterations = true; this.drawInfo = true; this.stepping = true; this.showElements(['StepButton']); }
    }

    displaySearchInfo(div) {
        
        var algorithms = ['astar', 'ucs', 'wastar', 'gbefs', 'bfs', 'dfs'];
        
        this.detailedSearchHTML = "<table border='1px black' width='400px'>";
        this.detailedSearchHTML += "<tr><th>Search</th><th>Start</th><th>Goal</th><th>Cost</th><th>Closed</th><th>Time</th><th>Node/s</th></tr>"
        let closed = this.search.getClosed();
        var nps = (this.pathTime == 0 || this.showIterations) ? '-' : Math.round(closed.length / this.pathTime) + ' k';
        var rowHTML = "<tr><td>" + this.search.name + "</td>";
        rowHTML += "<td>" + (this.omx == -1 ? '-' : "(" + this.omx + "," + this.omy + ")") + "</td>";
        rowHTML += "<td>" + (this.gx == -1 ? '-' : "(" + this.gx + "," + this.gy + ")") + "</td>";
        rowHTML += "<td>" + this.search.cost + "</td>";
        rowHTML += "<td>" + closed.length + "</td>";
        rowHTML += "<td>" + (this.showIterations ? '-' : this.pathTime.toFixed(4)) + "</td><td>" + nps + "</td>";
        rowHTML += "</tr>";
        this.detailedSearchHTML += rowHTML;
        this.detailedSearchHTML += "</table>"
        div.innerHTML = this.detailedSearchHTML;
    }

    startSearch() {
        this.search.startSearch(this.omx, this.omy, this.gx, this.gy, this.osize);
    }

    setHTML() {

        let top = 0;
        let skip = 35;
        this.createCanvas(this.map.width * this.sqSize + 1, this.map.height * this.sqSize + 1);
        this.controlDiv = this.create('div', 'ButtonContainer', this.fg.width + 30, 0, 600, 7*skip);
        this.testDiv = this.create('div', 'TestContainer', this.fg.width + 30, top + 7*skip + 10, 600, 100);
        testContainer = this.testDiv;
        
        // Map Selection
        this.addText(this.controlDiv, 'selectmaptext', 0, top, 150, 25, "Environment Map:");
        this.addSelectBox(this.controlDiv, 'selectmap', 150, top, 250, 25, function() { this.gui.setMap(this.value); }, 
            [['defaultmap', 'Default (64 x 64)'], ['caves', 'Sparse Caves (128 x 128)'], ['bigcaves', 'Dense Caves (256 x 256)'], 
            ['64maze', 'Small Maze (64 x 64)'], ['128maze', 'Medium Maze (128 x 128)'], ['256maze', 'Large Maze (256 x 256)'], 
            ['wheelofwar', 'StarCraft: Wheel of War (256 x 256)'], ['blankmap', 'Blank (32 x 32)'], ['lshapemap', 'L-Shape Wall (16 x 16)']]);

        // Algorithm Selection 
        this.addText(this.controlDiv, 'selectalgorithmtext', 0, top + skip, 150, 25, "Search Algorithm:");
        this.addSelectBox(this.controlDiv, 'selectalgorithm', 150, top + skip, 250, 25, function() { this.gui.setAlgorithm(); }, 
            [['student', 'A* 1'], ['astar', 'A* 2'], ['wastar', 'Weighted A*'], ['bfs', 'Breadth-First Search'],
            ['dfs', 'Depth-First Search'], ['ucs', 'Uniform Cost Search'], ['gbefs', 'Greedy Best-First Search'] ]);

        // A* Tie Break Selection
        this.addSelectBox(this.controlDiv, 'astartiebreak', 425, top + skip, 125, 25, function() { this.gui.setAStarTiebreak(this.value); }, 
            [['lessh', 'Tiebreak Min H'], ['lessg', 'Tiebreak Min G'], ['fonly', 'Select Min F Only']]);

        // A* Weight Selection 
        this.addSelectBox(this.controlDiv, 'astarweight', 425, top + skip, 125, 25, function() { this.gui.setAStarWeight(this.value); }, 
            [['1', '1x Heuristic'], ['1.1', '1.1x Heuristic'], ['1.5', '1.5x Heuristic'], ['2', '2x Heuristic'], ['4', '4x Heuristic'], ['8', '8x Heuristic']]);

        // Object Size Selection 
        this.addText(this.controlDiv, 'objectsizetext', 0, top + 2*skip, 150, 25, "Object Size:");
        this.addSelectBox(this.controlDiv, 'objectsize', 150, top + 2*skip, 250, 25, function() { this.gui.setObjectSize(this.value); }, 
            [['1', '1x1 Square'], ['2', '2x2 Square'], ['3', '3x3 Square']]);

        // Legal Action Selection 
        this.addText(this.controlDiv, 'legalactionstext', 0, top + 3*skip, 150, 25, "Legal Actions:");
        this.addSelectBox(this.controlDiv, 'legalactions', 150, top + 3*skip, 250, 25, function() { this.gui.setLegalActions(this.value); }, 
            [['diag', '8 Directions'], ['card', '4 Cardinal (Up, Down, Left, Right)']]);

        // Heuristic Selection 
        this.addText(this.controlDiv, 'heuristictext', 0, top + 4*skip, 150, 25, "Heuristic Function:");
        this.addSelectBox(this.controlDiv, 'heuristic', 150, top + 4*skip, 250, 25, function() { this.gui.setHeuristic(this.value); }, 
            [['diag', '8 Direction Manhattan'], ['card', '4 Direction Manhattan'], ['dist', '2D Euclidean Distance'], ['zero', 'Zero (No Heuristic)']]);

        // Visualization Selection
        this.addText(this.controlDiv, 'drawText', 0, top + 5*skip, 150, 25, "Visualization:");
        this.addSelectBox(this.controlDiv, 'drawMethodSelect', 150, top + 5*skip, 250, 25, function() { this.gui.setDrawMethod(); }, 
            [['info', 'Instant Path + Open/Closed'], ['path', 'Instant Path Only'], ['iter', 'Animated Search'], ['step', 'Single Step']]);

        // Animation Speed Selection
        this.addSelectBox(this.controlDiv, 'AnimSpeedSelect', 425, top + 5*skip, 125, 25, function() { this.gui.setAnimationSpeed(this.value); }, 
            [['1', '1x Speed'], ['2', '2x Speed'],['4', '4x Speed'],['8', '8x Speed'],['16', '16x Speed'],['32', '32x Speed'],]);

        // Buttons
        this.addButton(this.controlDiv, 'ToogleGrid', 425,          top, 125, 25, "Toggle Grid",         function () { this.gui.showGrid = ! this.gui.showGrid; })
        this.addButton(this.controlDiv, 'rerun',        0, top + 6*skip, 145, 25, "Rerun Previous Path", function () { this.gui.startSearch(); })
        this.addButton(this.controlDiv, 'TestButton', 150, top + 6*skip, 120, 25, "Run Tests",           function () { test = 0; randomTests = false; RunTests(); })
        this.addButton(this.controlDiv, 'TestButton', 275, top + 6*skip, 125, 25, "Random Tests",        function () { test = 0; randomTests = true; RunTests(); })
        this.addButton(this.controlDiv, 'StepButton', 425, top + 5*skip, 125, 25, "Single Step",         function () { this.gui.step = true; })

        let instructionsHTML  = "<b>Search Visualization Instructions:</b><br>";
        instructionsHTML  += "<ul>";
        instructionsHTML  += "<li><font color='#ff0000'><b>LEFT CLICK AND DRAG TO SET START AND GOAL TILE</b></font></li>";
        instructionsHTML  += "<li>Right Click a tile to see all tiles connected to that tile</li>";
        instructionsHTML  += "<li>Object can only move through same color tiles in the grid</li>";
        instructionsHTML  += "<li>Click any drop-down menu above to change the search settings</li>";
        instructionsHTML  += "<li>Choose 'Animate Search' visualization to see real-time search progress</li>";
        instructionsHTML  += "<li>Re-Run Previous - Performs previous search again (useful when animating)</li>";
        instructionsHTML  += "<li>Assignment Tests - Performs Assignment Tests</li>";
        instructionsHTML  += "<li>Random Tests - Performs Random Tests Tests</li>";
        instructionsHTML  += "</ul>";
        instructionsHTML  += "<b>Visualization Legend:</b><br>";
        instructionsHTML  += "<ul>";
        instructionsHTML  += "<li>Blue / Green / Grey Tile - Terrain type, object can move within a colour</li>";
        instructionsHTML  += "<li>Red Tile - Node is in closed list (has been expanded)</li>";
        instructionsHTML  += "<li>Orange Tile - Node is in open list (generated, but not expanded) </li>";
        instructionsHTML  += "<li>White Tile - Node is on the generated path</li>";
        instructionsHTML  += "<li>Pink Tile - Node is connected to the right-clicked tile</li>";
        instructionsHTML  += "</ul>";
        this.testDiv.innerHTML  = instructionsHTML;
    }
}

// Test-related global letiables, have to be done this way to enable real-time HTML updating during tests
let test = 0;
let startTiles = [[21, 3], [3, 33], [4, 50],  [2, 60], [4, 50],  [17,  0], [53, 43], [30, 33], [47,  0], [30, 34], 
                  [61, 14], [30, 34], [1, 1], [13, 8], [63, 58], [51, 23], [40, 30], [15, 32], [20, 10], [0,0]];
let endTiles   = [[46, 3], [3, 55], [13, 58], [28, 2], [13, 59], [60, 50], [30, 43], [54, 33], [60, 45], [55, 39], 
                  [10, 44], [55, 40], [5, 5], [63, 8], [63,  0], [51, 45], [20, 30], [18, 18], [40, 10], [63,63]];
let tableHeader = "<table rules='all' width='400px'><tr><th>Test </th><th>Start</th><th>Goal</th><th colspan=2>Solution<br>Path</th><th colspan=2>Student<br>Path</th><th colspan=2>Student<br>Connected</th></tr>";
let tableRows = "";
let tableEnd = "";
let studentPathCorrect = 0;
let studentConnectedCorrect = 0;
let solutionPathTime = 0;
let studentPathTime = 0;
let searchStudent = null;
let searchSolution = null;
let testContainer = null;
let randomTests = false;
let ggui = null;

RunTests = function() {

    if (test == 0) {
        tableRows = "";
        studentPathCorrect = 0;
        studentConnectedCorrect = 0;
        solutionPathTime = 0;
        studentPathTime = 0;
        searchStudent = new Search_Student(ggui.map, ggui.config);
        searchSolution = new Search_AStar(ggui.map, ggui.config);
    }

    if (test < startTiles.length) {
        let start = [startTiles[test][0], startTiles[test][1]];
        let end   = [endTiles[test][0], endTiles[test][1]];

        if (randomTests) {
            start[0] = Math.floor(Math.random() * ggui.map.width);
            start[1] = Math.floor(Math.random() * ggui.map.height);
            end[0] = Math.floor(Math.random() * ggui.map.width);
            end[1] = Math.floor(Math.random() * ggui.map.height);
        }

        t0 = performance.now();
        searchSolution.startSearch(start[0], start[1], end[0], end[1], ggui.osize);
        while (searchSolution.inProgress) { searchSolution.searchIteration(); }
        let solutionPath = searchSolution.path;
        t1 = performance.now();
        let solutionPathMS = Math.round(t1-t0);
        solutionPathTime += solutionPathMS;

        t0 = performance.now();
        searchStudent.startSearch(start[0], start[1], end[0], end[1], ggui.osize);
        while (searchStudent.inProgress) { searchStudent.searchIteration(); }
        let studentPath = searchStudent.path;
        t1 = performance.now();
        let studentPathMS = Math.round(t1-t0);
        studentPathTime += studentPathMS;

        let studentCon = searchStudent.isConnected(start[0], start[1], end[0], end[1], ggui.osize);
        let solutionCon = searchSolution.isConnected(start[0], start[1], end[0], end[1], ggui.osize);
        
        let pathColor = "#ff0000";
        let conColor = "#ff0000";

        if (searchStudent.cost == searchSolution.cost) {
            studentPathCorrect++;
            pathColor = "#00aa00"
        }

        if (studentCon == solutionCon) {
            studentConnectedCorrect++;
            conColor = "#00aa00"
        }

        tableRows += "<tr><td>" + (test+1) + "</td><td>(" + start[0] + "," + start[1] + ")</td><td>(" + end[0] + "," + end[1] + ")</td><td>"; 
        tableRows += searchSolution.cost +"</td><td>" + solutionPathMS + "</td>";
        tableRows += "<td><font color='" + pathColor + "'>" + searchStudent.cost + "</font></td><td>" + studentPathMS + "</td>";
        tableRows += "<td><font color='" + conColor + "'>" + (studentCon ? 'true' : 'false') + "</font></td></tr>";

        tableEnd =  "<tr><td>Total</td><td>-</td><td>-</td><td>-</td><td>" + solutionPathTime + "</td>";
        tableEnd += "<td>" + studentPathCorrect + "/" + (test+1) + "</td><td>" + studentPathTime + "</td>";
        tableEnd += "<td>" + studentConnectedCorrect + "/" + (test+1) + "</tr>";

        testContainer.innerHTML = tableHeader + tableRows + tableEnd + '</table>';
        setTimeout("RunTests();", 1);
    } 

    test++;
}
