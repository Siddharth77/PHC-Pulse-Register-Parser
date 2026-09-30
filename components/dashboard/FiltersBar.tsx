'use client';

import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { SupplyFilters, RiskLevel, DiseaseClass } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

interface FiltersBarProps {
  filters: SupplyFilters;
  onFilterChange: (newFilters: SupplyFilters) => void;
  currentLanguage: LanguageCode;
  availableDistricts: string[];
  availableMedicines: string[];
}

export function FiltersBar({
  filters,
  onFilterChange,
  currentLanguage,
  availableDistricts,
  availableMedicines,
}: FiltersBarProps) {
  const t = TRANSLATIONS[currentLanguage].filters;
  const tRisks = TRANSLATIONS[currentLanguage].risks;
  const tClasses = TRANSLATIONS[currentLanguage].diseaseClasses;

  const activeCount = Object.values(filters).filter(
    (v) => v && v !== 'All' && v.trim() !== ''
  ).length;

  const handleReset = () => {
    onFilterChange({
      state: 'All',
      district: 'All',
      medicine: 'All',
      disease_class: 'All',
      risk_level: 'All',
      search: '',
    });
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t.title}
          </span>
          {activeCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800/60">
              {activeCount} {t.activeFilters}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline min-h-[36px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.reset}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* State Filter */}
        <div>
          <label htmlFor="filter-state" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t.state}
          </label>
          <select
            id="filter-state"
            value={filters.state || 'All'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                state: e.target.value,
                district: 'All', // reset district on state switch
              })
            }
            className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
          >
            <option value="All">{t.allStates}</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Kerala">Kerala</option>
            <option value="Assam">Assam</option>
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label htmlFor="filter-district" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t.district}
          </label>
          <select
            id="filter-district"
            value={filters.district || 'All'}
            onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
            className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
          >
            <option value="All">{t.allDistricts}</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Medicine Filter */}
        <div>
          <label htmlFor="filter-med" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t.medicine}
          </label>
          <select
            id="filter-med"
            value={filters.medicine || 'All'}
            onChange={(e) => onFilterChange({ ...filters, medicine: e.target.value })}
            className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
          >
            <option value="All">{t.allMedicines}</option>
            {availableMedicines.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Disease Class Filter */}
        <div>
          <label htmlFor="filter-class" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t.diseaseClass}
          </label>
          <select
            id="filter-class"
            value={filters.disease_class || 'All'}
            onChange={(e) => onFilterChange({ ...filters, disease_class: e.target.value })}
            className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
          >
            <option value="All">{t.allClasses}</option>
            <option value="fever_vector">{tClasses.fever_vector}</option>
            <option value="diarrhoeal">{tClasses.diarrhoeal}</option>
            <option value="respiratory">{tClasses.respiratory}</option>
            <option value="chronic_metabolic">{tClasses.chronic_metabolic}</option>
            <option value="emergency_trauma">{tClasses.emergency_trauma}</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <label htmlFor="filter-risk" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t.riskLevel}
          </label>
          <select
            id="filter-risk"
            value={filters.risk_level || 'All'}
            onChange={(e) => onFilterChange({ ...filters, risk_level: e.target.value })}
            className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
          >
            <option value="All">{t.allRisks}</option>
            <option value="Critical">{tRisks.Critical}</option>
            <option value="High">{tRisks.High}</option>
            <option value="Medium">{tRisks.Medium}</option>
            <option value="Low">{tRisks.Low}</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label htmlFor="filter-search" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3.5 text-slate-400" />
            <input
              id="filter-search"
              type="text"
              placeholder="PHC or medicine..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full pl-8 pr-2 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
