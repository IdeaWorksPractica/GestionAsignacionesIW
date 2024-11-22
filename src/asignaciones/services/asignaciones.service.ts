import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { IAsignacion, IasigacionesXusuario, IComentarioAsignacion } from "../../shared/models/IAsignaciones";
import { getUsersInfo } from "../../adminUsuarios/services/user.services";

// Colecciones de Firestore
const asignacionesCollection = collection(db, "asignaciones");
const asignacionesXUsuarioCollection = collection(db, "asignacionesXusuario");
const comentariosAsignacionesCollection = collection(db, "comentariosAsignaciones");

// Crear una asignación y asignarla a múltiples usuarios
async function crearAsignacion(asignacion: IAsignacion, usuarios: string[]): Promise<void> {
  try {
    const asignacionRef = doc(asignacionesCollection);
    await setDoc(asignacionRef, { ...asignacion, id: asignacionRef.id });

    for (const uid of usuarios) {
      const asignacionUsuarioRef = doc(asignacionesXUsuarioCollection);
      const asignacionXUsuario: IasigacionesXusuario = {
        id: asignacionUsuarioRef.id,
        uid,
        id_asignacion: asignacionRef.id,
        estado: "Sin Iniciar",
      };
      await setDoc(asignacionUsuarioRef, asignacionXUsuario);
    }
  } catch (error) {
    console.error("Error al crear la asignación:", error);
    throw error;
  }
}

// Leer todas las asignaciones
async function obtenerAsignaciones(): Promise<IAsignacion[]> {
  try {
    const snapshot = await getDocs(asignacionesCollection);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      fechaInicio: doc.data().fechaInicio?.toDate(),
      fechaFin: doc.data().fechaFin?.toDate(),
    })) as IAsignacion[];
  } catch (error) {
    console.error("Error al obtener asignaciones:", error);
    throw error;
  }
}

// Leer asignaciones de un usuario específico
async function obtenerAsignacionesPorUsuario(uid: string): Promise<IAsignacion[]> {
  try {
    const usuariosSnapshot = await getDocs(
      query(asignacionesXUsuarioCollection, where("uid", "==", uid))
    );

    const asignacionesIds = usuariosSnapshot.docs.map((doc) => doc.data().id_asignacion);

    const asignacionesPromises = asignacionesIds.map((id) =>
      getDocs(query(asignacionesCollection, where("id", "==", id)))
    );

    const asignacionesSnapshots = await Promise.all(asignacionesPromises);

    const asignaciones = asignacionesSnapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => ({
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate(),
        fechaFin: doc.data().fechaFin?.toDate(),
      }))
    );

    return asignaciones as IAsignacion[];
  } catch (error) {
    console.error("Error al obtener asignaciones por usuario:", error);
    throw error;
  }
}

// Obtener asignaciones creadas por un jefe con información de usuarios asignados
async function getAsignacionesCreadasPorJefeConUsuarios(jefeUid: string): Promise<
  {
    asignacion: IAsignacion;
    usuarios: {
      uid: string;
      nombre: string;
      correoElectronico: string;
      areaTrabajo: string;
      puestoTrabajo: string;
      estado: "Sin Iniciar" | "En Proceso" | "Terminada";
    }[];
  }[]
