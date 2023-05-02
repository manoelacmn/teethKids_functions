/* eslint-disable max-len */
import * as functions from "../node_modules/firebase-functions";
import * as admin from "../node_modules/firebase-admin";
import {getFirestore} from "firebase-admin/firestore";


admin.initializeApp();


const db = getFirestore();


// eslint-disable-next-line max-len
export const onBostonWeather = functions.firestore.document("emergency/HsPgBiSxc9WtxhWp2aUL")
  .onUpdate((Change) => {
    const after = Change.after.data();
    const payload = {
      data: {
        age: after.age,
        grade: after.grade,
      },
    };
    return admin.messaging().sendToTopic("HsPgBiSxc9WtxhWp2aUL", payload)
      .catch((err: any) => {
        console.error("FCM FAILED", err);
      });
  });


export const notifyEmergency = functions.https.onRequest(async (req, res) => {
  const users = db.collection("users");
  const snapshot = await users.get();
  // const uids: any[] = [];
  snapshot.forEach((doc) => {
    const field = doc.data().uid;
    // uids.push(field);
    console.log(doc.id, "=>", field);
  });
  // console.log(uids.toString());
});

// export const notifyEmergency = functions.firestore.document("emergency/{any}")
//   .onCreate( (change, context) => {
//     const users = db.collection("users");
//     const snapshot = await users.get();
//     const uids: any[] = [];
//     snapshot.forEach((doc) => {
//       const field = doc.data().uid;
//       uids.push(field);
//       console.log(doc.id, "=>", field);
//     });
//   });


export const getEmergencies = functions.firestore
  .document("emergency/{any}")
  .onCreate(async (snap, context) => {
    functions.logger.log("nova emergencia");
    const newEmergency = snap.data();
    functions.logger.log(newEmergency);

    const users = db.collection("users");
    const snapshot = await users.get();
    snapshot.forEach((doc) => {
      const field = doc.data().fcm;
      const message = {
        data: {score: "850", time: "2:45"},
        tokens: field,
      };
      admin.messaging().sendMulticast(message)
        .then((response) => {
          console.log(response.successCount + " messages were sent successfully");
        });
      console.log(doc.id, "=>", field);
    });
  });
// export const getAll = functions.https.onRequest((req, res) => {
//   admin.firestore().doc("areas/greater_boston").get()
//     .then((areaSnapshot) => {
//       const cities = areaSnapshot.data().cities;
//       const promises = [];
//       for (const city in cities) {
//         const p = admin.firestore.DocumentReference(`cities-weater/${city}`).get();
//         promises.push();
//       }
//       return promise.s;
//     });
// });

export const getData = functions.https.onRequest((req, res)=> {
  const promise = admin.firestore().doc("emergency/HsPgBiSxc9WtxhWp2aUL").get();
  const p2 = promise.then((snapshot) => {
    const data = snapshot.data();
    res.send(data);
  });
  p2.catch((err) => {
    console.log(err);
    res.status(500).send(err);
  });
});

export const acceptEmergency = functions.https.onCall(async (data, context) => {
  const emergency = data.emergency.toString();
  const uid = context.auth?.uid;

  const emergencyDocRef = db.collection("emergency").doc(emergency);
  const res = await emergencyDocRef.update({status: "accepted"});
});
