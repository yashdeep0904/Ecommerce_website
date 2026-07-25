import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Support = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState({ subject: 'Order Inquiry', message: '' });

  const faqs = [
    { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express options are available at checkout." },
    { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee on all unused items in their original packaging." },
    { q: "How do I track my order?", a: "Navigate to 'Order History' in your profile menu to see live tracking updates." }
  ];

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticket.message.trim()) return toast.error("Please describe your issue.");
    
    setIsSubmitting(true);
    try {
      // If backend route isn't ready, this simulates a successful ticket submission
      // await storeApi.submitSupportTicket(ticket);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Support ticket submitted! We will email you within 24 hours.");
      setTicket({ ...ticket, message: '' });
    } catch (err) {
      toast.error("Failed to send ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl p-4 mx-auto font-sans duration-500 md:p-8 animate-in fade-in">
      <BackButton/>
      {/* Header */}
      <div className="relative p-8 mb-8 overflow-hidden text-center bg-slate-900 rounded-3xl md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl translate-x-1/3"></div>
        <h1 className="relative z-10 mb-4 text-3xl font-black text-white md:text-4xl">How can we help you?</h1>
        <p className="relative z-10 max-w-xl mx-auto text-slate-400">Our dedicated support team is here to assist you with orders, product inquiries, and technical issues.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        
        {/* Contact Form */}
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Send us a Message</h2>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Subject</label>
              <select 
                value={ticket.subject} 
                onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                className="w-full px-4 py-3 text-sm font-bold border outline-none appearance-none cursor-pointer bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500 text-slate-700"
              >
                <option value="Order Inquiry">Order & Shipping Inquiry</option>
                <option value="Returns">Returns & Refunds</option>
                <option value="Technical">Technical Support</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">How can we help?</label>
              <textarea 
                rows="5" 
                required
                value={ticket.message}
                onChange={(e) => setTicket({...ticket, message: e.target.value})}
                placeholder="Please provide details about your issue..."
                className="w-full px-4 py-3 text-sm font-medium border outline-none resize-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500"
              ></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2">
              {isSubmitting ? "Sending..." : (
                <>
                  Submit Ticket
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQs & Quick Contact */}
        <div className="space-y-6">
          <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <h3 className="mb-1 text-sm font-bold text-slate-800">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 text-center border bg-slate-50 border-slate-100 rounded-2xl">
               <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 text-blue-500 bg-white rounded-full shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
               </div>
               <p className="text-xs font-bold text-slate-900">Email Us</p>
               <p className="text-[10px] text-slate-500 mt-1">support@shophub.com</p>
             </div>
             
             <div className="p-5 text-center border bg-slate-50 border-slate-100 rounded-2xl">
               <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-white rounded-full shadow-sm text-emerald-500">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
               </div>
               <p className="text-xs font-bold text-slate-900">Call Us</p>
               <p className="text-[10px] text-slate-500 mt-1">+1 (800) 123-4567</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;