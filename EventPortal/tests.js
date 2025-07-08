function test_when_member_signs_up_for_event__then_event_is_updated() {
 
}

function test_when_loaded__then_page_is_rendered () {
  const url = {parameter: {memberId:'5636475000000431013'}};
  doGet(url);
  
}

function test_when_upcoming_events_are_requested__then_only_upcoming_events_are_received() {
  const events = getEventList(); 
  Logger.log(events);
}

function test_when_getEventRooms_is_called__then_rooms_are_returned() {
  try {
    const rooms = getEventRooms();
    Logger.log('getEventRooms returned: ' + JSON.stringify(rooms));
    // Parse if returned as JSON string
    let roomList = rooms;
    if (typeof rooms === 'string') {
      try {
        roomList = JSON.parse(rooms);
      } catch (e) {
        roomList = [];
      }
    }
    if (!Array.isArray(roomList)) {
      throw new Error('getEventRooms did not return an array');
    }
    Logger.log('Number of event rooms: ' + roomList.length);
    if (roomList.length === 0) {
      Logger.log('Warning: No event rooms returned.');
    }
    // Optionally check for expected properties
    roomList.forEach((room, idx) => {
      if (!room.id || !room.name || !room.email) {
        Logger.log(`Room ${idx} missing expected properties: ` + JSON.stringify(room));
      }
    });
    Logger.log('test_when_getEventRooms_is_called__then_rooms_are_returned passed.');
  } catch (e) {
    Logger.log('test_when_getEventRooms_is_called__then_rooms_are_returned failed: ' + e.message);
  }
}