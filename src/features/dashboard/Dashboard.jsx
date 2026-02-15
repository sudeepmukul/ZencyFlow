import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileDashboard } from './MobileDashboard';
import { DesktopDashboard } from './DesktopDashboard';

export function Dashboard() {
    const isMobile = useIsMobile();
    return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}
