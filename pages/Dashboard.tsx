
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { getSmartGreeting } from '../services/geminiService';
import { UserStatus } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from '@firebase/firestore';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [greeting, setGreeting] = useState('جاري تحميل ترحيبكِ الخاص...');
  const [periodDay, setPeriodDay] = useState(0);
  const [time, setTime] = useState(new Date());
  
  // Tour State
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const isFirstTime = localStorage.getItem('nestgirl_first_time');
    if (isFirstTime === 'true') {
      setShowTour(true);
      localStorage.removeItem('nestgirl_first_time');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      getSmartGreeting(user).then(setGreeting).catch(() => setGreeting("أهلاً بكِ مجدداً في عائلتكِ. ✨"));
      
      if (user.periodStartDate) {
        const start = new Date(user.periodStartDate);
        const diff = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 3600 * 24));
        setPeriodDay((diff % (user.cycleLength || 28)) + 1);
      }
    }
  }, [user]);

  const handlePeriodStart = async () => {
    if (!user) return;
    const date = new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'users', user.phone), {
      periodStartDate: date
    });
    refreshUser();
  };

  const getPregnancyWeek = () => {
    if (!user?.pregnancyStartDate) return 1;
    const start = new Date(user.pregnancyStartDate);
    const diff = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 3600 * 24 * 7));
    return Math.max(1, diff + 1);
  };

  const tourMessages = [
    { title: "أهلاً بكِ في بيتكِ الجديد!", desc: "أنا رفيقتكِ 'نستلي'، دعينا نأخذ جولة سريعة لنتعرف على مميزات تطبيقكِ المفضل 🌸" },
    { title: "الترحيب الذكي", desc: "هنا تجدين ترحيبي اليومي المخصص لكِ، يتغير حسب حالتكِ ومزاجكِ ليعطيكِ طاقة إيجابية كل صباح ✨" },
    { title: "البطاقة الصحية", desc: "سنتابع هنا دورتكِ الشهرية أو مراحل حملكِ يوماً بيوم، لنضمن لكِ رعاية صحية متكاملة 🤰" },
    { title: "الوصول السريع", desc: "أقسام الجمال، الرشاقة، والأسرة.. كل ما يهمكِ متاح بلمسة واحدة من هنا 💄" },
    { title: "المستشار النفسي", desc: "وإذا شعرتِ برغبة في الفضفضة، أنا هنا دائماً لأسمعكِ في المستشار النفسي وبسرية تامة ❤️" }
  ];

  const renderMiniCalendar = () => {
    const days = Array.from({ length: 7 }, (_, i) => i + 1);
    return (
      <div className="flex justify-between gap-1 mt-4">
        {days.map(d => {
          const isToday = d === 4;
          const isPeriodDay = d >= periodDay && d <= periodDay + 4;
          return (
            <div key={d} className={`flex flex-col items-center flex-1 p-2 rounded-xl border transition-all ${isToday ? 'bg-pink-500 text-white scale-110 shadow-lg' : 'bg-white/30 text-gray-600 border-white/40'}`}>
              <span className="text-[10px] uppercase font-bold opacity-60">يوم</span>
              <span className="text-sm font-black">{d}</span>
              {isPeriodDay && <div className="w-1 h-1 bg-red-400 rounded-full mt-1"></div>}
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Tour Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-8 relative overflow-hidden flex flex-col items-center text-center">
             {/* Character Image */}
             <div className="absolute -top-16 lg:-top-20 -right-4 lg:-right-8 w-32 lg:w-48 h-32 lg:h-48 z-10 animate-bounce-slow">
                <img src="https://i.ibb.co/NdGgpSX8/2.png" alt="Nestgirl Tour" className="w-full h-full object-contain drop-shadow-xl" />
             </div>
             
             <div className="relative z-20 mt-10">
                <h4 className="text-2xl font-black text-pink-600 mb-2">{tourMessages[tourStep].title}</h4>
                <p className="text-gray-600 font-bold leading-relaxed mb-8">
                  {tourMessages[tourStep].desc}
                </p>
                
                <div className="flex gap-4 w-full">
                   {tourStep > 0 && (
                     <button 
                       onClick={() => setTourStep(s => s - 1)}
                       className="flex-1 py-4 glass text-gray-400 font-bold rounded-2xl"
                     >
                       السابق
                     </button>
                   )}
                   <button 
                     onClick={() => {
                        if (tourStep < tourMessages.length - 1) setTourStep(s => s + 1);
                        else setShowTour(false);
                     }}
                     className="flex-[2] py-4 bg-pink-500 text-white font-bold rounded-2xl shadow-xl active:scale-95"
                   >
                     {tourStep < tourMessages.length - 1 ? 'التالي' : 'ابدئي الآن'}
                   </button>
                </div>
                
                <div className="flex gap-1.5 justify-center mt-6">
                   {tourMessages.map((_, i) => (
                     <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-8 bg-pink-500' : 'w-2 bg-pink-100'}`}></div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Top Bar: Clock & Weather */}
      <div className="flex justify-between items-center glass p-4 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-pink-600 font-black text-lg">
            {time.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="w-px h-6 bg-pink-100"></div>
          <div className="flex items-center gap-1 text-gray-500 font-bold text-sm">
            <i className="fa-solid fa-cloud-sun text-orange-400"></i>
            <span>24°C</span>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 font-bold">عمان، الأردن</div>
      </div>

      {/* Smart Welcome */}
      <div className="relative group overflow-hidden glass p-6 rounded-[2.5rem] border-white/50 shadow-xl transition-all">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-pink-600 transform group-hover:rotate-12 transition-transform">
          <i className="fa-solid fa-spa text-9xl"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">يا هلا، {user?.name.split(' ')[0]} ✨</h2>
        <p className="text-pink-600 italic leading-relaxed text-sm font-medium">{greeting}</p>
      </div>

      {/* Health Card */}
      <div className="relative overflow-hidden glass p-6 rounded-[2.5rem] bg-gradient-to-br from-pink-500/10 via-white/40 to-purple-500/10 border-white shadow-xl">
        {user?.status === UserStatus.PREGNANT ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">تتبع الحمل</p>
                <h3 className="text-4xl font-black text-pink-600">الأسبوع {getPregnancyWeek()}</h3>
              </div>
              <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center text-pink-400 shadow-lg animate-pulse">
                <i className="fa-solid fa-baby text-3xl"></i>
              </div>
            </div>
            <div className="w-full bg-pink-100/50 h-4 rounded-full overflow-hidden p-0.5 border border-white">
              <div 
                className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full shadow-lg" 
                style={{ width: `${Math.min(100, (getPregnancyWeek() / 40) * 100)}%` }}
              ></div>
            </div>
            <p className="mt-4 text-xs text-gray-600 font-black">المرحلة الحالية • موعد الولادة المتوقع 2025</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">دورتكِ الشهرية</p>
                <h3 className="text-4xl font-black text-pink-600">اليوم {periodDay || '--'}</h3>
              </div>
              <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center text-pink-400 shadow-lg">
                <i className="fa-solid fa-calendar-heart text-3xl"></i>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 font-medium mb-2">
              {periodDay < 5 ? 'أنتِ الآن في مرحلة الحيض' : (user?.cycleLength || 28) - periodDay + ' أيام متبقية على الموعد القادم'}
            </p>

            {renderMiniCalendar()}

            <button 
              onClick={handlePeriodStart}
              className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check-circle"></i>
              تحديد بداية الدورة اليوم
            </button>
          </div>
        )}
      </div>

      {/* Quick Grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { to: '/skincare', color: 'pink', icon: 'fa-sparkles', label: 'بشرتكِ' },
          { to: '/fitness', color: 'blue', icon: 'fa-running', label: 'الرشاقة' },
          { to: '/family', color: 'purple', icon: 'fa-baby-carriage', label: 'الأسرة' },
          { to: '/store', color: 'orange', icon: 'fa-basket-shopping', label: 'المتجر' }
        ].map((item, idx) => (
          <Link key={idx} to={item.to} className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 glass bg-${item.color}-50/50 rounded-2xl flex items-center justify-center text-${item.color}-500 shadow-sm hover:scale-110 active:scale-90 transition-all`}>
              <i className={`fa-solid ${item.icon} text-xl`}></i>
            </div>
            <span className="text-[10px] font-black text-gray-600">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Psych Chat Card */}
      <Link to="/chat" className="block p-6 bg-gradient-to-br from-pink-600 to-rose-500 rounded-[2.5rem] shadow-2xl shadow-pink-200 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="bg-white/20 w-max px-3 py-1 rounded-full text-[10px] font-black mb-3 uppercase tracking-tighter">خاص وحصري</div>
          <h4 className="text-2xl font-black mb-2 flex items-center gap-3">
            مستشاركِ النفسي
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </h4>
          <p className="text-white/90 text-sm font-bold leading-relaxed max-w-[80%]">بتحبي تفضفضي؟ أنا هنا لأسمعكِ بقلب دافئ وسرية تامة ❤️</p>
        </div>
        <div className="absolute -bottom-6 -right-6 text-white/10 text-9xl">
          <i className="fa-solid fa-heart"></i>
        </div>
      </Link>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
