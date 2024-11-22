export interface IAsignacion {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  creadoPor: string;
}

export interface IasigacionesXusuario{
  id:string;
  uid:string;
  id_asignacion:string;
  estado:'Sin Iniciar' | 'En Proceso' | 'Terminada';
}

export interface IComentarioAsignacion {
  id: string; 
  id_asignacion: string; 
  uid_usuario: string;
  contenido: string;
  fechaCreacion: Date;
}
