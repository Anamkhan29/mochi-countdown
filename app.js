const $=id=>document.getElementById(id);
const STORAGE='mochiCountdown_v1';
const defaults={goal:'Finish my creative challenge',deadline:'',milestones:[{name:'PLAN',done:false},{name:'BUILD',done:false},{name:'TEST',done:false},{name:'LAUNCH',done:false}],reminderEnabled:false,reminderTime:'18:00',soundEnabled:true,soundChoice:'mochi',lastReminderDate:''};
let state={...defaults};
function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE)||'{}');state={...defaults,...s,milestones:s.milestones||defaults.milestones}}catch{state={...defaults}}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function localDateValue(d){const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function initDeadline(){if(!state.deadline){const d=new Date();d.setDate(d.getDate()+5);d.setHours(20,0,0,0);state.deadline=localDateValue(d)}}
function renderMilestones(){const host=$('milestones');host.innerHTML='';state.milestones.forEach((m,i)=>{const row=document.createElement('div');row.className='milestone'+(m.done?' done':'');row.innerHTML=`<input type="checkbox" aria-label="Mark ${esc(m.name)} complete" ${m.done?'checked':''}><input type="text" aria-label="Milestone ${i+1}" maxlength="30" value="${esc(m.name)}">`;const cb=row.querySelector('input[type=checkbox]'),txt=row.querySelector('input[type=text]');cb.addEventListener('change',()=>{state.milestones[i].done=cb.checked;save();renderMilestones();updateProgress();if(cb.checked)toast('One tiny step completed! ✨')});txt.addEventListener('change',()=>{state.milestones[i].name=txt.value.trim()||`STEP ${i+1}`;save();renderMilestones()});host.append(row)})}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function updateProgress(){const done=state.milestones.filter(m=>m.done).length,pct=Math.round(done/state.milestones.length*100);$('progressFill').style.width=pct+'%';$('progressPercent').textContent=pct+'%';$('completedCount').textContent=`${done} of ${state.milestones.length} complete`;if(done===state.milestones.length)$('encouragement').textContent='You did it! Mochi is so proud of you! 🍓';else $('encouragement').textContent=done?`You've done ${done} tiny ${done===1?'step':'steps'}! Keep going. ♡`:'You\'ve got this. One tiny step at a time.'}
function updateTimer(){if(!state.deadline)return;const end=new Date(state.deadline).getTime(),now=Date.now(),diff=end-now;if(!Number.isFinite(end)){return}if(diff<=0){$('days').textContent='00';$('hours').textContent='00';$('minutes').textContent='00';$('seconds').textContent='00';$('statusPill').textContent='FINISH LINE!';$('countdownHeading').textContent='Deadline reached — celebrate!';$('encouragement').textContent='Whatever you accomplished, take a moment to be proud. ♡';return}const sec=Math.floor(diff/1000),d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.floor(sec%3600/60),s=sec%60;$('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(h).padStart(2,'0');$('minutes').textContent=String(m).padStart(2,'0');$('seconds').textContent=String(s).padStart(2,'0');$('statusPill').textContent=d<=1?'FINAL SPRINT ♡':'ON TRACK ♡';$('countdownHeading').textContent=d===0?'Your finish line is today!':'Time to make it happen';}
function updateDeadlineDisplay(){const dt=new Date(state.deadline);if(Number.isNaN(dt.getTime())){$('deadlineDisplay').textContent='Choose a valid deadline';return}$('deadlineDisplay').textContent=dt.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
let mochiAudioContext=null;
function unlockAudio(){
 try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return; if(!mochiAudioContext)mochiAudioContext=new AC(); if(mochiAudioContext.state==='suspended')mochiAudioContext.resume().catch(()=>{});}catch(e){console.warn('Audio unlock failed',e)}
}
['pointerdown','touchstart','keydown'].forEach(evt=>document.addEventListener(evt,unlockAudio,{once:true,passive:true}));
function playSelectedSoundAsync(){
 if(!state.soundEnabled)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  try{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC){toast('Audio is not supported in this browser.');resolve();return}
   if(!mochiAudioContext)mochiAudioContext=new AC();const ctx=mochiAudioContext;
   if(ctx.state==='suspended')ctx.resume().then(()=>scheduleNotes()).catch(reject);else scheduleNotes();
   function scheduleNotes(){
    const presets={
     mochi:[{f:659.25,t:0,d:.25},{f:783.99,t:.16,d:.25},{f:987.77,t:.32,d:.32}],bell:[{f:880,t:0,d:.65},{f:1174.66,t:.12,d:.55}],piano:[{f:523.25,t:0,d:.4},{f:659.25,t:.22,d:.4},{f:783.99,t:.44,d:.55}],pop:[{f:520,t:0,d:.12},{f:740,t:.12,d:.12},{f:880,t:.24,d:.15}],marimba:[{f:587.33,t:0,d:.25},{f:783.99,t:.18,d:.25},{f:1046.5,t:.36,d:.35}],twinkle:[{f:880,t:0,d:.22},{f:1174.66,t:.18,d:.25},{f:1568,t:.38,d:.4}],harp:[{f:523.25,t:0,d:.35},{f:659.25,t:.2,d:.35},{f:880,t:.4,d:.5}],cherry:[{f:660,t:0,d:.16},{f:990,t:.16,d:.16},{f:1320,t:.32,d:.3}],musicbox:[{f:784,t:0,d:.4},{f:988,t:.24,d:.4},{f:1174.66,t:.48,d:.5}],wind:[{f:659.25,t:0,d:.5},{f:880,t:.22,d:.5},{f:1046.5,t:.48,d:.5}],arcade:[{f:440,t:0,d:.12},{f:660,t:.12,d:.12},{f:880,t:.24,d:.18},{f:1100,t:.42,d:.2}]};
    const notes=presets[state.soundChoice]||presets.mochi,now=ctx.currentTime;
    notes.forEach(n=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=['bell','wind'].includes(state.soundChoice)?'sine':state.soundChoice==='piano'?'triangle':'sine';osc.frequency.setValueAtTime(n.f,now+n.t);gain.gain.setValueAtTime(.0001,now+n.t);gain.gain.exponentialRampToValueAtTime(state.soundChoice==='pop'?.11:.14,now+n.t+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+n.t+n.d);osc.connect(gain);gain.connect(ctx.destination);osc.start(now+n.t);osc.stop(now+n.t+n.d+.03)});
    const duration=Math.max(...notes.map(n=>n.t+n.d))+0.12;
    setTimeout(()=>resolve(),duration*1000);
   }
  }catch(e){reject(e)}
 });
}

