/**
 * PakYearbook Shared Types & Interfaces
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Excluded from client responses inside auth helper
  university: string;
  department: string;
  degreeProgram: string;
  batch: string;
  regNo: string;
  profilePhoto: string;
  bio: string;
  role: 'user' | 'admin';
  dateJoined: string;
  followers: string[]; // List of user IDs
  following: string[]; // List of user IDs
  savedPosts: string[]; // List of post IDs
  isAlumni?: boolean;
  graduationYear?: string;
  company?: string;
  designation?: string;
  canMentor?: boolean;
  mentorshipOffer?: string;
  linkedinUrl?: string;
}

export interface AlumniUpdate {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userUniversity: string;
  graduationYear: string;
  type: 'career' | 'mentorship';
  title: string;
  content: string;
  link?: string;
  dateCreated: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userUniversity: string;
  university: string;
  department: string;
  caption: string;
  category: string;
  imageUrl: string;
  eventName?: string;
  tags: string[]; // Friend name tags
  deptTags: string[]; // Department tags
  likedBy: string[]; // List of user IDs
  commentCount: number;
  dateCreated: string;
  isFeatured: boolean;
  views: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  dateCreated: string;
}

export interface University {
  id: string;
  name: string;
  province: 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan' | 'Islamabad' | 'AJK' | 'Gilgit-Baltistan';
  logo?: string;
  location: string;
  website: string;
  isApproved: boolean;
  numStudents: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  dateCreated: string;
  isRead: boolean;
}

export interface UniEvent {
  id: string;
  university: string;
  title: string;
  description: string;
  date: string; // ISO String
  time?: string;
  location: string;
  category: string;
  organizers: string;
  rsvpIds: string[]; // List of user IDs
  dateCreated: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'announcement';
  senderId: string;
  senderName: string;
  senderPhoto: string;
  postId?: string;
  content: string;
  dateCreated: string;
  isRead: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  itemType: 'post' | 'comment' | 'user';
  itemId: string;
  content: string;
  status: 'pending' | 'resolved';
  dateCreated: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  university: string; // 'All' or specific university ID/Name
  dateCreated: string;
}

export interface AppStats {
  totalUsers: number;
  totalMemories: number;
  totalUniversities: number;
  totalEvents: number;
}
