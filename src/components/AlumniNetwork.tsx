import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, AlumniUpdate } from '../types';
import { motion } from 'motion/react';
import { 
  GraduationCap, Briefcase, HeartHandshake, Search, UserCheck, 
  Plus, MessageSquare, Linkedin, Trash2, Sparkles, ExternalLink, 
  Filter, Check, Globe, HelpCircle, UserX
} from 'lucide-react';

interface AlumniNetworkProps {
  currentUser: User;
  onSelectStudent: (user: User) => void;
  onRefreshMe: (updatedUser: User) => void;
}

export default function AlumniNetwork({ currentUser, onSelectStudent, onRefreshMe }: AlumniNetworkProps) {
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'directory' | 'my-card'>('feed');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [alumniUpdates, setAlumniUpdates] = useState<AlumniUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  // Profile forms
  const [isAlumni, setIsAlumni] = useState<boolean>(currentUser.isAlumni || false);
  const [gradYear, setGradYear] = useState<string>(currentUser.graduationYear || currentUser.batch || '2026');
  const [company, setCompany] = useState<string>(currentUser.company || '');
  const [designation, setDesignation] = useState<string>(currentUser.designation || '');
  const [canMentor, setCanMentor] = useState<boolean>(currentUser.canMentor || false);
  const [mentorshipOffer, setMentorshipOffer] = useState<string>(currentUser.mentorshipOffer || '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(currentUser.linkedinUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick Post Update forms
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'career' | 'mentorship'>('career');
  const [postLink, setPostLink] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Filters for Alumni Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUniversity, setFilterUniversity] = useState<string>('MyUni'); // 'MyUni' or 'All'
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<'all' | 'mentors' | 'alumni'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const usersList = await api.auth.getUsers();
      setAllUsers(usersList);

      const updates = await api.alumni.listUpdates();
      setAlumniUpdates(updates);
    } catch (err) {
      console.error('Failed to load alumni updates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.auth.updateProfile({
        isAlumni,
        graduationYear: gradYear,
        company,
        designation,
        canMentor,
        mentorshipOffer,
        linkedinUrl
      });
      if (updated && updated.user) {
        onRefreshMe(updated.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update graduation settings.');
    }
  };

  const handleCreateAlumniPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    setPostLoading(true);
    try {
      const added = await api.alumni.createUpdate({
        title: postTitle,
        content: postContent,
        type: postType,
        link: postLink,
        graduationYear: currentUser.graduationYear || currentUser.batch || gradYear
      });
      if (added) {
        setAlumniUpdates(prev => [added, ...prev]);
        setPostTitle('');
        setPostContent('');
        setPostLink('');
        alert('Updates shared to campus yearbook network!');
      }
    } catch (err: any) {
      alert(err.message || 'Announcement could not broadcast.');
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to remove your shared alumni update card?')) return;
    try {
      const res = await api.alumni.deleteUpdate(id);
      if (res.success) {
        setAlumniUpdates(prev => prev.filter(u => u.id !== id));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter learners list
  const filteredAlumniUsers = allUsers.filter(u => {
    // 1. Exclude system admin from yearbook list
    if (u.id === 'user-admin') return false;

    // 2. Filter University Match
    if (filterUniversity === 'MyUni') {
      if (u.university !== currentUser.university) return false;
    }

    // 3. Filter Graduation Year
    if (filterYear !== 'All') {
      const yearStr = u.graduationYear || u.batch || '';
      if (yearStr !== filterYear) return false;
    }

    // 4. Role toggles
    if (filterRole === 'mentors' && !u.canMentor) return false;
    if (filterRole === 'alumni' && !u.isAlumni) return false;

    // 5. Query matching
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchDept = u.department.toLowerCase().includes(q);
      const matchCompany = (u.company || '').toLowerCase().includes(q);
      const matchRole = (u.designation || '').toLowerCase().includes(q);
      return matchName || matchDept || matchCompany || matchRole;
    }

    return true;
  });

  // Calculate unique years present in users directory for filters
  const uniqueGraduationYears = Array.from(
    new Set(allUsers.map(u => u.graduationYear || u.batch).filter(Boolean))
  ).sort();

  return (
    <div id="alumni-network-root" className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Elegantly Crafted Banner Header */}
      <div className="bg-[#006644] text-white dark:bg-emerald-950/40 border border-[#006644]/15 dark:border-emerald-500/10 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md shadow-[#006644]/5">
        <div className="absolute top-0 right-0 -tr-y-12 translate-x-12 opacity-10 pointer-events-none">
          <GraduationCap className="h-44 w-44" />
        </div>
        
        <div className="space-y-2 z-10 text-left">
          <span className="bg-emerald-800/60 dark:bg-emerald-500/10 text-emerald-250 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-700/30 dark:border-emerald-500/15">
            Legacy Directory
          </span>
          <h1 className="text-2xl md:text-3xl font-serif italic font-extrabold flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-emerald-300 dark:text-emerald-400 animate-pulse" />
            Alumni Reconnect Hub
          </h1>
          <p className="text-xs text-emerald-100/90 dark:text-[#a2b5ac] max-w-2xl">
            Indicate your graduation settings, connect with seniors, secure peer mentorship, and highlight career pathways. Discover the professional networks of your university peers nationwide.
          </p>
        </div>

        <button 
          onClick={() => setActiveSubTab('my-card')}
          className="bg-white dark:bg-emerald-500 text-[#006644] dark:text-slate-950 hover:bg-emerald-50 focus:scale-95 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/20 flex items-center gap-1.5 whitespace-nowrap"
        >
          <UserCheck className="h-4 w-4" /> Maintain Status Setting
        </button>
      </div>

      {/* Main Tab Controller selectors */}
      <div className="flex border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-0.5 mt-2 gap-1 overflow-x-auto select-none">
        {[
          { id: 'feed', label: 'Updates Board & Shares', icon: HeartHandshake },
          { id: 'directory', label: 'Peer Directory', icon: Search },
          { id: 'my-card', label: 'My Professional Settings', icon: Briefcase }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold transition-all relative flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'border-[#006644] text-[#006644] dark:border-emerald-400 dark:text-emerald-400' 
                  : 'border-transparent text-neutral-500 dark:text-[#a2b5ac] hover:text-neutral-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Rendering Switcher */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="h-8 w-8 border-3 border-[#006644] dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500 dark:text-slate-400">Updating Yearbook Registers...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. ALUMNI FEED & SHARES */}
          {activeSubTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Left Column: Create an Update Card (Exclusive to alumni) */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-5 rounded-3xl shadow-sm space-y-4">
                  <div className="border-b border-neutral-100 dark:border-[#1a2d22]/40 pb-3 flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-[#006644] dark:text-emerald-400 animate-pulse" />
                    <h2 className="text-sm font-serif italic font-extrabold text-neutral-800 dark:text-slate-100">Broadcast Career / Mentorship</h2>
                  </div>

                  {!currentUser.isAlumni ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/20 text-amber-800 dark:text-amber-300 rounded-2xl text-[11px] leading-relaxed space-y-2">
                      <p className="font-bold">Not Marked as Alumni Yet!</p>
                      <p>Currently, you are listed as a student. To highlight career updates or organize peer mentorship sessions, toggle your settings to "Alumni" status.</p>
                      <button 
                        onClick={() => setActiveSubTab('my-card')}
                        className="bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 border border-transparent font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all text-amber-850 dark:text-amber-250 cursor-pointer block"
                      >
                        Activate Alumni Flag
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAlumniPost} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">Update Heading</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Joined HEC as Research Intern"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#006644]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">Update Type Classification</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPostType('career')}
                            className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              postType === 'career'
                                ? 'bg-[#E6F0EC] text-[#006644] border-[#006644]/30 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20'
                                : 'bg-transparent border-[#E8E4E0] text-neutral-500 dark:border-[#1a2d22]'
                            }`}
                          >
                            <Briefcase className="h-3.5 w-3.5" /> Career Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setPostType('mentorship')}
                            className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              postType === 'mentorship'
                                ? 'bg-[#E6F0EC] text-[#006644] border-[#006644]/30 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20'
                                : 'bg-transparent border-[#E8E4E0] text-neutral-500 dark:border-[#1a2d22]'
                            }`}
                          >
                            <HeartHandshake className="h-3.5 w-3.5" /> Mentorship Offer
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">Detail Insight / Opportunity info</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Write key pointers, recruitment details, or mentorship guidelines..."
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none focus:border-[#006644] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">External Link (LinkedIn, etc)</label>
                        <input
                          type="url"
                          placeholder="e.g. https://linkedin.com/in/my-account"
                          value={postLink}
                          onChange={(e) => setPostLink(e.target.value)}
                          className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={postLoading}
                        className="w-full bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus className="h-4 w-4" /> Share Community Update
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: List of updates */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400">Classmates' Shared Cards ({alumniUpdates.length})</h3>
                  <span className="text-[10px] text-[#006644] dark:text-emerald-400 font-bold">Latest Shares Online</span>
                </div>

                {alumniUpdates.length === 0 ? (
                  <div className="bg-white border border-[#E8E4E0] p-16 rounded-3xl dark:bg-[#111a14]/90 dark:border-[#1a2d22] text-center space-y-2">
                    <Globe className="h-8 w-8 text-neutral-355 mx-auto opacity-75 animate-bounce" />
                    <p className="text-xs text-neutral-500 dark:text-slate-450">No professional updates uploaded into the portal yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alumniUpdates.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] rounded-3xl space-y-4 shadow-xs"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <img src={item.userPhoto} alt={item.userName} className="h-10 w-10 rounded-full object-cover border border-[#E8E4E0] dark:border-slate-800" />
                            <div>
                              <h4 className="font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 text-sm">{item.userName}</h4>
                              <p className="text-[10px] text-neutral-500 dark:text-slate-400">{item.userUniversity.replace(/\(.*?\)/, '')} • Class of {item.graduationYear}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider uppercase border ${
                              item.type === 'career' 
                                ? 'bg-sky-50 text-sky-800 border-sky-300/30 dark:bg-sky-500/10 dark:text-sky-305 dark:border-sky-500/10'
                                : 'bg-purple-50 text-purple-800 border-purple-300/30 dark:bg-purple-500/10 dark:text-purple-305 dark:border-purple-500/10'
                            }`}>
                              {item.type === 'career' ? 'Career Update' : 'Mentorship'}
                            </span>
                            
                            {item.userId === currentUser.id && (
                              <button
                                onClick={() => handleDeletePost(item.id)}
                                className="text-red-500 hover:bg-neutral-50 dark:hover:bg-[#15231c] p-1.5 rounded-lg transition-all cursor-pointer"
                                title="Delete My Update"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-xs font-bold font-serif italic text-neutral-850 dark:text-slate-100 flex items-center gap-1.5">
                            {item.type === 'career' ? (
                              <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <HeartHandshake className="h-3.5 w-3.5 text-purple-500" />
                            )}
                            {item.title}
                          </h3>
                          <p className="text-xs text-neutral-650 dark:text-[#a2b5ac] leading-relaxed whitespace-pre-line">{item.content}</p>
                        </div>

                        {/* Card controls */}
                        <div className="pt-3 border-t border-neutral-100 dark:border-[#1a2d22]/40 flex flex-wrap gap-2.5 items-center justify-between text-[11px] font-bold">
                          <span className="text-[9px] font-mono text-neutral-450 dark:text-slate-500">{new Date(item.dateCreated).toLocaleDateString()}</span>
                          
                          <div className="flex items-center gap-2">
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#006644] dark:text-emerald-400 hover:underline flex items-center gap-1 items-center"
                              >
                                <Linkedin className="h-3 w-3" /> Profile Context <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                            
                            {item.userId !== currentUser.id && (
                              <button
                                onClick={() => onSelectStudent({ id: item.userId, name: item.userName, profilePhoto: item.userPhoto } as User)}
                                className="bg-emerald-50 text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 border border-transparent hover:border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="h-3 w-3" /> Connect & DM
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 2. ALUMNI DIRECTORY */}
          {activeSubTab === 'directory' && (
            <div className="space-y-4 text-left">
              
              {/* Directory Filter Panel */}
              <div className="bg-white border border-[#E8E4E0] p-4 rounded-3xl dark:bg-[#111a14]/90 dark:border-[#1a2d22] space-y-3.5 shadow-sm">
                
                <div className="flex flex-col md:flex-row gap-3">
                  
                  {/* Search Input bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-450 dark:text-emerald-500" />
                    <input
                      type="text"
                      placeholder="Search classmates by name, target companies, professional designation, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#006644]"
                    />
                  </div>

                  {/* University selection matching lists */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterUniversity('MyUni')}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        filterUniversity === 'MyUni'
                          ? 'bg-[#E6F0EC] text-[#006644] border-[#006644]/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : 'bg-transparent border-[#E8E4E0] text-neutral-500 dark:border-[#1a2d22]'
                      }`}
                    >
                      In My University ({currentUser.university.replace(/\(.*?\)/, '').trim()})
                    </button>
                    <button
                      onClick={() => setFilterUniversity('All')}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        filterUniversity === 'All'
                          ? 'bg-[#E6F0EC] text-[#006644] border-[#006644]/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : 'bg-transparent border-[#E8E4E0] text-neutral-500 dark:border-[#1a2d22]'
                      }`}
                    >
                      Across All Pakistan Universities
                    </button>
                  </div>

                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-100 dark:border-[#1a2d22]/40 items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase text-neutral-450 dark:text-slate-500 flex items-center gap-1 mr-2">
                      <Filter className="h-3 w-3" /> Quick Filter By:
                    </span>
                    
                    {/* Role Filter tabs */}
                    {[
                      { id: 'all', label: 'Everyone' },
                      { id: 'alumni', label: 'Alumni Only' },
                      { id: 'mentors', label: 'Mentors Spotlight' }
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setFilterRole(r.id as any)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                          filterRole === r.id
                            ? 'bg-[#006644] text-white border-transparent dark:bg-emerald-500 dark:text-slate-950'
                            : 'bg-transparent border-neutral-200 text-neutral-500 dark:border-[#1a2d22] hover:text-[#006644]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {/* Year filter selector dropdown */}
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <span className="text-[11px] font-bold">Graduation Year:</span>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="bg-[#F9F8F6] dark:bg-[#0c1611]/80 border border-[#E8E4E0] dark:border-[#1a2d22] text-xs py-1 px-2 rounded-lg cursor-pointer focus:outline-none"
                    >
                      <option value="All">All Batches</option>
                      {uniqueGraduationYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>

              {/* Users Cards Grid */}
              {filteredAlumniUsers.length === 0 ? (
                <div className="bg-white border border-[#E8E4E0] p-16 rounded-3xl dark:bg-[#111a14]/90 dark:border-[#1a2d22] text-center space-y-2 col-span-full">
                  <UserX className="h-8 w-8 text-neutral-355 mx-auto" />
                  <p className="text-sm text-neutral-500 dark:text-slate-400">No peers found matching this criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAlumniUsers.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs"
                    >
                      <div className="space-y-3">
                        {/* Header Avatar + Name */}
                        <div className="flex gap-3">
                          <img src={item.profilePhoto} alt={item.name} className="h-11 w-11 rounded-xl object-cover border border-[#E8E4E0] dark:border-slate-800" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif italic font-extrabold text-neutral-900 dark:text-slate-150 truncate flex items-center gap-1">
                              {item.name}
                              {item.isAlumni && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-0.5 rounded text-[8px] tracking-tighter self-center font-extrabold uppercase ml-1 block leading-none">
                                  Alumni
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-neutral-400 dark:text-slate-500 truncate">{item.department}</p>
                            <p className="text-[10px] text-neutral-500 dark:text-slate-400 truncate font-mono">{item.university.replace(/\(.*?\)/, '')}</p>
                          </div>
                        </div>

                        {/* Professional tagline detail context */}
                        {item.company ? (
                          <div className="p-2.5 bg-[#F9F8F6] dark:bg-[#0a110d] border border-neutral-100 dark:border-[#1a2d22]/50 rounded-xl space-y-1">
                            <div className="flex gap-1.5 items-center text-[11px] font-extrabold text-neutral-800 dark:text-slate-200">
                              <Briefcase className="h-3 w-3 text-[#006644] dark:text-emerald-400" />
                              <span className="truncate">{item.designation}</span>
                            </div>
                            <p className="text-[10px] text-neutral-550 dark:text-slate-400 font-bold truncate">@ {item.company}</p>
                          </div>
                        ) : (
                          <div className="p-2.5 border border-dashed border-neutral-200 dark:border-slate-800 text-center rounded-xl text-[10px] text-neutral-450 dark:text-slate-550 italic">
                            No professional company tags uploaded.
                          </div>
                        )}

                        {/* Mentorship offerings tag highlight */}
                        {item.canMentor && (
                          <div className="bg-purple-50 dark:bg-purple-500/5 text-purple-700 dark:text-purple-300 border border-purple-500/10 p-2.5 rounded-xl text-[10px]">
                            <span className="font-bold flex items-center gap-1 uppercase text-[8px] tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">
                              <HeartHandshake className="h-3 w-3 animate-pulse" /> Active Mentor
                            </span>
                            <span className="line-clamp-2 leading-relaxed italic">"{item.mentorshipOffer}"</span>
                          </div>
                        )}
                      </div>

                      {/* Footer CTA commands */}
                      <div className="pt-3 border-t border-neutral-100 dark:border-[#1a2d22]/40 flex gap-2 items-center justify-between text-[11px]">
                        <span className="text-[10px] font-bold text-neutral-550 dark:text-slate-405">
                          c/o {item.graduationYear || item.batch}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.linkedinUrl && (
                            <a
                              href={item.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-500 p-1.5 hover:bg-neutral-50 dark:hover:bg-[#112317] rounded-lg transition-all"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          
                          <button
                            onClick={() => onSelectStudent(item)}
                            className="bg-emerald-50 text-[#006644] hover:bg-[#E6F0EC] dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" /> Connect Chat
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* 3. MY PROFESSIONAL SETTINGS */}
          {activeSubTab === 'my-card' && (
            <div className="max-w-2xl mx-auto bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-6 rounded-3xl text-left space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-serif italic font-extrabold text-neutral-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#006644] dark:text-emerald-400" />
                  Alumni Status & Professional settings
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#a2b5ac] mt-1">
                  Manage your credentials and indicate professional info. These elements display directly inside search listings, classmate directories, and mentorship slots.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3.5 bg-green-50 text-green-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-green-200/50 dark:border-emerald-500/20 text-xs rounded-2xl flex items-center gap-2">
                  <Check className="h-4.5 w-4.5 text-green-600 dark:text-emerald-400" />
                  <span>Excellent! Alumni settings saved permanently inside classmate registers.</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                
                {/* 1. Toggle is Alumni */}
                <div className="p-4 bg-[#F9F8F6] dark:bg-[#0a110d] rounded-2xl border border-neutral-100 dark:border-[#1a2d22] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-neutral-850 dark:text-slate-200 block">I am a graduate (Alumni Settings Toggle)</span>
                    <p className="text-[10px] text-neutral-500 dark:text-slate-450 mt-0.5">Check this box if your degree cycle is complete and you have stepped into professional industries.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAlumni}
                    onChange={(e) => setIsAlumni(e.target.checked)}
                    className="h-5 w-5 accent-[#006644] dark:accent-emerald-400 rounded-lg cursor-pointer scale-110"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Graduation settings batch estimation */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">Graduation Year</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#006644]"
                    />
                  </div>

                  {/* LinkedIn Url link */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">LinkedIn Account URI</label>
                    <input
                      type="url"
                      placeholder="e.g. https://linkedin.com/in/john-doe"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">Company / Organization name</label>
                    <input
                      type="text"
                      placeholder="e.g. Systems Limited or HBL Digital"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>

                  {/* Corporate Designation title */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-slate-400 mb-1">Designation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Associate Financial Consultant"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#0a110d] dark:border-[#1a2d22] text-xs text-neutral-800 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mentorship Switch toggle section */}
                <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-neutral-850 dark:text-slate-200 flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-purple-600 dark:text-purple-400">
                        <HeartHandshake className="h-4 w-4 animate-pulse" /> Active Mentorship Slot
                      </span>
                      <p className="text-[10px] text-neutral-500 dark:text-slate-450 mt-0.5">Check this box if you can devote spare slots to review portfolios, do interview mock trials, or help junior learners in Pakistan.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={canMentor}
                      onChange={(e) => setCanMentor(e.target.checked)}
                      className="h-5 w-5 accent-purple-600 rounded-lg cursor-pointer scale-110"
                    />
                  </div>

                  {canMentor && (
                    <div className="animate-fade-in pt-1 space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Brief details on what mentorship you can provide:</label>
                      <input
                        type="text"
                        placeholder="e.g. SQA Resume guidance, backend architecture mock loops..."
                        value={mentorshipOffer}
                        onChange={(e) => setMentorshipOffer(e.target.value)}
                        className="w-full bg-[#FDFCF9] text-neutral-800 dark:bg-[#0c1611]/80 border border-[#E8E4E0] dark:border-[#1a2d22] focus:border-purple-500 dark:focus:border-purple-450 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 cursor-pointer transition-all shadow-md hover:scale-[1.01]"
                >
                  <Check className="h-4.5 w-4.5" /> Save Yearbook Professional Setup
                </button>

              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
