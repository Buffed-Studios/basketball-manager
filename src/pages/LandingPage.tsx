import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrophyIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BoltIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline';
import { checkApiStatus, type ApiStatus } from '../utils/serverStatus';

// ---------------------------------------------------------------------------
// Server Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ApiStatus }) {
  if (status === 'checking') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300 animate-pulse">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        Checking server…
      </span>
    );
  }

  if (status === 'online') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-400 border border-green-700">
        <SignalIcon className="h-4 w-4" />
        Server Online
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-900/50 text-red-400 border border-red-700">
      <SignalSlashIcon className="h-4 w-4" />
      Server Offline
    </span>
  );
}

// ---------------------------------------------------------------------------
// Feature Card
// ---------------------------------------------------------------------------

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-800 border border-gray-700 p-6 hover:border-orange-500 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    checkApiStatus().then(setApiStatus);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, #f97316, transparent)',
          }}
        />

        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 flex justify-center">
            <StatusBadge status={apiStatus} />
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Build Your{' '}
            <span className="text-orange-400">Dynasty</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Take the head coach's seat. Draft players, craft game strategies, simulate or watch
            live play-by-play games, and fight your way to a championship — then do it all again.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-400 transition-colors"
            >
              <UserPlusIcon className="h-5 w-5" />
              Start Your Scenario
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
            >
              <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">Everything You Need to Win</h2>
        <p className="mb-12 text-center text-gray-300">
          Manage every aspect of your franchise from the front office to the floor.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<UserGroupIcon className="h-6 w-6" />}
            title="Roster Management"
            description="Scout free agents, build your ideal lineup, and balance your team's strengths across positions."
          />
          <FeatureCard
            icon={<CalendarDaysIcon className="h-6 w-6" />}
            title="Full Season Schedules"
            description="Generate complete round-robin seasons. Track standings, win streaks, and playoff positioning in real time."
          />
          <FeatureCard
            icon={<BoltIcon className="h-6 w-6" />}
            title="Live Play-by-Play"
            description="Watch games unfold event by event over a live WebSocket stream, or skip ahead for an instant result."
          />
          <FeatureCard
            icon={<TrophyIcon className="h-6 w-6" />}
            title="Endless Scenarios"
            description="Run multiple franchise scenarios simultaneously. Chase championships year after year until you choose to retire."
          />
        </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">How It Works</h2>
          <ol className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create a Scenario',
                body: 'Start a new franchise scenario, browse all the teams, and pick the one you want to manage.',
              },
              {
                step: '02',
                title: 'Build Your Roster',
                body: 'Sign free agents, review player stats, and shape a squad that fits your strategy.',
              },
              {
                step: '03',
                title: 'Play the Season',
                body: 'Generate your season schedule, play or simulate games, and chase the championship.',
              },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex flex-col gap-3">
                <span className="text-4xl font-extrabold text-orange-500">{step}</span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA footer */}
      <section className="bg-gray-950 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to coach?</h2>
        <p className="mt-3 text-gray-300">Create a free account and start your first scenario today.</p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-orange-400 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5" />
          Get Started — It's Free
        </Link>
      </section>
    </div>
  );
}
