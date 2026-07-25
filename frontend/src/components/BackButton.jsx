import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)} // The "-1" tells React Router to go to the previous history state
      className="flex items-center gap-2 mb-6 text-sm font-bold transition-all text-slate-500 hover:text-slate-900 group w-fit"
    >
      <div className="flex items-center justify-center w-8 h-8 transition-all rounded-full bg-slate-100 group-hover:bg-slate-200 group-hover:-translate-x-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </div>
      Go Back
    </button>
  );
};

export default BackButton;