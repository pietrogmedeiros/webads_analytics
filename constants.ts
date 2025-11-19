import type { Campaign, WebsiteDailyMetric, GeoData, TrafficSource, PageViewData, BrazilStateMetric } from './types';

export const mockCampaignData: Campaign[] = [
  {
    id: 'GA001',
    name: 'Campanha de Verão - Pesquisa',
    platform: 'Google Ads',
    status: 'Ativa',
    budget: 5000,
    spent: 3750,
    impressions: 150000,
    clicks: 7500,
    conversions: 300,
    // FIX: Add missing properties 'leads' and 'cpa' to match Campaign type.
    leads: 350,
    cpa: 12.5,
  },
  {
    id: 'FB002',
    name: 'Lançamento Coleção Outono',
    platform: 'Facebook Ads',
    status: 'Ativa',
    budget: 7000,
    spent: 6500,
    impressions: 450000,
    clicks: 9000,
    conversions: 450,
    // FIX: Add missing properties 'leads' and 'cpa' to match Campaign type.
    leads: 500,
    cpa: 14.44,
  },
  {
    id: 'LI003',
    name: 'Geração de Leads B2B',
    platform: 'LinkedIn Ads',
    status: 'Concluída',
    budget: 4000,
    spent: 4000,
    impressions: 80000,
    clicks: 1200,
    conversions: 80,
    // FIX: Add missing properties 'leads' and 'cpa' to match Campaign type.
    leads: 80,
    cpa: 50,
  },
  {
    id: 'GA004',
    name: 'Campanha Display - Remarketing',
    platform: 'Google Ads',
    status: 'Pausada',
    budget: 3000,
    spent: 1200,
    impressions: 250000,
    clicks: 2500,
    conversions: 50,
    // FIX: Add missing properties 'leads' and 'cpa' to match Campaign type.
    leads: 60,
    cpa: 24,
  },
  {
    id: 'TT005',
    name: 'Desafio Viral #MinhaMarca',
    platform: 'TikTok Ads',
    status: 'Ativa',
    budget: 10000,
    spent: 7800,
    impressions: 1200000,
    clicks: 15000,
    conversions: 600,
    // FIX: Add missing properties 'leads' and 'cpa' to match Campaign type.
    leads: 700,
    cpa: 13,
  },
];


export interface PerformanceDataPoint {
  date: string; // YYYY-MM-DD
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
}

// Generate mock performance data for the last 60 days
const generatePerformanceData = (): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    for (const campaign of mockCampaignData) {
      // Simulate some daily variance
      const dailyImpressions = Math.floor(campaign.impressions / 30 * (Math.random() * 0.4 + 0.8));
      const dailyClicks = Math.floor(campaign.clicks / 30 * (Math.random() * 0.5 + 0.75));
      const dailyConversions = Math.floor(campaign.conversions / 30 * (Math.random() * 0.6 + 0.7));
      const dailySpent = campaign.spent / 30 * (Math.random() * 0.3 + 0.85);
      
      data.push({
        date: dateString,
        campaignId: campaign.id,
        impressions: dailyImpressions,
        clicks: dailyClicks,
        conversions: dailyConversions,
        spent: dailySpent,
      });
    }
  }
  return data;
};

export const mockPerformanceData: PerformanceDataPoint[] = generatePerformanceData();

// MOCK DATA FOR SITE ANALYTICS
export const mockWebsiteMetrics: WebsiteDailyMetric[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        visitors: Math.floor(Math.random() * 500) + 1000,
        pageviews: Math.floor(Math.random() * 1500) + 3000,
        sessions: Math.floor(Math.random() * 600) + 1100,
        bounceRate: Math.random() * 20 + 40, // 40% to 60%
        avgSessionDuration: Math.floor(Math.random() * 60) + 120, // 120s to 180s
    };
});

export const mockGeoData: GeoData[] = [
    { country: 'Brasil', visitors: 15400 },
    { country: 'Estados Unidos', visitors: 3200 },
    { country: 'Portugal', visitors: 1800 },
    { country: 'Espanha', visitors: 950 },
    { country: 'Argentina', visitors: 600 },
];

export const mockBrazilStatesData: BrazilStateMetric[] = [
    { id: 'SP', name: 'São Paulo', visitors: 12500 },
    { id: 'RJ', name: 'Rio de Janeiro', visitors: 8400 },
    { id: 'MG', name: 'Minas Gerais', visitors: 6200 },
    { id: 'RS', name: 'Rio Grande do Sul', visitors: 4100 },
    { id: 'PR', name: 'Paraná', visitors: 3800 },
    { id: 'SC', name: 'Santa Catarina', visitors: 3200 },
    { id: 'BA', name: 'Bahia', visitors: 2900 },
    { id: 'PE', name: 'Pernambuco', visitors: 2100 },
    { id: 'DF', name: 'Distrito Federal', visitors: 1900 },
    { id: 'CE', name: 'Ceará', visitors: 1600 },
    { id: 'GO', name: 'Goiás', visitors: 1400 },
    { id: 'ES', name: 'Espírito Santo', visitors: 1200 },
    { id: 'PA', name: 'Pará', visitors: 900 },
    { id: 'AM', name: 'Amazonas', visitors: 800 },
    { id: 'MT', name: 'Mato Grosso', visitors: 750 },
    { id: 'MA', name: 'Maranhão', visitors: 700 },
    { id: 'PB', name: 'Paraíba', visitors: 650 },
    { id: 'RN', name: 'Rio Grande do Norte', visitors: 600 },
    { id: 'MS', name: 'Mato Grosso do Sul', visitors: 550 },
    { id: 'AL', name: 'Alagoas', visitors: 450 },
    { id: 'SE', name: 'Sergipe', visitors: 400 },
    { id: 'PI', name: 'Piauí', visitors: 350 },
    { id: 'RO', name: 'Rondônia', visitors: 300 },
    { id: 'TO', name: 'Tocantins', visitors: 250 },
    { id: 'AC', name: 'Acre', visitors: 150 },
    { id: 'AP', name: 'Amapá', visitors: 120 },
    { id: 'RR', name: 'Roraima', visitors: 100 },
];

export const mockTrafficSources: TrafficSource[] = [
    { source: 'Orgânico (SEO)', visitors: 8500 },
    { source: 'Direto', visitors: 4200 },
    { source: 'Social', visitors: 3800 },
    { source: 'Pago (Ads)', visitors: 5100 },
    { source: 'Email', visitors: 1200 },
];

export const mockTopPages: PageViewData[] = [
    { path: '/', title: 'Home | Minha Marca', views: 12500, avgTime: 145 },
    { path: '/produtos', title: 'Nossos Produtos', views: 8400, avgTime: 210 },
    { path: '/blog/tendencias-2024', title: 'Tendências de Mercado 2024', views: 5600, avgTime: 350 },
    { path: '/contato', title: 'Fale Conosco', views: 2100, avgTime: 90 },
    { path: '/sobre', title: 'Quem Somos', views: 1800, avgTime: 180 },
];