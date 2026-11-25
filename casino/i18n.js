/* UI-only localization: switching language preserves the current round. */
window.CasinoI18n = (() => {
  const dictionary = {
  "♠ 3CATS · HOME": "♠ 3CATS · 首页",
  "♠ 3CATS CLUB": "♠ 3CATS 俱乐部",
  "Virtual chips": "虚拟筹码",
  "3Cats private table · Blackjack": "3Cats 专属牌桌 · 二十一点",
  "BLACKJACK PAYS 3 : 2   ◆   DEALER STANDS ON 17": "黑杰克赔付 3 : 2   ◆   庄家 17 点停牌",
  "Dealer": "庄家",
  "You": "你",
  "Your chips": "你的筹码",
  "Your lucky cat": "你的幸运猫",
  "How to play & table rules": "玩法与牌桌规则",
  "Deal": "发牌",
  "Hit": "要牌",
  "Stand": "停牌",
  "Double": "加倍",
  "Split": "分牌",
  "Next Round": "下一局",
  "New session": "重新开始",
  "New session · 1,000 chips": "重新开始 · 1,000 筹码",
  "hit": "要牌",
  "stand": "停牌",
  "double": "加倍",
  "split": "分牌",
  "deal": "发牌",
  "18 · Fortune · Power   /   A little luck. A little strategy.   /   Virtual chips only": "18 · Fortune · Power   /   一点运气，一点策略。   /   仅使用虚拟筹码",
  "Place your bet, then deal.": "请先下注，然后发牌。",
  "Fresh shoe. Place your bet, then deal.": "新牌靴已就绪，请下注并发牌。",
  "Your move.": "轮到你了。",
  "Blackjack! The other players take their turns.": "黑杰克！其他玩家继续行动。",
  "AI players take their turns.": "AI 玩家正在行动。",
  "Dealer plays…": "庄家正在行动……",
  "Split · play hand 1 of 2.": "已分牌 · 请操作第 1 手，共 2 手。",
  "Split aces: one card each. AI players take their turns.": "分 A：每手只补一张牌。AI 玩家继续行动。",
  "Win": "获胜",
  "Lose": "落败",
  "Push": "平局",
  "Bust": "爆牌",
  "Blackjack": "黑杰克",
  "Waiting": "等待中",
  "Sitting out": "本局休息",
  "YOU WIN!": "你赢了！",
  "BLACKJACK! YOU WIN": "黑杰克！你赢了！",
  "DEALER WINS": "庄家获胜",
  "EVEN ROUND": "本局收支持平",
  "YOUR TURN": "轮到你",
  "Hand": "第",
  "Bet": "下注",
  "Total": "点数",
  "Chips": "筹码",
  "chips": "筹码",
  "hands": "手牌",
  "Cautious · stands on 16": "稳健型 · 16 点起停牌",
  "Bold · hits to 18": "进取型 · 要牌至 18 点",
  "Face-down card": "背面朝上的牌",
  "Dealer hand": "庄家手牌",
  "Your hand": "你的手牌",
  "Choose card back": "选择牌背",
  "Decrease bet": "减少下注",
  "Increase bet": "增加下注",
  "Get closer to 21 than the dealer without going over. Face cards count as 10; aces count as 1 or 11. Hit takes a card; Stand ends your turn. Double doubles your bet, gives exactly one card, and ends your turn.": "目标是在不超过 21 点的前提下，比庄家更接近 21 点。J、Q、K 计 10 点，A 计 1 或 11 点。「要牌」补一张牌；「停牌」结束当前手牌的行动；「加倍」追加同额下注，只补一张牌后停牌。",
  "Six decks. Dealer stands on all 17s, including soft 17. A two-card blackjack pays 3:2; other wins pay 1:1; ties return your bet. Dealer blackjack is checked immediately. Split an identical-rank pair once into two hands, with an equal extra bet. Play the highlighted hand first. Double after splitting is allowed. Split aces receive one card each; a split 21 pays 1:1. No insurance or surrender. Fortune and Power are rule-based AI players with independent balances; each bets 20 and plays against the dealer. Fortune stands on 16 or more; Power stands on 18 or more. They do not split or double. Players below 20 chips sit out until a new session. Bets use increments of 10 virtual chips; you start with 1,000. No real money.": "使用六副牌。庄家在所有 17 点（包括软 17）停牌。起手两张组成的黑杰克赔付 3:2，普通获胜赔付 1:1，平局退还下注。发牌后立即检查庄家黑杰克。两张同牌面点数的牌可分牌一次，追加同额下注后形成两手牌，先操作高亮的一手。分牌后允许加倍；分 A 后每手只补一张牌并停牌，分牌后的 21 点按 1:1 赔付。不提供保险或投降。Fortune 和 Power 是使用固定规则的 AI 玩家，各有独立筹码，每局下注 20，与庄家比较点数。Fortune 在 16 点及以上停牌，Power 要牌至 18 点及以上；AI 不分牌、不加倍。AI 筹码不足 20 时休息，重新开始后恢复。下注以 10 个虚拟筹码为单位，初始筹码为 1,000。不涉及真实金钱。",
  "For classroom exploration: compare hitting and standing on the same total when the dealer shows different cards.": "课堂探索：当庄家明牌不同时，比较自己持有相同点数时选择要牌或停牌的结果。"
};
  let language = 'en';
  try { language = localStorage.getItem('3cats-language') === 'zh' ? 'zh' : 'en'; } catch (_) {}
  const textNodes=[], attributes=[];
  const walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())) {
    if(node.parentElement.closest('script,style,#message')) continue;
    const key=node.textContent.trim();
    if(dictionary[key])textNodes.push([node,node.textContent,key]);
  }
  document.querySelectorAll('[aria-label]').forEach(el=>{const key=el.getAttribute('aria-label');if(dictionary[key])attributes.push([el,key]);});
  function t(text) {
    if(language==='en')return text;
    if(dictionary[text])return dictionary[text];
    return text.replace(/Your move · hand (\d+) of (\d+)\./g,'轮到你了 · 第 $1 手，共 $2 手。')
      .replace(/(Fortune|Power) is playing…/g,'$1 正在行动……')
      .replace(/Stand on (\d+)/g,'停牌 · $1 点').replace(/Bust on (\d+)/g,'爆牌 · $1 点').replace(/Hit → (\d+)/g,'要牌 → $1 点')
      .replace(/Hand (\d+): /g,'第 $1 手：')
      .replace(/ New session to refill chips\./g,' 请重新开始以补充筹码。')
      .replace(/ Deal the next round when ready\./g,' 准备好后可开始下一局。')
      .replace(/Blackjack/g,'黑杰克').replace(/Win/g,'获胜').replace(/Lose/g,'落败').replace(/Push/g,'平局').replace(/Bust/g,'爆牌');
  }
  function apply() {
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    document.title=language==='zh'?'3Cats Casino · 澳门之夜':'3Cats Casino · Macau Nights';
    textNodes.forEach(([node,original,key])=>{node.textContent=language==='zh'?original.replace(key,dictionary[key]):original;});
    attributes.forEach(([el,key])=>el.setAttribute('aria-label',t(key)));
    const toggle=document.getElementById('language-toggle');toggle.textContent=language==='zh'?'English':'中文';toggle.setAttribute('aria-label',language==='zh'?'Switch to English':'切换到中文');
  }
  function toggle() { language=language==='en'?'zh':'en'; try{localStorage.setItem('3cats-language',language);}catch(_){} apply(); }
  apply();
  return {t,toggle,get language(){return language;}};
})();
