function doGet(e) {
    const view = e.parameter.view || 'member';
    const eventId = e.parameter.eventId || 'null';
    const adminMode= e.parameter.adminMode || 'members';
    const viewMode = e.parameter.viewMode || 'list';
    let html;
    const modelFactory = Membership.newModelFactory();
    let canSignup = false; // ✅ properly declare this
    let event = { id: eventId }; // Initialize event to null
    const config = getConfig();
    // Default member object
    let member = config.defaultMember;
    html = HtmlService.createTemplateFromFile('index');
    
    if (e.parameter.memberId) {
        const response = getMember(e.parameter.memberId);
        if (response.success) {
            const authentication = response.data.login.authentication;
            const isValid = new Date() < new Date(authentication.expirationTime);
            if (isValid) {
                member = response.data;
                delete member.login.authentication.token;
                canSignup = true;
            }
        }
    }

    // Determine adminAccess based on the member's level
    const adminAccess = config.levels[member.registration.level].value >= config.levels.Administrator.value;

    if (view === 'event') {
        if (e.parameter.eventId) {
            event = modelFactory.eventManager().getEventById(e.parameter.eventId);
            if (event) {
                html.event = event;
            } else {
                html.event = {
                    title: 'Event Not Found',
                    description: 'The event you are looking for does not exist.',
                    date: '',
                    location: 'Unknown',
                    eventItem: {
                        image: '',
                        host: 'N/A',
                        price: 0,
                        sizeLimit: 0,
                        duration: 0
                    }
                };
            }
        }
        html.view = 'event';
    } else if (view === 'admin') {
        if (!adminAccess) {
            return HtmlService.createHtmlOutput('Access denied. Not an admin.');
        }
        html.view = 'admin';
    } else {
        // Default to member view
        html.view = 'member';   
    }

    html.canSignup = canSignup;
    html.adminAccess = adminAccess;
    html.event = event;
    html.viewMode = viewMode;
    html.sharedConfig = config;
    html.member = member;
    html.adminMode = adminMode; // Pass adminMode to the frontend

    return html.evaluate()
        .setTitle('Membership Portal')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
