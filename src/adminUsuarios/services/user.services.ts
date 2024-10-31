import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { IAreaTrabajo, IPuestoTrabajo } from "../../shared/models/AdminModels";

// Variables globales para almacenar los datos de cargos, áreas y usuarios
let cargosMap: { [key: string]: IPuestoTrabajo } = {};
let areasMap: { [key: string]: IAreaTrabajo } = {};
let usuariosArray: {
  correoElectronico: string;
  nombre: string;
  primerInicioSesion: boolean;
  uid: string;
  areaTrabajo: string;
  puestoTrabajo: string;
}[] = [];

// Función para obtener y retornar la información de cargos
export async function getCargosInfo() {
  const cargosCollectionRef = collection(db, "cargos");

  try {
    const cargosSnapshot = await getDocs(cargosCollectionRef);
    cargosMap = {}; // Reinicia el mapa para evitar datos duplicados
    cargosSnapshot.forEach((doc) => {
      cargosMap[doc.id] = doc.data() as IPuestoTrabajo;
    });
    return Object.values(cargosMap); // Retorna los datos de cargos como un arreglo
  } catch (error) {
    console.error("Error fetching cargos:", error);
    return [];
  }
}

// Función para obtener y retornar la información de áreas
export async function getAreasInfo() {
  const areasCollectionRef = collection(db, "areas");

  try {
    const areasSnapshot = await getDocs(areasCollectionRef);
    areasMap = {}; // Reinicia el mapa para evitar datos duplicados
    areasSnapshot.forEach((doc) => {
      areasMap[doc.id] = doc.data() as IAreaTrabajo;
    });
    return Object.values(areasMap); // Retorna los datos de áreas como un arreglo
  } catch (error) {
    console.error("Error fetching areas:", error);
    return [];
  }
}

// Función para obtener la información de usuarios, actualizar usuariosArray y retornarla
export async function getUsersInfo() {
  // Primero obtener cargos y áreas
  await getCargosInfo();
  await getAreasInfo();

  const usuariosCollectionRef = collection(db, "usuarios");

  try {
    const usuariosSnapshot = await getDocs(usuariosCollectionRef);
    usuariosArray = []; // Reinicia el arreglo para evitar datos duplicados

    usuariosSnapshot.forEach((doc) => {
      const userData = doc.data();

      // Obtener el nombre del área y puesto asociados
      const userArea =
        areasMap[userData.areaTrabajo]?.nombre || "Área no encontrada";
      const userPuesto =
        cargosMap[userData.puestoTrabajo]?.nombre || "Puesto no encontrado";

      // Agregar el usuario con la información de área y puesto
      usuariosArray.push({
        correoElectronico: userData.correoElectronico,
        nombre: userData.nombre,
        primerInicioSesion: userData.primerInicioSesion,
        uid: userData.uid,
        areaTrabajo: userArea,
        puestoTrabajo: userPuesto,
      });
    });
    return usuariosArray; // Retorna el arreglo de usuarios
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Exportar las variables globales para que puedan ser usadas externamente
export { cargosMap, areasMap, usuariosArray };
