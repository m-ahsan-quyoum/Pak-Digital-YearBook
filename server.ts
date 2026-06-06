import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDB, DB } from './server/db';

const app = express();
const PORT = 3000;

// Enable JSON bodies with higher limits for base64 university photos/images
app.use(express.json({ limit: '10mb' }));

// Initialize the Database Files
initDB();

// --- AUTHENTICATION MIDDLEWARE ---
// A clean, robust token-based mock authorization system
const getAuthenticatedUser = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;
  // In our system, the token is simply the user's ID for secure simplicity in the sandboxed dev context
  return DB.getUserById(token);
};

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }
  (req as any).user = user;
  next();
};

// ==========================================
//          PAK YEARBOOK REST API
// ==========================================

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, university, department, degreeProgram, batch, regNo, profilePhoto, bio } = req.body;
    
    if (!name || !email || !password || !university) {
      res.status(400).json({ error: 'Name, Email, Password, and University are required fields.' });
      return;
    }

    const existingUser = DB.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const user = DB.createUser({
      name,
      email,
      password,
      university,
      department,
      degreeProgram,
      batch,
      regNo,
      profilePhoto,
      bio,
      role: 'user' // auto-promotes inside createUser if admin email is used
    });

    // Strip password in response
    const { password: _, ...safeUser } = user!;
    res.status(201).json({ user: safeUser, token: user!.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = DB.getUserByEmail(email);
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token: user.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.put('/api/auth/profile', requireAuth, (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, university, department, degreeProgram, batch, regNo, profilePhoto, bio } = req.body;
    
    const updated = DB.updateUser(userId, {
      name,
      university,
      department,
      degreeProgram,
      batch,
      regNo,
      profilePhoto,
      bio
    });

    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Profile update failed' });
  }
});

app.post('/api/auth/follow', requireAuth, (req, res) => {
  try {
    const followerId = (req as any).user.id;
    const { userId: followingId } = req.body;

    if (!followingId) {
      res.status(400).json({ error: 'User ID to follow is required' });
      return;
    }

    const result = DB.followUser(followerId, followingId);
    if (!result) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', requireAuth, (req, res) => {
  const users = DB.getUsers().map(({ password, ...u }) => u);
  res.json(users);
});

// --- POSTS / MEMORIES ENDPOINTS ---
app.get('/api/posts', (req, res) => {
  try {
    const { query, category, university, department, isFeatured } = req.query;
    let list = DB.getPosts();

    // Filters
    if (category) {
      list = list.filter(p => p.category === category);
    }
    if (university) {
      list = list.filter(p => p.university === university);
    }
    if (department) {
      list = list.filter(p => p.department === department);
    }
    if (isFeatured === 'true') {
      list = list.filter(p => p.isFeatured);
    }

    // Advanced search query
    if (query) {
      const q = String(query).toLowerCase();
      list = list.filter(p => 
        p.caption.toLowerCase().includes(q) ||
        p.userName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.university.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.eventName && p.eventName.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.deptTags.some(dt => dt.toLowerCase().includes(q))
      );
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts/:id', (req, res) => {
  const post = DB.getPostById(req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Memory details not found' });
    return;
  }
  res.json(post);
});

app.post('/api/posts', requireAuth, (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { caption, category, imageUrl, eventName, tags, deptTags, university, department } = req.body;

    const post = DB.createPost({
      userId,
      caption,
      category,
      imageUrl,
      eventName,
      tags: tags || [],
      deptTags: deptTags || [],
      university,
      department
    });

    res.status(201).json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
  const success = DB.deletePost(req.params.id, userId, role);
  if (!success) {
    res.status(403).json({ error: 'You do not have permission to delete this post.' });
    return;
  }
  res.json({ success: true, message: 'Memory deleted successfully' });
});

app.post('/api/posts/:id/like', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  const result = DB.toggleLikePost(req.params.id, userId);
  if (!result) {
    res.status(404).json({ error: 'Memory not found' });
    return;
  }
  res.json(result);
});

app.post('/api/posts/:id/save', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  const result = DB.toggleSavePost(req.params.id, userId);
  if (!result) {
    res.status(404).json({ error: 'User or Memory not found' });
    return;
  }
  res.json(result);
});

app.put('/api/posts/:id/feature', requireAdmin, (req, res) => {
  const { isFeatured } = req.body;
  const post = DB.setFeaturedMemory(req.params.id, !!isFeatured);
  if (!post) {
    res.status(404).json({ error: 'Memory not found' });
    return;
  }
  res.json(post);
});

// --- STORIES / SEARCH SUGGESTIONS ---
app.get('/api/search/suggestions', (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.json({ students: [], universities: [], events: [], posts: [] });
    return;
  }
  const q = String(query).toLowerCase();

  const students = DB.getUsers()
    .filter(u => u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q))
    .slice(0, 4)
    .map(u => ({ id: u.id, name: u.name, desc: `${u.university} - ${u.department}`, photo: u.profilePhoto }));

  const unis = DB.getUniversities()
    .filter(u => u.name.toLowerCase().includes(q) || u.location.toLowerCase().includes(q))
    .slice(0, 4)
    .map(u => ({ id: u.id, name: u.name, desc: u.location }));

  const evs = DB.getEvents()
    .filter(e => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
    .slice(0, 4)
    .map(e => ({ id: e.id, name: e.title, desc: `${e.date} @ ${e.location}` }));

  const pts = DB.getPosts()
    .filter(p => p.caption.toLowerCase().includes(q) || (p.eventName && p.eventName.toLowerCase().includes(q)))
    .slice(0, 4)
    .map(p => ({ id: p.id, name: p.caption.slice(0, 40) + '...', desc: `By ${p.userName}` }));

  res.json({ students, universities: unis, events: evs, posts: pts });
});

