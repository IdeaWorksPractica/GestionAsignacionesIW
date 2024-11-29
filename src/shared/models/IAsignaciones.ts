export interface IAsignacion {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  creadoPor: string;
  idAsignacionesXUsuario:string | null
}

export interface IasigacionesXusuario{
  id:string;
  uid:string;
  id_asignacion:string;
  estado:'Sin Iniciar' | 'En Proceso' | 'Terminada';
}

export interface IComentarioAsignacion {
  id: string; 
  id_asignacionXusuario: string; 
  uid_usuario: string;
  contenido: string;
  fechaCreacion: Date;
}

export interface IAsignacionSeleccionada{
  id_asignacion:string;
  nombre_asignacion : string;
  descripcion_asignacion : string;
  fechaInicio: Date;
  fechaFin: Date;
  id_asignacion_usuario: string;
  estado: string;
  creadoPor: {
    nombre_usuario: string;
    uid: string;
    correo_electronico: string;
  }
  usuario_asignado:{
    nombre_usuario: string;
    uid: string;
    correo_electronico: string
  }
}