import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import * as api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, RotateCcw, Download, Loader2 } from 'lucide-react';

type Step = 'patient' | 'upload' | 'inference' | 'results';

interface PatientData {
  name: string;
  age: string;
  gender: string;
  patientId: string;
}

interface ScanResult {
  scanId: string;
  label: string;
  confidence: number;
  heatmapBase64?: string;
}

export function ScannerPage() {
  const { user: _user } = useAuth();
  const [step, setStep] = useState<Step>('patient');
  const [patient, setPatient] = useState<PatientData>({ name: '', age: '', gender: '', patientId: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type === 'image/png' || f.type === 'image/jpeg')) handleFile(f);
  }, [handleFile]);

  const runInference = useCallback(async () => {
    if (!file) return;
    setStep('inference');
    setError(null);

    try {
      const response = await api.analyzeScan(file, patient);

      const isPositive = response.result === 'TUBERCULOSIS DETECTED' || response.result === 'POSITIVE';
      setResult({
        scanId: response.scan_id,
        label: isPositive ? 'POSITIVE' : 'NEGATIVE',
        confidence: response.confidence,
        heatmapBase64: response.heatmap_base64,
      });
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('upload');
    }
  }, [file, patient]);

  const handleDownloadPdf = useCallback(async () => {
    if (!file || !result) return;
    setPdfLoading(true);
    try {
      const blob = await api.downloadPdf(result.scanId, file, patient);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TB_Report_${result.scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF download failed');
    } finally {
      setPdfLoading(false);
    }
  }, [file, result, patient]);

  const reset = () => {
    setStep('patient');
    setPatient({ name: '', age: '', gender: '', patientId: '' });
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const steps = ['patient', 'upload', 'inference', 'results'] as const;
  const stepIndex = steps.indexOf(step);

  return (
    <div className="pt-20 pb-12 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Clinical Scanner</h1>
        <p className="text-muted-foreground mb-8">Upload chest X-rays for AI-powered tuberculosis analysis</p>

        {/* Error banner */}
        {error && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Patient Data', 'Upload X-Ray', 'AI Analysis', 'Results'].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-primary glow-cyan' : 'bg-secondary'}`} />
              <p className={`text-xs mt-1 ${i <= stepIndex ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Step 1: Patient Data */}
        {step === 'patient' && (
          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Patient Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Patient Name</Label>
                <Input value={patient.name} onChange={e => setPatient(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Patient ID</Label>
                <Input value={patient.patientId} onChange={e => setPatient(p => ({ ...p, patientId: e.target.value }))} placeholder="P001" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Age</Label>
                <Input type="number" value={patient.age} onChange={e => setPatient(p => ({ ...p, age: e.target.value }))} placeholder="45" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Gender</Label>
                <Select value={patient.gender} onValueChange={v => setPatient(p => ({ ...p, gender: v }))}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="cyan" onClick={() => setStep('upload')} disabled={!patient.name || !patient.patientId}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === 'upload' && (
          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Upload Chest X-Ray</h2>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
              onClick={() => document.getElementById('xray-input')?.click()}
            >
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="X-Ray preview" className="max-h-64 mx-auto rounded-lg border border-border" />
                  <p className="text-sm text-primary font-medium">{file?.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium">Drag & drop X-Ray image here</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports PNG and JPG formats</p>
                </>
              )}
              <input id="xray-input" type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('patient')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="cyan" onClick={runInference} disabled={!file}>
                Analyze <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Inference (loading) */}
        {step === 'inference' && (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">AI Model Processing</h2>
            <p className="text-muted-foreground mb-6">Running CNN inference and generating Grad-CAM heatmap...</p>
            <div className="max-w-md mx-auto">
              <Progress value={undefined} className="h-3" />
              <p className="text-sm font-mono text-primary mt-2">Analyzing...</p>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'results' && result && (
          <div className="space-y-6">
            {/* Result badge */}
            <div className={`glass-card p-8 text-center border ${result.label === 'POSITIVE' ? 'border-destructive/50' : 'border-positive/50'} ${result.label === 'POSITIVE' ? 'glow-destructive' : 'glow-positive'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.label === 'POSITIVE' ? 'bg-destructive/20' : 'bg-positive/20'}`}>
                {result.label === 'POSITIVE' ? (
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-positive" />
                )}
              </div>
              <Badge variant={result.label === 'POSITIVE' ? 'destructive' : 'positive'} className="text-lg px-6 py-2 mb-3">
                {result.label}
              </Badge>
              <p className="text-muted-foreground text-sm">TB Detection Result for {patient.name} (ID: {patient.patientId})</p>
            </div>


            {/* Image comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Original X-Ray</p>
                {preview && <img src={preview} alt="Original" className="w-full rounded-lg" />}
              </div>
              <div className="glass-card p-4 relative overflow-hidden">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Grad-CAM Heatmap</p>
                {result.heatmapBase64 ? (
                  <img
                    src={`data:image/jpeg;base64,${result.heatmapBase64}`}
                    alt="Grad-CAM Heatmap"
                    className="w-full rounded-lg"
                  />
                ) : preview ? (
                  <div className="relative">
                    <img src={preview} alt="Heatmap unavailable" className="w-full rounded-lg opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground glass-card px-3 py-1.5 rounded">Heatmap not available</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="cyan" onClick={handleDownloadPdf} disabled={pdfLoading}>
                {pdfLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {pdfLoading ? 'Generating PDF...' : 'Download PDF Report'}
              </Button>
              <Button variant="secondary" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Scan Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
