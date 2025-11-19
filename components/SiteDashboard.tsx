
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockWebsiteMetrics, mockBrazilStatesData, mockTrafficSources, mockTopPages } from '../constants';
import { BrazilMap } from './BrazilMap';

// Monochromatic Blue/Indigo Palette for Traffic Sources
const COLORS = ['#312e81', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc'];

const SiteMetricCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean }> = ({ title, value, change, isPositive }) => (
  <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
    <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{title}</h3>
    <div className="flex items-baseline gap-2 mt-2">
        <p className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">{value}</p>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {change}
        </span>
    </div>
  </div>
);

export const SiteDashboard: React.FC = () => {
    // Calculate totals for cards
    const totalVisitors = mockWebsiteMetrics.reduce((acc, curr) => acc + curr.visitors, 0);
    const avgBounceRate = mockWebsiteMetrics.reduce((acc, curr) => acc + curr.bounceRate, 0) / mockWebsiteMetrics.length;
    const avgDuration = mockWebsiteMetrics.reduce((acc, curr) => acc + curr.avgSessionDuration, 0) / mockWebsiteMetrics.length;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s}s`;
    };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SiteMetricCard title="Visitantes Únicos (30d)" value={totalVisitors.toLocaleString('pt-BR')} change="+12.5%" isPositive={true} />
        <SiteMetricCard title="Tempo Médio de Sessão" value={formatTime(avgDuration)} change="+5.2%" isPositive={true} />
        <SiteMetricCard title="Taxa de Rejeição" value={`${avgBounceRate.toFixed(1)}%`} change="-2.1%" isPositive={true} />
        <SiteMetricCard title="Páginas por Sessão" value="3.8" change="+0.4%" isPositive={true} />
      </div>

      {/* Main Chart: Visitors & Sessions */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Tráfego do Site (Últimos 30 dias)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockWebsiteMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
              <YAxis tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid-stroke)" />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'var(--color-card-background)',
                    borderColor: 'var(--color-card-border)',
                    color: 'var(--color-text-primary)',
                    borderRadius: '0.5rem',
                }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVisitors)" name="Visitantes" />
              <Area type="monotone" dataKey="sessions" stroke="#10b981" fillOpacity={1} fill="url(#colorSessions)" name="Sessões" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split Section: Traffic Sources & Geo (Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Traffic Sources Pie Chart */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
             <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Origem do Tráfego</h3>
             <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={mockTrafficSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="visitors"
                            nameKey="source"
                        >
                            {mockTrafficSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                             contentStyle={{
                                backgroundColor: 'var(--color-card-background)',
                                borderColor: 'var(--color-card-border)',
                                color: 'var(--color-text-primary)',
                                borderRadius: '0.5rem',
                            }}
                        />
                        <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                            wrapperStyle={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
             </div>
        </div>

        {/* Brazil Map Heatmap */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Geolocalização (Mapa de Calor)</h3>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Zoom: +/- | Arrastar</span>
            </div>
            <div className="h-96 w-full border border-border-light dark:border-border-dark rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/30">
                <BrazilMap data={mockBrazilStatesData} />
            </div>
        </div>

      </div>

      {/* Top Pages Table */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Páginas Mais Acessadas</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                <thead className="bg-background-light dark:bg-background-dark">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Página</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Visualizações</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Tempo Médio</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {mockTopPages.map((page, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{page.title}</div>
                                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{page.path}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                {page.views.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                {formatTime(page.avgTime)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
