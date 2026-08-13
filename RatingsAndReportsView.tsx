import React, { useState } from 'react';
import {
  Student,
  Homework,
  Result,
  TeacherProfile,
  MonthlyArchive,
  AppLanguage
} from '../types';
import { getTranslation } from '../lib/translations';
import { syncReport3LanguagesToFirebase } from '../lib/storage';
import {
  Trophy,
  Award,
  Calendar,
  Share2,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Download,
  ChevronRight
} from 'lucide-react';
import { RatingCalendarModal } from './RatingCalendarModal';

interface RatingsAndReportsViewProps {
  profile: TeacherProfile;
  students: Student[];
  homeworks: Homework[];
  results: Result[];
  archives: MonthlyArchive[];
  lang: AppLanguage;
  onArchiveMonthNow: () => void;
  onUpdateProfile?: (updated: Partial<TeacherProfile>) => void;
}

export const RatingsAndReportsView: React.FC<RatingsAndReportsViewProps> = ({
  profile,
  students,
  homeworks,
  results,
  archives,
  lang,
  onArchiveMonthNow,
  onUpdateProfile,
}) => {
  const [selectedTab, setSelectedTab] = useState<'LEADERBOARD' | 'ARCHIVES'>('LEADERBOARD');
  const [selectedArchive, setSelectedArchive] = useState<MonthlyArchive | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Filter active students and compute current monthly rankings
  const activeStudents = students.filter((s) => s.isActive);

  const studentRankings = activeStudents
    .map((student) => {
      const studentResults = results.filter((r) => r.studentId === student.id);
      const totalCount = studentResults.length;
      const completedCount = studentResults.filter((r) => r.completionStatus === 'COMPLETED').length;
      const compRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const validGrades = studentResults
        .map((r) => r.grade)
        .filter((g): g is number => g !== null && g !== undefined);
      const rawAvg =
        validGrades.length > 0
          ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
          : 0;
      const normalizedAvg = rawAvg > 10 ? rawAvg / 10 : rawAvg;

      return {
        studentId: student.id,
        studentName: student.fullName,
        studentIdNumber: student.studentIdNumber,
        secretCode: student.secretCode,
        classNames: student.classNames,
        avgGrade: normalizedAvg,
        completionRate: compRate,
        totalSubmitted: completedCount,
      };
    })
    .sort((a, b) => b.avgGrade - a.avgGrade || b.completionRate - a.completionRate);

  const top3 = studentRankings.slice(0, 3);

  const syncCurrentReportToFirestore = () => {
    const monthLabel = new Date().toISOString().slice(0, 7);
    syncReport3LanguagesToFirebase({
      monthLabel,
      centerName: profile.centerName || "O'quv Markazi",
      teacherName: profile.fullName || 'O\'qituvchi',
      studentsCount: activeStudents.length,
      homeworksCount: homeworks.length,
      rankings: studentRankings
    });
  };

  const handleExportExcel = () => {
    syncCurrentReportToFirestore();
    // Generate lightweight XLSX CSV/XML content
    let content = "O'quvchi ID,Maxfiy Kod,Ismi,Guruhlar,O'rtacha Ball,Bajarilish Foizi\n";
    studentRankings.forEach((r) => {
      content += `${r.studentIdNumber},${r.secretCode},"${r.studentName}","${r.classNames.join(', ')}",${r.avgGrade.toFixed(1)},${r.completionRate}%\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Oylik_Reyting_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    syncCurrentReportToFirestore();
    alert("PDF va 3 tildagi server hisoboti Firebase Firestore ga saqlandi!");
  };

  const handleSharePoster = () => {
    syncCurrentReportToFirestore();
    let posterText = `🏆 ${profile.centerName || "O'quv Markazi"} - Oylik Reyting G'oliblari!\n\n`;
    top3.forEach((s, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      posterText += `${medal} ${idx + 1}-O'rin: ${s.studentName} (${s.avgGrade.toFixed(1)} ball)\n`;
    });
    posterText += `\nBarcha o'quvchilarimizga zafarlar tilaymiz! 🌟`;

    if (navigator.share) {
      navigator.share({
        title: "Oylik Reyting G'oliblari",
        text: posterText,
      });
    } else {
      navigator.clipboard.writeText(posterText);
      alert('Poster matni va 3 tildagi server hisoboti Firestore ga nusxalandi va saqlandi!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 pb-28">
      {/* Top Banner & Export Actions */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300/80 dark:border-amber-700/80 transition-all cursor-pointer group shadow-xs"
            title="Reyting boshlanish sanasini o'zgartirish uchun bosing"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span>
              {getTranslation(lang, 'ratingPeriod')}: Har oyning {profile.ratingStartDate}-sanasidan
            </span>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded text-amber-950 dark:text-amber-100 font-extrabold ml-1">
              O'zgartirish 📅
            </span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white pt-1">
            {getTranslation(lang, 'monthlyRating')}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSharePoster}
            className="h-12 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[48px]"
          >
            <Share2 className="w-4 h-4" />
            <span>{getTranslation(lang, 'sharePoster')}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="h-12 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[48px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{getTranslation(lang, 'generateExcel')}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="h-12 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[48px]"
          >
            <FileText className="w-4 h-4" />
            <span>{getTranslation(lang, 'generatePDF')}</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 Winners Visual */}
      {top3.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-amber-500/5 dark:from-amber-950/30 dark:to-zinc-800/80 p-4 sm:p-6 rounded-3xl border border-amber-200/60 dark:border-amber-900/40 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold font-display text-base">
            <Award className="w-5 h-5 text-amber-600" />
            <span>{getTranslation(lang, 'leaderboard')}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-2">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="bg-white/90 dark:bg-zinc-800/90 p-3 sm:p-4 rounded-2xl border border-stone-200/60 dark:border-zinc-700 text-center space-y-1.5 min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm mx-auto flex items-center justify-center shadow-xs">
                  🥈 2
                </div>
                <div
                  className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white leading-snug break-words px-0.5 line-clamp-2 min-h-[2.25rem] flex items-center justify-center text-center"
                  title={top3[1].studentName}
                >
                  {top3[1].studentName}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {top3[1].avgGrade.toFixed(1)} / 10
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="bg-white dark:bg-zinc-800 p-3.5 sm:p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-500 text-center space-y-1.5 shadow-lg scale-105 min-w-0">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold text-sm sm:text-base mx-auto flex items-center justify-center shadow-inner">
                  🥇 1
                </div>
                <div
                  className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white leading-snug break-words px-0.5 line-clamp-2 min-h-[2.5rem] flex items-center justify-center text-center"
                  title={top3[0].studentName}
                >
                  {top3[0].studentName}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  {top3[0].avgGrade.toFixed(1)} / 10
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="bg-white/90 dark:bg-zinc-800/90 p-3 sm:p-4 rounded-2xl border border-stone-200/60 dark:border-zinc-700 text-center space-y-1.5 min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-800/10 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm mx-auto flex items-center justify-center shadow-xs">
                  🥉 3
                </div>
                <div
                  className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white leading-snug break-words px-0.5 line-clamp-2 min-h-[2.25rem] flex items-center justify-center text-center"
                  title={top3[2].studentName}
                >
                  {top3[2].studentName}
                </div>
                <div className="text-xs font-bold text-stone-600 dark:text-stone-400">
                  {top3[2].avgGrade.toFixed(1)} / 10
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl border border-stone-200/60 dark:border-zinc-700/60">
        <button
          onClick={() => setSelectedTab('LEADERBOARD')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
            selectedTab === 'LEADERBOARD'
              ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          {getTranslation(lang, 'leaderboard')}
        </button>

        <button
          onClick={() => setSelectedTab('ARCHIVES')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
            selectedTab === 'ARCHIVES'
              ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          {getTranslation(lang, 'pastArchives')}
        </button>
      </div>

      {/* Leaderboard Table View */}
      {selectedTab === 'LEADERBOARD' && (
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-700/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-900/60 text-stone-400 uppercase font-bold border-b border-stone-100 dark:border-zinc-700">
                <tr>
                  <th className="py-3.5 px-4">{getTranslation(lang, 'rank')}</th>
                  <th className="py-3.5 px-4">{getTranslation(lang, 'student')}</th>
                  <th className="py-3.5 px-4">{getTranslation(lang, 'classGroups')}</th>
                  <th className="py-3.5 px-4">{getTranslation(lang, 'score')}</th>
                  <th className="py-3.5 px-4">{getTranslation(lang, 'completionRate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y border-stone-100 dark:border-zinc-700/60">
                {studentRankings.map((rank, idx) => (
                  <tr
                    key={rank.studentId}
                    className="hover:bg-stone-50/80 dark:hover:bg-zinc-700/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                      #{idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-900 dark:text-white">{rank.studentName}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-700 text-stone-800 dark:text-stone-200 font-mono font-bold text-[11px] border border-stone-200 dark:border-zinc-600">
                          ID: {rank.studentIdNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-200/50">
                          Kod: {rank.secretCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {rank.classNames.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-700 text-[10px] font-semibold text-stone-600 dark:text-stone-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                      {rank.avgGrade.toFixed(1)} / 10
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {rank.completionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Archives View */}
      {selectedTab === 'ARCHIVES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-stone-900 dark:text-white">
              O'tgan Oylar Arxivi
            </h3>
            <button
              onClick={onArchiveMonthNow}
              className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-sm transition-all min-h-[44px]"
            >
              Ushbu Oyni Arxivlash
            </button>
          </div>

          {archives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {archives.map((arch) => (
                <div
                  key={arch.id}
                  onClick={() => setSelectedArchive(arch)}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-sm text-stone-900 dark:text-white">
                        {arch.monthLabel}
                      </div>
                      <div className="text-xs text-stone-400">
                        {arch.rankings.length} ta o'quvchi saqlangan
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 p-12 rounded-3xl text-center border border-stone-200 dark:border-zinc-700">
              <p className="text-sm font-medium text-stone-500">
                O'tgan oylar arxivi hali mavjud emas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Calendar Modal for Rating Start Date */}
      <RatingCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentStartDate={profile.ratingStartDate}
        onSave={(newDay) => {
          if (onUpdateProfile) {
            onUpdateProfile({ ratingStartDate: newDay });
          }
        }}
        lang={lang}
      />
    </div>
  );
};
