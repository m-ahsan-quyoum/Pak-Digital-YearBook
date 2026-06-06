import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Search, User as UserIcon, School, Calendar, Image as ImageIcon, Flame, Sparkles } from 'lucide-react';

interface SearchDialogProps {
  onSelectItem: (type: 'student' | 'university' | 'event' | 'post', item: any) => void;
}

export default function SearchDialog({ onSelectItem }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    students: any[];
    universities: any[];
    events: any[];
    posts: any[];
  }>({ students: [], universities: [], events: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<any>(null);

  // Trending default queries for Pakistani students
  const TRENDING_SEARCHES = [
    { label: 'Convocation', type: 'post' },
    { label: 'Sports Week', type: 'post' },
    { label: 'FAST HackFest \'26', type: 'event' },
    { label: 'Computer Science', type: 'student' },
    { label: 'NUST', type: 'university' }
  ];

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ students: [], universities: [], events: [], posts: [] });
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.suggestions.get(query);
        setSuggestions(data);
      } catch (err) {
        console.error('Failed to retrieve search suggestions', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (type: 'student' | 'university' | 'event' | 'post', item: any) => {
    onSelectItem(type, item);
  };

  return (
    <div id="search-container" className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div className="text-center md:text-left mb-6">
        <h1 className="text-2xl font-serif italic font-extrabold text-neutral-900 dark:text-[#edfcf5] flex items-center gap-2 justify-center md:justify-start">
          <Search className="h-6 w-6 text-[#006644] dark:text-emerald-400" />
          Smart Memory Search
        </h1>
        <p className="text-xs text-neutral-500 dark:text-[#a2b5ac] mt-1">
          Instantly look up classmates, search departments, find convocations, or explore university communities across provinces.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {loading ? (
            <div className="h-4 w-4 border-2 border-[#006644] dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-[#006644]/85 dark:text-emerald-400" />
          )}
        </div>
        <input
          type="text"
          placeholder="Search students by name, crop universities, department events, sports topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#FDFCF9] border border-[#E8E4E0] focus:border-[#006644] text-neutral-800 dark:bg-[#0a110d] dark:border-[#1a2d22] dark:focus:border-emerald-500 dark:text-[#edfcf5] pl-12 pr-4 py-3.5 rounded-2xl text-xs focus:outline-none placeholder-neutral-400 dark:placeholder-slate-705 transition-all shadow-xs"
          autoFocus
        />
      </div>

      {/* Suggestions and results */}
      {query.trim() === '' ? (
        <div className="bg-[#F9F8F6] border border-[#E8E4E0] p-5 rounded-2xl dark:bg-[#111a14]/70 dark:border-[#1a2d22] space-y-4 shadow-xs text-left">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-[#a2b5ac] border-b border-[#E8E4E0]/60 dark:border-[#1a2d22]/40 pb-2">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Trending Campus Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SEARCHES.map((trend) => (
              <button
                key={trend.label}
                onClick={() => setQuery(trend.label)}
                className="bg-white hover:bg-[#F3F1ED] text-neutral-800 dark:bg-[#13231a] dark:text-slate-300 text-xs px-3.5 py-2 rounded-xl transition-all border border-[#E8E4E0] dark:border-[#1a2d22]/60 flex items-center gap-1.5 cursor-pointer hover:border-[#006644]/40 dark:hover:bg-[#1d3527]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#006644] dark:text-emerald-400/80" />
                <span>{trend.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {suggestions.students.length === 0 && 
           suggestions.universities.length === 0 && 
           suggestions.events.length === 0 && 
           suggestions.posts.length === 0 ? (
            <div className="text-center py-12 bg-[#F9F8F6] border border-[#E8E4E0] rounded-2xl dark:bg-slate-900/10 dark:border-[#1a2d22]">
              <span className="text-xs text-neutral-500 dark:text-slate-550">No instant suggestions match your query. Try searching with other categories or tags.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              
              {/* Students suggestions */}
              {suggestions.students.length > 0 && (
                <div className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] rounded-2xl p-4 space-y-3 shadow-xs">
                  <h3 className="text-xs font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 tracking-wide flex items-center gap-2 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2">
                    <UserIcon className="h-3.5 w-3.5" />
                    Students Directory ({suggestions.students.length})
                  </h3>
                  <div className="space-y-1.5">
                    {suggestions.students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleSelect('student', student)}
                        className="flex items-center gap-3 p-2 hover:bg-[#F3F1ED]/50 dark:hover:bg-[#13231a]/60 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#E8E4E0]"
                      >
                        <img src={student.photo} alt={student.name} className="h-8 w-8 rounded-full object-cover border border-[#E8E4E0] dark:border-slate-800 bg-neutral-100" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif italic font-extrabold text-neutral-850 dark:text-slate-200 truncate">{student.name}</h4>
                          <p className="text-[10px] text-neutral-500 dark:text-slate-400 truncate">{student.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Universities suggestions */}
              {suggestions.universities.length > 0 && (
                <div className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] rounded-2xl p-4 space-y-3 shadow-xs">
                  <h3 className="text-xs font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 tracking-wide flex items-center gap-2 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2">
                    <School className="h-3.5 w-3.5" />
                    Provinces & Universities ({suggestions.universities.length})
                  </h3>
                  <div className="space-y-1.5">
                    {suggestions.universities.map((uni) => (
                      <div
                        key={uni.id}
                        onClick={() => handleSelect('university', uni)}
                        className="flex items-center gap-3 p-2 hover:bg-[#F3F1ED]/50 dark:hover:bg-[#13231a]/60 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#E8E4E0]"
                      >
                        <div className="h-8 w-8 rounded-xl bg-[#E6F0EC] dark:bg-emerald-500/10 flex items-center justify-center text-[10px] font-black text-[#006644] dark:text-emerald-400 border border-[#006644]/15 dark:border-emerald-500/20">
                          HEC
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif italic font-extrabold text-neutral-850 dark:text-slate-200 truncate">{uni.name}</h4>
                          <p className="text-[10px] text-neutral-500 dark:text-slate-400 truncate">{uni.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events suggestions */}
              {suggestions.events.length > 0 && (
                <div className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] rounded-2xl p-4 space-y-3 shadow-xs">
                  <h3 className="text-xs font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 tracking-wide flex items-center gap-2 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Campus Events ({suggestions.events.length})
                  </h3>
                  <div className="space-y-1.5">
                    {suggestions.events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleSelect('event', ev)}
                        className="flex items-center gap-3 p-2 hover:bg-[#F3F1ED]/50 dark:hover:bg-[#13231a]/60 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#E8E4E0]"
                      >
                        <div className="h-8 w-8 rounded-xl bg-purple-150 dark:bg-purple-500/10 flex items-center justify-center text-[10px] font-black text-purple-700 dark:text-purple-400 border border-purple-500/20">
                          CAL
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif italic font-extrabold text-neutral-855 dark:text-slate-200 truncate">{ev.name}</h4>
                          <p className="text-[10px] text-neutral-500 dark:text-slate-400 truncate">{ev.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory posts suggestions */}
              {suggestions.posts.length > 0 && (
                <div className="bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] rounded-2xl p-4 space-y-3 col-span-1 md:col-span-2 shadow-xs">
                  <h3 className="text-xs font-serif italic font-extrabold text-[#006644] dark:text-emerald-400 tracking-wide flex items-center gap-2 border-b border-[#E8E4E0] dark:border-[#1a2d22] pb-2">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Campus Life Memories ({suggestions.posts.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestions.posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleSelect('post', post)}
                        className="flex items-center gap-3 p-2 hover:bg-[#F3F1ED]/50 dark:hover:bg-[#13231a]/60 rounded-xl cursor-pointer transition-all border border-transparent border-[#E8E4E0]"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif italic font-extrabold text-neutral-855 dark:text-slate-200 truncate">📸 {post.name}</h4>
                          <p className="text-[10px] text-neutral-400 dark:text-slate-500 truncate mt-0.5">{post.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
