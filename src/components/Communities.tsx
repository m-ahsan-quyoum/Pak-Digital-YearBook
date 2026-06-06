import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { University, User, Post, UniEvent } from '../types';
import { School, MapPin, Globe, Users, Trophy, BookOpen, Calendar, ChevronRight, Activity, Filter, Grid, Compass } from 'lucide-react';

interface CommunitiesProps {
  currentUser: User;
  onSelectStudent: (user: User) => void;
  onSelectPost: (post: Post) => void;
}

const DEPARTMENTS = [
  'Computer Science',
  'Artificial Intelligence',
  'Software Engineering',
  'Cyber Security',
  'Data Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration'
];

export default function Communities({ currentUser, onSelectStudent, onSelectPost }: CommunitiesProps) {
  const [unis, setUnis] = useState<University[]>([]);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  // Community State elements
  const [communityData, setCommunityData] = useState<{
    students: User[];
    posts: Post[];
    events: UniEvent[];
  }>({ students: [], posts: [], events: [] });

  // Navigation Filter
  const [subTab, setSubTab] = useState<'roster' | 'memories' | 'schedule' | 'batches'>('roster');
  const [deptFilter, setDeptFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  // Load universities listing
  useEffect(() => {
    const fetchUnis = async () => {
      setLoading(true);
      try {
        const list = await api.universities.list();
        setUnis(list);

        // Auto-select user's current university if found
        const myUni = list.find(u => u.name.toLowerCase() === currentUser.university.toLowerCase()) || list[0];
        if (myUni) {
          setSelectedUni(myUni);
        }
      } catch (err) {
        console.error('Failed to load universities listings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnis();
  }, [currentUser]);

  // Load Community resources based on selected university
  useEffect(() => {
    if (!selectedUni) return;

    const fetchCommunityData = async () => {
      setSubLoading(true);
      try {
        const data = await api.communities.getFolder(selectedUni.name);
        setCommunityData(data);
      } catch (err) {
        console.error('Failed to view community folder data', err);
      } finally {
        setSubLoading(false);
      }
    };
    fetchCommunityData();
  }, [selectedUni]);

  // Filters calculation
  const filteredStudents = communityData.students.filter(stud => {
    const matchesDept = deptFilter === 'All' || stud.department === deptFilter;
    const matchesBatch = batchFilter === 'All' || stud.batch === batchFilter;
    return matchesDept && matchesBatch;
  });

  const filteredPosts = communityData.posts.filter(post => {
    return deptFilter === 'All' || post.department === deptFilter;
  });

  return (
    <div id="communities-root" className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-5 rounded-2xl shadow-sm transition-all">
        <div className="text-left">
          <h1 className="text-xl font-serif italic font-extrabold text-neutral-900 dark:text-[#edfcf5] flex items-center gap-2">
            <School className="text-[#006644] dark:text-emerald-400 h-5 w-5" />
            University Communities Directory
          </h1>
          <p className="text-xs text-neutral-500 dark:text-[#a2b5ac] mt-1">
            Choose any university from Pakistan HEC database directory to enter its dedicated hub portal.
          </p>
        </div>

        {/* Selected Hub Dropdown picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-[#a2b5ac] font-bold hidden md:inline">Jump Hub:</span>
          <select
            value={selectedUni?.id || ''}
            onChange={(e) => {
              const matched = unis.find(u => u.id === e.target.value);
              if (matched) setSelectedUni(matched);
            }}
            className="bg-[#F9F8F6] border border-[#E8E4E0] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-[#edfcf5] focus:outline-none focus:border-[#006644] dark:focus:border-emerald-400 cursor-pointer"
          >
            {unis.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500 dark:text-slate-400">Retrieving HEC registries...</div>
      ) : selectedUni ? (
        <div className="space-y-6">
          {/* Glassmorphic Hub Hero */}
          <div className="bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#122017]/80 dark:border-[#1a2d22] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between gap-6 transition-all">
            <div className="space-y-3.5 max-w-2xl text-left">
              <div className="flex items-center gap-2.5">
                <span className="bg-[#E6F0EC] text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#006644]/15 dark:border-emerald-500/20">
                  {selectedUni.province} Province
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-slate-400 font-mono">HEC Registered</span>
              </div>
              
              <h2 className="text-2xl font-serif italic font-extrabold text-neutral-900 dark:text-slate-100">{selectedUni.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-slate-400 font-medium pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{selectedUni.location}</span>
                </div>
                {selectedUni.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-neutral-400" />
                    <a href={selectedUni.website} target="_blank" rel="noreferrer" className="text-[#006644] dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold">
                      Official portal <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hub simple counter statistics */}
            <div className="flex gap-4 items-center justify-start md:justify-center">
              <div className="bg-white border border-[#E8E4E0] dark:bg-[#0c1611]/80 dark:border-[#1a2d22] p-3.5 rounded-2xl text-center min-w-[100px] shadow-xs">
                <span className="text-2xl font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 block">
                  {communityData.students.length}
                </span>
                <span className="text-[9px] text-neutral-500 dark:text-slate-500 font-bold uppercase tracking-wide">Registered</span>
              </div>
              <div className="bg-white border border-[#E8E4E0] dark:bg-[#0c1611]/80 dark:border-[#1a2d22] p-3.5 rounded-2xl text-center min-w-[100px] shadow-xs">
                <span className="text-2xl font-serif italic font-extrabold text-teal-600 dark:text-teal-400 block">
                  {communityData.posts.length}
                </span>
                <span className="text-[9px] text-neutral-500 dark:text-slate-500 font-bold uppercase tracking-wide">Timelines</span>
              </div>
            </div>
          </div>

          {/* Hub Sections Filter Tabs */}
          <div className="border-b border-[#E8E4E0] dark:border-[#1a2d22] flex flex-col md:flex-row justify-between items-start md:items-center overflow-x-auto gap-4">
            <div className="flex gap-6 pb-px">
              {[
                { id: 'roster', label: 'Students Directory', icon: Users },
                { id: 'memories', label: 'Main Community Feed', icon: Grid },
                { id: 'schedule', label: 'Uni Event Feed', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = subTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSubTab(tab.id as any)}
                    className={`py-3.5 text-xs font-bold border-b-2 tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-[#006644] text-[#006644] dark:border-emerald-400 dark:text-emerald-400' 
                        : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-[#a2b5ac] dark:hover:text-[#edfcf5]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filter actions */}
            <div className="pb-2.5 flex items-center gap-2.5 self-end md:self-auto">
              <div className="flex items-center gap-1 text-neutral-500 dark:text-[#a2b5ac] text-[10px] font-bold">
                <Filter className="h-3.5 w-3.5" /> Dept:
              </div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0e1712] dark:border-[#1a2d22] text-[10px] text-neutral-700 dark:text-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0e1712] dark:border-[#1a2d22] text-[10px] text-neutral-700 dark:text-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="All">All Batches</option>
                {['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub loading */}
          {subLoading ? (
            <div className="py-12 text-center text-xs text-neutral-550 dark:text-slate-400">Updating campus portal databases...</div>
          ) : (
            <div>
              {/* STUDENT ROSTER VIEW */}
              {subTab === 'roster' && (
                <div className="space-y-4">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 bg-[#F9F8F6]/80 border border-[#E8E4E0] rounded-2xl text-neutral-500 dark:bg-slate-900/20 dark:border-[#1a2d22] text-xs">
                      No matching cohort registration found under this filter combination.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="bg-white border border-[#E8E4E0] p-4 rounded-2xl shadow-xs space-y-3 hover:scale-[1.01] hover:shadow-xs transition-all text-left dark:bg-[#111a14]/90 dark:border-[#1a2d22]"
                        >
                          <div className="flex items-center gap-3">
                            <img src={student.profilePhoto} alt={student.name} className="h-10 w-10 rounded-full object-cover border border-[#E8E4E0] dark:border-slate-800 bg-neutral-100" />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-serif italic font-extrabold text-neutral-900 dark:text-slate-250 truncate">{student.name}</h4>
                              <p className="text-[10px] text-neutral-500 dark:text-slate-500 truncate font-mono">REG: {student.regNo}</p>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-neutral-600 dark:text-slate-400 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 dark:text-slate-500">Department:</span>
                              <span className="text-neutral-800 dark:text-slate-305 truncate font-semibold ml-1">{student.department}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 dark:text-slate-500">Degree/Cohort:</span>
                              <span className="text-neutral-800 dark:text-slate-305 font-semibold">{student.degreeProgram} ({student.batch})</span>
                            </div>
                          </div>
                          
                          {student.bio && (
                            <p className="text-[10px] italic text-neutral-500 dark:text-slate-500 border-t border-[#F3F1ED] dark:border-[#1a2d22] pt-2 line-clamp-2">
                              "{student.bio}"
                            </p>
                          )}

                          <button
                            onClick={() => onSelectStudent(student)}
                            className="w-full bg-[#F3F1ED] hover:bg-[#E8E4E0] text-[10px] border border-[#E8E4E0] text-neutral-850 py-2 rounded-xl transition-all cursor-pointer dark:bg-[#0a110d] dark:border-[#1a2d22] dark:hover:bg-[#15271d] dark:text-emerald-400 font-bold"
                          >
                            Explore Student Portfolio
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TIMELINES MEMORY VAULT VIEW */}
              {subTab === 'memories' && (
                <div>
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-[#F9F8F6]/80 border border-[#E8E4E0] rounded-2xl text-neutral-500 dark:bg-slate-900/20 dark:border-[#1a2d22] text-xs">
                      No memories tagged into this university's catalog yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => onSelectPost(post)}
                          className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-[#E8E4E0] dark:bg-slate-950 dark:border-slate-800 relative group cursor-pointer"
                        >
                          <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" />
                          <div className="absolute inset-0 bg-neutral-900/80 p-3 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between text-left">
                            <span className="bg-[#006644] text-white text-[8px] px-2 py-0.5 rounded-full font-bold w-max">
                              {post.category}
                            </span>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-100 line-clamp-3 leading-relaxed">{post.caption}</p>
                              <span className="text-[8px] text-slate-400 block">By {post.userName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SCHEDULE EVENTS FEED VIEW */}
              {subTab === 'schedule' && (
                <div className="space-y-4">
                  {communityData.events.length === 0 ? (
                    <div className="text-center py-12 bg-[#F9F8F6]/80 border border-[#E8E4E0] rounded-2xl text-neutral-500 dark:bg-slate-900/20 dark:border-[#1a2d22] text-xs">
                      No student society scheduler listings registered for this campus yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {communityData.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-4 rounded-xl space-y-3 text-left shadow-xs transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <span className="bg-[#E6F0EC] text-[#006644] dark:bg-purple-500/15 dark:text-purple-400 border border-[#006644]/15 dark:border-purple-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              {ev.category}
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-slate-500 font-mono font-bold">{ev.date} @ {ev.time}</span>
                          </div>
                          <h4 className="text-xs font-serif italic font-bold text-neutral-900 dark:text-slate-200">{ev.title}</h4>
                          <p className="text-[10px] text-neutral-600 dark:text-slate-400 leading-normal line-clamp-2">{ev.description}</p>
                          <div className="flex justify-between items-center text-[9px] border-t border-[#F3F1ED] dark:border-[#1a2d22]/80 pt-2 text-neutral-500">
                            <span>Organizers: {ev.organizers}</span>
                            <span className="text-[#006644] dark:text-emerald-400 font-bold">{ev.rsvpIds.length} RSVPed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-500 dark:text-slate-400">No University Hub active</div>
      )}

    </div>
  );
}
