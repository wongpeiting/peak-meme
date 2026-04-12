# Experiment 2: Classification Matrix (v5)

## Design principle

Two clean dimensions: **SUBJECT** (what) and **PACKAGING** (how far from institutional). Tags for granular detail. The packaging spectrum IS the escalation story — from institutional reality to teetering on fictional.

---

## Dimension 1: SUBJECT — What is this about?

*Single-select. 8 categories. Pick the PRIMARY subject.*

| ID | Count | Label | What it covers | Example |
|----|-------|-------|---------------|---------|
| `governance` | 149 | Governing & diplomacy | Executive orders, economic numbers ("$10.5 trillion"), energy policy, legislation, foreign dignitary meetings, trade deals, summit handshakes. If Trump is shown with policy achievements (gas prices, executive orders), it's this — not "trump". | "$10.5 TRILLION IN 1 YEAR", "Pass the Save America Act" |
| `promotion` | 83 | Promotion / meta | WH app launch, internships, roundups, "subscribe", DHS recruitment videos credited to DHS. Self-referential content about the account or government recruiting itself. | "LAUNCHED: THE WHITE HOUSE APP", internship posts |
| `opponents` | 83 | Attacking opponents | Mocking Democrats (Schumer, Pelosi, Biden, Jeffries), attacking media/CNN, ridiculing journalists. The mockery is the point. If it blames Democrats for an immigration issue, it's this — not enforcement. | DemBusters, Grinch mocking Dems, ripping reporters |
| `trump` | 79 | Celebrating Trump | The video's entire purpose is hero worship. GOAT framing, dramatic montages of Trump looking powerful, victory laps. Trump appears in almost every video — only pick this if the point IS Trump, not a policy he's in. | "The best to ever do it", "TWO GOATS. CR7 x 45/47" |
| `enforcement` | 70 | Law enforcement | Immigration, ICE raids, deportation, border wall, "illegals", CBP, crime stats, DHS recruitment. The enforcement apparatus. If Trump appears alongside ICE footage, it's still this. | "Deportation Express", "Border is LOCKED", CBP app |
| `culture` | 68 | Culture & sports | Sports events, holidays, entertainment, Olympics, lifestyle moments. The Cristiano Ronaldo meeting, March Madness, St Patrick's Day, Christmas. The soft stuff with no policy edge. | St Patrick's Day, March Madness, baseball, Graceland |
| `war` | 64 | War & military | Iran strikes, Operation Epic Fury, military operations, combat footage, troops deploying, military men celebrated or mourned. If the main point of the post is military hardware, military personnel or strike footage, it's war — even if Trump appears heroically. | STRIKE, OBJECTIVE 1/2/3, "FAFO" (when war-related) |
| `unclear` | 4 | Unclear | Genuinely ambiguous. Cryptic posts with no context. If you can't tell what the video is about after watching it, pick this. | Cryptic posts with no context |

---

## Dimension 2: PACKAGING — Institutional to teetering on fictional

*Single-select. 7 levels, ordered. The level number measures how much the White House blurred the line between governing and entertainment — how much fictional framing has been layered onto real government content.*

*A press briefing packaged as a press briefing is Level 1. A press briefing packaged with GTA overlays is Level 7. Same content, different packaging. By Level 7, the viewer doesn't know whether to process it as news or entertainment.*

