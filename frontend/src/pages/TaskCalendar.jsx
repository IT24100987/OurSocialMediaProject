import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { MdEvent, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const TaskCalendar = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Staff sees only their tasks. Admin/Manager see all tasks.
            const url = user.role === 'Staff' ? '/tasks/my' : '/tasks';
            const { data } = await api.get(url);
            setTasks(data);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Logic
    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    const today = () => setCurrentDate(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Create array for the calendar grid
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getTasksForDay = (day) => {
        return tasks.filter(t => {
            if(!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.getDate() === day && 
                   taskDate.getMonth() === currentDate.getMonth() && 
                   taskDate.getFullYear() === currentDate.getFullYear();
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-4 md:p-6 pb-20 w-full max-w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div>
                   <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                     <MdEvent className="mr-3 text-blue-500" /> Operational Calendar
                   </h1>
                   <p className="text-slate-500 mt-1">Visualize deadlines and system operations. Hover over dates for details.</p>
                </div>
                
                <div className="flex items-center space-x-2 lg:space-x-4 bg-white p-2 lg:p-3 rounded-xl shadow-sm border border-slate-200">
                    <button 
                        onClick={prevMonth} 
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all duration-200 hover:scale-110"
                        title="Previous Month"
                    >
                        <MdChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg lg:text-xl font-black text-slate-700 w-32 lg:w-48 text-center uppercase tracking-widest">
                       {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button 
                        onClick={nextMonth} 
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all duration-200 hover:scale-110"
                        title="Next Month"
                    >
                        <MdChevronRight size={20} />
                    </button>
                    <button 
                        onClick={today} 
                        className="bg-blue-600 text-white px-3 lg:px-4 py-2 font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md text-xs lg:text-sm uppercase"
                        title="Go to Today"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-4 lg:gap-8 items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 font-medium">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                        <span className="text-sm text-slate-600 font-medium">Pending</span>
                    </div>
                    <div className="ml-auto text-sm text-slate-500">
                        Total Tasks: <span className="font-bold text-slate-700">{tasks.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-slate-800 text-white font-bold uppercase tracking-widest text-xs text-center border-b border-slate-300">
                    <div className="py-4">Sun</div>
                    <div className="py-4">Mon</div>
                    <div className="py-4">Tue</div>
                    <div className="py-4">Wed</div>
                    <div className="py-4">Thu</div>
                    <div className="py-4">Fri</div>
                    <div className="py-4">Sat</div>
                </div>
                
                {/* Cells */}
                <div className="grid grid-cols-7 border-l border-t border-slate-100">
                    {/* Empty Slots */}
                    {blanks.map(blank => (
                        <div key={`blank-${blank}`} className="border-r border-b border-slate-100 min-h-[140px] bg-slate-50"></div>
                    ))}
                    
                    {/* Actual Days */}
                    {days.map(day => {
                        const dayTasks = getTasksForDay(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                        const fullDate = `${monthNames[currentDate.getMonth()]} ${day}, ${currentDate.getFullYear()}`;
                        const taskCount = dayTasks.length;
                        
                        return (
                            <div 
                                key={`day-${day}`} 
                                className={`border-r border-b border-slate-100 min-h-[140px] p-2 transition-all duration-200 hover:bg-blue-50 hover:shadow-md hover:z-10 relative group ${isToday ? 'bg-blue-50/50 ring-2 ring-blue-300' : ''}`}
                                title={`${fullDate} - ${taskCount} task${taskCount !== 1 ? 's' : ''}`}
                            >
                                {/* Date Header */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`font-bold text-sm w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                                        isToday ? 'bg-blue-600 text-white shadow-lg scale-110' : 
                                        'text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-100'
                                    }`}>
                                        {day}
                                    </div>
                                    {taskCount > 0 && (
                                        <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold group-hover:bg-blue-600 transition-colors">
                                            {taskCount}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Date Tooltip - Shows on hover */}
                                <div className="absolute -top-8 left-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                                    {fullDate}
                                    <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                </div>
                                
                                {/* Tasks List */}
                                <div className="space-y-1 overflow-y-auto max-h-[90px]">
                                    {dayTasks.map(t => (
                                        <div 
                                            key={t._id} 
                                            title={`${t.title} - Status: ${t.status}${t.assignedTo?.name ? '\nAssigned to: ' + t.assignedTo.name : ''}`}
                                            className={`px-2 py-1 text-xs truncate rounded border cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm font-medium ${
                                                t.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' :
                                                t.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' : 
                                                'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                            }`}
                                        >
                                            <span className="inline-block mr-1">
                                                {t.status === 'Completed' ? '✓' : '•'}
                                            </span>
                                            <span className="truncate">{t.title}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Empty state for days with no tasks */}
                                {taskCount === 0 && (
                                    <div className="text-slate-300 text-xs text-center mt-4 opacity-0 group-hover:opacity-50 transition-opacity duration-200">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TaskCalendar;
