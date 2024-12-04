import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getUserById } from "../../adminUsuarios/services/user.services";
import { Timestamp } from "firebase/firestore";
import {
  IAsignacionSeleccionada,
  IasigacionesXusuario,
  IAsignacion,
  IComentarioAsignacion,
} from "../../shared/models/IAsignaciones";
import { IUser } from "../../shared/models/IUsuario";

import { getInfoUser } from "../../auth/services/auth.services";
const asignacionesCollection = collection(db, "asignaciones");
const asignacionesXUsuarioCollection = collection(db, "asignacionesXusuario");
const comentariosAsignacionesCollection = collection(
  db,
  "comentariosAsignaciones"
);

// Obtener la asignación seleccionada
async function obtenerAsignacionSeleccionada(
  id_asignacion_usuario: string
): Promise<IAsignacionSeleccionada> {
  try {
    const usuario = await getInfoUser();
    //console.log(usuario)
    // Obtener la asignación por usuario
    const asignacionUsuarioSnapshot = await getDocs(
      query(
        asignacionesXUsuarioCollection,
        where("id", "==", id_asignacion_usuario)
      )
    );
    if (asignacionUsuarioSnapshot.empty) {
      throw new Error("No se encontró la asignación del usuario.");
    }

    const asignacionUsuario =
      asignacionUsuarioSnapshot.docs[0].data() as IasigacionesXusuario;

    // Obtener la asignación principal
    const asignacionSnapshot = await getDocs(
      query(
        asignacionesCollection,
        where("id", "==", asignacionUsuario.id_asignacion)
      )
    );
    if (asignacionSnapshot.empty) {
      throw new Error("No se encontró la asignación principal.");
    }

    const asignacion = asignacionSnapshot.docs[0].data() as IAsignacion;
    const fechaInicio =
  asignacion.fechaInicio instanceof Timestamp
    ? new Date(asignacion.fechaInicio.seconds * 1000).toLocaleDateString("es-ES", {
        year: "2-digit", // Año con dos dígitos
        month: "2-digit", // Mes con dos dígitos
        day: "2-digit", // Día con dos dígitos
      })
    : "No definida";

const fechaFin =
  asignacion.fechaFin instanceof Timestamp
    ? new Date(asignacion.fechaFin.seconds * 1000).toLocaleDateString("es-ES", {
        year: "2-digit", // Año con dos dígitos
        month: "2-digit", // Mes con dos dígitos
        day: "2-digit", // Día con dos dígitos
      })
    : "No definida";
    const usuarioCreador = await getUserById(asignacion.creadoPor);
    const creadoPor = {
      nombre_usuario: usuarioCreador?.nombre,
      uid: asignacion.creadoPor,
      correo_electronico: usuarioCreador?.correoElectronico,
      cargo: usuarioCreador?.puestoTrabajo
    };

    const usuarioAsignado = {
      nombre_usuario: usuario?.nombre,
      uid: asignacionUsuario.uid,
      correo_electronico: usuario?.correoElectronico,
    };

    // Construir el modelo `IAsignacionSeleccionada`
    const asignacionSeleccionada: IAsignacionSeleccionada = {
      id_asignacion: asignacion.id,
      nombre_asignacion: asignacion.nombre,
      descripcion_asignacion: asignacion.descripcion,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      id_asignacion_usuario: asignacionUsuario.id,
      estado: asignacionUsuario.estado,
      creadoPor,
      usuario_asignado: usuarioAsignado,
    };

    return asignacionSeleccionada;
  } catch (error) {
    console.error("Error al obtener la asignación seleccionada:", error);
    throw error;
  }
}

// Obtener comentarios por `id_asignacionXusuario`
async function obtenerComentariosPorAsignacionUsuario(
  id_asignacionXusuario: string
): Promise<IComentarioAsignacion[]> {
  try {
    const comentariosSnapshot = await getDocs(
      query(
        comentariosAsignacionesCollection,
        where("id_asignacionXusuario", "==", id_asignacionXusuario)
      )
    );

    return comentariosSnapshot.docs.map(
      (doc) => doc.data() as IComentarioAsignacion
    );
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw error;
  }
}

// Actualizar el estado de una asignación por usuario
async function actualizarEstadoAsignacionUsuario(
  id_asignacion_usuario: string,
  nuevoEstado: "Sin Iniciar" | "En Proceso" | "Terminada"
): Promise<void> {
  try {
    const asignacionUsuarioRef = doc(
      asignacionesXUsuarioCollection,
      id_asignacion_usuario
    );
    await updateDoc(asignacionUsuarioRef, { estado: nuevoEstado });
    console.log(`Estado actualizado a: ${nuevoEstado}`);
  } catch (error) {
    console.error("Error al actualizar el estado de la asignación:", error);
    throw error;
  }
}

export {
  obtenerAsignacionSeleccionada,
  obtenerComentariosPorAsignacionUsuario,
  actualizarEstadoAsignacionUsuario,
};
