import React, { useState, useEffect } from 'react';
import {
  Homework,
  Student,
  Result,
  ResultStatus,
  AppLanguage,
  GradeType
} from '../types';
import { getTranslation } from '../lib/translations';
import { getQualitativeGradeLabel } from '../lib/theme';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
  UserX,
  Sparkles,
  Save,
  Check
} from 'lucide-react';

interface CheckingEngineViewProps {
  homework: Homework;
  students: Student[];
  results: Result[];
  lang: AppLanguage;
  onSaveResult: (result: Result) => void;
  onBack: () => void;
}

export const CheckingEngineView: React.FC<CheckingEngineViewProps> = ({
  homework,
  students,
  results,
  lang,
  onSaveResult,
  onBack,
}) => {
  // Filter students whose `classNames` includes the homework's `className`
  const roster = students.filter(
    (s) => s.isActive && s.classNames.includes(homework.className)
  );

  // Local state map for results
  const [localResults, setLocalResults] = useState<Record<string, Result>>({});
  const [saveStatusMap, setSaveStatusMap] = useState<Record<string, 'SAVING' | 'SAVED' | 'FAILED'>>({});

  // Initialize local results map from passed results prop
  useEffect(() => {
    const map: Record<string, Result> = {};
    roster.forEach((s) => {
      const existing = results.find((r) => r.studentId === s.id && r.homeworkId === homework.id);
      if (existing) {
        map[s.id] = existing;
      } else {
        map[s.id] = {
          id: `res_${s.id}_${homework.id}`,
          studentId: s.id,
          homeworkId: homework.id,
          isPresent: true,
          completionStatus: 'COMPLETED',
          grade: 10,
          gradeType: 'POINT_10',
          comment: '',
          checkedDate: Date.now(),
          checkedBy: 'Zilola Alimova',
        };
      }
    });
    setLocalResults(map);
  }, [homework.id, results]);

  const handleUpdate = (studentId: string, updates: Partial<Result>) => {
    const current = localResults[studentId] || {
      id: `res_${studentId}_${homework.id}`,
      studentId,
      homeworkId: homework.id,
      isPresent: true,
      completionStatus: 'COMPLETED',
      grade: 10,
      gradeType: 'POINT_10',
      comment: '',
      checkedDate: Date.now(),
      checkedBy: 'Zilola Alimova',
    };

    const updated: Result = {
      ...current,
      ...updates,
      checkedDate: Date.now(),
    };

    setLocalResults((prev) => ({ ...prev, [studentId]: updated }));

    // Show autosave indicator
    setSaveStatusMap((prev) => ({ ...prev, [studentId]: 'SAVING' }));
    setTimeout(() => {
      onSaveResult(updated);
      setSaveStatusMap((prev) => ({ ...prev, [studentId]: 'SAVED' }));
    }, 400);
  };

  const handleFastStatusChange = (studentId: string, status: ResultStatus) => {
    let newGrade = 10;
    if (status === 'PARTIAL') newGrade = 5;
    if (status === 'MISSING') newGrade = 0;

    handleUpdate(studentId, {
      completionStatus: status,
      grade: newGrade,
      isPresent: status === 'MISSING' ? false : true,
    });
  };

  const handleAttendanceToggle = (studentId: string, isPresent: boolean) => {
    if (!isPresent) {
      handleUpdate(studentId, {
        isPresent: false,
        completionStatus: 'MISSING',
        grade: 0,
      });
    } else {
      handleUpdate(studentId, {
        isPresent: true,
        completionStatus: 'COMPLETED',
        grade: 10,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 pb-28 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>{homework.className}</span>
              <span>•</span>
              <span>{homework.subject}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900 dark:text-white">
              {homework.title}
            </h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200/60 shrink-0">
          <Sparkles className="w-4 h-4" />
          <span>{getTranslation(lang, 'fastModeTip')}</span>
        </div>
      </div>

      {/* Roster List */}
      <div className="space-y-4">
        {roster.length > 0 ? (
          roster.map((student) => {
            const result = localResults[student.id] || {
              id: `res_${student.id}_${homework.id}`,
              studentId: student.id,
              homeworkId: homework.id,
              isPresent: true,
              completionStatus: 'COMPLETED',
              grade: 10,
              gradeType: 'POINT_10',
              comment: '',
              checkedDate: Date.now(),
              checkedBy: 'Zilola Alimova',
            };

            const saveStatus = saveStatusMap[student.id];
            const qualitative = getQualitativeGradeLabel(result.grade, lang);

            return (
              <div
                key={student.id}
                className={`p-5 rounded-3xl border-2 transition-all space-y-4 bg-white dark:bg-zinc-800 ${
                  !result.isPresent
                    ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20'
                    : 'border-stone-200/80 dark:border-zinc-700/80 shadow-sm'
                }`}
              >
                {/* Row 1: Student Name & Attendance Toggle & Autosave Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-700 font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center text-sm">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-stone-900 dark:text-white leading-tight">
                        {student.fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-700 text-stone-800 dark:text-stone-200 font-mono font-bold text-xs border border-stone-200 dark:border-zinc-600">
                          ID: {student.studentIdNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200/50">
                          Kod: {student.secretCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Autosave Status */}
                    {saveStatus === 'SAVING' && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                        {getTranslation(lang, 'autosaving')}
                      </span>
                    )}
                    {saveStatus === 'SAVED' && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{getTranslation(lang, 'autosaved')}</span>
                      </span>
                    )}

                    {/* Attendance Switch (Present vs Absent) */}
                    <button
                      onClick={() => handleAttendanceToggle(student.id, !result.isPresent)}
                      className={`h-10 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all min-h-[44px] ${
                        result.isPresent
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {result.isPresent ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>{getTranslation(lang, 'present')}</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>{getTranslation(lang, 'absent')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Row 2: Fast 3-Way Status Toggle Buttons (Operable with thumb) */}
                {result.isPresent && (
                  <div className="grid grid-cols-3 gap-2">
                    {/* Button 1: Completed (10) */}
                    <button
                      onClick={() => handleFastStatusChange(student.id, 'COMPLETED')}
                      className={`h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[48px] active:scale-[0.98] ${
                        result.completionStatus === 'COMPLETED'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-stone-100 dark:bg-zinc-700/60 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{getTranslation(lang, 'statusCompletedBtn')}</span>
                    </button>

                    {/* Button 2: Partial (5) */}
                    <button
                      onClick={() => handleFastStatusChange(student.id, 'PARTIAL')}
                      className={`h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[48px] active:scale-[0.98] ${
                        result.completionStatus === 'PARTIAL'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-stone-100 dark:bg-zinc-700/60 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getTranslation(lang, 'statusPartialBtn')}</span>
                    </button>

                    {/* Button 3: Missing (0) */}
                    <button
                      onClick={() => handleFastStatusChange(student.id, 'MISSING')}
                      className={`h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[48px] active:scale-[0.98] ${
                        result.completionStatus === 'MISSING'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-stone-100 dark:bg-zinc-700/60 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{getTranslation(lang, 'statusMissingBtn')}</span>
                    </button>
                  </div>
                )}

                {/* Row 3: Fine-Tune Grade & Qualitative Badge */}
                {result.isPresent && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 flex items-center gap-2">
                      <label className="text-xs font-bold text-stone-500 whitespace-nowrap">
                        {getTranslation(lang, 'gradeLabel')}:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={result.grade !== null ? result.grade : ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleUpdate(student.id, {
                            grade: isNaN(val) ? null : Math.min(10, Math.max(0, val)),
                          });
                        }}
                        className="w-20 h-10 px-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-stone-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[40px]"
                      />
                      <span className="text-xs text-stone-400 font-semibold">/ 10</span>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${qualitative.colorClass}`}>
                      {qualitative.label}
                    </span>
                  </div>
                )}

                {/* Row 4: Comment Input */}
                <input
                  type="text"
                  value={result.comment || ''}
                  onChange={(e) => handleUpdate(student.id, { comment: e.target.value })}
                  placeholder={getTranslation(lang, 'commentLabel') + ' (ixtiyoriy)...'}
                  className="w-full h-10 px-3 bg-stone-50 dark:bg-zinc-900/80 border border-stone-200/80 dark:border-zinc-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none min-h-[40px]"
                />
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-zinc-800 p-12 rounded-3xl text-center border border-stone-200 dark:border-zinc-700">
            <p className="text-sm font-medium text-stone-500">
              Bu guruhda ({homework.className}) o'quvchilar topilmadi. O'quvchilar bo'limida ularga ushbu guruhni biriktiring.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
