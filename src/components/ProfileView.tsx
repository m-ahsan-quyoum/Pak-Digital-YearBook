import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, Post } from '../types';
import { User as UserIcon, Camera, Edit3, Settings, Grid, Heart, GraduationCap, Clipboard, FileText, Bookmark, BookOpen } from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  profileUser: User;
  onSelectPost: (post: Post) => void;
  onRefreshMe: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
];

export default function ProfileView({ currentUser, profileUser, onSelectPost, onRefreshMe }: ProfileViewProps) {
  const isMe = currentUser.id === profileUser.id;
  const [activeSubTab, setActiveSubTab] = useState<'memories' | 'saved'>('memories');
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(profileUser.followers.includes(currentUser.id));
  const [followersCount, setFollowersCount] = useState(profileUser.followers.length);

  // Profile memories lists
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  // Editing profile states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profileUser.name);
  const [bio, setBio] = useState(profileUser.bio);
  const [regNo, setRegNo] = useState(profileUser.regNo);
  const [department, setDepartment] = useState(profileUser.department);
  const [photo, setPhoto] = useState(profileUser.profilePhoto);
  const [batch, setBatch] = useState(profileUser.batch);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const allPosts = await api.posts.list();
      // Filter posts published by profileUser
      const userPublications = allPosts.filter(p => p.userId === profileUser.id);
      setPosts(userPublications);

      // Filter posts saved by profileUser (only if it is ME because of privacy)
      if (isMe) {
        const bookmarked = allPosts.filter(p => currentUser.savedPosts?.includes(p.id));
        setSavedPosts(bookmarked);
      }
    } catch (err) {
      console.error('Failed to load student timeline data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    setIsFollowing(profileUser.followers.includes(currentUser.id));
    setFollowersCount(profileUser.followers.length);
    // Reset editing variables in case student switched profile view
    setName(profileUser.name);
    setBio(profileUser.bio);
    setRegNo(profileUser.regNo);
    setDepartment(profileUser.department);
    setPhoto(profileUser.profilePhoto);
  }, [profileUser, currentUser]);

  const handleFollow = async () => {
    try {
      const res = await api.auth.followUser(profileUser.id);
      if (res) {
        setIsFollowing(res.following);
        setFollowersCount(prev => res.following ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error('Following service failed', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.auth.updateProfile({
        name,
        bio,
        regNo,
        department,
        profilePhoto: photo,
        batch
      });
      if (updated) {
        onRefreshMe(updated.user);
        setIsEditing(false);
        alert('Yearbook Portfolio updated successfully!');
      }
    } catch (err) {
      console.error('Profile mutation failed', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="profile-root" className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-left">
      
      {/* Banner Portfolio Header */}
      <div className="relative bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-[#122017]/80 dark:border-[#1a2d22] p-6 md:p-8 rounded-3xl overflow-hidden flex flex-col md:flex-row gap-6 items-center md:items-start justify-between transition-all shadow-sm">
        <div className="absolute top-0 right-0 p-5 opacity-[0.04] pointer-events-none">
          <GraduationCap className="h-40 w-40 text-[#006644] dark:text-emerald-400 rotate-12" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10 text-center md:text-left">
          {/* Avatar frame */}
          <div className="relative group flex-shrink-0">
            <img 
              src={isMe ? currentUser.profilePhoto : profileUser.profilePhoto} 
              alt={profileUser.name} 
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#E8E4E0] dark:border-slate-900 bg-white dark:bg-slate-950 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
              }} 
            />
            {isMe && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-1 right-1 p-2 bg-[#006644] dark:bg-emerald-500 rounded-full text-white dark:text-slate-950 border-2 border-[#F9F8F6] dark:border-slate-900 hover:scale-105 transition-all cursor-pointer shadow-md"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Student metadata */}
          <div className="space-y-2 max-w-lg">
            <div>
              <h2 className="text-xl md:text-2xl font-serif italic font-extrabold text-neutral-900 dark:text-slate-100 flex items-center justify-center md:justify-start gap-2">
                {profileUser.name}
                <span className="text-xs bg-[#E6F0EC] text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#006644]/15 dark:border-emerald-500/15 rounded-md px-2 py-0.5 uppercase font-bold tracking-wider leading-none">
                  c/o {profileUser.batch}
                </span>
              </h2>
              <p className="text-xs text-neutral-550 dark:text-slate-400 mt-1 max-w-sm">
                🎓 {profileUser.degreeProgram} c/o {profileUser.department} at <strong>{profileUser.university}</strong>
              </p>
            </div>

            {profileUser.bio && (
              <p className="text-neutral-700 dark:text-slate-300 text-xs italic bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-[#E8E4E0] dark:border-slate-900 inline-block leading-relaxed max-w-md">
                "{profileUser.bio}"
              </p>
            )}

            {/* Quick stats totals */}
            <div className="flex justify-center md:justify-start gap-6 pt-1 text-xs">
              <div>
                <span className="text-base font-serif italic font-extrabold text-[#006644] dark:text-emerald-400">{posts.length}</span>
                <span className="text-neutral-500 dark:text-slate-500 ml-1">Memories</span>
              </div>
              <div>
                <span className="text-base font-serif italic font-extrabold text-[#006644] dark:text-emerald-400">{followersCount}</span>
                <span className="text-neutral-500 dark:text-slate-500 ml-1">Classmates</span>
              </div>
              <div>
                <span className="text-base font-serif italic font-extrabold text-[#006644] dark:text-emerald-400">{profileUser.following.length}</span>
                <span className="text-neutral-500 dark:text-slate-500 ml-1">Follows</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button follow or edit */}
        <div className="relative z-10 flex-shrink-0">
          {isMe ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white hover:bg-[#F3F1ED] dark:bg-slate-900 dark:hover:bg-slate-800 text-neutral-800 dark:text-slate-300 border border-[#E8E4E0] dark:border-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:border-[#006644]/20"
            >
              <Edit3 className="h-4 w-4 text-[#006644] dark:text-emerald-400" />
              <span>Edit Yearbook Details</span>
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm ${
                isFollowing 
                  ? 'bg-white text-neutral-550 border border-[#E8E4E0] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800' 
                  : 'bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 hover:scale-[1.01]'
              }`}
            >
              {isFollowing ? 'Classmates Connected' : 'Connect Classmate'}
            </button>
          )}
        </div>
      </div>

      {/* Editing dialog Overlay */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] p-5 rounded-3xl space-y-4 animate-fade-in shadow-sm">
          <h3 className="text-sm font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2 uppercase tracking-wide flex items-center gap-2">
            <Settings className="h-4.5 w-4.5" /> Edit Student Yearbook Portfolio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Full Name Display</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E8E4E0] focus:border-[#006644] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 dark:focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Register / CMS Roll No</label>
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Cohort Batch</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 rounded-xl px-2 py-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  {['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-550 dark:text-slate-400 mb-1.5">Personal Class Bio</label>
            <input
              type="text"
              placeholder="e.g. Society vice president, software developer c/o SE, sports athlete..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#E8E4E0] text-[#1A1A1A] dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
            />
          </div>

          {/* Preset Profile Pics picker */}
          <div className="p-3.5 bg-[#F9F8F6] rounded-2xl border border-[#E8E4E0] dark:bg-[#0a110d]/50 dark:border-[#1a2d22] text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400 block mb-2.5">Yearbook Profile Avatar</span>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-sm">
                {PRESET_AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setPhoto(av)}
                    className={`relative rounded-xl overflow-hidden h-10 w-10 transition-all flex-shrink-0 cursor-pointer ${
                      photo === av 
                        ? 'ring-2 ring-[#006644] dark:ring-emerald-500 scale-105' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar Preset" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                <span>OR FILE UPLOAD:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-[#E6F0EC] file:text-[#006644] hover:file:bg-[#d5e7e0]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-[#F3F1ED] hover:bg-[#E8E4E0] text-xs px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-neutral-700 font-bold transition-all border border-[#E8E4E0] cursor-pointer dark:bg-[#13231a] dark:text-[#a2b5ac] dark:border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold text-xs px-5 py-2 md:py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Save Yearbook Profile
            </button>
          </div>
        </form>
      )}

      {/* Tabs list: Published Memories, Saved Vault (Me only) */}
      <div className="border-b border-[#E8E4E0] dark:border-[#1a2d22] flex justify-center md:justify-start gap-8">
        <button
          onClick={() => setActiveSubTab('memories')}
          className={`py-3.5 text-xs font-bold border-b-2 tracking-wide flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'memories' 
              ? 'border-[#006644] text-[#006644] dark:border-emerald-400 dark:text-emerald-400 font-bold' 
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-[#a2b5ac] dark:hover:text-[#edfcf5]'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>Timeline Memories ({posts.length})</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`py-3.5 text-xs font-bold border-b-2 tracking-wide flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'saved' 
                ? 'border-[#006644] text-[#006644] dark:border-emerald-400 dark:text-emerald-400 font-bold' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-[#a2b5ac] dark:hover:text-[#edfcf5]'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>My Bookmarks ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-500 dark:text-slate-400">Loading student timeline catalog...</div>
      ) : activeSubTab === 'memories' ? (
        posts.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-slate-900/10 dark:border-slate-900/40 rounded-3xl text-neutral-500 text-xs">
            {profileUser.name} has not locked any campus memories in the yearbook archive yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="aspect-square bg-[#F3F1ED] rounded-2xl overflow-hidden border border-[#E8E4E0] dark:bg-slate-900 dark:border-slate-900 relative group cursor-pointer shadow-xs"
              >
                <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" />
                <div className="absolute inset-0 bg-neutral-900/75 p-3.5 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between text-left">
                  <span className="bg-[#006644] text-white text-[8px] font-bold px-2 py-0.5 rounded-full w-max">
                    {post.category}
                  </span>
                  <div>
                    <p className="text-[10px] text-white line-clamp-2 leading-relaxed">{post.caption}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[8px] text-slate-355 font-bold border-t border-white/20 pt-1.5">
                      <span className="flex items-center gap-0.5 text-[#edfcf5]"><Heart className="h-3 w-3 text-red-400 fill-red-400" /> {post.likedBy.length}</span>
                      <span className="text-slate-300">{new Date(post.dateCreated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        savedPosts.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-slate-900/10 dark:border-slate-900/40 rounded-3xl text-neutral-500 text-xs text-normal">
            Your saved memory portfolio is currently empty. Bookmark memories inside the Main Feed to lock cards here!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {savedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="aspect-square bg-[#F3F1ED] rounded-2xl overflow-hidden border border-[#E8E4E0] dark:bg-slate-900 dark:border-slate-900 relative group cursor-pointer shadow-xs"
              >
                <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-neutral-900/75 p-3.5 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between text-left">
                  <span className="bg-[#006644] text-white text-[8px] font-bold px-2 py-0.5 rounded-full w-max">
                    {post.category}
                  </span>
                  <div>
                    <p className="text-[10px] text-white line-clamp-2 leading-relaxed">{post.caption}</p>
                    <span className="text-[8px] text-slate-300 block mt-1">Publisher: {post.userName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
