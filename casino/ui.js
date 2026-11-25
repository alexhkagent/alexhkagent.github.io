(() => {
  const game = new Blackjack(), $ = id => document.getElementById(id);
  let busy = false;
  const pause = () => new Promise(r=>setTimeout(r,450));
  function cards(parent, hand, hidden=-1) {
    parent.replaceChildren();
    hand.forEach((c,i)=>{
      const el=document.createElement('div'); el.className='card'+(['♥','♦'].includes(c.suit)?' red':'')+(i===hidden?' back':'');
      el.setAttribute('role','img');el.setAttribute('aria-label',i===hidden?'Face-down card':c.rank+' '+c.suit);
      if(i!==hidden) {const rank=document.createElement('span'),suit=document.createElement('span');rank.className='rank';suit.className='suit';rank.textContent=c.rank;suit.textContent=c.suit;el.append(rank,suit);}
      parent.append(el);
    });
  }
  function render() {
    const playing=game.phase==='player', hidden=['player','bots'].includes(game.phase);
    $('bankroll').textContent=game.bank; $('bet-val').textContent=game.bet;
    cards($('dealer-hand'),game.dealer,hidden?1:-1);
    $('dealer-total').textContent=game.dealer.length?(hidden?Blackjack.value([game.dealer[0]])+' +':Blackjack.value(game.dealer)):'—';
    $('player-hand').replaceChildren();
    game.hands.forEach((h,i)=>{
      const box=document.createElement('div');box.className='player-hand'+(playing&&game.active===i?' active':'');
      const label=document.createElement('div');label.className='hand-label';label.textContent=`Hand ${i+1} · Bet ${h.bet} · ${Blackjack.value(h.cards)}${h.result?' · '+h.result:playing&&game.active===i?' · YOUR TURN':''}`;
      const row=document.createElement('div');row.className='hand';cards(row,h.cards);box.append(label,row);$('player-hand').append(box);
    });
    $('player-total').textContent=game.hands.length===1?Blackjack.value(game.hands[0].cards):game.hands.length?game.hands.length+' hands':'—';
    $('ai-seats').replaceChildren();
    game.bots.forEach(b=>{
      const box=document.createElement('section');box.className='ai-seat';box.setAttribute('aria-label',b.name+' AI player');
      const title=document.createElement('h2');title.textContent=b.name+' · AI';const info=document.createElement('p');info.textContent=b.style+' · Chips '+b.bank;
      const row=document.createElement('div');row.className='hand';cards(row,b.hands[0]?.cards||[]);
      const state=document.createElement('p'),h=b.hands[0];state.textContent=h?`Bet ${h.bet} · Total ${Blackjack.value(h.cards)} · ${h.result||b.action}`:'Sitting out';
      box.append(title,info,row,state);$('ai-seats').append(box);
    });
    $('message').textContent=game.message;
    $('btn-deal').textContent=game.bank<10?'New session':game.phase==='settled'?'Next Round':'Deal';
    $('btn-deal').disabled=busy||!['ready','settled'].includes(game.phase);
    $('btn-hit').disabled=$('btn-stand').disabled=busy||!playing;
    $('btn-double').disabled=busy||!game.canDouble();$('btn-split').disabled=busy||!game.canSplit();
    $('btn-reset').disabled=busy||!['ready','settled'].includes(game.phase);
    $('bet-down').disabled=busy||playing||game.bet<=10;$('bet-up').disabled=busy||playing||game.bet+10>game.bank;
  }
  async function continueRound() {
    if(game.phase!=='bots')return;
    for(let i=0;i<game.bots.length;i++) {
      if(!game.bots[i].hands.length)continue;
      do {game.message=game.bots[i].name+' is playing…';await pause();game.botStep(i);render();}while(!game.bots[i].hands[0].done);
    }
    game.message='Dealer plays…';game.phase='dealer';render();await pause();
    while(game.dealerStep()) {render();await pause();}
    game.settle();
  }
  async function action(name) {
    if(busy)return;busy=true;
    try {
      if(name==='deal') {if(game.bank<10)game.reset();else game.deal();}
      else if(name==='reset') {if(['ready','settled'].includes(game.phase))game.reset();}
      else game[name]();
      render();await continueRound();
    } finally {busy=false;render();}
  }
  for(const [id,name] of [['deal','deal'],['hit','hit'],['stand','stand'],['double','double'],['split','split'],['reset','reset']]) $('btn-'+id).addEventListener('click',()=>action(name));
  for(const [id,delta] of [['bet-down',-10],['bet-up',10]]) $(id).addEventListener('click',()=>{if(!busy&&['ready','settled'].includes(game.phase)) {game.bet=Math.max(10,Math.min(Math.floor(game.bank/10)*10,game.bet+delta));render();}});
  document.querySelectorAll('.cat-choice').forEach(button=>button.addEventListener('click',()=>{
    document.documentElement.style.setProperty('--cat-back','url("Photo/'+button.dataset.cat+'.jpg")');
    document.querySelectorAll('.cat-choice').forEach(c=>c.setAttribute('aria-pressed',String(c===button)));
  }));
  document.addEventListener('keydown',e=>{if(e.repeat||e.metaKey||e.ctrlKey||e.altKey||/^(INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY)$/.test(e.target.tagName))return; const name={h:'hit',s:'stand',d:'double',p:'split',' ':'deal',Enter:'deal'}[e.key];if(name){e.preventDefault();action(name);}});
  render();
})();
