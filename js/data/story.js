'use strict';
// ───────────────────────────────────────────────────────────────
//  MOKSHA — characters, dialogue, visions & cutscenes
// ───────────────────────────────────────────────────────────────
//  Dialogue entries: { id, who, pri, when(s), lines:[[speaker, text]], set:{flag:true}, repeat }
//  `who` = context key (hub NPC id, god id, boss id, 'kubera', ...)
//  Speakers: character ids, or 'nar' for narration.

M.CHARACTERS = {
  abhi: { name: 'Abhimanyu', title: 'Son of Arjuna', color: '#ffcf6b' },
  yama: { name: 'Yama', title: 'Dharmaraja, Lord of Death', color: '#c43c3c' },
  chitragupta: { name: 'Chitragupta', title: 'Keeper of the Ledger', color: '#d8a34a' },
  nachiketa: { name: 'Nachiketa', title: 'The Boy Who Waited', color: '#ffe8b0' },
  savitri: { name: 'Savitri', title: 'Advocate of Souls', color: '#ff5a6a' },
  chandra: { name: 'Chandra', title: 'Lord of the Moon', color: '#cfe0ff' },
  kubera: { name: 'Kubera', title: 'Treasurer of the Gods', color: '#ffd24a' },
  uttara: { name: 'Uttara', title: 'Princess of Matsya', color: '#f0a0c8' },
  indra: { name: 'Indra', title: 'King of Svarga', color: '#6fd3ff' },
  agni: { name: 'Agni', title: 'The Sacrificial Flame', color: '#ff7a2f' },
  vayu: { name: 'Vayu', title: 'Lord of the Winds', color: '#8ff0c4' },
  varuna: { name: 'Varuna', title: 'Keeper of Oaths', color: '#2fb8e6' },
  surya: { name: 'Surya', title: 'The Sun', color: '#ffb81f' },
  durga: { name: 'Durga', title: 'The Invincible', color: '#ff3d7f' },
  jayadratha: { name: 'Jayadratha', title: 'Holder of the Gate', color: '#8a7ad8' },
  karna: { name: 'Karna', title: 'Son of the Sun', color: '#ffb84a' },
  ashwatthama: { name: 'Ashwatthama', title: 'The Undying', color: '#9a3a5a' },
  drona: { name: 'Drona', title: 'Architect of the Wheel', color: '#e8e0c8' },
  dhumra: { name: 'Dhumra', title: 'Yama’s Buffalo', color: '#8a8aa0' },
};

// ─── Codex (unlocks as you know someone better) ───────────────
M.CODEX = {
  abhi: [
    { req: 0, text: 'Sixteen years old. Son of Arjuna, the greatest archer of the age, and of Subhadra, sister of Krishna. Husband to Uttara of Matsya, who carries his child.' },
    { req: 0, text: 'While still in his mother’s womb he overheard his father describe how to break into the Chakravyuha, the spiral formation. His mother fell asleep before Arjuna explained how to get out. The child stopped listening when she did.' },
    { req: 0, text: 'On the thirteenth day of the war at Kurukshetra, Drona arranged the Wheel. Arjuna had been lured away. Abhimanyu broke in. No one followed. Seven great warriors fell on him together, against every rule of war. He fought on with the wheel of his own chariot.' },
  ],
  yama: [
    { req: 0, text: 'Lord of Death and keeper of dharma, the cosmic law. He rides a black water-buffalo and carries a noose for collecting souls.' },
    { req: 1, text: 'The Vedas say Yama was the first mortal ever to die. Nobody had died before him, so there was no road. He found the way to the other side and has kept it open for everyone since.' },
    { req: 3, text: 'He is the father of Yudhishthira, eldest of the Pandavas, which makes him Abhimanyu’s grandfather in the way the gods count such things. On the thirteenth day it was Yudhishthira who asked the boy to break the Wheel.' },
    { req: 5, text: 'He keeps one lamp at the foot of his throne that he never lets go out. He won’t say whose it is.' },
  ],
  chitragupta: [
    { req: 0, text: 'Scribe of the Court of Death. He records every deed of every being who has ever lived: the good, the wicked and the merely embarrassing.' },
    { req: 1, text: 'The eighteen days at Kurukshetra brought more souls to his desk than the previous four hundred years combined. He hasn’t slept since. He is not sure he ever did.' },
    { req: 3, text: 'For a merit called punya, he will let a soul write notes in the margins of their own account. He calls it “an irregular practice.” He has allowed it exactly once before.' },
    { req: 5, text: 'Abhimanyu’s account is missing one page. It has been cleanly removed, as though by someone with the authority to remove it.' },
  ],
  nachiketa: [
    { req: 0, text: 'When Nachiketa was a boy, his father said to him in anger, “To Death I give you.” So he walked to the house of Death and waited on the doorstep three days and nights without food until Yama came home.' },
    { req: 1, text: 'In apology Yama offered him three wishes. With the third, Nachiketa asked what happens after death. Yama offered him kingdoms, horses and long life to make him ask something else. He refused all of them.' },
    { req: 3, text: 'Yama taught him the secret of the deathless Self, which the Katha Upanishad still records. Nachiketa stayed on as a student. He has been twelve years old for a very long time.' },
    { req: 5, text: 'He keeps a list of things he has never done. It has gotten very long since Abhimanyu arrived.' },
  ],
  savitri: [
    { req: 0, text: 'Princess of Madra. She married Satyavan knowing a sage had foretold he would die within a year. When Yama came to take him, she followed Death on foot.' },
    { req: 1, text: 'Yama granted her a wish for every step she refused to turn back. Her last wish was a hundred sons, by her husband. Death had to give Satyavan back to keep his word.' },
    { req: 3, text: 'She and Satyavan lived a long, good life. When it was over she came back to the Court of Death on her own, and Yama asked her to stay as the advocate for souls whose cases were unclear. She is still the only person who has ever won an argument with him.' },
    { req: 5, text: 'She still walks the road out of the Court every evening, just a little way, as if to check that it is still there.' },
  ],
  chandra: [
    { req: 0, text: 'The Moon, Soma, cupbearer of the nectar of the gods. He waxes and wanes, dies and returns every month. He knows more about leaving and coming back than anyone.' },
    { req: 1, text: 'Before the war, the gods asked Chandra to send his beloved son, Varchas, to be born on earth and help restore dharma. Chandra agreed on one condition: the boy would come home after sixteen years.' },
    { req: 3, text: 'Varchas was born as Abhimanyu. On the thirteenth day of the war he was sixteen years old.' },
  ],
  kubera: [
    { req: 0, text: 'God of wealth, lord of the yakshas, treasurer of heaven. Wherever treasure is buried or lost, Kubera has already set up shop.' },
    { req: 1, text: 'He travels with a mongoose named Ratna that spits up jewels when squeezed. Ratna dislikes being squeezed.' },
  ],
  uttara: [
    { req: 0, text: 'Princess of Matsya. She married Abhimanyu at the end of the Pandavas’ year in hiding, when the war still seemed far away.' },
    { req: 0, text: 'She is carrying his child. Krishna has said the child will be “tested before he is born.” No one has asked him what he meant.' },
  ],
  jayadratha: [
    { req: 0, text: 'King of Sindhu. Years ago he tried to abduct Draupadi and was humiliated by the Pandavas. He did penance until Shiva granted him a boon: for one day he could hold back every Pandava except Arjuna.' },
    { req: 0, text: 'He chose the thirteenth day. He held the breach in the Wheel while the boy fought alone inside. Arjuna swore to kill him before the next sunset, and did.' },
  ],
  karna: [
    { req: 0, text: 'The greatest warrior on the Kaurava side, son of Surya. He was born wearing golden armour and earrings, and he gave both away to Indra, who came to him in disguise as a beggar.' },
    { req: 0, text: 'On the thirteenth day, on Drona’s advice, he cut Abhimanyu’s bowstring from behind.' },
    { req: 1, text: 'Before the war Kunti told him the secret of his birth. He was her firstborn, born before her marriage, which made him the eldest Pandava and Abhimanyu’s uncle. He fought for the Kauravas anyway. He had given his word.' },
  ],
  ashwatthama: [
    { req: 0, text: 'Son of Drona, born with a jewel in his forehead that protected him from hunger, sickness and weapons. He is one of the Chiranjivi, the ones who do not die.' },
    { req: 0, text: 'After the war he will slaughter the sleeping Pandava children in their camp, then turn the Brahmastra on the unborn heir of the Pandavas in Uttara’s womb. For this Krishna will curse him to wander the earth for three thousand years with an open wound where the jewel was.' },
    { req: 0, text: 'He has not done any of this yet. He remembers it anyway. The undying keep odd hours.' },
  ],
  drona: [
    { req: 0, text: 'Teacher of both the Pandavas and the Kauravas. Arjuna was his most beloved student, more beloved than his own son.' },
    { req: 0, text: 'He designed the Chakravyuha: seven spiralling rings of soldiers that turn as you fight them. Only four people alive knew how to break into it. Only one of them was sixteen.' },
  ],
};

