CREATE DATABASE IF NOT EXISTS notifications;

USE notifications;

CREATE TABLE IF NOT EXISTS message_types (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    message_type VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS messages(
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    type_id INT NOT NULL,
    message VARCHAR(50) NOT NULL,
    FOREIGN KEY (type_id)
        REFERENCES message_types (id)
);

CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS clicked_messages(
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    message_id INT NOT NULL,
    FOREIGN KEY (user_id)
        REFERENCES users (id),
    FOREIGN KEY (message_id)
        REFERENCES messages (id)
);

INSERT INTO message_types
VALUES  (NULL, "info"),
        (NULL, "warning"),
        (NULL, "success"),
        (NULL, "error");

INSERT INTO messages
VALUES  (NULL, 1, "Big sale next week"),
        (NULL, 1, "New auction next month"),
        (NULL, 2, "Limited edition books for next auction"),
        (NULL, 3, "New books with limited edition coming next week"),
        (NULL, 4, "Last items with limited time offer");

