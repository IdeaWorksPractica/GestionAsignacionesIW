import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { IUser } from "../../shared/models/IUsuario";
import { notification } from "antd";

export interface AuthResponse {
  authenticated: boolean;
  error: string | null;
}

const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userSnapshot = await getUserByEmail(email);
    if (!userSnapshot) {
      return {
        authenticated: false,
        error: "Usuario no encontrado en la base de datos.",
      };
    }

    const userData = userSnapshot.data() as IUser;
    if (!user.emailVerified) {
      if (userData.primerInicioSesion) {
        await sendPasswordResetEmail(auth, email);
        notification.info({
          message: "Primer Inicio de Sesión",
          description:
            "Es necesario que actualices tu contraseña, se te enviará un correo electrónico para actualizarla.",
          placement: "topRight",
        });
        return {
          authenticated: false,
          error:
            "Es tu primer inicio de sesión. Revisa tu correo para actualizar tu contraseña.",
        };
      }
    } else {
      if (userData.primerInicioSesion) {
        await updatePrimerInicioSesion(userSnapshot);
      } else {
        notification.success({
          message: "Inicio de sesion exitoso",
          description:
            `Bienvenido ${userData.nombre}`,
          placement: "topRight",
        });
      }
    }

    return {
      authenticated: true,
      error: null,
    };
  } catch (error: any) {
    console.log(error);
    if (error.code === "auth/invalid-credential") {
      notification.error({
        message: "Error de Autenticación",
        description:
          "Credenciales incorrectas. Por favor, verifica tu información.",
        placement: "topRight",
      });
      return { authenticated: false, error: "Credenciales incorrectos." };
    }

    if (error.code === "auth/user-not-found") {
      notification.error({
        message: "Error de Autenticación",
        description: "Usuario no encontrado. Verifica tu correo electrónico.",
        placement: "topRight",
      });
      return { authenticated: false, error: "Usuario no encontrado." };
    }

    if (error.code === "auth/invalid-email") {
      notification.error({
        message: "Error de Autenticación",
        description: "Correo electrónico no válido. Verifica el formato.",
        placement: "topRight",
      });
      return { authenticated: false, error: "Correo electrónico no válido." };
    }

    notification.error({
      message: "Error",
      description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      placement: "topRight",
    });

    return { authenticated: false, error: "Ocurrió un error inesperado." };
  }
};

const updatePrimerInicioSesion = async (userDocRef: any) => {
  try {
    await updateDoc(userDocRef.ref, {
      primerInicioSesion: false,
    });
  } catch (error) {
    console.error("Error al actualizar el campo 'primerInicioSesion':", error);
  }
};

const getUserByEmail = async (email: string) => {
  const usersCollectionRef = collection(db, "usuarios");

  const q = query(
    usersCollectionRef,
    where("correoElectronico", "==", email),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0];
  } else {
    return null;
  }
};

const forgotPassword = async (email: string): Promise<void> => {
  try {
    if (!email) {
      notification.error({
        message: "Error",
        description: "Por favor, ingresa tu correo electrónico.",
        placement: "topRight",
      });
      return;
    }

    const userSnapshot = await getUserByEmail(email);
    if (!userSnapshot) {
      notification.error({
        message: "Error de Autenticación",
        description: "Usuario no encontrado. Verifica tu correo electrónico.",
        placement: "topRight",
      });
      return;
    }

    await sendPasswordResetEmail(auth, email);
    notification.success({
      message: "Correo enviado",
      description:
        "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
      placement: "topRight",
    });
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      notification.error({
        message: "Error de Autenticación",
        description: "Usuario no encontrado. Verifica tu correo electrónico.",
        placement: "topRight",
      });
    } else if (error.code === "auth/invalid-email") {
      notification.error({
        message: "Error de Autenticación",
        description: "Correo electrónico no válido. Verifica el formato.",
        placement: "topRight",
      });
    } else {
      notification.error({
        message: "Error",
        description:
          "Ocurrió un error inesperado al enviar el correo de recuperación.",
        placement: "topRight",
      });
    }
  }
};

const checkActiveSession = (): Promise<User | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
};

const getInfoUser = async (): Promise<IUser | null> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        try {
          const userSnapshot = await getUserByEmail(user.email);
          if (userSnapshot) {
            const userData = userSnapshot.data() as IUser;
            resolve(userData);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(null);
      }
    });
  });
};

const logout = async (): Promise<string | null> => {
  try {
    await signOut(auth);
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  }
};
export { login, logout, forgotPassword, checkActiveSession, getInfoUser};
