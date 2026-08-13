import React from 'react';
import {
  Student,
  Homework,
  Result,
  TeacherProfile,
  AppLanguage,
  ThemeColor
} from '../types';
import { themeConfigs, getQualitativeGradeLabel } from '../lib/theme';
import { getTranslation } from '../lib/translations';
import {
  Users,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';

interface DashboardViewProps {
  profile: TeacherProfile;
  students: Student[];
  homeworks: Homework[];
  results: Result[];
  onOpenCheckingEngine: (homeworkId: string) => void;
  onNavigateTab: (tab: 'students' | 'homework' | 'rating' | 'profile') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  students,
  homeworks,
  results,
  onOpenCheckingEngine,
  onNavigateTab,
}) => {
  const activeTheme = themeConfigs[profile.themeColor] || themeConfigs['forest_green'];
  const lang = profile.language;

  // Active students
  const activeStudents = students.filter((s) => s.isActive);
  const activeHomeworks = homeworks.filter((h) => h.status === 'ACTIVE');

  // Compute Overall Stats
  const totalResults = results.length;
  const completedResults = results.filter((r) => r.completionStatus === 'COMPLETED').length;
  const partialResults = results.filter((r) => r.completionStatus === 'PARTIAL').length;
  const missingResults = results.filter((r) => r.completionStatus === 'MISSING').length;

  const completionRate = totalResults > 0
    ? Math.round(((completedResults + partialResults * 0.5) / totalResults) * 100)
    : 0;

  const validGrades = results.map((r) => r.grade).filter((g): g is number => g !== null && g !== undefined);
  const rawAvg = validGrades.length > 0
    ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
    : 0;
  const classAvgFormatted = rawAvg > 0 ? (rawAvg > 10 ? rawAvg / 10 : rawAvg).toFixed(1) : '0.0';

  const qualitative = getQualitativeGradeLabel(rawAvg, lang);

  return (
    <div className="space-y-6 pb-20 pt-4">
      {/* Top Stat Summary Cards */}
      <div className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Students */}
          <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl shadow-sm border border-stone-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span className="text-xs font-semibold">{getTranslation(lang, 'totalStudents')}</span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-white">
              {activeStudents.length}
            </div>
          </div>

          {/* Card 2: Active Homeworks */}
          <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl shadow-sm border border-stone-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span className="text-xs font-semibold">{getTranslation(lang, 'activeHomeworks')}</span>
              <div
                className="p-2 rounded-xl text-white shadow-sm"
                style={{ backgroundColor: activeTheme.primary }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-white">
              {activeHomeworks.length}
            </div>
          </div>

          {/* Card 3: Class Average */}
          <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl shadow-sm border border-stone-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span className="text-xs font-semibold">{getTranslation(lang, 'classAverage')}</span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-white">
                {classAvgFormatted}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300">
                / 10
              </span>
            </div>
          </div>

          {/* Card 4: Completion Rate */}
          <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl shadow-sm border border-stone-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span className="text-xs font-semibold">{getTranslation(lang, 'completionRate')}</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Call-to-Action: Fast Checking Mode Banner */}
      <div className="px-4 sm:px-6 max-w-6xl mx-auto">
        {activeHomeworks.length > 0 ? (
          <div className="bg-stone-900 text-white dark:bg-zinc-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Play className="w-3 h-3 fill-current" />
                <span>{getTranslation(lang, 'quickCheck')}</span>
              </div>
              <h3 className="text-lg font-bold font-display">{activeHomeworks[0].title}</h3>
              <p className="text-xs text-stone-300">
                Group: <span className="font-semibold text-white">{activeHomeworks[0].className}</span> • Subject:{' '}
                <span className="font-semibold text-white">{activeHomeworks[0].subject}</span>
              </p>
            </div>

            <button
              onClick={() => onOpenCheckingEngine(activeHomeworks[0].id)}
              className="h-13 px-6 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] min-h-[52px]"
            >
              <span>Darsda Baholash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-stone-800 dark:text-stone-100">
                {getTranslation(lang, 'noUpcomingDeadlines')}
              </h3>
              <p className="text-xs text-stone-500">
                Dars uchun yangi uy vazifasi yarating
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('homework')}
              className="h-12 px-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs rounded-xl flex items-center gap-2 min-h-[48px]"
            >
              <Plus className="w-4 h-4" />
              <span>{getTranslation(lang, 'createHomework')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Upcoming Deadlines (Reliability Backstop) */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold font-display text-base text-stone-900 dark:text-white">
                {getTranslation(lang, 'upcomingDeadlines')}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('homework')}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 min-h-[44px]"
            >
              <span>Barchasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeHomeworks.length > 0 ? (
              activeHomeworks.slice(0, 3).map((hw) => (
                <div
                  key={hw.id}
                  onClick={() => onOpenCheckingEngine(hw.id)}
                  className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-stone-100 dark:border-zinc-700/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {hw.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-medium">
                        {hw.className}
                      </span>
                      <span>• {hw.subject}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {hw.deadline}
                    </div>
                    <span className="text-[10px] text-stone-400">Muddat</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                {getTranslation(lang, 'noUpcomingDeadlines')}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Missing Homework Alert */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold font-display text-base text-stone-900 dark:text-white">
                {getTranslation(lang, 'missingHomeworkAlert')}
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {missingResults} ta holat
            </span>
          </div>

          <div className="space-y-3">
            {missingResults > 0 ? (
              results
                .filter((r) => r.completionStatus === 'MISSING')
                .slice(0, 3)
                .map((res) => {
                  const student = students.find((s) => s.id === res.studentId);
                  const hw = homeworks.find((h) => h.id === res.homeworkId);
                  return (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-white">
                          {student?.fullName || 'O\'quvchi'}
                        </div>
                        <div className="text-[11px] text-stone-500">{hw?.title || 'Vazifa'}</div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-200/60 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                        {res.isPresent ? 'Bajarilmadi' : 'Darsda Yo\'q (NB)'}
                      </span>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                Ajoyib! Barcha o'quvchilar vazifalarni bajarishmoqda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