// ─── Dialogue ─────────────────────────────────────────────────
const S = (n) => (s) => s.flags[n];
const D = [];
const add = (e) => D.push(e);

// ══════ YAMA ══════
add({ id: 'y_intro', who: 'yama', pri: 100, when: (s) => !s.flags.intro, set: { intro: 1 }, lines: [
  ['nar', 'A river the colour of night. Lamps floating on it by the thousands. A throne of black stone, and on it a figure who has been waiting since before there was anyone to wait for.'],
  ['yama', 'Abhimanyu, son of Arjuna. Sixteen years, four months and nine days. Slain on the thirteenth day at Kurukshetra.'],
  ['abhi', 'I know when I died. I was there. Where’s my chariot? Where are my uncles? They were right behind me—'],
  ['yama', 'They were not. Jayadratha held the breach. You fought alone.'],
  ['abhi', '…Then I won’t be needing the chariot. Fine. So this is your court. I thought there’d be more fire.'],
  ['yama', 'There will be no judgment, and no fire. You are not mine, child.'],
  ['abhi', 'I’m dead. Who else would I belong to?'],
  ['yama', 'The Wheel. Drona built the Chakravyuha with mantras as well as men. When you died inside it, it closed around you. Your soul cannot reach the far shore. It cannot return to the near one either.'],
  ['abhi', 'So I’m stuck in the formation. Again.'],
  ['yama', 'You are stuck in what the formation has become: seven rings, turning between life and death. Every soul that died in it is still in there, still fighting.'],
  ['abhi', 'Then I’ll break it open. I already did that once. I’m very good at it.'],
  ['yama', 'Breaking in was never your difficulty. Go, then. The gate is there. When you fall, and you will, you will wake here again.'],
] });
add({ id: 'y_firstdeath', who: 'yama', pri: 90, when: (s) => s.deaths >= 1 && s.flags.intro, lines: [
  ['yama', 'Back already.'],
  ['abhi', 'That was a warm-up. The Wheel turns while you fight it. You could have mentioned that.'],
  ['yama', 'I could have. Would you have listened?'],
  ['abhi', '…Probably not.'],
  ['yama', 'Then I spared us both the breath. Chitragupta keeps your account. Nachiketa will help you train. And you will try again, because that is clearly what you are.'],
] });
add({ id: 'y_jaya1', who: 'yama', pri: 70, when: (s) => (s.bossDeaths.jayadratha || 0) >= 1, lines: [
  ['abhi', 'Jayadratha. In the first ring. Holding the gate again like he’s proud of it.'],
  ['yama', 'He has a boon from Shiva. For one day he can hold back any son of Pandu. The day he chose was yours, and in the Wheel it is always that day.'],
  ['abhi', 'I’m Arjuna’s son, not Pandu’s. Does the boon count grandsons?'],
  ['yama', 'Boons are precise, and Shiva rarely is. Test it.'],
] });
add({ id: 'y_father', who: 'yama', pri: 40, when: (s) => s.runs >= 3, lines: [
  ['abhi', 'Do you see the living from here? My father. Is he… what happened after I died?'],
  ['yama', 'Arjuna came back from the far end of the field at dusk and found what was left of you. He said nothing for a long while. Then he swore that Jayadratha would die before the next sunset, or he would walk into fire himself.'],
  ['abhi', '…And?'],
  ['yama', 'And Krishna hid the sun, and your father kept his oath. Jayadratha’s head fell into his own father’s lap, a mile away.'],
  ['abhi', 'That’s… really something. I didn’t think my father had that in him.'],
  ['yama', 'Every father has it in him. Most are fortunate enough never to find out.'],
] });
add({ id: 'y_first', who: 'yama', pri: 35, when: (s) => s.runs >= 5 && (s.affinity.yama || 0) >= 1, lines: [
  ['abhi', 'Nachiketa says you were the first person to ever die. Is that true?'],
  ['yama', 'It is.'],
  ['abhi', 'What was it like? Nobody had done it before. There wasn’t a road.'],
  ['yama', 'There was not. I walked into the dark for a very long time. Then I found the far shore, and I stayed there so the next one would not have to search.'],
  ['abhi', 'So you’re not the lord of death. You’re the lamp at the end of the road.'],
  ['yama', '…Do not say that where Chitragupta can hear it. He will want it written into the title.'],
] });
add({ id: 'y_yudhi', who: 'yama', pri: 60, when: (s) => s.runs >= 7 && (s.affinity.yama || 0) >= 2, set: { yudhi: 1 }, lines: [
  ['abhi', 'You keep looking at me as if you owe me something.'],
  ['yama', 'My son is Yudhishthira.'],
  ['abhi', 'Uncle Yudhishthira? Then you’re my— huh. The gods really do make family trees complicated.'],
  ['yama', 'On the thirteenth morning, my son was the one who asked you to break the Wheel. He said the rest of them would follow you through the gap. He believed it.'],
  ['abhi', 'So did I.'],
  ['yama', 'He has not forgiven himself. He never will. He is dharma’s child; he will carry it correctly, to the end of his days. I only… I wanted you to know that the asking was not done lightly.'],
  ['abhi', 'Tell him— no. You can’t tell him anything, can you.'],
  ['yama', 'No.'],
  ['abhi', 'Then I’ll tell him myself. One day. When I get out.'],
] });
add({ id: 'y_ash', who: 'yama', pri: 75, when: (s) => (s.bossMet.ashwatthama || 0) >= 1, set: { ashKnown: 1 }, lines: [
  ['abhi', 'Ashwatthama. In the third ring. He told me he’s going to kill my son. Before he’s even born. Is it true?'],
  ['yama', 'Ashwatthama is a Chiranjivi. He stands outside time the way a rock stands outside a river. What he will do is already as much his as what he has done.'],
  ['abhi', 'That isn’t an answer.'],
  ['yama', 'After the war he will loose the Brahmastra at the last unborn Pandava, in Uttara’s womb. That is true.'],
  ['abhi', 'Then I’m done talking. I have to get out. I have to be there.'],
  ['yama', 'Abhimanyu.'],
  ['abhi', 'What?!'],
  ['yama', '…Nothing. Go.'],
] });
add({ id: 'y_win1', who: 'yama', pri: 95, when: (s) => s.wins >= 1, lines: [
  ['yama', 'You reached her.'],
  ['abhi', 'I reached her. For one night. And then it pulled me back like a tide.'],
  ['yama', 'The Wheel does not end. It turns. You broke it once; it remade itself around your absence. That is its nature.'],
  ['abhi', 'Then I’ll break it again. She’s still carrying him. Ashwatthama is still coming. Every time I get out, I get closer to the day it happens.'],
  ['yama', 'Every time, you move along the river of time with her. Yes. I had guessed it might work so.'],
  ['abhi', 'You guessed? Did you know?'],
  ['yama', 'I am Death. I know how things end. I do not always know how they get there. You are… an education.'],
] });
add({ id: 'y_win2', who: 'yama', pri: 95, when: (s) => s.wins >= 2, lines: [
  ['abhi', 'The night was longer this time. The child moved when I spoke. Uttara said he’s strong.'],
  ['yama', 'Then you are close. When you break the Wheel again, you will reach the day of the Brahmastra.'],
  ['abhi', 'Good. I’ll stand in front of it.'],
  ['yama', 'A shade cannot stand in front of anything.'],
  ['abhi', 'Then I’ll find something else to do. I always do.'],
  ['yama', '…Yes. You always do.'],
] });
add({ id: 'y_postend', who: 'yama', pri: 95, when: (s) => s.flags.trueEnding, lines: [
  ['yama', 'You came back. Again. After all of that.'],
  ['abhi', 'Moksha’s very peaceful. Very spacious. There’s no one to spar with. Besides, the Wheel still has soldiers in it who don’t know the war is over.'],
  ['yama', 'So you mean to lead them out.'],
  ['abhi', 'Someone should show them the way. You taught me that one.'],
  ['yama', 'I did nothing of the sort.'],
  ['abhi', 'You did it for ten thousand years, Grandfather. I was watching.'],
] });
add({ id: 'y_r1', who: 'yama', pri: 20, repeat: true, when: () => true, lines: [['yama', 'The gate is there. You know the way in. You always have.']] });
add({ id: 'y_r2', who: 'yama', pri: 20, repeat: true, when: (s) => s.runs > 2, lines: [['yama', 'Dharma is not kind and it is not cruel. It is the shape the world must keep. Go and test its shape.']] });
add({ id: 'y_r3', who: 'yama', pri: 20, repeat: true, when: (s) => s.runs > 4, lines: [['yama', 'Dhumra likes you. He does not like anyone. Do not let it go to your head.']] });
add({ id: 'y_r4', who: 'yama', pri: 20, repeat: true, when: (s) => s.wins > 0, lines: [['yama', 'She will be waiting at the end of the Wheel. So will he. Go.']] });

