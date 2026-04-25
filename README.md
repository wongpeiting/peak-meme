# White House Peak Memes

Last month, the White House’s TikTok account began posting a series of meme-style videos about U.S. military strikes that looked less like official communication and more like internet content. I wanted to understand how a government account got there, particularly whether this was a one-off anomaly, or the endpoint of a broader shift in how state power is presented online.

So when the White House crossed 600 TikToks on April 1, I took it that it is time to scrape and classify the posts according to themes I was interested in, be they meme usage, gamification, profanity use, or hyper-masculinity and aura-farming tendencies – whatever caught my attention as I reviewed the videos one by one. I emerged from the process understanding a government's bid to steadily push the boundary between institutional communication and internet entertainment, and [this scrolly article was what came out of it](wongpeiting.github.io/peak-meme).

**Bonus companion game:** Instead of reading the analysis, you can try your hand at role-playing as a social media coordinator for the White House – [Can You Run the White House TikTok?](https://wongpeiting.github.io/meme-game/)

## How this was made

- **Video and metadata collection**: I scraped all 600 White House TikTok posts (including likes, shares and number of comments) using Playwright CDP and downloaded the associated media using yt-dlp, then ran Whisper transcriptions through video content for their captions. 
- **Keyframe extraction for grid layout**: For each video, I used ffmpeg to extract 8 evenly-spaced frames, and picked the most representative frame for every video using a graphical user interface (GUI) built with Claude's help.
- **Post classification and tagging**: I then created another GUI to make the post review, tagging and classification process more of a breeze (spoiler: it was an arduous process that tested my mental resolve, so I needed all the help I could get 🫨).
<img width="1440" height="729" alt="Image" src="https://github.com/user-attachments/assets/1f3153f1-d1dc-4135-b0a6-3a0951ace6c6" />

> **Rant:** On this GUI, each video are pre-loaded and auto-play with audio, promising a jump-scare everytime I reopen my laptop to begin the uphill task of getting past a 100-post milestone each day. In other tales, I thought I was being smart when I sent the 600 videos through Gemini 2.5 Flash to do its AI magic and attempted training it using a golden dataset based on my early classifications. The results were poor. The AI struggled with the nuances that mattered most – it could not reliably distinguish between a produced highlight reel and a meme-packaged edit, missed fictional overlays that required cultural context, like recognising a Minecraft interface. The best it could do for my project was to identify the right pop culture references used in the TV and movie clips adapted for the feed. It turns out the tasks of understanding jokes, detecting troll behavior and picking up other tongue-in-cheek references remain firmly the labor a human cannot replace. To its credit, the jokes were made in relation to present day news and stimuli, so it was not that reasonable an ask, unless I feed it news and press releases (which is something I did anyway, by downloading and matching White House news releases to same-day posts). I digress.

- **Classification refinement**: The early scope focused on war content specifically, using keyword filtering to flag military-related posts. But the story shifted as I reviewed the videos to find that the war memes were not an isolated phenomenon, but sat at the end of a longer meme escalation that had been building across the account's eight-month history. As I went along, I refined and built a two-dimensional classification system: 8 subject categories and 7 packaging levels ranging from official (level 1) to gamified (level 7), where the layering of game-UI overlays and other techniques makes institutional content teeter on fictional. This framework is the backbone for much of the analysis down the road. Tags were also developed iteratively as patterns emerged during review, added whenever I noticed recurring techniques the original taxonomy had not anticipated. To keep things consistent, I had returned to the classified posts to recategorize everything based on the final set of categories and tags.
- **Profanity count**: To ensure that I standardize a way to count this, I created a (very manual) system to log instances in a Google Doc. I also have an expletive/swearing tag, as well as log profanity use in the classification GUI's notes section, but the Google Doc is where I ensure that I have a standard way of checking who or what used the profanity, and whether the post is on Instagram as well, knowing that Instagram generally has stricter moderation standards:
<img width="688" height="609" alt="Image" src="https://github.com/user-attachments/assets/17a48259-0632-47e0-bb62-47cf6c4c9623" />

**TL;DR** I watched, classified, tagged and took notes of every TikTok video from the Trump White House (Aug 19, 2025 to Apr 1, 2026, with a 600-post cut-off) so you don't have to.

## Structure

The classification work is documented in `data/classifications_final.csv`, `data/CLASSIFICATION_MATRIX.md`. The Jupyter notebooks in `notebooks/` contain the exploratory analysis that informed the narrative, testing different groupings, checking tag co-occurrences, and verifying the statistical claims that appear in the piece.

The scrollytelling site was built in vanilla JavaScript with D3.js for data visualisation and GSAP ScrollTrigger for scroll-driven animations.

```
index.html          Main scrollytelling page
style.css           Styles
scroll.js           GSAP scroll animations (opening/closing)
article.js          State controller for scroll steps
viz-strike.js       Timeline and lineage visualisations
viz-grid.js         600-post grid visualisation
data/
  grid_posts.json            600 posts with classifications
  strike_lineage.json        Curated lineage data for timelines
  profanity.json             35 posts with profanity metadata
  classifications_final.csv  Full classified dataset with notes
  CLASSIFICATION_MATRIX.md   Subject/packaging taxonomy (v5)
images/
  1-on-fire.png              Opening meme panel
  2-this-is-fine.png         Closing meme panel
  grid/                      600 post thumbnails
videos/                      51 TikTok videos referenced in the piece
notebooks/
  explore_classifications.ipynb   Classification analysis and data review
  profanity_analysis.ipynb        Profanity tracking and source breakdown
```

## How I designed with Claude

A big part of this project was its visual elements. The brief by my professor, Jonathan Soma, was to build a visual narrative. I thought there's nothing better than to kick off a scrolly about memes with a meme. The iconic 'this is fine' dog by [KC Green](https://kcgreendotcom.com/) came to mind. While cleaning up my assets for this project, I came across the very prompt that kicked it off, so I am leaving it here for posterity:

<img width="1093" height="746" alt="Image" src="https://github.com/user-attachments/assets/0af2334d-8973-452d-a94e-5f75b45039d7" />

For other parts of the project, I took heavy visual reference from the New York Times' exploration of [Tucker Carlson Tonight episodes](https://www.nytimes.com/interactive/2022/04/30/us/tucker-carlson-tonight.html) (Thanks to Jasmine Cui for pointing me to it!), and Bloomberg's [YouTube’s Right-Wing Stars Fuel Boom in Politically Charged Ads](https://www.bloomberg.com/graphics/2025-conservative-youtube-stars-marketing-boom/) (+ Leon Yin's NICAR sharing covering how to work with TikTok content). 

I started with a Vanilla JS version of grid layout of the 600 White House posts, tried to pivot the grid to a D3.js wireframe in between, but returned to the vanilla version in the end. Swimming in D3 without the proper vocab to specify more complicated requirements – such as having videos move toward the reader and start playing with a scroll step – was daunting. I couldn't debug confidently enough, and decided that I was better off working with what I could control, especially with a deadline looming. Here's how broken it looked when I made the switch to D3:

<img width="1431" height="782" alt="Image" src="https://github.com/user-attachments/assets/48f895f1-32db-4a01-9237-b37a8350bf20" />

No hate on D3 though. I think it's fantastic. I just haven't figured it out.

### Happy to hear from you

I can be reached on pw2635@columbia.edu. Big thanks to [Soma](https://x.com/dangerscarf), [Derrick Ho](https://x.com/derrickhozw), [Kai Teoh](https://x.com/jkteoh) and [Dhrumil Mehta](https://x.com/DataDhrumil) for providing great feedback on this piece, allowing me to shape the project direction and make critical tweaks to narrative flow before I present it to the world.
