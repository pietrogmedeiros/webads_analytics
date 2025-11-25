import express from 'express';
import { supabase, supabaseAdmin } from '../services/supabaseClient.js';

const router = express.Router();

// Get Meta Ads campaigns from Supabase facebook-ads table
router.get('/campaigns/meta-ads', async (req, res) => {
  try {
    // Usar admin client se disponível, senão usar public client
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facebook-ads')
      .select('*');

    if (error) {
      console.error('Error fetching from Supabase:', error);
      return res.status(500).json({ error: 'Failed to fetch Meta Ads campaigns', details: error.message });
    }

    // Consolidar dados por campanha (somar métricas dos dias)
    const campaignMap = {};
    
    (data || []).forEach((row) => {
      const campaignName = row.Campanha || 'Unknown Campaign';
      
      if (!campaignMap[campaignName]) {
        campaignMap[campaignName] = {
          id: `meta-${row.id}`,
          name: campaignName,
          platform: 'Meta',
          status: 'active',
          startDate: row.Data_inicio,
          endDate: row.Data_final,
          metrics: {
            impressions: 0,
            clicks: 0,
            spend: 0,
            leads: 0,
            costPerClick: 0,
            cpa: 0
          },
          dayCount: 0
        };
      }
      
      // Somar métricas
      campaignMap[campaignName].metrics.impressions += parseFloat(row.Impressoes) || 0;
      campaignMap[campaignName].metrics.clicks += parseFloat(row.Cliques) || 0;
      campaignMap[campaignName].metrics.spend += parseFloat(row['Valor investido']) || 0;
      campaignMap[campaignName].metrics.leads += parseFloat(row.leads) || 0;
      campaignMap[campaignName].dayCount += 1;
    });

    // Calcular médias e métricas derivadas
    const campaigns = Object.values(campaignMap).map((campaign) => ({
      ...campaign,
      metrics: {
        ...campaign.metrics,
        costPerClick: campaign.metrics.clicks > 0 
          ? parseFloat((campaign.metrics.spend / campaign.metrics.clicks).toFixed(2))
          : 0,
        cpa: campaign.metrics.leads > 0 
          ? parseFloat((campaign.metrics.spend / campaign.metrics.leads).toFixed(2))
          : 0
      }
    }));

    res.json({
      success: true,
      campaigns,
      total: campaigns.length
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Meta Ads daily performance data (for charts)
router.get('/campaigns/meta-ads/daily', async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facebook-ads')
      .select('*')
      .order('Data_inicio', { ascending: true });

    if (error) {
      console.error('Error fetching daily data:', error);
      return res.status(500).json({ error: 'Failed to fetch daily data', details: error.message });
    }

    // Transform data to daily performance format
    // Group by date and return clicks/leads for each day
    const dailyData = {};
    
    (data || []).forEach((row) => {
      const date = row.Data_inicio; // Format: YYYY-MM-DD
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          clicks: 0,
          leads: 0,
          impressions: 0,
          spend: 0
        };
      }
      
      dailyData[date].clicks += parseFloat(row.Cliques) || 0;
      dailyData[date].leads += parseFloat(row.leads) || 0;
      dailyData[date].impressions += parseFloat(row.Impressoes) || 0;
      dailyData[date].spend += parseFloat(row['Valor investido']) || 0;
    });

    // Convert to array and sort by date
    const dailyArray = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: dailyArray,
      total: dailyArray.length
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads/daily:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Check if Meta Ads data is available
router.get('/campaigns/meta-ads/status', async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { count, error } = await client
      .from('facebook-ads')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking Meta Ads status:', error);
      return res.json({ available: false, campaignCount: 0 });
    }

    res.json({
      available: true,
      campaignCount: count || 0
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads/status:', error);
    res.json({ available: false, campaignCount: 0 });
  }
});

// Get daily Meta Ads performance data (para gráfico)
router.get('/campaigns/meta-ads/daily', async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facebook-ads')
      .select('*')
      .order('Data_inicio', { ascending: true });

    if (error) {
      console.error('Error fetching daily data from Supabase:', error);
      return res.status(500).json({ error: 'Failed to fetch daily data', details: error.message });
    }

    // Agrupar dados por data
    const dailyMap = {};
    
    (data || []).forEach((row) => {
      const date = row.Data_inicio || 'unknown';
      
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date: date,
          clicks: 0,
          leads: 0,
          impressions: 0,
          spend: 0
        };
      }
      
      dailyMap[date].clicks += parseFloat(row.Cliques) || 0;
      dailyMap[date].leads += parseFloat(row.leads) || 0;
      dailyMap[date].impressions += parseFloat(row.Impressoes) || 0;
      dailyMap[date].spend += parseFloat(row['Valor investido']) || 0;
    });

    // Converter para array e ordenar por data
    const dailyData = Object.values(dailyMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: dailyData,
      total: dailyData.length
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads/daily:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
