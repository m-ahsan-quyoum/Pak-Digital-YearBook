import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Post, Comment, User, Announcement } from '../types';
import { 
  Heart, MessageCircle, Bookmark, Share2, Compass, Plus, Sparkles, 
  Tag as TagIcon, Volume2, ShieldAlert, Check, MoreHorizontal, MessageSquare, Trash
} from 'lucide-react';

interface FeedProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  // Let parents provide selections
  selectedPostProp?: Post | null;
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
  'Achievement',
  'Society Events',
  'Graduation Memories',
  'Campus Life'
];

const PRESETS = [
  { name: 'Graduation Caps Fly', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80' },
  { name: 'Farewell Hall Dinner', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80' },
  { name: 'Sports Olympiad Trophy', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { name: 'Scenic Autumn Walkways', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80' },
  { name: 'Tech Fest Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80' },
  { name: 'Campus Library Study', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80' }
];

export default function Feed({ currentUser, onSelectUser, selectedPostProp = null }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [feedType, setFeedType] = useState<'main' | 'featured' | 'saved'>('main');

  // Creation form toggles
  const [showCreate, setShowCreate] = useState(false);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState(PRESETS[0].url);
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [showCustomImg, setShowCustomImg] = useState(false);
  const [eventName, setEventName] = useState('');
  const [friendTagsText, setFriendTagsText] = useState('');
  const [deptTagsText, setDeptTagsText] = useState('');

  // Comment drawers & details view states
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});

  const loadFeed = async () => {
    setLoading(true);
    try {
      // Clean query filters based on states
      const filters: any = {};
      if (activeCategory !== 'All') {
        filters.category = activeCategory;
      }
      if (feedType === 'featured') {
        filters.isFeatured = true;
      }

      const list = await api.posts.list(filters);
      
      // If feedType is saved, client-filter by user's bookmarks
      if (feedType === 'saved') {
        const bookmarked = list.filter(p => currentUser.savedPosts?.includes(p.id));
        setPosts(bookmarked);
      } else {
        setPosts(list);
      }

      // Load announcements
      const anns = await api.announcements.list();
      setAnnouncements(anns.filter(a => a.university === 'All' || a.university.toLowerCase() === currentUser.university.toLowerCase()));
    } catch (err) {
      console.error('Failed to retrieve core Feed posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [activeCategory, feedType, currentUser]);

  // Handle prop matches
  useEffect(() => {
    if (selectedPostProp) {
      setPosts([selectedPostProp]);
      // Instantly open comments for detail checks!
      handleViewComments(selectedPostProp.id);
    }
  }, [selectedPostProp]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption) return;

    try {
      const finalImg = showCustomImg && customImgUrl ? customImgUrl : imageUrl;
      // Convert tags to cleanly split arrays
      const tags = friendTagsText ? friendTagsText.split(',').map(s => s.trim()).filter(Boolean) : [];
      const deptTags = deptTagsText ? deptTagsText.split(',').map(s => s.trim()).filter(Boolean) : [];

      const created = await api.posts.create({
        caption,
        category,
        imageUrl: finalImg,
        eventName,
        tags,
        deptTags,
        university: currentUser.university,
        department: currentUser.department
      });

      if (created) {
        setPosts(prev => [created, ...prev]);
        setShowCreate(false);
        // Reset states
        setCaption('');
        setEventName('');
        setFriendTagsText('');
        setDeptTagsText('');
        setImageUrl(PRESETS[0].url);
        setCustomImgUrl('');
        setShowCustomImg(false);
        alert('Yearbook memory locked securely in core vault archives!');
      }
    } catch (err) {
      console.error('Core publication failed', err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.posts.toggleLike(postId);
      if (res) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const alreadyLiked = p.likedBy.includes(currentUser.id);
            return {
              ...p,
              likedBy: alreadyLiked 
                ? p.likedBy.filter(uid => uid !== currentUser.id)
                : [...p.likedBy, currentUser.id]
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const res = await api.posts.toggleSave(postId);
      if (res) {
        // Toggle client saves locally to avoid full re-render flickering
        const hasSaved = currentUser.savedPosts?.includes(postId);
        if (currentUser.savedPosts) {
          if (hasSaved) {
            currentUser.savedPosts = currentUser.savedPosts.filter(id => id !== postId);
          } else {
            currentUser.savedPosts.push(postId);
          }
        } else {
          currentUser.savedPosts = [postId];
        }
        // Force refresh feed lists if viewing saved vault tab
        if (feedType === 'saved') {
          setPosts(prev => prev.filter(p => p.id !== postId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (post: Post) => {
    const url = `${window.location.protocol}//${window.location.host}/posts/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`Memory Link copied to clipboard!\nShare this with classmates: \n${url}`);
    }).catch((err) => {
      console.error('Failed to copy', err);
    });
  };

  const handleReport = async (post: Post) => {
    const reason = prompt('Please specify safety desk violation concern (e.g. spam, inappropriate content):');
    if (!reason) return;

    try {
      const res = await api.reports.create('post', post.id, reason);
      if (res) {
        alert('Thank you. A safety desk review envelope has been dispatched to administrators moderation queue.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you certain you want to permanently delete this university memory from yearbook?')) return;
    try {
      const res = await api.posts.delete(postId);
      if (res.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      alert(err || 'Failed to delete memory');
    }
  };

  const handleFeatureToggle = async (postId: string, currentStatus: boolean) => {
    try {
      const res = await api.posts.featurePost(postId, !currentStatus);
      if (res) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isFeatured: !currentStatus } : p));
        alert(`Memory is now ${!currentStatus ? 'FEATURED' : 'REMOVED FROM FEATURED'} on homepages!`);
      }
    } catch (err: any) {
      alert(err.message || 'Feature update failed');
    }
  };

  // Comments Actions
  const handleViewComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      // Toggle close
      setActiveCommentsPostId(null);
      return;
    }

    try {
      const list = await api.comments.list(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: list }));
      setActiveCommentsPostId(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));

    try {
      const commentObj = await api.comments.create(postId, commentText);
      if (commentObj) {
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), commentObj]
        }));
        
        // Boost local comments counter representation
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter lists matching featured slideshow
  const featuredSlideshow = posts.filter(p => p.isFeatured).slice(0, 3);

  return (
    <div id="feed-root" className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 text-left relative">
      
      {/* Dynamic site-wide alerts announcements banners */}
      {announcements.map((ann) => (
        <div key={ann.id} className="bg-[#E6F0EC] dark:bg-[#13231a] p-4 rounded-2xl border border-[#006644]/15 dark:border-[#1a2d22] flex items-start gap-3.5 shadow-sm transition-all text-[#1A1A1A] dark:text-[#edfcf5]">
          <div className="p-2 rounded-xl bg-[#006644]/10 dark:bg-emerald-500/15 text-[#006644] dark:text-emerald-400 mt-0.5">
            <Volume2 className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-serif italic font-bold text-[#006644] dark:text-[#edfcf5] flex items-center justify-between">
              <span>{ann.title}</span>
              <span className="text-[9px] text-neutral-500 dark:text-[#a2b5ac] font-mono">{new Date(ann.dateCreated).toLocaleDateString()}</span>
            </h4>
            <p className="text-[11px] text-neutral-600 dark:text-[#a2b5ac] leading-normal">{ann.content}</p>
          </div>
        </div>
      ))}

      {/* Hero Header Feed Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl border transition-all bg-white border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] shadow-sm">
        <div className="flex gap-4">
          <button
            onClick={() => setFeedType('main')}
            className={`text-sm font-bold transition-all pb-1 cursor-pointer ${
              feedType === 'main' 
                ? 'text-[#006644] border-b-2 border-[#006644] dark:text-emerald-400 dark:border-emerald-400' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-[#a2b5ac] dark:hover:text-[#edfcf5]'
            }`}
          >
            Memories Feed
          </button>
          <button
            onClick={() => setFeedType('featured')}
            className={`text-sm font-bold transition-all pb-1 cursor-pointer ${
              feedType === 'featured' 
                ? 'text-[#006644] border-b-2 border-[#006644] dark:text-emerald-400 dark:border-emerald-400' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-[#a2b5ac] dark:hover:text-[#edfcf5]'
            }`}
          >
            Featured Vault
          </button>
          <button
            onClick={() => setFeedType('saved')}
            className={`text-sm font-bold transition-all pb-1 cursor-pointer ${
              feedType === 'saved' 
                ? 'text-[#006644] border-b-2 border-[#006644] dark:text-emerald-400 dark:border-emerald-400' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-[#a2b5ac] dark:hover:text-[#edfcf5]'
            }`}
          >
            My Saved Locks
          </button>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" />
          <span>Lock New Memory</span>
        </button>
      </div>

      {/* CREATE MEMORY DIALOG OVERLAY */}
      {showCreate && (
        <form onSubmit={handleCreatePost} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl space-y-4 animate-fade-in relative z-20 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" /> Create Memory Vault Card
            </h3>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Caption */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">Caption / Yearbook Legacy Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details of cricket match win, farewell cake cuttings, orientation, or fun campus tour trips..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 py-2 text-xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">Event Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sports Week '26"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Photo selections */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-bold text-slate-300">Classroom Memory Frame</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomImg(!showCustomImg)}
                    className="text-emerald-400 text-[10px] hover:underline"
                  >
                    {showCustomImg ? 'Use presets' : 'Custom Image URL/File'}
                  </button>
                </div>

                {showCustomImg ? (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Paste high-res photograph link (Unsplash, Imgur, etc.)"
                      value={customImgUrl}
                      onChange={(e) => setCustomImgUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                      <span>OR Upload File:</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-2 flex-1 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-slate-800 file:text-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 max-h-[110px] overflow-y-auto">
                    {PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setImageUrl(p.url)}
                        className={`relative rounded-lg overflow-hidden h-14 border transition-all ${
                          imageUrl === p.url ? 'ring-2 ring-emerald-500 border-transparent scale-95' : 'opacity-70 border-slate-800 hover:opacity-100'
                        }`}
                        title={p.name}
                      >
                        <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-slate-800/40 pt-2.5 mt-2.5">
                <img src={showCustomImg && customImgUrl ? customImgUrl : imageUrl} alt="Memory preview" className="w-14 h-10 object-cover rounded-xl border border-slate-700 bg-slate-900" onError={(e) => { (e.target as HTMLImageElement).src = PRESETS[0].url; }} />
                <span className="text-[10px] text-slate-500 leading-tight">Secure locked photograph preview inside the Yearbook envelope.</span>
              </div>
            </div>
          </div>

          {/* Social Tagging boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/40 pt-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold flex items-center gap-1">
                <TagIcon className="h-3 w-3 text-emerald-400" /> Tag Classmates Friends (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Ali Rahman, Ayesha Khan, Sana Butt"
                value={friendTagsText}
                onChange={(e) => setFriendTagsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold flex items-center gap-1">
                <Compass className="h-3 w-3 text-purple-400" /> Tag Departments (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Mechanical Engineering"
                value={deptTagsText}
                onChange={(e) => setDeptTagsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-705 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-widest cursor-pointer hover:scale-[1.01] transition-all"
          >
            Publish Live Memory Vault Card
          </button>
        </form>
      )}

      {/* Categories Select filter rail */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 items-center border-b border-[#E8E4E0] dark:border-[#1a2d22] pr-2">
        <span className="text-xs text-neutral-500 dark:text-[#a2b5ac] font-bold flex items-center gap-1 flex-shrink-0">
          <Compass className="h-3.5 w-3.5" /> Sector:
        </span>
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer border ${
            activeCategory === 'All' 
              ? 'bg-[#006644] text-white border-transparent' 
              : 'bg-[#F3F1ED] border-[#E8E4E0] text-neutral-700 hover:bg-[#E8E4E0] dark:bg-[#13231a]/80 dark:border-[#1a2d22] dark:text-[#a2b5ac] dark:hover:text-slate-100 dark:hover:bg-[#1c3024]'
          }`}
        >
          All Memories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer border ${
              activeCategory === cat 
                ? 'bg-[#006644] text-white border-transparent' 
                : 'bg-[#F3F1ED] border-[#E8E4E0] text-neutral-700 hover:bg-[#E8E4E0] dark:bg-[#13231a]/80 dark:border-[#1a2d22] dark:text-[#a2b5ac] dark:hover:text-slate-100 dark:hover:bg-[#1c3024]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CORE MEMORIES LIST FEED */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Retrieving digital yearbook memories...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/10 border border-slate-900/40 rounded-3xl text-slate-500 text-xs text-normal leading-relaxed px-4">
          No campus memories match specified criteria. Be the first to lock memories in the {activeCategory} category for your classmates!
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const hasLiked = post.likedBy.includes(currentUser.id);
            const hasSaved = currentUser.savedPosts?.includes(post.id);
            const showingComments = activeCommentsPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div
                key={post.id}
                className="bg-white border border-[#E8E4E0] rounded-3xl overflow-hidden shadow-sm dark:bg-[#111a14]/95 dark:border-[#1a2d22] transition-all hover:shadow-md"
              >
                {/* Header user info */}
                <div className="p-4 flex justify-between items-center bg-[#F9F8F6] dark:bg-[#13231a]/40 border-b border-[#E8E4E0] dark:border-[#1a2d22]">
                  <div className="flex items-center gap-3">
                    <img 
                      onClick={() => onSelectUser({ id: post.userId, name: post.userName, profilePhoto: post.userPhoto, university: post.userUniversity, department: post.department } as any)}
                      src={post.userPhoto} 
                      alt={post.userName} 
                      className="w-10 h-10 rounded-full object-cover border border-[#E8E4E0] dark:border-slate-800 cursor-pointer hover:scale-105 transition-all"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRESETS[0].url; }}
                    />
                    <div className="min-w-0 text-left">
                      <h4 
                        onClick={() => onSelectUser({ id: post.userId, name: post.userName, profilePhoto: post.userPhoto, university: post.userUniversity, department: post.department } as any)}
                        className="text-xs font-bold text-neutral-800 hover:text-[#006644] dark:text-slate-200 dark:hover:text-emerald-400 cursor-pointer truncate flex items-center gap-2"
                      >
                        {post.userName}
                        <span className="text-[8px] bg-[#E6F0EC] text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.2 rounded font-mono font-normal">c/o SE</span>
                      </h4>
                      <p className="text-[9px] text-neutral-500 dark:text-[#a2b5ac] truncate max-w-sm">
                        {post.userUniversity.replace(/\(.*?\)/, '')} • {post.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Admin Featured Toggle */}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleFeatureToggle(post.id, post.isFeatured)}
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          post.isFeatured 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' 
                            : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title="Toggle Featured display"
                      >
                        {post.isFeatured ? '★ Featured' : '☆ Feature'}
                      </button>
                    )}

                    {/* Delete button (owner or admin) */}
                    {(post.userId === currentUser.id || currentUser.role === 'admin') && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Media visual */}
                <div className="relative overflow-hidden aspect-[4/3] bg-slate-950 group">
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                    onError={(e) => { (e.target as HTMLImageElement).src = PRESETS[0].url; }}
                  />
                  {post.eventName && (
                    <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-[#E8E4E0] dark:bg-slate-950/90 dark:border-slate-800 text-[#006644] dark:text-emerald-400 text-[9px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      {post.eventName}
                    </span>
                  )}
                  
                  <span className="absolute top-4 right-4 bg-white/85 backdrop-blur-md border border-[#E8E4E0] dark:bg-slate-950/85 dark:border-slate-800 text-neutral-800 dark:text-slate-200 text-[9px] px-2.5 py-1 rounded-full font-bold shadow-sm">
                    {post.category}
                  </span>
                </div>

                {/* Engagement Bar */}
                <div className="p-4 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 cursor-pointer transition-all hover:scale-110 ${
                          hasLiked ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${hasLiked ? 'fill-emerald-400 stroke-emerald-400' : ''}`} />
                        <span className="font-mono">{post.likedBy.length}</span>
                      </button>

                      <button
                        onClick={() => handleViewComments(post.id)}
                        className={`flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-all ${
                          showingComments ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-mono">{post.commentCount}</span>
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="text-slate-400 hover:text-slate-200 cursor-pointer transition-all hover:scale-110"
                        title="Copy Shareable Link"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReport(post)}
                        className="text-slate-600 hover:text-rose-400 cursor-pointer transition-all"
                        title="Flag concern safety desk"
                      >
                        <ShieldAlert className="h-4.5 w-4.5" />
                      </button>

                      <button
                        onClick={() => handleSave(post.id)}
                        className={`cursor-pointer transition-all hover:scale-110 ${
                          hasSaved ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-100'
                        }`}
                        title="Save Bookmarks"
                      >
                        <Bookmark className={`h-5 w-5 ${hasSaved ? 'fill-emerald-400 stroke-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Caption & Metadata tags */}
                  <div className="space-y-2 text-left">
                    <p className="text-xs text-neutral-700 dark:text-slate-300 leading-relaxed font-normal">
                      <strong 
                        onClick={() => onSelectUser({ id: post.userId, name: post.userName, profilePhoto: post.userPhoto, university: post.userUniversity, department: post.department } as any)}
                        className="text-neutral-900 dark:text-[#edfcf5] hover:underline cursor-pointer mr-2"
                      >
                        {post.userName}
                      </strong>
                      {post.caption}
                    </p>

                    {/* Tag list rendering */}
                    {(post.tags.length > 0 || post.deptTags.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tg) => (
                          <span key={tg} className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded border border-emerald-500/15 flex items-center gap-0.5">
                            <TagIcon className="h-2 w-2" />
                            {tg}
                          </span>
                        ))}
                        {post.deptTags.map((dt) => (
                          <span key={dt} className="bg-purple-500/10 text-purple-400 text-[8px] font-bold px-2 py-0.5 rounded border border-purple-500/15 flex items-center gap-0.5">
                            <Compass className="h-2 w-2" />
                            {dt}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-[9px] text-slate-600 block pt-1 select-none font-mono">
                      Locked {new Date(post.dateCreated).toLocaleDateString()}
                    </span>
                  </div>

                  {/* COMMENTS DRAWER INLINE PANEL */}
                  {showingComments && (
                    <div className="mt-4 pt-4 border-t border-slate-900 bg-slate-950/20 rounded-2xl p-3 space-y-3">
                      <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> Discussion thread Comments ({comments.length})
                      </h5>

                      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                        {comments.length === 0 ? (
                          <span className="text-[10px] text-slate-600 block select-none">No classmates discussions posted. Write yours below!</span>
                        ) : (
                          comments.map((cm) => (
                            <div key={cm.id} className="flex gap-2 text-xs items-start">
                              <img src={cm.userPhoto} alt={cm.userName} className="w-6.5 h-6.5 rounded-full object-cover border border-slate-800 flex-shrink-0" />
                              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl flex-1 text-left space-y-0.5">
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="font-bold text-slate-350">{cm.userName}</span>
                                  <span className="text-slate-600">{new Date(cm.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-slate-400 text-[11px] leading-relaxed">{cm.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Input */}
                      <form onSubmit={(e) => handlePostComment(post.id, e)} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Reply to classmate message..."
                          value={newCommentTexts[post.id] || ''}
                          onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs placeholder-slate-700 text-slate-200 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition-all"
                        >
                          Submit
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
