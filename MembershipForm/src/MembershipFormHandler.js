function handleMembershipFormSubmit(e) {
  const memberShipManager = Membership.newModelFactory().membershipManager(); 
  const response = e.response;
  const itemResponses = response.getItemResponses();
  const responses = {};

  itemResponses.forEach(itemResponse => {
    const itemTitle = itemResponse.getItem().getTitle();
    const value = itemResponse.getResponse();
    responses[itemTitle] = value;
  });
  const member = {
    emailAddress: (responses['Email Address']),
    firstName: (responses['First Name']),
    lastName: (responses['Last Name']),
    phoneNumber: (responses['Phone Number']),
    address: (responses['Address']),
    interests: (responses['Interests']),
    registration: {
      level: (responses['Level']==='Active Member'?'Active':'Interested Party')
    }
  };

  if (!member.emailAddress) {
    console.warn("Missing email address; skipping member registration.");
    return;
  }

  console.log(`Registering member: ${member.firstName} ${member.lastName} <${member.emailAddress}>`);

  memberShipManager.addMemberRegistration(member);
}
