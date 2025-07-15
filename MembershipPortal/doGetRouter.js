function doGet(e) {
    const view = e.parameter.view || 'member';
    let html;
    const modelFactory = Membership.newModelFactory();
    let canSignup = false; // ✅ properly declare this
    let event = undefined; // Initialize event to null
    // Default member object
    let member = {
        id: '',
        firstName: 'Anonymous',
        lastName: 'Guest',
        emailAddress: '',
        registration: { status: 'NOT_REGISTERED', level: 'Guest' },
        login: { status: 'UNVERIFIED' }
    };

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
        if(e.parameter.eventId) {
            event = modelFactory.eventManager().getEventById(e.parameter.eventId);
        }
        html = HtmlService.createTemplateFromFile('EventPortal/event');
        html.canSignup = canSignup;
        html.event = event;
    } else {
        html = HtmlService.createTemplateFromFile('MemberPortal/member');
    }

    html.sharedConfig = getConfig();
    html.member = member;

    return html.evaluate()
        .setTitle('Membership Portal')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
