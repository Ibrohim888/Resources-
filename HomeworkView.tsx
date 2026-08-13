import React, { useState } from 'react';
import {
  Homework,
  Student,
  Result,
  AppLanguage,
  HomeworkStatus
} from '../types';
import { getTranslation } from '../lib/translations';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import {
  Plus,
  Search,
  BookOpen,
  Calendar as CalendarIcon,
  Play,
  Edit3,
  Trash2,
  Paperclip,
  X
} from 'lucide-react';

interface HomeworkViewProps {
  homeworks: Homework[];
  students: Student[];
  results: Result[];
  lang: AppLanguage;
  onOpenCheckingEngine: (homeworkId: string) => void;
  onSaveHomework: (hw: Homework) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onArchiveHomework: (homeworkId: string) => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  homeworks,
  students,
  results,
  lang,
  onOpenCheckingEngine,
  onSaveHomework,
  onDeleteHomework,
  onArchiveHomework,
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHw, setEditingHw] = useState<Homework | null>(null);

  // Delete Confirmation Dialog state
  const [deletingHw, setDeletingHw] = useState<Homework | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Matematika');
  const [formClass, setFormClass] = useState('7-A');
  const [formDesc, setFormDesc] = useState('');
  const [formAssignedDate, setFormAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formDeadline, setFormDeadline] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [formAttachmentName, setFormAttachmentName] = useState<string | undefined>(undefined);

  // Extract distinct class names from student records
  const allGroupsSet = new Set<string>();
  students.forEach((s) => s.classNames?.forEach((c) => allGroupsSet.add(c)));
  const distinctGroups = Array.from(allGroupsSet);
  if (distinctGroups.length === 0) distinctGroups.push('7-A');

  const filteredHomeworks = homeworks.filter((hw) => {
    const matchTab = hw.status === activeTab;
    const matchSearch =
      hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingHw(null);
    setFormTitle('');
    setFormSubject('Matematika');
    setFormClass(distinctGroups[0] || '7-A');
    setFormDesc('');
    setFormAssignedDate(new Date().toISOString().split('T')[0]);
    setFormDeadline(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
    setFormAttachmentName(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hw: Homework) => {
    setEditingHw(hw);
    setFormTitle(hw.title);
    setFormSubject(hw.subject);
    setFormClass(hw.className);
    setFormDesc(hw.description);
    setFormAssignedDate(hw.assignedDate);
    setFormDeadline(hw.deadline);
    setFormAttachmentName(hw.attachmentName);
    setIsModalOpen(true);
  };

  const handleSave = (statusToSave: HomeworkStatus) => {
    if (!formTitle.trim()) return;

    const newHw: Homework = {
      id: editingHw ? editingHw.id : `hw_${Date.now()}`,
      title: formTitle.trim(),
      subject: formSubject,
      className: formClass,
      description: formDesc.trim(),
      assignedDate: formAssignedDate,
      deadline: formDeadline,
      status: statusToSave,
      attachmentName: formAttachmentName,
      createdAt: editingHw ? editingHw.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveHomework(newHw);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (hw: Homework) => {
    setDeletingHw(hw);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getTranslation(lang, 'search')}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px]"
          />
        </div>

        {/* Create Homework Button */}
        <button
          onClick={handleOpenAddModal}
          className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[48px] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{getTranslation(lang, 'createHomework')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl border border-stone-200/60 dark:border-zinc-700/60">
        {[
          { id: 'ACTIVE', labelKey: 'statusActive' },
          { id: 'COMPLETED', labelKey: 'statusCompleted' },
          { id: 'ARCHIVED', labelKey: 'statusArchived' },
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              {getTranslation(lang, t.labelKey as any)}
            </button>
          );
        })}
      </div>

      {/* Homework Cards List */}
      {filteredHomeworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHomeworks.map((hw) => {
            const hwResults = results.filter((r) => r.homeworkId === hw.id);
            const hasResults = hwResults.length > 0;

            return (
              <div
                key={hw.id}
                className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-700/80 space-y-4 hover:shadow-md transition-all relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-700 text-stone-700 dark:text-stone-300 text-xs font-bold">
                        {hw.className}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        {hw.subject}
                      </span>
                    </div>
                    <h3 className="font-bold font-display text-stone-900 dark:text-white text-base leading-snug pt-1">
                      {hw.title}
                    </h3>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(hw)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(hw)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {hw.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {hw.description}
                  </p>
                )}

                {hw.attachmentName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200/60 text-xs font-medium text-stone-700 dark:text-stone-300">
                    <Paperclip className="w-3.5 h-3.5 text-stone-400" />
                    <span>{hw.attachmentName}</span>
                  </div>
                )}

                {/* Footer: Deadlines & Fast Checking Button */}
                <div className="pt-3 border-t border-stone-100 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tugash: <strong className="text-stone-800 dark:text-stone-200">{hw.deadline}</strong></span>
                  </div>

                  <button
                    onClick={() => onOpenCheckingEngine(hw.id)}
                    className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] min-h-[44px]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Darsda Baholash</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 p-12 rounded-3xl text-center border border-stone-100 dark:border-zinc-700 space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-medium text-stone-500">{getTranslation(lang, 'noHomeworkYet')}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deletingHw !== null}
        lang={lang}
        hasResults={deletingHw ? results.some((r) => r.homeworkId === deletingHw.id) : false}
        onConfirmDelete={() => {
          if (deletingHw) {
            onDeleteHomework(deletingHw.id);
            setDeletingHw(null);
          }
        }}
        onArchiveInstead={() => {
          if (deletingHw) {
            onArchiveHomework(deletingHw.id);
            setDeletingHw(null);
          }
        }}
        onClose={() => setDeletingHw(null)}
      />

      {/* Add / Edit Homework Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display text-stone-900 dark:text-white">
                {editingHw ? getTranslation(lang, 'editHomework') : getTranslation(lang, 'createHomework')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'homeworkTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Kvadrat tenglamalar yechish..."
                  className="w-full h-12 px-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px]"
                />
              </div>

              {/* Subject & Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {getTranslation(lang, 'subject')} *
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full h-12 px-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Ingliz tili">Ingliz tili</option>
                    <option value="Fizika">Fizika</option>
                    <option value="Olimpiada">Olimpiada</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {getTranslation(lang, 'targetClass')} *
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full h-12 px-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
                  >
                    {distinctGroups.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {getTranslation(lang, 'assignedDate')}
                  </label>
                  <input
                    type="date"
                    value={formAssignedDate}
                    onChange={(e) => setFormAssignedDate(e.target.value)}
                    className="w-full h-12 px-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {getTranslation(lang, 'deadline')} *
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full h-12 px-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'description')}
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Masalalar tartib raqami va ko'rsatmalar..."
                  className="w-full p-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Edit Deadline Warning */}
              {editingHw && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/50">
                  {getTranslation(lang, 'editDeadlineWarning')}
                </p>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleSave('DRAFT')}
                  className="flex-1 h-12 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl transition-all min-h-[48px]"
                >
                  {getTranslation(lang, 'saveAsDraft')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('ACTIVE')}
                  className="flex-[1.5] h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-[0.98] min-h-[48px]"
                >
                  {getTranslation(lang, 'publishActive')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
