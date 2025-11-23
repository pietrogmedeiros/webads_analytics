import express from 'express';
import GoogleOAuthService from '../services/googleOAuthService.js';
import MetaOAuthService from '../services/metaOAuthService.js';

const router = express.Router();

// Get campaigns from Google Ads (mock for now, can be extended with real API)
router.get('/google-ads/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;

    const integration = GoogleOAuthService.getTokens(integrationId);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // In a real implementation, you would use the accessToken to call the Google Ads API
    // For now, returning mock data
    const mockCampaigns = [
      {
        id: 'campaign_1',
        name: 'Summer Campaign 2024',
        status: 'ENABLED',
        spent: 2500.00,
        impressions: 45000,
        clicks: 1200,
        conversions: 85,
        leads: 45,
        cpa: 29.41,
        platform: 'Google Ads'
      },
      {
        id: 'campaign_2',
        name: 'Brand Awareness Q4',
        status: 'ENABLED',
        spent: 5000.00,
        impressions: 120000,
        clicks: 2800,
        conversions: 156,
        leads: 89,
        cpa: 32.05,
        platform: 'Google Ads'
      }
    ];

    res.json({
      success: true,
      email: integration.email,
      campaigns: mockCampaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get campaigns from Meta Ads (real API)
router.get('/meta-ads/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;

    const integration = MetaOAuthService.getTokens(integrationId);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found. Please connect Meta Ads first.' });
    }

    if (!integration.adAccountId) {
      return res.status(400).json({ 
        error: 'No ad account selected',
        hint: 'Please select an ad account first'
      });
    }

    // Fetch real campaigns from Meta Ads API
    const campaigns = await MetaOAuthService.getCampaignsFromMeta(
      integration.accessToken,
      integration.adAccountId
    );

    res.json({
      success: true,
      email: integration.email,
      adAccountId: integration.adAccountId,
      campaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        platform: 'Facebook Ads',
        status: c.status === 'ACTIVE' ? 'Ativa' : c.status === 'PAUSED' ? 'Pausada' : 'Finalizada',
        impressions: c.impressions || 0,
        clicks: c.clicks || 0,
        spent: parseFloat(c.spent || 0),
        conversions: c.conversions || 0,
        ctr: c.clicks && c.impressions ? (c.clicks / c.impressions * 100).toFixed(2) + '%' : '0%',
        roi: c.conversions && c.spent ? (((c.conversions - c.spent) / c.spent) * 100).toFixed(2) + '%' : '0%',
      }))
    });
  } catch (error) {
    console.error('Error fetching Meta Ads campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns from Meta Ads' });
  }
});

export default router;
