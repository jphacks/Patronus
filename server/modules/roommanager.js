'use strict';
const uuid = require('uuid');

module.exports = class RoomManager {
    constructor() {
        this.rooms = [];
    }

    makePairToken(socket) {
        const new_token = this.createTokenNum();
        if(!this.getSameToken(new_token)) {
            this.rooms.push({token: new_token, socket: socket});
            return new_token;
        } else {
            return this.makePairToken();
        }
    }

    /* 同じトークンの */
    getSameToken(target_token) {
        const same_token = this.rooms.filter((room) => {
            return room.token == target_token;
        });
        if(same_token.length == 1) {
            return same_token[0];
        } else {
            return null;
        }
    }

    createTokenNum() {
        const token = Math.floor(Math.random() * 1000000);
        return ('000000' + token).slice(-6);
    }
};
