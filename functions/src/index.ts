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
    const uid = data.uid;
    const fcmtoken = data.fcmtoken;
    const usersRef = db.collection("usuarios");
    const snapshot = await usersRef.where("uid", "==", uid).get();
    functions.logger.log("fcmtoken ->", fcmtoken);
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
            code: "1",
          },
          token: field,
        };
        (await admin.messaging().send(message));
        functions.logger.log(message.toString());
        console.log(newEmergency.uid, "=>", field);
        functions.logger.log(newEmergency.uid, "=>", field);
        // eslint-disable-next-line no-empty
        const timestampField = {
          timeStamp: admin.firestore.FieldValue.serverTimestamp(),
        };
        await snap.ref.update(timestampField);
      } catch (err) {
        functions.logger.log(err);
      }
    });
  });


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
    const res = await tempRef.update({acceptedBy: fb.FieldValue.arrayUnion(userName)});


    functions.logger.log(res);
  });
  snapshot = await emergencyRef.where("uid", "==", emergency).get();

  // (await emergencyDocRef.update({status: "accepted", acceptedBy: userName}));
});


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


export const listAllEmergencies = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  const emergencyRef = db.collection("emergencias");
  const snapshot = await emergencyRef.where("status", "==", "new").get();
  const list: admin.firestore.DocumentData[] = [];
  snapshot.forEach((doc) => {
    list.push(doc.data());
    functions.logger.log("DOC DATA ---->", doc.data());
    functions.logger.log("LIST ----->", list);
  });
  functions.logger.log(JSON.stringify(list));
  return JSON.stringify(list);
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
    const list1: admin.firestore.DocumentData[] = [];

    const promises: Promise<void>[] = [];

    query.forEach(async (doc) => {
      functions.logger.log("docID ->", doc.id);
      functions.logger.log("DATA: ->", doc.data().acceptedBy.toString());

      const acceptants: any[] = doc.data().acceptedBy || [];

      list.push(...acceptants);
      functions.logger.log("ACCEPTANTS: ->", acceptants.toString());
      list.push(doc.data().acceptedBy);

      acceptants.forEach((uid: any) => {
        functions.logger.log(uid);
        const queryDentist = usersRef.where("uid", "==", uid).get();
        const promise = queryDentist.then((snapshot) => {
          snapshot.forEach((doc1) => {
            const data = doc1.data();
            list1.push(data);
            functions.logger.log(doc1.data().toString());
          });
        });
        promises.push(promise);
      });
    });

    await Promise.all(promises); // Wait for all async operations to complete

    functions.logger.log(list);
    functions.logger.log(list1);
    return JSON.stringify(list1);
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

    let emergencyPATH = "";
    let emegencyName: string;

    const list: admin.firestore.DocumentData[] = [];


    query.forEach(async (doc) => {
      emergencyPATH = doc.ref.path;
      list.push(doc.data());
      emegencyName = doc.data().nome;
      const tempRef = emergencyRef.doc(doc.id);
      (await tempRef.update({selectedDentist: uidDentist}));
      functions.logger.log("docID ->", doc.id);
      functions.logger.log("DATA: ->", doc.data().acceptedBy);
    });

    const myMap = new Map<string, string>();
    myMap.set("emergencyPATH", emergencyPATH);
    myMap.set("timestamp", fb.FieldValue.serverTimestamp().toString());
    query1.forEach(async (doc) => {
      const tempRef = dentistRf.doc(doc.id);
      (await tempRef.update({
        "history": fb.FieldValue.arrayUnion(emergencyPATH),
        "current.emergencyPATH": emergencyPATH,
        "current.timestamp": fb.FieldValue.serverTimestamp().toString(),
        "status": "busy",
        "current": fb.FieldValue.arrayUnion(myMap)}));

      const message: admin.messaging.Message = {
        data: {
          text: "Você foi escolhido para essa emergência",
          uid: uidEmergency,
          nome: emegencyName.toString(),
          ImageRoot: emergencyPATH.toString(),
          code: "0",
        },
        token: doc.data().fcmToken,
      };

      (await admin.messaging().send(message));
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

    const Address: address = {
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
      (await tempRef.update({
        [`addresses.${adressId}`]: Address,
      }));
    });
  });


export const getAdress = functions
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

    const Address: address = {
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
      (await tempRef.update({
        [`addresses.${adressId}`]: Address,
      }));
    });
  });

