/**
 * List instructors from Zoho CRM Vendors.
 */

function test_when_listInstructors_is_called__then_instructors_are_returned() {
  
  const vendorManager = modelFactory.vendorManager();
  const params = {page: { 'page': 1, 'pageSize': 10 }, instructor: true};
    
  const response = vendorManager.getAllVendors(params);
  
    assert('Vendors returned', response.success, true);
    assert('At least one instructor returned', response.data.length > 0, true);
    assert('Instructor has expected fields', response.data[0] instanceof Instructor, true);
    assert('Instructor has name field', typeof response.data[0].name === 'string', true);
    assert('Instructor has email field', typeof response.data[0].emailAddress === 'string', true);
    assert('Instructor has instructor field', response.data[0].instructor === 'true', true);
  
}