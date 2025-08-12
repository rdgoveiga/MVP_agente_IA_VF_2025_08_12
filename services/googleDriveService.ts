// services/googleDriveService.ts

/**
 * @deprecated This service is deprecated as of v2.0.0.
 * Data management is now handled by services/dataService.ts which interacts
 * with a simulated backend client. The app version is now managed in App.tsx.
 */
export const APP_VERSION = '2.0.0-multiuser';

export function checkAndMigrateData() {
  // This function is now obsolete. The new data service manages its own data structure.
  console.warn("checkAndMigrateData is deprecated and should no longer be used.");
}