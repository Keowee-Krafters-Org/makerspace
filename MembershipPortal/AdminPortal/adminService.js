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
function getAllMembers() {
  const response = membershipManager().getAllMembers(); 
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




