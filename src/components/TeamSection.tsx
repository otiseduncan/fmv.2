import React, { useState } from 'react';
import { Search, Phone, Mail, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const TeamSection: React.FC = () => {
  const { teamMembers, fields, loading, addTask, updateTeamMember } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'low', due_date: '' });

  const roles = ['all', ...Array.from(new Set(teamMembers.map(m => m.role)))];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleContact = (member: any, type: 'email' | 'phone') => {
    if (type === 'email') {
      window.location.href = `mailto:${member.email}`;
    } else {
      window.location.href = `tel:${member.phone}`;
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTask({
      ...taskForm,
      id: crypto.randomUUID(),
      assigned_to: selectedMember.id,
      status: 'pending',
      priority: taskForm.priority as any
    });
    setSelectedMember(null);
    setTaskForm({ title: '', description: '', priority: 'low', due_date: '' });
  };

  const handleStatusChange = async (memberId: string, newStatus: 'available' | 'busy' | 'offline') => {
    await updateTeamMember(memberId, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Team Management</h1>
        <p className="text-blue-100">Coordinate your collision and ADAS field team</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <img 
                  src={member.avatar_url} 
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <select
                  value={member.status}
                  onChange={(e) => handleStatusChange(member.id, e.target.value as any)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                    member.status === 'available' ? 'bg-green-100 text-green-700' :
                    member.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{member.role}</p>

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => handleContact(member, 'email')}
                  className="w-full flex items-center justify-start text-sm text-gray-600 hover:text-blue-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </button>
                <button
                  onClick={() => handleContact(member, 'phone')}
                  className="w-full flex items-center justify-start text-sm text-gray-600 hover:text-blue-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {member.phone}
                </button>
              </div>

              {member.assigned_fields && member.assigned_fields.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Assigned Jobs:</p>
                  <p className="text-sm font-medium text-gray-900">{member.assigned_fields.length} jobs</p>
                </div>
              )}

              <button
                onClick={() => setSelectedMember(member)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Assign Task to {selectedMember.name}</h3>
            <form onSubmit={handleAssignTask}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
                <textarea
                  placeholder="Task description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  rows={3}
                />
                <select 
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSection;
