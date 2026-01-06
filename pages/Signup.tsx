
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from '@firebase/firestore';
import { UserStatus, UserProfile } from '../types';
import { useAuth } from '../App';

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    dob: '',
    height: 160,
    weight: 60,
    status: UserStatus.SINGLE,
    maternalStatus: '',
    periodStartDate: '',
    isCycleRegular: true,
    cycleLength: 28
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // Dynamic speech bubble messages with variety
  const currentMessage = useMemo(() => {
    const messages = {
      1: [
        "أهلاً بكِ! أنا هنا لمساعدتكِ. لنبدأ بإدخال اسمكِ ورقمكِ لنبقى على تواصل دائم ✨",
        "يا هلا! دعينا نبدأ رحلتنا معاً، ممكن أعرف اسمكِ ورقمكِ؟ 🌸",
        "خطوة جميلة نحو التغيير! ادخلي بياناتكِ لنبدأ فوراً 💖"
      ],
      2: [
        "رائع! الآن أخبريني قليلاً عن بياناتكِ الصحية لنقدم لكِ نصائح دقيقة تناسب جسمكِ 🌸",
        "صحتكِ تهمنا، دعينا نعرف القليل عن طولكِ ووزنكِ لنعتني بكِ جيداً 💖",
        "البيانات الصحية هي سر التخصيص المثالي لكِ.. لا تترددي في إدخالها ✨"
      ],
      3: [
        "ما هي حالتكِ الاجتماعية؟ هذا يساعدني في تخصيص المحتوى المناسب لكِ تماماً 💖",
        "كل مرحلة ولها جمالها، أخبريني عن حالتكِ الحالية لأكون رفيقتكِ المثالية 🥰",
        "هنا نعرف كيف نعتني بكِ أفضل.. هل أنتِ عزباء، أم، أم حامل؟ 🌸"
      ],
      4: [
        "أخيراً، دعينا ننظم دورتكِ الشهرية. نحن هنا لراحتكِ في كل يوم من الشهر! 🥰",
        "تنظيم الدورة يساعدنا لنكون بجانبكِ في الأوقات التي تحتاجين فيها للدعم 🌸",
        "آخر خطوة! لنضمن تتبعاً دقيقاً لكل تفاصيل صحتكِ الشهرية 💖"
      ]
    };
    const stepMessages = messages[step as keyof typeof messages] || [];
    return stepMessages[Math.floor(Math.random() * stepMessages.length)];
  }, [step]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.password) {
      alert('يرجى إكمال البيانات الأساسية');
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'users', formData.phone);
      const newUser: UserProfile = {
        ...formData,
        uid: formData.phone,
        isAdmin: false,
      };
      await setDoc(userRef, {
        ...newUser,
        createdAt: new Date().toISOString()
      });
      
      // Auto-login
      const result = await login(formData.phone, formData.password);
      if (result.success) {
        localStorage.setItem('nestgirl_first_time', 'true');
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-10 bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 overflow-x-hidden">
      
      {/* 1. Illustration Area (Visually on the LEFT in RTL) */}
      <div className="w-full lg:w-1/2 max-w-sm lg:max-w-xl animate-fadeInRight order-1 relative">
        {/* Dynamic Speech Bubble */}
        <div className="absolute -top-12 lg:-top-16 left-0 right-0 flex justify-center z-20 px-4">
          <div className="bg-white p-4 lg:p-6 rounded-[2rem] rounded-bl-none shadow-2xl border-2 border-pink-100 max-w-[280px] lg:max-w-[350px] relative animate-bounce-slow">
            <p className="text-gray-700 font-bold text-xs lg:text-sm leading-relaxed text-center">
              {currentMessage}
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-4 left-0 w-8 h-8 bg-white border-r-2 border-b-2 border-pink-100 rotate-45 -z-10"></div>
          </div>
        </div>

        <div className="relative group mt-10 lg:mt-0">
          <div className="absolute -inset-4 bg-pink-300/20 rounded-[4rem] blur-2xl group-hover:bg-pink-400/30 transition-all duration-700"></div>
          <img 
            src="https://i.ibb.co/vvv21hQd/image.png" 
            alt="Nestgirl Illustration" 
            className="relative w-full h-auto drop-shadow-2xl rounded-[3rem] object-contain transition-transform duration-500 hover:scale-105" 
          />
        </div>
      </div>

      {/* 2. Form Area (Visually on the RIGHT in RTL) */}
      <div className="w-full lg:w-1/2 max-w-md order-2">
        <div className="glass p-8 rounded-[3rem] shadow-2xl animate-fadeIn relative overflow-hidden border border-white/60">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <span className="text-pink-600 font-bold text-sm bg-pink-100 px-3 py-1 rounded-full">الخطوة {step} من 4</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-pink-500 w-10 shadow-sm' : 'bg-pink-100 w-6'}`} 
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 min-h-[350px] flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-black text-gray-800 mb-2">أهلاً بكِ في عائلتنا</h2>
                  <p className="text-gray-500 text-sm">لنبدأ رحلتكِ المميزة معنا</p>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <i className="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-pink-300"></i>
                    <input 
                      className="w-full p-4 pr-12 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                      placeholder="الاسم الكامل"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute right-4 top-1/2 -translate-y-1/2 text-pink-300"></i>
                    <input 
                      className="w-full p-4 pr-12 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                      placeholder="رقم الهاتف (07XXXXXXXX)"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-pink-300"></i>
                    <input 
                      type="password"
                      className="w-full p-4 pr-12 glass rounded-2xl border-0 text-left focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                      placeholder="كلمة المرور"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">بياناتكِ الصحية</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 pr-2">تاريخ الميلاد</label>
                  <input 
                    type="date"
                    className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 pr-2">الطول (سم)</label>
                    <input 
                      type="number"
                      className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                      value={formData.height}
                      onChange={e => setFormData({...formData, height: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 pr-2">الوزن (كغم)</label>
                    <input 
                      type="number"
                      className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">حالتكِ الحالية</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[UserStatus.SINGLE, UserStatus.MARRIED, UserStatus.PREGNANT, UserStatus.MOTHER].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFormData({...formData, status})}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 font-bold text-sm ${formData.status === status ? 'bg-pink-500 text-white border-pink-500 shadow-lg scale-105' : 'bg-white/50 text-gray-600 border-white hover:bg-white'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {formData.status === UserStatus.MOTHER && (
                  <input 
                    className="w-full p-4 glass rounded-2xl border-0 animate-fadeIn focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                    placeholder="عدد الأطفال"
                    value={formData.maternalStatus}
                    onChange={e => setFormData({...formData, maternalStatus: e.target.value})}
                  />
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">تتبع الدورة الشهرية</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 pr-2">متى كانت آخر دورة؟</label>
                  <input 
                    type="date"
                    className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                    value={formData.periodStartDate}
                    onChange={e => setFormData({...formData, periodStartDate: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 pr-2">هل دورتكِ منتظمة؟</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setFormData({...formData, isCycleRegular: true})}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 font-bold ${formData.isCycleRegular ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-105' : 'bg-white/50 text-gray-600 border-white hover:bg-pink-50'}`}
                    >نعم</button>
                    <button 
                      onClick={() => setFormData({...formData, isCycleRegular: false})}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 font-bold ${!formData.isCycleRegular ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-105' : 'bg-white/50 text-gray-600 border-white hover:bg-pink-50'}`}
                    >لا</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 pr-2">طول الدورة المعتاد (أيام)</label>
                  <input 
                    type="number"
                    className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 outline-none transition-all shadow-sm" 
                    value={formData.cycleLength}
                    onChange={e => setFormData({...formData, cycleLength: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-10 relative z-10">
            {step > 1 && (
              <button 
                onClick={handleBack} 
                className="flex-1 py-4 glass text-gray-600 font-bold rounded-2xl hover:bg-white/80 transition-all active:scale-95 border border-white"
              >
                السابق
              </button>
            )}
            {step < 4 ? (
              <button 
                onClick={handleNext} 
                className="flex-[2] py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-pink-200/50 hover:brightness-110 transition-all active:scale-95"
              >
                التالي
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex-[2] py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-2xl shadow-xl disabled:opacity-50 hover:brightness-110 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </div>
                ) : 'ابدئي رحلتكِ'}
              </button>
            )}
          </div>
        </div>
      </div>
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

export default Signup;
