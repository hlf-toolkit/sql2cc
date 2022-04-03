/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const sql2cc = require('./lib/sql2cc');

module.exports.SQL2CC = sql2cc;
module.exports.contracts = [sql2cc];