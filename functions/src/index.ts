import * as functions from "../node_modules/firebase-functions";
import * as admin from "../node_modules/firebase-admin";
admin.initializeApp();

export const getData = functions.https.onRequest((req, res)=> {
  const promise = admin.firestore().doc("emergency/HsPgBiSxc9WtxhWp2aUL").get();
  promise.then((snapshot) => {
    const data = snapshot.data();
    res.send(data);
  });
});
