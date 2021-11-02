import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import {
  Alert,
  AlertTitle,
  Button,
  Card
} from "@mui/material";
import { operations } from "./StringManipulations";

const useStyles = makeStyles({
  card: {
    maxWidth: 400,
    minWidth: 344,
  },
  typography: {
    fontWeight: "bold",
  },
  actionRoot: {
    padding: "8px 8px 8px 16px",
    backgroundColor: "#fddc6c",
  },
  action: {
    margin: 0,
  },
  icons: {
    marginLeft: "auto",
  },
  expand: {
    padding: "8px 8px",
    transform: "rotate(0deg)",
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
});

const CustomSnackbar = ({ eleKey, notification, onClickDismiss, snackbarKeys, currShownMessagesKeys, enqueuMessageKey }) => {
  const classes = useStyles();
  const { message_type, id, message} = notification;

  const parseMessage = (message) => {
    const words = ["sale", "limited edition", "new"];
    const includedWords = [];

    for (let word of words) {
      if (message.toLowerCase().includes(word)) {
        includedWords.push(word);
      }
    }

    for (let word of includedWords) {
      message = operations.get(word)(message);
    }

    return message;
  };

  useEffect(() => {
    if (!snackbarKeys[notification.id - 1].includes(eleKey)) {
      snackbarKeys[notification.id - 1].push(eleKey);
    }
    if(!currShownMessagesKeys.includes(eleKey)){
      enqueuMessageKey(currShownMessagesKeys, eleKey);
    }

  },[])

  return (
    <Card className={classes.card}>
      <Alert
        severity={message_type.message_type}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => onClickDismiss()}
          >
            CLOSE
          </Button>
        }
      >
        <AlertTitle>{message_type.message_type}</AlertTitle>
        {parseMessage(message)}
      </Alert>
    </Card>
  );
};

export default CustomSnackbar;