// --- COMMENTS ENDPOINTS ---
app.get('/api/posts/:id/comments', (req, res) => {
  res.json(DB.getPostComments(req.params.id));
});

app.post('/api/posts/:id/comments', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Comment text cannot be empty' });
    return;
  }
  const comment = DB.createComment(req.params.id, userId, content);
  if (!comment) {
    res.status(444).json({ error: 'Failed to comment. Make sure the memory exists.' });
    return;
  }
  res.status(201).json(comment);
});

// --- UNIVERSITIES ENDPOINTS ---
app.get('/api/universities', (req, res) => {
  res.json(DB.getUniversities());
});

app.post('/api/universities', requireAdmin, (req, res) => {
  const { name, province, location, website } = req.body;
  if (!name || !location) {
    res.status(400).json({ error: 'University name and location are required.' });
    return;
  }
  const newUni = DB.addUniversity({ name, province, location, website });
  res.status(201).json(newUni);
});

app.delete('/api/universities/:id', requireAdmin, (req, res) => {
  const success = DB.deleteUniversity(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'University not found' });
    return;
  }
  res.json({ success: true, message: 'University removed successfully' });
});

// --- CO-COMMUNITY GROUPS DIRECTORIES ---
app.get('/api/communities/:universityName', requireAuth, (req, res) => {
  const { universityName } = req.params;
  const uniUsers = DB.getUsers().filter(u => u.university === universityName).map(({ password, ...u }) => u);
  const uniPosts = DB.getPosts().filter(p => p.university === universityName);
  const uniEvents = DB.getEvents().filter(e => e.university === universityName);
  res.json({
    students: uniUsers,
    posts: uniPosts,
    events: uniEvents
  });
});

// --- MESSAGING ENDPOINTS ---
app.get('/api/messages/:userId', requireAuth, (req, res) => {
  const currentUserId = (req as any).user.id;
  const partnerId = req.params.userId;
  // Mark read
  DB.markMessagesRead(currentUserId, partnerId);
  const conversation = DB.getMessages(currentUserId, partnerId);
  res.json(conversation);
});

