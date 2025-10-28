
const eventId = '2kdq6q1ond4udslu88gl8dbra8@google.com';
const memberId = '5636475000000620039';

function test_when_classes_are_retrieved__then_can_be_rendered() {

    const classes = getEventList();

    // Act
    logger.log('Retrieved classes:', classes);

    // Assert
    assert('Classes are found', true, classes.length > 0);
}


function test_when_member_signsup__then_invoice_is_generated() {
    const modelFactory = Membership.newModelFactory();
    const eventManager = modelFactory.eventManager();
    const memberManager = modelFactory.membershipManager();
    const invoiceManager = modelFactory.invoiceManager();

    // Arrange
    const event = eventManager.getEventById(eventId);
    const memberResponse = memberManager.getMember(memberId);
    const member = memberResponse.data;

    // Act
    const signupResponseJson = signup(event.id, member.id);
    const signupResponse = JSON.parse(signupResponseJson);
 
    // Assert
    assert('Invoice is generated sucessfully', true, signupResponse.success);

}