// ══════ CHITRAGUPTA ══════
add({ id: 'c_intro', who: 'chitragupta', pri: 100, when: (s) => s.flags.intro, lines: [
  ['chitragupta', 'Name. No, don’t tell me, I have it. Abhimanyu. Thirteenth day. Do you have any idea how many people died on the thirteenth day?'],
  ['abhi', 'A lot? I killed some of them.'],
  ['chitragupta', 'You killed a great many of them, which is the problem. Each of them comes with a ledger, and the ledgers all refer to you. Cross-references. Footnotes. I’ll be indexing you for a century.'],
  ['abhi', 'Sorry?'],
  ['chitragupta', 'Hmph. Your account is a mess, boy. Merit everywhere, no conclusion. Look. You’ll be gathering punya in there. Merit. Bring it to me and I’ll allow you to… annotate your record.'],
  ['abhi', 'Annotate?'],
  ['chitragupta', 'Write in the margins. “Here he was stronger.” “Here he did not die quite so quickly.” The Wheel reads your ledger the way soldiers read an order. Most irregular. Don’t tell anyone.'],
] });
add({ id: 'c_paper', who: 'chitragupta', pri: 50, when: (s) => s.deaths >= 2, lines: [
  ['chitragupta', 'Died again. Noted. “Died again.” I’ve started abbreviating. D.A.'],
  ['abhi', 'You could just write it once and add a tally.'],
  ['chitragupta', 'A tally? In the Ledger of All Deeds? Do you know what my lord would say?'],
  ['abhi', '“Efficient”?'],
  ['chitragupta', '…He would. He absolutely would. Get out of my sight before I do something rash.'],
] });
add({ id: 'c_war', who: 'chitragupta', pri: 40, when: (s) => s.runs >= 4, lines: [
  ['abhi', 'You look exhausted.'],
  ['chitragupta', 'Eighteen days of war, boy. Four million, two hundred thousand and some souls. Do you know how many of them died with their accounts balanced? Eleven. Eleven! Everyone else died mid-sentence.'],
  ['abhi', 'Mid-sentence?'],
  ['chitragupta', 'Promises not kept. Debts not paid. Apologies not made. “I’ll be home for the harvest.” Do you know how much paperwork a broken promise is?'],
  ['abhi', 'I told Uttara I’d be home that night.'],
  ['chitragupta', '…Yes. Yes, I know. It’s in here. Page nine hundred and four.'],
] });
add({ id: 'c_page', who: 'chitragupta', pri: 65, when: (s) => s.runs >= 6 && (s.affinity.chitragupta || 0) >= 2, set: { tornPage: 1 }, lines: [
  ['chitragupta', 'Boy. Come here. Look at this.'],
  ['abhi', 'It’s my ledger. It’s very… thick.'],
  ['chitragupta', 'Look at the binding. Here. Before your birth. A page has been removed.'],
  ['abhi', 'Torn out?'],
  ['chitragupta', 'Not torn. Excised. Cleanly. By someone with the authority to excise. That is not a long list. I am on it. My lord is on it. And the gods, if they have signed the original contract.'],
  ['abhi', 'What contract? I didn’t sign anything before I was born.'],
  ['chitragupta', 'Nobody signs. That doesn’t mean nobody agrees on your behalf. I’ll find out who. Paperwork is the one battle I always win.'],
] });
add({ id: 'c_page2', who: 'chitragupta', pri: 66, when: (s) => s.flags.tornPage && s.flags.chandraReveal, lines: [
  ['chitragupta', 'I found it. The missing page. Filed in the Moon’s registry, of all places.'],
  ['abhi', 'Chandra told me. The sixteen years.'],
  ['chitragupta', 'Did he tell you the clause at the bottom? In very small letters?'],
  ['abhi', 'There’s a clause?'],
  ['chitragupta', '“Unless the boy himself should choose otherwise.” In the Moon’s own hand. Gods write the clauses they hope no one reads.'],
  ['abhi', 'So I can choose.'],
  ['chitragupta', 'You can choose. Whether choosing gets you out is not a question for a clerk. But it is a very interesting legal position.'],
] });
add({ id: 'c_win', who: 'chitragupta', pri: 90, when: (s) => s.wins >= 1, lines: [
  ['chitragupta', 'You did it! You actually— the whole ledger lit up. Page nine hundred and four. “Home for the night.” Fulfilled. Partially, but fulfilled.'],
  ['abhi', 'You look happy.'],
  ['chitragupta', 'I am never happy. I am occasionally balanced. Go away. I have to recalculate everything.'],
] });
add({ id: 'c_r1', who: 'chitragupta', pri: 20, repeat: true, when: () => true, lines: [['chitragupta', 'Punya, boy. Bring me punya. The margins won’t annotate themselves.']] });
add({ id: 'c_r2', who: 'chitragupta', pri: 20, repeat: true, when: (s) => s.deaths > 3, lines: [['chitragupta', 'D.A. D.A. D.A. I’ve made a stamp. Look. It’s a little wheel.']] });
add({ id: 'c_r3', who: 'chitragupta', pri: 20, repeat: true, when: (s) => s.runs > 5, lines: [['chitragupta', 'Somewhere a merchant is cheating on his scales and I have to write it down. Every single grain.']] });

