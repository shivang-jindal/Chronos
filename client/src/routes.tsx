import { Outlet, RouteObject, Navigate, useRoutes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { GlobePage } from './pages/GlobePage';
import { WorkbenchPage } from './pages/WorkbenchPage';
import { ChangeDetectionPage } from './pages/ChangeDetectionPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { ScenarioBuilderPage } from './pages/ScenarioBuilderPage';
import { AIChatPage } from './pages/AIChatPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/workbench" replace /> },
      { path: 'workbench', element: <WorkbenchPage /> },
      { path: 'globe', element: <GlobePage /> },
      { path: 'change-detection', element: <ChangeDetectionPage /> },
      { path: 'forecasting', element: <ForecastingPage /> },
      { path: 'scenario-builder', element: <ScenarioBuilderPage /> },
      { path: 'ai-chat', element: <AIChatPage /> },
      { path: 'data-explorer', element: <DataExplorerPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
];

export function AppRouter() {
  return useRoutes(routes);
}

