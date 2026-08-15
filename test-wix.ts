import { items } from "@wix/data";
import { createClient, OAuthStrategy } from "@wix/sdk";

const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: "56c8a5b6-c679-4b81-ab14-c1dcb047f91b",
  }),
});

for (const collection of [
  "products",
  "collections",
  "reviews",
  "contactformsubmissions",
]) {
  try {
    const result = await wixClient.items.query(collection).limit(1).find();
    console.log(collection, "OK:", result.items.length);
  } catch (e) {
    console.log(collection, "ERROR:", e);
  }
}