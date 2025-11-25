<script lang="ts">
  import { goto } from '$app/navigation';
  import logo from "../../../assets/logo.png";
  import timeIcon from "../../../assets/redtimeicon.svg";
  import favorblueicon from "../../../assets/favorblueicon.svg";
  import hintpurpleicon from "../../../assets/hintpurpleicon.svg";
  import cupgreenicon from "../../../assets/cupgreenicon.svg";
  import arrowclockwise from "../../../assets/WhiteArrowClockwise.svg";
  
  import magicalforest from "../../../assets/magicalforest.png";
  import enchantedcastle from "../../../assets/enchantedcastle.png";
  import crystalcave from "../../../assets/crystalcave.png";
  import rainbowmeadow from "../../../assets/rainbowmeadow.png";
  import starlightlibrary from "../../../assets/starlight.png";
  import underwaterpalace from "../../../assets/underwater.png";
  import cloudkingdom from "../../../assets/cloudkingdom.png";
  import victorycelebration from "../../../assets/victorycele.png";

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

  const scenes: Scene[] = [
    {
      id: 1,
      title: "Scene 1",
      subtitle: "The Magical Forest",
      time: "10:13",
      hints: 4,
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
    {
      id: 5,
      title: "Scene 5",
      subtitle: "The Starlight Library",
      time: "10:13",
      hints: 0,
      stars: 2,
      image: starlightlibrary
    },
    {
      id: 6,
      title: "Scene 6",
      subtitle: "The Underwater Palace",
      time: "10:13",
      hints: 0,
      stars: 3,
      image: underwaterpalace
    },
    {
      id: 7,
      title: "Scene 7",
      subtitle: "The Cloud Kingdom",
      time: "10:13",
      hints: 0,
      stars: 2,
      image: cloudkingdom
    },
    {
      id: 8,
      title: "Scene 8",
      subtitle: "The Victory Celebration",
      time: "10:13",
      hints: 0,
      stars: 3,
      image: victorycelebration
    },
  ];

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
      <div class="subtitle">You found Luna in all 8 scenes!</div>
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
        {#each scenes as s}
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
          <div class="vector"></div>
        </div>
        <div class="play-again"><span class="playagain_span">Play Again</span></div>
        <div class="ellipse-1415"></div>
      </div>
      <div class="button download-pdf-btn" style="cursor:pointer;">
        <div class="downloadsimple">
          <div class="vector downloadpdf-vector"></div>
        </div>
        <div class="download-pdf"><span class="downloadpdf_span">Download PDF</span></div>
      </div>
      <button class="btn">🔗 Share Result</button>
      <button class="btn go-home" on:click={handleGoHome}>🏠 Go Home</button>
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
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .scene-card {
    width: 298px;
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
  .btn.secondary {
    background: #236cf3;
    color: #fff;
    border-color: #e2e8f5;
    font-size: 16px;
    width: 173px;
    height: 57px;
  }
  .btn.ghost {
    background: #E7FEFF;
    color: #236cf3;
    width: 231px;
    height: 57px;
    font-size: 16px;
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

  @media (max-width: 1220px) {
    .card {
      width: 96vw;
    }
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .metrics {
      grid-template-columns: repeat(2, 1fr);
    }
  }
 
/* Play Again Button Custom Styles */
.button {
  width: 194px;
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
.vector {
  width: 19.50px;
  height: 18px;
  left: 3px;
  top: 3px;
  position: absolute;
  background: white;
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
    width: 231px;
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
  }
  .downloadpdf-vector {
    width: 18px;
    height: 18px;
    left: 3px;
    top: 2.25px;
    position: absolute;
    background: #438BFF;
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
</style>

