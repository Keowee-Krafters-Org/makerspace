

class ZohoPaymentGateway extends Entity {
    /**
     * Constructor for ZohoPaymentGateway.
     * @param {Object} data - The data to initialize the payment gateway.
     */
    constructor(data = {}) {
        super(data);
    }

    static getToRecordMap() {
        return {
            name: 'gateway_name',
            configured: 'configured',
            method: 'additional_field1'
        };
    }
}