function remainingTimeText(){
 const end=new Date(state.deadline||'').getTime(),diff=end-Date.now();
 if(!Number.isFinite(end)||!state.deadline)return 'your deadline is coming up';
 if(diff<=0)return 'your deadline has passed';
 const total=Math.floor(diff/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60);
 const parts=[];if(d)parts.push(`${d} ${d===1?'day':'days'}`);if(h)parts.push(`${h} ${h===1?'hour':'hours'}`);if(m||!parts.length)parts.push(`${m} ${m===1?'minute':'minutes'}`);
 return parts.join(' and ');
}
const quotes=['Small steps every day add up to big things.','You do not need to be perfect, just keep going.','Progress, not perfection. Mochi believes in you!','You are capable of more than you think.','A little effort today is a gift to tomorrow.'];
function reminderSpeechText(){const goal=state.goal||'your goal';return `Hey! This is a little reminder about your deadline for ${goal}. You have ${remainingTimeText()} left. ${quotes[Math.floor(Math.random()*quotes.length)]} Mochi is cheering you on!`}
function getAvailableVoices(){return ('speechSynthesis' in window)?window.speechSynthesis.getVoices():[];}
function populateVoiceChoices(){
 const select=$('voiceChoice');if(!select||!('speechSynthesis'in window))return;
 const voices=getAvailableVoices().filter(v=>/^en(-|$)/i.test(v.lang));
 const current=select.value;select.innerHTML='';
 if(!voices.length){const opt=document.createElement('option');opt.value='';opt.textContent='Cute voice (browser default)';select.append(opt);return;}
 // Prefer voices commonly described as feminine, friendly, or soft; the exact voice depends on the device/browser.
 const cuteFirst=voices.slice().sort((a,b)=>{
  const score=v=>/female|woman|girl|samantha|ava|aria|jenny|zira|susan|karen|moira|tessa|serena|google us english/i.test(v.name)?-1:0;
  return score(a)-score(b);
 });
 cuteFirst.forEach(v=>{const opt=document.createElement('option');opt.value=v.name;opt.textContent=`${v.name} (${v.lang})`;select.append(opt)});
 if(cuteFirst.some(v=>v.name===current))select.value=current;
 else {const preferred=cuteFirst.find(v=>/female|woman|girl|samantha|ava|aria|jenny|zira|susan|karen|moira|tessa|serena/i.test(v.name))||cuteFirst[0];select.value=preferred.name;}
}
function speakReminderAsync(){
 if(!$('voiceToggle')?.checked||!('speechSynthesis'in window))return Promise.resolve();
 return new Promise(resolve=>{
  const utter=new SpeechSynthesisUtterance(reminderSpeechText());utter.rate=.88;utter.pitch=1.55;utter.volume=1;
  const selected=$('voiceChoice')?.value;const voice=getAvailableVoices().find(v=>v.name===selected);
  if(voice)utter.voice=voice;
  utter.onend=resolve;utter.onerror=resolve;window.speechSynthesis.cancel();window.speechSynthesis.speak(utter);
  // Safety timeout in case the browser fails to fire speech callbacks.
  setTimeout(resolve,Math.max(20000,utter.text.length*140));
 });
}
async function playReminderSequence(){
 if(window.mochiReminderPlaying)return;window.mochiReminderPlaying=true;
 try{await playSelectedSoundAsync();await new Promise(r=>setTimeout(r,500));await speakReminderAsync();}
 catch(e){console.error('Mochi reminder sequence error',e);toast('Audio playback failed. Try again.');}
 finally{window.mochiReminderPlaying=false;}
}
function beep(){playSelectedSoundAsync().catch(()=>toast('Could not play sound.'))}
async function notify(title,body){if('Notification' in window&&Notification.permission==='granted'){try{new Notification(title,{body,icon:''})}catch{}}}
function checkReminder(){
 if(!state.reminderEnabled||!state.reminderTime)return;
 const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 const [rh,rm]=state.reminderTime.split(':').map(Number);if(!Number.isInteger(rh)||!Number.isInteger(rm))return;
 const scheduled=new Date(now.getFullYear(),now.getMonth(),now.getDate(),rh,rm,0,0);const elapsed=now.getTime()-scheduled.getTime();
 // Trigger once per local day, with a 15-minute late tolerance. Save before playing to avoid duplicate firing.
 if(elapsed>=0&&elapsed<=15*60*1000&&state.lastReminderDate!==today){
  state.lastReminderDate=today;save();unlockAudio();playReminderSequence();notify('Mochi says: time for a tiny step! 🍓','You can do this! Take a few minutes to work on your goal.');toast('Mochi reminder! Time for a tiny step 🍓');
 }
}

