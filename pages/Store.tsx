
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// Fix: Import from @firebase/firestore instead of firebase/firestore to resolve missing export errors
import { collection, onSnapshot, addDoc, serverTimestamp } from '@firebase/firestore';
import { useAuth } from '../App';
import { Product } from '../types';

const Store: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('عمان');

  const cities = ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'المفرق', 'الكرك', 'مأدبا', 'جرش', 'عجلون', 'السلط', 'الطفيلة', 'معان'];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === p.id);
      if (existing) return prev.map(item => item.product.id === p.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const deliveryFee = 3;

  const handleCheckout = async () => {
    if (!user || !address) return;
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.phone,
        userName: user.name,
        items: cart,
        total: total + deliveryFee,
        status: 'pending',
        address,
        city,
        phone: user.phone,
        timestamp: serverTimestamp()
      });
      alert('تم استلام طلبكِ بنجاح! سنتواصل معكِ قريباً.');
      setCart([]);
      setShowCheckout(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Cart Info */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">منتجاتنا المختارة</h2>
        <button 
          onClick={() => cart.length > 0 && setShowCheckout(true)}
          className="relative glass p-3 rounded-2xl text-pink-600 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-cart-shopping text-xl"></i>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-2 gap-4">
        {products.length > 0 ? products.map(p => (
          <div key={p.id} className="glass rounded-[2rem] overflow-hidden group">
            <div className="h-32 bg-white relative">
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-3">
              <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{p.name}</h4>
              <p className="text-pink-600 font-bold text-sm my-1">{p.price} JOD</p>
              <button 
                onClick={() => addToCart(p)}
                className="w-full bg-pink-100 text-pink-600 font-bold py-2 rounded-xl text-xs hover:bg-pink-500 hover:text-white transition-all active:scale-95"
              >
                إضافة للسلة
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-10 text-gray-400">
            <i className="fa-solid fa-store-slash text-4xl mb-2"></i>
            <p>المتجر قيد التحديث، عودي قريباً!</p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-[3rem] p-8 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">إتمام الطلب</h3>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400"><i className="fa-solid fa-times text-xl"></i></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-gray-500 pr-2 block mb-1">المحافظة</label>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-0 outline-none font-bold text-gray-700"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input 
                className="w-full p-4 bg-gray-50 rounded-2xl border-0 outline-none"
                placeholder="العنوان التفصيلي"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="glass p-4 rounded-2xl space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي:</span>
                <span>{total} JOD</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>رسوم التوصيل:</span>
                <span>{deliveryFee} JOD</span>
              </div>
              <div className="flex justify-between text-lg font-black text-pink-600 border-t pt-2">
                <span>المجموع الكلي:</span>
                <span>{total + deliveryFee} JOD</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              تأكيد الطلب
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
