import React from 'react';
import { MasterCalendar } from './components/MasterCalendar';
import { SEOHead } from '../../components/seo/SEOHead';

export function Calendar() {
    return (
        <>
            <SEOHead
                title="Calendar"
                description="Manage your quests, tasks, and reminders with a visual calendar view."
                path="/calendar"
            />
            <div className="h-full">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">Calendar</h1>
                </div>
                <MasterCalendar />
            </div>
        </>
    );
}
