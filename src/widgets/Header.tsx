'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Megaphone, BellRing, RefreshCw, UserPlus, Menu, X } from 'lucide-react';

interface Props {
  loading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenBroadcastModal: () => void;
  onRemind: () => void;
}

export const Header: React.FC<Props> = ({
  loading,
  onRefresh,
  onOpenAddModal,
  onOpenBroadcastModal,
  onRemind,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 relative">
        {/*
          Адаптивная сетка:
          - До 1150px (до xl): заголовок сверху, аккуратный ряд кнопок переносится снизу с одинаковой фиксированной высотой h-9.5
          - От 1150px (xl): заголовок слева, кнопки справа в один ряд
        */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Левый блок: логотип + название + бейджи */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                Н
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-base sm:text-lg leading-tight text-slate-900 whitespace-nowrap">
                    СпортТовары: Пульс Новичка
                  </h1>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                    Адаптация & Удержание
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Realtime
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Система раннего предупреждения увольнений на испытательном сроке
                </p>
              </div>
            </div>

            {/* Кнопка открытия меню на самых маленьких экранах (< sm) */}
            <div className="flex sm:hidden items-center gap-2" ref={menuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 text-xs font-medium shadow-xs"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span>Действия</span>
              </button>

              {/* ПЛАВАЮЩЕЕ МЕНЮ (НАД КОНТЕНТОМ, НЕ СДВИГАЕТ ИНТЕРФЕЙС) */}
              {mobileMenuOpen && (
                <div className="absolute top-full right-4 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { onOpenBroadcastModal(); setMobileMenuOpen(false); }}
                    className="h-10 flex items-center gap-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-medium cursor-pointer transition w-full"
                  >
                    <Megaphone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Задача для всех</span>
                  </button>
                  <button
                    onClick={() => { onRemind(); setMobileMenuOpen(false); }}
                    className="h-10 flex items-center gap-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium cursor-pointer transition w-full"
                  >
                    <BellRing className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Напомнить</span>
                  </button>
                  <button
                    onClick={() => { onRefresh(); setMobileMenuOpen(false); }}
                    className="h-10 flex items-center gap-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer transition w-full border border-slate-100"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Обновить данные</span>
                  </button>
                  <button
                    onClick={() => { onOpenAddModal(); setMobileMenuOpen(false); }}
                    className="h-10 flex items-center gap-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer transition w-full shadow-xs"
                  >
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    <span>+ Новый сотрудник</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/*
            Ряд кнопок для экранов от 640px (sm) до 1150px (xl) и выше:
            - Все кнопки имеют строго одинаковую фиксированную высоту h-9.5 (38px)
            - Никаких переносов текста внутри кнопки (whitespace-nowrap)
            - Не сжимаются (flex-shrink-0)
            - При необходимости аккуратно переносятся на вторую строку без ломки интерфейса
          */}
          <div className="hidden sm:flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenBroadcastModal}
              className="h-9.5 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs sm:text-sm font-medium transition shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <Megaphone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Задача для всех</span>
            </button>

            <button
              onClick={onRemind}
              className="h-9.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-medium transition shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <BellRing className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Напомнить</span>
            </button>

            <button
              onClick={onRefresh}
              className="h-9.5 w-9.5 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200 cursor-pointer flex items-center justify-center flex-shrink-0 shadow-xs"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onOpenAddModal}
              className="h-9.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition shadow-sm cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>+ Новый сотрудник</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
