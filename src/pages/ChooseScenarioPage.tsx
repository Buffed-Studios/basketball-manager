import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Typography } from '@material-tailwind/react';
import {
  FolderOpenIcon,
  PlusCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { getScenarios, createScenario } from '../services/scenarioApi';
import type { Scenario } from '../services/types';

const ACTIVE_SCENARIO_KEY = 'bm_active_scenario';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ChooseScenarioPage() {
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    getScenarios()
      .then(setScenarios)
      .catch(() => setLoadError('Failed to load your scenarios. Please refresh.'))
      .finally(() => setLoadingScenarios(false));
  }, []);

  function selectScenario(scenario: Scenario) {
    sessionStorage.setItem(ACTIVE_SCENARIO_KEY, JSON.stringify(scenario));
    navigate('/dashboard');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || creating) return;
    setCreateError(null);
    setCreating(true);
    try {
      const created = await createScenario({ name: trimmed });
      selectScenario(created);
    } catch {
      setCreateError('Failed to create scenario. Please try again.');
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 mb-4">
            <TrophyIcon className="h-8 w-8 text-orange-400" />
          </div>
          <Typography variant="h3" className="!text-white !font-bold">
            Choose Your Scenario
          </Typography>
          <Typography variant="paragraph" className="!text-gray-400 mt-2">
            Pick up where you left off, or start a brand-new franchise.
          </Typography>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT — existing scenarios */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <FolderOpenIcon className="h-5 w-5 text-orange-400" />
              <Typography variant="h6" className="!text-white !font-semibold">
                Your Saves
              </Typography>
            </div>

            {loadingScenarios && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-orange-400" />
                <p className="text-sm text-gray-500">Loading scenarios…</p>
              </div>
            )}

            {!loadingScenarios && loadError && (
              <div className="flex items-start gap-3 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{loadError}</p>
              </div>
            )}

            {!loadingScenarios && !loadError && scenarios.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <FolderOpenIcon className="h-10 w-10 text-gray-600" />
                <p className="text-sm text-gray-500">No saves yet.</p>
                <p className="text-xs text-gray-600">Create your first scenario to get started.</p>
              </div>
            )}

            {!loadingScenarios && !loadError && scenarios.length > 0 && (
              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectScenario(s)}
                    className="group w-full text-left rounded-xl bg-gray-800 border border-gray-700 hover:border-orange-500 hover:bg-gray-750 transition-all p-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate group-hover:text-orange-300 transition-colors">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <TrophyIcon className="h-3.5 w-3.5" />
                            Season {s.currentYear}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            {formatDate(s.createdAt)}
                          </span>
                        </div>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-600 group-hover:text-orange-400 transition-colors shrink-0 ml-3" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — create new scenario */}
          <div className="rounded-2xl bg-gray-900 border border-gray-800 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <PlusCircleIcon className="h-5 w-5 text-orange-400" />
              <Typography variant="h6" className="!text-white !font-semibold">
                New Scenario
              </Typography>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Start a fresh franchise from scratch. Give it a name you'll recognise.
            </p>

            {createError && (
              <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{createError}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div>
                <Typography variant="small" className="mb-1.5 !text-gray-300 !font-medium">
                  Scenario Name
                </Typography>
                <Input
                  type="text"
                  size="lg"
                  placeholder="e.g. My Lakers Dynasty"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  maxLength={64}
                  className="!border-gray-700 !bg-gray-800 !text-white placeholder:!text-gray-500 focus:!border-orange-500"
                  labelProps={{ className: 'hidden' }}
                  containerProps={{ className: 'min-w-0' }}
                />
              </div>

              <Button
                type="submit"
                disabled={!newName.trim() || creating}
                fullWidth
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed normal-case text-base font-semibold py-3"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating…
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-5 w-5" />
                    Create &amp; Play
                  </>
                )}
              </Button>
            </form>

            {/* Divider + info */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-600 text-center">
                You can manage multiple scenarios and switch between them at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
