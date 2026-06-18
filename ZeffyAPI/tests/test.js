function runTests() {
  const runner = new TestRunner();
  runner.runAll();
}

function runStorageManagerTests() {
  const runner = new StorageManagerTestRunner();
  runner.runAll();
}