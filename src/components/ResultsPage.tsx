import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Eye, 
  Settings,
  Activity,
  FileText
} from 'lucide-react';

export function ResultsPage() {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="text-cyan text-xs font-mono tracking-[0.2em] uppercase uppercase animate-pulse">
            Clinical Decision Support
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Results & Info</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Comprehensive analysis metrics and system performance overview
          </p>
        </div>

        {/* Key Numbers */}
        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">Performance Metrics</h2>
          <h3 className="text-2xl font-bold text-foreground mb-6">Key Numbers</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-cyan relative overflow-hidden group hover:border-cyan transition-colors">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-cyan shadow-[0_0_15px_var(--color-cyan)] group-hover:w-full transition-all duration-500"></div>
              <span className="text-4xl md:text-5xl font-bold text-cyan mb-3">97.86%</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase font-mono text-center">Overall Accuracy</span>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-positive relative overflow-hidden group hover:border-positive transition-colors">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-positive shadow-[0_0_15px_var(--color-positive)] group-hover:w-full transition-all duration-500"></div>
              <span className="text-4xl md:text-5xl font-bold text-positive mb-3">0.98</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase font-mono text-center">Precision Score</span>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-warning relative overflow-hidden group hover:border-warning transition-colors">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-warning shadow-[0_0_15px_var(--color-warning)] group-hover:w-full transition-all duration-500"></div>
              <span className="text-4xl md:text-5xl font-bold text-warning mb-3">0.96</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase font-mono text-center">Recall Score</span>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-destructive relative overflow-hidden group hover:border-destructive transition-colors">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-destructive shadow-[0_0_15px_var(--color-destructive)] group-hover:w-full transition-all duration-500"></div>
              <span className="text-4xl md:text-5xl font-bold text-destructive mb-3">0.94</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase font-mono text-center">F1-Score</span>
            </div>
          </div>
        </section>

        {/* Per-Class Performance */}
        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">Classification Report</h2>
          <h3 className="text-2xl font-bold text-foreground mb-6">Per-Class Performance</h3>
          
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase font-mono border-b border-border bg-secondary/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Class</th>
                  <th className="px-6 py-4 font-medium">Precision</th>
                  <th className="px-6 py-4 font-medium">Recall</th>
                  <th className="px-6 py-4 font-medium">F1-Score</th>
                  <th className="px-6 py-4 font-medium">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-positive glow-positive"></span>
                    Normal
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.98</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.96</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.97</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">21</td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-destructive glow-destructive"></span>
                    Tuberculosis
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.95</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.83</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.89</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">23</td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-muted-foreground">Macro Avg</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.96</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.89</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">0.93</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">44</td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors bg-secondary/5">
                  <td className="px-6 py-4 font-medium">Weighted Avg</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-cyan">0.96</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-cyan">0.89</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-cyan">0.93</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">44</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Two Column Section: Prediction Breakdown & AUC-ROC */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Prediction Breakdown */}
          <section>
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">Confusion Matrix</h2>
            <h3 className="text-2xl font-bold text-foreground mb-6">Prediction Breakdown</h3>
            
            <div className="glass-card p-6 h-full flex flex-col">
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 border border-border bg-secondary/20 text-xs font-mono text-muted-foreground uppercase">Actual / Predicted</th>
                      <th className="p-3 border border-border bg-secondary/20 font-medium">Predicted Normal</th>
                      <th className="p-3 border border-border bg-secondary/20 font-medium">Predicted TB</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-border font-medium text-left">Actual Normal</td>
                      <td className="p-3 border border-border font-mono text-positive text-xl">20</td>
                      <td className="p-3 border border-border font-mono text-warning text-xl">1</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-border font-medium text-left">Actual TB</td>
                      <td className="p-3 border border-border font-mono text-destructive text-xl">4</td>
                      <td className="p-3 border border-border font-mono text-cyan text-xl">19</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-3 mt-auto text-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-positive shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground font-medium">True Positives (TP): 19</strong> (Correctly identified TB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-positive shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground font-medium">True Negatives (TN): 20</strong> (Correctly identified Normal)</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground font-medium">False Positives (FP): 1</strong> (Normal flagged as TB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground font-medium">False Negatives (FN): 4</strong> (TB missed, labeled as Normal)</span>
                </div>
              </div>
            </div>
          </section>

          {/* AUC-ROC Analysis */}
          <section>
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">ROC Curve</h2>
            <h3 className="text-2xl font-bold text-foreground mb-6">AUC-ROC Analysis</h3>
            
            <div className="glass-card p-6 h-full flex flex-col">
              <div className="relative aspect-video sm:aspect-square md:aspect-auto md:h-64 w-full bg-secondary/10 rounded-lg border border-border/50 p-4 mb-4 flex items-center justify-center overflow-hidden">
                <svg viewBox="-10 -10 120 120" className="w-full h-full max-h-[250px]">
                  {/* Grid Lines */}
                  <line x1="0" y1="100" x2="100" y2="100" stroke="var(--color-border)" strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="0" y2="100" stroke="var(--color-border)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-border)" strokeWidth="0.2" opacity="0.5" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="var(--color-border)" strokeWidth="0.2" opacity="0.5" />
                  
                  {/* Axis Labels */}
                  <text x="-5" y="100" fontSize="4" fill="var(--color-muted-foreground)" textAnchor="end">0.0</text>
                  <text x="-5" y="50" fontSize="4" fill="var(--color-muted-foreground)" textAnchor="end">0.5</text>
                  <text x="-5" y="0" fontSize="4" fill="var(--color-muted-foreground)" textAnchor="end">1.0</text>
                  <text x="0" y="108" fontSize="4" fill="var(--color-muted-foreground)" textAnchor="middle">0.0</text>
                  <text x="50" y="108" fontSize="4" fill="var(--color-muted-foreground)" textAnchor="middle">0.5</text>
                  <text x="100" y="108" fontSize="4" fill="var(--color-muted-foreground)" textAnchor="middle">1.0</text>
                  
                  {/* Axis Titles */}
                  <text x="-15" y="50" fontSize="5" fill="var(--color-muted-foreground)" textAnchor="middle" transform="rotate(-90 -15 50)">True Positive Rate</text>
                  <text x="50" y="115" fontSize="5" fill="var(--color-muted-foreground)" textAnchor="middle">False Positive Rate (FPR)</text>

                  {/* Diagonal */}
                  <line x1="0" y1="100" x2="100" y2="0" stroke="var(--color-muted-foreground)" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* ROC curve */}
                  <path d="M 0 100 Q 2 20 15 8 T 40 3 T 70 1 T 100 0" fill="none" stroke="var(--color-cyan)" strokeWidth="1.5" className="drop-shadow-[0_0_3px_var(--color-cyan)]" />
                  <path d="M 0 100 Q 2 20 15 8 T 40 3 T 70 1 T 100 0 L 100 100 Z" fill="var(--color-cyan)" fillOpacity="0.05" />
                </svg>
                
                {/* Legend */}
                <div className="absolute bottom-6 right-6 glass-card p-3 text-[10px] space-y-1.5 border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-[1px] border border-dashed border-muted-foreground scale-y-50 block"></span>
                    <span className="text-muted-foreground">Baseline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 bg-cyan rounded-full shadow-[0_0_5px_var(--color-cyan)] block"></span>
                    <span className="font-semibold text-foreground">CNN Model (AUC = 0.99)</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                ROC curve measures model performance. The closer the area is to 1.0, the better the final model is at distinguishing between the given classes.
              </p>
            </div>
          </section>
        </div>

        {/* Model Structure */}
        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">Architecture</h2>
          <h3 className="text-2xl font-bold text-foreground mb-6">Model Structure</h3>
          
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase font-mono border-b border-border bg-secondary/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Layer</th>
                  <th className="px-6 py-4 font-medium">Output Shape</th>
                  <th className="px-6 py-4 font-medium">Param #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3 font-medium text-cyan">Input</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 224, 224, 3)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">0</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">Conv2D</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 222, 222, 32)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">896</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">MaxPooling2D</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 111, 111, 32)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">0</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">Conv2D</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 109, 109, 64)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">18,496</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">MaxPooling2D</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 54, 54, 64)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">0</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">Flatten</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 186624)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">0</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">Dense</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 128)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">23,888,000</td>
                </tr>
                <tr className="hover:bg-secondary/10">
                  <td className="px-6 py-3">Dropout</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 128)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">0</td>
                </tr>
                <tr className="hover:bg-secondary/10 bg-secondary/5">
                  <td className="px-6 py-3 font-medium text-cyan">Dense (Output)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">(None, 2)</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">258</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How The System Works */}
        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">Process & Pipeline</h2>
          <h3 className="text-2xl font-bold text-foreground mb-6">How The System Works</h3>
          
          <div className="grid gap-3">
            {[
              { num: '01', title: 'IMAGE INGESTION', desc: 'Users upload a medical scan or select sample data for testing purposes.' },
              { num: '02', title: 'PRE-PROCESSING', desc: 'Scanning for noise reduction and proper scaling to fit the required 224x224 shape to pass into CNN model.' },
              { num: '03', title: 'DEEP NEURAL VISION', desc: 'Extracted features are passed through multi-layered Convolutional Neural Networks (CNN) for specific analysis.' },
              { num: '04', title: 'PREDICTION', desc: 'A mathematical output is matched with the highest probability category: "Normal" or "Tuberculosis".' },
              { num: '05', title: 'GRAD-CAM HEATMAP', desc: 'Visual overlay points to exact locations based off the areas correlated with the model\'s classifications.' },
              { num: '06', title: 'PATTERN MATCHING', desc: 'Diagnoses cross-references typical visual markers indicative of specific diseases.' },
              { num: '07', title: 'CONFIDENCE SCORE', desc: 'Calculates a percentage of certainty that represents the algorithm\'s reliability.' },
              { num: '08', title: 'REPORT GENERATION', desc: 'A final medical report is generated mapping out findings as well as system confidence levels for review.' }
            ].map((step) => (
              <div key={step.num} className="glass-card p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-sidebar-accent transition-colors">
                <div className="font-mono text-2xl font-bold text-muted/30 w-12 shrink-0">{step.num}</div>
                <div className="h-px w-full md:h-12 md:w-px bg-border/50 hidden md:block"></div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1 tracking-wider uppercase">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What Was Achieved */}
        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-mono">Outcomes</h2>
          <h3 className="text-2xl font-bold text-foreground mb-6">What Was Achieved</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex flex-col hover:border-cyan transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-cyan" />
              </div>
              <h4 className="font-bold text-foreground mb-2 tracking-wider">HIGH ACCURACY</h4>
              <p className="text-sm text-muted-foreground">Demonstrated exceptional ability to detect tuberculosis present from visual x-ray scans.</p>
            </div>
            
            <div className="glass-card p-6 flex flex-col hover:border-warning transition-colors">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <h4 className="font-bold text-foreground mb-2 tracking-wider">EFFICIENCY</h4>
              <p className="text-sm text-muted-foreground">Rapid inference phase processing reduces diagnosis times drastically, providing results in seconds.</p>
            </div>
            
            <div className="glass-card p-6 flex flex-col hover:border-positive transition-colors">
              <div className="w-10 h-10 rounded-lg bg-positive/10 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-positive" />
              </div>
              <h4 className="font-bold text-foreground mb-2 tracking-wider">CLINICAL ANALYSIS</h4>
              <p className="text-sm text-muted-foreground">Grad-CAM overlay interpretation successfully outputs spatial heat map values to highlight focal points.</p>
            </div>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <div className="glass-card p-6 border-warning/30 bg-warning/5 mt-16">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Medical Disclaimer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                TBVision AI is a clinical decision <Badge variant="outline" className="mx-1 border-warning/50 text-warning bg-warning/10 text-[10px] rounded hover:bg-warning/20 transition-colors uppercase tracking-widest">support</Badge> system and should not replace professional medical judgment.
                All AI-generated results must be reviewed and validated by a qualified healthcare professional.
                This tool is intended for research and preliminary screening purposes only. Final diagnosis
                and treatment decisions remain the sole responsibility of the attending physician.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
