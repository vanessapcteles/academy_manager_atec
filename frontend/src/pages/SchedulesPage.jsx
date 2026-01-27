import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import pt from 'date-fns/locale/pt';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DashboardLayout from '../components/layout/DashboardLayout';
import { horarioService } from '../services/horarioService';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

const locales = {
    'pt': pt,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

function SchedulesPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllSchedules();
    }, []);

    const loadAllSchedules = async () => {
        try {
            const data = await horarioService.getAllSchedules();

            const formattedEvents = data.map(lesson => ({
                id: lesson.id,
                title: `${lesson.nome_modulo} (${lesson.codigo_turma})`,
                start: new Date(lesson.inicio),
                end: new Date(lesson.fim),
                resource: lesson
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
        } finally {
            setLoading(false);
        }
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: 'var(--primary)',
                borderRadius: '8px',
                opacity: 0.8,
                color: 'white',
                border: 'none',
                display: 'block'
            }
        };
    };

    return (
        <DashboardLayout>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}>
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Horário Geral</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualize todas as aulas agendadas na academia</p>
                </div>
            </div>

            <div className="glass-card" style={{ height: '700px', padding: '1.5rem' }}>
                <style>{`
                    .rbc-calendar { color: var(--text-primary); }
                    .rbc-off-range-bg { background: rgba(255,255,255,0.02); }
                    .rbc-header { color: var(--text-secondary); border-bottom: 1px solid var(--border-glass); padding: 10px 0; }
                    .rbc-today { background: rgba(56, 189, 248, 0.05); }
                    .rbc-time-content { border-top: 1px solid var(--border-glass); }
                    .rbc-time-gutter { color: var(--text-secondary); }
                    .rbc-timeslot-group { border-bottom: 1px solid var(--border-glass); }
                    .rbc-toolbar button { color: white; border: 1px solid var(--border-glass); background: rgba(255,255,255,0.05); }
                    .rbc-toolbar button:active, .rbc-toolbar button.rbc-active { background: var(--primary); box-shadow: none; }
                    .rbc-event { padding: 4px 8px; font-size: 0.85rem; }
                `}</style>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <p>A carregar horários...</p>
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={eventStyleGetter}
                        messages={{
                            next: "Próximo",
                            previous: "Anterior",
                            today: "Hoje",
                            month: "Mês",
                            week: "Semana",
                            day: "Dia"
                        }}
                        culture='pt'
                        defaultView='week'
                    />
                )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <div className="glass-card" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Info size={20} style={{ color: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Para agendar ou editar aulas, aceda à página específica da <strong>Turma</strong> desejada.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SchedulesPage;
