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
function getAllMembers(paramsString) {
  const params = JSON.parse(paramsString);
  const response = membershipManager().getAllMembers(params); 
  const responseString=response.toString(); 
  return responseString; 
}

/**
 * Retrieves a member by their email address.
 */
function getMemberByEmail(email) {
  const memberResponse = membershipManager().getMemberByEmail(email);
  return JSON.stringify( memberResponse.toObject() );
}

/**
 * Updates a member's record with new information.
 * @param {Object} updatedMember - The member object with updated data.
 */
function updateMember(updatedMemberJson) {
  const response = membershipManager().updateMemberFromObject(JSON.parse( updatedMemberJson));
  return response.toString();
}

function getMemberById(id) {

  const memberResponse = membershipManager().getMember(id);
  if (!memberResponse) throw new Error('Member not found');

  return memberResponse.toString();
}

/**
 * Returns all instructors (vendors) for admin listing.
 */
function getAllInstructors(paramsString) {
  const params = paramsString ? JSON.parse(paramsString) : {};
  params.instructor=true
  const vendorManager = Membership.newModelFactory().vendorManager();
  const response = vendorManager.getAllVendors(params);
  return response.toString();
}