// ══════ NACHIKETA ══════
add({ id: 'n_intro', who: 'nachiketa', pri: 100, when: (s) => s.flags.intro, lines: [
  ['nachiketa', 'You’re the new one. The soldier. I heard you arrive. You were shouting.'],
  ['abhi', 'I was not shout— I was speaking firmly. Who are you? You’re a little young to be dead.'],
  ['nachiketa', 'I’m Nachiketa. I’m not dead, exactly. I came here on my own. My father gave me to Death, so I walked to his house and waited on the step.'],
  ['abhi', 'Your father did what?'],
  ['nachiketa', 'He was angry. He said it and he couldn’t take it back, so I came. Lord Yama was out. I waited three nights.'],
  ['abhi', 'Three nights on Death’s doorstep. That’s either very brave or very stupid.'],
  ['nachiketa', 'Lord Yama said the same thing, and then he made me his student. I keep the training yard. Choose your weapon from the rack. Hit the straw rakshasa. It doesn’t mind.'],
] });
add({ id: 'n_father', who: 'nachiketa', pri: 60, when: (s) => s.runs >= 2, lines: [
  ['nachiketa', 'Did your father give you to Death too?'],
  ['abhi', 'No. He wasn’t there. He was on the other side of the field fighting a whole army that swore to kill him or die trying. They died trying.'],
  ['nachiketa', 'So you went in alone.'],
  ['abhi', 'I thought my uncles were behind me.'],
  ['nachiketa', 'I thought my father would come after me. To take it back. He didn’t. I think he was too ashamed. It’s strange which things grown-ups can’t do.'],
  ['abhi', '…Yeah. It is.'],
] });
add({ id: 'n_secret', who: 'nachiketa', pri: 50, when: (s) => s.runs >= 4 && (s.affinity.nachiketa || 0) >= 1, lines: [
  ['abhi', 'Yama gave you three wishes. What did you ask for?'],
  ['nachiketa', 'First, that my father wouldn’t be angry anymore. Second, how to do a certain fire-sacrifice. Third, what happens after we die.'],
  ['abhi', 'And he told you?'],
  ['nachiketa', 'He tried very hard not to. He offered me elephants, gold, a hundred years of life, beautiful dancers.'],
  ['abhi', 'You turned down the dancers?'],
  ['nachiketa', 'I was nine. Anyway, he told me. The Self is never born and never dies. It isn’t slain when the body is slain. Weapons can’t cut it, fire can’t burn it, water can’t wet it.'],
  ['abhi', 'Sounds like great armour.'],
  ['nachiketa', 'That’s… not really the point. But you’re not wrong.'],
] });
add({ id: 'n_life', who: 'nachiketa', pri: 55, when: (s) => s.runs >= 6 && (s.affinity.nachiketa || 0) >= 2, lines: [
  ['nachiketa', 'Abhimanyu. What does a mango taste like?'],
  ['abhi', 'You’ve never had a mango?'],
  ['nachiketa', 'I learned the secret of death. Nobody told me about mangoes.'],
  ['abhi', 'Okay. A ripe one, in summer, when it’s warm from the tree. You bite the top off and squeeze. It’s sweet and a bit sour, and it runs down your arm to your elbow, and you don’t care, because it’s a mango.'],
  ['nachiketa', '…I’m going to put that on my list.'],
  ['abhi', 'What list?'],
  ['nachiketa', 'Things I’ve never done. It was short before you came. You’ve made it very long.'],
] });
add({ id: 'n_teach', who: 'nachiketa', pri: 58, when: (s) => s.wins >= 1, lines: [
  ['nachiketa', 'You got out. Everyone’s talking about it. Well. Chitragupta is muttering about it, which is the same thing.'],
  ['abhi', 'For one night. And I came back.'],
  ['nachiketa', 'Lord Yama says a soul who comes back by choice is a student, not a prisoner. Are you a student now?'],
  ['abhi', 'I’m still learning the second half of a lesson. The way out.'],
  ['nachiketa', 'Me too. I learned the way out years ago. Now I’m trying to learn the way in. To living, I mean.'],
  ['abhi', 'Then we’ll trade. You teach me leaving. I’ll teach you mangoes.'],
] });
add({ id: 'n_r1', who: 'nachiketa', pri: 20, repeat: true, when: () => true, lines: [['nachiketa', 'The weapon rack remembers every hand that’s held it. Pick one that remembers you.']] });
add({ id: 'n_r2', who: 'nachiketa', pri: 20, repeat: true, when: (s) => s.runs > 3, lines: [['nachiketa', 'I hit the straw rakshasa forty times while you were gone. I named it Ravana. It didn’t object.']] });
add({ id: 'n_r3', who: 'nachiketa', pri: 20, repeat: true, when: (s) => s.runs > 6, lines: [['nachiketa', 'Lord Yama says I ask too many questions. I asked him how many is too many. He went very quiet.']] });

