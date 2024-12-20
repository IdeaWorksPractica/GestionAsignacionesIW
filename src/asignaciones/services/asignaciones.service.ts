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
  writeBatch,
} from "firebase/firestore";
import {
  IAsignacion,
  IasigacionesXusuario,
  IComentarioAsignacion,
} from "../../shared/models/IAsignaciones";
import { getUsersInfo } from "../../adminUsuarios/services/user.services";

// Colecciones de Firestore
const asignacionesCollection = collection(db, "asignaciones");
const asignacionesXUsuarioCollection = collection(db, "asignacionesXusuario");
const comentariosAsignacionesCollection = collection(
  db,
  "comentariosAsignaciones"
);

// Crear una asignación y asignarla a múltiples usuarios
async function crearAsignacion(
  asignacion: IAsignacion,
  usuarios: string[]
): Promise<void> {
  try {
    const asignacionRef = doc(asignacionesCollection);
    await setDoc(asignacionRef, { ...asignacion, id: asignacionRef.id });
    await crearAsignacionXusuario(asignacionRef.id, usuarios);
  } catch (error) {
    console.error("Error al crear la asignación:", error);
    throw error;
  }
}

async function crearAsignacionXusuario(
  id: string,
  usuarios: string[]
): Promise<void> {
  try {
    for (const uid of usuarios) {
      const asignacionUsuarioRef = doc(asignacionesXUsuarioCollection);
      const asignacionXUsuario: IasigacionesXusuario = {
        id: asignacionUsuarioRef.id,
        uid,
        id_asignacion: id,
        estado: "Sin Iniciar",
      };
      await setDoc(asignacionUsuarioRef, asignacionXUsuario);
    }
  } catch (error) {
    console.error("Error al crear la asignaciones por usuario:", error);
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
async function obtenerAsignacionesPorUsuario(
  uid: string
): Promise<IAsignacion[]> {
  try {
    // Paso 1: Obtener los documentos de asignacionesXUsuario para el usuario
    const usuariosSnapshot = await getDocs(
      query(asignacionesXUsuarioCollection, where("uid", "==", uid))
    );

    // Paso 2: Obtener los IDs de las asignaciones y los IDs de `asignacionesXUsuario`
    const asignacionesData = usuariosSnapshot.docs.map((doc) => ({
      idAsignacion: doc.data().id_asignacion,
      idAsignacionesXUsuario: doc.id, // Guardamos el ID del documento
    }));

    if (asignacionesData.length === 0) return []; // Si no hay asignaciones, retornamos un array vacío

    // Paso 3: Obtener los IDs únicos de las asignaciones
    const asignacionesIds = asignacionesData.map((data) => data.idAsignacion);

    // Paso 4: Realizar una única consulta a la colección de asignaciones usando `where("id", "in", [...])`
    const asignacionesSnapshot = await getDocs(
      query(asignacionesCollection, where("id", "in", asignacionesIds))
    );

    // Paso 5: Transformar los datos obtenidos e incluir el ID de asignacionesXUsuario
    const asignaciones = asignacionesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const idAsignacionesXUsuario = asignacionesData.find(
        (item) => item.idAsignacion === doc.id
      )?.idAsignacionesXUsuario;

      return {
        ...data,
        idAsignacionesXUsuario, // Incluimos el ID de asignacionesXUsuario
        fechaInicio: data.fechaInicio?.toDate(),
        fechaFin: data.fechaFin?.toDate(),
      };
    });

    return asignaciones as IAsignacion[];
  } catch (error) {
    console.error("Error al obtener asignaciones por usuario:", error);
    throw error;
  }
}

