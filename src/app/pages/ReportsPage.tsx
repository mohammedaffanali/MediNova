import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUIStore } from '@/store/uiStore';
import { FileText, Download, Brain, Sparkles, FileBarChart, FileCheck, Activity, TrendingUp, Clock, ArrowRightLeft } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'ops_summary', title: 'Daily Operations Summary', description: 'Complete overview of daily hospital operations, admissions, discharges, and resource utilization.', icon: FileBarChart, color: 'text-brand-300', bg: 'bg-brand-500/10' },
  { id: 'resource_util', title: 'Resource Utilization Report', description: 'Detailed analysis of bed, ICU, ventilator, and equipment usage across the network.', icon: Activity, color: 'text-warning-400', bg: 'bg-warning-500/10' },
  { id: 'emergency_response', title: 'Emergency Response Analysis', description: 'Response times, case outcomes, and emergency department performance metrics.', icon: TrendingUp, color: 'text-critical-400', bg: 'bg-critical-500/10' },
  { id: 'transfer_efficiency', title: 'Transfer Efficiency Report', description: 'Transfer completion rates, average times, and hospital acceptance patterns.', icon: ArrowRightLeft, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { id: 'dept_performance', title: 'Department Performance Report', description: 'Department-wise performance, occupancy, wait times, and staff productivity.', icon: FileCheck, color: 'text-success-400', bg: 'bg-success-500/10' },
  { id: 'ai_predictions', title: 'AI Predictions Summary', description: 'All AI-generated forecasts, recommendations, and prediction accuracy analysis.', icon: Brain, color: 'text-brand-300', bg: 'bg-brand-500/10' },
];

export default function ReportsPage() {
  const { scopedHospitals, recommendations } = useRealtimeData();
  const { pushToast } = useUIStore();
  const [generating, setGenerating] = useState<string | null>(null);

  const generateReport = (id: string, title: string) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      pushToast('Report Generated', `${title} is ready for download.`, 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and download operational reports"
        icon={<FileText className="h-6 w-6" />}
      />

      {/* AI Report Generator */}
      <div className="glass p-5 border-l-2 border-brand-500/40">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-brand-300" />
          <h3 className="text-sm font-semibold text-ink-100">AI Report Assistant</h3>
          <Sparkles className="h-4 w-4 text-brand-300" />
        </div>
        <p className="text-sm text-ink-300">
          AI can generate comprehensive reports combining real-time data, historical trends, and predictive insights.
          {recommendations.length} AI insights available for inclusion in reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report) => (
          <div key={report.id} className="glass glass-hover-lift p-5 flex flex-col">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${report.bg} ${report.color} border border-base-700/40 mb-4`}>
              <report.icon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-ink-100 mb-1.5">{report.title}</h3>
            <p className="text-xs text-ink-400 leading-relaxed flex-1">{report.description}</p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => generateReport(report.id, report.title)}
                disabled={generating === report.id}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-brand-500/15 text-brand-200 border border-brand-500/25 px-3 py-2 text-xs font-medium hover:bg-brand-500/25 disabled:opacity-50 transition-all"
              >
                {generating === report.id ? (
                  <><span className="h-3 w-3 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><FileText className="h-3.5 w-3.5" /> Generate</>
                )}
              </button>
              <button
                onClick={() => pushToast('Download started', `${report.title} PDF downloading.`, 'info')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-800/60 text-ink-300 hover:text-brand-300 hover:bg-brand-500/10 transition-all border border-base-700/50"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="glass p-5">
        <SectionHeader title="Recent Reports" subtitle="Last 7 days" icon={<Clock className="h-4 w-4" />} />
        <div className="mt-4 space-y-2">
          {['Daily Operations Summary — Aug 6', 'Emergency Response Analysis — Aug 5', 'Resource Utilization — Aug 5', 'Transfer Efficiency — Aug 4'].map((title, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-base-850/40 px-4 py-3 hover:bg-brand-500/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-100">{title}</p>
                  <p className="text-xs text-ink-500">PDF · 2.4 MB · Generated by AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge variant="success" size="sm">Ready</StatusBadge>
                <button onClick={() => pushToast('Download started', `${title} downloading.`, 'info')} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:text-brand-300 hover:bg-brand-500/10 transition-all">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
