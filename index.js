/* global BigInt */
'use strict'
const Hashids = require('hashids/cjs')

class ShortDUID {
  constructor (shardId, salt, epochStart) {
    if (!(this instanceof ShortDUID)) {
      return new ShortDUID(shardId, salt, epochStart)
    }
    const duid = this

    duid.shardId = BigInt.asUintN(10, BigInt(shardId))
    duid.salt = salt

    const now = BigInt(+new Date())
    duid.epochStart = BigInt(epochStart)
    if (now < duid.epochStart) {
      duid.epochStart = 0n
    }

    duid.timeDrift = 0n
    duid.hashids = new Hashids(duid.salt)

    duid.sequence = 0n
    duid.tsSequence = []

    return duid
  }

  getDUID (count) {
    const ret = []
    let cnt

    if (count === 0) {
      return []
    }

    if (count > 8192 || count < 1) {
      cnt = 1
    } else {
      cnt = count
    }

    for (let i = 0; i < cnt; i++) {
      ret.push(this.hashids.encodeHex(this.getID().toString(16)))
    }

    return ret
  }

  getDUIDInt (count) {
    const ret = []
    let cnt

    if (count === 0) {
      return []
    }

    if (count > 8192 || count < 0) {
      cnt = 1
    } else {
      cnt = count
    }

    for (let i = 0; i < cnt; i++) {
      ret.push(this.getID().toString(10))
    }

    return ret
  }

  getID () {
    const duid = this

    // Calculate time part
    let now = BigInt.asUintN(
      42,
      BigInt(+new Date()) - (duid.epochStart + duid.timeDrift)
    )

    // Calculate shard id part
    const shid = duid.shardId << 12n // Shift left by 12 bit

    // Calculate sequence part
    const seq = BigInt.asUintN(12, ++duid.sequence)
    if (
      typeof duid.tsSequence[seq] !== 'undefined' &&
      duid.tsSequence[seq] >= now
    ) {
      // Overflowing or drifting backwards
      now = BigInt.asUintN(42, ++duid.tsSequence[seq])
    }
    duid.tsSequence[seq] = now
    now <<= 22n

    // Calculate final ID
    return now | shid | seq
  }

  getShardID () {
    return parseInt(this.shardId.toString(10), 10)
  }

  getEpochStart () {
    return this.epochStart.toString(10)
  }

  getSalt () {
    return this.salt
  }

  getCurrentTimeMs () {
    const duid = this
    const estart = duid.epochStart
    let now = BigInt(+new Date()) // Current system time in milliseconds

    now = BigInt.asUintN(42, now - estart) // Calculate custom epoch and add/subtract drift time
    return now.toString(10)
  }

  driftTime (drift) {
    if (typeof drift !== 'undefined') {
      this.timeDrift = BigInt(Math.round(drift))
    }

    return parseInt(this.timeDrift.toString(), 10)
  }
}

exports.init = ShortDUID