// Obtener asignaciones creadas por un jefe con información de usuarios asignados
async function getAsignacionesCreadasPorJefeConUsuarios(
  jefeUid: string
): Promise<
  {
    asignacion: IAsignacion;
    usuarios: {
      idAsignacionesXUsuario: string; // Agregado para incluir el ID del documento
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

    const asignacionesQ = query(
      asignacionesCollection,
      where("creadoPor", "==", jefeUid)
    );
    const asignacionesSnapshot = await getDocs(asignacionesQ);

    const resultado: {
      asignacion: IAsignacion;
      usuarios: {
        idAsignacionesXUsuario: string; // Agregado para incluir el ID del documento
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
          idAsignacionesXUsuario: doc.id, // Aquí se incluye el ID del documento
          uid: usuarioAsignado.uid,
          nombre: usuarioInfo?.nombre || "Usuario no encontrado",
          correoElectronico:
            usuarioInfo?.correoElectronico || "Correo no encontrado",
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
async function actualizarAsignacion(
  id: string,
  data: Partial<IAsignacion>
): Promise<void> {
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
    const batch = writeBatch(db);

    // Paso 1: Eliminar la asignación principal
    const asignacionRef = doc(asignacionesCollection, id);
    batch.delete(asignacionRef);

    // Paso 2: Eliminar las referencias en asignacionesXUsuario
    const asignacionesXUsuarioQuery = query(
      asignacionesXUsuarioCollection,
      where("id_asignacion", "==", id)
    );
    const asignacionesXUsuarioSnapshot = await getDocs(
      asignacionesXUsuarioQuery
    );
    asignacionesXUsuarioSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Paso 3: (Opcional) Eliminar comentarios o cualquier otra relación
    const comentariosQuery = query(
      comentariosAsignacionesCollection,
      where("id_asignacion", "==", id)
    );
    const comentariosSnapshot = await getDocs(comentariosQuery);
    comentariosSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Paso 4: Ejecutar el batch
    await batch.commit();

    console.log("Asignación y datos relacionados eliminados correctamente.");
  } catch (error) {
    console.error(
      "Error al eliminar la asignación y sus datos relacionados:",
      error
    );
    throw error;
  }
}

// Crear un comentario
async function crearComentario(
  comentario: IComentarioAsignacion
): Promise<void> {
  try {
    const comentarioRef = doc(comentariosAsignacionesCollection);
    await setDoc(comentarioRef, { ...comentario, id: comentarioRef.id });
  } catch (error) {
    console.error("Error al crear el comentario:", error);
    throw error;
  }
}

// Obtener comentarios por asignación
async function obtenerComentarios(
  id_asignacion: string
): Promise<IComentarioAsignacion[]> {
  try {
    const snapshot = await getDocs(comentariosAsignacionesCollection);
    return snapshot.docs
      .map((doc) => doc.data() as any)
      .filter((comentario) => comentario.id_asignacion === id_asignacion);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw error;
  }
}

// Actualizar un comentario
async function actualizarComentario(
  id: string,
  data: Partial<IComentarioAsignacion>
): Promise<void> {
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

async function obtenerUsuariosPorAsignacion(
  idAsignacion: string
): Promise<{ uid: string; idAsignacionXUsuario: string }[]> {
  try {
    // Consulta para obtener los usuarios asignados a la asignación específica
    const usuariosSnapshot = await getDocs(
      query(
        asignacionesXUsuarioCollection,
        where("id_asignacion", "==", idAsignacion)
      )
    );

    // Mapea los resultados para incluir `uid` y el ID del documento (asignacionXUsuario)
    const usuariosAsignados = usuariosSnapshot.docs.map((doc) => ({
      uid: doc.data().uid,
      idAsignacionXUsuario: doc.id, // El ID del documento en Firestore
    }));
    return usuariosAsignados;

  } catch (error) {
    console.error("Error al obtener usuarios por asignación:", error);
    throw error;
  }
}


async function eliminarAsignacionesPorUsuarios(
  uids: string[],
  idAsignacion: string
): Promise<void> {
  try {
    for (const uid of uids) {
      // Consulta para obtener el documento específico en la colección asignacionesXUsuario
      const usuariosSnapshot = await getDocs(
        query(
          asignacionesXUsuarioCollection,
          where("uid", "==", uid),
          where("id_asignacion", "==", idAsignacion)
        )
      );

      for (const docSnapshot of usuariosSnapshot.docs) {
        // Eliminar el documento correspondiente
        await deleteDoc(doc(asignacionesXUsuarioCollection, docSnapshot.id));
      }
    }
    console.log(
      `Usuarios eliminados de la asignación ${idAsignacion}: ${uids.join(", ")}`
    );
  } catch (error) {
    console.error("Error al eliminar asignaciones de usuarios:", error);
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
  obtenerUsuariosPorAsignacion,
  eliminarAsignacionesPorUsuarios,
  crearAsignacionXusuario,
};
