
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// Fix: Import from @firebase/firestore instead of firebase/firestore to resolve missing export errors
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: liked ? arrayRemove(user.phone) : arrayUnion(user.phone)
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass p-4 rounded-[2rem] border-white">
        <textarea 
          className="w-full bg-transparent p-4 outline-none resize-none text-gray-700 min-h-[100px]"
          placeholder="ماذا يخطر ببالكِ اليوم؟ شاركينا تجربتكِ..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2 px-2">
          <div className="flex gap-4 text-pink-400">
            <i className="fa-regular fa-image cursor-pointer hover:scale-110"></i>
            <i className="fa-regular fa-face-smile cursor-pointer hover:scale-110"></i>
          </div>
          <button 
            onClick={handlePost}
            disabled={loading || !newPost.trim()}
            className="bg-pink-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
          >
            نشر
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          // Defensive check: ensure likes is an array before calling includes
          const likesArray = Array.isArray(post.likes) ? post.likes : [];
          const isLiked = likesArray.includes(user?.phone || '');
          
          return (
            <div key={post.id} className="glass p-6 rounded-[2.5rem] animate-fadeIn border-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold">
                  {post.authorName ? post.authorName[0] : '?'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{post.authorName}</h4>
                  <span className="text-[10px] text-gray-400">
                    {post.timestamp?.toDate() ? new Date(post.timestamp.toDate()).toLocaleDateString('ar-JO') : 'الآن'}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex gap-6 border-t border-white/50 pt-3">
                <button 
                  onClick={() => handleLike(post.id, isLiked)}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-all ${isLiked ? 'text-pink-500 scale-110' : 'text-gray-400'}`}
                >
                  <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                  <span>{likesArray.length}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-400 font-bold">
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
