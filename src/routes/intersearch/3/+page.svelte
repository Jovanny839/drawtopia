<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import logo from "../../../assets/logo.png";
  import timeIcon from "../../../assets/redtimeicon.svg";
  import favorblueicon from "../../../assets/favorblueicon.svg";
  import hintpurpleicon from "../../../assets/hintpurpleicon.svg";
  import cupgreenicon from "../../../assets/cupgreenicon.svg";
  import arrowclockwise from "../../../assets/WhiteArrowClockwise.svg";
  import downloadSimple from "../../../assets/DownloadSimple.svg"
  import shareIcon from "../../../assets/Share.svg";
  
  // Fallback images
  import magicalforest from "../../../assets/magicalforest.png";
  import enchantedcastle from "../../../assets/enchantedcastle.png";
  import crystalcave from "../../../assets/crystalcave.png";
  import rainbowmeadow from "../../../assets/rainbowmeadow.png";

  type Scene = {
    id: number;
    title: string;
    subtitle: string;
    time: string;
    hints: number;
    stars: number; // 0..3
    image: string;
  };

  const totalTime = "0:48";
  const hintsUsedTotal = 0;
  const avgStars = 3.0;
  const bestScene = "Scene 1";

  // Scene titles based on world (matching intersearch/1)
  const sceneTitles: { [key: string]: string[] } = {
    "enchanted-forest": [
      "The Magical Forest",
      "The Enchanted Castle",
      "The Crystal Cave",
      "The Rainbow Meadow",
    ],
    "outer-space": [
      "The Cosmic Station",
      "The Alien Planet",
      "The Asteroid Field",
      "The Nebula Garden",
    ],
    "underwater-kingdom": [
      "The Coral Reef",
      "The Sunken Palace",
      "The Pearl Cave",
      "The Kelp Forest",
    ],
  };

  let scenes: Scene[] = [
    {
      id: 1,
      title: "Scene 1",
      subtitle: "The Magical Forest",
      time: "10:13",
      hints: 0,
      stars: 3,
      image: magicalforest
    },
    {
      id: 2,
      title: "Scene 2",
      subtitle: "The Enchanted Castle",
      time: "10:13",
      hints: 0,
      stars: 2,
      image: enchantedcastle
    },
    {
      id: 3,
      title: "Scene 3",
      subtitle: "The Crystal Cave",
      time: "10:13",
      hints: 0,
      stars: 2,
      image: crystalcave
    },
    {
      id: 4,
      title: "Scene 4",
      subtitle: "The Rainbow Meadow",
      time: "10:13",
      hints: 0,
      stars: 3,
      image: rainbowmeadow
    },
  ];

  onMount(() => {
    if (browser) {
      // Get selected world from sessionStorage
      const selectedWorld = sessionStorage.getItem("intersearch_world") || "enchanted-forest";
      const titles = sceneTitles[selectedWorld] || sceneTitles["enchanted-forest"];
      
      // Load images from sessionStorage for first 4 scenes
      const loadedScenes: Scene[] = [];
      for (let i = 1; i <= 4; i++) {
        const storedImageUrl = sessionStorage.getItem(`intersearch_scene_${i}`);
        // Clean URL by removing query parameters (matching intersearch/1 behavior)
        const imageUrl = storedImageUrl ? storedImageUrl.split("?")[0] : null;
        const sceneTitle = titles[i - 1] || `Scene ${i}`;
        
        loadedScenes.push({
          id: i,
          title: `Scene ${i}`,
          subtitle: sceneTitle,
          time: "10:13", // You can store this in sessionStorage if needed
          hints: 0, // You can store this in sessionStorage if needed
          stars: 3, // You can store this in sessionStorage if needed
          image: imageUrl || scenes[i - 1].image // Fallback to default image if not found
        });
      }
      
      scenes = loadedScenes;
    }
  });

  function starRow(count: number) {
    const on = Array(count).fill("★").join("");
    const off = Array(3 - count)
      .fill("☆")
      .join("");
    return on + off;
  }

  function handleGoHome() {
    goto('/dashboard');
  }

  function handlePlayAgain() {
    // Set flag to regenerate scenes
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('intersearch_regenerate', 'true');
    }
    goto('/intersearch');
  }
