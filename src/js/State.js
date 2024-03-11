export default class State {
    size;
    queensPositions = [];

    constructor({size, positions}) {
        if (positions != undefined && typeof positions == "object") {
            this.size = positions.length;
            this.setQueens(positions);
        }
        else {
            this.size = size;
            this.setQueens(this.size);
        }
    }

    setQueens(queensPositions) {
        if (typeof queensPositions == "object") {
            this.queensPositions.push(...queensPositions);
        } else {
            for (let i = 0; i < this.size; i++) {
                this.queensPositions.push(i);
            }
            this.queensPositions = this.shuffle(this.queensPositions);
        }
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    generateNeigbors() {
        let neigbors = [];
        let nextPosition;
        for (let y = 0; y < this.size; y++) {
            for (let x = 1; x < this.size; x++) {
                nextPosition = this.queensPositions[y] + x;
                if (nextPosition >= this.size)
                    nextPosition = x - (this.size - this.queensPositions[y]);

                const neighborPositions = [];
                neighborPositions.push(...this.queensPositions);
                neighborPositions[y] = nextPosition;

                const neighbor = new State({positions: neighborPositions});

                neigbors.push(neighbor);
            }
        }
        return neigbors;
    }

    findCollisions() {
        let collisions = 0;

        for (let y = 0; y < this.size - 1; y++) {
            for (let x = y + 1; x < this.size; x++) {
                if (this.queensPositions[y] == this.queensPositions[x] ||
                    Math.abs(this.queensPositions[x] - this.queensPositions[y]) == x - y)
                        collisions++;
            }
        }

        return collisions;
    }

    get queens() {
        return this.queensPositions;
    }
}