import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
  } from "firebase/auth";
  import { collection, query, where, limit, getDocs, updateDoc } from "firebase/firestore";
  import { auth, db } from "../../../firebase";
  import { IUser } from "../../shared/models/IUsuario";
  import { notification } from "antd";
  
  export interface AuthResponse {
    authenticated: boolean;
    error: string | null;
  }
  
  // Función de login
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
      console.log(user);
  
      const userSnapshot = await getUserByEmail(email);
      if (!userSnapshot) {
        return {
          authenticated: false,
          error: "Usuario no encontrado en la base de datos.",
        };
      }
  
      const userData = userSnapshot.data() as IUser;
      console.log(userData);
  
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
          console.log('Usuario ya no está en su primer inicio.');
        }
      }
  
      return { authenticated: true, error: null };
    } catch (error: any) {
      console.log(error);
      if (error.code === "auth/invalid-credential") {
        notification.error({
          message: "Error de Autenticación",
          description: "Credenciales incorrectas. Por favor, verifica tu información.",
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
  
  // Función para actualizar el campo 'primerInicioSesion'
  const updatePrimerInicioSesion = async (userDocRef: any) => {
    try {
      await updateDoc(userDocRef.ref, {
        primerInicioSesion: false,
      });
      console.log("El campo 'primerInicioSesion' se ha actualizado a false.");
    } catch (error) {
      console.error("Error al actualizar el campo 'primerInicioSesion':", error);
    }
  };
  
  // Función para obtener el documento de usuario desde Firestore por correo
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
  
  // Nueva función para recuperar contraseña
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
  
      // Verificar si el usuario existe en Firestore
      const userSnapshot = await getUserByEmail(email);
      if (!userSnapshot) {
        notification.error({
          message: "Error de Autenticación",
          description: "Usuario no encontrado. Verifica tu correo electrónico.",
          placement: "topRight",
        });
        return;
      }
  
      // Enviar correo para restablecer contraseña
      await sendPasswordResetEmail(auth, email);
      notification.success({
        message: "Correo enviado",
        description: "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
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
          description: "Ocurrió un error inesperado al enviar el correo de recuperación.",
          placement: "topRight",
        });
      }
    }
  };
  
  export { login, forgotPassword };
  