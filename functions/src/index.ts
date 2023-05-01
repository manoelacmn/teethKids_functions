/* eslint-disable max-len */
import * as functions from "../node_modules/firebase-functions";
import * as admin from "../node_modules/firebase-admin";
import { getFirestore , getDocs , collection } from "firebase-admin/firestore";

admin.initializeApp();


const db = getFirestore()


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
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc: { id: unknown; data: () => unknown; }) => {
    console.log(doc.id, " => ", doc.data());
  });
});



export const getEmergencies = functions.firestore
  .document("emergency/{any}")
  .onCreate(() => {
    functions.logger.log("nova emergencia");
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
