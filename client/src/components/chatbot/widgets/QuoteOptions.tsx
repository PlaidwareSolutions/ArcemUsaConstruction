import React from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const QuoteOptions = () => {
  return (
    <div className="quote-options-widget py-2">
      <Link 
        to="/request-quote"
        className="flex items-center justify-between bg-[#1E90DB] hover:bg-[#1670B0] text-white p-3 rounded-md mt-2 transition-colors w-full"
        onClick={() => window.parent.location.href = '/request-quote'}
      >
        <span className="font-medium">Request a Quote</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
      <div className="mt-4 text-sm text-gray-600">
        <p>Our quotes are:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Detailed and transparent</li>
          <li>No hidden costs</li>
          <li>Valid for 30 days</li>
          <li>Personalized to your project</li>
        </ul>
      </div>
    </div>
  );
};

export default QuoteOptions;