// ══════ SAVITRI ══════
add({ id: 's_intro', who: 'savitri', pri: 100, when: (s) => s.deaths >= 1, lines: [
  ['savitri', 'So you’re the boy who walked into Drona’s formation with a bow and a grin. The whole court’s been gossiping. Death doesn’t get many visitors who argue.'],
  ['abhi', 'I don’t argue. I just don’t agree. Who are you?'],
  ['savitri', 'Savitri. I argue for a living. Well, for a death. I’m the advocate here, for the cases that don’t fit the forms.'],
  ['abhi', 'Savitri… the Savitri? The one who followed Yama and made him give her husband back?'],
  ['savitri', 'I didn’t make him do anything. I asked very politely, many times, while walking very fast. He ran out of reasons before I ran out of road.'],
  ['abhi', 'Can you do that for me?'],
  ['savitri', 'Oh, child. My husband wasn’t caught in a Wheel. Yours is a much stranger case. But I’m listening. I’m always listening.'],
] });
add({ id: 's_uttara', who: 'savitri', pri: 60, when: (s) => (s.visions || 0) >= 1, lines: [
  ['abhi', 'I saw her. Uttara. In the water at one of the pools. She was lighting a lamp for me.'],
  ['savitri', 'The sacred pools in the Wheel reflect the near shore, if you look properly. Tell me about her.'],
  ['abhi', 'She’s… she laughs at my jokes and then tells me they’re terrible. She learned dance from my father when he was hiding as a eunuch in her father’s palace. It’s a long story.'],
  ['savitri', 'All the good ones are.'],
  ['abhi', 'She’s carrying our child. I said I’d be home that night.'],
  ['savitri', 'Then you have something better than a weapon. A promise. Death respects promises, it’s why I won. Keep yours.'],
] });
add({ id: 's_method', who: 'savitri', pri: 50, when: (s) => s.runs >= 4 && (s.affinity.savitri || 0) >= 1, lines: [
  ['abhi', 'How did you actually beat him? Yama doesn’t lose.'],
  ['savitri', 'I didn’t fight him. That was the trick. Everyone who wants something from Death tries to fight him, or cheat him, or run. I walked beside him and agreed with everything he said.'],
  ['abhi', 'You agreed with him?'],
  ['savitri', 'Dharma is a beautiful thing, I said. A man’s word is sacred, I said. He grants boons to the virtuous, I said. And then I asked for a hundred children with my husband, and he’d already agreed it was all sacred.'],
  ['abhi', 'That’s… that’s a vyuha. You built a formation out of words and trapped him in it.'],
  ['savitri', '…Do you know, no one’s ever described it that way. Yes. I suppose I did.'],
] });
add({ id: 's_wheel', who: 'savitri', pri: 55, when: (s) => s.runs >= 7 && (s.affinity.savitri || 0) >= 2, lines: [
  ['savitri', 'I’ve been reading Drona’s Wheel, in the old commentaries. Do you know why no one teaches the way out?'],
  ['abhi', 'Because my mother fell asleep.'],
  ['savitri', 'Because the way out of the Chakravyuha isn’t a manoeuvre. The commentaries all stop at the same place. The seventh ring opens only for one who no longer needs to escape it.'],
  ['abhi', 'That makes no sense.'],
  ['savitri', 'Not yet. Keep it in your pocket anyway. Riddles are like seeds. They don’t make sense until it rains.'],
] });
add({ id: 's_win', who: 'savitri', pri: 90, when: (s) => s.wins >= 1, lines: [
  ['savitri', 'Well? Did you see her? Tell me everything. Leave nothing out. I’ve been dead a long time, I need the gossip.'],
  ['abhi', 'She was asleep. Moonlight on her face. I sat by the bed and talked to the baby. All night. I told him how to break into the Chakravyuha.'],
  ['savitri', 'Oh, Abhimanyu.'],
  ['abhi', 'And then I tried to tell him the way out, and I didn’t know it. I still don’t know it.'],
  ['savitri', 'Then you’ll have to go back. And this time, learn it properly. For him.'],
] });
add({ id: 's_r1', who: 'savitri', pri: 20, repeat: true, when: () => true, lines: [['savitri', 'Walk fast. Keep agreeing. Never turn back. That’s all the advice I have, and it’s worked once.']] });
add({ id: 's_r2', who: 'savitri', pri: 20, repeat: true, when: (s) => s.runs > 4, lines: [['savitri', 'Satyavan used to fall asleep under that banyan. I talk to it sometimes. It’s a very good listener.']] });

// ══════ CHANDRA ══════
add({ id: 'ch_intro', who: 'chandra', pri: 100, when: (s) => s.flags.chandraAppears, lines: [
  ['nar', 'The moon’s reflection on the Vaitarani does not move with the current. It waits. Then it rises out of the water.'],
  ['chandra', 'Hello, little star.'],
  ['abhi', '…Lord Chandra? Why are you here? This is the house of the dead.'],
  ['chandra', 'I go into darkness every month and I come back out of it. I know these waters well. And I wanted to see you. You’ve grown so tall.'],
  ['abhi', 'Have we met?'],
  ['chandra', 'You wouldn’t remember. You were very small, and I was very bright. Go carefully in the third ring, child. The undying one is not entirely inside time.'],
] });
add({ id: 'ch_reveal', who: 'chandra', pri: 90, when: (s) => (s.seen.ch_intro && s.runs >= (s.chandraRun || 0) + 2), set: { chandraReveal: 1 }, lines: [
  ['abhi', 'You keep calling me little star. Why?'],
  ['chandra', 'Because that is what your name meant, before it was Abhimanyu. Varchas. Radiance. My son.'],
  ['abhi', 'I’m Arjuna’s son.'],
  ['chandra', 'In this life, yes, and you were a credit to him. Before the war the gods came to me. Dharma needed a warrior of rare light, they said. Lend us your son. I said yes, for sixteen years. Not one day more.'],
  ['abhi', 'Sixteen… I was sixteen on the thirteenth day.'],
  ['chandra', 'You were. The Wheel didn’t close around you by accident, Varchas. It’s my pull and your refusal, a tide caught between two shores. I’m calling you home, and you won’t come.'],
  ['abhi', 'Because my home is Uttara. My home is a child who hasn’t been born yet. You lent me out. You don’t get to call me back like a borrowed horse.'],
  ['chandra', '…No. I suppose I don’t.'],
] });
add({ id: 'ch_after', who: 'chandra', pri: 60, when: (s) => s.flags.chandraReveal && s.runs >= (s.chandraRun || 0) + 4, lines: [
  ['chandra', 'You’re angry with me.'],
  ['abhi', 'I’m not angry. All right, I’m very angry. You made a deal about my life and nobody asked me.'],
  ['chandra', 'Nobody asks the unborn. That is the cruelty of fathers. We make the world before you arrive and then hand it to you, and call it a gift.'],
  ['abhi', 'Arjuna’s like that. He said I’d have a kingdom someday.'],
  ['chandra', 'And you will have a son instead. Who will have the kingdom. The world is funny that way.'],
  ['abhi', 'If I choose to stay… to go to him instead of to you. Would you stop me?'],
  ['chandra', 'I wax and wane, child. I have never once kept anything I love. I only hoped you might be the first.'],
] });
add({ id: 'ch_r1', who: 'chandra', pri: 20, repeat: true, when: (s) => s.flags.chandraAppears, lines: [['chandra', 'Every month I die a little, and every month I return. It is not so frightening, once you know the shape of it.']] });

// ══════ GOD ENCOUNTERS (in-run, short) ══════
const god = (g, id, when, lines, pri = 50, repeat = false) => add({ id, who: g, pri, when, lines, repeat });
god('indra', 'i_1', (s) => !s.godMet.indra, [
  ['indra', 'HA! Arjuna’s boy! The child who split Drona’s wheel like a ripe pomegranate! I am Indra, and you, young thunderclap, are my grandson’s son!'],
  ['abhi', 'Lord Indra. Grandfather. Should I bow, or—'],
  ['indra', 'Bow? You went into a formation of a hundred thousand alone! The rest of the gods should bow to YOU. Take my thunder. Show them whose blood you are.'],
], 90);
god('indra', 'i_2', (s) => s.godMet.indra && (s.bossMet.karna || 0) >= 1, [
  ['indra', 'You’ve met Karna. Hm. I took his golden armour once, disguised as a beggar. To protect Arjuna. He knew it was me and he gave it anyway.'],
  ['abhi', 'Do you regret it?'],
  ['indra', 'Every day, child. Kings make the choices that keep their sons alive. Then they have to live with the shape of them. Here. More thunder. It’s the one thing I never regret.'],
], 70);
god('indra', 'i_r1', (s) => s.godMet.indra, [['indra', 'Seven of them, against one of my blood! Let the heavens rumble! Take this!']], 20, true);
god('indra', 'i_r2', (s) => s.godMet.indra, [['indra', 'Your father never asked me for help either. Stubborn. It runs in the family. Like lightning.']], 20, true);

