'use strict';
var bn = require('bn.js'),
    Hashids = require('hashids');

class ShortDUID {

    constructor(shard_id, salt, epoch_start) {
        this.shard_id = new bn(shard_id, 10);
        this.salt = salt;
        this.epoch_start = new bn(epoch_start, 10);

        this.drift = 0;
        this.hashids = new Hashids(this.salt);

        this.sequence_ = 0;
        this.ts_sequence_ = [];

    }

    getDUID(count) {
        let tmp = [];
        for(let i = 0; i < count; i++) {
            tmp.push(this._getNextSequence());
        }
        return tmp;
    }

    getDUIDInt(count) {
        let tmp = [];
        for(let i = 0; i < count; i++) {
            tmp.push(this._getNextSequence());
        }
        return tmp;
    }

    getShardID() {
    }

    getEpochStart() {
    }

    getSalt() {
    }

    getCurrentTimeMs() {
    }

    driftTime(milliseconds) {
        this.drift = milliseconds;
    }

    *_getAssembledDUID(count) {
        for(let i = 0; i < count; i++) {
            yield 1;
        }
    }

    _getNextSequence() {
        return this.sequence_++;
    }

    _getOurMillisFromEpoch() {
        return (new Date).now();
    }

}
exports.init = ShortDUID;
