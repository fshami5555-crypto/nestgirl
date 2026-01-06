
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// Fix: Import from @firebase/firestore instead of firebase/firestore to resolve missing export errors
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { Article } from '../types';

const SkinCare: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'articles'), where('category', '==', 'skin'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-lg">
        <img src="https://picsum.photos/800/400?beauty" className="w-full h-full object-cover" alt="Skin Care" />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-2xl font-black text-white">بشرتكِ وجمالكِ</h2>
          <p className="text-pink-100 text-sm">أسرار العناية لطلّة مشرقة دائماً</p>
        </div>
      </div>

      <div className="space-y-6">
        {articles.length > 0 ? articles.map(art => (
          <div key={art.id} className="glass p-4 rounded-[2rem] space-y-3">
            <img src={art.imageUrl} className="w-full h-40 object-cover rounded-2xl" alt={art.title} />
            <h3 className="text-lg font-bold text-gray-800">{art.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{art.content}</p>
            <button className="text-pink-500 font-bold text-sm">اقرئي المزيد...</button>
          </div>
        )) : (
          <div className="space-y-6">
             <div className="glass p-4 rounded-[2rem] space-y-3">
              <img src="https://picsum.photos/400/300?skin1" className="w-full h-40 object-cover rounded-2xl" alt="Skin Routine" />
              <h3 className="text-lg font-bold text-gray-800">روتين العناية المسائي للمرأة العاملة</h3>
              <p className="text-gray-600 text-sm leading-relaxed">ابقي بشرتكِ رطبة ونضرة بخطوات بسيطة قبل النوم...</p>
            </div>
            <div className="glass p-4 rounded-[2rem] space-y-3">
              <img src="https://picsum.photos/400/300?skin2" className="w-full h-40 object-cover rounded-2xl" alt="Products" />
              <h3 className="text-lg font-bold text-gray-800">أفضل واقيات الشمس لصيف الأردن</h3>
              <p className="text-gray-600 text-sm leading-relaxed">كيف تختارين الواقي المناسب لبشرتكِ الجافة أو الدهنية؟</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinCare;
