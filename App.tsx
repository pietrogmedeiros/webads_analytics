
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { ChatBot } from './components/ChatBot';
import { SettingsUser } from './components/SettingsUser';
import { SettingsParams } from './components/SettingsParams';
import { SettingsIntegrations } from './components/SettingsIntegrations';
import { SiteDashboard } from './components/SiteDashboard';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { fetchCampaignDetails } from './services/geminiService';
import { googleAdsService } from './services/googleAdsService';
import { metaAdsService } from './services/metaAdsService';
import { mockCampaignData } from './constants';
import type { Theme, Campaign } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('principal');

  // Lifted State from Dashboard
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // OAuth Callback Handling - Detecta retorno do Google
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      // Se houver um código de autorização na URL, assume-se que é o retorno do Google Ads
      if (code) {
          setCurrentView('settings-integrations');
      }
  }, []);

  // Fetch Data Logic (moved from Dashboard)
  useEffect(() => {
    // Don't fetch data for settings or site pages to save resources
    if (currentView.startsWith('settings-') || currentView === 'site' || currentView === 'simulator') {
        return;
    }

    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            let data: Campaign[] = [];
            
            if (currentView === 'meta') {
                try {
                    // Buscar o integration ID do localStorage (salvo após OAuth)
                    const integrationId = localStorage.getItem('meta_integration_id');
                    console.log('[DEBUG] Meta Ads integrationId:', integrationId);
                    
                    if (integrationId) {
                        const response = await metaAdsService.getCampaigns(integrationId);
                        
                        if (response.success && response.campaigns && response.campaigns.length > 0) {
                            data = response.campaigns.map((campaign: any) => ({
                                id: campaign.id,
                                name: campaign.name,
                                platform: 'Facebook Ads',
                                status: campaign.status === 'ACTIVE' ? 'Ativa' : campaign.status === 'PAUSED' ? 'Pausada' : 'Finalizada',
                                impressions: campaign.impressions || 0,
                                clicks: campaign.clicks || 0,
                                spent: parseFloat((campaign.spent || 0).toString()),
                                conversions: campaign.conversions || 0,
                                ctr: campaign.ctr || '0%',
                                roi: campaign.roi || '0%',
                            }));
                        } else {
                            setError("Nenhuma campanha encontrada no Meta Ads.");
                            data = [];
                        }
                    } else {
                        setError("Meta Ads não conectado. Por favor, faça a conexão nas Configurações.");
                        data = [];
                    }
                } catch (e) {
                    console.error("Meta Ads fetch error:", e);
                    setError("Nota: Exibindo dados demonstrativos (Erro ao buscar dados do Meta Ads).");
                    data = mockCampaignData.filter(c => c.platform === 'Facebook Ads');
                }
            } else if (currentView === 'google') {
                try {
                    // Buscar o integration ID do localStorage (salvo após OAuth)
                    const integrationId = localStorage.getItem('google_integration_id');
                    
                    if (integrationId) {
                        const response = await googleAdsService.getCampaigns(integrationId);
                        
                        if (response && response.campaigns && response.campaigns.length > 0) {
                            data = response.campaigns.map((campaign: any) => ({
                                id: campaign.id,
                                name: campaign.name,
                                platform: 'Google Ads',
                                status: campaign.status === 'ENABLED' ? 'Ativa' : campaign.status === 'PAUSED' ? 'Pausada' : 'Remocao',
                                impressions: campaign.impressions || 0,
                                clicks: campaign.clicks || 0,
                                spent: parseFloat((campaign.spent || campaign.cost || 0).toString()),
                                conversions: campaign.conversions || 0,
                                ctr: campaign.ctr || '0%',
                                roi: campaign.roi || '0%',
                            }));
                        } else {
                            setError("Nenhuma campanha encontrada.");
                            data = [];
                        }
                    } else {
                        setError("Google Ads não conectado. Por favor, faça a conexão nas Configurações.");
                        data = [];
                    }
                } catch (e) {
                    console.error("Google Ads fetch error:", e);
                    setError("Erro ao buscar campanhas do Google Ads.");
                    data = [];
                }
            } else if (currentView === 'tiktok') {
                await new Promise(resolve => setTimeout(resolve, 600));
                data = mockCampaignData.filter(c => c.platform === 'TikTok Ads');
            } else {
                await new Promise(resolve => setTimeout(resolve, 600));
                data = mockCampaignData;
            }

            setCampaignData(data);
        } catch (error: any) {
            setError(error.message || 'Falha ao carregar os dados das campanhas.');
        } finally {
            setIsLoading(false);
        }
    };
    
    loadInitialData();
  }, [currentView]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'meta': return 'Meta Ads Performance';
      case 'google': return 'Google Ads Performance';
      case 'tiktok': return 'TikTok Ads Performance';
      case 'site': return 'Analytics do Site';
      case 'simulator': return 'Simulador de Cenários';
      case 'settings-user': return 'Configurações de Usuário';
      case 'settings-params': return 'Parametrização do Sistema';
      case 'settings-integrations': return 'Integrações';
      default: return 'Visão Geral';
    }
  };

  const renderContent = () => {
      if (currentView === 'settings-user') {
          return <SettingsUser />;
      }
      if (currentView === 'settings-params') {
          return <SettingsParams />;
      }
      if (currentView === 'settings-integrations') {
          return <SettingsIntegrations />;
      }
      if (currentView === 'site') {
          return <SiteDashboard />;
      }
      if (currentView === 'simulator') {
          return <ScenarioSimulator />;
      }
      return (
        <Dashboard 
            view={currentView} 
            campaigns={campaignData}
            isLoading={isLoading}
            error={error}
        />
      );
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          currentTheme={theme} 
          toggleTheme={toggleTheme} 
          title={getPageTitle()}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
        
        {/* ChatBot Component Overlay - Passing campaignData context */}
        <ChatBot campaignData={campaignData} />
      </div>
    </div>
  );
};

export default App;
