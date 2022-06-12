'use strict';
const Hashids = require('hashids');

exports.init = ShortDUID;

function ShortDUID(shard_id, salt, epoch_start) {
    if (!(this instanceof ShortDUID)) return new ShortDUID(shard_id, salt, epoch_start);
    const duid = this;

    duid.shard_id = BigInt(shard_id) & ((1n << 10n) - 1n);
    duid.salt = salt;

    const now = BigInt(+new Date());
    duid.epoch_start = BigInt(epoch_start);
    if (now < duid.epoch_start) {
        duid.epoch_start = 0n;
    }

    duid.time_drift = 0n;
    duid.hashids = new Hashids(duid.salt);

    duid.sequence = 0n;
    duid.ts_sequence = [];

    return duid;
}

ShortDUID.prototype.getDUID = function (count) {
    let ret = [];
    let cnt;

    if (count === 0) return [];

    if (count > 8192 || count < 1) {
        cnt = 1;
    } else {
        cnt = count;
    }

    for (let i = 0; i < cnt; i++) {
        ret.push(this.hashids.encodeHex(this.getID().toString(16)));
    }

    return ret;
}

ShortDUID.prototype.getDUIDInt = function (count) {
    let ret = [];
    let cnt;

    if (count === 0) return [];

    if (count > 8192 || count < 0) {
        cnt = 1;
    } else {
        cnt = count;
    }

    for (let i = 0; i < cnt; i++) {
        ret.push(this.getID().toString(10));
    }

    return ret;
}

ShortDUID.prototype.getID = function () {
    const duid = this;

    // Calculate time part
    let now = (BigInt(+new Date()) - (duid.epoch_start + duid.time_drift)) & ((1n << 42n) - 1n);

    // Calculate shard id part
    const shid = duid.shard_id << 12n; // Shift left by 12 bit

    // Calculate sequence part
    const seq = (++duid.sequence & ((1n << 12n) - 1n));
    if (duid.ts_sequence[seq] !== undefined
        && duid.ts_sequence[seq] >= now) { // Overflowing or drifting backwards
        now = duid.ts_sequence[seq] + 1n;
        now &= ((1n << 42n) - 1n);
    }
    duid.ts_sequence[seq] = now;
    now <<= 22n;

    // Calculate final ID
    return (now | shid | seq);
}

ShortDUID.prototype.getShardID = function () {
    return parseInt(this.shard_id.toString(10), 10);
}

ShortDUID.prototype.getEpochStart = function () {
    return this.epoch_start.toString(10);
}

ShortDUID.prototype.getSalt = function () {
    return this.salt;
}

ShortDUID.prototype.getCurrentTimeMs = function () {
    const duid = this;
    const estart = duid.epoch_start;
    let now = BigInt(+new Date()); // Current system time in milliseconds

    now -= estart; // Calculate custom epoch and add/subtract drift time
    now &= ((1n << 42n) - 1n);
    return now.toString(10);
}

ShortDUID.prototype.driftTime = function (drift) {
    if (drift !== undefined) {
        this.time_drift = BigInt(Math.round(drift,0));
    }

    return parseInt(this.time_drift.toString(10), 10);
}
