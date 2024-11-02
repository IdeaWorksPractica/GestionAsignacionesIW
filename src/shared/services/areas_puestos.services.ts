import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { IAreaTrabajo, IPuestoTrabajo } from "../models/AdminModels";

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

  export{
    getAreasInfo,
    getCargosInfo
  }