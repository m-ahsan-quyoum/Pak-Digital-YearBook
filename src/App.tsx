import { useState, useEffect, useRef } from 'react';
import { api, setAuthToken } from './lib/api';
import { User, Notification, Post } from './types';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import SearchDialog from './components/SearchDialog';
import Communities from './components/Communities';
import Messenger from './components/Messenger';
import Events from './components/Events';
import AdminPanel from './components/AdminPanel';
import ProfileView from './components/ProfileView';
import AlumniNetwork from './components/AlumniNetwork';

// Icons for site-wide notifications screen
import { Bell, Heart, MessageCircle, UserPlus, Volume2, Sparkles, MessageSquare, Check, Moon, Sun, GraduationCap } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cross-component state bridges
  const [partnerForMessenger, setPartnerForMessenger] = useState<User | null>(null);
  const [userForPortfolio, setUserForPortfolio] = useState<User | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Dark light theme mode state (Defaults to sleek dark eye-safety mode)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Notifications systems
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsIntervalRef = useRef<any>(null);

  // Attempt to recover existing student session on bootup
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const token = localStorage.getItem('pakyearbook_token');
        if (token) {
          setAuthToken(token);
          const res = await api.auth.getMe();
          if (res && res.user) {
            setCurrentUser(res.user);
          }
        }
      } catch (err) {
        console.warn('Session clearance or stale session expired');
        localStorage.removeItem('pakyearbook_token');
      } finally {
        setLoading(false);
      }
    };
    recoverSession();
  }, []);

  // Poll notifications lists
  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const list = await api.notifications.list();
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notification logs', err);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      if (notificationsIntervalRef.current) clearInterval(notificationsIntervalRef.current);
      return;
    }

    loadNotifications();

    // Fetch site-wide activities and notifications every 5 seconds
    notificationsIntervalRef.current = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => {
      if (notificationsIntervalRef.current) clearInterval(notificationsIntervalRef.current);
    };
  }, [currentUser]);

  // Dynamic Scroll-triggered item reveal animation to provide professional interactive feedback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const setupObserver = () => {
      const selectors = 'p, h1, h2, h3, h4, img, button, .card, .rounded-2xl, .rounded-3xl, .p-4, .p-5, .p-6, form, input, textarea, select';
      document.querySelectorAll(selectors).forEach((el) => {
        if (
          !el.classList.contains('reveal-item') && 
          !el.closest('nav') && 
          !el.closest('aside') && 
          !el.closest('header') && 
          !el.id?.startsWith('nav-') &&
          !el.classList.contains('md:hidden')
        ) {
          el.classList.add('reveal-item');
          observer.observe(el);
        }
      });
    };

    // Run initially & schedule a tiny delay to allow animations to trigger cleanly
    const timer = setTimeout(setupObserver, 150);

    // Watch for dynamic DOM node additions
    const mutationObserver = new MutationObserver(() => {
      setupObserver();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [activeTab, currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('feed');
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
  };

  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await api.notifications.markRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Cross tab navigation controllers
  const handleSelectUser = (user: User) => {
    setUserForPortfolio(user);
    setActiveTab('profile');
  };

  const handleSelectClassmateChat = (user: User) => {
    // Force set messaging target
    setPartnerForMessenger(user);
    setActiveTab('messenger');
  };

  const handleSelectPostDetail = (post: Post) => {
    setSelectedPost(post);
    setActiveTab('feed');
  };

  // Search dialog selector routing
  const handleSearchSelect = (type: 'student' | 'university' | 'event' | 'post', item: any) => {
    if (type === 'student') {
      handleSelectUser(item);
    } else if (type === 'university') {
      setActiveTab('communities');
      // Communitites dashboard handles selection mapping
    } else if (type === 'event') {
      setActiveTab('events');
    } else if (type === 'post') {
      handleSelectPostDetail(item);
    }
  };

  if (loading) {
    return (
      <div id="loader-root" className="min-h-screen bg-[#0a110d] flex flex-col items-center justify-center text-[#edfcf5] space-y-4">
        <div className="h-10 w-10 border-4 border-[#006644] border-t-transparent rounded-full animate-spin" />
        <h3 className="text-xs font-serif italic tracking-widest uppercase text-[#edfcf5]/85">Unpacking Pak-Yearbook...</h3>
      </div>
    );
  }

  // Not logged in -> Show portal page
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div id="app-workspace" className={`min-h-screen transition-all ${isDarkMode ? 'bg-[#0a110d] text-[#edfcf5]' : 'bg-[#FDFCF9] text-[#1A1A1A]'}`}>
      
      {/* Visual Workspace wrapper layout */}
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* Responsive Instagram Sidebar */}
        <Sidebar 
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            // Clean specific redirects
            if (tab !== 'messenger') setPartnerForMessenger(null);
            if (tab !== 'profile') setUserForPortfolio(null);
            if (tab !== 'feed') setSelectedPost(null);
            setActiveTab(tab);
          }}
          notifications={notifications}
          unreadCount={unreadCount}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
        />

        {/* Dynamic content core canvas */}
        <main className="flex-1 overflow-y-auto h-screen relative pb-12">
          
          {/* Theme custom toggler rail or upper quick links */}
          <div className="hidden md:flex justify-end items-center gap-4 px-6 pt-5 pb-1 max-w-6xl mx-auto">
            <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
              Pakistan HEC Hub Node
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-900 rounded-xl transition-all cursor-pointer text-slate-400"
              title="Toggle theme (Light Mode/Dark Mode)"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-yellow-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>

          <div className="p-1 md:p-3 animate-fade-in">
            {/* MEMORIES STREAM FEED TAB */}
            {activeTab === 'feed' && (
              <Feed 
                currentUser={currentUser} 
                onSelectUser={handleSelectUser}
                selectedPostProp={selectedPost}
              />
            )}

            {/* SMART SEARCH TAB */}
            {activeTab === 'search' && (
              <SearchDialog onSelectItem={handleSearchSelect} />
            )}

            {/* COMMUNITIES DIRECTORY TAB */}
            {activeTab === 'communities' && (
              <Communities 
                currentUser={currentUser}
                onSelectStudent={handleSelectUser}
                onSelectPost={handleSelectPostDetail}
              />
            )}

            {/* MESSENGER SECURE CHAT TAB */}
            {activeTab === 'messenger' && (
              <Messenger 
                currentUser={currentUser} 
                partnerProp={partnerForMessenger}
              />
            )}

            {/* EVENT SCHEDULER TAB */}
            {activeTab === 'events' && (
              <Events currentUser={currentUser} />
            )}

            {/* ALUMNI HUB TAB */}
            {activeTab === 'alumni' && (
              <AlumniNetwork 
                currentUser={currentUser}
                onSelectStudent={handleSelectUser}
                onRefreshMe={(updatedUser) => {
                  setCurrentUser(updatedUser);
                }}
              />
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="max-w-xl mx-auto p-4 md:p-6 space-y-5 text-left">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-400" />
                    Student Alerts Directory
                  </h1>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkNotificationsRead}
                      className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1 transition-all cursor-pointer hover:bg-emerald-500 hover:text-slate-950"
                    >
                      <Check className="h-3 w-3" /> Mark All Read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/10 border border-slate-900/40 rounded-3xl text-xs text-slate-500 leading-relaxed px-4">
                    All clean! No notification tags, classmate follows, or comments alerts recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => {
                      return (
                        <div
                          key={n.id}
                          className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                            n.isRead 
                              ? 'bg-slate-900/25 border-slate-900/60' 
                              : 'bg-emerald-500/5 border-emerald-500/10 shadow-lg'
                          }`}
                        >
                          <img src={n.senderPhoto} alt={n.senderName} className="h-9 w-9 rounded-full object-cover border border-slate-800" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              {/* Bold username */}
                              <p className="text-xs text-slate-350">
                                <strong className="text-slate-200 mr-1.5">{n.senderName}</strong>
                                {n.content}
                              </p>
                              <span className="text-[8px] text-slate-650 font-mono flex-shrink-0">{new Date(n.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            
                            {/* Action links */}
                            <div className="flex gap-4 pt-1 text-[10px] font-bold">
                              {n.type === 'follow' && (
                                <button
                                  onClick={() => handleSelectUser({ id: n.senderId, name: n.senderName, profilePhoto: n.senderPhoto } as any)}
                                  className="text-emerald-400 hover:underline cursor-pointer"
                                >
                                  View Student Portfolio
                                </button>
                              )}
                              {n.postId && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const fullPost = await api.posts.get(n.postId!);
                                      if (fullPost) handleSelectPostDetail(fullPost);
                                    } catch (err) {
                                      alert('The shared memory post has been deleted or expired.');
                                    }
                                  }}
                                  className="text-sky-450 hover:underline text-emerald-400 cursor-pointer"
                                >
                                  View Classroom Memory Card
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleSelectClassmateChat({ id: n.senderId, name: n.senderName, profilePhoto: n.senderPhoto } as any)}
                                className="text-purple-400 hover:underline flex items-center gap-0.5"
                              >
                                <MessageSquare className="h-3 w-3" /> Secure Chat Channel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ADMIN PANEL TERMINAL TAB */}
            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <AdminPanel />
            )}

            {/* STUDENT PORTFOLIO PROFILE TAB */}
            {activeTab === 'profile' && (
              <ProfileView 
                currentUser={currentUser}
                profileUser={userForPortfolio || currentUser}
                onSelectPost={handleSelectPostDetail}
                onRefreshMe={(updatedUser) => {
                  setCurrentUser(updatedUser);
                  setUserForPortfolio(updatedUser);
                }}
              />
            )}

          </div>
        </main>
      </div>

    </div>
  );
}
