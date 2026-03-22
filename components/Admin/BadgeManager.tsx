import React, { useState, useEffect } from 'react';
import { Badge, UIStrings, Language } from '@/types';
import { ProfileService } from '@/services/ProfileService';
import { Plus, Edit2, Trash2, X, Check, Award, UserPlus, ShieldOff, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BadgeManagerProps {
  ui: UIStrings;
  lang: Language;
}

export const BadgeManager: React.FC<BadgeManagerProps> = ({ ui, lang }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState<Partial<Badge> | null>(null);
  const [assigningToUserId, setAssigningToUserId] = useState<string>('');
  const [assigningToBadgeId, setAssigningToBadgeId] = useState<number | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setLoading(true);
    const data = await ProfileService.fetchBadges(true);
    setBadges(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingBadge?.code || !editingBadge?.name) return;

    if (editingBadge.id) {
      await ProfileService.updateBadge(editingBadge.id, editingBadge);
    } else {
      await ProfileService.createBadge(editingBadge);
    }
    setEditingBadge(null);
    loadBadges();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      await ProfileService.deleteBadge(id);
      loadBadges();
    }
  };

  const handleAssign = async () => {
    if (!assigningToUserId || !assigningToBadgeId) return;
    const res = await ProfileService.assignBadge(assigningToUserId, assigningToBadgeId);
    if (res?.status === 'success') {
      toast.success('Badge assigned successfully');
      setAssigningToUserId('');
      setAssigningToBadgeId(null);
    } else {
      toast.error('Failed to assign badge: ' + (res?.detail || 'Unknown error'));
    }
  };

  if (loading && badges.length === 0) return <div className="p-10 text-center animate-pulse">Loading badges...</div>;

  return (
    <div className="p-6 md:p-10 space-y-12 animate-fade-in">
      {/* List Badges */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-ink/5 border border-brand-ink/10 flex items-center justify-center text-brand-ink">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-graphite">Badge Definitions</h3>
          </div>
          <button 
            onClick={() => setEditingBadge({ code: '', name: '', icon: '🏆', is_active: true, is_secret: false })}
            className="btn-primary px-6 py-2 rounded-xl flex items-center gap-2 text-xs uppercase tracking-widest shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Badge
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {badges.map(badge => (
            <div key={badge.id} className="bg-brand-paper-accent border border-stone-line rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingBadge(badge)} className="p-2 hover:bg-brand-ink/5 rounded-lg text-stone-400 hover:text-brand-ink transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(badge.id)} className="p-2 hover:bg-brand-clay/5 rounded-lg text-stone-400 hover:text-brand-clay transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
               
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-paper-accent border border-stone-line flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {badge.icon || "🏆"}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-graphite leading-tight">{badge.name}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">CODE: {badge.code}</span>
                  </div>
               </div>
               
               <p className="text-xs text-stone-500 leading-relaxed mb-4 line-clamp-2">
                 {badge.description || "No description provided."}
               </p>
               
               <div className="flex items-center gap-3">
                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${badge.is_active ? 'bg-brand-sage/10 text-brand-sage' : 'bg-stone-bg/50 text-stone-400 border border-stone-line/50'}`}>
                    {badge.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {badge.is_active ? 'Active' : 'Inactive'}
                 </span>
                 {badge.is_secret && (
                   <span className="px-2 py-0.5 rounded-full bg-brand-ink/5 text-brand-ink text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Secret
                   </span>
                 )}
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assignment Interface */}
      <section className="bg-brand-paper-accent/30 rounded-[2rem] border border-stone-line p-8 md:p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-clay/5 border border-brand-clay/10 flex items-center justify-center text-brand-clay">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-graphite">Assign Badge to User</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">User ID</label>
            <input 
              type="text" 
              placeholder="e.g. 12345678" 
              value={assigningToUserId}
              onChange={(e) => setAssigningToUserId(e.target.value)}
              className="w-full px-5 py-3 bg-brand-paper-accent border border-stone-line rounded-xl text-sm focus:ring-2 focus:ring-brand-ink/20 outline-none transition-all"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Select Badge</label>
            <select 
              value={assigningToBadgeId || ''} 
              onChange={(e) => setAssigningToBadgeId(Number(e.target.value))}
              className="w-full px-5 py-3 bg-brand-paper-accent border border-stone-line rounded-xl text-sm focus:ring-2 focus:ring-brand-ink/20 outline-none transition-all appearance-none"
            >
              <option value="">Select a badge...</option>
              {badges.filter(b => b.is_active).map(b => (
                <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleAssign}
            disabled={!assigningToUserId || !assigningToBadgeId}
            className="btn-primary h-[50px] px-8 rounded-xl uppercase tracking-[0.2em] text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
          >
            Assign Badge
          </button>
        </div>
      </section>

      {/* Edit Modal */}
      {editingBadge && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm" onClick={() => setEditingBadge(null)}></div>
          <div className="bg-brand-paper-accent rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-white/10">
             <div className="bg-brand-ink p-8 text-white">
                <h4 className="text-2xl font-serif font-bold">{editingBadge.id ? 'Edit Badge' : 'New Badge'}</h4>
                <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-bold">Configure badge properties</p>
             </div>
             
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 h-4">Name</label>
                      <input 
                        type="text" 
                        value={editingBadge.name || ''} 
                        onChange={(e) => setEditingBadge({...editingBadge, name: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-bg border border-stone-line rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-ink/20"
                      />
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 h-4">Icon</label>
                       <input 
                        type="text" 
                        value={editingBadge.icon || ''} 
                        onChange={(e) => setEditingBadge({...editingBadge, icon: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-bg border border-stone-line rounded-xl text-center text-xl outline-none focus:ring-2 focus:ring-brand-ink/20"
                       />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">System Code (unique)</label>
                   <input 
                    type="text" 
                    value={editingBadge.code || ''} 
                    onChange={(e) => setEditingBadge({...editingBadge, code: e.target.value})}
                    placeholder="e.g. founding_member"
                    className="w-full px-4 py-3 bg-stone-bg border border-stone-line rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-ink/20 font-mono"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Description</label>
                   <textarea 
                    value={editingBadge.description || ''} 
                    onChange={(e) => setEditingBadge({...editingBadge, description: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-bg border border-stone-line rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-ink/20 min-h-[100px] resize-none"
                   />
                </div>

                <div className="flex gap-8 items-center pt-2">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${editingBadge.is_active ? 'bg-brand-ink border-brand-ink text-white' : 'border-stone-line text-transparent'}`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={editingBadge.is_active} 
                        onChange={(e) => setEditingBadge({...editingBadge, is_active: e.target.checked})}
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-500 group-hover:text-brand-ink transition-colors">Active</span>
                   </label>

                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${editingBadge.is_secret ? 'bg-brand-ink border-brand-ink text-white' : 'border-stone-line text-transparent'}`}>
                         <Check className="w-4 h-4" />
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={editingBadge.is_secret} 
                        onChange={(e) => setEditingBadge({...editingBadge, is_secret: e.target.checked})}
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-500 group-hover:text-brand-ink transition-colors">Secret</span>
                   </label>
                </div>
             </div>

             <div className="p-8 bg-stone-bg/50 border-t border-stone-line flex justify-end gap-4">
                <button onClick={() => setEditingBadge(null)} className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-stone-400 hover:text-brand-ink transition-colors">Cancel</button>
                <button onClick={handleSave} className="btn-primary px-10 py-3 rounded-xl shadow-soft">Save Badge</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
