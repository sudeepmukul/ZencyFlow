export const NotificationManager = {
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }

        return false;
    },

    send: (title, options = {}) => {
        if (Notification.permission === "granted") {
            const notification = new Notification(title, {
                icon: '/vite.svg', // Replace with app icon if available
                badge: '/vite.svg',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    },

    schedule: (title, options, delayMs) => {
        setTimeout(() => {
            NotificationManager.send(title, options);
        }, delayMs);
    }
};
