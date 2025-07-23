import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "687810a9294a03ec0724d15e", 
  requiresAuth: true // Ensure authentication is required for all operations
});
