import React, { useState } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/auditLogger';
import { supabase } from '@/lib/supabase';

interface FieldModalProps {
  field: any | null;
  onClose: () => void;
}

const FieldModal: React.FC<FieldModalProps> = ({ field, onClose }) => {
  const { createField, updateField, deleteField, teamMembers } = useAppContext();
  const { canEditField, canDeleteField } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(field || {
    name: '', location: '', size: 0, crop: '', status: 'healthy',
    soil_moisture: 50, expected_yield: 0, image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (field) {
        await updateField(field.id, formData);
        await logAudit({
          actionType: 'UPDATE',
          tableName: 'fields',
          recordId: field.id,
          oldData: field,
          newData: formData,
          description: `Updated job: ${formData.name}`
        });

        // Notify managers if status changed to critical
        if (field.status !== 'critical' && formData.status === 'critical') {
          const managers = teamMembers.filter(m => m.role === 'manager' || m.role === 'admin');
          for (const manager of managers) {
            await supabase.functions.invoke('create-notification', {
              body: {
                userId: manager.id,
                title: 'Critical Job Status',
                message: `Job "${formData.name}" status changed to CRITICAL. Immediate attention required!`,
                type: 'critical_job',
                severity: 'error',
                metadata: { fieldId: field.id, location: formData.location }
              }
            });
          }
        }

        toast({ title: 'Job updated successfully' });
      } else {
        const newField = await createField(formData);
        await logAudit({
          actionType: 'CREATE',
          tableName: 'fields',
          recordId: newField?.id,
          newData: formData,
          description: `Created job: ${formData.name}`
        });
        toast({ title: 'Job created successfully' });
      }
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this job?')) return;
    setLoading(true);
    try {
      await deleteField(field.id);
      await logAudit({
        actionType: 'DELETE',
        tableName: 'fields',
        recordId: field.id,
        oldData: field,
        description: `Deleted job: ${field.name}`
      });
      toast({ title: 'Job deleted' });
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const canEdit = !field || canEditField();
  const canDelete = field && canDeleteField();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{field ? 'Edit Job' : 'New Job'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" required disabled={!canEdit} value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" required disabled={!canEdit} value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                <input type="number" required disabled={!canEdit} value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Type</label>
                <input type="text" required disabled={!canEdit} value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select disabled={!canEdit} value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="healthy">On Schedule</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              {canEdit && (
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : field ? 'Update' : 'Create'}
                </Button>
              )}
              {canDelete && (
                <Button type="button" onClick={handleDelete} disabled={loading} variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FieldModal;

