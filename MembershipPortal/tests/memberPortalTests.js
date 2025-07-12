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
  const response = memberShipManager.getMember('5636475000000662004');
  Membership.assert(response.success, 'Member should be found');
  Membership.assert(response.data.id === memberId, 'Member ID should match');
}
