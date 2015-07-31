var bn = require('bn.js'),
    Hashids = require('hashids');

class ShortDUID {

    constructor(shard_id, salt, epoch_start) {
        this.shard_id = new bn(shard_id, 10);
        this.salt = salt;
        this.epoch_start = new bn(epoch_start, 10);

        this.drift = 0;
        this.hashids = new Hashids(this.salt);
    }

    getDUID(count) {
    }

    getDUIDInt(count) {
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

}
exports.init = short_duid.ShortDUID;
