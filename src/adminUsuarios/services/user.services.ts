import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { notification } from "antd";
import { IPuestoTrabajo, IAreaTrabajo } from "../../shared/models/AdminModels";
import {
  getAreasInfo,
  getCargosInfo,
} from "../../shared/services/areas_puestos.services";

// Función para obtener la información de los usuarios
async function getUsersInfo() {
  // Obtenemos los datos de cargos y áreas
  const cargosArray = await getCargosInfo();
  const areasArray = await getAreasInfo();
  const usuariosCollectionRef = collection(db, "usuarios");

  // Convertimos los arreglos en mapas indexados por `id`
  const cargosMap = cargosArray.reduce((map, cargo) => {
    map[cargo.id] = cargo;
    return map;
  }, {} as { [key: string]: IPuestoTrabajo });

  const areasMap = areasArray.reduce((map, area) => {
    map[area.id] = area;
    return map;
  }, {} as { [key: string]: IAreaTrabajo });

  try {
    const usuariosSnapshot = await getDocs(usuariosCollectionRef);
    const usuariosArray: {
      correoElectronico: string;
      nombre: string;
      primerInicioSesion: boolean;
      uid: string;
      areaId: string;
      puestoId: string;
      areaTrabajo: string;
      puestoTrabajo: string;
    }[] = [];

    // Iteramos sobre cada usuario y extraemos la información
    usuariosSnapshot.forEach((doc) => {
      const userData = doc.data();

      // Accedemos al nombre de área y puesto usando los mapas generados
      const userArea = areasMap[userData.areaTrabajo]?.nombre || "Área no encontrada";
      const userPuesto = cargosMap[userData.puestoTrabajo]?.nombre || "Puesto no encontrado";

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


// Función para registrar un nuevo usuario
async function registerUser(
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
      description: `El usuario ${userInfo.nombre} se registró exitosamente`,
      placement: "topRight",
    });
    return userId;
  } catch (error) {
    notification.error({
      message: "Error de registro",
      description: "Error al registrar al usuario",
      placement: "topRight",
    });
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

// Función para actualizar la información del usuario
async function updateUserInfo(
  uid: string,
  updatedInfo: {
    nombre?: string;
    areaId?: string;
    puestoId?: string;
    correoElectronico?: string;
  }
) {
  try {
    const userRef = doc(db, "usuarios", uid);

    await updateDoc(userRef, {
      ...updatedInfo,
      areaTrabajo: updatedInfo.areaId,
      puestoTrabajo: updatedInfo.puestoId,
    });
    notification.success({
      message: "Actualización Exitosa",
      description: `Los datos de ${updatedInfo.nombre} se actualizaron exitosamente`,
      placement: "topRight",
    });
    console.log("Información del usuario actualizada con éxito");
  } catch (error) {
    notification.error({
      message: "Error al actualizar",
      description: "Error al actualizar los datos",
      placement: "topRight",
    });
    console.error("Error al actualizar la información del usuario:", error);
    throw error;
  }
}

export{
  getUsersInfo,
  registerUser,
  updateUserInfo
}
