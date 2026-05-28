import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SunIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  BoltIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { Scenario } from '../services/types';

const ACTIVE_SCENARIO_KEY = 'bm_active_scenario';

type Section =
  | 'offseason' | 'training-camp' | 'draft' | 'regular-season' | 'playoffs' | 'awards'
  | 'events' | 'free-agents'
  | 'roster' | 'budget' | 'trade';

const FIRST_SEASON_DISABLED = new Set<Section>(['offseason', 'training-camp', 'draft']);

const SEASON_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'offseason', label: 'Offseason', icon: SunIcon },
  { id: 'training-camp', label: 'Training Camp', icon: FireIcon },
  { id: 'draft', label: 'Draft', icon: ClipboardDocumentListIcon },
  { id: 'regular-season', label: 'Regular Season', icon: TrophyIcon },
  { id: 'playoffs', label: 'Playoffs', icon: BoltIcon },
  { id: 'awards', label: 'Awards', icon: StarIcon },
];

const TEAM_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'roster', label: 'Roster', icon: UsersIcon },
  { id: 'budget', label: 'Budget', icon: BanknotesIcon },
  { id: 'trade', label: 'Trade', icon: ArrowsRightLeftIcon },
];

const LEAGUE_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'events', label: 'Events', icon: CalendarDaysIcon },
  { id: 'free-agents', label: 'Free Agents', icon: UserGroupIcon },
];

const ALL_ITEMS = [...SEASON_ITEMS, ...LEAGUE_ITEMS, ...TEAM_ITEMS];

function Placeholder({ section, season }: Readonly<{ section: Section; season: number }>) {
  const item = ALL_ITEMS.find((n) => n.id === section);
  if (!item) return null;
  const Icon = item.icon;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20">
        <Icon className="h-10 w-10 text-orange-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">{item.label}</h2>
      <p className="text-gray-500 text-sm max-w-xs">
        Season {season} — {item.label} content will appear here.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('offseason');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load scenario from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem(ACTIVE_SCENARIO_KEY);
    if (!raw) {
      navigate('/choose-scenario', { replace: true });
      return;
    }
    try {
      const s: Scenario = JSON.parse(raw);
      setScenario(s);
      setSelectedSeason(s.currentYear);
    } catch {
      navigate('/choose-scenario', { replace: true });
    }
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!scenario) return null;

  const maxSeason = scenario.currentYear;
  const seasons = Array.from({ length: maxSeason }, (_, i) => maxSeason - i); // current → oldest

  function selectSeason(s: number) {
    setSelectedSeason(s);
    if (s === 1 && FIRST_SEASON_DISABLED.has(activeSection)) {
      setActiveSection('regular-season');
    }
  }

  function decrement() {
    selectSeason(Math.max(1, selectedSeason - 1));
    setDropdownOpen(false);
  }

  function increment() {
    selectSeason(Math.min(maxSeason, selectedSeason + 1));
    setDropdownOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 overflow-hidden">

        {/* Scenario info */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-800">
          <button
            onClick={() => navigate('/choose-scenario')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Change Scenario
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-0.5">
            Active Save
          </p>
          <p className="text-white font-bold truncate text-sm">{scenario.name}</p>
        </div>

        {/* Season selector */}
        <div className="px-4 py-4 border-b border-gray-800" ref={dropdownRef}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Season
          </p>

          <div className="flex items-center gap-1">
            {/* Decrement */}
            <button
              onClick={decrement}
              disabled={selectedSeason <= 1}
              aria-label="Previous season"
              className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            {/* Dropdown trigger */}
            <div className="relative flex-1">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-1 px-2.5 h-7 rounded-md bg-gray-800 border border-gray-700 hover:border-orange-500 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <span>Season {selectedSeason}</span>
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform shrink-0 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg bg-gray-800 border border-gray-700 shadow-xl overflow-hidden">
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {seasons.map((s) => (
                      <li key={s}>
                        <button
                          onClick={() => {
                            selectSeason(s);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            s === selectedSeason
                              ? 'bg-orange-500/20 text-orange-300 font-semibold'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {s === maxSeason ? (
                            <span>
                              Season {s}{' '}
                              <span className="text-xs text-orange-400 font-normal">Current</span>
                            </span>
                          ) : (
                            `Season ${s}`
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Increment */}
            <button
              onClick={increment}
              disabled={selectedSeason >= maxSeason}
              aria-label="Next season"
              className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-4">
          {/* Scenario group */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 px-1">Scenario</p>
            <div className="flex flex-col gap-1">
              {SEASON_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                const disabled = selectedSeason === 1 && FIRST_SEASON_DISABLED.has(id);
                let navClass: string;
                if (disabled) { 
                  navClass = 'text-gray-600 border border-transparent cursor-not-allowed opacity-40';
                } else if (active) {
                  navClass = 'bg-orange-500/15 text-orange-300 border border-orange-500/30';
                } else {
                  navClass = 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent';
                }
                return (
                  <button
                    key={id}
                    onClick={() => !disabled && setActiveSection(id)}
                    disabled={disabled}
                    title={disabled ? 'Not available in Season 1' : undefined}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${navClass}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-400' : ''}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* League group */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 px-1">League</p>
            <div className="flex flex-col gap-1">
              {LEAGUE_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                const navClass = active
                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent';
                return (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${navClass}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-400' : ''}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team group */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 px-1">Team</p>
            <div className="flex flex-col gap-1">
              {TEAM_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                const navClass = active
                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent';
                return (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${navClass}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-400' : ''}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">Basketball Manager</p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-white font-semibold">
              {ALL_ITEMS.find((n) => n.id === activeSection)?.label}
            </h1>
            <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
              Season {selectedSeason}
              {selectedSeason === maxSeason && (
                <span className="ml-1 text-orange-400">· Current</span>
              )}
            </span>
          </div>
          <p className="text-sm text-gray-500 hidden sm:block">{scenario.name}</p>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <Placeholder section={activeSection} season={selectedSeason} />
        </div>
      </main>
    </div>
  );
}
