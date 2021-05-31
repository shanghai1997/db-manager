// Search_Student.js 
// Computer Science 3200 - Assignment 2
// Author(s): 1.Xiaochuan Huang id: 201525003; 2.Hong Wang id: 201714938; 3.temporary team member: Lsmael Jimenez campos id:201955291


class MyPQueue                          // I define a priority queue class                    
{
    constructor()
    {
        this.content = [];
    }
    shift()                             // every time this method is called, the node with the least f (g + h) will be returned. Meanwhile, it will be removed from the list
    {
        if (this.content.length == 0)
        {
            return;
        }
        let minIndex = 0;
        let minH = this.content[0].h+this.content[0].g;
        for(let i=0; i<this.content.length; i++)
        {
            if (this.content[i].h+this.content[i].g < minH )
            {
                minH = this.content[i].h+this.content[i].g;
                minIndex = i;
            }
        }
        let node = this.content[minIndex];
        this.content.splice(minIndex,1);                       //learn this method from http://caibaojian.com/js-splice-element.html
        return node;
    }
    push(node)
    {
        this.content.push(node);
    }
    size()
    {
        return this.content.length;
    }
    getF(x,y)                                           // return the f value of a node with particular x and y
    {
        let index = 0;
        for (let i=0; i<this.content.length; i++)
        {
            if(x == this.content[i].x && y == this.content[i].y)
            {
                index = i;
                break;
            } 
        }
        return this.content[index].g+this.content[index].h;
    }
    remove(x,y)                                            // remove the node with particular x and y when this list already has the node
    {
        let index = 0;
        for (let i=0; i<this.content.length; i++)
        {
            if(x == this.content[i].x && y == this.content[i].y)
            {
                index = i;
                break;
            } 
        }
        this.content.splice(index,1);
    }
}

class Search_Student {

    constructor(grid, config) {
        this.config = config;       // search configuration object
                                    //   config.actions = array of legal [x, y] actions
                                    //   config.actionCosts[i] = cost of config.actions[i]
                                    //   config.heuristic = 'diag', 'card', 'dist', or 'zero'
        this.name = "Student";
        this.grid = grid;           // the grid we are using to search
        this.sx = -1;               // x location of the start state
        this.sy = -1;               // y location of the start state
        this.gx = -1;               // x location of the goal state
        this.gy = -1;               // y location of the goal state
                                    // the square side length (size) of the agent
        this.maxSize = 3;           // the maximum size of an agent

        this.inProgress = false;    // whether the search is in progress
        this.expanded = 0;          // number of nodes expanded (drawn in GUI)

        this.path = [];             // the path, if the search found one
                                    // the current open list of the search (stores Nodes)
        this.closed = [];           // the current closed list of the search
        this.cost = 'Search Not Completed'; // the cost of the path found, -1 if no path
                                    // Sorry, I have to modify the constructor
                                    // why I delete computerSec()? once a new Search_Student object is cteated, this.size is set to 1 defaultly. Even if I switch object size, it does not make sense
    }
    
    
    startSearch(sx, sy, gx, gy, size) {
        // deals with an edge-case with the GUI, leave this line here
        this.computeSectors(size);  // calling computeSectors() become a part of initiallizing
        if (sx == -1 || gx == -1) { return; }

        this.inProgress = true;     // the search is now considered started
        this.sx = sx;               // set the x,y location of the start state
        this.sy = sy;
        this.gx = gx;               // set the x,y location of the goal state
        this.gy = gy;
        this.path = [];             // set an empty path            
        this.open = new MyPQueue();
        this.closed = [];
        let h = this.estimateCost(sx,sy,gx,gy);
        this.open.push(new Node(sx,sy,null,null,0,h));
    }