app.post('/api/messages', requireAuth, (req, res) => {
  const senderId = (req as any).user.id;
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    res.status(400).json({ error: 'Receiver ID and content are required' });
    return;
  }
  const msg = DB.sendMessage(senderId, receiverId, content);
  if (!msg) {
    res.status(404).json({ error: 'Sender or partner cannot be resolved.' });
    return;
  }
  res.status(201).json(msg);
});

// --- SCHEDULER EVENTS ENDPOINTS ---
app.get('/api/events', (req, res) => {
  res.json(DB.getEvents());
});

app.post('/api/events', requireAuth, (req, res) => {
  const { title, description, date, time, location, category, organizers, university } = req.body;
  if (!title || !date || !location) {
    res.status(400).json({ error: 'Event Title, Date, and Location are required.' });
    return;
  }
  const ev = DB.createEvent({ title, description, date, time, location, category, organizers, university });
  res.status(201).json(ev);
});

app.post('/api/events/:id/rsvp', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  const result = DB.toggleRsvp(req.params.id, userId);
  if (!result) {
    res.status(404).json({ error: 'Event scheduler link not found' });
    return;
  }
  res.json(result);
});

app.delete('/api/events/:id', requireAuth, (req, res) => {
  // Allow admins or let's say anyone for development purposes can maintain it
  const success = DB.deleteEvent(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json({ success: true });
});

// --- NOTIFICATIONS ENDPOINTS ---
app.get('/api/notifications', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  res.json(DB.getNotifications(userId));
});

app.post('/api/notifications/read', requireAuth, (req, res) => {
  const userId = (req as any).user.id;
  DB.markNotificationsRead(userId);
  res.json({ success: true });
});

// --- ALUMNI UPDATES ENDPOINTS ---
app.get('/api/alumni/updates', (req, res) => {
  try {
    res.json(DB.getAlumniUpdates());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alumni/updates', requireAuth, (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { title, content, type, link, graduationYear } = req.body;
    if (!title || !content || !type) {
      res.status(400).json({ error: 'Title, content, and type are required.' });
      return;
    }
    const update = DB.createAlumniUpdate({
      userId,
      title,
      content,
      type,
      link,
      graduationYear
    });
    res.status(201).json(update);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/alumni/updates/:id', requireAuth, (req, res) => {
  try {
    const userId = (req as any).user.id;
    const success = DB.deleteAlumniUpdate(req.params.id, userId);
    if (!success) {
      res.status(403).json({ error: 'You do not have permission to delete this update.' });
      return;
    }
    res.json({ success: true, message: 'Alumni update removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ANNOUNCEMENTS ---
app.get('/api/announcements', (req, res) => {
  res.json(DB.getAnnouncements());
});

app.post('/api/announcements', requireAdmin, (req, res) => {
  const { title, content, university } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const ann = DB.createAnnouncement({ title, content, university: university || 'All', author: 'PakYearbook Core Admin' });
  res.status(201).json(ann);
});

app.delete('/api/announcements/:id', requireAdmin, (req, res) => {
  const success = DB.deleteAnnouncement(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Notice not found' });
    return;
  }
  res.json({ success: true });
});

// --- REPORTS ENDPOINTS ---
app.get('/api/reports', requireAdmin, (req, res) => {
  res.json(DB.getReports());
});

app.post('/api/reports', requireAuth, (req, res) => {
  const reporterId = (req as any).user.id;
  const { itemType, itemId, content } = req.body;
  if (!itemType || !itemId || !content) {
    res.status(400).json({ error: 'Item type, ID, and reason are required.' });
    return;
  }
  const rp = DB.createReport(reporterId, itemType, itemId, content);
  res.status(201).json(rp);
});

app.put('/api/reports/:id/resolve', requireAdmin, (req, res) => {
  const rp = DB.resolveReport(req.params.id);
  if (!rp) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json(rp);
});

// --- STATS ENDPORT ---
app.get('/api/stats', (req, res) => {
  res.json(DB.getAppStats());
});

// ==========================================
//          VITE / STATIC ROUTING SETUP
// ==========================================

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PakYearbook backend running on port ${PORT}`);
  });
}

startServer();
