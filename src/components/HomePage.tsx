import { Link } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Brain, FileText, Activity, Microscope, Image as ImageIcon, History, Users } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-6 mb-16 relative">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-secondary/30 border border-border/50">
          <span className="w-2 h-2 rounded-full bg-cyan/80 animate-pulse"></span>
          <span className="text-cyan text-[10px] font-mono tracking-[0.2em] uppercase">AI-Powered Medical Imaging</span>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4" style={{ fontFamily: 'var(--font-sans)', fontWeight: 900 }}>
          <span className="text-foreground">TB</span>
          <span className="text-cyan drop-shadow-[0_0_15px_rgba(var(--color-cyan),0.5)]">VISION</span>
          <span className="text-foreground"> AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm md:text-base max-w-3xl leading-relaxed">
          A Clinical Decision Support System that detects Tuberculosis from chest radiographs using a 
          <br className="hidden md:block"/> Custom CNN with Explainable AI (Grad-CAM) visualization
        </p>

        {/* Hero Metrics Box */}
        <div className="w-full max-w-4xl glass-card border border-border/50 rounded-xl mt-8 mb-6 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/50">
            <div className="p-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-4xl font-bold text-cyan">97.86%</span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Test Accuracy</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-4xl font-bold text-cyan">0.98</span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">AUC-ROC</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-4xl font-bold text-warning">421</span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Test Samples</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-4xl font-bold text-cyan">5 <span className="text-2xl">CNN</span></span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Conv Blocks</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          to={!user ? "/login" : user.role === 'doctor' ? "/scanner" : "/admin"} 
          className="w-full max-w-4xl"
        >
          <Button 
            className="w-full bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/30 h-12 rounded-lg font-mono tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_var(--color-cyan)]"
            variant="outline"
          >
            <Microscope className="w-4 h-4 mr-2" />
            {!user ? "Sign In to Access System →" : user.role === 'doctor' ? "Open Scanner →" : "Admin Dashboard →"}
          </Button>
        </Link>
      </section>

      {/* Problem & Solution Cards */}
      <section className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-20 z-10">
        <div className="glass-card p-8 bg-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 bg-cyan rounded-full"></div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-cyan">The Problem</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-loose">
            Tuberculosis kills over <strong className="text-foreground font-semibold">1.3 million people</strong> every year, making it one of the world's deadliest infectious diseases. Early detection from chest X-rays is critical — but trained radiologists are scarce in many resource-limited settings. Manual interpretation is slow, expensive, and prone to human error.
          </p>
        </div>

        <div className="glass-card p-8 bg-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 bg-cyan rounded-full"></div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-cyan">Our Solution</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-loose">
            TBVision AI uses a <strong className="text-foreground font-semibold">Custom Convolutional Neural Network</strong> trained on 4,200 chest X-rays to automatically classify radiographs as TB-Positive or Normal with 97.86% accuracy. Grad-CAM explainability makes AI decisions transparent and trustworthy for clinical review.
          </p>
        </div>
      </section>

      {/* Project At A Glance Grid */}
      <section className="w-full max-w-5xl mx-auto mb-20 z-10">
        <div className="mb-6">
          <h2 className="text-xs font-mono tracking-widest text-cyan uppercase">// Project At A Glance</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'DATASET', value: 'TB Chest Radiography DB' },
            { label: 'MODEL TYPE', value: 'Custom CNN (Sequential)' },
            { label: 'INPUT SIZE', value: '500 × 500 px (Grayscale)' },
            { label: 'SPLIT RATIO', value: '70% / 20% / 10%' },
            { label: 'XAI METHOD', value: 'Grad-CAM + Score-CAM' },
            { label: 'FRONTEND', value: 'React / Vite Web App' },
            { label: 'REPORT', value: 'PDF Auto-Generation' },
            { label: 'HISTORY', value: 'Database Session Logging' },
          ].map(item => (
            <div key={item.label} className="glass-card p-4 bg-secondary/10 border-border/40 hover:border-border/80 transition-colors">
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest mb-2 uppercase">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="w-full max-w-5xl mx-auto z-10">
        <div className="mb-8">
          <h2 className="text-xs font-mono tracking-widest text-cyan uppercase mb-2">// Core Features</h2>
          <h3 className="text-3xl font-bold text-foreground">What This System Does</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Activity,
              color: 'text-cyan bg-cyan/10',
              title: 'TB DETECTION',
              desc: 'Binary classification of chest X-rays into TB-Positive or Normal with 97.86% accuracy using a custom-trained CNN model.'
            },
            {
              icon: Brain,
              color: 'text-pink-500 bg-pink-500/10',
              title: 'EXPLAINABLE AI',
              desc: 'Grad-CAM heatmaps visually highlight the exact lung regions that influenced the model\'s prediction — building trust with doctors.'
            },
            {
              icon: FileText,
              color: 'text-warning bg-warning/10',
              title: 'PDF REPORTS',
              desc: 'Auto-generates professional clinical reports with patient info, diagnosis, confidence score, heatmap, and model details.'
            },
            {
              icon: ImageIcon,
              color: 'text-positive bg-positive/10',
              title: 'IMAGE QUALITY CHECK',
              desc: 'Automatically validates X-ray quality: resolution, blur level (Laplacian variance), and orientation before processing.'
            },
            {
              icon: History,
              color: 'text-indigo-400 bg-indigo-400/10',
              title: 'SESSION HISTORY',
              desc: 'Tracks all scans in a session with timestamps, patient info, results, and one-click database export functionality.'
            },
            {
              icon: Users,
              color: 'text-rose-400 bg-rose-400/10',
              title: 'PATIENT MANAGEMENT',
              desc: 'Input and store patient demographics, symptoms, doctor name, and hospital info alongside each scan result.'
            }
          ].map(feature => (
            <div key={feature.title} className="glass-card p-6 bg-secondary/10 hover:bg-secondary/20 transition-colors border-border/40 hover:border-cyan/30 group">
              <div className={`w-10 h-10 rounded flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold font-mono tracking-widest text-foreground uppercase mb-3 group-hover:text-cyan transition-colors">{feature.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
