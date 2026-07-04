import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import Skeleton from '@mui/material/Skeleton';
import { getMyGroups } from '../../api/studentApi';

export default function StudentShop() {
  const { dark, lang } = useApp();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  const [coin, setCoin]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [bought, setBought]     = useState(new Set());

  // Coin ni API dan yoki sessiyadan olish
  useEffect(() => {
    async function loadCoin() {
      setLoading(true);
      try {
        // Guruh ma'lumotlarida coin bo'lishi mumkin
        const res  = await getMyGroups();
        const data = res.data?.data || res.data || [];
        const arr  = Array.isArray(data) ? data : [];
        // Birinchi guruhdan coin olamiz
        const coinVal = arr[0]?.coin ?? arr[0]?.student?.coin ?? arr[0]?.balance ?? 0;
        setCoin(coinVal);
      } catch {
        setCoin(0);
      } finally {
        setLoading(false);
      }
    }
    loadCoin();
  }, []);

  const products = [
    { 
      id: 1, 
      name: lang === 'uz' ? "Maxsus sovg'a 1" : "Специальный подарок 1",  
      price: 400, 
      image: '/market1.png',
      isImage: true,
      category: lang === 'uz' ? 'Sovg\'a' : 'Подарок'
    },
    { 
      id: 2, 
      name: lang === 'uz' ? "Maxsus sovg'a 2" : "Специальный подарок 2", 
      price: 1500, 
      image: '/market2.png',
      isImage: true,
      category: lang === 'uz' ? 'Sovg\'a' : 'Подарок'
    },
  ];

  function handleBuy(product) {
    if (coin < product.price || bought.has(product.id)) return;
    setCoin(prev => prev - product.price);
    setBought(prev => new Set([...prev, product.id]));
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
          {lang === 'uz' ? "Do'kon" : 'Магазин'}
        </h1>

        {/* Coin balans */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          background: dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
          borderRadius: 12, border: `1px solid ${dark ? 'rgba(34,197,94,0.3)' : '#bbf7d0'}`,
        }}>
          <DiamondRoundedIcon style={{ color: '#22c55e', fontSize: 20 }} />
          {loading
            ? <Skeleton variant="text" width={60} />
            : <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22c55e' }}>
                {coin} coin
              </span>
          }
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {products.map(p => {
          const canBuy   = coin >= p.price && !bought.has(p.id);
          const isBought = bought.has(p.id);
          return (
            <div key={p.id} style={{
              background: cardBg, borderRadius: 16, border: `1px solid ${border}`,
              overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer',
              opacity: !canBuy && !isBought ? 0.6 : 1,
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                height: 200, background: dark ? '#16161f' : '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3.5rem', position: 'relative',
              }}>
                {p.isImage ? (
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                ) : (
                  p.image
                )}
                {isBought && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(34,197,94,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '2rem' }}>✅</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600,
                  background: dark ? 'rgba(108,53,222,0.15)' : '#f3f0ff', color: '#6c35de',
                }}>
                  {p.category}
                </span>
                <p style={{ fontWeight: 600, color: textMain, fontSize: '0.88rem', margin: '8px 0 6px' }}>
                  {p.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#f97316', fontSize: '0.95rem' }}>
                    {p.price} coin
                  </span>
                  <button
                    onClick={() => handleBuy(p)}
                    disabled={!canBuy}
                    style={{
                      padding: '5px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                      background: isBought ? '#22c55e' : (canBuy ? '#6c35de' : '#94a3b8'),
                      color: '#fff', border: 'none',
                      cursor: canBuy ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                    onMouseOver={e => { if (canBuy) e.currentTarget.style.background = '#5a2cc0'; }}
                    onMouseOut={e => { if (canBuy) e.currentTarget.style.background = '#6c35de'; }}
                  >
                    {isBought
                      ? (lang === 'uz' ? 'Sotib olindi' : 'Куплено')
                      : (lang === 'uz' ? 'Sotib olish' : 'Купить')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coin yetarli emaslik haqida xabar */}
      {coin === 0 && !loading && (
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: dark ? 'rgba(249,115,22,0.08)' : '#fff7ed',
          border: `1px solid ${dark ? 'rgba(249,115,22,0.2)' : '#fed7aa'}`,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <DiamondRoundedIcon style={{ color: '#f97316', fontSize: 20, marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: '0.83rem', color: dark ? '#fdba74' : '#c2410c', margin: 0, lineHeight: 1.6 }}>
            {lang === 'uz'
              ? "Coin to'plash uchun darslarga qatnashing va uy vazifalarini o'z vaqtida topshiring!"
              : "Зарабатывайте коины, посещая занятия и сдавая домашние задания вовремя!"}
          </p>
        </div>
      )}
    </div>
  );
}
