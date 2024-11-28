import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'; // Importa FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Vista de cuadrícula
import timeGridPlugin from '@fullcalendar/timegrid'; // Vista de tiempo
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'; // Para interactividad
import { EventClickArg } from '@fullcalendar/core';
import { getInfoUser } from '../../auth/services/auth.services';
import { IUser } from '../../shared/models/IUsuario';
import { IAsignacion } from '../../shared/models/IAsignaciones';
import {
  obtenerAsignacionesPorUsuario,
  getAsignacionesCreadasPorJefeConUsuarios,
} from '../../asignaciones/services/asignaciones.service';
import moment from 'moment';
// Define los tipos de los eventos
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
}

const Calendar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<IAsignacion[]>([]);
  const [userLogged, setUserLogged] = useState<IUser | null>(null);
  const [userRol, setRol] = useState<string>('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const coloresGenerados = new Set();
  const coloresDisponibles = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD']; // Lista de colores disponibles
  
  const getInfo = async () => {
    setLoading(true);
    const user = await getInfoUser();
    setUserLogged(user);
    setRol(user?.puestoTrabajoDetalle?.rol ?? '');
  
    // Obtener asignaciones según el rol
    if (user?.puestoTrabajoDetalle?.rol === 'Jefe') {
      const jefeAsignaciones = await getAsignacionesCreadasPorJefeConUsuarios(user.uid);
      setAsignaciones(jefeAsignaciones.map(({ asignacion }) => asignacion));
      console.log(jefeAsignaciones);
      eventos(jefeAsignaciones);
    } else {
      console.log('Se obtendran los datos de los demas usuarios')
      const usuarioAsignaciones = await obtenerAsignacionesPorUsuario(user.uid);
      eventos(usuarioAsignaciones);
      setAsignaciones(usuarioAsignaciones);
    }
  
    setLoading(false);
  };

  useEffect(() => {
    getInfo();
  }, []);

  const eventos = (events:any) => {
    setEvents(
      events.map(event => ({
        id: event.asignacion.id, // Asegúrate de que 'id' está definido en IAsignacion
        title: event.asignacion.nombre, // Cambia 'titulo' según tu interfaz
        start: moment(event.asignacion.fechaInicio).format('YYYY-MM-DD'), // Asegúrate de que 'fechaInicio' es el formato correcto
        end: moment(event.asignacion.fechaFin).format('YYYY-MM-DD'), // Asegúrate de que 'fechaInicio' es el formato correcto
        backgroundColor: generarColorAleatorio(),
        borderColor: '#FFFFFF',
      })));
  }

const generarColorAleatorio = () => {
  const indiceAleatorio = Math.floor(Math.random() * coloresDisponibles.length);
  console.log('Indice juco?..',indiceAleatorio);
  return coloresDisponibles[indiceAleatorio]; // Selecciona un color aleatorio de la lista
};


  // Manejar clics en fechas
  const handleDateClick = (arg: DateClickArg) => {
    const title = prompt('Introduce un título para el evento:');
    if (title) {
      setEvents([
        ...events,
        { id: String(events.length + 1), title, start: arg.dateStr },
      ]);
    }
  };

  // Manejar clics en eventos
  const handleEventClick = (arg: EventClickArg) => {
    // llamar modal para actualizar / borrar evento
    if (window.confirm(`¿Deseas eliminar el evento "${arg.event.title}"?`)) {
      setEvents(events.filter((event) => event.id !== arg.event.id));
    }
  };

  return (
    <div className='p-5'>
      <h1 className="text-xl font-bold mb-4">Calendario de actividades</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events} // Eventos dinámicos
        dateClick={handleDateClick} // Click en fecha
        eventClick={handleEventClick} // Click en evento
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </div>
  );
};

export default Calendar;
