import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, Check, Clock } from 'lucide-react';
import { AppLanguage } from '../types';

interface RatingCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate: number;
  onSave: (day: number) => void;
  lang?: AppLanguage;
}

export const RatingCalendarModal: React.FC<RatingCalendarModalProps> = ({
  isOpen,
  onClose,
  currentStartDate,
  onSave,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(currentStartDate || 1);

  if (!isOpen) return null;

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
  const quickPresets = [1, 5, 10, 15, 20, 25];

  const handleSave = () => {
    onSave(selectedDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900 dark:text-white">
                Reyting boshlanish sanasi
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Oylik reyting va statistikalar hisoblanish sanasini tanlang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Day Display */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-sm font-bold">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Tanlangan sana:</span>
          </div>
          <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl shadow-xs border border-amber-200 dark:border-amber-800">
            Har oyning {selectedDay}-sanasida
          </span>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 dark:text-stone-400">
            Tezkor tanlov:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedDay === day
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-105'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-700'
                }`}
              >
                {day}-kun
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 pb-1">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {daysInMonth.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md scale-105 ring-2 ring-amber-300 dark:ring-amber-600'
                      : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-zinc-700 hover:scale-105'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
        </div>
      </div>
    </div>
  );
};
