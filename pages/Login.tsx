
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }
    const result = await login(phone, password);
    if (result.success) {
      // نتوجه للمسار الرئيسي ليقوم App.tsx بتحديد الوجهة بناءً على isAdmin
      navigate('/');
    } else {
      setError(result.message || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
      <div className="w-full max-w-sm glass p-8 rounded-[2.5rem] shadow-xl border border-white/50 animate-fadeIn">
        <div className="text-center mb-8">
          <img src="https://i.ibb.co/TM561d6q/image.png" alt="Nestgirl" className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-pink-600 mb-2">نست جيرل</h1>
          <p className="text-gray-500">رفيقة دربكِ في كل مرحلة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pr-1">رقم الهاتف</label>
            <input 
              type="tel" 
              placeholder="07XXXXXXXX"
              className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pr-1">كلمة المرور</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 glass rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 transition-all outline-none text-left"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {phone === '0781285431' && (
              <p className="text-[10px] text-pink-400 mt-2 px-1">مرحباً بكِ في مدخل الإدارة</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">ليس لديكِ حساب؟</p>
          <Link to="/signup" className="text-pink-600 font-bold hover:underline">أنشئي حسابكِ الآن</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
