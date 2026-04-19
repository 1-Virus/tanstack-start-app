import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import * as api from '@/lib/api';
import type { ScanRecord } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Activity, TrendingUp, TrendingDown, Loader2, AlertTriangle } from 'lucide-react';

export function HistoryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getHistory()
      .then(data => { if (!cancelled) setRecords(data); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load history'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scans = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter(s =>
      s.patient_name.toLowerCase().includes(q) || s.patient_id.toLowerCase().includes(q) || s.scan_id.toLowerCase().includes(q)
    );
  }, [search, records]);

  const total = scans.length;
  const positive = scans.filter(s => s.result === 'TUBERCULOSIS DETECTED' || s.result === 'POSITIVE').length;
  const negative = total - positive;

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all scan history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await api.clearHistory();
      setRecords([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="pt-20 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Scan History</h1>
        <p className="text-muted-foreground mb-8">Review your past analyses and patient records</p>

        {/* Error banner */}
        {error && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Scans', value: total, icon: Activity, color: 'text-primary' },
            { label: 'Positive', value: positive, icon: TrendingUp, color: 'text-destructive' },
            { label: 'Negative', value: negative, icon: TrendingDown, color: 'text-positive' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-3xl font-bold font-mono text-foreground">{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Clear */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient name or ID..." className="pl-10 bg-secondary/50" />
          </div>
          {records.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} disabled={clearing} className="text-destructive hover:text-destructive">
              {clearing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
              Clear All
            </Button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading scan history...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && records.length === 0 && !error && (
          <div className="glass-card p-12 text-center">
            <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-medium mb-1">No scans yet</p>
            <p className="text-sm text-muted-foreground">Upload an X-ray in the Scanner to see results here.</p>
          </div>
        )}

        {/* Table */}
        {!loading && scans.length > 0 && (
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Patient</TableHead>
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Result</TableHead>
                  <TableHead className="text-muted-foreground">File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map(scan => (
                  <TableRow key={scan.id} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{scan.patient_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{scan.patient_age ? `${scan.patient_age}y` : ''}{scan.patient_gender ? `, ${scan.patient_gender}` : ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{scan.patient_id || scan.scan_id}</TableCell>
                    <TableCell>
                      <Badge variant={scan.result === 'TUBERCULOSIS DETECTED' || scan.result === 'POSITIVE' ? 'destructive' : 'positive'}>
                        {scan.result === 'TUBERCULOSIS DETECTED' || scan.result === 'POSITIVE' ? 'POSITIVE' : 'NEGATIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{scan.filename}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
