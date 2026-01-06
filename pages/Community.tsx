
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from '@firebase/firestore';
import { useAuth } from '../App';
import { Post } from '../types';

const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.phone,
        authorName: user.name,
        content: newPost,
        likes: [],
        timestamp: serverTimestamp()
      });
      setNewPost('');
    } catch (e) {
      console.error("Posting Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        likes: liked ? arrayRemove(user.phone) : arrayUnion(user.phone)
      });
    } catch (e) {
      console.error("Like Error:", e);
    }
  };

  /**
   * Extremely robust date formatter for Firestore.
   * Handles serverTimestamp() delay, serialization, and missing data.
   */
  const formatSafeDate = (ts: any) => {
    if (!ts) return 'جاري النشر...'; // Handles local serverTimestamp delay
    
    try {
      // 1. Check if it's a Firestore Timestamp object with toDate()
      if (typeof ts.toDate === 'function') {
        return ts.toDate().toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' });
      }
      
      // 2. Check for plain object serialization { seconds: ..., nanoseconds: ... }
      if (ts.seconds) {
        return new Date(ts.seconds * 1000).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' });
      }

      // 3. Fallback for strings or native Dates
      const date = new Date(ts);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      console.warn("Date formatting failed", e);
    }
    
    return 'منذ قليل';
  };

  return (
    <div className="space-y-6">
      <div className="glass p-4 rounded-[2rem] border-white shadow-sm">
        <textarea 
          className="w-full bg-transparent p-4 outline-none resize-none text-gray-700 min-h-[100px] placeholder:text-gray-400"
          placeholder="ماذا يخطر ببالكِ اليوم؟ شاركينا تجربتكِ..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2 px-2">
          <div className="flex gap-4 text-pink-400">
            <i className="fa-regular fa-image cursor-pointer hover:scale-120 transition-transform"></i>
            <i className="fa-regular fa-face-smile cursor-pointer hover:scale-120 transition-transform"></i>
          </div>
          <button 
            onClick={handlePost}
            disabled={loading || !newPost.trim()}
            className="bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-2 px-8 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? 'نشر...' : 'نشر'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          const likesArray = Array.isArray(post.likes) ? post.likes : [];
          const isLiked = likesArray.includes(user?.phone || '');
          
          return (
            <div key={post.id} className="glass p-6 rounded-[2.5rem] animate-fadeIn border-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold border-2 border-white shadow-inner">
                  {post.authorName ? post.authorName[0] : '?'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{post.authorName}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatSafeDate(post.timestamp)}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex gap-6 border-t border-white/50 pt-3">
                <button 
                  onClick={() => handleLike(post.id, isLiked)}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-all ${isLiked ? 'text-pink-500 scale-105' : 'text-gray-400 hover:text-pink-300'}`}
                >
                  <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                  <span>{likesArray.length}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-400 font-bold hover:text-pink-300 transition-colors">
                  <i className="fa-regular fa-comment"></i>
                  <span>تعليق</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Community;
