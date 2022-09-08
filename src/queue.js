export class Queue {
    queue;

    constructor() {
        this.queue = [];
    };

    add(item) {
        this.queue.push(item);
    }

    get(item) {
        return (this.queue.length) ? this.queue.shift() : {};
    }
}