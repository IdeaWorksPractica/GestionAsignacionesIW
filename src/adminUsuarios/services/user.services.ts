import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { IAreaTrabajo, IPuestoTrabajo } from "../../shared/models/AdminModels";
import { notification } from "antd";

let cargosMap: { [key: string]: IPuestoTrabajo } = {};
let areasMap: { [key: string]: IAreaTrabajo } = {};
let usuariosArray: {
  correoElectronico: string;
  nombre: string;
  primerInicioSesion: boolean;
  uid: string;
  areaId: string;
  puestoId: string;
  areaTrabajo: string;
  puestoTrabajo: string;
}[] = [];

export async function getCargosInfo() {
  const cargosCollectionRef = collection(db, "cargos");

  try {
    const cargosSnapshot = await getDocs(cargosCollectionRef);
    cargosMap = {};
    cargosSnapshot.forEach((doc) => {
      cargosMap[doc.id] = doc.data() as IPuestoTrabajo;
    });
    return Object.values(cargosMap);
  } catch (error) {
    console.error("Error fetching cargos:", error);
    return [];
  }
}

export async function getAreasInfo() {
  const areasCollectionRef = collection(db, "areas");

  try {
    const areasSnapshot = await getDocs(areasCollectionRef);
    areasMap = {};
    areasSnapshot.forEach((doc) => {
      areasMap[doc.id] = doc.data() as IAreaTrabajo;
    });
    return Object.values(areasMap);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return [];
  }
}

export async function getUsersInfo() {
  await getCargosInfo();
  await getAreasInfo();

  const usuariosCollectionRef = collection(db, "usuarios");

  try {
    const usuariosSnapshot = await getDocs(usuariosCollectionRef);
    usuariosArray = [];

    usuariosSnapshot.forEach((doc) => {
      const userData = doc.data();

      const userArea =
        areasMap[userData.areaTrabajo]?.nombre || "Área no encontrada";
      const userPuesto =
        cargosMap[userData.puestoTrabajo]?.nombre || "Puesto no encontrado";
      usuariosArray.push({
        correoElectronico: userData.correoElectronico,
        nombre: userData.nombre,
        primerInicioSesion: userData.primerInicioSesion,
        uid: userData.uid,
        areaId: userData.areaTrabajo,
        areaTrabajo: userArea,
        puestoId: userData.puestoTrabajo,
        puestoTrabajo: userPuesto,
      });
    });
    return usuariosArray;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function registerUser(
  email: string,
  password: string,
  userInfo: {
    nombre: string;
    areaId: string;
    puestoId: string;
  }
) {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    const usuarioRef = doc(db, "usuarios", userId);
    await setDoc(usuarioRef, {
      uid: userId,
      correoElectronico: email,
      nombre: userInfo.nombre,
      areaTrabajo: userInfo.areaId,
      puestoTrabajo: userInfo.puestoId,
      primerInicioSesion: true,
    });
    notification.success({
      message: "Registro Exitoso",
      description:
        `El usuario ${userInfo.nombre} se registro exitosamente`,
      placement: "topRight",
    });
    return userId;
  } catch (error) {
    notification.error({
      message: "Error de registro",
      description:
        "Error al registrar al usuario",
      placement: "topRight",
    });
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

export async function updateUserInfo(uid: string, updatedInfo: {
  nombre?: string;
  areaId?: string;
  puestoId?: string;
  correoElectronico?: string;
}) {
  try {
    // Referencia al documento del usuario en la colección "usuarios" mediante su UID
    const userRef = doc(db, "usuarios", uid);
    
    // Actualizar los campos del usuario con el objeto `updatedInfo`
    await updateDoc(userRef, {
      ...updatedInfo,
      areaTrabajo: updatedInfo.areaId, // Opcional: actualiza el área si se proporciona
      puestoTrabajo: updatedInfo.puestoId // Opcional: actualiza el puesto si se proporciona
    });
    notification.success({
      message: "Actualizacion Exitosa",
      description:
        `Los datos de ${updatedInfo.nombre} se actualizaron exitosamente`,
      placement: "topRight",
    });
    console.log("Información del usuario actualizada con éxito");
  } catch (error) {
    notification.error({
      message: "Error al actualizar",
      description:
        "Error al actualizar los datos",
      placement: "topRight",
    });
    console.error("Error al actualizar la información del usuario:", error);
    throw error;
  }
}
export { cargosMap, areasMap, usuariosArray };