</script>

<div class="complete-outer">
  <div class="brand-container">
    <img class="brand" src={logo} alt="Drawtopia" />
  </div>

  <div class="card">
    <div class="header-container">
      <h2 class="title">Adventure Complete!</h2>
      <div class="subtitle">You found Luna in all 4 scenes!</div>
    </div>

    <hr class="divider" />

    <div class="metrics">
      <div class="metric-row">
        <div class="metric">
          <div class="metric-head">
            <img src={timeIcon} alt="Time" />
          </div>
          <div class="metric-value">
            <span>Total Time</span>
            <span class="metric-value-time">
              {totalTime}</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-head">
            <img src={hintpurpleicon} alt="Hints Used" />
          </div>
          <div class="metric-value">
            <span>Hints Used</span>
            <span class="metric-value-time">{hintsUsedTotal}</span>
          </div>
        </div>
      </div>
      <div class="metric-row">
        <div class="metric">
          <div class="metric-head">
            <img src={favorblueicon} alt="Avg Stars" />
          </div>
          <div class="metric-value">
            <span>Avg Stars</span>
            <span class="metric-value-time">{avgStars}</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-head">
            <img src={cupgreenicon} alt="Best Scene" />
          </div>
          <div class="metric-value">
            <span>Best Scene</span>
            <span class="metric-value-time">{bestScene}</span>
          </div>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <div class="scene-by-scene-container">

      <div class="section-title">Scene-by-Scene Breakdown</div>
  
      <div class="grid">
        {#each scenes.slice(0, 4) as s}
          <div class="scene-card">
            <div class="thumb-wrap">
              <img src={s.image} alt={s.title} class="thumb" draggable={false} />
            </div>
            <div class="scene-info">
              <div class="scene-info-title">
                <div class="scene-title">{s.title}</div>
                <div class="scene-sub">{s.subtitle}</div>
              </div>
              <div class="scene-info-meta">
                <div class="scene-meta">
                  <span>⏱ Time: {s.time}</span>
                  <span>💡 Hint Used: {s.hints}</span>
                  <div class="scene-stars" aria-label={`Stars: ${s.stars}/3`}>
                    {starRow(s.stars)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="actions">
      <div class="button" on:click={handlePlayAgain} style="cursor:pointer;">
        <div class="arrowclockwise">
          <img src={arrowclockwise} alt="Arrow Clockwise" />
        </div>
        <div class="play-again"><span class="playagain_span">Play Again</span></div>
        <div class="ellipse-1415"></div>
      </div>
      <div class="button download-pdf-btn" style="cursor:pointer;">
        <img src={downloadSimple} alt="Download Simple" class="downloadsimple">
        <div class="download-pdf"><span class="downloadpdf_span">Download PDF</span></div>
      </div>
      <div class="notification" style="cursor:pointer;">
        <div class="sharenetwork">
          <img src={shareIcon} alt="Share" class="vector">
        </div>
        <div><span class="shareresult_span">Share Result</span></div>
      </div>
      <button class="btn go-home" on:click={handleGoHome}>Go Home</button>
    </div>
  </div>
</div>

<style>
  .complete-outer {
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
  padding: 24px 100px 80px 100px;
    gap: 48px;
  }
  .brand-container {
    padding: 12px 12px 12px 24px;
  }
  .brand {
    height: 38px;
  }
  .card {
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 22px 26px 28px 26px;
    gap: 32px;
  }
  .header-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 48px;
    color: #23243c;
    text-align: center;
    margin: 2px 0 4px 0;
  }
  .subtitle {
    font-family: Nunito, sans-serif;
    font-size: 24px;
    color: #121212;
    text-align: center;
  }
  .metrics {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #ededed;
  }
  .metric-row {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  .metric {
    background: #f7faff;
    border: 1px solid #e6ebf3;
    border-radius: 12px;
    padding: 4px;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 16px;
  }
  .metric-head {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5c6689;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    margin-bottom: 6px;
  }
  .divider {
    color: #ededed;
    height: 1px;
    width: 100%;
  }
  .metric-value {
    font-family: Quicksand, sans-serif;
    font-weight: 500;
    font-size: 20px;
    color: #727272;
    display: flex;
    flex-direction: column;
    align-content: center;
  }
  .metric-value-time {
    font-family: Quicksand, sans-serif;
    font-weight: 500;
    font-size: 20px;
    color: #2b2d42;
  }
  .section-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    color: #000000;
    font-size: 32px;
    margin-bottom: 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .scene-card {
    height: 479px;
    background: #ffffff;
    border: 1px solid #e7ecf5;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(40, 60, 120, 0.06);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .thumb-wrap {
    height: 250px;
    background: #000;
  }
  .thumb {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-bottom: 1px solid #e7ecf5;
  }
  .scene-info {
    padding: 8px 12px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .scene-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    color: #2b2d42;
    font-size: 24px;
  }
  .scene-sub {
    font-family: Nunito, sans-serif;
    font-size: 18px;
    color: #98a0b6;
  }
  .scene-info-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .scene-info-meta {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #e7ecf5;
    padding-top: 6px;
    gap: 4px;
  }
  .scene-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #000;
    margin-bottom: 6px;
  }
  .scene-stars {
    border-top: 1px solid #e7ecf5;
    padding-top: 6px;
    color: #f5a623;
    letter-spacing: 2px;
    font-size: 30px;
  }
  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 18px;
  }
  .btn {
    height: 57px;
    width: 194px;
    padding: 0 18px;
    border-radius: 10px;
    border: 1px solid #e6ebf3;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
  }
  
  .btn.go-home {
    background: #10b981;
    color: #fff;
    width: 173px;
    height: 57px;
    font-size: 16px;
  }
  .btn.go-home:hover {
    background: #059669;
  }

  /* ---------- Responsive styles ---------- */
  @media (max-width: 1220px) {
    .card {
      width: 96vw;
    }
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 900px) {
    .complete-outer {
      padding: 24px 40px 40px 40px;
    }

    .title {
      font-size: 36px;
    }

    .section-title {
      font-size: 26px;
    }

    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .complete-outer {
      padding: 16px;
      gap: 32px;
    }

    .brand {
      height: 32px;
    }

    .card {
      width: 100%;
      padding: 18px 16px 24px 16px;
    }

    .metric-row {
      flex-direction: column;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .scene-card {
      width: 100%;
      height: auto;
    }

    .thumb-wrap,
    .thumb {
      height: 200px;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }

    .button,
    .download-pdf-btn,
    .btn,
    .btn.go-home {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .title {
      font-size: 28px;
    }

    .subtitle {
      font-size: 18px;
    }

    .section-title {
      font-size: 22px;
    }

    .scene-title {
      font-size: 20px;
    }

    .scene-sub {
      font-size: 14px;
    }
  }
 
/* Play Again Button Custom Styles */
.button {
  height: 57px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  position: relative;
  background: #438BFF;
  overflow: hidden;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
}
.arrowclockwise {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.playagain_span {
  color: white;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}
.play-again {
  text-align: center;
}
  .ellipse-1415 {
  width: 248px;
  height: 114px;
  left: -37px;
  top: 15px;
  position: absolute;
  background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 9999px;

}

  /* Download PDF Button Custom Styles */
  .download-pdf-btn {
    height: 52px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }
  .downloadsimple {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    filter: brightness(0) saturate(100%) invert(45%) sepia(100%) saturate(2000%) hue-rotate(210deg) brightness(1.1) contrast(1.2);
  }
  
  .downloadpdf_span {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }
  .download-pdf {
    text-align: center;
  }

  .notification {
    /* width: 100%;
    height: 100%; */
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 18px;
    padding-right: 24px;
    background: #F8FAFB;
    box-shadow: 0px 1px 4px rgba(141.80, 141.80, 141.80, 0.25) inset;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .sharenetwork {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .sharenetwork .vector {
    width: 15px;
    height: 17.50px;
    left: 1.87px;
    top: 1.25px;
    position: absolute;
  }

  .shareresult_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }
</style>

