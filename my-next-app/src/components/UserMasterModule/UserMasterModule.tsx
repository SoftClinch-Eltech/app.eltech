import React, { useState, useMemo } from 'react';
import { Screen, User } from '../../types';
import { initialUsers } from '../../data/sapMockData';
import { TableToolbar } from '../CommonUI/CommonUI';
import {
  Users,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Save,
  Plus,
  UserCheck
} from 'lucide-react';

interface UserMasterModuleProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  triggerToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  users: User[];
  onUpdateUsers: (newUsers: User[]) => void;
}

export const UserMasterModule: React.FC<UserMasterModuleProps> = ({
  activeScreen,
  onNavigate,
  triggerToast,
  users,
  onUpdateUsers
}) => {
  // Active user selection for detail screen (SU01)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Form local state for Create / Edit
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('Accountant');
  const [formDept, setFormDept] = useState('');
  const [formStatus, setFormStatus] = useState<User['status']>('Active');
  const [formPerms, setFormPerms] = useState<User['permissions']>({
    fb03: true,
    vf03: false,
    fbl3n: true,
    fbl5n: true,
    fbl1n: true,
    userMaster: false,
    settings: false
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Active user being viewed
  const activeUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // Load user details into form inputs
  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);
    setFormUsername(user.username);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDept(user.department);
    setFormStatus(user.status);
    setFormPerms({ ...user.permissions });
    onNavigate('USER_DETAILS');
  };

  const handleInitiateCreate = () => {
    setSelectedUserId(null); // Indicates a new user creation
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormRole('Accountant');
    setFormDept('Finance Team');
    setFormStatus('Active');
    setFormPerms({
      fb03: true,
      vf03: false,
      fbl3n: true,
      fbl5n: true,
      fbl1n: true,
      userMaster: false,
      settings: false
    });
    onNavigate('USER_DETAILS');
  };

  // Create or Update handler
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername || !formFullName || !formEmail) {
      alert('Please fill out all mandatory user properties (Username, Full Name, Email).');
      return;
    }

    if (selectedUserId) {
      // Update existing
      const updatedList = users.map(u => {
        if (u.id === selectedUserId) {
          return {
            ...u,
            username: formUsername,
            fullName: formFullName,
            email: formEmail,
            role: formRole,
            department: formDept,
            status: formStatus,
            permissions: { ...formPerms }
          };
        }
        return u;
      });
      onUpdateUsers(updatedList);
      triggerToast(`SAP Operator ${formUsername} updated successfully!`);
    } else {
      // Create new
      const newUser: User = {
        id: `USR${Math.floor(100 + Math.random() * 900)}`,
        username: formUsername.toLowerCase().trim(),
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        role: formRole,
        department: formDept,
        permissions: { ...formPerms },
        status: formStatus,
        lastLogin: 'Never Logged In'
      };
      onUpdateUsers([...users, newUser]);
      triggerToast(`New SAP Operator ${formUsername} created successfully!`);
    }
    onNavigate('USER_MASTER_MAIN');
  };

  // Delete User
  const handleDeleteUser = () => {
    if (!selectedUserId) return;
    if (confirm(`Are you sure you want to completely de-provision operator ${formUsername}?`)) {
      const remaining = users.filter(u => u.id !== selectedUserId);
      onUpdateUsers(remaining);
      triggerToast(`Operator ${formUsername} has been de-provisioned.`);
      onNavigate('USER_MASTER_MAIN');
    }
  };

  // Reset Password
  const handleResetPassword = () => {
    triggerToast(`Deplaced emergency Basis password reset tickets for ${formUsername}.`);
  };

  // Toggle permission checkboxes helper
  const handleTogglePerm = (key: keyof User['permissions']) => {
    setFormPerms(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter list
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);


  // ============================================================================
  // RENDERING SECTIONS
  // ============================================================================

  // ----------------------------------------------------------------------------
  // MAIN USERS LIST (SU01 INDEX)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'USER_MASTER_MAIN') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">SAP SU01 User Administration</h2>
            <p className="text-xs text-slate-500 mt-1">Configure client identities, assign functional roles and locks</p>
          </div>
          <div className="flex gap-2">
            <button
              id="btn-usm-create"
              onClick={handleInitiateCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#963F29] hover:bg-[#85341f] text-white rounded text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
            <button
              id="btn-usm-back"
              onClick={() => onNavigate('DASHBOARD')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Gateway</span>
            </button>
          </div>
        </div>

        {/* User List Data Table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={filteredUsers.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                <tr>
                  <th className="p-3 font-mono">User ID</th>
                  <th className="p-3 font-mono">SAP Username</th>
                  <th className="p-3">Full Legal Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Department Branch</th>
                  <th className="p-3 font-mono">Assigned Role</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Last Login Activity</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-500">{user.id}</td>
                    <td className="p-3 font-mono font-bold text-[#273B5E]">{user.username}</td>
                    <td className="p-3 font-medium text-slate-800">{user.fullName}</td>
                    <td className="p-3 font-mono text-slate-600">{user.email}</td>
                    <td className="p-3 text-slate-600 font-sans">{user.department}</td>
                    <td className="p-3 font-mono text-[11px] text-[#963F29] font-bold">{user.role}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold leading-none ${user.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : user.status === 'Locked'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[10px]">{user.lastLogin}</td>
                    <td className="p-3 text-center">
                      <button
                        id={`btn-usm-edit-${user.username}`}
                        onClick={() => handleSelectUser(user)}
                        className="px-3 py-1 bg-slate-50 hover:bg-[#273B5E] hover:text-white border border-[#D9DEE6] rounded text-[11px] font-sans transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // USER DETAILS SCREEN (SU01 PROFILE CREATION & PERMISSIONS)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'USER_DETAILS') {
    return (
      <div className="p-6 max-w-3xl mx-auto select-none font-sans text-xs">
        <form onSubmit={handleSaveUser} className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#273B5E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-xs uppercase">
                  {selectedUserId ? `MAINTAIN OPERATOR PROFILE (ID: ${selectedUserId})` : 'PROVISION NEW USER PROFILE'}
                </h3>
                <p className="text-[10px] text-gray-300">Transaction SU01 - Client Identity Control</p>
              </div>
            </div>
            <button
              type="button"
              id="btn-usd-back"
              onClick={() => onNavigate('USER_MASTER_MAIN')}
              className="text-gray-300 hover:text-white font-mono font-medium"
            >
              Back to List
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Row 1: Identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">SAP Username (Mandatory)</label>
                <input
                  id="user-form-username"
                  type="text"
                  placeholder="e.g. j_smith"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  disabled={!!selectedUserId} // Lock username on edit
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold text-slate-800 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Full Legal Name</label>
                <input
                  id="user-form-fullname"
                  type="text"
                  placeholder="e.g. Johnathan Smith"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Email Address</label>
                <input
                  id="user-form-email"
                  type="email"
                  placeholder="e.g. j.smith@softclinch.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Department / Team</label>
                <input
                  id="user-form-dept"
                  type="text"
                  placeholder="e.g. General Ledger Desk"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Row 2: Roles & Lock Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Assigned Security Role</label>
                <select
                  id="user-form-role"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as User['role'])}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold text-[#273B5E]"
                >
                  <option value="Solution Architect">Solution Architect - Full Audit & Configuration</option>
                  <option value="Functional Consultant">Functional Consultant - Ledger Advice</option>
                  <option value="Finance Manager">Finance Manager - Control & Reports</option>
                  <option value="Accountant">Accountant - Standard Line Posting</option>
                  <option value="Auditor">Auditor - Compliance External review</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Roster Lock Status</label>
                <select
                  id="user-form-status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as User['status'])}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold"
                >
                  <option value="Active">Active - Standard Gateways unlocked</option>
                  <option value="Locked">Locked - Basis Security block active</option>
                  <option value="Inactive">Inactive - Closed account</option>
                </select>
              </div>
            </div>

            {/* Row 3: Granular Transaction Permissions Checkboxes */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                Granular SAP Transaction Authorization Profiles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'fb03', label: 'FB03 - Journal entries viewer' },
                  { key: 'vf03', label: 'VF03 - SD Sales Invoices' },
                  { key: 'fbl3n', label: 'FBL3N - General Ledger post display' },
                  { key: 'fbl5n', label: 'FBL5N - Customer AR balances' },
                  { key: 'fbl1n', label: 'FBL1N - Vendor AP balances' },
                  { key: 'userMaster', label: 'SU01 - User Master editing' },
                  { key: 'settings', label: 'SPRO - Corporate Configurator' }
                ].map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/60 p-2.5 rounded border border-[#D9DEE6] cursor-pointer"
                  >
                    <input
                      id={`chk-perm-${perm.key}`}
                      type="checkbox"
                      checked={formPerms[perm.key as keyof User['permissions']]}
                      onChange={() => handleTogglePerm(perm.key as keyof User['permissions'])}
                      className="rounded text-[#273B5E] focus:ring-[#273B5E] border-[#D9DEE6]"
                    />
                    <span className="font-semibold text-slate-700 font-sans text-[11px]">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form actions footer bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-5 gap-3">
              {selectedUserId ? (
                <button
                  id="btn-usd-delete"
                  type="button"
                  onClick={handleDeleteUser}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded font-bold self-start sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>DE-PROVISION USER</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                {selectedUserId && (
                  <button
                    id="btn-usd-resetpwd"
                    type="button"
                    onClick={handleResetPassword}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#D9DEE6] text-slate-700 rounded font-medium"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <span>Reset Password</span>
                  </button>
                )}

                <button
                  id="btn-usd-save"
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded font-bold shadow-sm"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>SAVE USER CARD</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return null;
};
