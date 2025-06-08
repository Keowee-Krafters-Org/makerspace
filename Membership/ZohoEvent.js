class ZohoEvent  extends Event {    
    constructor(data = {}) {
        super(data);
    }

    static getResourceNameSingular() { return 'item'; }
    static getResourceNamePlural() { return 'items'; }

    static fromRecord(record) {
        return new Event({
            host: record.cf_host || '',
            title: record.name || '',
            id: record.item_id,
            name: record.item_name || '',
            date: record.cf_scheduled_date ? new Date(record.cf_scheduled_date) : new Date(),
            cost: record.purchase_rate || 0,
            costDescription: record.purchase_description || '',
            price: record.price || 0,
            host: record.cf_host || '',
            location: record.cf_location || '',
            duration: record.cf_duration_hrs || 0,
            description: record.description || '',
            sizeLimit: record.cf_attendance_limit || 0,
            type: record.cf_type || '',
            }
        );
    }

    toRecord() {
        return {
            item_id: this.id,
            name: this.name,
            item_name: this.name,
            event_date: this.date.toISOString(),
            cf_host: this.host,
            cf_location: this.location  ,
            cf_duration_hrs: this.duration,
            description: this.description,
            cf_attendance_limit: this.sizeLimit,
            cf_type: this.type,
            purchase_rate: this.cost,
            price: this.price,
            purchase_description: this.costDescription

        }; 
    }

}

