function test_when_event_list_runs__then_events_are_returned() {
  const params = JSON.stringify({page: {pageSize: 2, currentPageMarker: 1}})
  const response = getEventList(params); 
  console.info("Received: " + JSON.stringify(response)); 
}

function test_when_members_are_loaded__then_pagination_works() {
  const params = JSON.stringify({page: {pageSize: 2, currentPageMarker: 1}}); 
  const response = getAllMembers(params); 
  console.info("Received: " + response); 
}

function test_when_member_is_searched_by_email__then_member_is_returned() {
  const email = "testuser@keoweekrafters.org"; 
  const response = getMemberByEmail(email); 
  console.info("Received: " + response); 
}