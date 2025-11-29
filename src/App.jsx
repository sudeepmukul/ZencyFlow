import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { Goals } from './features/goals/Goals';
import { Habits } from './features/habits/Habits';
import { Todo } from './features/todo/Todo';
import { Sleep } from './features/sleep/Sleep';
import { Journal } from './features/journal/Journal';
import { Calendar } from './features/calendar/Calendar';
import { Settings } from './features/settings/Settings';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <DataProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="goals" element={<Goals />} />
                            <Route path="habits" element={<Habits />} />
                            <Route path="todo" element={<Todo />} />
                            <Route path="sleep" element={<Sleep />} />
                            <Route path="journal" element={<Journal />} />
                            <Route path="calendar" element={<Calendar />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </DataProvider>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
