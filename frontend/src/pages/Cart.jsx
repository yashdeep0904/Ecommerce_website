import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';


const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Simple logic for shipping (e.g., Free over $100)
  const shippingCost = cartTotal > 100 || cartTotal === 0 ? 0 : 15.00;
  const tax = cartTotal * 0.08; // 8% placeholder tax
  const finalTotal = cartTotal + shippingCost + tax;

  return (
    <div className="p-4 mx-auto font-sans duration-500 max-w-7xl md:p-8 animate-in fade-in">
      
      

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl text-slate-900">Your Cart</h1>
        <p className="mt-2 font-medium text-slate-500">Review your items before proceeding to checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        /* --- EMPTY CART STATE --- */
        <div className="flex flex-col items-center p-12 text-center bg-white border shadow-sm rounded-3xl border-slate-100 md:p-20">
          <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-full shadow-inner bg-slate-50">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-black text-slate-800">Your cart is empty</h2>
          <p className="max-w-md mb-8 text-slate-500">Looks like you haven't added anything yet. Discover our latest products and deals!</p>
          <button 
            onClick={() => navigate('/home')}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        /* --- FILLED CART STATE --- */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Cart Items List */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item.product} className="flex flex-col items-start gap-4 p-4 transition-all bg-white border shadow-sm rounded-3xl border-slate-100 sm:p-6 sm:flex-row sm:items-center sm:gap-6 hover:shadow-md">
                
                {/* Product Image */}
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden border cursor-pointer sm:w-32 sm:h-32 bg-slate-50 rounded-2xl border-slate-100 shrink-0 group" onClick={() => navigate(`/product/${item.product}`)}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 
                      className="text-base font-bold transition-colors cursor-pointer sm:text-lg text-slate-800 line-clamp-2 hover:text-emerald-600"
                      onClick={() => navigate(`/product/${item.product}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-lg font-black text-slate-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  
                  <p className="mb-4 font-mono text-sm text-slate-500">${item.price.toFixed(2)} each</p>

                  <div className="flex items-center justify-between mt-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center p-1 border bg-slate-50 border-slate-200 rounded-xl">
                      <button 
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      </button>
                      <span className="w-10 text-sm font-bold text-center text-slate-800">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.product)}
                      className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 border shadow-xl bg-slate-900 rounded-3xl border-slate-800 md:p-8 top-28">
              <h2 className="mb-6 text-xl font-black text-white">Order Summary</h2>
              
              <div className="mb-6 space-y-4">
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mt-1">Free</span>
                  ) : (
                    <span>${shippingCost.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="pt-6 mb-8 border-t border-slate-700">
                <div className="flex items-end justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-3xl font-black text-white">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
              >
                Proceed to Checkout
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-xs font-bold text-slate-400">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secure Encrypted Checkout
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;