import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Typography } from '@material-tailwind/react';
import {
  ArrowRightEndOnRectangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { login } from '../services/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('[LoginPage] login error:', err);
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401 || status === 400) {
        setError('Invalid username or password. Please try again.');
      } else {
        setError('Unable to sign in. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block mb-4 text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors">
              🏀 Basketball Manager
            </Link>
            <Typography variant="h4" className="!text-white !font-bold">
              Welcome back
            </Typography>
            <Typography variant="small" className="!text-gray-400 mt-1">
              Sign in to continue to your scenarios
            </Typography>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <Typography variant="small" className="mb-1.5 !text-gray-300 !font-medium">
                Username
              </Typography>
              <Input
                type="text"
                size="lg"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="!border-gray-700 !bg-gray-800 !text-white placeholder:!text-gray-500 focus:!border-orange-500"
                labelProps={{ className: 'hidden' }}
                containerProps={{ className: 'min-w-0' }}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Typography variant="small" className="!text-gray-300 !font-medium">
                  Password
                </Typography>
                <Link
                  to="/forgot-password"
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                size="lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="!border-gray-700 !bg-gray-800 !text-white placeholder:!text-gray-500 focus:!border-orange-500"
                labelProps={{ className: 'hidden' }}
                containerProps={{ className: 'min-w-0' }}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || !username || !password}
              className="mt-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 normal-case text-sm font-semibold shadow-none hover:shadow-none disabled:opacity-50"
              fullWidth
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
