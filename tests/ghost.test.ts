import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRAMES, initialGhost, ghostBeats, parseSlip } from '../src/ghostModel';

const text = 'The chart was right. The question was stale.';
const valid = () => ({ understanding: 'The team needs a better question.', strength: { quote: 'The chart was right.', note: 'This sets up a concrete contrast.' }, move: { question: 'Who noticed first?', reason: 'A person makes the change concrete.' }, questions: ['What changed?'], mechanics: [] });
test('original and prompted defaults differ without requiring AI', () => {
  assert.equal(initialGhost(false).reading, true); assert.equal(initialGhost(true).reading, false);
  assert.equal(FRAMES.length, 6);
  assert.deepEqual(ghostBeats(initialGhost(true), [{label:'Memory',text:'What happened?'}]), [{label:'Memory',question:'What happened?'}]);
});
test('slips require a real quote, no more than two questions, and a bounded reading', () => {
  assert.equal(parseSlip(JSON.stringify(valid()), text, 'Question my argument', [], 1).strength.quote, 'The chart was right.');
  assert.throws(()=>parseSlip(JSON.stringify({...valid(),strength:{quote:'Invented evidence',note:'A note'}}),text,"Editor's slip",[],1));
  assert.throws(()=>parseSlip(JSON.stringify({...valid(),questions:['One?','Two?','Three?']}),text,"Editor's slip",[],1));
  assert.throws(()=>parseSlip(JSON.stringify({...valid(),understanding:'word '.repeat(181)}),text,"Editor's slip",[],1));
  assert.throws(()=>parseSlip(JSON.stringify({...valid(),mechanics:['A typo']}),text,'Help me go deeper',[],1));
});
test('frame checks account for every chosen beat and reference real paragraph numbers', () => {
  const map = { ...valid(), frame: [{beat:'Observation',status:'strong',paragraphs:[1],question:'What changed?'},{beat:'Meaning',status:'missing',paragraphs:[],question:'Why does it matter?'}] };
  assert.equal(parseSlip(JSON.stringify(map),text,'Check my frame',['Observation','Meaning'],1).frame?.length,2);
  assert.throws(()=>parseSlip(JSON.stringify(map),text,'Check my frame',['Observation','Change'],1));
  assert.throws(()=>parseSlip(JSON.stringify({...map,frame:[{...map.frame[0],paragraphs:[99]},map.frame[1]]}),text,'Check my frame',['Observation','Meaning'],1));
  assert.throws(()=>parseSlip(JSON.stringify({...map,frame:[map.frame[0],map.frame[0]]}),text,'Check my frame',['Observation','Meaning'],1));
});
