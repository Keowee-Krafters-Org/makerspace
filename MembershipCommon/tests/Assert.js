export class Assert {
    /**
     * A simple assertion utility for GAS testing.
     * @param {string} message - The message to display for the assertion.
     * @param {*} expected - The expected value.
     * @param {*} found - The value that was found.
     */
    static assert(message, expected, found) {
        // A simple coercion for boolean checks, e.g., assert('should be true', true, 1)
        if (typeof expected === 'boolean' && typeof found !== 'boolean') {
            found = !!found;
        }

        if (expected !== found) {
            const errorMessage = `${message}: FAILED. Expected '${expected}' but found '${found}'.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        console.log(`${message}: Passed.`);
    }
}