function loadUI(){ $('goalInput').value=state.goal;$('deadlineInput').value=state.deadline;$('reminderToggle').checked=state.reminderEnabled;$('reminderTime').value=state.reminderTime;$('soundToggle').checked=state.soundEnabled;$('soundChoice').value=state.soundChoice||'mochi';renderMilestones();updateProgress();updateTimer();updateDeadlineDisplay();notificationText()}
function notificationText(){let t=`Reminder time uses your device timezone (${Intl.DateTimeFormat().resolvedOptions().timeZone||'local time'}).`;if(!('Notification'in window))t=`Browser notifications are not supported (${Intl.DateTimeFormat().resolvedOptions().timeZone||'local time'}).`;else if(Notification.permission==='granted')t=`Notifications enabled (${Intl.DateTimeFormat().resolvedOptions().timeZone||'local time'}).`;else if(Notification.permission==='denied')t=`Notifications blocked (${Intl.DateTimeFormat().resolvedOptions().timeZone||'local time'}).`;$('notificationStatus').textContent=t}
$('saveSettings').addEventListener('click',()=>{unlockAudio();state.goal=$('goalInput').value.trim()||defaults.goal;state.deadline=$('deadlineInput').value;state.reminderEnabled=$('reminderToggle').checked;state.reminderTime=$('reminderTime').value||'18:00';state.soundEnabled=$('soundToggle').checked;save();$('missionTitle').innerHTML=esc(state.goal).replace(/\n/g,'<br>');updateTimer();updateDeadlineDisplay();notificationText();toast('Mission saved! ♡')});
$('permissionBtn').addEventListener('click',async()=>{if(!('Notification'in window)){toast('Notifications are not supported in this browser.');return}try{const p=await Notification.requestPermission();notificationText();toast(p==='granted'?'Notifications enabled! ♡':p==='denied'?'Notifications blocked. Sound can still work while the app is open.':'Permission not granted')}catch{toast('Could not request notification permission')}});
$('testReminder').addEventListener('click',()=>{unlockAudio();playReminderSequence();notify('Mochi says hello! 🍓',reminderSpeechText());toast('Mochi is testing your reminder! ♡')});$('soundTest').addEventListener('click',()=>{unlockAudio();playReminderSequence()});$('soundToggle').addEventListener('change',e=>{state.soundEnabled=e.target.checked;save()});$('soundChoice').addEventListener('change',e=>{unlockAudio();state.soundChoice=e.target.value;save();beep()});$('reminderToggle').addEventListener('change',e=>{unlockAudio();state.reminderEnabled=e.target.checked;save();toast(e.target.checked?'Daily reminder enabled ♡':'Daily reminder paused')});$('reminderTime').addEventListener('change',e=>{state.reminderTime=e.target.value;save();checkReminder()});$('deadlineInput').addEventListener('change',e=>{state.deadline=e.target.value;save();updateTimer();updateDeadlineDisplay()});$('goalInput').addEventListener('change',e=>{state.goal=e.target.value;save();$('missionTitle').innerHTML=esc(state.goal).replace(/\n/g,'<br>')});
load();initDeadline();loadUI();$('missionTitle').innerHTML=esc(state.goal).replace(/\n/g,'<br>');save();checkReminder();setInterval(()=>{updateTimer();checkReminder()},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateTimer();checkReminder()}});

if('speechSynthesis' in window){populateVoiceChoices();window.speechSynthesis.addEventListener?.('voiceschanged',populateVoiceChoices);setTimeout(populateVoiceChoices,500);}
$('voiceChoice')?.addEventListener('change',()=>toast('Voice changed! Test Mochi’s reminder ♡'));
