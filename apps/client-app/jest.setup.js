/* global jest */
// Global Jest setup.
//
// `@react-native-async-storage/async-storage` has no default Jest mock, so any
// module graph that reaches the persisted app store (now including labels.ts via
// useLabels, which several presentational components consume) needs it mocked.
// Registering the library's official mock here means individual test files no
// longer have to — and any file that DOES declare its own jest.mock for it still
// wins, since file-level mocks override this global one.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
