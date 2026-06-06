import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UniEvent, User, University } from '../types';
import { CalendarDays, MapPin, Users, Plus, Timer, Tag, Compass, Sparkles, Check } from 'lucide-react';

interface EventsProps {
  currentUser: User;
}

const CATEGORIES = [
  'Sports Week',
  'Farewell',
  'Convocation',
  'Orientation',
  'Trips',
  'Seminars',
  'Workshops',
  'Competitions',
  'Tech Fest',
  'Cultural Festival',
  'Society Events',
  'Other'
];

export default function Events({ currentUser }: EventsProps) {
  const [events, setEvents] = useState<UniEvent[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Interactive create form toggles
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [organizers, setOrganizers] = useState('');
  const [eventUni, setEventUni] = useState(currentUser.university);

  // Filter keys
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load schedule events and HEC universities
  const loadContent = async () => {
    setLoading(true);
    try {
      const list = await api.events.list();
      setEvents(list);

      const directory = await api.universities.list();
      setUnis(directory);
    } catch (err) {
      console.error('Failed to load scheduler resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location) return;

    try {
      const payload = {
        title,
        description,
        date,
        time,
        location,
        category,
        organizers,
        university: eventUni
      };
      const created = await api.events.create(payload);
      if (created) {
        setEvents(prev => [created, ...prev]);
        setShowCreate(false);
        // Reset states
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setLocation('');
        setOrganizers('');
      }
    } catch (err) {
      console.error('Failed to design scheduler event card', err);
    }
  };

  const handleRsvp = async (id: string) => {
    try {
      const res = await api.events.rsvp(id);
      if (res) {
        setEvents(prev => prev.map(ev => {
          if (ev.id === id) {
            const hasId = ev.rsvpIds.includes(currentUser.id);
            return {
              ...ev,
              rsvpIds: hasId 
                ? ev.rsvpIds.filter(uid => uid !== currentUser.id)
                : [...ev.rsvpIds, currentUser.id]
            };
          }
          return ev;
        }));
      }
    } catch (err) {
      console.error('RSVP toggling failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you want to cancel and remove this scheduled university event?')) return;
    try {
      const res = await api.events.delete(id);
      if (res.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to remove schedule event log', err);
    }
  };

  const filteredEvents = events.filter(ev => {
    return selectedCategory === 'All' || ev.category === selectedCategory;
  });

  return (
    <div id="events-root" className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-5 rounded-2xl shadow-sm transition-all">
        <div className="text-left">
          <h1 className="text-xl font-serif italic font-extrabold text-neutral-900 dark:text-[#edfcf5] flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#006644] dark:text-emerald-400" />
            University Event Scheduler
          </h1>
          <p className="text-xs text-neutral-500 dark:text-[#a2b5ac] mt-1">
            Browse and organize sports events, farewell teas, hackathons, seminars, and trips. Keep classmates notified.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Campus Event</span>
        </button>
      </div>

      {/* Expandable Schedule Form Drawer */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-5 rounded-3xl space-y-4 text-left animate-fade-in shadow-sm">
          <h2 className="text-sm font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2 flex items-center gap-2 uppercase tracking-wide">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" /> Specify Event Coordinates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. FAST CS Farewell Party '26 or UET Cricket League"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-[#edfcf5] placeholder-neutral-400 dark:placeholder-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#006644]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 rounded-xl px-2 py-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Hosting University</label>
                <select
                  value={eventUni}
                  onChange={(e) => setEventUni(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 rounded-xl px-2 py-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Universities (Nationwide Meetup)</option>
                  {unis.map(u => (
                    <option key={u.id} value={u.name}>{u.name.replace(/\(.*?\)/, '')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-[#edfcf5] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#006644]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-[#edfcf5] rounded-xl px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Specific Location / Hall</label>
              <input
                type="text"
                required
                placeholder="e.g. Executive Lounge or Seminar Hall A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-[#edfcf5] placeholder-neutral-400 dark:placeholder-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#006644]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Event Brief Description</label>
              <textarea
                rows={2}
                placeholder="Summarize coordinates, timeline, RSVP limits, agenda or dress codes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 placeholder-neutral-400 dark:placeholder-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-[#006644] resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Organizers / Society Desk</label>
              <input
                type="text"
                placeholder="e.g. FAST Computing Society or Batch Representatives"
                value={organizers}
                onChange={(e) => setOrganizers(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-[#edfcf5] placeholder-neutral-400 dark:placeholder-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="bg-[#F3F1ED] hover:bg-[#E8E4E0] text-neutral-700 dark:bg-[#13231a] dark:text-[#a2b5ac] border border-[#E8E4E0] dark:border-transparent text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Publish Timeline Coordinates
            </button>
          </div>
        </form>
      )}

      {/* Category filters */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 items-center border-b border-[#E8E4E0] dark:border-[#1a2d22]">
        <span className="text-xs text-neutral-500 dark:text-[#a2b5ac] font-bold flex items-center gap-1 flex-shrink-0">
          <Compass className="h-3.5 w-3.5" /> Filter Category:
        </span>
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer border ${
            selectedCategory === 'All' 
              ? 'bg-[#006644] text-white border-transparent shadow-xs' 
              : 'bg-[#F3F1ED] border-[#E8E4E0] text-neutral-700 hover:bg-[#E8E4E0] dark:bg-[#13231a]/80 dark:border-[#1a2d22] dark:text-[#a2b5ac] dark:hover:text-slate-100'
          }`}
        >
          All Events
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer border ${
              selectedCategory === cat 
                ? 'bg-[#006644] text-white border-transparent shadow-xs' 
                : 'bg-[#F3F1ED] border-[#E8E4E0] text-neutral-700 hover:bg-[#E8E4E0] dark:bg-[#13231a]/80 dark:border-[#1a2d22] dark:text-[#a2b5ac] dark:hover:text-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Stream grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-500 dark:text-slate-400">Loading scheduled event registries...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-slate-900/10 dark:border-slate-900/40 rounded-3xl text-neutral-500 dark:text-slate-500 text-xs">
          No upcoming scheduled events recorded in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((ev) => {
            const isRsvped = ev.rsvpIds.includes(currentUser.id);
            return (
              <div
                key={ev.id}
                className="bg-white border border-[#E8E4E0] hover:shadow-xs rounded-3xl p-5 flex flex-col justify-between space-y-4 text-left dark:bg-[#111a14]/90 dark:border-[#1a2d22] transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-[#E6F0EC] text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-[#006644]/15 dark:border-emerald-500/20 uppercase tracking-wider">
                      {ev.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 text-[10px] font-bold">
                      <Timer className="h-3 w-3 animate-pulse" />
                      <span>{ev.date} @ {ev.time || 'TBA'}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-serif italic font-extrabold text-neutral-900 dark:text-slate-100">{ev.title}</h3>
                  
                  {ev.description && (
                    <p className="text-[11px] text-neutral-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#F3F1ED] dark:border-[#1a2d22] flex flex-col gap-1.5 text-[10px] text-neutral-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="truncate text-neutral-700 dark:text-slate-300">{ev.location} ({ev.university.replace(/\(.*?\)/, '')})</span>
                    </div>
                    {ev.organizers && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-neutral-705 dark:text-slate-300">Organizers: {ev.organizers}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F3F1ED] dark:border-[#1a2d22]">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4.5 w-4.5 text-neutral-400" />
                    <span className="text-[10px] text-neutral-500 dark:text-zinc-400 font-bold">{ev.rsvpIds.length} classmates going</span>
                  </div>

                  <div className="flex gap-2">
                    {/* Delete trigger for coordinate author Or Admins */}
                    {(currentUser.role === 'admin' || ev.organizers.toLowerCase().includes(currentUser.name.toLowerCase())) && (
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 font-bold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer"
                      >
                        Cancel Event
                      </button>
                    )}

                    <button
                      onClick={() => handleRsvp(ev.id)}
                      className={`text-[10px] font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 ${
                        isRsvped 
                          ? 'bg-[#006644] text-white shadow-xs' 
                          : 'bg-[#F3F1ED] hover:bg-[#E8E4E0] text-neutral-750 dark:bg-[#0a110d] dark:border-[#1a2d22] dark:hover:bg-[#13281c] border border-transparent dark:text-emerald-400'
                      }`}
                    >
                      {isRsvped ? <Check className="h-3.5 w-3.5" /> : null}
                      <span>{isRsvped ? 'Going' : 'RSVP Here'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
