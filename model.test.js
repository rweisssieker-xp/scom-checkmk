const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('./model.js');
test('ein leerer Baum ist unbekannt',()=>assert.equal(model.treeState({components:[]}), 'unknown'));
test('ein ausgefallenes redundantes Element ergibt Warnung, zwei ergeben kritisch',()=>{const c=[{group:'App',mode:'redundant',state:'crit'},{group:'App',mode:'redundant',state:'ok'}];assert.equal(model.treeState({components:c}),'warn');c[1].state='crit';assert.equal(model.treeState({components:c}),'crit')});
test('ein unbekanntes Element wird nicht gesund gerechnet',()=>assert.equal(model.treeState({components:[{group:'App',mode:'redundant',state:'unknown'},{group:'App',mode:'redundant',state:'ok'}]}),'unknown'));
test('Gruppen werden unabhängig aggregiert',()=>assert.equal(model.treeState({components:[{group:'App',mode:'redundant',state:'crit'},{group:'App',mode:'redundant',state:'ok'},{group:'DB',mode:'required',state:'crit'}]}),'crit'));
