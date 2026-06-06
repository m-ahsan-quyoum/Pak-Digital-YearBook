import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { University, Report, Announcement, AppStats } from '../types';
import { Shield, Users, Image as ImageIcon, School, Flag, BellRing, Plus, Sparkles, CheckSquare, Trash } from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState<AppStats>({ totalUsers: 0, totalMemories: 0, totalUniversities: 0, totalEvents: 0 });
  const [unis, setUnis] = useState<University[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states - University addition
  const [uniName, setUniName] = useState('');
  const [uniProvince, setUniProvince] = useState<'Punjab' | 'Sindh' | 'KPK' | 'Balochistan' | 'Islamabad'>('Punjab');
  const [uniLocation, setUniLocation] = useState('');
  const [uniWebsite, setUniWebsite] = useState('');

  // Form states - Announcements
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annUni, setAnnUni] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await api.stats.get();
      setStats(s);

      const u = await api.universities.list();
      setUnis(u);

      const r = await api.reports.list();
      setReports(r);
    } catch (err) {
      console.error('Failed to load administrador logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniName || !uniLocation) return;
    try {
      const added = await api.universities.create({
        name: uniName,
        province: uniProvince,
        location: uniLocation,
        website: uniWebsite
      });
      if (added) {
        setUnis(prev => [added, ...prev]);
        setStats(prev => ({ ...prev, totalUniversities: prev.totalUniversities + 1 }));
        setUniName('');
        setUniLocation('');
        setUniWebsite('');
        alert('University added successfully and launched live across communities!');
      }
    } catch (err) {
      console.error('Failed to create university catalog link', err);
    }
  };

  const handleDeleteUni = async (id: string) => {
    if (!confirm('Are you certain you want to delete and wipe this university cluster from yearbook registers?')) return;
    try {
      const res = await api.universities.delete(id);
      if (res.success) {
        setUnis(prev => prev.filter(u => u.id !== id));
        setStats(prev => ({ ...prev, totalUniversities: prev.totalUniversities - 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      const created = await api.announcements.create(annTitle, annContent, annUni);
      if (created) {
        setAnnTitle('');
        setAnnContent('');
        alert('Site-wide system announcement dispatched live with broadcast notification elements.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      const res = await api.reports.resolve(id);
      if (res) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
        alert('Report flagged item resolved and cleared inside moderation archives.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="admin-root" className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-5 rounded-2xl shadow-sm justify-start transition-all">
        <div className="h-10 w-10 bg-[#E6F0EC] text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#006644]/15 dark:border-emerald-500/20 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-serif italic font-extrabold text-neutral-900 dark:text-slate-100 uppercase tracking-wide">Admin Terminal</h1>
          <p className="text-xs text-neutral-500 dark:text-slate-400">Live operational oversight, HEC matching lists addition, moderated desk reports, and broadcast channels.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-500 dark:text-slate-400">Reading administrator caches...</div>
      ) : (
        <div className="space-y-6">
          
          {/* Analytics Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Registered Students', val: stats.totalUsers, icon: Users, color: 'text-[#006644] dark:text-emerald-400 bg-[#E6F0EC] dark:bg-emerald-500/10' },
              { label: 'Yearbook Memories', val: stats.totalMemories, icon: ImageIcon, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10' },
              { label: 'Campus entities', val: stats.totalUniversities, icon: School, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Scheduled meetups', val: stats.totalEvents, icon: BellRing, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' }
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.label} className="bg-white border border-[#E8E4E0] p-4 rounded-2xl flex items-center gap-4 dark:bg-[#111a14]/90 dark:border-[#1a2d22] shadow-xs">
                  <div className={`p-3 rounded-xl border border-transparent ${st.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 block">{st.val}</span>
                    <p className="text-[10px] uppercase font-bold text-neutral-450 dark:text-slate-500 tracking-wide mt-0.5">{st.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Manage Universities */}
            <div className="bg-white border border-[#E8E4E0] p-5 rounded-3xl dark:bg-[#111a14]/90 dark:border-[#1a2d22] space-y-4 shadow-sm">
              <h2 className="text-sm font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2 flex items-center gap-2">
                <School className="h-4.5 w-4.5" /> HEC Directory Additions
              </h2>

              {/* Addition Form */}
              <form onSubmit={handleAddUni} className="space-y-3.5 bg-[#F9F8F6] dark:bg-[#0a110d]/50 p-4 border border-[#E8E4E0] dark:border-[#1a2d22] rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-500 dark:text-slate-400 tracking-wider block uppercase">Register New University Cluster</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="block text-[10px] text-neutral-500 dark:text-slate-400 mb-1">University Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iqra University Karachi"
                      value={uniName}
                      onChange={(e) => setUniName(e.target.value)}
                      className="w-full bg-white border border-[#E8E4E0] dark:bg-[#0c1611]/80 dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-[#006644]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 dark:text-slate-400 mb-1">Province Location</label>
                    <select
                      value={uniProvince}
                      onChange={(e: any) => setUniProvince(e.target.value)}
                      className="w-full bg-white border border-[#E8E4E0] dark:bg-[#0c1611]/50 dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-200 rounded-xl px-2 py-2 cursor-pointer focus:outline-none"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="KPK">KPK</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad">Islamabad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="block text-[10px] text-neutral-500 dark:text-slate-400 mb-1">HQ Address Campus</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. H-9 Islamabad or Clifton"
                      value={uniLocation}
                      onChange={(e) => setUniLocation(e.target.value)}
                      className="w-full bg-white border border-[#E8E4E0] dark:bg-[#0c1611]/80 dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 dark:text-slate-400 mb-1">Website URL Portal</label>
                    <input
                      type="text"
                      placeholder="e.g. https://iqra.edu.pk"
                      value={uniWebsite}
                      onChange={(e) => setUniWebsite(e.target.value)}
                      className="w-full bg-white border border-[#E8E4E0] dark:bg-[#0c1611]/80 dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold py-2 rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Save University Live Directory
                </button>
              </form>

              {/* Existing Universities lists */}
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 text-left">
                {unis.map(u => (
                  <div key={u.id} className="p-2.5 bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif italic font-extrabold text-neutral-800 dark:text-slate-305">{u.name}</h4>
                      <span className="text-[10px] text-neutral-500 dark:text-slate-500">{u.location} • {u.province}</span>
                    </div>
                    {/* Exclude default seeded universities from easy delete for sanity */}
                    {!u.id.startsWith('uni-') ? (
                      <button
                        onClick={() => handleDeleteUni(u.id)}
                        className="text-red-500 hover:bg-neutral-100 dark:hover:bg-[#13281c] p-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[8px] bg-[#E8E4E0] dark:bg-slate-900 border border-transparent px-1.5 py-0.5 rounded text-neutral-600 dark:text-slate-500 uppercase font-mono font-bold">SYSTEM</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast announcements */}
            <div className="bg-white border border-[#E8E4E0] p-5 rounded-3xl dark:bg-[#111a14]/90 dark:border-[#1a2d22] flex flex-col justify-between h-full shadow-sm">
              <div>
                <h2 className="text-sm font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2 flex items-center gap-2 mb-4">
                  <BellRing className="h-4.5 w-4.5" /> Broadcast Broadcaster Newsletters
                </h2>

                <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1">Announcement Subject / Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maintenance break or Sports Olympiad notice..."
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-neutral-850 dark:text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1">Broadcasting Content Body</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write official message detailing directions, schedules, or support guidelines..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-neutral-850 dark:text-slate-100 rounded-xl p-3 text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1">Target School Audience</label>
                    <select
                      value={annUni}
                      onChange={(e) => setAnnUni(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-neutral-850 dark:text-slate-200 rounded-xl px-2 py-2 text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="All">All Universities (Nationwide Alert)</option>
                      {unis.map(u => (
                        <option key={u.id} value={u.name}>{u.name.replace(/\(.*?\)/, '')}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all hover:scale-[1.01] cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-4 w-4" /> Dispatch Official Broadcast Alert
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* safety desk Moderation flags Reports */}
          <div className="bg-white border border-[#E8E4E0] p-5 rounded-3xl dark:bg-[#111a14]/90 dark:border-[#1a2d22] space-y-4 shadow-sm">
            <h2 className="text-sm font-serif italic font-extrabold text-red-650 dark:text-red-400 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2 flex items-center gap-2">
              <Flag className="h-4.5 w-4.5" /> Moderation Safety Desk Reports
            </h2>

            {reports.length === 0 ? (
              <div className="text-center py-10 bg-[#F9F8F6] border border-[#E8E4E0] rounded-2xl dark:bg-slate-950/20 dark:border-[#1a2d22] text-xs text-neutral-500">
                Excellent! The safety desk report queue is currently clean and transparent.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-left">
                {reports.map((rp) => (
                  <div key={rp.id} className="p-4 bg-[#F9F8F6] border border-[#E8E4E0] rounded-2xl dark:bg-[#0a110d] dark:border-[#1a2d22] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          rp.status === 'pending' ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400' : 'bg-neutral-200 text-neutral-600 dark:bg-slate-900'
                        }`}>
                          {rp.status}
                        </span>
                        <span className="text-[10px] text-neutral-500">Target Type: <strong className="text-neutral-700 dark:text-slate-300">{rp.itemType}</strong> • Item ID: <strong className="text-slate-400">{rp.itemId}</strong></span>
                      </div>
                      <p className="text-neutral-805 dark:text-white leading-relaxed font-semibold">Reason: "{rp.content}"</p>
                      <span className="text-[10px] text-neutral-450 block">Flagged by classmate: <strong>{rp.reporterName}</strong> c/o {new Date(rp.dateCreated).toLocaleDateString()}</span>
                    </div>

                    {rp.status === 'pending' && (
                      <button
                        onClick={() => handleResolveReport(rp.id)}
                        className="bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold px-3 py-2 rounded-xl text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
