export interface IAsignacion {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  usuariosAsignados: string[];
  areaTrabajo?: string;
  creadoPor: string;
}