> {
  try {
    const usuariosInfo = await getUsersInfo();
    const usuariosMap = usuariosInfo.reduce((map, user) => {
      map[user.uid] = user;
      return map;
    }, {} as Record<string, any>);

    const asignacionesQ = query(asignacionesCollection, where("creadoPor", "==", jefeUid));
    const asignacionesSnapshot = await getDocs(asignacionesQ);

    const resultado: {
      asignacion: IAsignacion;
      usuarios: {
        uid: string;
        nombre: string;
        correoElectronico: string;
        areaTrabajo: string;
        puestoTrabajo: string;
        estado: "Sin Iniciar" | "En Proceso" | "Terminada";
      }[];
    }[] = [];

    for (const asignacionDoc of asignacionesSnapshot.docs) {
      const asignacionData = {
        ...asignacionDoc.data(),
        fechaInicio: asignacionDoc.data().fechaInicio?.toDate(),
        fechaFin: asignacionDoc.data().fechaFin?.toDate(),
      } as IAsignacion;

      const usuariosQ = query(
        asignacionesXUsuarioCollection,
        where("id_asignacion", "==", asignacionData.id)
      );
      const usuariosSnapshot = await getDocs(usuariosQ);

      const usuariosAsignados = usuariosSnapshot.docs.map((doc) => {
        const usuarioAsignado = doc.data() as IasigacionesXusuario;
        const usuarioInfo = usuariosMap[usuarioAsignado.uid];

        return {
          uid: usuarioAsignado.uid,
          nombre: usuarioInfo?.nombre || "Usuario no encontrado",
          correoElectronico: usuarioInfo?.correoElectronico || "Correo no encontrado",
          areaTrabajo: usuarioInfo?.areaTrabajo || "Área no encontrada",
          puestoTrabajo: usuarioInfo?.puestoTrabajo || "Puesto no encontrado",
          estado: usuarioAsignado.estado,
        };
      });

      resultado.push({
        asignacion: asignacionData,
        usuarios: usuariosAsignados,
      });
    }

    return resultado;
  } catch (error) {
    console.error("Error al obtener asignaciones y usuarios asignados:", error);
    throw error;
  }
}

// Actualizar una asignación
async function actualizarAsignacion(id: string, data: Partial<IAsignacion>): Promise<void> {
  try {
    const asignacionRef = doc(asignacionesCollection, id);
    await updateDoc(asignacionRef, data);
  } catch (error) {
    console.error("Error al actualizar la asignación:", error);
    throw error;
  }
}

// Eliminar una asignación
async function eliminarAsignacion(id: string): Promise<void> {
  try {
    const asignacionRef = doc(asignacionesCollection, id);
    await deleteDoc(asignacionRef);
  } catch (error) {
    console.error("Error al eliminar la asignación:", error);
    throw error;
  }
}

// Crear un comentario
async function crearComentario(comentario: IComentarioAsignacion): Promise<void> {
  try {
    const comentarioRef = doc(comentariosAsignacionesCollection);
    await setDoc(comentarioRef, { ...comentario, id: comentarioRef.id });
  } catch (error) {
    console.error("Error al crear el comentario:", error);
    throw error;
  }
}

// Obtener comentarios por asignación
async function obtenerComentarios(id_asignacion: string): Promise<IComentarioAsignacion[]> {
  try {
    const snapshot = await getDocs(comentariosAsignacionesCollection);
    return snapshot.docs
      .map((doc) => doc.data() as IComentarioAsignacion)
      .filter((comentario) => comentario.id_asignacion === id_asignacion);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw error;
  }
}

// Actualizar un comentario
async function actualizarComentario(id: string, data: Partial<IComentarioAsignacion>): Promise<void> {
  try {
    const comentarioRef = doc(comentariosAsignacionesCollection, id);
    await updateDoc(comentarioRef, data);
  } catch (error) {
    console.error("Error al actualizar el comentario:", error);
    throw error;
  }
}

// Eliminar un comentario
async function eliminarComentario(id: string): Promise<void> {
  try {
    const comentarioRef = doc(comentariosAsignacionesCollection, id);
    await deleteDoc(comentarioRef);
  } catch (error) {
    console.error("Error al eliminar el comentario:", error);
    throw error;
  }
}

export {
  crearAsignacion,
  obtenerAsignaciones,
  obtenerAsignacionesPorUsuario,
  getAsignacionesCreadasPorJefeConUsuarios,
  actualizarAsignacion,
  eliminarAsignacion,
  crearComentario,
  obtenerComentarios,
  actualizarComentario,
  eliminarComentario,
};
