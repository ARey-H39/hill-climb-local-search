import State from "./State.js";

export default function app(images) {
    let states = [];
    let statesImages = [];
    let pages = [];
    let currentPage = 0;

    function main() {
        localSearch(8);
        
        createStatePages();

        pages[currentPage].init();
        updateCurrentState(0);

        const prevBtn = document.querySelector('.previous-state-btn');

        const nextBtn = document.querySelector('.next-state-btn');

        prevBtn.addEventListener('click', prevPage);
        nextBtn.addEventListener('click', nextPage);

        console.log(statesImages);
    }

    function buildBoard(queensArray) {
        const TILE_SIZE = 125;
        const QUEENS_SIZE = queensArray.length;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = TILE_SIZE * QUEENS_SIZE;
        canvas.height = TILE_SIZE * QUEENS_SIZE;

        const [dark_tile, light_tile, queen] = images;

        for (let y = 0; y < QUEENS_SIZE; y++) {
            if (y % 2 != 0) {
                for (let x = 0; x < QUEENS_SIZE; x++) {
                    if (x % 2 != 0) 
                        context.drawImage(light_tile, x * TILE_SIZE, y * TILE_SIZE);
                    else
                        context.drawImage(dark_tile, x * TILE_SIZE, y * TILE_SIZE);
                }
            } else {
                for (let x = 0; x < QUEENS_SIZE; x++) {
                    if (x % 2 != 0) 
                        context.drawImage(dark_tile, x * TILE_SIZE, y * TILE_SIZE);
                    else
                        context.drawImage(light_tile, x * TILE_SIZE, y * TILE_SIZE);
                }
            }

            for (let x = 0; x < QUEENS_SIZE; x++) {
                if (x == queensArray[y]) context.drawImage(queen, (x * TILE_SIZE), y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        return canvas.toDataURL();
    }

    function localSearch(size) {
        let current = new State({size: size});
        let end = false;
        
        let count = 0;

        while (!end) {
            let neighbors = current.generateNeigbors();
            let bestNeighbor = neighbors[0];

            states.push({
                current: current.queens,
                currentCollisions: current.findCollisions(),
                neighbors: [],
                neighborsCollisions: [],
                bestNeighbor: null,
                bestNeighborCollisions: null,
                bestNeighborIndex: null
            });

            let neighborCount = 0;
            let bestNeighborIndex = 0;
            for (let neighbor of neighbors) {
                if (neighbor.findCollisions() < bestNeighbor.findCollisions()) {
                    bestNeighbor = neighbor;
                    bestNeighborIndex = neighborCount;
                }
                states[count].neighbors.push(neighbor.queens);
                states[count].neighborsCollisions.push(neighbor.findCollisions());
                neighborCount++;
            }

            states[count].bestNeighbor = bestNeighbor.queens;
            states[count].bestNeighborCollisions = bestNeighbor.findCollisions();
            states[count].bestNeighborIndex = bestNeighborIndex;
            console.log(bestNeighbor);

            if (bestNeighbor.findCollisions() < current.findCollisions()) current = bestNeighbor;
            else end = true;

            count++;
        }

        console.log(states);
    }

    function generateStatePage(stateNumber) {
        function setCurrentStateImage() {
            const currentStateContainer = document.querySelector('.current-state-container');

            currentStateContainer.innerHTML = '';
            const currentStateImage = new Image();
            currentStateImage.src = buildBoard(states[stateNumber].current);
            currentStateContainer.append(currentStateImage);
        }

        function setCurrentStateText() {
            const currentStateCounter = document.querySelector('.current-state-label');
            currentStateCounter.innerHTML = 'Current State: ' + stateNumber;
        }

        function setCurrentStateCollisions() {
            const currentStateCollisions = document.querySelector('.current-state-collisions');
            currentStateCollisions.innerHTML = 'Collisions: ' + states[stateNumber].currentCollisions;
        }

        function setSolutionStatus() {
            const solutionStatusContainer = document.querySelector('.solution-status');
            
            if (states[states.length - 1].currentCollisions == 0) {
                solutionStatusContainer.innerHTML = 'A Solution Found!';
                solutionStatusContainer.dataset.status = 'true';
            } else {
                solutionStatusContainer.innerHTML = 'No Solution Found';
                solutionStatusContainer.dataset.status = 'false';
            }
        }

        function setPathStates() {
            const pathStateContainer = document.querySelector('.path-container');

            pathStateContainer.innerHTML = '';

            let stateCount = 0;
            for (let state of states) {
                const stateElement = document.createElement('div');
                stateElement.classList.add("path-state-container");
                stateElement.setAttribute('data-state-id', stateCount);
                
                const stateNumberElement = document.createElement('div');
                stateNumberElement.classList.add('path-state-number');

                const stateContentElement = document.createElement('div');
                stateContentElement.classList.add('path-state');
                
                const stateCollisionsElement = document.createElement('div');
                stateCollisionsElement.classList.add('path-state-collisions')

                stateNumberElement.innerText = stateCount;
                stateContentElement.innerText = state.current.join(', ');
                stateCollisionsElement.innerText = state.currentCollisions;

                stateElement.append(stateNumberElement, stateContentElement, stateCollisionsElement);

                stateElement.addEventListener('click', swapState);

                pathStateContainer.appendChild(stateElement);

                stateCount += 1;
            }
        }

        function setNeighbors() {
            const neighborsContainer = document.querySelector('.neighbors-container');

            neighborsContainer.innerHTML = '';

            let neighborCount = 0;

            for (let neighbor of states[stateNumber].neighbors) {
                const neighborElement = document.createElement('div');
                neighborElement.classList.add('neighbor-state');

                const neighborIdElement = document.createElement('div');
                neighborIdElement.classList.add('neighbor-id');

                const neighborArrayElement = document.createElement('div');
                neighborArrayElement.classList.add('neighbor-array');

                const neighborCollisionsElement = document.createElement('div');
                neighborCollisionsElement.classList.add('neighbor-collisions');

                neighborIdElement.innerText = neighborCount;
                neighborArrayElement.innerText = states[stateNumber].neighbors[neighborCount].join(', ');
                neighborCollisionsElement.innerText = "Collisions: " + states[stateNumber].neighborsCollisions[neighborCount];
                
                if (states[stateNumber].neighborsCollisions[neighborCount] > states[stateNumber].currentCollisions)
                    neighborElement.classList.add('reject');

                if (states[stateNumber].neighborsCollisions[neighborCount] < states[stateNumber].currentCollisions)
                    neighborElement.classList.add('accept');

                neighborElement.append(neighborIdElement, neighborArrayElement, neighborCollisionsElement);
                neighborElement.dataset.id = neighborCount;

                neighborElement.addEventListener('click', changeNeighborView)

                neighborsContainer.appendChild(neighborElement);

                neighborCount++;
            }
        }

        function changeNeighborView(e) {
            function getStateId(e) {
                if (e.classList.contains('neighbor-state'))
                    return e.dataset.id;
                else
                    return getStateId(e.parentNode);
            }

            console.log(e.target.classList);
    
            let stateId = getStateId(e.target);

            const neighborContainer = document.querySelector(".neighbor-container");

            const neighborImage = new Image();
            neighborImage.src = buildBoard(states[stateNumber].neighbors[stateId]);

            neighborContainer.innerHTML = '';
            neighborContainer.appendChild(neighborImage);
        }

        function setBestNeighborState() {
            const bestNeighborStateContainer = document.querySelector('.best-neighbor-board');
            const bestNeighborStateIdContainer = document.querySelector('.best-neighbor-id');
            const bestNeighborArrayContainer = document.querySelector('.best-neighbor-array');
            const bestNeighborCollisionsContainer = document.querySelector('.best-neighbor-collisions');
            const bestNeighborStatusContainer = document.querySelector('.best-neighbor-status');
                    
            bestNeighborStateContainer.innerHTML = '';
            const neighborImage = new Image();
            neighborImage.src = buildBoard(states[stateNumber].bestNeighbor);
            bestNeighborStateContainer.appendChild(neighborImage);

            bestNeighborStateIdContainer.innerHTML = `Neighbor: ${states[stateNumber].bestNeighborIndex}`;
            bestNeighborArrayContainer.innerHTML = states[stateNumber].bestNeighbor.join(', ');
            bestNeighborCollisionsContainer.innerHTML = "Collisions: " + states[stateNumber].bestNeighborCollisions;
            
            if (states[stateNumber].bestNeighborCollisions < states[stateNumber].currentCollisions) {
                bestNeighborStatusContainer.innerHTML = 'Accepted';
                bestNeighborStatusContainer.dataset.status = 'accept';
            } else {
                bestNeighborStatusContainer.innerHTML = 'Rejected';
                bestNeighborStatusContainer.dataset.status = 'reject';
            }
        
        }

        function setNeighborView() {
            const neighborContainer = document.querySelector(".neighbor-container");

            const neighborImage = new Image();
            neighborImage.src = buildBoard(states[stateNumber].neighbors[0]);

            neighborContainer.innerHTML = '';
            neighborContainer.appendChild(neighborImage);
        }

        function init() {
            setCurrentStateImage();
            setCurrentStateText();
            setCurrentStateCollisions();
            setSolutionStatus();
            setPathStates();
            setNeighbors();
            setBestNeighborState();
            setNeighborView();
        }

        return {
            init
        }
    }

    function createStatePages() {
        let stateNumber = 0;
        for (let state of states) {
            pages.push(generateStatePage(stateNumber));
            stateNumber++;
        }
    }

    function prevPage() {
        if (pages[currentPage - 1]) {
            currentPage = currentPage - 1;
            pages[currentPage].init();
            updateCurrentState(currentPage + 1);
        }
    }

    function nextPage() {
        if (pages[currentPage + 1]) {
            currentPage = currentPage + 1;
            pages[currentPage].init();
            updateCurrentState(currentPage - 1);
        }
    }

    function updateCurrentState(oldState) {
        const currentStateElement = document.querySelector(`[data-state-id="${currentPage}"`);
        const previousStateElement = document.querySelector(`[data-state-id="${oldState}"`);

        previousStateElement.classList.remove('current');
        currentStateElement.classList.add('current');

        if (!pages[currentPage - 1]) document.querySelector('.previous-state-btn').classList.add('disable');
        if (pages[currentPage - 1]) document.querySelector('.previous-state-btn').classList.remove('disable');
        if (!pages[currentPage + 1]) document.querySelector('.next-state-btn').classList.add('disable');
        if (pages[currentPage + 1]) document.querySelector('.next-state-btn').classList.remove('disable');
    }

    function swapState(e) {
        // A little recursion ;)
        function getStateId(element) {
            if (element.classList.contains('path-state-container'))
                return element.dataset.stateId;
            else
                return getStateId(element.parentNode);
        }

        let stateId = getStateId(e.target);

        pages[stateId].init();
        let oldPage = currentPage;
        currentPage = parseInt(stateId);
        updateCurrentState(oldPage);
    }

    return {
        main
    }
}