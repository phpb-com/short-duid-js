/* global BigInt */
"use strict";
const Hashids = require("hashids/cjs");

function ShortDUID(shardId, salt, epochStart) {
  if (!(this instanceof ShortDUID)) {
    return new ShortDUID(shardId, salt, epochStart);
  }
  const duid = this;

  duid.shardId = BigInt(shardId) & ((1n << 10n) - 1n);
  duid.salt = salt;

  const now = BigInt(+new Date());
  duid.epochStart = BigInt(epochStart);
  if (now < duid.epochStart) {
    duid.epochStart = 0n;
  }

  duid.timeDrift = 0n;
  duid.hashids = new Hashids(duid.salt);

  duid.sequence = 0n;
  duid.tsSequence = [];

  return duid;
}

ShortDUID.prototype.getDUID = function (count) {
  let ret = [];
  let cnt;

  if (count === 0) {
    return [];
  }

  if (count > 8192 || count < 1) {
    cnt = 1;
  } else {
    cnt = count;
  }

  for (let i = 0; i < cnt; i++) {
    ret.push(this.hashids.encodeHex(this.getID().toString(16)));
  }

  return ret;
};

ShortDUID.prototype.getDUIDInt = function (count) {
  let ret = [];
  let cnt;

  if (count === 0) {
    return [];
  }

  if (count > 8192 || count < 0) {
    cnt = 1;
  } else {
    cnt = count;
  }

  for (let i = 0; i < cnt; i++) {
    ret.push(this.getID().toString(10));
  }

  return ret;
};

ShortDUID.prototype.getID = function () {
  const duid = this;

  // Calculate time part
  let now =
    (BigInt(+new Date()) - (duid.epochStart + duid.timeDrift)) &
    ((1n << 42n) - 1n);

  // Calculate shard id part
  const shid = duid.shardId << 12n; // Shift left by 12 bit

  // Calculate sequence part
  const seq = ++duid.sequence & ((1n << 12n) - 1n);
  if (
    typeof duid.tsSequence[seq] === "undefined" &&
    duid.tsSequence[seq] >= now
  ) {
    // Overflowing or drifting backwards
    now = duid.tsSequence[seq] + 1n;
    now &= (1n << 42n) - 1n;
  }
  duid.tsSequence[seq] = now;
  now <<= 22n;

  // Calculate final ID
  return now | shid | seq;
};

ShortDUID.prototype.getShardID = function () {
  return parseInt(this.shardId.toString(10), 10);
};

ShortDUID.prototype.getEpochStart = function () {
  return this.epochStart.toString(10);
};

ShortDUID.prototype.getSalt = function () {
  return this.salt;
};

ShortDUID.prototype.getCurrentTimeMs = function () {
  const duid = this;
  const estart = duid.epochStart;
  let now = BigInt(+new Date()); // Current system time in milliseconds

  now -= estart; // Calculate custom epoch and add/subtract drift time
  now &= (1n << 42n) - 1n;
  return now.toString(10);
};

ShortDUID.prototype.driftTime = function (drift) {
  if (typeof drift !== "undefined") {
    this.timeDrift = BigInt(Math.round(drift, 0));
  }

  return parseInt(this.timeDrift.toString(10), 10);
};

exports.init = ShortDUID;
