import React, { useState } from 'react';
import { Student, AppLanguage, Result } from '../types';
import { getTranslation } from '../lib/translations';
import { generateStudentIdNumber, generateStudentSecretCode, getQualitativeGradeLabel } from '../lib/theme';
import {
  Search,
  Plus,
  Copy,
  Check,
  Share2,
  Trash2,
  Edit2,
  X,
  BookMarked,
  KeyRound,
  UserCheck
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  results: Result[];
  lang: AppLanguage;
  onSaveStudent: (student: Student) => void;
  onSoftDeleteStudent: (studentId: string) => void;
  onHardDeleteStudent: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  results,
  lang,
  onSaveStudent,
  onSoftDeleteStudent,
  onHardDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formClasses, setFormClasses] = useState<string[]>([]);
  const [formNewGroupInput, setFormNewGroupInput] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Extract distinct class/group names across all students
  const allGroupsSet = new Set<string>();
  students.forEach((s) => s.classNames?.forEach((c) => allGroupsSet.add(c)));
  const distinctGroups = Array.from(allGroupsSet);

  // Filter students
  const activeStudents = students.filter((s) => s.isActive);
  const filteredStudents = activeStudents.filter((student) => {
    // Search match
    const matchSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentIdNumber && student.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.secretCode && student.secretCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      student.classNames.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    // Class match
    const matchClass =
      selectedClassFilter === 'ALL' || student.classNames.includes(selectedClassFilter);

    // Tier match
    const studentResults = results.filter((r) => r.studentId === student.id);
    const validGrades = studentResults
      .map((r) => r.grade)
      .filter((g): g is number => g !== null && g !== undefined);
    const rawAvg =
      validGrades.length > 0
        ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
        : 0;
    const normalizedAvg = rawAvg > 10 ? rawAvg / 10 : rawAvg;

    let matchTier = true;
    if (selectedTierFilter === 'EXCELLENT') matchTier = normalizedAvg >= 9;
    if (selectedTierFilter === 'GOOD') matchTier = normalizedAvg >= 7 && normalizedAvg < 9;
    if (selectedTierFilter === 'AVERAGE') matchTier = normalizedAvg >= 5 && normalizedAvg < 7;
    if (selectedTierFilter === 'NEEDS_IMPROVEMENT') matchTier = normalizedAvg < 5;

    return matchSearch && matchClass && matchTier;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormFirstName('');
    setFormLastName('');
    setFormClasses(distinctGroups.length > 0 ? [distinctGroups[0]] : ['7-A']);
    setFormNewGroupInput('');
    setFormPhone('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormFirstName(student.firstName);
    setFormLastName(student.lastName);
    setFormClasses(student.classNames || []);
    setFormNewGroupInput('');
    setFormPhone(student.phone || '');
    setFormNotes(student.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) return;

    let finalClasses = [...formClasses];
    if (formNewGroupInput.trim() && !finalClasses.includes(formNewGroupInput.trim())) {
      finalClasses.push(formNewGroupInput.trim());
    }
    if (finalClasses.length === 0) {
      finalClasses = ['7-A'];
    }

    const updatedStudent: Student = {
      id: editingStudent ? editingStudent.id : `st_${Date.now()}`,
      studentIdNumber: editingStudent?.studentIdNumber || generateStudentIdNumber(),
      secretCode: editingStudent?.secretCode || generateStudentSecretCode(),
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      fullName: `${formFirstName.trim()} ${formLastName.trim()}`,
      classNames: finalClasses,
      phone: formPhone.trim(),
      notes: formNotes.trim(),
      createdAt: editingStudent ? editingStudent.createdAt : Date.now(),
      isActive: true,
    };

    onSaveStudent(updatedStudent);
    setIsModalOpen(false);
  };

  const handleCopyCode = (textToCopy: string, label: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(textToCopy);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareStudent = (student: Student) => {
    const text = `O'quvchi: ${student.fullName}\nO'quvchi ID (Raqamli): ${student.studentIdNumber}\nMaxfiy Kod (8-belgili): ${student.secretCode}\nSinflari: ${student.classNames.join(', ')}`;
    if (navigator.share) {
      navigator.share({
        title: student.fullName,
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Ma\'lumotlar nusxalandi! Messenjerga joylashingiz mumkin.');
    }
  };

  const toggleGroupSelection = (grp: string) => {
    if (formClasses.includes(grp)) {
      setFormClasses(formClasses.filter((c) => c !== grp));
    } else {
      setFormClasses([...formClasses, grp]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getTranslation(lang, 'search')}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[48px]"
          />
        </div>

        {/* Add Student Button */}
        <button
          onClick={handleOpenAddModal}
          className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[48px] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{getTranslation(lang, 'addStudent')}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Class Filter Dropdown */}
        <select
          value={selectedClassFilter}
          onChange={(e) => setSelectedClassFilter(e.target.value)}
          className="h-11 px-4 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 focus:outline-none min-h-[44px]"
        >
          <option value="ALL">{getTranslation(lang, 'studentFilterAll')}</option>
          {distinctGroups.map((grp) => (
            <option key={grp} value={grp}>
              {grp}
            </option>
          ))}
        </select>

        {/* Tier Filter Dropdown */}
        <select
          value={selectedTierFilter}
          onChange={(e) => setSelectedTierFilter(e.target.value)}
          className="h-11 px-4 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 focus:outline-none min-h-[44px]"
        >
          <option value="ALL">Barcha o'zlashtirishlar</option>
          <option value="EXCELLENT">{getTranslation(lang, 'tierExcellent')}</option>
          <option value="GOOD">{getTranslation(lang, 'tierGood')}</option>
          <option value="AVERAGE">{getTranslation(lang, 'tierAverage')}</option>
          <option value="NEEDS_IMPROVEMENT">{getTranslation(lang, 'tierNeedsImprovement')}</option>
        </select>

        <div className="text-xs font-medium text-stone-500 ml-auto">
          Topildi: <span className="font-bold text-stone-900 dark:text-white">{filteredStudents.length}</span> ta
        </div>
      </div>

      {/* Student List Cards */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const studentResults = results.filter((r) => r.studentId === student.id);
            const totalHw = studentResults.length;
            const completedCount = studentResults.filter((r) => r.completionStatus === 'COMPLETED').length;
            const compRate = totalHw > 0 ? Math.round((completedCount / totalHw) * 100) : 0;

            const validGrades = studentResults
              .map((r) => r.grade)
              .filter((g): g is number => g !== null && g !== undefined);
            const rawAvg =
              validGrades.length > 0
                ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
                : null;

            const qualitative = getQualitativeGradeLabel(rawAvg, lang);

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-700/80 hover:shadow-md transition-all space-y-4 relative group"
              >
                {/* Header: Name + Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-base flex items-center justify-center shrink-0">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold font-display text-stone-900 dark:text-white text-base leading-tight">
                          {student.fullName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200/50">
                          ID: {student.studentIdNumber}
                        </span>
                      </div>
                      {/* Multi-group badges */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {student.classNames.map((grp) => (
                          <span
                            key={grp}
                            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-700 text-[10px] font-semibold text-stone-600 dark:text-stone-300"
                          >
                            {grp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Edit / Share Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(student)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShareStudent(student)}
                      className="p-2 rounded-xl text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Ulashish"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Identification & Secret Code Box */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-100 dark:border-zinc-700/50 space-y-2.5 text-xs">
                  {/* Numeric Student ID */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold block">O'quvchi ID (Faqat raqam)</span>
                      <span className="font-mono font-extrabold text-stone-900 dark:text-white tracking-wider text-sm">
                        ID: {student.studentIdNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(student.studentIdNumber, 'ID')}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-semibold min-h-[36px]"
                    >
                      {copiedId === student.studentIdNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>ID nusxalash</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mixed Alphanumeric Secret Code */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold block">Maxfiy Kod (Harf + Raqam)</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider text-sm">
                        {student.secretCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(student.secretCode, 'Kod')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 text-[11px] font-semibold min-h-[36px]"
                    >
                      {copiedId === student.secretCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Kod nusxalash</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-zinc-700/60">
                  <div>
                    <span className="text-[10px] text-stone-400 block">{getTranslation(lang, 'score')}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-sm text-stone-900 dark:text-white">
                        {rawAvg !== null ? (rawAvg > 10 ? rawAvg / 10 : rawAvg).toFixed(1) : '-'} / 10
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qualitative.colorClass}`}>
                        {qualitative.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 block">{getTranslation(lang, 'completionRate')}</span>
                    <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {compRate}%
                    </div>
                  </div>
                </div>

                {/* Soft Delete Action */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm(`${student.fullName} ni o'chirishni tasdiqlaysizmi?`)) {
                        onSoftDeleteStudent(student.id);
                      }
                    }}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1 min-h-[44px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, 'softDelete')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 p-12 rounded-3xl text-center border border-stone-100 dark:border-zinc-700 space-y-3">
          <BookMarked className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-medium text-stone-500">{getTranslation(lang, 'noStudentsYet')}</p>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display text-stone-900 dark:text-white">
                {editingStudent ? getTranslation(lang, 'editStudent') : getTranslation(lang, 'addStudent')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'firstName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder="Jahongir"
                  className="w-full h-12 px-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px]"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'lastName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder="Toirov"
                  className="w-full h-12 px-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px]"
                />
              </div>

              {/* Multi-group Selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'classGroups')} (Multi-select)
                </label>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {distinctGroups.map((grp) => {
                    const isSelected = formClasses.includes(grp);
                    return (
                      <button
                        type="button"
                        key={grp}
                        onClick={() => toggleGroupSelection(grp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all min-h-[36px] ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700'
                        }`}
                      >
                        {grp}
                      </button>
                    );
                  })}
                </div>

                {/* Input for a new group */}
                <input
                  type="text"
                  value={formNewGroupInput}
                  onChange={(e) => setFormNewGroupInput(e.target.value)}
                  placeholder={getTranslation(lang, 'addGroupPlaceholder')}
                  className="w-full h-11 px-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'phone')}
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+998901234567"
                  className="w-full h-12 px-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {getTranslation(lang, 'notes')}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Qo'shimcha eslatmalar..."
                  className="w-full p-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-semibold text-sm rounded-xl transition-all min-h-[48px]"
                >
                  {getTranslation(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] min-h-[48px]"
                >
                  {getTranslation(lang, 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
