'use strict';
var BN = require('bn.js'),
    Hashids = require('hashids');

exports.init = ShortDUID;

function ShortDUID(shard_id, salt, epoch_start) {
    if (!(this instanceof ShortDUID)) return new ShortDUID(shard_id, salt, epoch_start);
    var duid = this;

    duid.shard_id = new BN(shard_id, 10).maskn(10);
    duid.salt = salt;

    var now = new BN(+new Date, 10);
    duid.epoch_start = new BN(epoch_start, 10);
    if(now.cmp( duid.epoch_start ) === -1) {
        duid.epoch_start = new BN(0, 10);
    }

    duid.time_drift = new BN(0, 10);
    duid.hashids = new Hashids(duid.salt);

    duid.sequence = new BN(0, 10);
    duid.ts_sequence = [];

    return duid;
};

ShortDUID.prototype.getDUID = function (count) {
    var duid = this;
    var ret = [];
    var cnt;

    if( count === 0 ) return [];

    (count > 8192 || count < 1 ) ? cnt = 1 : cnt = count;

    for(var i = 0; i < cnt; i++) {
        ret.push(this.hashids.encodeHex(this.getID().toString(16)));
    }

    return ret;
};

ShortDUID.prototype.getDUIDInt = function (count) {
    var duid = this;
    var ret = [];
    var cnt;

    if( count === 0 ) return [];

    (count > 8192 || count < 0 ) ? cnt = 1 : cnt = count;

    for(var i = 0; i < cnt; i++) {
        ret.push(this.getID().toString(10));
    }

    return ret;
};

ShortDUID.prototype.getID = function () {
    var duid = this;

    // Calculate time part
    var now = new BN(+new Date, 10).isub(duid.epoch_start.add(duid.time_drift)).imaskn(42).iushln(22);

    // Calculate shard id part
    var shid = duid.shard_id.ushln(12); // Shift left by 12 bit

    // Calculate sequence part
    var seq = duid.sequence.iadd(new BN(1, 10)).maskn(12);

    // Calculate final ID
    return now.or(shid.or(seq));
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
    var duid = this;
    var estart = duid.epoch_start.clone();
    var now = new BN(+new Date, 10); // Current system time in milliseconds converted to BN object

    now.isub(estart.iadd(duid.time_drift)).imaskn(42); // Calculate custome epoch and add/subtract drift time
    return now.toString(10);
};

ShortDUID.prototype.driftTime = function(drift) {
    if(drift !== undefined) {
        this.time_drift = new BN(drift, 10);
    }

    return this.time_drift.toString() * 1;
};
