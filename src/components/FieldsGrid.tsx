import React, { useState } from 'react';
import { Search, Filter, Grid, List, Plus, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import FieldCard from './FieldCard';
import FieldModal from './FieldModal';
import { Button } from './ui/button';

const FieldsGrid: React.FC = () => {
  const { fields, loading } = useAppContext();
  const { canCreateField } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCrop, setFilterCrop] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedField, setSelectedField] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const cropTypes = ['all', ...Array.from(new Set(fields.map(f => f.crop)))];
  const statuses = ['all', 'healthy', 'needs_attention', 'critical', 'harvesting'];

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || field.status === filterStatus;
    const matchesCrop = filterCrop === 'all' || field.crop === filterCrop;
    return matchesSearch && matchesStatus && matchesCrop;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'size': return b.size - a.size;
      case 'moisture': return b.soil_moisture - a.soil_moisture;
      case 'yield': return b.expected_yield - a.expected_yield;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">SyferField Management</h1>
            <p className="text-green-100">Driving Technology • {fields.length} active jobs</p>
          </div>
          {canCreateField() && (
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-white text-green-600 hover:bg-green-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Job
            </Button>
          )}
        </div>


        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by name, service, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {statuses.map(status => {
                  const label = status === 'all'
                    ? 'All Status'
                    : (status === 'harvesting' ? 'Calibrating' : (status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')));
                  return (
                    <option key={status} value={status}>{label}</option>
                  );
                })}
              </select>

              <select
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {cropTypes.map(crop => (
                  <option key={crop} value={crop}>
                    {crop === 'all' ? 'All Services' : crop}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="moisture">Sort by Readiness</option>
                <option value="yield">Sort by Est. Hours</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 px-2">
          Showing {filteredFields.length} of {fields.length} jobs
        </div>

        <div className={viewMode === 'grid' ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
          "space-y-4"
        }>
          {filteredFields.map(field => (
            <FieldCard 
              key={field.id} 
              field={field}
              onClick={() => setSelectedField(field)}
            />
          ))}
        </div>
      </div>

      {selectedField && (
        <FieldModal 
          field={selectedField}
          onClose={() => setSelectedField(null)}
        />
      )}

      {isCreating && (
        <FieldModal 
          field={null}
          onClose={() => setIsCreating(false)}
        />
      )}
    </>
  );
};

export default FieldsGrid;
