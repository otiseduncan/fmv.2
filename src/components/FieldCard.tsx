import React from 'react';
import { MapPin, Droplets, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Field } from '@/contexts/AppContext';

interface FieldCardProps {
  field: Field;
  onClick: () => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onClick }) => {
  const getStatusIcon = () => {
    switch (field.status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'needs_attention': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'harvesting': return <TrendingUp className="w-5 h-5 text-red-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (field.status) {
      case 'healthy': return 'border-green-200 bg-green-50';
      case 'critical': return 'border-red-200 bg-red-50';
      case 'needs_attention': return 'border-yellow-200 bg-yellow-50';
      case 'harvesting': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 ${getStatusColor()}`}
    >
      <div className="relative">
        <img 
          src={field.image_url} 
          alt={field.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-1">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{field.status === 'harvesting' ? 'calibrating' : field.status.replace('_', ' ')}</span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {field.location}
            </p>
          </div>
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
            {field.size} hrs
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Type</span>
            <span className="font-medium text-gray-900">{field.crop}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <Droplets className="w-4 h-4 mr-1" />
              Calibration Readiness
            </span>
            <span className={`font-medium ${
              field.soil_moisture > 70 ? 'text-green-600' : 
              field.soil_moisture > 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {field.soil_moisture}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Estimated Hours
            </span>
            <span className="font-medium text-gray-900">{field.expected_yield} h</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              Next Appointment: {new Date(field.next_irrigation).toLocaleDateString()}
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
              {field.growth_stage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldCard;
