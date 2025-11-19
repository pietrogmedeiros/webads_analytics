import express from 'express';
import GoogleOAuthService from '../services/googleOAuthService.js';

const router = express.Router();

// Generate OAuth URL with dynamic credentials
router.post('/google-ads/oauth-url', (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri } = req.body;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({ error: 'Missing required parameters: clientId, clientSecret, redirectUri' });
    }

    // Store credentials temporarily for this session
    req.session = req.session || {};
    req.session.googleClientId = clientId;
    req.session.googleClientSecret = clientSecret;
    req.session.googleRedirectUri = redirectUri;

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    }).toString()}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

// Generate OAuth URL
router.get('/google-ads/auth-url', (req, res) => {
  try {
    const redirectUri = req.query.redirectUri || process.env.GOOGLE_REDIRECT_URI;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    }).toString()}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Exchange auth code for tokens
router.post('/google-ads/callback', async (req, res) => {
  try {
    const { code, redirectUri, userId, clientId, clientSecret } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing required parameters: code, userId' });
    }

    // Exchange code for tokens (using provided credentials or env vars)
    const tokens = await GoogleOAuthService.exchangeAuthCode(
      code,
      redirectUri || process.env.GOOGLE_REDIRECT_URI,
      clientId || process.env.GOOGLE_CLIENT_ID,
      clientSecret || process.env.GOOGLE_CLIENT_SECRET
    );

    // Get user account info
    const accountInfo = await GoogleOAuthService.getGoogleAdsAccount(tokens.accessToken);

    // Store tokens
    const integration = GoogleOAuthService.storeTokens(userId, 'google-ads', {
      ...tokens,
      email: accountInfo.email,
      name: accountInfo.name,
      googleId: accountInfo.id
    });

    res.json({
      success: true,
      integration: {
        id: integration.id,
        provider: 'google-ads',
        email: accountInfo.email,
        name: accountInfo.name,
        connectedAt: integration.connectedAt
      }
    });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).json({ error: error.message || 'Failed to complete OAuth flow' });
  }
});

// Get OAuth status
router.get('/google-ads/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const integrations = GoogleOAuthService.getAllIntegrations(userId);
    const googleAdsIntegration = integrations.find(i => i.provider === 'google-ads');

    res.json({
      connected: !!googleAdsIntegration,
      integration: googleAdsIntegration || null
    });
  } catch (error) {
    console.error('Error checking OAuth status:', error);
    res.status(500).json({ error: 'Failed to check OAuth status' });
  }
});

// Disconnect integration
router.post('/google-ads/disconnect', async (req, res) => {
  try {
    const { integrationId } = req.body;

    if (!integrationId) {
      return res.status(400).json({ error: 'Missing integrationId' });
    }

    const integration = GoogleOAuthService.getTokens(integrationId);
    
    if (integration && integration.accessToken) {
      // Try to revoke the token
      await GoogleOAuthService.revokeToken(integration.accessToken);
    }

    // Remove from storage
    GoogleOAuthService.removeIntegration(integrationId);

    res.json({ success: true, message: 'Integration disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ error: error.message || 'Failed to disconnect integration' });
  }
});

export default router;
