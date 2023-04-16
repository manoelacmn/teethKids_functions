import * as functions from "../node_modules/firebase-functions";


export const uwu = functions.https.onRequest((request, response) => {
  console.log("Hello!");
  response.end("UWU");
});


exports.myFunction = functions.firestore
  .document("/emergency")
  .onWrite((context) => { 
  });

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
