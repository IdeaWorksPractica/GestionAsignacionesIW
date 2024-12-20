import React, { useState, useEffect } from 'react';
import './Calendar.css';
import FullCalendar from '@fullcalendar/react'; // Importa FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Vista de cuadrícula
import timeGridPlugin from '@fullcalendar/timegrid'; // Vista de tiempo
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'; // Para interactividad
import { Spin } from 'antd';
import { EventClickArg } from '@fullcalendar/core';
import { useNavigate } from 'react-router-dom';
import { getInfoUser } from '../../auth/services/auth.services';
import { IUser } from '../../shared/models/IUsuario';
import { IAsignacion } from '../../shared/models/IAsignaciones';
import {
  obtenerAsignacionesPorUsuario,
  getAsignacionesCreadasPorJefeConUsuarios,
} from '../../asignaciones/services/asignaciones.service';
import moment from 'moment';
import { ModalRegisterAsignacion } from '../../asignaciones/ui/ModalAsignaciones';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<IAsignacion[]>([]);
  const [userLogged, setUserLogged] = useState<IUser | null>(null);
  const [userRol, setRol] = useState<string>('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<IAsignacion | null>(null);

  const coloresDisponibles = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];

  const getInfo = async () => {
    const user = await getInfoUser();
    setUserLogged(user);
    setRol(user?.puestoTrabajoDetalle?.rol ?? '');

    if (user?.puestoTrabajoDetalle?.rol === 'Jefe') {
      const jefeAsignaciones = await getAsignacionesCreadasPorJefeConUsuarios(user.uid);
      setAsignaciones(jefeAsignaciones.map(({ asignacion }) => asignacion));
      eventos(jefeAsignaciones);
    } else if (user) {
      const usuarioAsignaciones = await obtenerAsignacionesPorUsuario(user.uid);
      console.log('Asignaciones del usuario: ', usuarioAsignaciones)
      setAsignaciones(usuarioAsignaciones);
      eventos(usuarioAsignaciones);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getInfo();
  }, []);

  const eventos = (events: any) => {
    setEvents(
      events.map((event: any) => ({
        id: event.asignacion ? event.asignacion.id : event.id, // Verifica si el objeto tiene el formato de "Jefe" o "Empleado"
        title: event.asignacion ? event.asignacion.nombre : event.nombre, // Selecciona el título según el formato
        start: moment(
          event.asignacion ? event.asignacion.fechaInicio : event.fechaInicio
        ).format('YYYY-MM-DD'), // Formatea la fecha de inicio según el formato
        end: moment(
          event.asignacion ? event.asignacion.fechaFin : event.fechaFin
        ).format('YYYY-MM-DD'), // Formatea la fecha de fin según el formato
        backgroundColor: generarColorAleatorio(),
        borderColor: '#FFFFFF',
      }))
    );
  };
  

  const generarColorAleatorio = () => {
    const indiceAleatorio = Math.floor(Math.random() * coloresDisponibles.length);
    return coloresDisponibles[indiceAleatorio];
  };

  const handleDateClick = (arg: DateClickArg) => {
    const title = prompt('Introduce un título para el evento:');
    if (title) {
      setEvents([
        ...events,
        { id: String(events.length + 1), title, start: arg.dateStr },
      ]);
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const asignacionSeleccionada = asignaciones.find(asignacion => asignacion.id === arg.event.id);
    if (userRol === 'Jefe' && asignacionSeleccionada) {
      setSelectedAsignacion(asignacionSeleccionada);
      setIsModalOpen(true);
    } else if (userRol === 'Empleado') {
      navigate(`/home/asignacion/${asignacionSeleccionada?.idAsignacionesXUsuario}`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAsignacion(null);
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Calendario de actividades</h1>
      {loading ? (
        <Spin
          tip="Cargando..."
          size="large"
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
          />
          {isModalOpen && (
            <ModalRegisterAsignacion
              loggedUser={userLogged}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              selectedAsignacion={selectedAsignacion}
              refreshData={() => {
                handleModalClose();
                getInfo();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Calendar;