    //all the equations are from http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    estimateCost(x, y, gx, gy) 
    {
        let dx = Math.abs(gx-x);
        let dy = Math.abs(gy-y);                        
        // compute and return the diagonal manhattan distance heuristic
        if (this.config.heuristic == 'diag') {
            return 100*(dx+dy)+(141-200)*Math.min(dx,dy); 
        // compute and return the 4 directional (cardinal) manhattan distance
        } 
        if (this.config.heuristic == 'card') {
            return (dx + dy) *100;
        // compute and return the 2D euclidian distance (Pythagorus)
        } 
        if (this.config.heuristic == 'dist') {
            return 100 * Math.sqrt(dx*dx+dy*dy);
        // return zero heuristic
        } 
        if (this.config.heuristic == 'zero') {
            return 0;
        }
    }

    
    canFit(x, y, size) 
    {
        if(this.grid.isOOB(x,y,size)){
            return false;
        }
        let color = this.grid.get(x,y);
        for(let i=0;i<size;i++)                   // two for loop; size1 - 1 cell; size2 - 4 cells; size3 - 9 cells
        {
            for(let j=0;j<size;j++)
            {
                if(this.grid.get(x+i,y+j)!=color || this.grid.isOOB(x+i,y+j,1)) // check each node 's color and whether they are within ranges
                {
                    return false;
                }
            }
        }
        return true;
    }

    
    isConnected(x1, y1, x2, y2, size) 
    {                                                   //girdgui row 105
        if(this.canFit(x1,y1,size) && this.canFit(x2,y2,size))      // the additional requirement for starting and goal cells.
        {
            return this.sectors[x1][y1] == this.sectors[x2][y2];
        } 
        return false;
    }

    
    isLegalAction(x, y, size, action) 
    {
        if (this.isConnected(x+action[0],y+action[1],x,y,size)&&this.isConnected(x,y+action[1],x,y,size) && this.isConnected(x+action[0],y,x,y,size)) //check whether it can go diagonally
        {
            return true;
        }
        return false;
    }
    

    computeSectors(size) 
    {
        
        this.size = size;
        this.sectors = [];
        for(let i=0; i<this.grid.width; i++)
        {
            this.sectors.push([]);
            for(let a=0; a<this.grid.height; a++)
            {
                this.sectors[i].push(0);
                
            }                                  // build an empty 2d array which is suitable for !!!!!!!!!!!!  ALL THREE  !!!!!!!!!!!!!!! 
        }                                      // SIZES instead of 1 3d array or 3 2d arrray.
        let sectorNum = 0;                      // we do not have to use a 3d or 3 2d array to accomplish this function!!!!!!!!!!!!
        for(let x=0;x<this.grid.width;x++)
        {
            for(let y=0;y<this.grid.height;y++)
            {
                if(this.sectors[x][y]!=0||!this.canFit(x,y,this.size)) 
                {
                    continue;
                }
                sectorNum++;
                this.cardBFS(x,y,sectorNum); // the first time it executes, all 0s which can be turned to 1 will be 1s
            }                                // the second time it executes, all the 0s which can be turned to 2 will be 2s
        }                                    // the third time it ...........all the 0s which can .............3 will be 3s
    }

    cardBFS(x,y,sectorNumber)       // simulate the previous assignment
    {
        this.sectors[x][y]=sectorNumber;
        let openl=[];
        openl.push([x,y]);
        let actions=[[0, 1], [1, 0], [0,-1], [-1, 0]];
        let color = this.grid.get(x,y);
        while(openl.length!=0){    
            let l=openl.shift();
            for(let i=0;i<actions.length;i++){
                if(this.grid.isOOB(l[0]+actions[i][0],l[1]+actions[i][1],this.size)){
                    continue;
                }
                else                // use the new node's sectorNum to check whether it is visited before. In this case, we do not need the closed list because visited node will be labelled in numbers. Also, check whether it can fit in the specific size is necessary
                {
                    if(color==this.grid.get(l[0]+actions[i][0],l[1]+actions[i][1])&& this.sectors[l[0]+actions[i][0]][l[1]+actions[i][1]]!=sectorNumber && this.canFit(l[0]+actions[i][0],l[1]+actions[i][1],this.size))
                    {

                        this.sectors[l[0]+actions[i][0]][l[1]+actions[i][1]]=sectorNumber;
                        openl.push([l[0]+actions[i][0],l[1]+actions[i][1]]);
                    }
                }    
            }
                
        }
    }
    
