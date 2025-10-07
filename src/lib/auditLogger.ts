import { supabase } from './supabase';

export type AuditActionType = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'STATUS_CHANGE' 
  | 'ASSIGN' 
  | 'UNASSIGN'
  | 'LOGIN'
  | 'LOGOUT';

export type AuditTableName = 
  | 'fields' 
  | 'tasks' 
  | 'team_members' 
  | 'user_profiles'
  | 'auth';

interface LogAuditParams {
  actionType: AuditActionType;
  tableName: AuditTableName;
  recordId?: string;
  oldData?: any;
  newData?: any;
  description?: string;
}

export async function logAudit({
  actionType,
  tableName,
  recordId,
  oldData,
  newData,
  description,
}: LogAuditParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    await supabase.rpc('log_audit_action', {
      p_user_id: user.id,
      p_user_email: user.email,
      p_user_role: profile?.role || 'worker',
      p_action_type: actionType,
      p_table_name: tableName,
      p_record_id: recordId || null,
      p_old_data: oldData ? JSON.stringify(oldData) : null,
      p_new_data: newData ? JSON.stringify(newData) : null,
      p_description: description || null,
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}



export async function logAuditAction(
  actionType: AuditActionType,
  tableName: AuditTableName,
  recordId?: string,
  oldData?: any,
  newData?: any,
  description?: string
) {
  return logAudit({ actionType, tableName, recordId, oldData, newData, description });
}
