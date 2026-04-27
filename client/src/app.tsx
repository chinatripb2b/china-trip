import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import EstimatePage from './pages/EstimatePage/EstimatePage';
import HomePage from './pages/HomePage/HomePage';
import NotFound from './pages/NotFound/NotFound';
import ProfilePage from './pages/ProfilePage/ProfilePage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="estimate" element={<EstimatePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
