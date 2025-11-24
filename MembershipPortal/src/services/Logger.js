// Logger class for logging errors and debug messages
export class Logger {
    constructor(level = 'INFO') {
        this.level = level;
        if (!Logger.instance) {
            Logger.instance = this;
        }
        return Logger.instance; 
    }
    static instance= null;
    static log(message, data = '') {
        this.instance.log(message, data);
    }

    static error(message, data = '') {
        this.instance.error(message, data);
    }

    static info(message, data = '') {
        this.instance.info(message, data);
    }

    static debug(message, data = '') {
        this.instance.debug(message, data);
    }
    log(message, data = '') {
        if (this.level === 'INFO') {
            console.log("Log:", message, data);
        }
    }

    debug(message, data = '') {
        if (this.level === 'DEBUG') {
            console.debug("Debug:", message, data);
        }
    }
    info(message, data = '') {
        if (this.level === 'INFO' || this.level === 'DEBUG') {
            console.info("Info:", message, data);
        }
    }
    error(message, data = '') {
            console.error("Error:", message, data);
    }
}   