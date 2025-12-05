// JSDOM test environment setup for Vitest

// Optional: set a stable timezone for date-related tests
// process.env.TZ = 'UTC';

// Optional: silence CSS imports if any component imports CSS directly
// (Vitest with css:true usually handles this; keep for safety)
export default function setup() {
  // You can add global mocks here if needed
  // e.g., global.fetch = vi.fn();
}