import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';

const PageHeader = ({ title = 'Dashboard', greeting = 'Bom dia! Visão Geral', showDate = true }) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), 'dd/MM/yyyy HH:mm'));
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-1">
              {title}
            </h2>
            {showDate && (
              <p className="text-sm font-poppins text-gray-600">Atualizado em {currentDate}</p>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-semibold font-poppins text-gray-700">{greeting}</h2>
      </div>
    </div>
  );
};

export default PageHeader;
