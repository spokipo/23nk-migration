import { items } from "@wix/data";
import { createClient, OAuthStrategy } from "@wix/sdk";

export const wixClient = createClient({
  modules: {
    items,
  },
  auth: OAuthStrategy({
    clientId: "56c8a5b6-c679-4b81-ab14-c1dcb047f91b",
  }),
});