    searchIteration() 
    {    
        
        // if we've already finished the search, do nothing
        if (!this.inProgress) { return; }
        // we can do a quick check to see if the start and end goals are connected
        // if they aren't, then we can end the search before it starts
        // don't bother searching if the start and end points don't have the same type
        // this code should remain for your assignment
        if (!this.isConnected(this.sx, this.sy, this.gx, this.gy, this.size)) 
        { 
            this.inProgress = false;                // we don't need to search any more
            this.cost = -1;                         // no path was possible, so the cost is -1
            return; 
        }

        let node = null;                           // declare local variables
        let newNode = null;
        let acts = this.config.actions;
        let ng = null;
        let nh = null;
        if (this.open.length == 0)                 // if the length of open list is zero, which means there is no correct path, set 
        {                                          // this.inProgress to false and drop the potential loop
            this.inProgress = false;
            return;
        }
        node = this.open.shift();
        
        if (node.x == this.gx && node.y == this.gy)  // after finding the goal node, which means there exists a solution, we can start populating the path array
        {
            let pNode = node;            
            this.cost = pNode.g;                    // total cost is store in the attribute g of goal node
            while (pNode.parent != null) 
            {
                this.path.unshift(pNode.action);     //use unshift to add an element to the front of the list, so we do not have to reverse path
                pNode = pNode.parent;                //set node to its parent so loop continues
            } 
            this.inProgress = false;                 // when while loop end, the path is complete so we can end this session
            return;
        }
        
          
        this.closed.push([node.x,node.y]);          // in my code, it is impossible for this node to be in closed list, so I skip this step
        for (let a = 0; a < acts.length; a++)       // expand node in 8 directions
        {
            if (this.isLegalAction(node.x,node.y,this.size,acts[a])&& !this.inC(node.x+acts[a][0],node.y+acts[a][1])) //both legal and not in closed list
            {
                ng = this.config.actionCosts[a];
                nh =  this.estimateCost(node.x+acts[a][0], node.y+acts[a][1], this.gx, this.gy);
                if (this.inO(node.x+acts[a][0],node.y+acts[a][1]))                          // when there exist a node with x and y combination currently existing in open list
                {
                    if (node.g+ng+nh < this.open.getF(node.x+acts[a][0],node.y+acts[a][1]))
                    {
                        this.open.remove(node.x+acts[a][0],node.y+acts[a][1]);
                    }
                    else
                    {
                        continue
                    }
                }
                newNode = new Node(node.x+acts[a][0], node.y + acts[a][1], node, acts[a], node.g+ng, nh);
                this.open.push(newNode);   
                
            }
        }

    }

    
    getOpen() 
    {
        let arr = [];                                      // each element in this.open is node
        for (let a = 0; a < this.open.size(); a++)         // size() is an instance function in BinaryHeap
        {
            arr.push([this.open.content[a].x, this.open.content[a].y]);    // extract x and y from each node in open list and push [x,y] into the arr one by one
        }
        return arr;                                           // return a 2D array 
    }

    

    getClosed() 
    {
        return this.closed;
    }

    inC(x,y)
    {
        for (let i = 0; i < this.closed.length; i++)
        {                                               //check if it already appeared in this.closed. If so, return true

            let a = this.closed[i][0];
            let b = this.closed[i][1];

            if(a == x && b == y)
            {
                return true;
            }
        }
        return false;
    }

    inO(x,y)
    {
        for (let i = 0; i < this.open.size(); i++)
        {                                               //check if it already appeared in this.open. If so, return true
            let a = this.open.content[i].x;
            let b = this.open.content[i].y;

            if(a == x && b == y)
            {
                return true;
            }
        }
        return false;
    }
    
    inOorC(x,y)
    {
        for (let i = 0; i < this.closed.length; i++)
        {                                               //check if it already appeared in this.closed. If so, return true

            let a = this.closed[i][0];
            let b = this.closed[i][1];

            if(a == x && b == y)
            {
                return true;
            }
        }
        

        for (let i = 0; i < this.open.size(); i++)
        {                                               //check if it already appeared in this.open. If so, return true
            let a = this.open.content[i].x;
            let b = this.open.content[i].y;

            if(a == x && b == y)
            {
                return true;
            }
        }
        return false;                                   // neither in open nor in closed
    }
}



class Node {
    constructor(x, y, parent, action, g, h) {
        this.x = x;
        this.y = y;
        this.action = action;
        this.parent = parent;
        this.g = g;
        this.h = h;
    }
}
