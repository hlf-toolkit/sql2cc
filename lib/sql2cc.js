/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

//Chaincode for hlf-deploy-schema

'use strict';

const fs = require('fs');
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');


class SQL2CC extends Contract {

    async InitLedger(ctx) {

        const initentry = {
                table: 'Init Table',
                values: 'Init Values',
            };
            
        initentry.docType = 'entry';
        
        const entry_id = '0';
        
        await ctx.stub.putState(entry_id, Buffer.from(stringify(sortKeysRecursive(initentry))));

    }

    // CreateQuery adds a new query to the world state with the following details
    
    async CreateQuery(ctx, entry_id, JSONfile){
        
        const exists = await this.QueryExists(ctx, entry_id);
        
        if (exists) {
            throw new Error(`The query ${entry_id} already exists`);
        }
        
        await ctx.stub.putState(entry_id, Buffer.from(JSONfile));
        
        return JSON.stringify(JSONfile);
    }

    // ReadQuery returns the query stored in the world state with given id.

    async ReadQuery(ctx, entry_id) {
    
        const assetJSON = await ctx.stub.getState(entry_id); 

        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The query ${entry_id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing query in the world state with provided parameters.

    async UpdateQuery(ctx, entry_id) {
    
        const exists = await this.QueryExists(ctx, entry_id);
        
        if (!exists) {
            throw new Error(`The asset ${entry_id} does not exist`);
        }
        
        const dataBuffer = fs.readFileSync(JSONfile);
        
        const dataJSON = dataBuffer.toString()
        
        return ctx.stub.putState(entry_id, Buffer.from(dataJSON));
    }

    // DeleteQuery deletes a given query from the world state.
    async DeleteQuery(ctx, entry_id) {
        const exists = await this.QueryExists(ctx, entry_id);
        if (!exists) {
            throw new Error(`The query ${entry_id} does not exist`);
        }
        return ctx.stub.deleteState(entry_id);
    }

    // QueryExists returns true when asset with given ID exists in world state.
    async QueryExists(ctx, entry_id) {
        const assetJSON = await ctx.stub.getState(entry_id);
        return assetJSON && assetJSON.length > 0;
    }


    // GetAllQuery returns all assets found in the world state.
    async GetAllQuery(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = SQL2CC;