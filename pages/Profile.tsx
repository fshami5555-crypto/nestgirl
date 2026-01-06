
import React from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { UserStatus } from '../types';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const calculateAge = (dob: string) => {
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Profile */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-rose-300 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white">
            {user.name[0]}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-400 border-4 border-white rounded-full"></div>
        </div>
        <h2 className="mt-4 text-2xl font-black text-gray-800">{user.name}</h2>
        <p className="text-pink-500 font-bold">{user.status}</p>
      </div>

      {/* Basic Info Card */}
      <div className="glass p-6 rounded-[2.5rem] border-white shadow-sm space-y-4">
        <h3 className="text-lg font-black text-gray-800 border-b border-pink-100 pb-2 mb-4">
          <i className="fa-solid fa-address-card ml-2 text-pink-400"></i>
          المعلومات الأساسية
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="رقم الهاتف" value={user.phone} icon="fa-phone" />
          <InfoItem label="العمر" value={`${calculateAge(user.dob)} سنة`} icon="fa-cake-candles" />
          <InfoItem label="تاريخ الميلاد" value={user.dob} icon="fa-calendar-days" />
          <InfoItem label="الحالة" value={user.status} icon="fa-heart" />
        </div>
      </div>

      {/* Health Stats Card */}
      <div className="glass p-6 rounded-[2.5rem] border-white shadow-sm space-y-4">
        <h3 className="text-lg font-black text-gray-800 border-b border-pink-100 pb-2 mb-4">
          <i className="fa-solid fa-heart-pulse ml-2 text-pink-400"></i>
          البيانات الصحية
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="الطول" value={`${user.height} سم`} icon="fa-ruler-vertical" />
          <InfoItem label="الوزن" value={`${user.weight} كغم`} icon="fa-weight-scale" />
        </div>
      </div>

      {/* Cycle Tracking Card (If not Pregnant) */}
      {user.status !== UserStatus.PREGNANT && (
        <div className="glass p-6 rounded-[2.5rem] border-white shadow-sm space-y-4">
          <h3 className="text-lg font-black text-gray-800 border-b border-pink-100 pb-2 mb-4">
            <i className="fa-solid fa-calendar-check ml-2 text-pink-400"></i>
            تتبع الدورة
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="آخر موعد" value={user.periodStartDate || 'غير محدد'} icon="fa-clock-rotate-left" />
            <InfoItem label="طول الدورة" value={`${user.cycleLength} يوم`} icon="fa-arrows-left-right" />
            <InfoItem label="الانتظام" value={user.isCycleRegular ? 'منتظمة' : 'غير منتظمة'} icon="fa-circle-check" />
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full bg-rose-50 text-rose-600 font-black py-5 rounded-[2rem] border-2 border-rose-100 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        <i className="fa-solid fa-right-from-bracket"></i>
        تسجيل الخروج من الحساب
      </button>
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string, icon: string }> = ({ label, value, icon }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
      <i className={`fa-solid ${icon} text-[8px]`}></i>
      {label}
    </p>
    <p className="text-sm font-black text-gray-700">{value}</p>
  </div>
);

export default Profile;
