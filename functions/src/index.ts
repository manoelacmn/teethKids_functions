/* eslint-disable max-len */
import * as functions from "../node_modules/firebase-functions";
import * as admin from "../node_modules/firebase-admin";
import * as fb from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";


admin.initializeApp();

const firebase = admin.initializeApp();
const db = fb.getFirestore();

const batch = db.batch();

type Usuario = {
  nome: string,
  email: string,
  telefone: string,
  fcmToken: string | undefined,
  uid: string,
}

type CustomResponse = {
  status: string | unknown,
  message: string | unknown,
  payload: unknown,
}

// function hasAccountData(data: Usuario) {
//   if (data.nome != undefined &&
//       data.email != undefined &&
//       data.telefone != undefined &&
//       data.uid != undefined &&
//       data.fcmToken != undefined) {
//     return true;
//   } else {
//     return false;
//   }
// }

export const updateUserFcm = functions.
  region("southamerica-east1")
  .https.
  onCall(async (data, context) => {
    const uid = data.uid;
    const fcmtoken = data.fcmtoken;
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("uid", "==", uid).get();

    snapshot.forEach(async (doc) => {
      const tempRef = db.collection("users").doc(doc.id);
      batch.update(tempRef, {fcmToken: fcmtoken});
      await batch.commit();
    });
  });

// eslint-disable-next-line max-len
// export const onBostonWeather = functions.region("southamerica-east1").firestore.document("emergency/HsPgBiSxc9WtxhWp2aUL")
//   .onUpdate((Change) => {
//     const after = Change.after.data();
//     const payload = {
//       data: {
//         age: after.age,
//         grade: after.grade,
//       },
//     };
//     return admin.messaging().sendToTopic("HsPgBiSxc9WtxhWp2aUL", payload)
//       .catch((err: any) => {
//         console.error("FCM FAILED", err);
//       });
//   });


export const notifyEmergency = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
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


export const getEmergencies = functions.region("southamerica-east1").firestore
  .document("emergency/{any}")
  .onCreate(async (snap, context) => {
    functions.logger.log("nova emergencia");
    const newEmergency = snap.data();
    functions.logger.log(newEmergency);

    const users = db.collection("users");
    const snapshot = await users.get();
    snapshot.forEach(async (doc) => {
      const field = await doc.data().fcm;
      functions.logger.log(field);
      // const message = {
      //   data: {score: "850", time: "2:45"},
      //   tokens: field,
      // };
      // admin.messaging().sendMulticast(message)
      //   .then((response) => {
      //     console.log(response.successCount + " messages were sent successfully");
      //   });
      console.log(newEmergency.uid, "=>", field);
      functions.logger.log(newEmergency.uid, "=>", field);
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

export const getUids = functions.region("southamerica-east1").firestore
  .document("emergency/{any}")
  .onCreate(async (snap, context) => {
    const listAllUsers = (nextPageToken: string | undefined) => {
      // List batch of users, 1000 at a time.
      getAuth()
        .listUsers(1000, nextPageToken)
        .then((listUsersResult) => {
          listUsersResult.users.forEach((userRecord) => {
            console.log("user", userRecord.toJSON());
            functions.logger.log("user", userRecord.toJSON());
          });
          if (listUsersResult.pageToken) {
            // List next batch of users.
            listAllUsers(listUsersResult.pageToken);
          }
        })
        .catch((error) => {
          console.log("Error listing users:", error);
        });
    };
    // Start listing users from the beginning, 1000 at a time.
    listAllUsers("");
    // listAllUsers("uid");
  });

// export const acceptEmergency = functions.region("southamerica-east1").https.onCall(async (data, context) => {
//   const emergency = data.emergency.toString();
//   const uid = context.auth?.uid;

//   const emergencyDocRef = db.collection("emergency").doc(emergency);
//   const res = await emergencyDocRef.update({status: "accepted"});
// });

// const listAllUsers = (nextPageToken: string | undefined) => {
//   // List batch of users, 1000 at a time.
//   getAuth()
//     .listUsers(1000, nextPageToken)
//     .then((listUsersResult) => {
//       listUsersResult.users.forEach((userRecord) => {
//         console.log("user", userRecord.toJSON());
//       });
//       if (listUsersResult.pageToken) {
//         // List next batch of users.
//         listAllUsers(listUsersResult.pageToken);
//       }
//     })
//     .catch((error) => {
//       console.log("Error listing users:", error);
//     });
// };
// Start listing users from the beginning, 1000 at a time.


export const getData = functions.region("southamerica-east1").https.onRequest((req, res)=> {
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
