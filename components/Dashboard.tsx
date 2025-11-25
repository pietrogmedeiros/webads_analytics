import React, { useState, useMemo, useEffect } from 'react';
import type { Campaign, ChartDataPoint } from '../types';
import { MetricCard } from './MetricCard';
import { CampaignPerformanceChart } from './CampaignPerformanceChart';
import { AIInsights } from './AIInsights';
import { CampaignTable } from './CampaignTable';
import { CampaignFilter } from './CampaignFilter';
import { AlertSection } from './AlertSection';
import { fetchAllInsights } from '../services/geminiService';
import { mockPerformanceData } from '../constants';
import type { PerformanceDataPoint } from '../constants';

const getInitialDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};

const filterDataByDate = (data: PerformanceDataPoint[], startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Ensure end date is inclusive

  return data.filter(d => {
    const pointDate = new Date(d.date);
    return pointDate >= start && pointDate <= end;
  });
};

const aggregateForChart = (data: PerformanceDataPoint[]): ChartDataPoint[] => {
    const dailyData = data.reduce((acc, curr) => {
        const dateKey = curr.date.split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = { date: new Date(dateKey).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), clicks: 0, conversions: 0, impressions: 0 };
        }
        acc[dateKey].clicks += curr.clicks;
        acc[dateKey].conversions += curr.conversions;
        acc[dateKey].impressions += curr.impressions;
        return acc;
    }, {} as Record<string, ChartDataPoint>);
    
    return Object.values(dailyData).sort((a, b) => {
        const [dayA, monthA] = a.date.split('/');
        const [dayB, monthB] = b.date.split('/');
        return new Date(`${monthA}/${dayA}/2024`).getTime() - new Date(`${monthB}/${dayB}/2024`).getTime();
    });
};

interface DashboardProps {
    view: string;
    campaigns: Campaign[];
    dailyPerformanceData?: any[];
    isLoading: boolean;
    error: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ view, campaigns, dailyPerformanceData = [], isLoading, error }) => {
    const [dateRange, setDateRange] = useState(getInitialDateRange);
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    
    // Insights State (Specific to Dashboard view logic, kept here)
    const [allInsights, setAllInsights] = useState<string[]>([]);
    const [isInsightLoading, setIsInsightLoading] = useState<boolean>(true);
    const [insightError, setInsightError] = useState<string | null>(null);

    useEffect(() => {
        const loadInsights = async () => {
            if (view === 'meta') {
                setIsInsightLoading(true);
                setInsightError(null);
                try {
                    const insightsList = await fetchAllInsights();
                    setAllInsights(insightsList);
                } catch (error: any) {
                    setInsightError("Não foi possível carregar os insights de IA neste momento.");
                } finally {
                    setIsInsightLoading(false);
                }
            } else {
                setAllInsights([]);
                setIsInsightLoading(false);
            }
        };
        loadInsights();
        // Reset selection when view changes
        setSelectedCampaignIds([]);
    }, [view]);

    const filteredPerformanceDataByDate = useMemo(
        () => filterDataByDate(mockPerformanceData, dateRange.start, dateRange.end),
        [dateRange]
    );

    const filteredCampaignTableData = useMemo(() => {
        if (selectedCampaignIds.length === 0) {
            return campaigns;
        }
        return campaigns.filter(campaign => selectedCampaignIds.includes(campaign.id));
    }, [campaigns, selectedCampaignIds]);

    const aggregatedTotals = useMemo(() => {
        return filteredCampaignTableData.reduce((acc, curr) => {
            acc.spent += curr.spent;
            acc.impressions += curr.impressions;
            acc.clicks += curr.clicks;
            acc.leads += curr.leads;
            return acc;
        }, { spent: 0, impressions: 0, clicks: 0, leads: 0 });
    }, [filteredCampaignTableData]);

    const chartData = useMemo(() => {
        // Para Meta Ads, usar dados diários passados via props
        if (view === 'meta' && dailyPerformanceData && dailyPerformanceData.length > 0) {
            return dailyPerformanceData;
        }
        
        // Para outras plataformas, usar mock data
        let baseData = filteredPerformanceDataByDate;
        const visibleCampaignIds = campaigns.map(c => c.id);
        let dataForChart = baseData.filter(d => visibleCampaignIds.includes(d.campaignId));

        if (selectedCampaignIds.length > 0) {
            dataForChart = dataForChart.filter(pd => selectedCampaignIds.includes(pd.campaignId));
        }

        return aggregateForChart(dataForChart);
    }, [view, dailyPerformanceData, filteredPerformanceDataByDate, selectedCampaignIds, campaigns]);

    const allCampaignsForFilter = useMemo(
        () => campaigns.map(({ id, name }) => ({ id, name })), 
        [campaigns]
    );

    const handleCampaignSelectionChange = (selectedIds: string[]) => {
        setSelectedCampaignIds(selectedIds);
    };
    
    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
    const formatNumber = (value: number) =>
        new Intl.NumberFormat('pt-BR').format(value);

    return (
        <div className="space-y-6">
            {/* Top Bar Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border-light dark:border-border-dark pb-4">
                <div className="flex flex-wrap items-center gap-4">
                    <CampaignFilter 
                        campaigns={allCampaignsForFilter}
                        selectedCampaignIds={selectedCampaignIds}
                        onSelectionChange={handleCampaignSelectionChange}
                        disabled={isLoading || !!error}
                    />
                </div>
                 {/* Add date picker here later if needed */}
            </div>
            
            {/* 1. Problem Finder / Distortion Area (HERO) */}
            <section>
                <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Diagnóstico de Distorções</h2>
                <AlertSection campaigns={filteredCampaignTableData} />
            </section>

            {/* 2. AI Insights contextually placed next to Alerts in a bigger view, or below */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    {/* General Metrics reduced in visual hierarchy */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MetricCard title="Investimento" value={formatCurrency(aggregatedTotals.spent)} />
                        <MetricCard title="Impressões" value={formatNumber(aggregatedTotals.impressions)} />
                        <MetricCard title="Cliques" value={formatNumber(aggregatedTotals.clicks)} />
                        <MetricCard title="Leads" value={formatNumber(aggregatedTotals.leads)} />
                    </div>
                    
                    {/* Main Chart */}
                     <div className="h-[400px]">
                        <CampaignPerformanceChart data={chartData} />
                     </div>
                 </div>

                 {/* AI Insights Column */}
                 <div className="lg:col-span-1">
                    <AIInsights
                        selectedCampaignIds={selectedCampaignIds}
                        allCampaigns={campaigns}
                        isLoading={isInsightLoading}
                        error={insightError}
                    />
                 </div>
            </div>

            {/* 3. Detailed Data */}
            <div>
                <CampaignTable data={filteredCampaignTableData} isLoading={isLoading} error={error} />
            </div>
        </div>
    );
};