export const isBusy = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  // const email = data.email;
  const userUid = data.userUid;
  const usersRef = db.collection("usuarios");
  functions.logger.log("USER UID ->", userUid);
  const snapshot = await usersRef.where("uid", "==", userUid.toString()).get();
  snapshot.forEach(async (doc) => {
    functions.logger.log("docID ->", doc.id);
    if (doc.data().status == "busy") {
      const emergencyKey = doc.data().current.emergencyPATH;
      functions.logger.log(`EMERGENCY PATH : ${emergencyKey.toString()}`);
      return emergencyKey.toString();
    }
    // const tempRef = db.collection("usuarios").doc(doc.id);
    // functions.logger.log(tempRef.toString());
  });
});


export const sendAddress = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  const userUid = data.userUid;
  const usersRef = db.collection("usuarios");
  const addressID = data.addressID;
  const emergencyRef = data.emergencyRef;


  const snapshot = await usersRef.where("uid", "==", userUid.toString()).get();

  const snapshot1 = await usersRef.where("uid", "==", emergencyRef.toString()).get();


  let address = "";

  let fcmToken = "";

  let phoneNumber = "";

  snapshot.forEach((doc) => {
    functions.logger.log("docID ->", doc.id);
    phoneNumber = doc.data().telefone;
    address = doc.data().endereços?.[Number(addressID)];
  });

  snapshot1.forEach(async (doc) => {
    const tempRef = db.collection("emergencias").doc(doc.id);
    fcmToken = doc.data().FCMTOken;
    (await tempRef.update({dentistAddress: address}));
  });

  const message: admin.messaging.Message = {
    data: {
      "address": address,
      "phone": phoneNumber,
    },
    token: fcmToken,
  };


  (await admin.messaging().send(message));

  return address;
});

export const addAvaliacao = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const {name, rating, text, userUid, emergencyUid} = data;

    try {
      // Get a Firestore instance
      const firestore = admin.firestore();

      // Search for a document with matching uid in "avaliacoes" collection
      const querySnapshot = await firestore
        .collection("avaliacoes")
        .where("uid", "==", userUid)
        .get();

      // Get the first matching document
      const doc = querySnapshot.docs[0];

      if (doc) {
        // Document exists, append the new entry to the "avaliacoes" array
        await doc.ref.update({
          avaliacoes: admin.firestore.FieldValue.arrayUnion({
            name: name,
            rating: rating,
            text: text,
            emergencyUid: emergencyUid,
          }),
        });
      } else {
        // Document doesn't exist, create a new document in "avaliacoes" collection
        const avaliacaoRef = firestore.collection("avaliacoes").doc();

        // Set the data for the new document with an array containing the new entry
        await avaliacaoRef.set({
          uid: userUid,
          avaliacoes: [
            {
              name: name,
              rating: rating,
              text: text,
              emergencyUid: emergencyUid,
            },
          ],
        });
      }

      // Return a success response
      return {success: true};
    } catch (error) {
      // Return an error response
      return {success: false, error: error};
    }
  });

export const getAvaliacoes = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const {uid} = data;

    const list: admin.firestore.DocumentData[] = [];

    functions.logger.log("UID USER -----> "+uid);

    // Get a Firestore instance

    // Search for a document with matching uid in "avaliacoes" collection
    const querySnapshot = await db
      .collection("avaliacoes")
      .where("uid", "==", uid)
      .get();


    // Iterate through each document
    querySnapshot.forEach((doc) => {
      const acceptants: any[] = doc.data().avaliacoes || [];
      acceptants.forEach((rate) => {
        functions.logger.log(rate.toString());
        list.push(rate.toString());
      });
      return JSON.stringify(list);
    });
  });


export const getHistoric = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const {uid} = data;

    const list: admin.firestore.DocumentData[] = [];

    functions.logger.log("UID USER -----> " + uid);

    // Search for a document with matching uid in "historic" collection
    const querySnapshot = await db
      .collection("historico")
      .where("uid", "==", uid)
      .get();

    // Iterate through each document
    querySnapshot.forEach((doc) => {
      list.push(doc.data().historic);
    });

    functions.logger.log(JSON.stringify(list));
    return JSON.stringify(list); // Return the list outside the forEach loop
  });

