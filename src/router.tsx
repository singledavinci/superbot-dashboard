import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

import { AuthenticatedLayout, PublicEntry } from './routes/gates';
import { AlertRoutingPage } from './pages/alert-routing-page';
import { CollectionsPage } from './pages/collections-page';
import { FloorAlertsPage } from './pages/floor-alerts-page';
import { OverviewPage } from './pages/overview-page';
import { SettingsPage } from './pages/settings-page';
import { WalletsPage } from './pages/wallets-page';
import { WatchlistsPage } from './pages/watchlists-page';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Outlet />,
        children: [
            { index: true, element: <PublicEntry /> },
            {
                path: 'app',
                element: <AuthenticatedLayout />,
                children: [
                    { index: true, element: <Navigate to="overview" replace /> },
                    { path: 'overview', element: <OverviewPage /> },
                    { path: 'wallets', element: <WalletsPage /> },
                    { path: 'collections', element: <CollectionsPage /> },
                    { path: 'alert-routing', element: <AlertRoutingPage /> },
                    { path: 'watchlists', element: <WatchlistsPage /> },
                    { path: 'floor-alerts', element: <FloorAlertsPage /> },
                    { path: 'settings', element: <SettingsPage /> },
                ],
            },
        ],
    },
]);
