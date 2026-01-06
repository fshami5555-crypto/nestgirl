
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from '@firebase/firestore';
import { Order, Product, Article, UserProfile } from '../types';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'orders' | 'content' | 'community' | 'users'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  // Form states for adding content
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: 'skin', description: '', imageUrl: 'https://picsum.photos/200' });
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'skin', imageUrl: 'https://picsum.photos/600/400' });

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), snap => setOrders(snap.docs.map(d => ({id: d.id, ...d.data()} as Order))));
    const unsubProducts = onSnapshot(collection(db, 'products'), snap => setProducts(snap.docs.map(d => ({id: d.id, ...d.data()} as Product))));
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({uid: d.id, ...d.data()} as UserProfile))));
    const unsubPosts = onSnapshot(collection(db, 'posts'), snap => setPosts(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    return () => { unsubOrders(); unsubProducts(); unsubUsers(); unsubPosts(); };
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm('حذف هذا الطلب؟')) await deleteDoc(doc(db, 'orders', id));
  };

  const handleAddProduct = async () => {
    if(!newProduct.name) return alert('أدخلي اسم المنتج');
    await addDoc(collection(db, 'products'), { ...newProduct });
    alert('تمت إضافة المنتج بنجاح');
  };

  const handleAddArticle = async () => {
    if(!newArticle.title) return alert('أدخلي عنوان المقال');
    await addDoc(collection(db, 'articles'), { ...newArticle, timestamp: serverTimestamp() });
    alert('تم نشر المقال بنجاح');
  };

  const deletePost = async (id: string) => {
    if (window.confirm('حذف هذا المنشور؟')) await deleteDoc(doc(db, 'posts', id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-pink-600 text-white p-6 space-y-8 shrink-0 shadow-2xl z-20">
        <div className="flex items-center gap-3 px-2">
          <img src="https://i.ibb.co/TM561d6q/image.png" className="w-10 h-10 bg-white rounded-full p-1" alt="Logo" />
          <h1 className="text-xl font-black">نست جيرل | الإدارة</h1>
        </div>
        
        <nav className="space-y-2">
          {[
            { id: 'orders', icon: 'fa-box', label: 'إدارة الطلبات' },
            { id: 'content', icon: 'fa-pen-to-square', label: 'إدارة المحتوى' },
            { id: 'community', icon: 'fa-comments', label: 'الرقابة المجتمعية' },
            { id: 'users', icon: 'fa-users', label: 'قاعدة المستخدمات' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${tab === t.id ? 'bg-white text-pink-600 shadow-xl scale-105' : 'hover:bg-pink-500/50'}`}
            >
              <i className={`fa-solid ${t.icon} w-6 text-center`}></i>
              {t.label}
            </button>
          ))}
        </nav>
        
        <div className="pt-10">
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-colors font-bold"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 max-h-screen overflow-y-auto bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto">
          {tab === 'orders' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800">الطلبات الواردة ({orders.length})</h2>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-500">
                  تحديث تلقائي مفعّل
                </div>
              </div>
              
              <div className="grid gap-6">
                {orders.length > 0 ? orders.map(o => (
                  <div key={o.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                          o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'shipped' ? 'تم الشحن' : 'تم التوصيل'}
                        </span>
                        <h3 className="font-black text-gray-800">طلب رقم #{o.id.slice(-6)}</h3>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-bold text-gray-800"><i className="fa-solid fa-user ml-2 text-pink-400"></i> {o.userName} ({o.phone})</p>
                        <p><i className="fa-solid fa-location-dot ml-2 text-pink-400"></i> {o.city} - {o.address}</p>
                      </div>
                      <div className="pt-2 text-2xl font-black text-pink-600">{o.total} JOD</div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end gap-4">
                      <div className="flex gap-2">
                        <select 
                          className="bg-gray-100 p-3 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-pink-200"
                          value={o.status}
                          onChange={e => updateOrderStatus(o.id, e.target.value)}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                        </select>
                        <button onClick={() => deleteOrder(o.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold">
                        {o.timestamp ? new Date(o.timestamp.seconds * 1000).toLocaleString('ar-JO') : 'جاري التحميل...'}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 glass rounded-[3rem]">
                    <i className="fa-solid fa-box-open text-6xl text-gray-200 mb-4"></i>
                    <p className="text-gray-400 font-bold">لا توجد طلبات حالياً</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'content' && (
            <div className="grid lg:grid-cols-2 gap-12 animate-fadeIn">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600"><i className="fa-solid fa-plus"></i></div>
                   <h2 className="text-2xl font-black text-gray-800">إضافة منتج</h2>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-5 border border-gray-100">
                  <input placeholder="اسم المنتج" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 font-bold" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="السعر" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 font-bold" onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                    <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      <option value="skin">عناية بالبشرة</option>
                      <option value="fitness">مكملات ورشاقة</option>
                      <option value="family">أطفال وأسرة</option>
                    </select>
                  </div>
                  <textarea placeholder="وصف المنتج..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 font-bold min-h-[120px]" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  <button onClick={handleAddProduct} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all">إضافة للمتجر</button>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><i className="fa-solid fa-newspaper"></i></div>
                   <h2 className="text-2xl font-black text-gray-800">نشر مقال</h2>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-5 border border-gray-100">
                  <input placeholder="عنوان المقال" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                  <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setNewArticle({...newArticle, category: e.target.value as any})}>
                    <option value="skin">بشرة وجمال</option>
                    <option value="fitness">رشاقة وغذاء</option>
                    <option value="family">أسرة وطفل</option>
                  </select>
                  <textarea placeholder="اكتبي محتوى المقال هنا..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold min-h-[220px]" onChange={e => setNewArticle({...newArticle, content: e.target.value})} />
                  <button onClick={handleAddArticle} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all">نشر المقال الآن</button>
                </div>
              </section>
            </div>
          )}

          {tab === 'community' && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-black text-gray-800 text-center md:text-right">الرقابة المجتمعية</h2>
              <div className="grid gap-4">
                {posts.length > 0 ? posts.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4 items-center w-full">
                       <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-black shrink-0">{p.authorName?.[0]}</div>
                       <div>
                          <h4 className="font-black text-gray-800">{p.authorName}</h4>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{p.content}</p>
                       </div>
                    </div>
                    <button onClick={() => deletePost(p.id)} className="bg-red-50 text-red-500 font-black px-8 py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shrink-0">حذف المحتوى</button>
                  </div>
                )) : (
                  <div className="text-center py-20 text-gray-400 font-bold">لا يوجد منشورات حالياً</div>
                )}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800">قاعدة المستخدمات ({users.length})</h2>
              </div>
              <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-pink-600 text-white">
                      <tr>
                        <th className="p-6 font-black">الاسم</th>
                        <th className="p-6 font-black">الهاتف</th>
                        <th className="p-6 font-black text-center">الحالة</th>
                        <th className="p-6 font-black">العمر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.uid} className="hover:bg-pink-50 transition-colors">
                          <td className="p-6 font-bold text-gray-800">{u.name}</td>
                          <td className="p-6 text-gray-500 font-mono">{u.phone}</td>
                          <td className="p-6 text-center">
                            <span className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-black">{u.status}</span>
                          </td>
                          <td className="p-6 text-gray-500 font-bold">
                            {u.dob ? (new Date().getFullYear() - new Date(u.dob).getFullYear()) : '--'} سنة
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
