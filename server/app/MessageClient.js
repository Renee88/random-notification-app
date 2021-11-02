const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("notifications", "root", "password", {
    host: "localhost",
    dialect: "mysql",
});

const user = sequelize.define(
    "user", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        user: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    }
);

const messageType = sequelize.define(
    "message_type", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        message_type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    }
);

const message = sequelize.define(
    "message", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: messageType,
                key: "id",
            },
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    }
);

const clickedMessage = sequelize.define(
    "clicked_message", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: user,
                key: "id",
            },
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: message,
                key: "id",
            },
        },
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    }
);

message.belongsTo(messageType, {
    foreignKey: {
        name: "type_id",
    },
});

clickedMessage.hasOne(user, {
    foreignKey: {
        name: "id",
    },
});
clickedMessage.hasOne(message, {
    foreignKey: {
        name: "id",
    },
});

const getShowDurationMilis = () => {
    return Math.ceil(Math.random() * 4) * 1000;
}

const sendNotification = (serverSocket, socket, notification) => {
    serverSocket.to(socket.id).emit("notification", notification);
};

const stopInterval = (serverSocket, socket, intervalId) => {
    serverSocket.to(socket.id).emit("no notifications", null);
    socket.disconnect(true);
    clearInterval(intervalId);
};

const handleConnection = async(socket) => {
    try {
        const newUser = await user.create({ user: socket.id });
        const notification = await chooseNotification(newUser.get().user);
        sendNotification(socket, notification);
    } catch (err) {
        console.log(err);
    }
};

const chooseNotification = async(userName) => {
    let i = 0;
    let currMessage = null;
    let notificationId = Math.floor(Math.random() * 5) + 1;
    const currUser = await user.findOne({ where: { user: userName } });
    const allClickedMessages = await clickedMessage.findAll({
        where: { user_id: currUser.get().id },
    });

    for (i = 0; isMessageClicked(allClickedMessages, notificationId) && i < 5; ++i) {
        notificationId = ((notificationId + i) % 5) + 1;
    }

    if (i < 5) {
        currMessage = await message.findByPk(notificationId, {
            include: messageType,
        });
        const message_type = currMessage.message_type.get();
        currMessage.get().message_type = message_type;
        currMessage = currMessage.get();
    }

    return currMessage;
};

const isMessageClicked = (allClickedMessages, notificationId) => {
    return (-1 !== allClickedMessages.findIndex(
        (clickedMessage) => clickedMessage.get().message_id === notificationId
    ));
};

const setNotificationInterval = (serverSocket, socket) => {
    const sec = Math.floor(Math.random() * 5) + 5;
    const intervalId = setInterval(async() => {
        const notification = await chooseNotification(socket.id);
        if (!notification) {
            stopInterval(serverSocket, socket, intervalId);
        } else {
            sendNotification(serverSocket, socket, notification);
        }
    }, sec * 1000);
};

const saveToClickedMessages = async(socket, messageId) => {
    try {
        const currUser = await user.findOne({ where: { user: socket.id } });
        const newClickedMessage = await clickedMessage.create({
            user_id: currUser.get().id,
            message_id: messageId,
        });
    } catch (err) {
        console.log(err);
    }
};

const handleMessageClicked = async(socket, messageId) => {
    try {
        await saveToClickedMessages(socket, messageId);
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    handleConnection,
    setNotificationInterval,
    handleMessageClicked,
    saveToClickedMessages,
    getShowDurationMilis
};