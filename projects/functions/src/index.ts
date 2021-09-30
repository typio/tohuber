import * as functions from "firebase-functions";
import * as cors from "cors";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const corsHandler = cors({ origin: true });

export const exampleFunction = functions.https.onRequest(
    async (request, response) => {
      corsHandler(request, response, () => {});
      response.set("Access-Control-Allow-Origin", "*");
    });
