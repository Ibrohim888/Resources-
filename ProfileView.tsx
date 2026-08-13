import React, { useState } from 'react';
import { TeacherProfile, Student, AppLanguage, ThemeColor } from '../types';
import { getTranslation } from '../lib/translations';
import { themeConfigs } from '../lib/theme';
import {
  User,
  Building,
  Mail,
  Calendar,
  Languages,
  Palette,
  Moon,
  Sun,
  Monitor,
  Copy,
  Check,
  Share2,
  Key,
  Save
} from 'lucide-react';
import { RatingCalendarModal } from './RatingCalendarModal';

interface ProfileViewProps {
  profile: TeacherProfile;
  students: Student[];
  lang: AppLanguage;
  onUpdateProfile: (updated: Partial<TeacherProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  students,
  lang,
  onUpdateProfile,
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [centerName, setCenterName] = useState(profile.centerName);
  const [email, setEmail] = useState(profile.email);
  const [ratingDay, setRatingDay] = useState(profile.ratingStartDate);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const activeTheme = themeConfigs[profile.themeColor] || themeConfigs['forest_green'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName: fullName.trim(),
      centerName: centerName.trim(),
      email: email.trim(),
      ratingStartDate: ratingDay,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareCode = (student: Student) => {
    const text = `O'quvchi: ${student.fullName}\nID: ${student.id}\nMaxfiy Kod: ${student.secretCode}\nSinflari: ${student.classNames.join(', ')}`;
    if (navigator.share) {
      navigator.share({ title: student.fullName, text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Nusxalandi!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 pb-28">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700/80 space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center shadow-md"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.gradientEnd})`,
            }}
          >
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-stone-900 dark:text-white">
              {profile.fullName}
            </h2>
            <p className="text-xs text-stone-500">{profile.centerName}</p>
            <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 mt-1">
              O'qituvchi / Tizim Admini
            </span>
          </div>
        </div>
      </div>

      {/* Teacher Profile Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700/80 space-y-4">
        <h3 className="font-bold font-display text-base text-stone-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          <span>{getTranslation(lang, 'teacherProfile')}</span>
        </h3>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200/50 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{getTranslation(lang, 'profileSavedSuccess')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              {getTranslation(lang, 'fullName')}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          {/* Center Name */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              {getTranslation(lang, 'centerNameLabel')}
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              E-Pochta
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          {/* Rating Cycle Start Date */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              {getTranslation(lang, 'ratingStartDay')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <select
                value={ratingDay}
                onChange={(e) => setRatingDay(parseInt(e.target.value))}
                className="w-full h-12 pl-10 pr-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
              >
                {[1, 5, 10, 15, 20, 25].map((d) => (
                  <option key={d} value={d}>
                    Har oyning {d}-sanasi
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[48px]"
        >
          <Save className="w-4 h-4" />
          <span>{getTranslation(lang, 'saveProfile')}</span>
        </button>
      </form>

      {/* App Preferences & Color Theme */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700/80 space-y-5">
        <h3 className="font-bold font-display text-base text-stone-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          <span>{getTranslation(lang, 'settings')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Language Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-stone-400" />
              <span>{getTranslation(lang, 'appLanguage')}</span>
            </label>
            <select
              value={profile.language}
              onChange={(e) => onUpdateProfile({ language: e.target.value as AppLanguage })}
              className="w-full h-12 px-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
            >
              <option value="uz">O'zbekcha (O'zbek tili)</option>
              <option value="ru">Русский (Русский язык)</option>
              <option value="en">English (English language)</option>
            </select>
          </div>

          {/* Theme Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-stone-400" />
              <span>{getTranslation(lang, 'themeColor')}</span>
            </label>
            <select
              value={profile.themeColor}
              onChange={(e) => onUpdateProfile({ themeColor: e.target.value as ThemeColor })}
              className="w-full h-12 px-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none min-h-[48px]"
            >
              {(['forest_green', 'trust_blue', 'violet', 'warm_rose', 'teal'] as ThemeColor[]).map((tCode) => (
                <option key={tCode} value={tCode}>
                  {getTranslation(lang, themeConfigs[tCode].nameKey as any)}
                </option>
              ))}
            </select>
          </div>

          {/* Dark / Light / System Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              {profile.themeMode === 'system' ? (
                <Monitor className="w-4 h-4 text-emerald-500" />
              ) : profile.themeMode === 'dark' || profile.darkMode ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Ilova rejimi (Mode)</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-700 h-12 items-center">
              <button
                type="button"
                onClick={() => onUpdateProfile({ themeMode: 'system' })}
                className={`h-10 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  (profile.themeMode || 'system') === 'system'
                    ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
                title="Tizim sozlamalariga moslashish"
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tizim</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateProfile({ themeMode: 'light', darkMode: false })}
                className={`h-10 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  profile.themeMode === 'light'
                    ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
                title="Yorug' rejim"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Yorug'</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateProfile({ themeMode: 'dark', darkMode: true })}
                className={`h-10 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  profile.themeMode === 'dark'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
                title="Tungi rejim"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tungi</span>
              </button>
            </div>
          </div>

          {/* Rating Start Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Reyting boshlanish sanasi</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="w-full h-12 px-4 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between transition-colors min-h-[48px]"
            >
              <span>Har oyning {profile.ratingStartDate}-sana</span>
              <span className="text-[11px] bg-amber-200/80 dark:bg-amber-900 px-2 py-1 rounded-lg">
                Kalendar 📅
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Secret Access Codes List (For Student App & Parents) */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-stone-200/80 dark:border-zinc-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold font-display text-base text-stone-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <span>{getTranslation(lang, 'studentAccessCodesList')}</span>
          </h3>
          <span className="text-xs font-bold text-stone-400">
            {students.filter((s) => s.isActive).length} ta o'quvchi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-900/60 text-stone-400 font-bold border-b border-stone-100 dark:border-zinc-700">
              <tr>
                <th className="py-3 px-3">O'quvchi</th>
                <th className="py-3 px-3">Guruhlar</th>
                <th className="py-3 px-3">O'quvchi ID (Raqam)</th>
                <th className="py-3 px-3">Maxfiy Kod (Harf+Raqam)</th>
                <th className="py-3 px-3 text-right">Ulashish</th>
              </tr>
            </thead>
            <tbody className="divide-y border-stone-100 dark:border-zinc-700/60">
              {students.filter((s) => s.isActive).map((st) => (
                <tr key={st.id} className="hover:bg-stone-50/80 dark:hover:bg-zinc-700/30">
                  <td className="py-3 px-3 font-bold text-stone-900 dark:text-white">
                    {st.fullName}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {st.classNames.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-700 text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-white tracking-wider">
                    ID: {st.studentIdNumber}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {st.secretCode}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopyCode(`ID: ${st.studentIdNumber}\nKod: ${st.secretCode}`)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Nusxalash"
                      >
                        {copiedId === `ID: ${st.studentIdNumber}\nKod: ${st.secretCode}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleShareCode(st)}
                        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Ota-onaga yuborish"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Calendar Modal for Rating Start Date */}
      <RatingCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentStartDate={profile.ratingStartDate}
        onSave={(newDay) => {
          setRatingDay(newDay);
          onUpdateProfile({ ratingStartDate: newDay });
        }}
        lang={lang}
      />
    </div>
  );
};