| Level | ID | Count | Label | What it looks like |
|-------|-----|-------|-------|--------------------|
| 1 | `official` | 176 | Official | Press conference, signing ceremony, official statement. Clean editing. Talking heads. What government video normally looks like. Little style or flair. |
| 2 | `direct_address` | 15 | Direct address | One person talking to camera with personality. MAGA Minute style. Conversational, breaking the fourth wall. Still feels like government but with a human face. |
| 3 | `produced` | 211 | Produced / cinematic | Dramatic slow-mo, hero shots, epic music, film-trailer energy. High production but NO internet culture. Stock military B-roll (planes, convoys), Trump walking shots with dramatic score. Key test: feels like a movie trailer or Super Bowl ad. |
| 4 | `tiktok` | 85 | TikTok-native | Trending TikTok audio, fast cuts, POV format, platform-native editing. Standard TikTok — any brand account does this. Not memey yet but speaking the platform's language. Key test: feels like a TikTok creator's edit, not a movie trailer. |
| 5 | `pop_culture` | 30 | Pop culture mashup | Recognisable movie/TV/music clips SPLICED INTO government footage. You see actual scenes from Home Alone, Ghostbusters, Top Gun, Sabrina Carpenter, Polar Express. Entertainment content mixed with real government footage. |
| 6 | `meme` | 69 | Internet meme | Deep-fried effects, bass-boosted distortion, impact font, meme audio clips, "it's joever", "let him cook". Internet meme culture IS the point. Troll energy, mockery formats, sombreros raining. Key test: looks like it was made on a meme generator. |
| 7 | `game_ui` | 14 | Gamified | Game UI or action reel composited on real footage. GTA wanted level, Call of Duty kill feed, Wii Sports, health bars, achievement unlocked. The furthest from anything a government has ever done. Viewer can't tell if it's news or a game. |

*Why Level 7 is the peak: it's not about meme intensity — it's about institutional distance. No government has ever composited video game UI or action reels onto real military footage before. Deep-fried memes are internet culture; game interfaces on airstrikes are a category violation. The viewer is teetering between reality and a fictional world.*

---

## Dimension 3: TECHNIQUE TAGS — Multi-select

*Granular observable details. Pick all that apply.*

### Audio
| Tag | Count | What to look for |
|-----|-------|-----------------|
| `trending_audio` | 107 | Trending TikTok songs — popular songs used because they're trending, not necessarily meme-coded. You could Shazam it. A real song by a real artist — Kesha, Sabrina Carpenter, Moneybagg Yo, Jess Glynne. Exists on Spotify. May be trending on TikTok but it's a song first. Test: is it on Spotify? |
| `meme_audio` | 103 | Meme audio — viral sounds, meme clips, songs used for their cultural/ironic meaning. You can't Shazam it. A sound bite that only exists as internet culture — a movie quote, a catchphrase, a sound effect, the AI TikTok voice, SpongeBob's "you wanna see me do it again?", record scratch. Test: does it only make sense as a meme? |
| `bass_drop` | 99 | Heavy bass drops, bass-boosted rumbling audio. That dramatic booming sound that makes the video feel intense. Common across produced and TikTok-native posts. |
| `dramatic_score` | 174 | Epic orchestral music, film trailer energy. The kind of score you'd hear in a Marvel trailer or war documentary. Original or generic — not a specific recognisable song. |
| `speech_audio` | 360 | The actual person speaking — Trump's speech, press secretary's briefing, a reporter asking a question. The real audio from the event, not added in post. Could also be a voiceover sound. |
| `hype_language` | 63 | The verbal equivalent of bass-boosted audio. The language of sports commentary and gaming streams applied to governance. Over-the-top, charged language in speech. Language designed to pump up, not inform.  |

### Visual effects
| Tag | Count | What to look for |
|-----|-------|-----------------|
| `speed_ramp` | 169 | Slow-mo to fast cut transitions. The video dramatically slows down for a hero moment, then speeds up. Used for dramatic effect across all packaging levels. |
| `stock_hero` | 154 | Stock hero shots — pre-shot clips reused across videos like a production library. Includes: Trump walking/waving/handshaking sequences, glamour footage of US military planes flying in formation, 4-wheelers/convoys riding through desert, heroic military hardware B-roll. Any footage that appears recycled across multiple posts rather than shot for the specific video or event. |
| `deep_fried` | 15 | Visual distortion, oversaturation, glitchy fried effects. The image looks deliberately degraded — crunchy, blown-out, vibrating. A signature of internet meme culture. |

