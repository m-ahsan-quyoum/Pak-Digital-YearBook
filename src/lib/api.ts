import { User, Post, Comment, University, Message, UniEvent, Notification, Report, Announcement, AppStats, AlumniUpdate } from '../types';

// Client authentication token storage
let authToken = localStorage.getItem('pakyearbook_token') || '';

export const getAuthToken = () => authToken;

export const setAuthToken = (token: string) => {
  authToken = token;
  if (token) {
    localStorage.setItem('pakyearbook_token', token);
  } else {
    localStorage.removeItem('pakyearbook_token');
  }
};

// STATIC PRESET SEED DATA (copied from database defaults)
const initialUniversities: University[] = [
  { id: 'uni-nust', name: 'NUST (National University of Sciences & Technology)', province: 'Islamabad', location: 'H-12, Islamabad', website: 'https://nust.edu.pk', isApproved: true, numStudents: 1250 },
  { id: 'uni-fast', name: 'FAST-NUCES (National University of Computer & Emerging Sciences)', province: 'Islamabad', location: 'Islamabad, Lahore, Karachi, Peshawar, Chiniot', website: 'https://nu.edu.pk', isApproved: true, numStudents: 1800 },
  { id: 'uni-comsats', name: 'COMSATS University Islamabad', province: 'Islamabad', location: 'Park Road, Islamabad', website: 'https://www.comsats.edu.pk', isApproved: true, numStudents: 950 },
  { id: 'uni-uet-lhr', name: 'UET Lahore (University of Engineering & Technology)', province: 'Punjab', location: 'GT Road, Lahore', website: 'https://uet.edu.pk', isApproved: true, numStudents: 800 },
  { id: 'uni-pu', name: 'Punjab University (University of the Punjab)', province: 'Punjab', location: 'Canal Road, Lahore', website: 'https://pu.edu.pk', isApproved: true, numStudents: 2200 },
  { id: 'uni-gcu', name: 'GCU Lahore (Government College University)', province: 'Punjab', location: 'Katchery Road, Lahore', website: 'https://gcu.edu.pk', isApproved: true, numStudents: 600 },
  { id: 'uni-iba', name: 'IBA Karachi (Institute of Business Administration)', province: 'Sindh', location: 'University Road, Karachi', website: 'https://iba.edu.pk', isApproved: true, numStudents: 750 },
  { id: 'uni-ned', name: 'NED University of Engineering & Technology', province: 'Sindh', location: 'University Road, Karachi', website: 'https://neduet.edu.pk', isApproved: true, numStudents: 1100 },
  { id: 'uni-uet-taxila', name: 'UET Taxila (University of Engineering & Technology Taxila)', province: 'Punjab', location: 'Taxila, Punjab', website: 'https://uettaxila.edu.pk', isApproved: true, numStudents: 450 },
  { id: 'uni-bzu', name: 'BZU Multan (Bahauddin Zakariya University)', province: 'Punjab', location: 'Bosan Road, Multan', website: 'https://bzu.edu.pk', isApproved: true, numStudents: 700 },
  { id: 'uni-air', name: 'Air University', province: 'Islamabad', location: 'E-9, Islamabad', website: 'https://au.edu.pk', isApproved: true, numStudents: 500 },
  { id: 'uni-bahria', name: 'Bahria University', province: 'Islamabad', location: 'E-8, Islamabad', website: 'https://bahria.edu.pk', isApproved: true, numStudents: 620 },
  { id: 'uni-mnsuet', name: 'Muhammad Nawaz shareef University of engenering and technoology', province: 'Punjab', location: 'Multan, Punjab', website: 'https://mnsuet.edu.pk', isApproved: true, numStudents: 350 }
];

