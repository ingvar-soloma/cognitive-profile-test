import React, { useState } from 'react';
import { Profile, UIStrings, Language, ProfileType } from '@/types';
import { User, Plus, Trash2, UserCircle, Download } from 'lucide-react';
import { ProfileService } from '@/services/ProfileService';
import { AVAILABLE_SURVEYS } from '@/constants';

interface ProfileManagerProps {
  profiles: Profile[];
  activeProfileId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  ui: UIStrings;
  lang: Language;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  activeProfileId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  ui,
  lang,
}) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedProfileForDownload, setSelectedProfileForDownload] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName('');
    }
  };

  const handleStartEdit = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const getProfileTypeLabel = (type?: ProfileType) => ProfileService.getProfileTypeLabel(type, lang);

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelect(id);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    setSelectedProfileForDownload(profileId);
    setShowDownloadModal(true);
  };

  const handleDownloadConfirm = (surveyId: string) => {
    if (!selectedProfileForDownload) return;

    const profile = profiles.find(p => p.id === selectedProfileForDownload);
    if (!profile) return;

    const survey = AVAILABLE_SURVEYS.find(s => s.id === surveyId);
    if (!survey) return;

    // Prepare content
    let content = `Profile: ${profile.name}\n`;
    content += `Date: ${new Date(profile.lastUpdated).toLocaleDateString()}\n`;
    content += `Test: ${survey.title['en']}\n\n`; // Using English title as requested

    survey.categories.forEach(cat => {
      content += `--- ${cat.title['en']} ---\n\n`;
      cat.questions.forEach(q => {
        const answer = profile.answers[q.id];
        content += `Q: ${q.text['en']}\n`;
        if (answer) {
          content += `Answer: ${answer.value}\n`;
          if (answer.note) {
            content += `Note: ${answer.note}\n`;
          }
        } else {
          content += `Answer: [No Answer]\n`;
        }
        content += `\n`;
      });
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${profile.name}_${surveyId}_answers.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    setShowDownloadModal(false);
    setSelectedProfileForDownload(null);
  };

  return (
    <div className="card-editorial overflow-hidden mb-12">
      <div className="p-5 border-b border-stone-line bg-stone-bg/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-ink/5 flex items-center justify-center border border-brand-ink/10 text-brand-ink">
          <UserCircle className="w-4 h-4" />
        </div>
        <h3 className="font-serif text-lg font-bold text-brand-textPrimary tracking-tight">{ui.manageProfiles}</h3>
      </div>

      <div className="p-4">
        {profiles.length > 0 ? (
          <div className="grid gap-3 mb-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-all border ${activeProfileId === profile.id
                    ? 'bg-brand-ink/5 border-brand-ink/20 shadow-sm'
                    : 'bg-brand-bgCard/50 border-stone-line hover:border-brand-ink/20 hover:bg-brand-bgCard'
                  }`}
              >
                <div
                  className="flex-1 cursor-pointer flex items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/20 rounded-lg p-1 overflow-hidden"
                  onClick={() => onSelect(profile.id)}
                  onKeyDown={(e) => handleKeyDown(e, profile.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={activeProfileId === profile.id}
                >
                  <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${activeProfileId === profile.id ? 'bg-brand-ink text-white shadow-soft' : 'bg-stone-bg text-stone-400'
                    }`}>
                    <User className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === profile.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, profile.id)}
                          onBlur={() => handleSaveEdit(profile.id)}
                          autoFocus
                          className="w-full bg-brand-bgCard border border-brand-ink/50 rounded-lg px-3 py-1.5 text-sm font-bold text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
                        />
                      </div>
                    ) : (
                      <div
                        className="font-bold text-brand-textPrimary text-left cursor-pointer hover:text-brand-ink flex flex-wrap items-center gap-x-2 outline-none focus-visible:underline group"
                        onClick={(e) => handleStartEdit(e, profile.id, profile.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleStartEdit(e as any, profile.id, profile.name);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        title="Click to rename"
                      >
                        <span className="truncate max-w-full font-serif text-base">{profile.name}</span>
                        {profile.type && (
                          <span className="text-stone-400 font-normal text-xs whitespace-nowrap px-2 py-0.5 bg-stone-bg border border-stone-line/50 rounded uppercase tracking-wider text-[10px]">
                            {getProfileTypeLabel(profile.type)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 text-left mt-0.5">
                      {new Date(profile.lastUpdated).toLocaleDateString(lang)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => handleDownloadClick(e, profile.id)}
                    className="p-2 text-stone-400 hover:text-brand-ink hover:bg-brand-ink/5 rounded-lg transition-all"
                    title={ui.downloadQuestions}
                    aria-label={ui.downloadQuestions}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {activeProfileId === profile.id ? (
                    <span className="text-[9px] font-bold text-brand-ink uppercase tracking-widest px-2.5 py-1 bg-brand-ink/10 rounded-full border border-brand-ink/20 whitespace-nowrap">
                      {ui.activeProfile}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(profile.id);
                      }}
                      className="p-2 text-stone-300 hover:text-brand-clay hover:bg-brand-clay/5 rounded-lg transition-all"
                      title={ui.deleteProfile}
                      aria-label={ui.deleteProfile}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 italic text-sm">
            {ui.noProfiles}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={ui.profileName}
            className="flex-1 bg-stone-bg/50 border border-stone-line rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ink/20 transition-all font-medium placeholder-stone-400"
            required
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="bg-brand-ink text-white px-5 rounded-xl hover:bg-brand-ink-hover disabled:opacity-40 disabled:grayscale transition-all shadow-md active:scale-95 flex items-center justify-center"
            aria-label={ui.createProfile}
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-brand-graphite/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in transition-all">
          <div className="bg-brand-bgCard rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-stone-line">
            <div className="p-8 border-b border-stone-line flex justify-between items-center">
              <h3 className="font-serif text-2xl font-bold text-brand-textPrimary tracking-tight">{ui.selectTestToDownload}</h3>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-bg text-stone-400 transition-colors text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-3">
              {AVAILABLE_SURVEYS.map(survey => (
                <button
                  key={survey.id}
                  onClick={() => handleDownloadConfirm(survey.id)}
                  className="w-full text-left p-5 rounded-2xl border border-stone-line hover:bg-brand-ink/5 hover:border-brand-ink/20 transition-all group"
                >
                  <div className="font-serif text-lg font-bold text-brand-textPrimary group-hover:text-brand-ink transition-colors">{survey.title[lang]}</div>
                  <div className="text-sm text-stone-500 mt-1 line-clamp-1 font-sans">{survey.description?.[lang]}</div>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-stone-line bg-stone-bg/30 text-right">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-8 py-3 text-brand-textPrimary font-bold text-xs uppercase tracking-widest hover:bg-stone-bg rounded-xl transition-colors"
              >
                {ui.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};