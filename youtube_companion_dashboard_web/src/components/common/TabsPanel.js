import React from 'react';
import { Paper, Tabs, Tab, Box } from '@mui/material';

const TabsPanel = ({ activeTab, setActiveTab, tabs }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fff', width: '100%', maxWidth: 700 }}>
    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
      {tabs.map((tab, idx) => (
        <Tab
          key={tab.label}
          label={tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label}
          icon={tab.icon}
        />
      ))}
    </Tabs>
    <Box>
      {tabs[activeTab].content}
    </Box>
  </Paper>
);

export default TabsPanel; 