import socket from "./ClientSocket";
import "./App.css";
import React, { useEffect, useState } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import CustomSnackbar from "./CustomSnackbar";

const snackbarKeys = [[], [], [], [], []];

function App() {
  const [notifications, setNotifications] = useState([]);
  const [shownMessagesKeys, setShownMessagesKeys] = useState([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [notificationDuration, setDuration] = useState(4000);

  const onClickDismiss = (key, message) => () => {
    const currNotifications = [...notifications];
    dequeueMessageKey();
    removeSameNotificationsAndCloseNext(message, currNotifications);
    closeSameSnackbars(message.id, currNotifications);
  };

  const removeSameNotificationsAndCloseNext = (message, currNotifications) => {
    closeNextNotification(shownMessagesKeys);
    removeSameNotifications(message.id, currNotifications);
  };

  const closeNextNotification = () => {
    if (shownMessagesKeys.length) {
      const nextMessageKey = dequeueMessageKey();
      closeSnackbar(nextMessageKey);
    }
  };

  const closeSameSnackbars = (notificationId) => {
    for (let key of snackbarKeys[notificationId - 1]) {
      setShownMessagesKeys(
        shownMessagesKeys.filter((currMessageKey) => currMessageKey !== key)
      );
      closeSnackbar(key);
    }
  };

  const removeSameNotifications = (notificationId) => {
    socket.emit("message clicked", notificationId);
    const currNotifications = filterCurrNotifications(
      notifications,
      notificationId
    );
    setNotifications(currNotifications);
  };

  const filterCurrNotifications = (notifications, removedNotificationId) => {
    const currNotifications = [...notifications];
    currNotifications.shift();
    return currNotifications.filter((notification) =>
      isNotBlockedMessage(notification, removedNotificationId)
    );
  };

  const isNotBlockedMessage = (notification, removedNotificationId) => {
    return removedNotificationId !== notification.id;
  };

  const addNotification = (notification) => {
    const currNotifications = [...notifications];
    enqueueNotification(notification, currNotifications);
    const currNotification = dequeueNotification(currNotifications);

    enqueueSnackbar(null, {
      variant: notification.message_type.message_type,
      autoHideDuration: notificationDuration,
      onClose: (event, reason) => {
        if ("timeout" === reason) {
          dequeueMessageKey(shownMessagesKeys);
        }
      },
      content: (key) => {
        return (
          <div key={key}>
            <CustomSnackbar
              eleKey={key}
              notification={currNotification}
              onClickDismiss={onClickDismiss(key, notification)}
              snackbarKeys={snackbarKeys}
              currShownMessagesKeys={shownMessagesKeys}
              enqueuMessageKey={enqueuMessageKey}
            />
          </div>
        );
      },
    });
    setNotifications(currNotifications);
  };

  const enqueuMessageKey = (currShownMessagesKeys, messageKey) => {
    shownMessagesKeys.push(messageKey);
  };

  const dequeueMessageKey = () => {
    const nextMessageKey = shownMessagesKeys[0];
    shownMessagesKeys.shift();
    return nextMessageKey;
  };

  const enqueueNotification = (notification, currNotifications) => {
    currNotifications.push(notification);
  };

  const dequeueNotification = (currNotifications) => {
    const nextNotification = { ...currNotifications[0] };
    currNotifications.shift();
    return nextNotification;
  };

  const cleanup = () => {
    socket.removeAllListeners();
    socket.disconnect();
  };

  useEffect(() => {
    socket.connect();
    socket.on("connect_error", (err) => {
      console.log(err instanceof Error);
      console.log(err.message);
      console.log(err.data);
    });

    socket.on("notification duration", (duration) => {
      setDuration(duration);
    });
    socket.on("notification", addNotification);
    socket.on("no notifications", () => socket.disconnect());

    return cleanup;
  }, []);

  return (
    <div className="App">
      <h1>Random Notifications App</h1>
    </div>
  );
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={4}>
      <App />
    </SnackbarProvider>
  );
}
