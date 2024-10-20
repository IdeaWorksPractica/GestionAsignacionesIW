export interface IAreaTrabajo {
  id: string;
  nombre: string;
}
export interface IPuestoTrabajo {
  id: string;
  nombre: string;
  idAreaTrabajo: string;
  rol: "Jefe" | "Empleado";
}
