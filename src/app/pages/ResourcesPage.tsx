import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { SearchBar, FilterToolbar, FilterChip } from '@/components/ui/FilterToolbar';
import { EmptyState } from '@/components/ui/EmptyState';
import { AIRecommendationCard } from '@/components/cards/AIRecommendationCard';
import { Boxes, Brain, Sparkles } from 'lucide-react';

const CATEGORIES = ['all', 'bed', 'icu', 'emergency', 'ventilator', 'imaging', 'blood', 'supply', 'facility'];

export default function ResourcesPage() {
  const { resources, scopedHospitals, recommendations } = useRealtimeData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = resources.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && r.category !== category) return false;
    return true;
  });

  const aiResourceRecs = recommendations.filter((r) => r.type === 'resource' || r.type === 'optimization' || r.type === 'icu');
  const hospital = scopedHospitals[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Management"
        subtitle={hospital ? `${hospital.name} · ${resources.length} resources tracked` : `${resources.length} resources`}
        icon={<Boxes className="h-6 w-6" />}
      />

      {aiResourceRecs.length > 0 && (
        <div className="glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-brand-300" />
            <span className="text-sm font-semibold text-ink-100">AI Resource Optimization</span>
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {aiResourceRecs.slice(0, 4).map((rec) => <AIRecommendationCard key={rec.id} recommendation={rec} compact />)}
          </div>
        </div>
      )}

      <div className="glass p-4">
        <FilterToolbar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search resources..." className="flex-1 min-w-[200px]" />
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <FilterChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </FilterChip>
            ))}
          </div>
        </FilterToolbar>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8">
          <EmptyState icon={<Boxes className="h-10 w-10" />} title="No resources found" message="Try adjusting your search or filters." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}
    </div>
  );
}
