/* Party points only: the wheel selects an in-room challenge, never a wager. */
(function(root) {
  const categories=[
    {name:'Quick Wit',points:1,prompts:['Name five things people lose at a party.','Name five things you can wear on your head.','Name five foods served at a celebration.','Name five things that sparkle.','Name five places you would rather be than work.','Name five things you might forget on a trip.']},
    {name:'Showtime',points:2,prompts:['Give a dramatic 15-second acceptance speech for Best Party Guest.','Act out making breakfast in zero gravity until your team guesses it.','Give a silent weather forecast for a very windy day until your team guesses it.','Sell the room an imaginary luxury paper napkin in 15 seconds.','Do a 15-second sports commentary on someone tying a shoe.','Act out a penguin getting ready for a fancy party until your team guesses it.']},
    {name:'Memory Lane',points:3,prompts:['Study five objects chosen by another team for 10 seconds. Look away and name all five.','Have another team say six single-digit numbers once. Repeat them in order.','Have another team say four everyday words once. Repeat them in reverse order.','Look away. Name the color worn by one person from each other team.','Have another team say five first names once. Repeat all five in order.','Study four objects chosen by another team for 10 seconds. Look away and name them in reverse order.']},
    {name:'Team Spirit',points:2,prompts:['Two teammates alternate words to make a 12-word toast, without a restart.','Two teammates count from 1 to 20, alternating numbers without a mistake.','Two teammates alternate naming six different desserts, without repeats.','Two teammates alternate naming eight different animals, without repeats.','Two teammates alternate words to make a 10-word New Year’s resolution.','Two teammates alternate naming six different vacation destinations, without repeats.']},
    {name:'Word Play',points:1,prompts:['Say “midnight mayhem” five times without a mistake.','Name four words that rhyme with “night.”','Name five words that begin with the letter M.','Spell CHAMPAGNE out loud without a mistake.','Name four words that rhyme with “cheer.”','Name five words that end with the letter Y.']},
    {name:'Grand Finale',points:3,prompts:['Name the 12 months in reverse order, without a mistake.','Count backward from 30 to 1 without saying any multiple of 3.','Name ten different movies, without repeats.','Name ten different musical artists, without repeats.','Name eight different countries, without repeats.','Name eight different things you can find in a kitchen, without repeats.']}
  ];
  const spinDuration=3000;
  function create(names,rounds=2,duration=30){return {version:1,teams:names.map((name,id)=>({name,id,score:0})),rounds,duration,turn:0,phase:'ready',remaining:duration,deadline:null,spinEnd:null,slot:null,promptIndex:null,angle:0,spinFrom:0,seen:categories.map(()=>[]),awarded:false};}
  function left(s,now=Date.now()){return s.deadline===null?s.remaining:Math.max(0,Math.ceil((s.deadline-now)/1000));}
  function settle(s,now=Date.now()){
    if(s.phase==='spinning'&&now>=s.spinEnd)return {...s,phase:'challenge',spinEnd:null};
    if(s.phase==='active'&&left(s,now)===0)return {...s,phase:'review',remaining:0,deadline:null};
    return s;
  }
  function act(s,action,now=Date.now(),random=Math.random){
    s=settle(s,now);const team=s.turn%s.teams.length;
    if(action==='spin'&&s.phase==='ready'){
      const slot=Math.min(5,Math.max(0,Math.floor(random()*6)));
      const used=s.seen[slot].length===categories[slot].prompts.length?[]:s.seen[slot];
      const options=categories[slot].prompts.map((_,i)=>i).filter(i=>!used.includes(i));
      const promptIndex=options[Math.min(options.length-1,Math.max(0,Math.floor(random()*options.length)))];
      return {...s,phase:'spinning',spinEnd:now+spinDuration,slot,promptIndex,spinFrom:s.angle,angle:Math.ceil(s.angle/360)*360+1440+360-(slot*60+30),seen:s.seen.map((v,i)=>i===slot?[...used,promptIndex]:v)};
    }
    if(action==='start'&&['challenge','paused'].includes(s.phase))return {...s,phase:'active',deadline:now+s.remaining*1000};
    if(action==='pause'&&s.phase==='active')return {...s,phase:'paused',remaining:left(s,now),deadline:null};
    if(action==='review'&&['challenge','active','paused'].includes(s.phase))return {...s,phase:'review',remaining:left(s,now),deadline:null};
    if(action==='award'&&s.phase==='review')return {...s,awarded:!s.awarded,teams:s.teams.map(t=>t.id===team?{...t,score:t.score+(s.awarded?-1:1)*categories[s.slot].points}:t)};
    if(action==='next'&&s.phase==='review')return s.turn+1===s.teams.length*s.rounds?{...s,phase:'finished'}:{...s,turn:s.turn+1,phase:'ready',remaining:s.duration,deadline:null,spinEnd:null,slot:null,promptIndex:null,awarded:false};
    return s;
  }
  function valid(s){
    if(!s||s.version!==1||!Array.isArray(s.teams)||s.teams.length<2||s.teams.length>8||!s.teams.every((t,i)=>t.id===i&&typeof t.name==='string'&&t.name.trim()&&t.name.length<=24&&Number.isInteger(t.score)&&t.score>=0))return false;
    if(![1,2,3].includes(s.rounds)||![30,45,60].includes(s.duration)||!Number.isInteger(s.turn)||s.turn<0||s.turn>=s.teams.length*s.rounds||!['ready','spinning','challenge','active','paused','review','finished'].includes(s.phase))return false;
    if(!Number.isFinite(s.remaining)||s.remaining<0||s.remaining>s.duration||(s.phase==='active'?!Number.isFinite(s.deadline):s.deadline!==null)||(s.phase==='spinning'?!Number.isFinite(s.spinEnd):s.spinEnd!==null))return false;
    if(!Number.isFinite(s.angle)||!Number.isFinite(s.spinFrom)||s.angle<0||s.spinFrom<0||typeof s.awarded!=='boolean'||!Array.isArray(s.seen)||s.seen.length!==6||!s.seen.every((a,i)=>Array.isArray(a)&&a.length<=categories[i].prompts.length&&new Set(a).size===a.length&&a.every(n=>Number.isInteger(n)&&n>=0&&n<categories[i].prompts.length)))return false;
    if(s.phase==='ready')return s.slot===null&&s.promptIndex===null&&!s.awarded;
    return Number.isInteger(s.slot)&&!!categories[s.slot]&&Number.isInteger(s.promptIndex)&&typeof categories[s.slot].prompts[s.promptIndex]==='string'&&s.seen[s.slot].includes(s.promptIndex)&&(!s.awarded||(['review','finished'].includes(s.phase)&&s.teams[s.turn%s.teams.length].score>=categories[s.slot].points));
  }
  const api={categories,spinDuration,create,left,settle,act,valid};if(typeof module!=='undefined')module.exports=api;else root.Roulette=api;
})(globalThis);
