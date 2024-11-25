import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react'; // Importa FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Vista de cuadrícula
import timeGridPlugin from '@fullcalendar/timegrid'; // Vista de tiempo
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'; // Para interactividad
import { EventClickArg } from '@fullcalendar/core';
// Define los tipos de los eventos
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
}

const Calendar: React.FC = () => {
  // Estado para manejar los eventos esto puede venir desde firebase para ser persistente los eventos
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Evento 1', start: '2024-11-25' },
    { id: '2', title: 'Evento 2', start: '2024-11-26', end: '2024-11-27' },
  ]);

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
