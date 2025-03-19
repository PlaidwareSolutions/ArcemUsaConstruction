import React from 'react';
import { Building2 } from 'lucide-react';

const BotAvatar: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1E90DB] text-white">
      <Building2 className="w-5 h-5" />
    </div>
  );
};

export default BotAvatar;