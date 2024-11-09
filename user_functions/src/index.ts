import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

export const addUser = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Método no permitido");
    return;
  }

  const { email, password, nombre, areaId, puestoId } = req.body;

  try {
    // Usa el SDK Admin para crear un usuario sin afectar la sesión actual
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Agrega la información del usuario a Firestore
    await db.collection("usuarios").doc(userRecord.uid).set({
      uid: userRecord.uid,
      correoElectronico: email,
      nombre,
      areaTrabajo: areaId,
      puestoTrabajo: puestoId,
      primerInicioSesion: true,
    });

    res.status(200).send(`Usuario ${nombre} registrado con éxito`);
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send("Error al registrar usuario");
  }
});
