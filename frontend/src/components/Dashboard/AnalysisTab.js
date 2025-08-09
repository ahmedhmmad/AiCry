import { PriceCard } from './PriceCard';
import { DecisionCard } from './DecisionCard';
import { ControlCard } from './ControlCard';

export const AnalysisTab = ({ 
  loading, 
  currentPrice, 
  lastUpdate, 
  analysisData, 
  onRefresh 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PriceCard 
        loading={loading} 
        currentPrice={currentPrice} 
        lastUpdate={lastUpdate} 
      />
      <DecisionCard 
        loading={loading} 
        analysisData={analysisData} 
      />
      <ControlCard 
        loading={loading} 
        analysisData={analysisData} 
        onRefresh={onRefresh} 
      />
    </div>
  );
};
