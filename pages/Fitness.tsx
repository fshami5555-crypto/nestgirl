
import React, { useState } from 'react';
import { useAuth } from '../App';
import { getMealPlan } from '../services/geminiService';

const Fitness: React.FC = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState('خسارة وزن');
  const [mealPlan, setMealPlan] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!user) return;
    setLoading(true);
    const plan = await getMealPlan(user, goal);
    setMealPlan(plan);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-[2rem] border-blue-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-utensils text-blue-500"></i>
          جدولكِ الغذائي الذكي
        </h2>
        
        {!mealPlan ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">سنقوم بتوليد جدول غذائي مخصص لكِ بناءً على وزنكِ ({user?.weight}kg) وطولكِ ({user?.height}cm).</p>
            <div className="grid grid-cols-2 gap-2">
              {['خسارة وزن', 'زيادة وزن', 'تثبيت وزن', 'نمط صحي'].map(g => (
                <button 
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`p-3 rounded-2xl border transition-all ${goal === g ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : 'bg-white text-gray-600 border-gray-100'}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button 
              onClick={generatePlan}
              disabled={loading}
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'جاري التحليل والتوليد...' : 'ولّدي جدولي المخصص'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-blue-600">خطة الأسبوع: {goal}</h3>
              <button onClick={() => setMealPlan(null)} className="text-xs text-gray-400 hover:text-blue-500 underline">تعديل الهدف</button>
            </div>
            <div className="space-y-3">
              {mealPlan.map((day, idx) => (
                <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-white">
                  <h4 className="font-bold text-gray-800 mb-2 border-b border-blue-100 pb-1">{day.day}</h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="text-blue-500 font-bold block">الفطور</span>
                      <p className="text-gray-600">{day.meals.breakfast}</p>
                    </div>
                    <div>
                      <span className="text-blue-500 font-bold block">الغداء</span>
                      <p className="text-gray-600">{day.meals.lunch}</p>
                    </div>
                    <div>
                      <span className="text-blue-500 font-bold block">سناك</span>
                      <p className="text-gray-600">{day.meals.snack}</p>
                    </div>
                    <div>
                      <span className="text-blue-500 font-bold block">العشاء</span>
                      <p className="text-gray-600">{day.meals.dinner}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass p-6 rounded-[2rem]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-person-running text-blue-500"></i>
          مقالات الرشاقة
        </h2>
        <div className="space-y-4">
          {[
            { title: 'أفضل التمارين المنزلية للحوامل', img: 'https://picsum.photos/400/200?random=1' },
            { title: 'أسرار التمثيل الغذائي السريع', img: 'https://picsum.photos/400/200?random=2' }
          ].map((art, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="h-32 rounded-2xl overflow-hidden mb-2 relative">
                <img src={art.img} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <h4 className="font-bold text-gray-700">{art.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fitness;
