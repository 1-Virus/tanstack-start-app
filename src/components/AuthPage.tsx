import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm shadow-2xl">
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 glow-cyan">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TBVision AI</h1>
          <p className="text-sm text-muted-foreground mt-1">Authentication Required</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 border-border/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan/40 via-primary to-cyan/40" />
          
          {/* Tabs */}
          <div className="flex mb-6 bg-secondary/30 rounded-lg p-1 border border-border/50">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'login' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'register' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? <LoginForm /> : <RegisterForm onSwitch={() => setMode('login')} />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please enter both username and password'); return; }
    setLoading(true);
    const err = await login(username, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground">Username</Label>
        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" className="bg-secondary/50 border-border" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-secondary/50 border-border pr-10" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" variant="cyan" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', full_name: '', hospital: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    const err = await register(form);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">Username</Label>
          <Input value={form.username} onChange={e => update('username', e.target.value)} placeholder="dr.smith" className="bg-secondary/50 border-border" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">Email</Label>
          <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@hospital.org" className="bg-secondary/50 border-border" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs">Full Name</Label>
        <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Dr. Jane Smith" className="bg-secondary/50 border-border" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs">Hospital / Clinic</Label>
        <Input value={form.hospital} onChange={e => update('hospital', e.target.value)} placeholder="Apollo Medical Center" className="bg-secondary/50 border-border" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">Password</Label>
          <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="bg-secondary/50 border-border" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">Confirm</Label>
          <Input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} className="bg-secondary/50 border-border" required />
        </div>
      </div>
      <Button type="submit" variant="cyan" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
