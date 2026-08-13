import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TeacherProfile,
  Student,
  Homework,
  Result,
  MonthlyArchive,
  AppLanguage,
  ThemeColor
} from './types';
import {
  getStoredProfile,
  saveProfile,
  getStoredStudents,
  saveStudents,
  getStoredHomeworks,
  saveHomeworks,
  getStoredResults,
  saveResults,
  getStoredArchives,
  saveArchives,
  syncReport3LanguagesToFirebase
} from './lib/storage';
import { themeConfigs } from './lib/theme';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { HomeworkView } from './components/HomeworkView';
import { CheckingEngineView } from './components/CheckingEngineView';
import { RatingsAndReportsView } from './components/RatingsAndReportsView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [profile, setProfile] = useState<TeacherProfile>(getStoredProfile());
  const [students, setStudents] = useState<Student[]>(getStoredStudents());
  const [homeworks, setHomeworks] = useState<Homework[]>(getStoredHomeworks());
  const [results, setResults] = useState<Result[]>(getStoredResults());
  const [archives, setArchives] = useState<MonthlyArchive[]>(getStoredArchives());

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeCheckingHwId, setActiveCheckingHwId] = useState<string | null>(null);

  // Dynamic dark/light/system theme handling
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const mode = profile.themeMode || (profile.darkMode ? 'dark' : 'light');
      let isDark = false;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'light') {
        isDark = false;
      } else {
        // system
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const handleSystemChange = (e: MediaQueryListEvent) => {
      const mode = profile.themeMode || 'system';
      if (mode === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [profile.themeMode, profile.darkMode]);

  // Sync all data & initial 3-language report to Firebase Firestore on boot for external apps (e.g. Student App)
  useEffect(() => {
    saveProfile(profile);
    saveStudents(students);
    saveHomeworks(homeworks);
    saveResults(results);
    saveArchives(archives);

    // Initial 3-language report snapshot
    const monthLabel = new Date().toISOString().slice(0, 7);
    const activeSt = students.filter(s => s.isActive);
    const rankings = activeSt.map((student) => {
      const stResults = results.filter((r) => r.studentId === student.id);
      const totalCount = stResults.length;
      const completedCount = stResults.filter((r) => r.completionStatus === 'COMPLETED').length;
      const compRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const validGrades = stResults.map((r) => r.grade).filter((g): g is number => g !== null && g !== undefined);
      const rawAvg = validGrades.length > 0 ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length : 0;
      const normalizedAvg = rawAvg > 10 ? rawAvg / 10 : rawAvg;
      return {
        studentId: student.id,
        studentName: student.fullName,
        studentIdNumber: student.studentIdNumber,
        secretCode: student.secretCode,
        classNames: student.classNames,
        avgGrade: normalizedAvg,
        completionRate: compRate,
      };
    }).sort((a, b) => b.avgGrade - a.avgGrade || b.completionRate - a.completionRate);

    syncReport3LanguagesToFirebase({
      monthLabel,
      centerName: profile.centerName || "O'quv Markazi",
      teacherName: profile.fullName || 'O\'qituvchi',
      studentsCount: activeSt.length,
      homeworksCount: homeworks.length,
      rankings,
    });
  }, []);

  // Persist Profile
  const handleUpdateProfile = (updated: Partial<TeacherProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  // Complete Onboarding
  const handleOnboardingComplete = (lang: AppLanguage, theme: ThemeColor) => {
    handleUpdateProfile({
      language: lang,
      themeColor: theme,
      isFirstLaunchCompleted: true,
    });
  };

  // Student Persistence
  const handleSaveStudent = (savedStudent: Student) => {
    const exists = students.some((s) => s.id === savedStudent.id);
    let newStudents: Student[];
    if (exists) {
      newStudents = students.map((s) => (s.id === savedStudent.id ? savedStudent : s));
    } else {
      newStudents = [savedStudent, ...students];
    }
    setStudents(newStudents);
    saveStudents(newStudents);
  };

  const handleSoftDeleteStudent = (studentId: string) => {
    const newStudents = students.map((s) =>
      s.id === studentId ? { ...s, isActive: false } : s
    );
    setStudents(newStudents);
    saveStudents(newStudents);
  };

  const handleHardDeleteStudent = (studentId: string) => {
    const newStudents = students.filter((s) => s.id !== studentId);
    const newResults = results.filter((r) => r.studentId !== studentId);
    setStudents(newStudents);
    setResults(newResults);
    saveStudents(newStudents);
    saveResults(newResults);
  };

  // Homework Persistence
  const handleSaveHomework = (savedHw: Homework) => {
    const exists = homeworks.some((h) => h.id === savedHw.id);
    let newHws: Homework[];
    if (exists) {
      newHws = homeworks.map((h) => (h.id === savedHw.id ? savedHw : h));
    } else {
      newHws = [savedHw, ...homeworks];
    }
    setHomeworks(newHws);
    saveHomeworks(newHws);
  };

  const handleDeleteHomework = (homeworkId: string) => {
    const newHws = homeworks.filter((h) => h.id !== homeworkId);
    const newResults = results.filter((r) => r.homeworkId !== homeworkId);
    setHomeworks(newHws);
    setResults(newResults);
    saveHomeworks(newHws);
    saveResults(newResults);
  };

  const handleArchiveHomework = (homeworkId: string) => {
    const newHws = homeworks.map((h) =>
      h.id === homeworkId ? { ...h, status: 'ARCHIVED' as const } : h
    );
    setHomeworks(newHws);
    saveHomeworks(newHws);
  };

  // Result Persistence
  const handleSaveResult = (savedResult: Result) => {
    const exists = results.some((r) => r.id === savedResult.id);
    let newResults: Result[];
    if (exists) {
      newResults = results.map((r) => (r.id === savedResult.id ? savedResult : r));
    } else {
      newResults = [savedResult, ...results];
    }
    setResults(newResults);
    saveResults(newResults);
  };

  // Monthly Archiving
  const handleArchiveMonthNow = () => {
    const activeStudents = students.filter((s) => s.isActive);
    const rankings = activeStudents
      .map((student) => {
        const studentResults = results.filter((r) => r.studentId === student.id);
        const totalCount = studentResults.length;
        const completedCount = studentResults.filter(
          (r) => r.completionStatus === 'COMPLETED'
        ).length;
        const compRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const validGrades = studentResults
          .map((r) => r.grade)
          .filter((g): g is number => g !== null && g !== undefined);
        const rawAvg =
          validGrades.length > 0
            ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
            : 0;

        return {
          studentId: student.id,
          studentName: student.fullName,
          classNames: student.classNames,
          avgGrade: rawAvg > 10 ? rawAvg / 10 : rawAvg,
          completionRate: compRate,
          totalSubmitted: completedCount,
        };
      })
      .sort((a, b) => b.avgGrade - a.avgGrade);

    const now = new Date();
    const newArchive: MonthlyArchive = {
      id: `arch_${Date.now()}`,
      monthLabel: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      archivedAt: Date.now(),
      rankings,
    };

    const newArchives = [newArchive, ...archives];
    setArchives(newArchives);
    saveArchives(newArchives);
    alert('Joriy oy muvaffaqiyatli arxivlandi!');
  };

  const activeTheme = themeConfigs[profile.themeColor] || themeConfigs['forest_green'];
  const activeCheckingHomework = homeworks.find((h) => h.id === activeCheckingHwId);

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 font-sans"
    >
      {/* Onboarding Flow: Mandatory First Launch Language & Theme Picker */}
      {!profile.isFirstLaunchCompleted && (
        <OnboardingModal
          currentLang={profile.language}
          currentTheme={profile.themeColor}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Main Header / Top Navigation Bar */}
      <Header
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenProfile={() => {
          setActiveCheckingHwId(null);
          setActiveTab('profile');
        }}
      />

      {/* Main View Content Area */}
      <main className="pt-1 px-2 sm:px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* If Checking Engine is active */}
          {activeCheckingHomework ? (
            <motion.div
              key={`checking_${activeCheckingHomework.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CheckingEngineView
                homework={activeCheckingHomework}
                students={students}
                results={results}
                lang={profile.language}
                onSaveResult={handleSaveResult}
                onBack={() => setActiveCheckingHwId(null)}
              />
            </motion.div>
          ) : (
            <React.Fragment key={activeTab}>
              {activeTab === 'dashboard' && (
                <motion.div
                  key="tab_dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DashboardView
                    profile={profile}
                    students={students}
                    homeworks={homeworks}
                    results={results}
                    onOpenCheckingEngine={(hwId) => setActiveCheckingHwId(hwId)}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                </motion.div>
              )}

              {activeTab === 'students' && (
                <motion.div
                  key="tab_students"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <StudentsView
                    students={students}
                    results={results}
                    lang={profile.language}
                    onSaveStudent={handleSaveStudent}
                    onSoftDeleteStudent={handleSoftDeleteStudent}
                    onHardDeleteStudent={handleHardDeleteStudent}
                  />
                </motion.div>
              )}

              {activeTab === 'homework' && (
                <motion.div
                  key="tab_homework"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <HomeworkView
                    homeworks={homeworks}
                    students={students}
                    results={results}
                    lang={profile.language}
                    onOpenCheckingEngine={(hwId) => setActiveCheckingHwId(hwId)}
                    onSaveHomework={handleSaveHomework}
                    onDeleteHomework={handleDeleteHomework}
                    onArchiveHomework={handleArchiveHomework}
                  />
                </motion.div>
              )}

              {activeTab === 'rating' && (
                <motion.div
                  key="tab_rating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RatingsAndReportsView
                    profile={profile}
                    students={students}
                    homeworks={homeworks}
                    results={results}
                    archives={archives}
                    lang={profile.language}
                    onArchiveMonthNow={handleArchiveMonthNow}
                    onUpdateProfile={handleUpdateProfile}
                  />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="tab_profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileView
                    profile={profile}
                    students={students}
                    lang={profile.language}
                    onUpdateProfile={handleUpdateProfile}
                  />
                </motion.div>
              )}
            </React.Fragment>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation Shell */}
      <BottomNav
        activeTab={activeCheckingHwId ? 'homework' : activeTab}
        onTabChange={(tab) => {
          setActiveCheckingHwId(null);
          setActiveTab(tab);
        }}
        lang={profile.language}
        theme={profile.themeColor}
      />
    </div>
  );
}
