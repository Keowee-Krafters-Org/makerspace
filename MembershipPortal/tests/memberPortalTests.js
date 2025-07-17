/** 
 * Assert block for tests
 */
const assert = (label, expected, actual) => {
  if (expected !== actual) {
    throw new Error(`${label} mismatch. Expected: ${expected}, Got: ${actual}`);
  } else {
    Logger.log(`${label} verified: ${actual}`);
  }
};

const emailAddress = 'christopher.smith@keoweekrafters.org';
function test_that_when_a_member_is_found_by_id__then_the_member_is_returned() {
  const memberId = '12345';
  const expectedMember = {
    id: memberId,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: '',
    registration: { status: 'REGISTERED', level: 'Gold' },
    login: { status: 'VERIFIED', authentication : { token: 'abc123', expirationTime: '2023-10-01T00:00:00Z' } }
  };
  const memberShipManager =  Membership.newModelFactory().membershipManager();
  const member = memberShipManager.memberLookup(emailAddress);
  assert( 'Member should be found', true, member != undefined);
  assert( 'Member email  should match', emailAddress, member.emailAddress );
}

function test_that_when_a_member_logs_in__then_the_member_is_returned() {
 
  const memberShipManager =  Membership.newModelFactory().membershipManager();
  const memberResponse  = memberShipManager.loginMember(emailAddress);
  assert( 'Member should be found', true, (memberResponse && memberResponse.success));
  const member = memberResponse.data; 
  assert( 'Member email  should match', emailAddress, member.emailAddress );
}

function test_get_event_rooms() {
  const rooms = JSON.parse(getEventRooms());
  assert('Event rooms should not be empty', true, Array.isArray(rooms) && rooms.length > 0);
}

function test_failed_event_update() {
  const description = "Ever wonder how those beautiful turned pens that you see at craft fairs are made? Here is your chance to learn how easy it is to turn wood blanks on the lathe and assemble them into stunning keepsake pens. They make great gifts and can be custom engraved with our Glowforge laser printer (2D Design and Fabrication Class)!\n\nCost includes all materials and tools. \n\nTools Needed\n3 pen mandrels\n3 pen making live centers \n1 pen blank machining bit\nSpindel roughing gouge\nSpindel gouge\n7 mm drill bit\n1 pen making sandpaper kit\n1 pen blank insertion tool\nMaterials Needed:  \n7-pen blanks (1 for instructor demo)\n7 pen kits (1 for instructor demo)\n1 bottle Medium CA glue\n1 bottle pen finish\nCourse Outline:\nWood Properties \nLathe introduction\nLathe Speeds\nIntro to pen turning\nWood sizing\nDrilling pen blanks\nPen tube insertion\nMachining pen blanks to size\nMounting pen blanks on mandrel\nTurning pen blanks\nSanding pen blanks\nFinishing pen blanks\nAssembling pens\n".replace(/\n/g, '\\n');
  const eventText = `{
  "id": "n1vm21rudr0h4rdt1o46p9f0s8@google.com",
  "eventItem": {
    "id": "5636475000000506001",
    "title": "Woodturning Class Number 3: Basic Pen Turning",
    "description": "${description}",
    "price": 75,
    "sizeLimit": 3,
    "enabled": true,
    "host": {
      "id": "5636475000000620039"
    },
    "duration": 4
  },
  "date": "2025-07-30T15:00:00.000Z",
  "location": {
    "email": "c_188dhi7k2lgmegqijd6t4cp6flkio@resource.calendar.google.com"
  }
}`;
  const event = JSON.parse(eventText); 
  const updatedEvent = updateEvent(eventText); 
  assert("Event updated:", true, updatedEvent!=undefined); 
}