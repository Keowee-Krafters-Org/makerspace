import { Invoice } from "../../models/Invoice";
import { LineItem } from "../../models/LineItem";

export class ZeffyPayment extends Invoice {
    constructor(data) {
        super(data);
    }

    static getResourceNameSingular() {
        return 'payment';
    }

    static getResourceNamePlural() {
        return 'payments';
    }

    static getToRecordMap() {
        return {
            ...super.getToRecordMap(),
            'id': 'id',
            'amount': 'amount',
            'createdDate': 'created',
            'status': 'status',
            'currency': 'currency',
            'description': 'description',
            'contactId': 'contact',
            'lineItems': 'items',
            'customerName': 'buyer.first_name', // This will need custom handling
            'customerEmail': 'buyer.email',
            'paymentMethod': 'payment_method.type',
            'receiptUrl': 'receipt_url',
            'isRecurring': 'recurring.is_recurring',
            'zeffyData': 'zeffyData'
        };
    }

    static fromRecord(record) {
        const data = this.convertRecordToData(record, this.getFromRecordMap());

        // Custom handling for nested properties and transformations
        if (record.amount) {
            data.amount = record.amount / 100;
        }
        if (record.created) {
            data.createdDate = new Date(record.created * 1000);
        }
        if (record.items) {
            data.lineItems = record.items.map(item => new LineItem({
                id: item.id,
                description: item.type,
                amount: item.amount / 100,
                quantity: 1
            }));
        }
        if (record.buyer) {
            data.customerName = `${record.buyer.first_name} ${record.buyer.last_name}`;
            data.customerEmail = record.buyer.email;
        }
        if (record.payment_method) {
            data.paymentMethod = record.payment_method.type;
        }
        if (record.recurring) {
            data.isRecurring = record.recurring.is_recurring;
        }
        
        data.zeffyData = record;

        return new ZeffyPayment(data);
    }
}
