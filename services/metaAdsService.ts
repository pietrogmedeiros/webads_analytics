// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const metaAdsService = {
  // Get OAuth URL for initiating the flow
  async getOAuthUrl() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/meta-ads/oauth-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          redirectUri: window.location.origin + '/callback'
        })
      });

      if (!response.ok) throw new Error('Failed to get auth URL');
      return await response.json();
    } catch (error) {
      console.error('Error getting OAuth URL:', error);
      throw error;
    }
  },

  // Handle OAuth callback
  async handleCallback(code: string, userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/meta-ads/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, redirectUri: window.location.origin + '/callback', userId })
      });

      if (!response.ok) throw new Error('Failed to complete OAuth callback');
      return await response.json();
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  },

  // Disconnect integration
  async disconnect(integrationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/meta-ads/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ integrationId })
      });

      if (!response.ok) throw new Error('Failed to disconnect');
      return await response.json();
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  },

  // Get campaigns from Meta Ads
  async getCampaigns(integrationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/meta-ads/${integrationId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }
};
