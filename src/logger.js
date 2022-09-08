export class Logger {
    constructor() {
    };


    info(message) {
        console.log(message);
    }

    warn(message) {
        console.warn(message);
    }

    error(message) {
        console.error(message);
    }

    debug(message) {
        console.debug(message);
    }

}