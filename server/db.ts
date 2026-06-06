import * as fs from 'fs';
import * as path from 'path';
import { User, Post, Comment, University, Message, UniEvent, Notification, Report, Announcement, AppStats, AlumniUpdate } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');

// Helper to ensure data directory and files exist with initial seeds
function ensureDataFile<T>(filename: string, initialData: T): T {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filename}, recreating...`, err);
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDataFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Global state cache
let users: User[] = [];
let posts: Post[] = [];
let comments: Comment[] = [];
let universities: University[] = [];
let messages: Message[] = [];
let events: UniEvent[] = [];
let notifications: Notification[] = [];
let reports: Report[] = [];
let announcements: Announcement[] = [];
let alumniUpdates: AlumniUpdate[] = [];

// Seed Universities list
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

// Seed Users list (one default admin and representative students)
const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Admin Desk',
    email: 'admin@pakyearbook.pk',
    password: 'password123', // Hardcoded hash equivalent in simple auth
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

// Seed Memories (Posts)
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

// Seed Comments
const initialComments: Comment[] = [
  { id: 'com-1', postId: 'post-1', userId: 'user-ayesha', userName: 'Ayesha Khan', userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', content: 'What a match! That last over boundary was fantastic!! 🔥', dateCreated: '2026-05-20T11:45:00Z' },
  { id: 'com-2', postId: 'post-1', userId: 'user-zain', userName: 'Zain Butt', userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', content: 'Huge congrats, Ali! You guys deserved this win.', dateCreated: '2026-05-20T12:15:00Z' },
  { id: 'com-3', postId: 'post-2', userId: 'user-ali', userName: 'Ali Rahman', userPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', content: 'Wow, excellent photography. Take me back!', dateCreated: '2026-05-22T15:00:00Z' },
  { id: 'com-4', postId: 'post-3', userId: 'user-admin', userName: 'Admin Desk', userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', content: 'Congratulations, Zain! Wishing you the best of luck in your future endeavors.', dateCreated: '2026-06-01T10:00:00Z' }
];

// Seed Events
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

// Seed Announcements
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

// Initialize global state cache from files
export function initDB() {
  users = ensureDataFile('users.json', initialUsers);
  posts = ensureDataFile('posts.json', initialPosts);
  comments = ensureDataFile('comments.json', initialComments);
  universities = ensureDataFile('universities.json', initialUniversities);
  
  // Guarantee presence of the requested MNSUET university
  const hasMnsuet = universities.some(u => u.name === 'Muhammad Nawaz shareef University of engenering and technoology');
  if (!hasMnsuet) {
    universities.push({
      id: 'uni-mnsuet', 
      name: 'Muhammad Nawaz shareef University of engenering and technoology', 
      province: 'Punjab', 
      location: 'Multan, Punjab', 
      website: 'https://mnsuet.edu.pk', 
      isApproved: true, 
      numStudents: 350
    });
    writeDataFile('universities.json', universities);
  }

  messages = ensureDataFile('messages.json', []);
  events = ensureDataFile('events.json', initialEvents);
  notifications = ensureDataFile('notifications.json', []);
  reports = ensureDataFile('reports.json', []);
  announcements = ensureDataFile('announcements.json', initialAnnouncements);
  alumniUpdates = ensureDataFile('alumni_updates.json', initialAlumniUpdates);
  console.log('PakYearbook files database loaded and seeded successfully.');
}

// Write/Sync Functions
const syncUsers = () => writeDataFile('users.json', users);
const syncPosts = () => writeDataFile('posts.json', posts);
const syncComments = () => writeDataFile('comments.json', comments);
const syncUniversities = () => writeDataFile('universities.json', universities);
const syncMessages = () => writeDataFile('messages.json', messages);
const syncEvents = () => writeDataFile('events.json', events);
const syncNotifications = () => writeDataFile('notifications.json', notifications);
const syncReports = () => writeDataFile('reports.json', reports);
const syncAnnouncements = () => writeDataFile('announcements.json', announcements);
const syncAlumniUpdates = () => writeDataFile('alumni_updates.json', alumniUpdates);

// Database queries & mutations
export const DB = {
  // ---- USERS ----
  getUsers: () => users,
  getUserById: (id: string) => users.find(u => u.id === id),
  getUserByEmail: (email: string) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: Partial<User>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: user.name || 'Anonymous Student',
      email: user.email || '',
      password: user.password || 'password123',
      university: user.university || '',
      department: user.department || '',
      degreeProgram: user.degreeProgram || 'Bachelors',
      batch: user.batch || '2026',
      regNo: user.regNo || '',
      profilePhoto: user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      bio: user.bio || '',
      role: (user.email === 'admin@pakyearbook.pk') ? 'admin' : (user.role || 'user'),
      dateJoined: new Date().toISOString(),
      followers: [],
      following: [],
      savedPosts: []
    };
    users.push(newUser);
    syncUsers();
    return newUser;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      // Don't leak or overwrite critical internal elements inappropriately
      users[index] = { ...users[index], ...updates };
      syncUsers();
      // Also update name/photo references in memories so user has real-time UI profile updates
      if (updates.name || updates.profilePhoto) {
        posts.forEach(p => {
          if (p.userId === id) {
            if (updates.name) p.userName = updates.name;
            if (updates.profilePhoto) p.userPhoto = updates.profilePhoto;
          }
        });
        syncPosts();
        comments.forEach(c => {
          if (c.userId === id) {
            if (updates.name) c.userName = updates.name;
            if (updates.profilePhoto) c.userPhoto = updates.profilePhoto;
          }
        });
        syncComments();
      }
      return users[index];
    }
    return null;
  },
  followUser: (followerId: string, followingId: string) => {
    const follower = users.find(u => u.id === followerId);
    const following = users.find(u => u.id === followingId);
    if (follower && following && followerId !== followingId) {
      const alreadyFollowing = follower.following.includes(followingId);
      if (alreadyFollowing) {
        // Unfollow
        follower.following = follower.following.filter(id => id !== followingId);
        following.followers = following.followers.filter(id => id !== followerId);
      } else {
        // Follow
        follower.following.push(followingId);
        following.followers.push(followerId);
        // Dispatch Notification
        DB.createNotification({
          userId: followingId,
          type: 'follow',
          senderId: followerId,
          senderName: follower.name,
          senderPhoto: follower.profilePhoto,
          content: `started following you.`
        });
      }
      syncUsers();
      return { following: !alreadyFollowing };
    }
    return null;
  },

  // ---- MEMORIES / POSTS ----
  getPosts: () => posts.sort((a,b) => b.dateCreated.localeCompare(a.dateCreated)),
  getPostById: (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      post.views = (post.views || 0) + 1;
      syncPosts();
    }
    return post;
  },
  createPost: (postData: Partial<Post> & { userId: string }) => {
    const user = DB.getUserById(postData.userId);
    if (!user) return null;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userPhoto: user.profilePhoto,
      userUniversity: user.university,
      university: postData.university || user.university,
      department: postData.department || user.department,
      caption: postData.caption || '',
      category: postData.category || 'Campus Life',
      imageUrl: postData.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      eventName: postData.eventName || '',
      tags: postData.tags || [],
      deptTags: postData.deptTags || [],
      likedBy: [],
      commentCount: 0,
      dateCreated: new Date().toISOString(),
      isFeatured: false,
      views: 0
    };
    posts.unshift(newPost);
    syncPosts();
    return newPost;
  },
  deletePost: (id: string, userId: string, role: string) => {
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      const p = posts[index];
      if (p.userId === userId || role === 'admin') {
        posts.splice(index, 1);
        syncPosts();
        // Remove related comments
        comments = comments.filter(c => c.postId !== id);
        syncComments();
        return true;
      }
    }
    return false;
  },
  toggleLikePost: (postId: string, userId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const userIndex = post.likedBy.indexOf(userId);
      let isLiked = false;
      if (userIndex !== -1) {
        post.likedBy.splice(userIndex, 1);
      } else {
        post.likedBy.push(userId);
        isLiked = true;
        // Dispatch Notification
        if (post.userId !== userId) {
          const liker = DB.getUserById(userId);
          if (liker) {
            DB.createNotification({
              userId: post.userId,
              type: 'like',
              senderId: userId,
              senderName: liker.name,
              senderPhoto: liker.profilePhoto,
              postId: post.id,
              content: `liked your university memory: "${post.caption.substring(0, 30)}..."`
            });
          }
        }
      }
      syncPosts();
      return { isLiked, likedCount: post.likedBy.length };
    }
    return null;
  },
  toggleSavePost: (postId: string, userId: string) => {
    const user = DB.getUserById(userId);
    if (user) {
      if (!user.savedPosts) {
        user.savedPosts = [];
      }
      const pIndex = user.savedPosts.indexOf(postId);
      let isSaved = false;
      if (pIndex !== -1) {
        user.savedPosts.splice(pIndex, 1);
      } else {
        user.savedPosts.push(postId);
        isSaved = true;
      }
      syncUsers();
      return { isSaved };
    }
    return null;
  },
  setFeaturedMemory: (postId: string, isFeatured: boolean) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.isFeatured = isFeatured;
      syncPosts();
      return post;
    }
    return null;
  },

  // ---- COMMENTS ----
  getPostComments: (postId: string) => comments.filter(c => c.postId === postId).sort((a,b) => a.dateCreated.localeCompare(b.dateCreated)),
  createComment: (postId: string, userId: string, content: string) => {
    const user = DB.getUserById(userId);
    const post = posts.find(p => p.id === postId);
    if (user && post) {
      const newComment: Comment = {
        id: `com-${Date.now()}`,
        postId,
        userId,
        userName: user.name,
        userPhoto: user.profilePhoto,
        content,
        dateCreated: new Date().toISOString()
      };
      comments.push(newComment);
      syncComments();

      post.commentCount = comments.filter(c => c.postId === postId).length;
      syncPosts();

      // Dispatch Notification
      if (post.userId !== userId) {
        DB.createNotification({
          userId: post.userId,
          type: 'comment',
          senderId: userId,
          senderName: user.name,
          senderPhoto: user.profilePhoto,
          postId: post.id,
          content: `commented on your memory: "${content.substring(0, 40)}"`
        });
      }

      return newComment;
    }
    return null;
  },

  // ---- UNIVERSITIES ----
  getUniversities: () => universities,
  addUniversity: (uni: Partial<University>) => {
    const id = `uni-${Date.now()}`;
    const newUni: University = {
      id,
      name: uni.name || 'New University',
      province: uni.province || 'Punjab',
      logo: uni.logo || '',
      location: uni.location || 'Pakistan',
      website: uni.website || 'https://www.google.com',
      isApproved: true,
      numStudents: 1
    };
    universities.unshift(newUni);
    syncUniversities();
    return newUni;
  },
  updateUniversityApprovedStatus: (id: string, isApproved: boolean) => {
    const uni = universities.find(u => u.id === id);
    if (uni) {
      uni.isApproved = isApproved;
      syncUniversities();
      return uni;
    }
    return null;
  },
  deleteUniversity: (id: string) => {
    const index = universities.findIndex(u => u.id === id);
    if (index !== -1) {
      universities.splice(index, 1);
      syncUniversities();
      return true;
    }
    return false;
  },

  // ---- REALTIME CHAT / MESSAGING ----
  getMessages: (userA: string, userB: string) => {
    return messages.filter(
      m => (m.senderId === userA && m.receiverId === userB) || (m.senderId === userB && m.receiverId === userA)
    ).sort((a,b) => a.dateCreated.localeCompare(b.dateCreated));
  },
  sendMessage: (senderId: string, receiverId: string, content: string) => {
    const sender = DB.getUserById(senderId);
    if (!sender) return null;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      dateCreated: new Date().toISOString(),
      isRead: false
    };
    messages.push(newMessage);
    syncMessages();

    // Notify receiver
    DB.createNotification({
      userId: receiverId,
      type: 'message',
      senderId,
      senderName: sender.name,
      senderPhoto: sender.profilePhoto,
      content: `sent you a message.`
    });

    return newMessage;
  },
  markMessagesRead: (userA: string, userB: string) => {
    // Mark messages senderId=userB, receiverId=userA as read
    messages.forEach(m => {
      if (m.senderId === userB && m.receiverId === userA) {
        m.isRead = true;
      }
    });
    syncMessages();
  },

  // ---- UNIVERSITY EVENTS ----
  getEvents: () => events.sort((a,b) => a.date.localeCompare(b.date)),
  createEvent: (ev: Partial<UniEvent>) => {
    const newEvent: UniEvent = {
      id: `event-${Date.now()}`,
      university: ev.university || 'All',
      title: ev.title || 'Untitled Event',
      description: ev.description || '',
      date: ev.date || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      time: ev.time || '12:00',
      location: ev.location || 'Campus Auditorium',
      category: ev.category || 'Seminar',
      organizers: ev.organizers || 'Student Council',
      rsvpIds: [],
      dateCreated: new Date().toISOString()
    };
    events.unshift(newEvent);
    syncEvents();
    return newEvent;
  },
  toggleRsvp: (eventId: string, userId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      const idx = ev.rsvpIds.indexOf(userId);
      let rsvped = false;
      if (idx !== -1) {
        ev.rsvpIds.splice(idx, 1);
      } else {
        ev.rsvpIds.push(userId);
        rsvped = true;
      }
      syncEvents();
      return { rsvped, count: ev.rsvpIds.length };
    }
    return null;
  },
  deleteEvent: (eventId: string) => {
    const idx = events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      events.splice(idx, 1);
      syncEvents();
      return true;
    }
    return false;
  },

  // ---- NOTIFICATIONS ----
  getNotifications: (userId: string) => {
    return notifications.filter(n => n.userId === userId).sort((a,b) => b.dateCreated.localeCompare(a.dateCreated));
  },
  createNotification: (notify: Partial<Notification> & { userId: string }) => {
    const newNotify: Notification = {
      id: `notify-${Date.now()}`,
      userId: notify.userId,
      type: notify.type || 'announcement',
      senderId: notify.senderId || 'user-admin',
      senderName: notify.senderName || 'System',
      senderPhoto: notify.senderPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      postId: notify.postId,
      content: notify.content || '',
      dateCreated: new Date().toISOString(),
      isRead: false
    };
    notifications.push(newNotify);
    syncNotifications();
    return newNotify;
  },
  markNotificationsRead: (userId: string) => {
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    syncNotifications();
  },

  // ---- REPORTS ----
  getReports: () => reports.sort((a,b) => b.dateCreated.localeCompare(a.dateCreated)),
  createReport: (reporterId: string, itemType: 'post' | 'comment' | 'user', itemId: string, content: string) => {
    const reporter = DB.getUserById(reporterId);
    if (!reporter) return null;

    const newReport: Report = {
      id: `report-${Date.now()}`,
      reporterId,
      reporterName: reporter.name,
      itemType,
      itemId,
      content,
      status: 'pending',
      dateCreated: new Date().toISOString()
    };
    reports.push(newReport);
    syncReports();
    return newReport;
  },
  resolveReport: (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      report.status = 'resolved';
      syncReports();
      return report;
    }
    return null;
  },

  // ---- ANNOUNCEMENTS ----
  getAnnouncements: () => announcements.sort((a,b) => b.dateCreated.localeCompare(a.dateCreated)),
  createAnnouncement: (ann: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: ann.title || 'Notice',
      content: ann.content || '',
      author: ann.author || 'Admin Desk',
      university: ann.university || 'All',
      dateCreated: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    syncAnnouncements();
    return newAnn;
  },
  deleteAnnouncement: (id: string) => {
    const idx = announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
      announcements.splice(idx, 1);
      syncAnnouncements();
      return true;
    }
    return false;
  },

  // ---- ANALYTICS STATS ----
  getAppStats: (): AppStats => {
    return {
      totalUsers: users.length,
      totalMemories: posts.length,
      totalUniversities: universities.length,
      totalEvents: events.length
    };
  },

  // ---- ALUMNI UPDATES NETWORK ----
  getAlumniUpdates: () => {
    return alumniUpdates.sort((a,b) => b.dateCreated.localeCompare(a.dateCreated));
  },
  createAlumniUpdate: (up: Partial<AlumniUpdate> & { userId: string }) => {
    const user = DB.getUserById(up.userId);
    if (!user) return null;

    const newUpdate: AlumniUpdate = {
      id: `alum-up-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userPhoto: user.profilePhoto,
      userUniversity: user.university,
      graduationYear: up.graduationYear || user.graduationYear || user.batch || '2026',
      type: up.type || 'career',
      title: up.title || 'Career Update',
      content: up.content || '',
      link: up.link || '',
      dateCreated: new Date().toISOString()
    };
    alumniUpdates.unshift(newUpdate);
    syncAlumniUpdates();
    return newUpdate;
  },
  deleteAlumniUpdate: (id: string, userId: string) => {
    const index = alumniUpdates.findIndex(u => u.id === id);
    if (index !== -1) {
      if (alumniUpdates[index].userId === userId) {
        alumniUpdates.splice(index, 1);
        syncAlumniUpdates();
        return true;
      }
    }
    return false;
  }
};
