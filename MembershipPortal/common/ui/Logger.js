// Logger class for logging errors and debug messages
class Logger {
    static log(message, data = '') {
        console.log("Log:", message, data);
    }

    static error(message, data = '') {
        console.error("Error:", message, data);
    }
}