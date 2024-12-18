import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { IComentarioAsignacion } from "../../shared/models/IAsignaciones";

// Referencia a la colección de comentarios
const comentariosAsignacionesCollection = collection(
  db,
  "comentariosAsignaciones"
);

// Función para obtener comentarios por `id_asignacionXusuario`
const getComentariosByAsignacion = async (
  idAsignacionXUsuario: string
): Promise<IComentarioAsignacion[]> => {
  try {
    const q = query(
      comentariosAsignacionesCollection,
      where("id_asignacionXusuario", "==", idAsignacionXUsuario)
    );
    const querySnapshot = await getDocs(q);
    const comentarios: IComentarioAsignacion[] = querySnapshot.docs.map(
      (doc) => ({
        id: doc.id,
        id_asignacionXusuario: doc.data().id_asignacionXusuario,
        uid_usuario: doc.data().uid_usuario,
        contenido: doc.data().contenido,
        fechaCreacion: doc.data().fechaCreacion.toDate(), // Convertimos de Timestamp a Date
      })
    );
    return comentarios;
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw new Error("Error al obtener comentarios");
  }
};

// Función para crear un nuevo comentario
const createComentario = async (
  comentario: Omit<IComentarioAsignacion, "id" | "fechaCreacion">
): Promise<IComentarioAsignacion> => {
  try {
    const newComentario = {
      ...comentario,
      fechaCreacion: Timestamp.now(), // Creamos el campo de fecha con el Timestamp actual
    };
    const docRef = await addDoc(
      comentariosAsignacionesCollection,
      newComentario
    );
    return {
      id: docRef.id,
      ...newComentario,
      fechaCreacion: newComentario.fechaCreacion.toDate(), // Convertimos el Timestamp a Date
    };
  } catch (error) {
    console.error("Error al crear comentario:", error);
    throw new Error("Error al crear comentario");
  }
};

// Función para obtener y organizar los comentarios por fecha
const getComentariosAgrupadosPorFecha = async (
  idAsignacionXUsuario: string
): Promise<
  {
    fecha: string;
    comentarios: {
      contenido: string;
      uid_usuario: string;
      hora: string;
      id: string;
    }[];
  }[]
> => {
  try {
    const q = query(
      comentariosAsignacionesCollection,
      where("id_asignacionXusuario", "==", idAsignacionXUsuario)
    );
    const querySnapshot = await getDocs(q);

    // Convertimos los documentos en un arreglo de comentarios
    const comentarios: IComentarioAsignacion[] = querySnapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion.toDate(), // Convertimos a Date
      })
    ) as IComentarioAsignacion[];

    // Agrupamos los comentarios por fecha
    const agrupados = comentarios.reduce((acc, comentario) => {
      const fechaCompleta = comentario.fechaCreacion; // Obtenemos la fecha completa
      const fechaStr = fechaCompleta.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }); // Ejemplo: 24 noviembre 2024

      const horaStr = fechaCompleta.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); // Ejemplo: 19:28

      const comentarioSimplificado = {
        contenido: comentario.contenido,
        uid_usuario: comentario.uid_usuario,
        hora: horaStr,
        id: comentario.id,
      };

      // Verificamos si ya existe un grupo para esta fecha
      const grupoExistente = acc.find((grupo) => grupo.fecha === fechaStr);
      if (grupoExistente) {
        grupoExistente.comentarios.push(comentarioSimplificado);
        // Ordenamos los comentarios por hora
        grupoExistente.comentarios.sort((a, b) =>
          a.hora.localeCompare(b.hora)
        );
      } else {
        // Si no existe, creamos un nuevo grupo
        acc.push({
          fecha: fechaStr,
          comentarios: [comentarioSimplificado],
        });
      }
      return acc;
    }, [] as { fecha: string; comentarios: { contenido: string; uid_usuario: string; hora: string; id: string }[] }[]);

    return agrupados;
  } catch (error) {
    console.error("Error obteniendo comentarios agrupados:", error);
    throw error;
  }
};

export {
  getComentariosByAsignacion,
  createComentario,
  getComentariosAgrupadosPorFecha,
};
