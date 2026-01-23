
import React, { useState } from 'react';
import { Role } from '../types';
import { UserCog, Shield, Search, UserPlus, X, Check } from 'lucide-react';

interface AdminPortalProps {
  userRoles: Record<string, Role>;
  onUpdateRole: (email: string, newRole: Role) => void;
  onAddUser: (email: string, role: Role) => boolean;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ userRoles, onUpdateRole, onAddUser }) => {
  const [filter, setFilter] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('Viewer');
  const [error, setError] = useState('');

  const roles: Role[] = [
    'Viewer', 
    'Admin', 
    'IT Content Manager', 
    'Communications Content Manager', 
    'HR Content Manager'
  ];

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-red-50 text-red-700 border-red-100';
      case 'IT Content Manager': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Communications Content Manager': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'HR Content Manager': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Viewer': return 'bg-slate-50 text-slate-700 border-slate-100 opacity-60';
    }
  };

  const users = (Object.entries(userRoles) as [string, Role][])
    .filter(([email]) => email.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid corporate email.');
      return;
    }

    const success = onAddUser(newEmail, newRole);
    if (success) {
      setNewEmail('');
      setNewRole('Viewer');
      setIsAddingUser(false);
    } else {
      setError('This user email already has an assigned role.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Controls</h1>
          <p className="text-slate-500">Manage access levels for internal content creators</p>
        </div>
        <button 
          onClick={() => setIsAddingUser(!isAddingUser)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            isAddingUser 
              ? 'bg-slate-200 text-slate-700 shadow-none' 
              : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'
          }`}
        >
          {isAddingUser ? <X size={20} /> : <UserPlus size={20} />}
          {isAddingUser ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {isAddingUser && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl animate-in zoom-in-95 duration-200">
          <form onSubmit={handleAddSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-emerald-800 uppercase">Corporate Email</label>
              <input 
                autoFocus
                type="email" 
                placeholder="e.g. employee@jsbl.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs font-bold text-emerald-800 uppercase">Assign Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button 
              type="submit"
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 h-[46px]"
            >
              <Check size={18} /> Confirm Access
            </button>
          </form>
          {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <UserCog size={18} className="text-emerald-600" />
             Access Management
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter by email..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Email Address</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Current Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right border-b border-slate-100">Modify Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-20 mb-2" />
                      <p className="font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(([email, role]) => (
                  <tr key={email} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-semibold text-slate-900">{email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold border rounded-lg px-2.5 py-1 transition-all ${getRoleBadge(role)}`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <select
                        value={role}
                        onChange={(e) => onUpdateRole(email, e.target.value as Role)}
                        className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm hover:border-emerald-300 transition-all"
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
        <Shield className="text-blue-600 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Security & Provisioning Policy</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Provisioned users will inherit these roles upon their next SSO login. The <strong>Viewer</strong> role designation is hidden from end-users to ensure a non-privileged viewing experience as per bank policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
