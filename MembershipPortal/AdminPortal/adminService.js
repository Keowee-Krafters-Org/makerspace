// Admin Portal entry point and service functions


function memberLookup(email) {
  return membershipManager().memberLookup(email);
}

function membershipManager() {
  return Membership.newModelFactory().membershipManager();
}


/**
 * Returns all members for admin listing.
 */
function getAllMembers(params) {
  const response = membershipManager().getAllMembers(params); 
  const responseString=JSON.stringify(response); 
  return responseString; 
}

/**
 * Retrieves a member by their email address.
 */
function getMemberByEmail(email) {
  const member = memberLookup(email);
  if (!member) throw new Error('Member not found');

  return JSON.stringify({success:true, data:member.toObjectNoAuthentication()});
}

/**
 * Updates a member's record with new information.
 * @param {Object} updatedMember - The member object with updated data.
 */
function updateMember(updatedMemberJson) {
  const response = membershipManager().updateMemberFromObject(JSON.parse( updatedMemberJson));
  if (!response) {
    throw new Error('Failed to update member');
  }
  const savedMember = response.data;

  return JSON.stringify({success:true, data:savedMember.toObjectNoAuthentication()});
}

/**
 * Creates a new event by calling the eventService createEvent function.
 * @param {string} eventData - The event data in JSON format.
 */
function adminCreateEvent(eventData) {
  return createEvent(eventData); // Reuse the createEvent function from eventService.js
}

/**
 * Updates an existing event by calling the eventService updateEvent function.
 * @param {string} eventData - The updated event data in JSON format.
 */
function adminUpdateEvent(eventData) {
  return updateEvent(eventData); // Reuse the updateEvent function from eventService.js
}




