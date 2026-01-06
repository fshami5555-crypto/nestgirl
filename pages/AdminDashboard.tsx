
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// Fix: Import from @firebase/firestore instead of firebase/firestore to resolve missing export errors
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
    await addDoc(collection(db, 'products'), { ...newProduct });
    alert('تمت إضافة المنتج');
  };

  const handleAddArticle = async () => {
    await addDoc(collection(db, 'articles'), { ...newArticle, timestamp: serverTimestamp() });
    alert('تم نشر المقال');
  };

  const deletePost = async (id: string) => {
    if (window.confirm('حذف هذا المنشور؟')) await deleteDoc(doc(db, 'posts', id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-pink-600 text-white p-6 space-y-8 shrink-0">
        <h1 className="text-2xl font-black text-center">نست جيرل | أدمن</h1>
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
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${tab === t.id ? 'bg-white text-pink-600 shadow-lg' : 'hover:bg-pink-500'}`}
            >
              <i className={`fa-solid ${t.icon}`}></i>
              {t.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full mt-10 p-4 border border-white/30 rounded-xl hover:bg-white/10">خروج</button>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        {tab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">الطلبات الواردة</h2>
            <div className="grid gap-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {o.status === 'pending' ? 'قيد الانتظار' : 'تم التوصيل'}
                      </span>
                      <h3 className="font-bold text-gray-800">طلب #{o.id.slice(-5)}</h3>
                    </div>
                    <p className="text-sm text-gray-500">العميلة: {o.userName} | {o.phone}</p>
                    <p className="text-sm text-gray-500">الموقع: {o.city} - {o.address}</p>
                    <div className="mt-2 text-pink-600 font-bold">الإجمالي: {o.total} JOD</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select 
                      className="bg-gray-50 p-2 rounded-lg text-sm outline-none"
                      value={o.status}
                      onChange={e => updateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                    </select>
                    <button onClick={() => deleteOrder(o.id)} className="text-red-400 hover:text-red-600 p-2"><i className="fa-solid fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="grid md:grid-cols-2 gap-10">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">إضافة منتج جديد</h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <input placeholder="اسم المنتج" className="w-full p-3 bg-gray-50 rounded-xl" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="number" placeholder="السعر" className="w-full p-3 bg-gray-50 rounded-xl" onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                <select className="w-full p-3 bg-gray-50 rounded-xl" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  <option value="skin">عناية بالبشرة</option>
                  <option value="fitness">مكملات ورشاقة</option>
                  <option value="family">أطفال وأسرة</option>
                </select>
                <textarea placeholder="وصف المنتج" className="w-full p-3 bg-gray-50 rounded-xl" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <button onClick={handleAddProduct} className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl">إضافة المنتج</button>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">نشر مقال جديد</h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <input placeholder="عنوان المقال" className="w-full p-3 bg-gray-50 rounded-xl" onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                <select className="w-full p-3 bg-gray-50 rounded-xl" onChange={e => setNewArticle({...newArticle, category: e.target.value as any})}>
                  <option value="skin">بشرة وجمال</option>
                  <option value="fitness">رشاقة وغذاء</option>
                  <option value="family">أسرة وطفل</option>
                </select>
                <textarea placeholder="محتوى المقال" className="w-full p-3 bg-gray-50 rounded-xl min-h-[200px]" onChange={e => setNewArticle({...newArticle, content: e.target.value})} />
                <button onClick={handleAddArticle} className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl">نشر المقال</button>
              </div>
            </section>
          </div>
        )}

        {tab === 'community' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">الرقابة المجتمعية</h2>
            <div className="grid gap-4">
              {posts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{p.authorName}</h4>
                    <p className="text-gray-600 text-sm mt-1">{p.content}</p>
                  </div>
                  <button onClick={() => deletePost(p.id)} className="bg-red-50 text-red-500 font-bold px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white">حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">قاعدة المستخدمات ({users.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">الاسم</th>
                    <th className="p-4">الهاتف</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">العمر</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-gray-50">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4 text-gray-500">{u.phone}</td>
                      <td className="p-4"><span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-lg text-xs">{u.status}</span></td>
                      <td className="p-4 text-gray-500">{new Date().getFullYear() - new Date(u.dob).getFullYear()} سنة</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
