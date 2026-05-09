import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Typography } from '@material-tailwind/react';
import {
  UserPlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { register, login } from '../services/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = username.length > 0 && email.length > 0 && password.length > 0 && password === confirmPassword && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    try {
      await register({ username, email, password });
      // Auto-login after successful registration
      await login({ username, password });
      navigate('/dashboard');
    } catch {
      setError('Registration failed. That username may already be taken.');
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
            <Link
              to="/"
              className="inline-block mb-4 text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors"
            >
              🏀 Basketball Manager
            </Link>
            <Typography variant="h4" className="!text-white !font-bold">
              Create an account
            </Typography>
            <Typography variant="small" className="!text-gray-400 mt-1">
              Start your first franchise scenario for free
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
                placeholder="Choose a username"
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
              <Typography variant="small" className="mb-1.5 !text-gray-300 !font-medium">
                Email
              </Typography>
              <Input
                type="email"
                size="lg"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="!border-gray-700 !bg-gray-800 !text-white placeholder:!text-gray-500 focus:!border-orange-500"
                labelProps={{ className: 'hidden' }}
                containerProps={{ className: 'min-w-0' }}
              />
            </div>

            <div>
              <Typography variant="small" className="mb-1.5 !text-gray-300 !font-medium">
                Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="!border-gray-700 !bg-gray-800 !text-white placeholder:!text-gray-500 focus:!border-orange-500"
                labelProps={{ className: 'hidden' }}
                containerProps={{ className: 'min-w-0' }}
              />
            </div>

            <div>
              <Typography variant="small" className="mb-1.5 !text-gray-300 !font-medium">
                Confirm Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`!bg-gray-800 !text-white placeholder:!text-gray-500 ${
                  passwordMismatch
                    ? '!border-red-500 focus:!border-red-500'
                    : confirmPassword && !passwordMismatch
                      ? '!border-green-500 focus:!border-green-500'
                      : '!border-gray-700 focus:!border-orange-500'
                }`}
                labelProps={{ className: 'hidden' }}
                containerProps={{ className: 'min-w-0' }}
              />
              {passwordMismatch && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <ExclamationCircleIcon className="h-3.5 w-3.5" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && !passwordMismatch && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-green-400">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="mt-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 normal-case text-sm font-semibold shadow-none hover:shadow-none disabled:opacity-50"
              fullWidth
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <UserPlusIcon className="h-4 w-4" />
              )}
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