const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Admin Desk',
    email: 'admin@pakyearbook.pk',
    password: 'password123',
    university: 'NUST (National University of Sciences & Technology)',
    department: 'Software Engineering',
    degreeProgram: 'Bachelors',
    batch: '2022',
    regNo: 'ADMIN-2022-NUST',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Official Admin Account of PakYearbook. Supporting campuses across Pakistan in preserving their memory vaults.',
    role: 'admin',
    dateJoined: '2026-02-15T12:00:00Z',
    followers: [],
    following: [],
    savedPosts: []
  },
  {
    id: 'user-ali',
    name: 'Ali Rahman',
    email: 'ali@nust.edu.pk',
    password: 'password123',
    university: 'NUST (National University of Sciences & Technology)',
    department: 'Computer Science',
    degreeProgram: 'Bachelors',
    batch: '2023',
    regNo: '412-CS-NUST',
    profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    bio: 'Software Dev student at NUST H-12. Passionate about AI models and organizing technical events. Let\'s preserve memories!',
    role: 'user',
    dateJoined: '2026-03-01T10:30:00Z',
    followers: ['user-ayesha'],
    following: ['user-ayesha', 'user-zain'],
    savedPosts: []
  },
  {
    id: 'user-ayesha',
    name: 'Ayesha Khan',
    email: 'ayesha@fast.edu.pk',
    password: 'password123',
    university: 'FAST-NUCES (National University of Computer & Emerging Sciences)',
    department: 'Artificial Intelligence',
    degreeProgram: 'Bachelors',
    batch: '2022',
    regNo: 'FAST-22-AI-01',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    bio: 'Vice President of FAST Computing Society. Campus photography enthusiast. Farewell to the Class of 2026!',
    role: 'user',
    dateJoined: '2026-03-01T11:45:00Z',
    followers: ['user-ali', 'user-zain'],
    following: ['user-ali'],
    savedPosts: [],
    isAlumni: true,
    graduationYear: '2022',
    company: 'Educative Pakistan',
    designation: 'Frontend Engineer',
    canMentor: true,
    mentorshipOffer: 'Willing to prep CS & AI juniors with mockup web code trials and frontend basics!',
    linkedinUrl: 'https://linkedin.com/in/ayeshakhan-placeholder-pak'
  },
  {
    id: 'user-zain',
    name: 'Zain Butt',
    email: 'zain@pu.edu.pk',
    password: 'password123',
    university: 'Punjab University (University of the Punjab)',
    department: 'Business Administration',
    degreeProgram: 'Bachelors',
    batch: '2023',
    regNo: 'PU-IBA-23-45',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Campus representative and event organizer. Let\'s make PU\'s memory archive live forever!',
    role: 'user',
    dateJoined: '2026-03-05T08:15:00Z',
    followers: ['user-ali'],
    following: ['user-ayesha'],
    savedPosts: [],
    isAlumni: true,
    graduationYear: '2023',
    company: 'Systems Limited',
    designation: 'Associate QA Architect',
    canMentor: true,
    mentorshipOffer: 'Helping with basic SQA roadmap designs, resume listings, and HR review pointers.',
    linkedinUrl: 'https://linkedin.com/in/zainbutt-placeholder-pak'
  }
];

const initialPosts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-ali',
    userName: 'Ali Rahman',
    userPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    userUniversity: 'NUST (National University of Sciences & Technology)',
    university: 'NUST (National University of Sciences & Technology)',
    department: 'Computer Science',
    caption: 'Trophy secured! 🏆 Congratulations to the CS Department for winning the Cricket League finals in NUST Sports Week 2026! An incredible performance by everyone.',
    category: 'Sports Week',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    eventName: 'NUST Sports Olympiad 2026',
    tags: ['Zain Butt', 'Ayesha Khan'],
    deptTags: ['Computer Science'],
    likedBy: ['user-ayesha', 'user-zain', 'user-admin'],
    commentCount: 2,
    dateCreated: '2026-05-20T11:00:00Z',
    isFeatured: true,
    views: 450
  },
  {
    id: 'post-2',
    userId: 'user-ayesha',
    userName: 'Ayesha Khan',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    userUniversity: 'FAST-NUCES (National University of Computer & Emerging Sciences)',
    university: 'FAST-NUCES (National University of Computer & Emerging Sciences)',
    department: 'Artificial Intelligence',
    caption: 'Beautiful autumn memories under the golden leaves of the Islamabad Campus directory. Looking back at our junior year trips!',
    category: 'Trips',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    eventName: 'Senior Autumn Outing 2025',
    tags: ['Ali Rahman'],
    deptTags: ['Artificial Intelligence', 'Software Engineering'],
    likedBy: ['user-ali'],
    commentCount: 1,
    dateCreated: '2026-05-22T14:30:00Z',
    isFeatured: false,
    views: 280
  },
  {
    id: 'post-3',
    userId: 'user-zain',
    userName: 'Zain Butt',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    userUniversity: 'Punjab University (University of the Punjab)',
    university: 'Punjab University (University of the Punjab)',
    department: 'Business Administration',
    caption: 'Grateful for this journey. PU Business School Graduation Convocation 2026. Official memories are standard!',
    category: 'Convocation',
    imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6c294b4e?w=800&auto=format&fit=crop&q=80',
    eventName: '133rd Convocation PU',
    tags: [],
    deptTags: ['Business Administration'],
    likedBy: ['user-ali', 'user-ayesha'],
    commentCount: 1,
    dateCreated: '2026-06-01T09:00:00Z',
    isFeatured: true,
    views: 620
  }
];

