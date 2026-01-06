
import React from 'react';

const FamilyCare: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-lg">
        <img src="https://picsum.photos/800/400?family" className="w-full h-full object-cover" alt="Family Care" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-2xl font-black text-white">الأسرة والطفل</h2>
          <p className="text-purple-100 text-sm">رحلتكِ نحو أمومة سعيدة وواعية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[
          { title: 'كيف تتعاملين مع نوبات غضب طفلك؟', cat: 'تربية', img: 'https://picsum.photos/400/300?kid1' },
          { title: 'تغذية الرضيع في الشهر السادس', cat: 'صحة', img: 'https://picsum.photos/400/300?kid2' },
          { title: 'مراحل نمو الجنين: الأسبوع بـ أسبوع', cat: 'حمل', img: 'https://picsum.photos/400/300?kid3' }
        ].map((item, idx) => (
          <div key={idx} className="glass overflow-hidden rounded-[2rem] flex gap-4 p-3 group cursor-pointer">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
              <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={item.title} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] text-purple-500 font-bold uppercase">{item.cat}</span>
              <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.title}</h3>
              <button className="text-xs text-gray-400 mt-2 text-right">قراءة المقال ←</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyCare;
