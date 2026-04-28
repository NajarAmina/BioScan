import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import './Dashboard.css';

import Sidebar from '../components/Shared/Sidebar';
import OverviewTab from '../components/Agent/OverviewTabl';
import Profile from '../components/Shared/Profile';
import AiAnalysisTab from '../components/Agent/AiAnalysisTab';
import Messagerie from '../components/Shared/Messagerie';
import ProductManagement from '../components/Agent/ProductManagement';

const AgentDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Ref pour éviter la boucle dans useEffect
  const activeTabRef = React.useRef(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab && requestedTab !== activeTabRef.current) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]); // ✅ searchParams uniquement

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key }, { replace: true });
    setIsSidebarOpen(false);
  };

  const switchToAiAnalysis = () => handleTabChange('aiAnalysis');

  const handleLogout = () => { logout(); navigate('/'); };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab />;
      case 'messages':   return <Messagerie user={user} role="agent" />;
      case 'products':   return <ProductManagement onSelectProduct={switchToAiAnalysis} />;
      case 'aiAnalysis': return <AiAnalysisTab />;
      case 'profile':    return <Profile user={user} updateUser={updateUser} />;
      default:           return <OverviewTab />;
    }
  };

  return (
    <div className="dashboardContainer">
      <button className="mobileMenuButton" type="button" onClick={() => setIsSidebarOpen(true)}>
        <FiMenu size={20} />
      </button>
      <Sidebar
        role="agent"
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={`dashboardOverlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <div className="dashboardContent">{renderContent()}</div>
    </div>
  );
};

export default AgentDashboard;