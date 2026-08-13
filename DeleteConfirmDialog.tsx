import React from 'react';
import { AppLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { AlertTriangle, Archive, Trash2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  hasResults?: boolean;
  lang: AppLanguage;
  onConfirmDelete: () => void;
  onArchiveInstead?: () => void;
  onClose: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  hasResults = false,
  lang,
  onConfirmDelete,
  onArchiveInstead,
  onClose,
}) => {
  if (!isOpen) return null;

  const defaultTitle = getTranslation(lang, 'deleteHomeworkConfirmTitle');
  const defaultDesc = getTranslation(lang, 'deleteHomeworkConfirmDesc');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold font-display text-stone-900 dark:text-white">
            {title || defaultTitle}
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {description || defaultDesc}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          {hasResults && onArchiveInstead && (
            <button
              onClick={() => {
                onArchiveInstead();
                onClose();
              }}
              className="w-full h-13 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[52px]"
            >
              <Archive className="w-4 h-4" />
              <span>{getTranslation(lang, 'archiveInstead')}</span>
            </button>
          )}

          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="w-full h-13 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] min-h-[52px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>{getTranslation(lang, 'deleteAnyway')}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full h-12 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 font-medium text-sm rounded-xl transition-all min-h-[48px]"
          >
            {getTranslation(lang, 'cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
