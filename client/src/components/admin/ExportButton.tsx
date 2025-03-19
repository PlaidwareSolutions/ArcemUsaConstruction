import React from 'react';
import { Button } from "@/components/ui/button";
import { exportToExcel, formatDataForExport } from '@/utils/excelExport';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  fileName: string;
  excludeFields?: string[];
  dateFields?: string[];
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  excludeFields = [],
  dateFields = ['createdAt', 'updatedAt', 'date'],
  disabled = false,
  variant = 'outline',
  size = 'sm'
}) => {
  const handleExport = () => {
    const formattedData = formatDataForExport(data, excludeFields, dateFields);
    exportToExcel(formattedData, fileName);
  };

  return (
    <Button 
      onClick={handleExport} 
      variant={variant} 
      size={size}
      disabled={disabled || data.length === 0}
      className="flex items-center gap-1"
    >
      <Download className="h-4 w-4 mr-1" />
      Export to Excel
    </Button>
  );
};

export default ExportButton;