/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as fb from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
// import firebase from "firebase/compat/app";

admin.initializeApp();
const db = fb.getFirestore();

// const batch = db.batch();

// export const registerUid = functions
//   .region("southamerica-east1")
//   .auth
//   .user()
//   .onCreate((user) =>{
//     // const uid = user.uid;
//     const email = user.email;

//     const userRef = db.collection("usuarios").where("email", "==", email);
//     functions.logger.log(userRef);
//   });
// type Usuario = {
//   nome: string,
//   email: string,
//   telefone: string,
//   fcmToken: string | undefined,
//   uid: string,
// }

// type CustomResponse = {
//   status: string | unknown,
//   message: string | unknown,
//   payload: unknown,
// }

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

// export const acceptEmergency = functions.
//   region("southamerica-east1")
//   .https.
//   onCall(async (data, context) => {

//   });

export const updateUserFcm = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const email = data.email;
    const fcmtoken = data.fcmtoken;
    const usersRef = db.collection("usuarios");
    const snapshot = await usersRef.where("email", "==", email).get();
    functions.logger.log("fcmtoken ->", fcmtoken);
    functions.logger.log("email ->", email);
    snapshot.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      const tempRef = db.collection("usuarios").doc(doc.id);
      const res = await tempRef.update({fcmtoken: fcmtoken});
      functions.logger.log(res);
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

export const notifyEmergency = functions
  .region("southamerica-east1")
  .https.onRequest(async (req, res) => {
    const users = db.collection("users");
    const snapshot = await users.where("staus", "!=", "offline").get();
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

export const getEmergencies = functions
  .region("southamerica-east1")
  .firestore.document("emergencias/{any}")
  .onCreate(async (snap, context) => {
    functions.logger.log("nova emergencia");
    const newEmergency = snap.data();
    functions.logger.log(newEmergency);

    const users = db.collection("usuarios");
    const snapshot = await users.get();
    snapshot.forEach(async (doc) => {
      const field = await doc.data().fcmtoken;
      functions.logger.log("under");
      functions.logger.log(field);
      functions.logger.log("up");
      try {
        const message = {
          data: {
            text: "new emegency",
            uid: newEmergency.uid,
          },
          token: field,
        };
        await admin.messaging().send(message);
        console.log(newEmergency.uid, "=>", field);
        functions.logger.log(newEmergency.uid, "=>", field);
        // eslint-disable-next-line no-empty
      } catch {}
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

export const getUids = functions
  .region("southamerica-east1")
  .firestore.document("emergency/{any}")
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

export const acceptEmergency = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const emergency = data.emergency.toString();
    const userName = data.userName.toString(); // IT SHOULD BE CALLED UID
    const emergencyRef = db.collection("emergencias");
    functions.logger.log(`USERNAME  = ${userName}`);
    functions.logger.log(`UID  = ${emergency}`);
    let snapshot = await emergencyRef.where("uid", "==", emergency).get();
    snapshot.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      const tempRef = db.collection("emergencias").doc(doc.id);
      // const res = await tempRef.update({status: "in procedure", acceptedBy: userName});
      const res = await tempRef.update({
        acceptedBy: fb.FieldValue.arrayUnion(userName),
      });
      functions.logger.log(res);
    });
    snapshot = await emergencyRef.where("uid", "==", emergency).get();

    // (await emergencyDocRef.update({status: "accepted", acceptedBy: userName}));
  });

// export const getData = functions.region("southamerica-east1").https.onRequest((req, res)=> {
//   const promise = admin.firestore().doc("emergency/HsPgBiSxc9WtxhWp2aUL").get();
//   const p2 = promise.then((snapshot) => {
//     const data = snapshot.data();
//     res.send(data);
//   });
//   p2.catch((err) => {
//     console.log(err);
//     res.status(500).send(err);
//   });
// });

export const getData = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const emergencyUid = data.emergency.toString();
    const emergencyRef = db.collection("emergencias");
    const snapshot = await emergencyRef.where("uid", "==", emergencyUid).get();
    const list: admin.firestore.DocumentData[] = [];
    snapshot.forEach(async (doc) => {
      list.push(doc.data());
    });
    functions.logger.log("EMERGENCY INFO =>");
    functions.logger.log(JSON.stringify(list).toString());
    return JSON.stringify(list);
  });