### Narrative structure
| Tag | Count | What to look for | Why it matters for the story |
|-----|-------|-----------------|------------------------------|
| `highlight_reel` | 299 | Rapid montage of "wins" set to music. Quick cuts of Trump signing orders, shaking hands, crowds cheering. A greatest-hits compilation designed to create a feeling of momentum. | Emotional manipulation — governance becomes hype video |
| `comparison` | 73 | Side-by-side or before/after structure. Biden vs Trump, "then vs now", Democrat policy vs Republican policy. Two things placed next to each other to make one look bad. Attempts to change the narrative by disparaging and presenting current set of logic as the correct way of thinking about the subject. | Basic persuasion — "they were bad, we're good" |
| `punchline` | 81 | The video builds to a reveal or payoff — setup then punchline, twist ending, "wait for it" energy. Comedy structure applied to government content. | Comedy structure applied to government content |
| `call_response` | 76 | Responding directly to critics or opponents by reframing their words. Shows the criticism, then the "clap back". Adversarial — the WH isn't informing, it's fighting. | Adversarial — the WH isn't informing, it's fighting |
| `fictional_overlay` | 60 | A fictional frame imposed on real footage — game UI on a real airstrike, a movie scene spliced to imply a parallel, a meme template applied to real government footage. Reality seen through fiction. | The viewer processes reality through fiction. The escalation endpoint. |
| `gamification` | 18 | Real events framed as games — bowling strikes for airstrikes, baseball home runs for policy wins, scoreboards, achievement popups. Blurs the line between reality and play. | Blurs reality and play |

### Tone & framing
| Tag | Count | What to look for |
|-----|-------|-----------------|
| `aura_farming` | 210 | Content designed to make Trump (or the administration) look impossibly cool, powerful, or untouchable. Borrowing clout from celebrities, athletes, dramatic moments. The Cristiano Ronaldo meeting, the slow-mo walk, the "GOAT" framing. Building the myth, not the policy. |
| `provocative` | 139 | Makes the other side angry. Confrontational, aggressive, daring you to react. There IS a policy argument but it's delivered as a threat or taunt. FAFO. "Burn the flag, one year in jail." Test: is it aggressive? |
| `troll` | 103 | Makes you laugh or go "wtf." Absurd, silly, random, chaotic. No policy argument — just vibes. If you showed it to someone with no political context, they'd just think it's weird. The pickle. Sombreros raining. Test: is it absurd? |
| `hyper_masculine` | 77 | Content that leans hard into masculine energy — strength, dominance, aggression, military power, tough-guy posturing. UFC vibes, "alpha" framing, weaponry, muscular imagery. Selling power as masculinity. |

### Content flags
| Tag | Count | What to look for |
|-----|-------|-----------------|
| `named_target` | 88 | Names a person to mock or attack — Schumer, Pelosi, a specific reporter, Maduro, an 'illegal alien'. Not just "Democrats" generally but a named individual. |
| `trump_dance` | 40 | Trump doing his signature dance moves. A recurring motif across many posts — the goofy YMCA dance, the fist pump, the sway. Used to make him look relatable/fun. |
| `expletive` | 36 | FAFO, LFG, "fuck it", swearing — even if censored in caption, obscured behind an acronym, bleeped in audio. All the more if audible in video. Any language you wouldn't expect from an official government account. |
| `real_war_footage` | 31 | Actual military footage — airstrikes hitting targets, missiles launching, troops deploying, ships exploding. Real violence from real operations, not stock footage or CGI. |
| `ai_or_cgi` | 20 | AI-generated or CGI visuals. Animated sombreros, 3D renders, anything that isn't real camera footage or screen recordings. |
| `maga_minute` | 8 | MAGA Minute format — direct-to-camera segment by press secretary or WH staff |
| `recruitment` | 3 | Content that functions as a recruitment pitch — DHS/ICE hiring, military enlistment energy, "join us" framing. Makes enforcement or military work look exciting and aspirational. The "A surge of PATRIOTS" energy. |

---

## Dimension 4: NOTES

*Free text. Optional. For anything the categories miss — e.g. "uses the same Trump walking clip as 3 other posts" or "this feels like it's responding to something specific."*

---

## The grid visual this enables

| Scroll step | Grid state | Reader feels |
|-------------|-----------|-------------|
| "Here's every post" | All lit, neutral | Scale — 588 is a lot |
| "Coloured by packaging level" | ① grey → ⑦ red gradient | Most are grey. A few burn bright red. |
| "Show me war posts" | Filter to war | They span the whole spectrum — grey briefings to red game overlays |
| "Show me culture posts" | Filter to culture | Same spread — same playbook |
| "Same playbook. Different stakes." | War + culture side by side | The gut punch |
