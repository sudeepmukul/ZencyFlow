// Utility to clean up duplicate timer logs
// Run this once in the browser console if you have duplicate logs

async function cleanupDuplicateTimerLogs() {
    const { openDB } = await import('./db.js');
    const db = await openDB();

    const logs = await db.getAll('timer_logs');
    console.log('Total timer logs:', logs.length);

    // Group by taskId and startTime
    const logMap = new Map();
    const duplicates = [];

    for (const log of logs) {
        const key = `${log.taskId}-${log.startTime}`;
        if (logMap.has(key)) {
            duplicates.push(log);
        } else {
            logMap.set(key, log);
        }
    }

    console.log('Found duplicates:', duplicates.length);

    // Delete duplicates
    for (const dup of duplicates) {
        await db.delete('timer_logs', dup.id);
        console.log('Deleted duplicate log:', dup.id);
    }

    console.log('Cleanup complete!');
    window.location.reload();
}

// To run: cleanupDuplicateTimerLogs()