export const listAllEmergencies = functions
  .region("southamerica-east1")
  .https.onCall(async (req, res) => {
    const emergencyRef = db.collection("emergencias");
    const snapshot = await emergencyRef.where("status", "==", "new").get();
    const list: admin.firestore.DocumentData[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data());
      functions.logger.log("DOC DATA ---->", doc.data());
      functions.logger.log("LIST ----->", list);
    });
    return list;
  });

exports.listAllEmergencies1 = functions
  .region("southamerica-east1")
  .https.onRequest(async (req, res) => {
    try {
      const emergencyRef = admin.firestore().collection("emergencias");
      const snapshot = await emergencyRef.where("status", "==", "new").get();
      const list: admin.firestore.DocumentData[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
        functions.logger.log("DOC DATA ---->", doc.data());
        functions.logger.log("LIST ----->", list);
      });
      res.status(200).json(list);
    } catch (error) {
      console.error("Error listing emergencies:", error);
      res.status(500).send("Error listing emergencies");
    }
  });

export const refuseEmergency = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const emergency = data.emergency.toString();
    const userName = data.userName.toString(); // IT SHOULD BE CALLED UID
    const emergencyRef = db.collection("emergencias");
    functions.logger.log(`USERNAME  = ${userName}`);
    functions.logger.log(`UID  = ${emergency}`);
    let snapshot = await emergencyRef.where("uid", "==", emergency).get();
    snapshot.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      const tempRef = db.collection("emergencias").doc(doc.id);
      await tempRef.update({refusedBy: fb.FieldValue.arrayUnion(userName)});
      // const res = await tempRef.update({status: "in procedure", acceptedBy: userName});
    });
    snapshot = await emergencyRef.where("uid", "==", emergency).get();

    // (await emergencyDocRef.update({status: "accepted", acceptedBy: userName}));
  });

// export const getUidDoctors = functions
//   .region("southamerica-east1")
//   .https.onCall(async (data, context) => {
//     const docsID = db.collection("emergencias");
//     const snapshot = await docsID.get();
//     const list: admin.firestore.DocumentData[] = [];
//     snapshot.forEach((doc) => {
//       console.log("=>", doc.data());
//       functions.logger.log("");
//       list.push(doc.data().uid);
//     });
//   });

export const getAcceptedBy = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const uid = data.uid;

    const emergencyRef = db.collection("emergencias");
    const query = await emergencyRef.where("uid", "==", uid).get();

    query.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      // const tempRef = db.collection("emergencias").doc(doc.id);
      functions.logger.log("DATA: ->", doc.data().acceptedBy);
    });
  });

// document.addEventListener("DOMContentLoaded", function () {
//   db.settings({ timestampInSnapshots: true });

//   const col = db.collection("emergencias");

//   const query = col.where("acceptedBy");

//   query.get().then((snapshot) => {
//     snapshot.docs.forEach((doc) => {
//       console.log(doc.id, doc.data());
//     });
//   });
// });

export const updateUserInfo = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    // const email = data.email;
    const userUid = data.userUid;
    const name = data.name;
    const phoneNumber = data.phoneNumber;
    const curriculum = data.curriculum;
    const status = data.status;
    const address1 = data.address1;
    const address2 = data.address2;
    const address3 = data.address3;

    const updateData: Record<string, any> = {};

    if (phoneNumber !== undefined) {
      updateData.telefone = phoneNumber;
    }

    if (name !== undefined) {
      updateData.name = name;
    }

    if (curriculum !== undefined) {
      updateData.curriculo = curriculum;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (
      address1 !== undefined ||
      address2 !== undefined ||
      address3 !== undefined
    ) {
      updateData.endereços = fb.FieldValue.arrayUnion(
        ...(address1 !== undefined ? [address1] : []),
        ...(address2 !== undefined ? [address2] : []),
        ...(address3 !== undefined ? [address3] : [])
      );
    }
    functions.logger.log("DOC ID ->", updateData);
    const usersRef = db.collection("usuarios");
    functions.logger.log("UPDATE ->", updateData);
    functions.logger.log("USER UID ->", userUid);
    const snapshot = await usersRef
      .where("uid", "==", userUid.toString())
      .get();
    snapshot.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      const tempRef = db.collection("usuarios").doc(doc.id);
      functions.logger.log(tempRef.toString());
      const res = await tempRef.update(updateData);
      functions.logger.log(res.toString());
    });
  });
