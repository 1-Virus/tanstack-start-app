import { useState, useEffect } from 'react';
import * as api from '@/lib/api';
import type { AdminUserStats } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, BarChart3, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';

export function AdminPage() {
  const [stats, setStats] = useState<AdminUserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getAdminStats()
      .then(data => { if (!cancelled) setStats(data); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load admin data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const doctors = stats.filter(u => u.role === 'doctor');
  const totalScans = stats.reduce((sum, u) => sum + u.total_scans, 0);
  const totalPositive = stats.reduce((sum, u) => sum + u.tb_positive, 0);
  const positiveRate = totalScans > 0 ? ((totalPositive / totalScans) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">System-wide metrics and user management</p>

        {/* Error banner */}
        {error && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Registered Doctors', value: doctors.length, icon: Users, color: 'text-primary' },
            { label: 'Total Scans', value: totalScans, icon: BarChart3, color: 'text-positive' },
            { label: 'Positivity Rate', value: `${positiveRate}%`, icon: TrendingUp, color: 'text-destructive' },
          ].map(s => (
            <div key={s.label} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-4xl font-bold font-mono text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* User management table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Registered Users</h3>
          </div>
          {stats.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No users registered yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Hospital</TableHead>
                  <TableHead className="text-muted-foreground">Scans</TableHead>
                  <TableHead className="text-muted-foreground">TB Positive</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map(u => (
                  <TableRow key={u.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.hospital || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{u.total_scans}</TableCell>
                    <TableCell className="font-mono text-sm">{u.tb_positive}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'positive'} className="text-[10px]">
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
