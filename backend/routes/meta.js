import express from 'express';
import MetaOAuthService from '../services/metaOAuthService.js';

const router = express.Router();

// Generate Meta Ads OAuth URL using credentials from .env
router.post('/meta-ads/oauth-url', (req, res) => {
  try {
    const { redirectUri } = req.body;

    if (!redirectUri) {
      return res.status(400).json({ error: 'Missing required parameter: redirectUri' });
    }

    // Use credentials from environment variables
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        error: 'Meta credentials not configured',
        hint: 'Set META_CLIENT_ID and META_CLIENT_SECRET in backend/.env'
      });
    }

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'ads_read,read_insights,business_management',
      response_type: 'code',
      state: Math.random().toString(36).substring(7)
    }).toString()}`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

// Handle Meta Ads OAuth callback
router.post('/meta-ads/callback', async (req, res) => {
  try {
    const { code, redirectUri, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing required parameters: code, userId' });
    }

    // Exchange code for tokens using env vars
    const tokens = await MetaOAuthService.exchangeAuthCode(
      code,
      redirectUri || process.env.META_REDIRECT_URI,
      process.env.META_CLIENT_ID,
      process.env.META_CLIENT_SECRET
    );

    // Get user account info
    const accountInfo = await MetaOAuthService.getMetaAccountInfo(tokens.accessToken);

    // Store tokens with ad account ID
    const integration = MetaOAuthService.storeTokens(userId, 'meta-ads', {
      ...tokens,
      email: accountInfo.email,
      name: accountInfo.name,
      metaId: accountInfo.id,
      adAccountId: adAccountId || '' // Can be set later
    });

    res.json({
      success: true,
      integration: {
        id: integration.id,
        provider: 'meta-ads',
        email: accountInfo.email,
        name: accountInfo.name,
        connectedAt: integration.connectedAt
      }
    });
  } catch (error) {
    console.error('Error in Meta OAuth callback:', error);
    res.status(500).json({ error: error.message || 'Failed to complete OAuth flow' });
  }
});

// Check integration status
router.get('/meta-ads/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const integrations = MetaOAuthService.getAllIntegrations(userId);
    
    res.json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Disconnect integration
router.post('/meta-ads/disconnect', (req, res) => {
  try {
    const { integrationId } = req.body;

    if (!integrationId) {
      return res.status(400).json({ error: 'integrationId is required' });
    }

    MetaOAuthService.removeIntegration(integrationId);

    res.json({
      success: true,
      message: 'Integration disconnected'
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

export default router;
