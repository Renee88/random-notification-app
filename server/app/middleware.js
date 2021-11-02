const isAuthorized = (handshake) => {
    console.log(handshake.auth);
    return handshake.auth.token == "123";
}

module.exports = {
    isAuthorized
};