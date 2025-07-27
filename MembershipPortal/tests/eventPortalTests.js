
function test_when_classes_are_retrieved__then_can_be_rendered() {

    const classes = getEventList();

    // Act
    logger.log('Retrieved classes:', classes);

    // Assert
    assert('Classes are found', true, classes.length > 0);
}