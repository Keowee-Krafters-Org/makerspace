function doGet(e) {
    const view = e.parameter.view || 'member';
    let html;
    const modelFactory = Membership.newModelFactory();
    let canSignup = false; // ✅ properly declare this
    let event = undefined; // Initialize event to null
    const config = getConfig();
    // Default member object
    let member = config.defaultMember;

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

    if (view === 'event') {
        html = HtmlService.createTemplateFromFile('EventPortal/event');
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
        } else {
            html.event = undefined
        }
        html.canSignup = canSignup;
    } else if (view === 'admin') {
        if (config.levels[member.level] < config.levels.Administrator) {
            return HtmlService.createHtmlOutput('Access denied. Not an admin.');
        }
        html = HtmlService.createTemplateFromFile('AdminPortal/admin');
    }
    else {
        // Default to member view
        html = HtmlService.createTemplateFromFile('MemberPortal/member');
    }

    html.sharedConfig = config;
    html.member = member;

    return html.evaluate()
        .setTitle('Membership Portal')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