const initialComments: Comment[] = [
  { id: 'com-1', postId: 'post-1', userId: 'user-ayesha', userName: 'Ayesha Khan', userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', content: 'What a match! That last over boundary was fantastic!! 🔥', dateCreated: '2026-05-20T11:45:00Z' },
  { id: 'com-2', postId: 'post-1', userId: 'user-zain', userName: 'Zain Butt', userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', content: 'Huge congrats, Ali! You guys deserved this win.', dateCreated: '2026-05-20T12:15:00Z' },
  { id: 'com-3', postId: 'post-2', userId: 'user-ali', userName: 'Ali Rahman', userPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', content: 'Wow, excellent photography. Take me back!', dateCreated: '2026-05-22T15:00:00Z' },
  { id: 'com-4', postId: 'post-3', userId: 'user-admin', userName: 'Admin Desk', userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', content: 'Congratulations, Zain! Wishing you the best of luck in your future endeavors.', dateCreated: '2026-06-01T10:00:00Z' }
];

const initialEvents: UniEvent[] = [
  {
    id: 'event-1',
    university: 'NUST (National University of Sciences & Technology)',
    title: 'NUST Alumni Homecoming & Dinner 2026',
    description: 'An evening to reconnect with classmates, network with peers, and share nostalgic stories in the heart of Islamabad. Includes musical performance followed by dinner.',
    date: '2026-06-25',
    time: '18:00',
    location: 'Main Auditorium, H-12 Islamabad',
    category: 'Society Events',
    organizers: 'NUST Alumni Association',
    rsvpIds: ['user-ali', 'user-zain'],
    dateCreated: '2026-06-01T12:00:00Z'
  },
  {
    id: 'event-2',
    university: 'FAST-NUCES (National University of Computer & Emerging Sciences)',
    title: 'FAST HackFest \'26',
    description: 'Pakistan\'s largest university-level hackathon. Developer teams from across Pakistan will build cool tech solutions in 48 hours.',
    date: '2026-07-05',
    time: '09:00',
    location: 'FAST Civil Engineering & CS blocks',
    category: 'Competitions',
    organizers: 'FAST Computing Society',
    rsvpIds: ['user-ali', 'user-ayesha'],
    dateCreated: '2026-06-02T10:00:00Z'
  }
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to PakYearbook Memory Portal!',
    content: 'We are thrilled to launch the premier digital memory preservation space for students across Pakistan. Build your profile, explore classmate networks, schedule meetups, and tag sports weeks or convocations into permanent archives. Enjoy!',
    author: 'PakYearbook Core Admin',
    university: 'All',
    dateCreated: '2026-06-05T08:00:00Z'
  }
];

const initialAlumniUpdates: AlumniUpdate[] = [
  {
    id: 'alum-up-1',
    userId: 'user-ayesha',
    userName: 'Ayesha Khan',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    userUniversity: 'FAST-NUCES (National University of Computer & Emerging Sciences)',
    graduationYear: '2022',
    type: 'career',
    title: 'Joined Educative Pakistan as Frontend Engineer! 🚀',
    content: 'Warm greetings classmates! Super excited to share that I have started a new position as a Frontend Developer at Educative here in Lahore. Grateful for all the coding battles back at FAST, and the late night labs. If anyone wants tips on front-end frameworks or is seeking entry level roles, feel free to comment or text me directly!',
    link: 'https://linkedin.com/u/ayesha',
    dateCreated: '2026-06-05T09:00:00Z'
  },
  {
    id: 'alum-up-2',
    userId: 'user-zain',
    userName: 'Zain Butt',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    userUniversity: 'Punjab University (University of the Punjab)',
    graduationYear: '2023',
    type: 'mentorship',
    title: 'Offering Resume Reviews and SQA Prep for Punjab University Juniors! 📝',
    content: 'Hi fellow PU Business & CS folks! Having spent some time in industry, I would love to pay it forward. If you are preparing resumes for Systems Ltd, or trying to break into QA/Business Analysis slots, shoot me a DM here on PakYearbook or let\'s sync up. Happy to mentor 3 juniors this month!',
    link: 'https://linkedin.com/u/zain',
    dateCreated: '2026-06-06T04:15:00Z'
  }
];

// Helper methods to resolve local database
const getCollection = <T>(key: string, seed: T): T => {
  const stored = localStorage.getItem(`pakyearbook_${key}`);
  if (!stored) {
    localStorage.setItem(`pakyearbook_${key}`, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    return seed;
  }
};

const saveCollection = <T>(key: string, data: T) => {
  localStorage.setItem(`pakyearbook_${key}`, JSON.stringify(data));
};

const users_db = () => getCollection<User[]>('users', initialUsers);
const posts_db = () => getCollection<Post[]>('posts', initialPosts);
const comments_db = () => getCollection<Comment[]>('comments', initialComments);
const uni_db = () => getCollection<University[]>('universities', initialUniversities);
const msg_db = () => getCollection<Message[]>('messages', []);
const event_db = () => getCollection<UniEvent[]>('events', initialEvents);
const notify_db = () => getCollection<Notification[]>('notifications', []);
const report_db = () => getCollection<Report[]>('reports', []);
const ann_db = () => getCollection<Announcement[]>('announcements', initialAnnouncements);
const alum_db = () => getCollection<AlumniUpdate[]>('alumni_updates', initialAlumniUpdates);

const save_users = (users: User[]) => saveCollection('users', users);
const save_posts = (posts: Post[]) => saveCollection('posts', posts);
const save_comments = (comments: Comment[]) => saveCollection('comments', comments);
const save_uni = (uni: University[]) => saveCollection('universities', uni);
const save_messages = (msgs: Message[]) => saveCollection('messages', msgs);
const save_events = (evs: UniEvent[]) => saveCollection('events', evs);
const save_notifications = (notifs: Notification[]) => saveCollection('notifications', notifs);
const save_reports = (reps: Report[]) => saveCollection('reports', reps);
const save_ann = (anns: Announcement[]) => saveCollection('announcements', anns);
const save_alum = (alums: AlumniUpdate[]) => saveCollection('alumni_updates', alums);

const getAuthUser = (): User | null => {
  if (!authToken) return null;
  const list = users_db();
  return list.find(u => u.id === authToken) || null;
};

const createLocalNotify = (userId: string, notify: Partial<Notification>) => {
  const notifs = notify_db();
  const n: Notification = {
    id: `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    type: notify.type || 'announcement',
    senderId: notify.senderId || 'user-admin',
    senderName: notify.senderName || 'System',
    senderPhoto: notify.senderPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    postId: notify.postId,
    content: notify.content || '',
    dateCreated: new Date().toISOString(),
    isRead: false
  };
  notifs.unshift(n);
  save_notifications(notifs);
};

export const api = {
  auth: {
    register: async (data: Partial<User>): Promise<{ user: User; token: string }> => {
      await new Promise(r => setTimeout(r, 200));
      const { name, email, password, university, department, degreeProgram, batch, regNo, profilePhoto, bio } = data;
      
      if (!name || !email || !password || !university) {
        throw new Error('Name, Email, Password, and University are required.');
      }
      
      const users = users_db();
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email address already exists.');
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        university,
        department: department || '',
        degreeProgram: degreeProgram || 'Bachelors',
        batch: batch || '2026',
        regNo: regNo || '',
        profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        bio: bio || '',
        role: email.toLowerCase() === 'admin@pakyearbook.pk' ? 'admin' : 'user',
        dateJoined: new Date().toISOString(),
        followers: [],
        following: [],
        savedPosts: []
      };
      
      users.push(newUser);
      save_users(users);
      setAuthToken(newUser.id);
      return { user: newUser, token: newUser.id };
    },

    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      await new Promise(r => setTimeout(r, 200));
      const users = users_db();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password.');
      }
      
      setAuthToken(user.id);
      return { user, token: user.id };
    },

    logout: () => {
      setAuthToken('');
    },

    getMe: async (): Promise<{ user: User }> => {
      const user = getAuthUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      return { user };
    },

    updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const users = users_db();
      const idx = users.findIndex(u => u.id === active.id);
      if (idx === -1) throw new Error('User not found.');
      
      const updated = { ...users[idx], ...data };
      users[idx] = updated;
      save_users(users);
      
      if (data.name || data.profilePhoto) {
        const posts = posts_db();
        posts.forEach(p => {
          if (p.userId === active.id) {
            if (data.name) p.userName = data.name;
            if (data.profilePhoto) p.userPhoto = data.profilePhoto;
          }
        });
        save_posts(posts);
        
        const comments = comments_db();
        comments.forEach(c => {
          if (c.userId === active.id) {
            if (data.name) c.userName = data.name;
            if (data.profilePhoto) c.userPhoto = data.profilePhoto;
          }
        });
        save_comments(comments);
      }
      
      return { user: updated };
    },

    followUser: async (userId: string): Promise<{ following: boolean }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      if (active.id === userId) throw new Error('You cannot follow yourself.');
      
      const users = users_db();
      const meIdx = users.findIndex(u => u.id === active.id);
      const themIdx = users.findIndex(u => u.id === userId);
      
      if (meIdx === -1 || themIdx === -1) throw new Error('User not found');
      
      const me = users[meIdx];
      const them = users[themIdx];
      
      const alreadyFollowing = me.following.includes(userId);
      if (alreadyFollowing) {
        me.following = me.following.filter(id => id !== userId);
        them.followers = them.followers.filter(id => id !== active.id);
      } else {
        me.following.push(userId);
        them.followers.push(active.id);
        
        createLocalNotify(userId, {
          type: 'follow',
          senderId: active.id,
          senderName: active.name,
          senderPhoto: active.profilePhoto,
          content: `started following you.`
        });
      }
      
      save_users(users);
      return { following: !alreadyFollowing };
    },

    getUsers: async (): Promise<User[]> => {
      return users_db();
    }
  },

  posts: {
    list: async (filters?: { query?: string; category?: string; university?: string; department?: string; isFeatured?: boolean }): Promise<Post[]> => {
      let list = posts_db();
      
      if (filters) {
        const { query, category, university, department, isFeatured } = filters;
        if (category) {
          list = list.filter(p => p.category === category);
        }
        if (university) {
          list = list.filter(p => p.university && p.university.toLowerCase() === university.toLowerCase());
        }
        if (department) {
          list = list.filter(p => p.department && p.department.toLowerCase() === department.toLowerCase());
        }
        if (isFeatured !== undefined) {
          list = list.filter(p => p.isFeatured === isFeatured);
        }
        if (query) {
          const q = query.toLowerCase();
          list = list.filter(p => 
            p.caption.toLowerCase().includes(q) ||
            p.userName.toLowerCase().includes(q) ||
            (p.eventName && p.eventName.toLowerCase().includes(q))
          );
        }
      }
      
      return list.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
    },

    get: async (id: string): Promise<Post> => {
      const posts = posts_db();
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      
      post.views = (post.views || 0) + 1;
      save_posts(posts);
      return post;
    },

    create: async (data: Partial<Post>): Promise<Post> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const posts = posts_db();
      const newPost: Post = {
        id: `post-${Date.now()}`,
        userId: active.id,
        userName: active.name,
        userPhoto: active.profilePhoto,
        userUniversity: active.university,
        university: data.university || active.university,
        department: data.department || active.department || '',
        caption: data.caption || '',
        category: data.category || 'Campus Life',
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
        eventName: data.eventName || '',
        tags: data.tags || [],
        deptTags: data.deptTags || [],
        likedBy: [],
        commentCount: 0,
        dateCreated: new Date().toISOString(),
        isFeatured: false,
        views: 0
      };
      
      posts.unshift(newPost);
      save_posts(posts);
      return newPost;
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const posts = posts_db();
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Post not found');
      
      const p = posts[index];
      if (p.userId !== active.id && active.role !== 'admin') {
        throw new Error('Permission denied.');
      }
      
      posts.splice(index, 1);
      save_posts(posts);
      
      let comments = comments_db();
      comments = comments.filter(c => c.postId !== id);
      save_comments(comments);
      
      return { success: true, message: 'Memory record deleted successfully' };
    },

    toggleLike: async (id: string): Promise<{ isLiked: boolean; likedCount: number }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const posts = posts_db();
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      
      const likerIndex = post.likedBy.indexOf(active.id);
      let isLiked = false;
      
      if (likerIndex !== -1) {
        post.likedBy.splice(likerIndex, 1);
      } else {
        post.likedBy.push(active.id);
        isLiked = true;
        
        if (post.userId !== active.id) {
          createLocalNotify(post.userId, {
            type: 'like',
            senderId: active.id,
            senderName: active.name,
            senderPhoto: active.profilePhoto,
            postId: post.id,
            content: `liked your university memory: "${post.caption.substring(0, 30)}..."`
          });
        }
      }
      
      save_posts(posts);
      return { isLiked, likedCount: post.likedBy.length };
    },

    toggleSave: async (id: string): Promise<{ isSaved: boolean }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const users = users_db();
      const idx = users.findIndex(u => u.id === active.id);
      if (idx === -1) throw new Error('User not found');
      
      const user = users[idx];
      if (!user.savedPosts) user.savedPosts = [];
      
      const pIdx = user.savedPosts.indexOf(id);
      let isSaved = false;
      
      if (pIdx !== -1) {
        user.savedPosts.splice(pIdx, 1);
      } else {
        user.savedPosts.push(id);
        isSaved = true;
      }
      
      save_users(users);
      return { isSaved };
    },

    featurePost: async (id: string, isFeatured: boolean): Promise<Post> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      const posts = posts_db();
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      
      post.isFeatured = isFeatured;
      save_posts(posts);
      return post;
    }
  },

  comments: {
    list: async (postId: string): Promise<Comment[]> => {
      const comments = comments_db();
      return comments.filter(c => c.postId === postId).sort((a, b) => a.dateCreated.localeCompare(b.dateCreated));
    },

    create: async (postId: string, content: string): Promise<Comment> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const comments = comments_db();
      const posts = posts_db();
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) throw new Error('Memory post not found');
      
      const newComment: Comment = {
        id: `com-${Date.now()}`,
        postId,
        userId: active.id,
        userName: active.name,
        userPhoto: active.profilePhoto,
        content,
        dateCreated: new Date().toISOString()
      };
      
      comments.push(newComment);
      save_comments(comments);
      
      posts[postIndex].commentCount = comments.filter(c => c.postId === postId).length;
      save_posts(posts);
      
      if (posts[postIndex].userId !== active.id) {
        createLocalNotify(posts[postIndex].userId, {
          type: 'comment',
          senderId: active.id,
          senderName: active.name,
          senderPhoto: active.profilePhoto,
          postId,
          content: `commented on your memory: "${content.substring(0, 40)}"`
        });
      }
      
      return newComment;
    }
  },

  suggestions: {
    get: async (query: string): Promise<{ students: any[]; universities: any[]; events: any[]; posts: any[] }> => {
      const q = query.toLowerCase();
      if (!q) return { students: [], universities: [], events: [], posts: [] };
      
      const students = users_db().filter(u => u.name.toLowerCase().includes(q) || u.university.toLowerCase().includes(q));
      const universities = uni_db().filter(u => u.name.toLowerCase().includes(q) || u.province.toLowerCase().includes(q));
      const events = event_db().filter(e => e.title.toLowerCase().includes(q) || e.university.toLowerCase().includes(q));
      const posts = posts_db().filter(p => p.caption.toLowerCase().includes(q));
      
      return { students, universities, events, posts };
    }
  },

  universities: {
    list: async (): Promise<University[]> => {
      return uni_db();
    },

    create: async (data: Partial<University>): Promise<University> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      const list = uni_db();
      const newUni: University = {
        id: `uni-${Date.now()}`,
        name: data.name || 'New University',
        province: data.province || 'Punjab',
        logo: data.logo || '',
        location: data.location || 'Pakistan',
        website: data.website || '',
        isApproved: true,
        numStudents: 150
      };
      
      list.unshift(newUni);
      save_uni(list);
      return newUni;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      const list = uni_db();
      const index = list.findIndex(u => u.id === id);
      if (index === -1) throw new Error('University not found');
      
      list.splice(index, 1);
      save_uni(list);
      return { success: true };
    }
  },

  communities: {
    getFolder: async (universityName: string): Promise<{ students: User[]; posts: Post[]; events: UniEvent[] }> => {
      const students = users_db().filter(u => u.university.toLowerCase() === universityName.toLowerCase());
      const posts = posts_db().filter(p => p.university && p.university.toLowerCase() === universityName.toLowerCase());
      const events = event_db().filter(e => e.university.toLowerCase() === universityName.toLowerCase());
      
      return { students, posts, events };
    }
  },

  messages: {
    getChat: async (userId: string): Promise<Message[]> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const msgs = msg_db();
      const list = msgs.filter(m => 
        (m.senderId === active.id && m.receiverId === userId) ||
        (m.senderId === userId && m.receiverId === active.id)
      ).sort((a, b) => a.dateCreated.localeCompare(b.dateCreated));
      
      let updated = false;
      msgs.forEach(m => {
        if (m.senderId === userId && m.receiverId === active.id && !m.isRead) {
          m.isRead = true;
          updated = true;
        }
      });
      if (updated) {
        save_messages(msgs);
      }
      
      return list;
    },

    send: async (receiverId: string, content: string): Promise<Message> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const msgs = msg_db();
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        senderId: active.id,
        receiverId,
        content,
        dateCreated: new Date().toISOString(),
        isRead: false
      };
      
      msgs.push(newMsg);
      save_messages(msgs);
      
      createLocalNotify(receiverId, {
        type: 'message',
        senderId: active.id,
        senderName: active.name,
        senderPhoto: active.profilePhoto,
        content: `sent you a message.`
      });
      
      return newMsg;
    }
  },

  events: {
    list: async (): Promise<UniEvent[]> => {
      return event_db().sort((a, b) => a.date.localeCompare(b.date));
    },

    create: async (data: Partial<UniEvent>): Promise<UniEvent> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required');
      
      const evs = event_db();
      const newEvent: UniEvent = {
        id: `event-${Date.now()}`,
        university: data.university || active.university || 'All',
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString().split('T')[0],
        time: data.time || '14:00',
        location: data.location || 'Main Auditorium',
        category: data.category || 'Society Events',
        organizers: data.organizers || active.name,
        rsvpIds: [],
        dateCreated: new Date().toISOString()
      };
      
      evs.unshift(newEvent);
      save_events(evs);
      return newEvent;
    },

    rsvp: async (id: string): Promise<{ rsvped: boolean; count: number }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const evs = event_db();
      const ev = evs.find(e => e.id === id);
      if (!ev) throw new Error('Event not found');
      
      const idx = ev.rsvpIds.indexOf(active.id);
      let rsvped = false;
      
      if (idx !== -1) {
        ev.rsvpIds.splice(idx, 1);
      } else {
        ev.rsvpIds.push(active.id);
        rsvped = true;
      }
      
      save_events(evs);
      return { rsvped, count: ev.rsvpIds.length };
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const evs = event_db();
      const index = evs.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Event not found');
      
      if (active.role !== 'admin') {
        throw new Error('Access denied.');
      }
      
      evs.splice(index, 1);
      save_events(evs);
      return { success: true };
    }
  },

  notifications: {
    list: async (): Promise<Notification[]> => {
      const active = getAuthUser();
      if (!active) return [];
      
      return notify_db().filter(n => n.userId === active.id).sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
    },

    markRead: async (): Promise<{ success: boolean }> => {
      const active = getAuthUser();
      if (!active) return { success: false };
      
      const notifs = notify_db();
      notifs.forEach(n => {
        if (n.userId === active.id) {
          n.isRead = true;
        }
      });
      save_notifications(notifs);
      return { success: true };
    }
  },

  reports: {
    list: async (): Promise<Report[]> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      return report_db();
    },

    create: async (itemType: 'post' | 'comment' | 'user', itemId: string, content: string): Promise<Report> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required.');
      
      const reps = report_db();
      const newRep: Report = {
        id: `report-${Date.now()}`,
        reporterId: active.id,
        reporterName: active.name,
        itemType,
        itemId,
        content,
        status: 'pending',
        dateCreated: new Date().toISOString()
      };
      
      reps.unshift(newRep);
      save_reports(reps);
      return newRep;
    },

    resolve: async (id: string): Promise<Report> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      const reps = report_db();
      const rep = reps.find(r => r.id === id);
      if (!rep) throw new Error('Report not found');
      
      rep.status = 'resolved';
      save_reports(reps);
      return rep;
    }
  },

  announcements: {
    list: async (): Promise<Announcement[]> => {
      return ann_db();
    },

    create: async (title: string, content: string, university?: string): Promise<Announcement> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      const anns = ann_db();
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title,
        content,
        author: active.name,
        university: university || 'All',
        dateCreated: new Date().toISOString()
      };
      
      anns.unshift(newAnn);
      save_ann(anns);
      return newAnn;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      const active = getAuthUser();
      if (!active || active.role !== 'admin') throw new Error('Admin rights required.');
      
      const anns = ann_db();
      const index = anns.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Not found');
      
      anns.splice(index, 1);
      save_ann(anns);
      return { success: true };
    }
  },

  alumni: {
    listUpdates: async (): Promise<AlumniUpdate[]> => {
      return alum_db();
    },

    createUpdate: async (data: Partial<AlumniUpdate>): Promise<AlumniUpdate> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required');
      
      const alums = alum_db();
      const newUpdate: AlumniUpdate = {
        id: `alum-up-${Date.now()}`,
        userId: active.id,
        userName: active.name,
        userPhoto: active.profilePhoto,
        userUniversity: active.university,
        graduationYear: data.graduationYear || active.graduationYear || active.batch || '2026',
        type: data.type || 'career',
        title: data.title || 'Career Update',
        content: data.content || '',
        link: data.link || '',
        dateCreated: new Date().toISOString()
      };
      
      alums.unshift(newUpdate);
      save_alum(alums);
      return newUpdate;
    },

    deleteUpdate: async (id: string): Promise<{ success: boolean }> => {
      const active = getAuthUser();
      if (!active) throw new Error('Authentication required');
      
      const alums = alum_db();
      const idx = alums.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('Update not found');
      
      if (alums[idx].userId !== active.id && active.role !== 'admin') {
        throw new Error('Access denied');
      }
      
      alums.splice(idx, 1);
      save_alum(alums);
      return { success: true };
    }
  },

  stats: {
    get: async (): Promise<AppStats> => {
      return {
        totalUsers: users_db().length,
        totalMemories: posts_db().length,
        totalUniversities: uni_db().length,
        totalEvents: event_db().length
      };
    }
  }
};
