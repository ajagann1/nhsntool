/**
 * Created by Arvind on 6/20/2016.
 */

var assert = require('assert');
var deltas = require('../deltas');
var fs = require('fs');

describe('deltas', function(){
  describe('#parseFile', function(){
    it('should return an array of the parsed values within the given file', function(done){
      //Check to make sure that all of the information from the rows in the file is being read.
      try {
        var parsed = deltas.parseFile(fs.readFileSync('test/data/conceptTest.txt', 'utf-8'), '\t');
        assert(parsed, 'Expected a parsed file');
        assert(parsed.length === 13, 'Incorrect amount of information parsed');
        assert(parsed[0].delimited.length === 5, 'Incorrect amount of columns parsed');
        done();
      }catch(err){
        done(err);
      }
    });
  });
  describe('#searchDescript', function(){
    it('should return any detected changes to the coded concept entry currently being examined', function(done){
      try{
        var parsedConcepts = deltas.parseFile(fs.readFileSync('test/data/conceptTest.txt', 'utf-8'), '\t');
        var parsedDescripts = deltas.parseFile(fs.readFileSync('test/data/descriptTest.txt', 'utf-8'), '\t');
        var conceptCode = parsedConcepts[1].delimited[0];
        var str = deltas.searchDescript(conceptCode, parsedDescripts, false);
        assert(str, "Couldn't find the specified concept code");
        assert(str.match(/\n/g).length === 2, "Didn't find the appropriate amount of descriptions in the test file");
        done();
      }catch(err){
        done(err);
      }
    });
  });
  describe('#searchRelation', function(){
    it('should return any detected changes to the coded concept entry currently being examined', function(done) {
      try {
        var parsedConcept = deltas.parseFile(fs.readFileSync('test/data/conceptRelTest.txt', 'utf-8'), '\t');
        var parsedRelation = deltas.parseFile(fs.readFileSync('test/data/relTest.txt', 'utf-8'), '\t');
        var conceptCode = parsedConcept[0].delimited[0];
        var str = deltas.searchRelation(conceptCode, parsedRelation, false);
        assert(str, "Couldn't find the specified concept code");
        assert(str.match(/\n/g).length === 3, "Didn't find the appropriate amount of relations in the test file");
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