god('agni', 'a_1', (s) => !s.godMet.agni, [
  ['agni', 'Mmm, now THIS is a flavour I remember. Arjuna’s son! Your father fed me the entire Khandava forest once. Best meal of my life. Every tree, every vine, every unlucky squirrel.'],
  ['abhi', 'Lord Agni. You’re… bigger than I expected.'],
  ['agni', 'I’m exactly as big as what I eat, darling. And you’re about to feed me an army. Take my fire. Burn bright, little one. It’s how all good things end.'],
], 90);
god('agni', 'a_2', (s) => s.godMet.agni && s.runs >= 5, [
  ['agni', 'Do you know why every offering goes through my mouth? I carry it up. Ghee, rice, prayers. Everything you burn for the gods, I deliver.'],
  ['abhi', 'So you’re a messenger.'],
  ['agni', 'I’m a mouth. But a mouth that carries things home. When they burned your body at Kurukshetra, I carried you as gently as I have carried anything. I wanted you to know.'],
], 60);
god('agni', 'a_r1', (s) => s.godMet.agni, [['agni', 'Hungry, hungry, hungry. Feed me Kauravas, little ember!']], 20, true);
god('agni', 'a_r2', (s) => s.godMet.agni, [['agni', 'Everything burns eventually, sweetness. Best to burn on purpose.']], 20, true);

god('vayu', 'v_1', (s) => !s.godMet.vayu, [
  ['vayu', 'HOOOO! There he is! Bhima’s nephew! The little cyclone himself!'],
  ['abhi', 'Lord Vayu! Uncle Bhima talks about you constantly. Well, he talks about eating constantly. But you come second.'],
  ['vayu', 'HA! That’s my boy! Here, breathe, child, and move like you’re late for supper. Nothing in that Wheel will lay a hand on you.'],
], 90);
god('vayu', 'v_2', (s) => s.godMet.vayu && s.runs >= 4, [
  ['vayu', 'I’m in every breath anything ever takes, you know. I was in your last one.'],
  ['abhi', '…What was it like?'],
  ['vayu', 'Short. Brave. You used it to laugh at Dushasana’s son. I’ve kept it. A breath like that, a wind doesn’t let go of.'],
], 60);
god('vayu', 'v_r1', (s) => s.godMet.vayu, [['vayu', 'Faster, nephew! The wind waits for no one, and neither should you!']], 20, true);
god('vayu', 'v_r2', (s) => s.godMet.vayu, [['vayu', 'Hanuman would’ve leapt the whole Wheel in one go. Show-off. Here, have some of that.']], 20, true);

god('varuna', 'va_1', (s) => !s.godMet.varuna, [
  ['varuna', 'Abhimanyu. I am Varuna. I keep the oaths of gods and men, and I bind those who break them.'],
  ['abhi', 'I haven’t broken any oaths. I don’t think. Have I?'],
  ['varuna', 'You promised your wife you would return that night. I have noted it. I have not judged it. Go on. Let the deep waters carry you toward that promise.'],
], 90);
god('varuna', 'va_2', (s) => s.godMet.varuna && (s.bossKills.jayadratha || 0) >= 1, [
  ['varuna', 'Your father swore that Jayadratha would fall before the sun set, or that he would burn himself alive.'],
  ['abhi', 'Yama told me. Krishna hid the sun.'],
  ['varuna', 'Krishna eclipsed the sun so that Jayadratha would think the oath had failed and come out of hiding. It was a trick. But the oath was kept. I find that I respect a man who keeps an oath by the narrowest possible margin.'],
], 60);
god('varuna', 'va_r1', (s) => s.godMet.varuna, [['varuna', 'Bind them, as the river binds the stone. Patiently. Completely.']], 20, true);
god('varuna', 'va_r2', (s) => s.godMet.varuna, [['varuna', 'The ocean does not hurry. Yet it always arrives.']], 20, true);

god('surya', 'su_1', (s) => !s.godMet.surya, [
  ['surya', '…Abhimanyu.'],
  ['abhi', 'Lord Surya. You’re Karna’s father.'],
  ['surya', 'I am. I am also the eye of the world. I see everything beneath the sky, and I cannot close my eyes. I saw my son cut your bowstring. From behind.'],
  ['abhi', 'Then why help me?'],
  ['surya', 'Because I could not look away then, and I will not look away now. Take my light. Let it be the first thing I have given that did not end in grief.'],
], 90);
god('surya', 'su_2', (s) => s.godMet.surya && (s.bossMet.karna || 0) >= 2, [
  ['surya', 'You’ve fought him more than once now. My son.'],
  ['abhi', 'He fights fair. Mostly. Except the one time.'],
  ['surya', 'He gave away the armour I made him to the very god who meant him harm, because he had promised never to refuse a beggar. He has always been better at keeping promises than surviving them.'],
], 60);
god('surya', 'su_r1', (s) => s.godMet.surya, [['surya', 'Let them see you clearly. Let them see what they did.']], 20, true);
god('surya', 'su_r2', (s) => s.godMet.surya, [['surya', 'Dawn always comes, child. It is the one promise I have never broken.']], 20, true);

god('durga', 'du_1', (s) => !s.godMet.durga, [
  ['durga', 'Child.'],
  ['abhi', 'Mother Durga. I— I didn’t expect—'],
  ['durga', 'Seven great warriors against one boy of sixteen. They called it strategy. I have another word for it.'],
  ['abhi', 'I fought them anyway.'],
  ['durga', 'I know. I watched. When the buffalo-demon Mahisha came against heaven with all his armies, I stood alone too. Take my strength, and remind every one of them what one person can do.'],
], 90);
god('durga', 'du_2', (s) => s.godMet.durga && s.runs >= 6, [
  ['durga', 'Your mother Subhadra prays to me every night now. She asks for one thing.'],
  ['abhi', 'What does she ask?'],
  ['durga', 'That wherever you are, you are not afraid. I told her I would see to it personally.'],
], 60);
god('durga', 'du_r1', (s) => s.godMet.durga, [['durga', 'Stand up. Again. And again. That is all victory is.']], 20, true);
god('durga', 'du_r2', (s) => s.godMet.durga, [['durga', 'My lion has been asking about you. He likes your courage. He would also like your leftovers.']], 20, true);

// ══════ KUBERA ══════
add({ id: 'k_1', who: 'kubera', pri: 90, when: (s) => !s.flags.kuberaMet, set: { kuberaMet: 1 }, lines: [
  ['kubera', 'A customer! In the Wheel! Do you know how rare it is to meet someone down here who isn’t trying to stab me?'],
  ['abhi', 'Lord Kubera? The treasurer of heaven runs a shop in the Chakravyuha?'],
  ['kubera', 'Treasure gets lost in battles, boy. Rings, coins, cowrie shells, the occasional crown. Wherever wealth goes missing, I set up a stall. Ratna! Say hello.'],
  ['nar', 'The mongoose on his shoulder regards you with contempt, then coughs up a small emerald.'],
  ['kubera', 'Good boy. Now. Kauri, please. I’m a god, not a charity.'],
] });
add({ id: 'k_r1', who: 'kubera', pri: 20, repeat: true, when: () => true, lines: [['kubera', 'Browse, browse! Everything’s blessed. Mostly.']] });
add({ id: 'k_r2', who: 'kubera', pri: 20, repeat: true, when: () => true, lines: [['kubera', 'My half-brother Ravana once stole my flying chariot. Family! Buy something, it’ll help me forget.']] });
add({ id: 'k_r3', who: 'kubera', pri: 20, repeat: true, when: () => true, lines: [['kubera', 'Ratna, don’t bite the customer. Not until after he pays.']] });

