const sheetConfig = {
    sheets: {
        registry: {

            id: '1VOY4Xv8wqn0P0SjeGX1612c0uMmgJxH4NHItY4pLHUM',
            name: 'Member Registry',
            namedColumns: {
                firstName: 'firstName',
                lastName: 'lastName',
                emailAddress: 'emailAddress',
                level: 'level',
                waiverDate: 'waiverDate',
                waiverPdfLink: 'waiverPdfLink'
            },
            emailLookupColumn: 'emailAddress'

        },
        classes: {

            id: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
            name: 'Class List',
            namedColumns: {
                title: 'ClassTitle',
                description: 'Description'
            }

        },
        events: {

            id: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
            name: 'Event List',
            namedColumns: {
                title: 'EventTitle',
                description: 'Description',
                date: 'EventDate',
                host: 'Host',
                location: 'Location',
                sizeLimit: 'SizeLimit'

            }
        },

        eventSignups: {

            id: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
            name: 'Event Signups',
            namedColumns: {
                eventId: 'EventId',
                attendeeName: 'AttendeeName',
                attendeeEmail: 'AttendeeEmail'
            }
        },
        tests: {

            id: '1bQ_kTLamrx7PUlvKxyhvhFYypNy_bLgqmKysH0QdC0o',
            name: 'Test Data',
            namedColumns: {
                id: 'id',
                title: 'title',
                timestamp: 'timestamp',
                complete: 'complete',
            }

        },
    }
}