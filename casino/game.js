/* Six-deck blackjack. Every seat plays against the same dealer. */
class Blackjack {
  constructor(draw) { this.drawOverride = draw; this.reset(); }
  reset() {
    this.bank = 1000; this.bet = 20; this.phase = 'ready'; this.shoe = [];
    this.dealer = []; this.hands = []; this.active = 0; this.message = 'Place your bet, then deal.';
    this.bots = [{name:'Fortune', bank:1000, style:'Cautious · stands on 16', hands:[]}, {name:'Power', bank:1000, style:'Bold · hits to 18', hands:[]}];
  }
  static value(cards) {
    let total = 0, aces = 0;
    for (const c of cards) { total += c.rank === 'A' ? 11 : ['K','Q','J'].includes(c.rank) ? 10 : Number(c.rank); if(c.rank === 'A') aces++; }
    while(total > 21 && aces-- > 0) total -= 10;
    return total;
  }
  draw() {
    if(this.drawOverride) return this.drawOverride();
    if(!this.shoe.length) {
      for(let d=0;d<6;d++) for(const suit of ['♠','♥','♣','♦']) for(const rank of ['A','2','3','4','5','6','7','8','9','10','J','Q','K']) this.shoe.push({rank,suit});
      for(let i=this.shoe.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1)); [this.shoe[i],this.shoe[j]]=[this.shoe[j],this.shoe[i]];}
    }
    return this.shoe.pop();
  }
  hand(bet) { return {cards:[], bet, split:false, done:false, result:''}; }
  natural(h) { return !h.split && h.cards.length === 2 && Blackjack.value(h.cards) === 21; }
  current() { return this.hands[this.active]; }
  canSplit() { const h=this.current(); return this.phase==='player' && this.hands.length===1 && h.cards.length===2 && h.cards[0].rank===h.cards[1].rank && this.bank>=h.bet; }
  canDouble() { const h=this.current(); return this.phase==='player' && h.cards.length===2 && !h.done && this.bank>=h.bet; }
  deal() {
    if(!['ready','settled'].includes(this.phase) || this.bet<10 || this.bank<this.bet) return false;
    this.bank-=this.bet; this.hands=[this.hand(this.bet)]; this.dealer=[]; this.active=0;
    for(const b of this.bots) { b.hands=[]; b.action='Sitting out'; if(b.bank>=20) { b.bank-=20; b.hands=[this.hand(20)]; b.action='Waiting'; } }
    for(let i=0;i<2;i++) { for(const b of this.bots) if(b.hands.length) b.hands[0].cards.push(this.draw()); this.hands[0].cards.push(this.draw()); this.dealer.push(this.draw()); }
    this.phase='player';
    if(Blackjack.value(this.dealer)===21) {this.settle();return true;}
    if(this.natural(this.current())) {this.current().done=true; this.phase='bots';}
    this.message=this.phase==='player'?'Your move.':'Blackjack! The other players take their turns.';
    return true;
  }
  advance() {
    const h=this.current();
    if(Blackjack.value(h.cards)>=21) h.done=true;
    if(h.done) {
      while(this.active+1<this.hands.length) { this.active++; if(Blackjack.value(this.current().cards)<21) break; this.current().done=true; }
      if(this.current().done) this.phase='bots';
    }
    this.message=this.phase==='player'?`Your move${this.hands.length>1?' · hand '+(this.active+1)+' of '+this.hands.length:''}.`:'AI players take their turns.';
  }
  hit() { if(this.phase!=='player')return; this.current().cards.push(this.draw()); this.advance(); }
  stand() { if(this.phase!=='player')return; this.current().done=true; this.advance(); }
  double() { if(!this.canDouble())return; const h=this.current(); this.bank-=h.bet; h.bet*=2; h.cards.push(this.draw()); h.done=true; this.advance(); }
  split() {
    if(!this.canSplit())return;
    const h=this.current(), aces=h.cards[0].rank==='A'; this.bank-=h.bet;
    this.hands=[{...this.hand(h.bet),cards:[h.cards[0],this.draw()],split:true},{...this.hand(h.bet),cards:[h.cards[1],this.draw()],split:true}];
    // Split aces receive one card each and automatically stand.
    if(aces) { this.hands.forEach(h=>h.done=true); this.phase='bots'; this.message='Split aces: one card each. AI players take their turns.'; }
    else { this.message='Split · play hand 1 of 2.'; this.advance(); if(this.phase==='player' && Blackjack.value(this.current().cards)===21) this.advance(); }
  }
  botStep(index) {
    if(this.phase!=='bots')return false;
    const b=this.bots[index], h=b.hands[0]; if(!h || h.done)return false;
    const v=Blackjack.value(h.cards), target=index===0?16:18;
    if(this.natural(h) || v>=target) {h.done=true;b.action=v>21?'Bust':this.natural(h)?'Blackjack':'Stand on '+v;return false;}
    h.cards.push(this.draw()); const next=Blackjack.value(h.cards); b.action=next>21?'Bust on '+next:'Hit → '+next;
    if(next>=target)h.done=true;
    return !h.done;
  }
  dealerStep() { this.phase='dealer'; if(Blackjack.value(this.dealer)<17) {this.dealer.push(this.draw()); return true;}return false; }
  payout(h) {
    const p=Blackjack.value(h.cards),d=Blackjack.value(this.dealer),dn=d===21&&this.dealer.length===2;
    if(p>21) {h.result='Bust';return 0;}
    if(this.natural(h)) {h.result=dn?'Push':'Blackjack';return h.bet*(dn?1:2.5);}
    if(dn) {h.result='Lose';return 0;}
    if(d>21 || p>d) {h.result='Win';return 2*h.bet;}
    if(p===d) {h.result='Push';return h.bet;}
    h.result='Lose';return 0;
  }
  settle() {
    if(this.phase==='settled')return;
    for(const h of this.hands) this.bank+=this.payout(h);
    for(const b of this.bots) for(const h of b.hands) b.bank+=this.payout(h);
    this.phase='settled'; this.bet=Math.max(10,Math.min(this.bet,Math.floor(this.bank/10)*10));
    this.message=this.hands.map((h,i)=>(this.hands.length>1?'Hand '+(i+1)+': ':'')+h.result).join(' · ')+'.'+(this.bank<10?' New session to refill chips.':' Deal the next round when ready.');
  }
}
if(typeof module!=='undefined') module.exports=Blackjack;