// ══════ BOSSES ══════
const boss = (b, id, when, lines, pri = 50, repeat = false) => add({ id, who: b, pri, when, lines, repeat });
boss('jayadratha', 'j_1', (s) => !s.bossMet.jayadratha, [
  ['jayadratha', 'The boy. Of course. Back to the breach, are we?'],
  ['abhi', 'Jayadratha. You’re the one who held the gap shut. My uncles were right behind me.'],
  ['jayadratha', 'And I held them. Bhima, Yudhishthira, the twins, all of them. Shiva’s boon. One day, any Pandava but Arjuna. And Arjuna wasn’t there, was he?'],
  ['abhi', 'He’ll be there tomorrow.'],
  ['jayadratha', '…Yes. I know. I’ve been to tomorrow. But today I hold the gate. Come and try it, little Pandava.'],
], 90);
boss('jayadratha', 'j_2', (s) => s.bossMet.jayadratha && (s.bossKills.jayadratha || 0) >= 1, [
  ['jayadratha', 'You again. My head keeps coming off in this place. Do you know how tedious that is?'],
  ['abhi', 'My father did it the first time. I’m only keeping the family tradition going.'],
  ['jayadratha', 'Your family. Your family shaved my head and paraded me like a beggar, and all I did was ask Draupadi to come away with me. And they call me the villain.'],
  ['abhi', '“Ask.” Is that what you call it?'],
  ['jayadratha', '…Draw your weapon, boy.'],
], 70);
boss('jayadratha', 'j_r1', (s) => s.bossMet.jayadratha, [['jayadratha', 'The gate holds. The gate always holds. That is all I am now.']], 20, true);
boss('jayadratha', 'j_r2', (s) => s.bossMet.jayadratha, [['jayadratha', 'Shiva’s boon lasts one day. In the Wheel it is always the same day. Lucky me.']], 20, true);

boss('karna', 'ka_1', (s) => !s.bossMet.karna, [
  ['karna', 'Abhimanyu.'],
  ['abhi', 'Karna. You cut my bowstring. From behind.'],
  ['karna', 'I did. Drona told me it was the only way to stop you. He was right. That has never made me feel better.'],
  ['abhi', 'You were the best archer on the field after my father. You didn’t need to sneak.'],
  ['karna', 'No. I didn’t. Come, then. Face to face this time. I owe you that much.'],
], 90);
boss('karna', 'ka_2', (s) => (s.bossMet.karna || 0) >= 1 && !s.flags.karnaUncle && s.runs >= 3, [
  ['karna', 'Do you know what you are to me?'],
  ['abhi', 'Someone you helped kill.'],
  ['karna', 'My nephew. Kunti was my mother before she was ever theirs. Arjuna is my brother. I knew before the war started. I fought against all of them anyway, because Duryodhana was the only man who ever called me a friend.'],
  ['abhi', '…You knew. When you cut the string. You knew who I was.'],
  ['karna', 'I knew. Draw your bow, nephew. Don’t forgive me. I couldn’t carry it.'],
], 80);
D[D.length - 1].set = { karnaUncle: 1 };
boss('karna', 'ka_r1', (s) => s.bossMet.karna, [['karna', 'The sun is always behind me. It makes for an unfair fight. I’ve never had a fair one either.']], 20, true);
boss('karna', 'ka_r2', (s) => s.flags.karnaUncle, [['karna', 'Again, nephew. Show me how Arjuna’s son fights when no one is behind him.']], 20, true);

boss('ashwatthama', 'as_1', (s) => !s.bossMet.ashwatthama, [
  ['nar', 'A man with a hole in his forehead where a jewel should be. It weeps, and doesn’t heal. He is laughing.'],
  ['ashwatthama', 'Oh, it’s you. The father. Of course you’re here, I can smell the moon on you.'],
  ['abhi', 'Ashwatthama? Drona’s son? What’s wrong with your—'],
  ['ashwatthama', 'My face? This is what Krishna gives you for aiming at a womb. Three thousand years of it. Haven’t you heard? No, no, it hasn’t happened for you yet. I keep forgetting. I’ve got all the days at once.'],
  ['abhi', 'Aiming at a— at whose womb?'],
  ['ashwatthama', 'Yours, boy. Your wife’s. Your son. The last Pandava. I loose the Brahmastra and it finds him curled up in the dark. Would you like to stop me? Everyone would. Nobody can.'],
], 90);
boss('ashwatthama', 'as_2', (s) => (s.bossMet.ashwatthama || 0) >= 1 && (s.bossKills.ashwatthama || 0) >= 1, [
  ['ashwatthama', 'You beat me once. It doesn’t matter. I can’t die. Do you know how lonely that is? Everyone I hate gets to rest.'],
  ['abhi', 'Then rest. Let it go. Don’t aim at my son.'],
  ['ashwatthama', 'My father died believing I was dead. They lied to him. They said “Ashwatthama is dead”, and he put down his weapons and they cut off his head. You want me to let that go?'],
  ['abhi', '…I want you to let my son go.'],
  ['ashwatthama', 'Then make me.'],
], 70);
boss('ashwatthama', 'as_r1', (s) => s.bossMet.ashwatthama, [['ashwatthama', 'Lay down your arms. Go on. It’s the only thing that stops the Narayanastra. My father knew that. They all knew.']], 20, true);
boss('ashwatthama', 'as_r2', (s) => s.bossMet.ashwatthama, [['ashwatthama', 'Three thousand years. I’ve got time. I’ve got ALL the time.']], 20, true);

boss('drona', 'dr_1', (s) => !s.bossMet.drona, [
  ['nar', 'At the heart of the Wheel the rings stop turning. An old man sits at the centre, perfectly still, a bow across his knees.'],
  ['drona', 'Abhimanyu. You have your father’s stance. Your weight is too far forward. He did that too, at your age.'],
  ['abhi', 'Acharya Drona. You built this.'],
  ['drona', 'I built the formation. The rest it built itself, out of every death inside it. I taught your father everything I knew. I would have taught you too, if the world had allowed it.'],
  ['abhi', 'Then teach me now. Tell me the way out.'],
  ['drona', 'A teacher cannot give the last lesson. He can only set the exam. Show me what you know, child.'],
], 90);
boss('drona', 'dr_2', (s) => (s.bossKills.drona || 0) >= 1, [
  ['drona', 'You return. Good. A student who comes back is a student who is still learning.'],
  ['abhi', 'You let me through last time. Didn’t you.'],
  ['drona', 'I tested you, and you passed. The Wheel let you through. It will always close again. That is what wheels do.'],
  ['abhi', 'Then what’s the point of breaking it?'],
  ['drona', 'Ah. Now that is the correct question. Defend yourself.'],
], 70);
boss('drona', 'dr_r1', (s) => s.bossMet.drona, [['drona', 'Stance. Breath. Eyes on the whole field, not the arrow. Again.']], 20, true);
boss('drona', 'dr_r2', (s) => s.bossMet.drona, [['drona', 'I loved your father more than my own son. Did you know? Ashwatthama knew. Come.']], 20, true);

// Boss defeat lines (shown when they fall)
M.BOSS_DEFEAT = {
  jayadratha: ['The gate… opens. Tell Arjuna I’ll be waiting at sunset.', 'Again. Always again. Go on, then.'],
  karna: ['Well struck. Your father would have— no. You struck better.', 'Go, nephew. I’ll stand at your back this time. Where I should have stood.'],
  ashwatthama: ['It doesn’t matter. It doesn’t matter. I’ll be waiting at the end of the war.', 'Ha… ha. Maybe you’ll stop me, little father. Someone has to.'],
  drona: ['There. Do you feel it? The rings are opening. Not because you broke them, child. Because you understood them.', 'Go. Your exam is over. Go and teach it to him.'],
};

