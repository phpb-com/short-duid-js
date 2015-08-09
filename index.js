'use strict';
var BN = require('bn.js'),
    Hashids = require('hashids');

exports.init = ShortDUID;

function ShortDUID(shard_id, salt, epoch_start) {
    if (!(this instanceof ShortDUID)) return new ShortDUID(shard_id, salt, epoch_start);
    var duid = this;

    duid.shard_id = new BN(shard_id, 10);
    duid.salt = salt;

    var now = new BN(+new Date, 10);
    duid.epoch_start = new BN(epoch_start, 10);
    if(now.cmp( duid.epoch_start ) === -1) {
        duid.epoch_start = new BN(0, 10);
    }

    duid.time_drift = 0;
    duid.hashids = new Hashids(duid.salt);

    duid.sequence = new BN(0, 10);
    duid.ts_sequence = [];

    return duid;
};

ShortDUID.prototype.getDUID = function(count) {
    var duid = this;

    return [1];
};

ShortDUID.prototype.getDUIDInt = function(count) {
    var duid = this;

    return [1];
};

ShortDUID.prototype.getShardID = function() {
    return this.shard_id.toString(10) * 1;
};

ShortDUID.prototype.getEpochStart = function() {
    return this.epoch_start.toString(10);
};

ShortDUID.prototype.getSalt = function() {
    return this.salt;
};

ShortDUID.prototype.getCurrentTimeMs = function() {
    return +new Date;
};

ShortDUID.prototype.driftTime = function() {
    return this.time_drift;
};
