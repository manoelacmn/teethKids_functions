/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as fb from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

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


export const updateUserFcm = functions.
  region("southamerica-east1")
  .https.
  onCall(async (data, context) => {
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


export const notifyEmergency = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
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


export const getEmergencies = functions.region("southamerica-east1").firestore
  .document("emergencias/{any}")
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
            nome: newEmergency.nome,
            ImageRoot: newEmergency.ImageRoot1,
          },
          token: field,
        };
        (await admin.messaging().send(message));
        functions.logger.log(message.toString());
        console.log(newEmergency.uid, "=>", field);
        functions.logger.log(newEmergency.uid, "=>", field);
      // eslint-disable-next-line no-empty
      } catch {

      }
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

export const acceptEmergency = functions.region("southamerica-east1").https.onCall(async (data, context) => {
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
    const res = await tempRef.update({acceptedBy: fb.FieldValue.arrayUnion(userName)});
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

export const getData = functions.region("southamerica-east1").https.onCall(async (data, context)=> {
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


export const listAllEmergencies = functions.region("southamerica-east1").https.onCall(async (req, res) => {
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

exports.listAllEmergencies1 = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
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

export const refuseEmergency = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  const emergency = data.emergency.toString();
  const userName = data.userName.toString(); // IT SHOULD BE CALLED UID
  const emergencyRef = db.collection("emergencias");
  functions.logger.log(`USERNAME  = ${userName}`);
  functions.logger.log(`UID  = ${emergency}`);
  let snapshot = await emergencyRef.where("uid", "==", emergency).get();
  snapshot.forEach(async (doc) => {
    functions.logger.log("docID ->", doc.id);
    const tempRef = db.collection("emergencias").doc(doc.id);
    (await tempRef.update({refusedBy: fb.FieldValue.arrayUnion(userName)}));
    // const res = await tempRef.update({status: "in procedure", acceptedBy: userName});
  });
  snapshot = await emergencyRef.where("uid", "==", emergency).get();


  // (await emergencyDocRef.update({status: "accepted", acceptedBy: userName}));
});

export const getAcceptedBy = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const uid = data.uid;

    const usersRef = db.collection("usuarios");
    const emergencyRef = db.collection("emergencias");
    const query = await emergencyRef.where("uid", "==", uid).get();
    functions.logger.log("UID --->");
    const list: admin.firestore.DocumentData[] = [];
    query.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      functions.logger.log("DATA: ->", doc.data().acceptedBy);
      const acceptants = doc.data().acceptedBy;
      acceptants.forEach( async (uid : any) => {
        functions.logger.log(uid);
        const queryDentist = await usersRef.where("uid", "==", uid).get();
        queryDentist.forEach(async (doc1) => {
          functions.logger.log(doc1.data());
          list.push(doc1.data());
        });
      });
    });
    functions.logger.log(list);
    return list;
  });


export const TESTgetAcceptedBy = functions
  .region("southamerica-east1")
  .https.onRequest(async (req, res) => {
    const uid = req.body.uid;

    const usersRef = db.collection("usuarios");
    const emergencyRef = db.collection("emergencias");
    const query = await emergencyRef.where("uid", "==", uid).get();
    functions.logger.log("UID --->");
    const list: admin.firestore.DocumentData[] = [];
    query.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      functions.logger.log("DATA: ->", doc.data().acceptedBy);
      const acceptants = doc.data().acceptedBy;
      acceptants.forEach( async (uid : any) => {
        functions.logger.log(uid);
        const queryDentist = await usersRef.where("uid", "==", uid).get();
        queryDentist.forEach(async (doc1) => {
          functions.logger.log(doc1.data());
          list.push(doc1.data());
        });
      });
    });
    functions.logger.log(list);
  });

export const acceptDentist = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const uidDentist = data.dentist;
    const uidEmergency = data.emergency;
    const dentistRf = db.collection("usuarios");
    const emergencyRef = db.collection("emergencias");
    const query = await emergencyRef.where("uid", "==", uidEmergency).get();
    const query1 = await dentistRf.where("uid", "==", uidDentist).get();
    query.forEach(async (doc) => {
      const tempRef = emergencyRef.doc(doc.id);
      (await tempRef.update({selectedDentist: uidDentist}));
      functions.logger.log("docID ->", doc.id);
      functions.logger.log("DATA: ->", doc.data().acceptedBy);
    });
    const myMap = new Map<string, string>();

    // Adding key-value pairs to the Map
    // myMap.set(1, "Apple");
    // myMap.set(2, "Banana");
    // myMap.set(3, "Orange");
    myMap.set("emergencyUid", uidEmergency);
    myMap.set("timestamp", fb.FieldValue.serverTimestamp().toString());
    query1.forEach(async (doc) => {
      const tempRef = dentistRf.doc(doc.id);
      (await tempRef.update({history: fb.FieldValue.arrayUnion(myMap)}));
    });
  });


export const updateUserInfo = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  // const email = data.email;
  const userUid = data.userUid;
  const name = data.name;
  const phoneNumber = data.phoneNumber;
  const curriculum = data.curriculum;
  const status = data.status;
  const address1 = data.address1;
  const address2 = data.address2;
  const address3 = data.address3;

  type UpdateData = {
    telefone?: any;
    name?: any;
    curriculo?: any;
    status?: any;
    endereços?: any;
  };

  const updateData: UpdateData = {};

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

  if (address1 !== undefined || address2 !== undefined || address3 !== undefined) {
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
  const snapshot = await usersRef.where("uid", "==", userUid.toString()).get();
  snapshot.forEach(async (doc) => {
    functions.logger.log("docID ->", doc.id);
    const tempRef = db.collection("usuarios").doc(doc.id);
    functions.logger.log(tempRef.toString());
    const res = await tempRef.update(updateData);
    functions.logger.log(res.toString());
  });
});

export const updateAdress = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const userUid = data.userUid;
    const rua = data.rua;
    const cep = data.cep;
    const cidade = data.cidade;
    const estado = data.estado;
    const bairro = data.bairro;
    const numero = data.numero;
    const adressId = data.adressId;

    type address ={
      rua : string,
      cep: string,
      cidade: string,
      estado: string
      bairro: string,
      numero: number,
    }

    const uwu: address = {
      rua: rua,
      cep: cep,
      cidade: cidade,
      estado: estado,
      bairro: bairro,
      numero: numero,
    };

    const usersRef = db.collection("usuarios");
    const snapshot = await usersRef.where("uid", "==", userUid.toString()).get();
    snapshot.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      const tempRef = db.collection("usuarios").doc(doc.id);
      functions.logger.log(tempRef.toString());
      const res = await tempRef.update({[`arrayField.${adressId}`]: uwu});
      functions.logger.log(res.toString());
    });
  });