// ══════ UTTARA VISIONS (rest pools) ══════
M.VISIONS = [
  [
    ['nar', 'The pool goes still. The reflection isn’t yours. It’s a riverbank at dusk, and a young woman kneeling to set a lamp on the water.'],
    ['uttara', 'They told me you broke into the formation like the sun rising. That six of them fell before you did. That you laughed.'],
    ['uttara', 'Of course you laughed. You laugh when you’re frightened. You think I don’t know that.'],
    ['abhi', 'Uttara! Uttara, can you hear me?'],
    ['uttara', 'Your son kicked this morning. I told him who you were. I told him you’re late.'],
  ],
  [
    ['nar', 'Night. A palace room. She sits by a window with her hand on her belly.'],
    ['uttara', 'Your mother keeps asking me when we’ll do the rites. When I’ll let them pour the water for you.'],
    ['uttara', 'Not yet. I keep saying not yet. If I pour the water, you go to the far shore and I don’t think you’ll be able to find your way back.'],
    ['abhi', 'I’m trying, Uttara. I’m trying so hard to come back.'],
    ['uttara', '…Is that you? Or am I mad? Subhadra says grief makes you hear things.'],
  ],
  [
    ['nar', 'Morning light. She’s laughing at something, the first time you’ve heard it in all this time.'],
    ['uttara', 'Krishna came today. He put his hand on my belly and said your son will be tested before he is born.'],
    ['uttara', 'I asked what that means and he just smiled the way he does, like he’s already read the end of the story.'],
    ['abhi', 'Tested. Ashwatthama… he means Ashwatthama.'],
    ['uttara', 'I’ve decided I don’t like riddles. You never told riddles. You just said what you meant, too loudly.'],
  ],
  [
    ['nar', 'She’s asleep. She speaks in her sleep, as she always did.'],
    ['uttara', 'I dreamed you were fighting. Ring after ring, all alone. Abhimanyu… don’t.'],
    ['uttara', 'Don’t fight your way back to me if it hurts you. I’d rather you were at peace. I’d rather…'],
    ['uttara', '…no. I’m lying. Come home. Come home, you idiot.'],
    ['abhi', 'I’m coming. I promise. I always keep my promises. Eventually.'],
  ],
  [
    ['nar', 'Uttara at the riverbank again. More lamps on the water now, hundreds of them. She lit one for every soldier.'],
    ['uttara', 'I’ve decided what I’m going to teach him. I’m going to teach him how to leave.'],
    ['uttara', 'How to leave a room that’s on fire. How to leave a fight he can’t win. How to leave a grudge before it eats him. Everything nobody taught you.'],
    ['abhi', '…That’s the other half. That’s the half I never heard.'],
    ['uttara', 'Someone in this family has to finish a lesson.'],
  ],
];
M.VISION_REPEAT = [
  [['nar', 'In the still water, Uttara is asleep, one hand curled around the curve of her belly. A lamp burns at the window. It doesn’t go out.']],
  [['nar', 'You see her braiding her hair, humming a song from the Matsya court. It’s the song you danced to at your wedding. Badly.']],
  [['nar', 'She’s writing something. The ink catches the lamplight. A name, over and over, trying out different spellings for a child.']],
];

// ══════ CUTSCENES ══════
M.CUTSCENES = {
  prologue: [
    { art: 'field', text: 'Kurukshetra. The thirteenth day of the war.' },
    { art: 'vyuha', text: 'Drona, teacher of princes, has arranged his army into the Chakravyuha: a spiral of seven turning rings. Whoever enters is ground down at the centre.' },
    { art: 'womb', text: 'Years ago, Arjuna told his pregnant wife Subhadra how to break into it. The unborn child in her womb listened. Before Arjuna could explain the way out, Subhadra fell asleep.' },
    { art: 'boy', text: 'That child is Abhimanyu. He is sixteen, newly married, and his wife Uttara is carrying his son. Arjuna has been lured to the far end of the field.' },
    { art: 'breach', text: 'Abhimanyu breaks the Wheel open. His uncles are meant to follow him through the breach. They do not.' },
    { art: 'wheel', text: 'Seven great warriors fall on him at once. When his bow is cut and his sword is broken, he fights on with the wheel of his own chariot.' },
    { art: 'river', text: 'He dies at sunset. He does not cross the river.' },
  ],
  victory1: [
    { art: 'open', text: 'The seventh ring opens like a lotus at dawn.' },
    { art: 'chamber', text: 'A palace chamber in Upaplavya. Moonlight on the floor. Uttara is asleep, one hand on the curve of her belly.' },
    { art: 'chamber', text: 'Abhimanyu kneels beside the bed. He has no body here, only moonlight. He speaks to his son anyway.' },
    { art: 'chamber', text: '“Listen. This is how you break into the Chakravyuha. You go in at the third ring, where it turns slowest. You go in laughing. That frightens them.”' },
    { art: 'chamber', text: '“And this is how you get out—”' },
    { art: 'chamber', text: 'He stops. He still does not know. He talks until dawn anyway: about mangoes, and wrestling, and the way your mother laughs at bad jokes.' },
    { art: 'dawn', text: 'At sunrise the Wheel draws him back. He goes, for now.' },
  ],
  victory2: [
    { art: 'open', text: 'Again the rings fall away.' },
    { art: 'chamber', text: 'More time has passed beyond the Wheel. The war is over. The Pandavas have won, and there is almost no one left to rule.' },
    { art: 'chamber', text: 'Uttara is awake this time. She looks straight at the moonlight on the floor.' },
    { art: 'chamber', text: '“I know you’re there,” she says. “Don’t say anything. I won’t be able to stand it. Just… stay until I fall asleep.”' },
    { art: 'dawn', text: 'He stays.' },
  ],
  trueEnding: [
    { art: 'open', text: 'The third time, the Wheel does not open. Abhimanyu does.' },
    { art: 'drona', text: 'At the centre, Drona lowers his bow. “You understand now. The Chakravyuha is not left by force. You leave it the moment you no longer need to escape.”' },
    { art: 'drona', text: '“You came for the second half of the lesson, child. Here it is. Letting go is not losing. It is the last thing a warrior learns.”' },
    { art: 'brahmastra', text: 'Outside the Wheel it is the night after the war. Ashwatthama looses the Brahmastra. It crosses the sky like a second sun and falls into Uttara’s womb.' },
    { art: 'stillborn', text: 'The child is born still. Blue. Silent. The women of the palace begin to wail.' },
    { art: 'krishna', text: 'Krishna takes the child in his arms. “If I have never once strayed from truth,” he says, “let this child live.”' },
    { art: 'moon', text: 'And in that moment a thread of moonlight slips through the window, the last breath of a boy who was sixteen years old, and enters the child’s chest.' },
    { art: 'baby', text: 'The baby cries. They name him Parikshit, “the tested one.” All his life he will look for the face he saw in the dark before he was born.' },
    { art: 'chandra', text: 'Above the palace the moon is full. Chandra holds out his hand, and this time his son takes it, by his own choice and in his own time.' },
    { art: 'yama', text: 'At the edge of the far shore Yama is waiting with a lamp. “You found the way out,” he says. “I did,” says Abhimanyu. “I’ll leave it open for the next one.”' },
    { art: 'title', text: 'MOKSHA' },
  ],
};

M.DIALOGUE = D;
M.dialogueFor = (who, s) => {
  const cand = D.filter((e) => e.who === who && (e.repeat || !s.seen[e.id]) && e.when(s));
  if (!cand.length) return null;
  const top = Math.max(...cand.map((e) => e.pri));
  const best = cand.filter((e) => e.pri === top);
  return M.pick(best);
};
