# How the White House hit peak meme

Last month, the White House’s TikTok account began posting a series of meme-style videos about U.S. military strikes that looked less like official communication and more like internet content. I wanted to understand how a government account got there, particularly whether this was a one-off anomaly, or the endpoint of a broader shift in how state power is presented online.

So when the White House crossed 600 TikToks on April 1, I took it that it is time to scrape and classify the posts according to themes I was interested in, be they meme usage, gamification, profanity use, or hyper-masculinity and aura-farming tendencies – whatever caught my attention as I reviewed the videos one by one. I emerged from the process understanding a government's bid to steadily push the boundary between institutional communication and internet entertainment, and [this scrolly article was what came out of it](wongpeiting.github.io/peak-meme).

## How this was made

- **Video and metadata collection**: I scraped all 600 White House TikTok posts (including likes, shares and number of comments) using Playwright CDP and downloaded the associated media using yt-dlp, then ran Whisper transcriptions through video content for their captions. 
- **Keyframe extraction for grid layout**: For each video, I used ffmpeg to extract 8 evenly-spaced frames, and picked the most representative frame for every video using a graphical user interface (GUI) built with Claude's help.
- **Post classification and tagging**: I then created another GUI to make the post review, tagging and classification process more of a breeze (spoiler: it was an arduous process that tested my mental resolve, so I needed all the help I could get 🫨). On this GUI, each video are pre-loaded and auto-play with audio, promising a jump-scare everytime I reopen my laptop to begin the uphill task of getting past a 100-post milestone each day. In other tales, I thought I was being smart when I sent the 600 videos through Gemini 2.5 Flash to do its AI magic and attempted training it using a golden dataset based on my early classifications. The results were poor. The AI struggled with the nuances that mattered most – it could not reliably distinguish between a produced highlight reel and a meme-packaged edit, missed fictional overlays that required cultural context, like recognising a Minecraft interface. The best it could do for my project was to identify the right pop culture references used in the TV and movie clips adapted for the feed. It turns out the tasks of understanding jokes, detecting troll behavior and picking up other tongue-in-cheek references remain firmly the labor a human cannot replace. To its credit, the jokes were made in relation to present day news and stimuli, so it was not that reasonable an ask, unless I feed it news and press releases (which is something I did anyway, by downloading and matching White House news releases to same-day posts). I digress. 
- **Classification refinement**: The early scope focused on war content specifically, using keyword filtering to flag military-related posts. But the story shifted as I reviewed the videos to find that the war memes were not an isolated phenomenon, but sat at the end of a longer meme escalation that had been building across the account's eight-month history. As I went along, I refined and built a two-dimensional classification system: 8 subject categories and 7 packaging levels ranging from official (level 1) to gamified (level 7), where the layering of game-UI overlays and other techniques makes institutional content teeter on fictional. This framework is the backbone for much of the analysis down the road. Tags were also developed iteratively as patterns emerged during review, added whenever I noticed recurring techniques the original taxonomy had not anticipated. To keep things consistent, I had returned to the classified posts to recategorize everything based on the final set of categories and tags.

TL;DR: I watched, classified, tagged and took notes of every TikTok video from the Trump White House (Aug 19, 2025 to Apr 1, 2026, with a 600 post cut-off) so you don't have to.

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