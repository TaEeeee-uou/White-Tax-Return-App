import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { IncomeInput } from './pages/IncomeInput';
import { ExpenseInput } from './pages/ExpenseInput';
import { Settings } from './pages/Settings';
import { Preview } from './pages/Preview';
import { History } from './pages/History';
import { Categories } from './pages/Categories';
import { DepreciationInput } from './pages/DepreciationInput';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<IncomeInput />} />
        <Route path="/expense" element={<ExpenseInput />} />
        <Route path="/depreciation" element={<DepreciationInput />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/history" element={<History />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;