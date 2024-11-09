import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { IAreaTrabajo, IPuestoTrabajo } from "../models/AdminModels";
import { notification } from "antd";

// Función para obtener la información de los cargos
async function getCargosInfo() {
  const cargosCollectionRef = collection(db, "cargos");

  try {
    const cargosSnapshot = await getDocs(cargosCollectionRef);
    const cargosMap: { [key: string]: IPuestoTrabajo } = {};
    cargosSnapshot.forEach((doc) => {
      cargosMap[doc.id] = doc.data() as IPuestoTrabajo;
    });
    return Object.values(cargosMap);
  } catch (error) {
    console.error("Error fetching cargos:", error);
    return [];
  }
}

// Función para obtener la información de las áreas
async function getAreasInfo() {
  const areasCollectionRef = collection(db, "areas");

  try {
    const areasSnapshot = await getDocs(areasCollectionRef);
    const areasMap: { [key: string]: IAreaTrabajo } = {};
    areasSnapshot.forEach((doc) => {
      areasMap[doc.id] = doc.data() as IAreaTrabajo;
    });
    return Object.values(areasMap);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return [];
  }
}

// Función para registrar un área
async function registerArea(nombre: string): Promise<string | null> {
  try {
    const existingAreas = await getAreasInfo();
    const normalizedNewAreaName = normalizeName(nombre);

    const areaExists = existingAreas.some(
      (area) => normalizeName(area.nombre) === normalizedNewAreaName
    );

    if (areaExists) {
      console.error(`El área "${nombre}" ya existe.`);
      notification.error({
        message: 'Error',
        description: 'El area que intenta registrar ya existe.',
      });
      return null;
    }

    const areasCollectionRef = collection(db, "areas");
    const newAreaRef = doc(areasCollectionRef);

    const areaWithId: IAreaTrabajo = {
      id: newAreaRef.id,
      nombre,
    };

    await setDoc(newAreaRef, areaWithId);

    return newAreaRef.id;
  } catch (error) {
    console.error("Error al registrar el área:", error);
    return null;
  }
}

// Función para registrar cargos en un área específica
async function registerCargos(
  idArea: string,
  cargos: Omit<IPuestoTrabajo, "id" | "idAreaTrabajo">[]
) {
  try {
    const existingCargos = await getCargosInfo();
    const normalizedExistingCargos = existingCargos
      .filter((cargo) => cargo.idAreaTrabajo === idArea)
      .map((cargo) => normalizeName(cargo.nombre));

    for (const cargo of cargos) {
      const normalizedCargoName = normalizeName(cargo.nombre);

      if (normalizedExistingCargos.includes(normalizedCargoName)) {
        console.warn(`El cargo "${cargo.nombre}" ya existe en el área.`);
        continue;
      }

      const cargosCollectionRef = collection(db, "cargos");
      const newCargoRef = doc(cargosCollectionRef);

      const cargoWithId: IPuestoTrabajo = {
        id: newCargoRef.id,
        nombre: cargo.nombre,
        idAreaTrabajo: idArea,
        rol: cargo.rol,
      };

      await setDoc(newCargoRef, cargoWithId);
    }
  } catch (error) {
    console.error("Error al registrar cargos:", error);
    throw error;
  }
}

// Función para eliminar cargos por ID
async function deleteCargos(cargosToDelete: IPuestoTrabajo[]) {
  try {
    for (const cargo of cargosToDelete) {
      const cargoRef = doc(db, "cargos", cargo.id);
      await deleteDoc(cargoRef);
    }
    notification.success({
      message: 'Éxito',
      description: 'Los cargos seleccionados fueron eliminados correctamente.',
    });
  } catch (error) {
    console.error("Error al eliminar cargos:", error);
    notification.error({
      message: 'Error al eliminar',
      description: 'Hubo un problema al eliminar los cargos seleccionados.',
    });
    throw error;
  }
}

// Función para normalizar nombres eliminando acentos y poniendo en minúsculas
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export { getAreasInfo, getCargosInfo, registerArea, registerCargos, deleteCargos };
