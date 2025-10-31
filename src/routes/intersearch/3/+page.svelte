<script lang="ts">
  import { goto } from '$app/navigation';
  import logo from "../../../assets/logo.png";
  // Placeholder image - replace with real cover asset
  import bookCover from "../../../assets/Luna1.png";
  import fullscreen from "../../../assets/fullscreen.svg";
  import hintIcon from "../../../assets/hinticon.svg";
  import zoomIcon from "../../../assets/zoomicon.svg";
  import coverIcon from "../../../assets/covericon.svg";
  import mailIcon from "../../../assets/mailicon.svg";
  import lockKeyIcon from "../../../assets/LockKey.svg";
  import shareIcon from "../../../assets/Share.svg";
  import menuIcon from "../../../assets/DotsThreeOutline.svg";
  let activePage = 1;
  const totalPages = 5; // adjust if needed
  type ViewMode = "one" | "two";
  let viewMode: ViewMode = "two";
  // Add timer variable for static display for now
  let timer = "06:08";
  let hintCount = 3;
  let selecting = false;
  let selectionStart = { x: 0, y: 0 };
  let selectionEnd = { x: 0, y: 0 };
  let selectionRect: SelectionRect | null = null;
  let twoPageDiv: HTMLDivElement | null = null;
  let showModal = false;
  let modalTime = "10:13";
  let modalHintsUsed = 0;

  type SelectionRect = {
    left: number;
    top: number;
    width: number;
    height: number;
  };

  function onTwoPageMouseDown(event: MouseEvent) {
    if (viewMode !== "two") return;
    const rect = twoPageDiv?.getBoundingClientRect();
    if (!rect) return;
    selecting = true;
    // Get mouse start pos relative to div
    selectionStart = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    selectionEnd = { ...selectionStart };
    selectionRect = getRect(selectionStart, selectionEnd);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }
  function onMouseMove(event: MouseEvent) {
    if (!selecting) return;
    const rect = twoPageDiv?.getBoundingClientRect();
    if (!rect) return;
    selectionEnd = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    selectionRect = getRect(selectionStart, selectionEnd);
  }
  function onMouseUp(event: MouseEvent) {
    if (!selecting) return;
    selecting = false;
    // Do not clear selectionRect; keep it until next drag
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);

    // Show modal after drag release if there was a meaningful selection
    if (
      selectionRect &&
      selectionRect.width > 10 &&
      selectionRect.height > 10
    ) {
      showModal = true;
    }
  }
  function getRect(
    start: { x: number; y: number },
    end: { x: number; y: number },
  ): SelectionRect {
    // Always top-left as min, width/height positive
    return {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }
  function onBackdropKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      showModal = false;
    }
  }

  function handleStartScene1() {
    goto('/intersearch/4');
  }

  function handleNextScene() {
    goto('/intersearch/4');
  }
</script>

<div class="preview-outer">
  <div class="preview-logo-container">
    <img class="preview-logo" src={logo} alt="Drawtopia Logo" />
  </div>
  <div class="preview-content-container">
    <div class="preview-header-area">
      <div class="preview-header-container">
        <div class="preview-header-title">
          Your Search Adventure : Where is Luna?
        </div>
        <div class="header-right">
          <div class="timer-box">{timer}</div>
        </div>
      </div>
      <div class="preview-header-note">
        FREE PREVIEW • Other pages available after purchased
      </div>
    </div>
    <div class="preview-header-actions">
      <div class="view-toggle">
        <button
          class:active={viewMode === "one"}
          on:click={() => (viewMode = "one")}>One-page view</button
        >
        <button
          class:active={viewMode === "two"}
          on:click={() => (viewMode = "two")}>Two-page view</button
        >
      </div>
    </div>
    <div class="preview-book-area">
      <div class="preview-book-container">
        {#if viewMode === "one"}
          <div class="preview-book-border single">
            <div class="preview-book-mockup">
              <img
                class="preview-book-img"
                src={bookCover}
                alt="Preview - Where Is Luna?"
                draggable={false}
                style="user-drag: none; -webkit-user-drag: none; cursor: default;"
              />
            </div>
          </div>
        {:else}
          <div class="two-page-highlight-frame">
            <div
              class="two-page"
              bind:this={twoPageDiv}
              on:mousedown={onTwoPageMouseDown}
              role="button"
              tabindex="0"
              aria-label="Two-page book area"
              style="user-select: none; position:relative;"
            >
              <div class="preview-book-border">
                <div class="preview-book-mockup">
                  <img
                    class="preview-book-img"
                    src={bookCover}
                    alt="Left page"
                    draggable={false}
                    style="user-drag: none; -webkit-user-drag: none; cursor: default;"
                  />
                </div>
              </div>
              <div class="split-divider"></div>
              <div class="preview-book-border">
                <div class="preview-book-mockup">
                  <img
                    class="preview-book-img"
                    src={bookCover}
                    alt="Right page"
                    draggable={false}
                    style="user-drag: none; -webkit-user-drag: none; cursor: default;"
                  />
                </div>
              </div>
              {#if selectionRect && selectionRect.width > 0 && selectionRect.height > 0}
                <div
                  class="selection-rectangle"
                  style="
                  left: {selectionRect.left}px;
                  top: {selectionRect.top}px;
                  width: {selectionRect.width}px;
                  height: {selectionRect.height}px;
                "
                ></div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      <div class="image-actions-bar">
        <button class="action-btn fullscreen"
          ><img src={fullscreen} alt="Fullscreen" /> Full Screen Preview</button
        >
        <button class="action-btn hint"
          ><img src={hintIcon} alt="Hint" /> Hint ({hintCount} Left)</button
        >
        <button class="action-btn zoom"
          ><img src={zoomIcon} alt="Zoom" /> Zoom</button
        >
      </div>
    </div>
    <div class="preview-footer-area">
      <button class="preview-nav-btn" disabled>{"← Previous"}</button>
      <div class="preview-dots">
        {#each Array(totalPages) as _, idx}
          {#if idx === 0}
            <span class="preview-dot active">
              <img src={coverIcon} alt="cover icon" />
            </span>
          {:else if idx == 1}
            <span class="preview-dot">
              <img src={mailIcon} alt="mail icon" />
            </span>
          {:else if idx < 4}
            <span
              class="preview-dot"
              style="color: #fff; font-size: 24px; font-weight: 600;"
            >
              {idx - 1}
            </span>
          {:else}
            <span class="preview-dot lock">
              <img src={lockKeyIcon} alt="mail icon" />
            </span>
          {/if}
        {/each}
      </div>
      <button class="preview-start-btn" on:click={handleStartScene1}>Start Scene 1</button>
    </div>
  </div>
</div>

{#if showModal}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="0"
    on:click={() => (showModal = false)}
    on:keydown={onBackdropKeydown}
  >
    <div
      class="found-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="found-title"
      tabindex="-1"
      on:keydown={onBackdropKeydown}
      on:click|stopPropagation
    >
      <div class="modal-header">
        <img class="modal-logo" src={logo} alt="Drawtopia Logo" />
        <button
          class="modal-close"
          aria-label="Close"
          on:click={() => (showModal = false)}>×</button
        >
      </div>
      <div id="found-title" class="modal-title">You Found Luna!</div>
      <div class="modal-image-frame">
        <img
          class="modal-image"
          src={bookCover}
          alt="Found character"
          draggable={false}
        />
        <div class="crosshair"></div>
      </div>
      <div class="modal-stats">
        <div class="stat"><span class="icon">🕑</span> Time : {modalTime}</div>
        <div class="stat">
          <span class="icon">💡</span> Hint Used : {modalHintsUsed}
        </div>
      </div>
      <div class="modal-stars" aria-label="Score">
        <span>⭐</span><span>⭐</span><span>⭐</span>
      </div>
      <button class="modal-primary" on:click={handleNextScene}>Next Scene</button>
    </div>
  </div>
{/if}

<style>
  .preview-outer {
    min-height: 100vh;
    width: 100%;
    padding: 24px 100px 80px 100px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 30px;
    gap: 24px;
  }
  .preview-logo-container {
    justify-content: center;
    align-items: center;
    padding: 12px 12px 12px 24px;
  }

  .preview-logo {
    height: 43px;
  }

  .preview-header-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .preview-header-area {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  .preview-content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1240px;
    height: 1130px;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding: 12px;
  }

  .preview-header-title {
    font-size: 28px;
    color: #23243c;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    text-align: left;
    margin-bottom: 0;
  }
  .preview-header-note {
    font-size: 12px;
    color: #bbbfd1;
    font-family: Nunito, sans-serif;
    margin-bottom: 17px;
    text-align: left;
  }
  .preview-header-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .view-toggle {
    background: #f1f5fb;
    border: 1px solid #e2e8f5;
    border-radius: 8px;
    padding: 2px;
    display: inline-flex;
    gap: 2px;
  }
  .view-toggle button {
    font-family: Nunito, sans-serif;
    width: 177px;
    height: 55px;
    font-size: 18px;
    color: #3b4160;
    background: transparent;
    border: 0;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
  }
  .view-toggle button.active {
    background: #2a6bf3;
    color: #fff;
    box-shadow: 0 2px 10px #2a6bf320;
  }
  .header-right-actions {
    display: flex;
    gap: 8px;
  }
  .icon-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }
  .icon-btn img {
    width: 16px;
    height: 16px;
  }
  .preview-book-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 1216px;
    height: 1078px;
    background-color: #f8fafb;
    border-radius: 12px;
    padding: 12px;
  }
  .preview-book-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1084px;
  }
  .two-page {
    display: flex;
    flex-direction: row;
    gap: 24px;
    align-items: start;
    justify-items: center;
    width: 1084px;
    height: 100%;
  }
  .preview-book-mockup {
    background: #000;
    border-radius: 19px 19px 22px 22px;
    box-shadow:
      0 4px 32px rgba(47, 70, 110, 0.16),
      0 0 0 2px #e7eaf8;
    padding: 0;
    margin-bottom: 0;
    border: 2.7px solid #e1e7f8;
    position: relative;
    z-index: 2;
  }
  .preview-book-img {
    width: 100%;
    height: 100%;
    border-radius: 18px 18px 22px 22px;
    background: white;
    object-fit: cover;
    box-shadow: none;
    -webkit-user-drag: none;
    user-drag: none;
    cursor: default;
  }
  .preview-book-base {
    width: 77%;
    height: 24px;
    margin-top: -7px;
    background: radial-gradient(ellipse at center, #0001 33%, #fff0 74%);
    border-radius: 0 0 17px 17px / 0 0 48% 48%;
    box-shadow: 0 16px 32px 0 #abb4cf26;
    z-index: 1;
  }
  .preview-book-border.single .preview-book-img {
    width: 542px;
    height: 691px;
  }
  .preview-fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 270px;
    height: 56px;
    padding: 9px 23px;
    background: #f8fafc;
    border: 1.3px solid #e6ebf3;
    font-family: Nunito, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #141414;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.18s;
  }
  .preview-fullscreen:hover {
    background: #edf4fd;
  }
  .preview-footer-area {
    height: 57px;
    width: 1216px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }
  .preview-nav-btn {
    font-family: Nunito, sans-serif;
    font-size: 13px;
    border: none;
    background: #f6f9fd;
    color: #a8a8ac;
    border-radius: 6px;
    padding: 6px 16px;
    cursor: not-allowed;
    height: 57px;
    width: 151px;
  }
  .preview-dots {
    display: flex;
    gap: 7px;
  }
  .preview-dot {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    background: #f0f0f8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 1px;
  }
  .preview-dot.active {
    background: #144BE1;
    box-shadow: 0 2px 12px #477de710;
  }
  .preview-dot.lock svg {
    margin: 0 auto;
  }
  .preview-start-btn {
    font-family: Quicksand, sans-serif;
    color: #fff;
    background: #438bff;
    font-weight: 600;
    border: none;
    border-radius: 9px;
    font-size: 15px;
    padding: 10px 28px;
    min-width: 122px;
    box-shadow: 0 1.5px 6px #438bff22;
    cursor: pointer;
    transition: background 0.18s;
    height: 57px;
    width: 159px;
  }
  .preview-start-btn:hover {
    background: #2566c9;
  }
  .timer-box {
    font-family: Quicksand, sans-serif;
    font-size: 18px;
    color: #3877cf;
    background: #edf4fd;
    border-radius: 7px;
    font-weight: 500;
    padding: 8px 20px;
    min-width: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .two-page-highlight-frame {
    border-radius: 22px;
    border: 2.5px solid #3b83f3;
    background: #fff;
    padding: 0;
    box-shadow: 0 2px 14px #407cfb14;
    margin-bottom: 0;
  }
  .split-divider {
    width: 3px;
    background: #e1e8fa;
    border-radius: 6px;
    margin: 0 0.5px;
    height: 691px;
    box-shadow: 0px 0px 11px #aacbfb60;
    z-index: 5;
  }
  .image-actions-bar {
    margin: 0 auto;
    margin-top: 18px;
    display: flex;
    gap: 18px;
    justify-content: center;
    align-items: center;
  }
  .action-btn {
    font-family: Nunito, sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #3876d2;
    background: #f7faff;
    border: 1.3px solid #e6ebf3;
    border-radius: 8px;
    padding: 10px 32px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition:
      background 0.16s,
      color 0.16s;
  }
  .action-btn.fullscreen {
    color: #000;
    font-size: 20px;
  }
  .action-btn.hint {
    background-color: #ffae00;
    color: #fff;
  }
  .action-btn.hint:hover {
    background-color: #e9a7199a;
    color: #fff;
  }
  .action-btn.zoom {
    color: #000;
  }
  .action-btn:hover {
    background: #eaefff;
    color: #235ed2;
  }
  .scene-nav-btn {
    font-family: Quicksand, sans-serif;
    font-weight: 600;
    background: #eef4ff;
    border: none;
    border-radius: 9px;
    font-size: 17px;
    color: #3e4780;
    padding: 13px 36px;
    cursor: pointer;
    min-width: 180px;
    transition:
      background 0.19s,
      color 0.16s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .scene-nav-btn[disabled] {
    color: #bfc7db !important;
    background: #f5f7ff !important;
    cursor: not-allowed;
  }
  .scene-pagers {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .pager {
    width: 37px;
    height: 37px;
    border-radius: 12px;
    background: #f5f8ff;
    color: #4264d1;
    font-weight: 600;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pager.mail {
    background: #edf2ff;
  }
  .pager.number.active {
    background: #477de7;
    color: #fff;
    box-shadow: 0 2px 12px #477de735;
  }
  .pager.number {
    background: #f5f8ff;
    color: #4264d1;
  }
  @media (max-width: 600px) {
    .preview-book-img {
      width: 96vw;
      max-width: 320px;
      height: auto;
    }
    .preview-footer-area {
      gap: 7px;
      flex-direction: column;
    }
    .preview-book-mockup {
      padding: 0;
    }
    .preview-book-base {
      height: 16px;
    }
    .preview-logo {
      margin-top: 8vw;
      height: 28px;
    }
  }
  .selection-rectangle {
    position: absolute;
    box-sizing: border-box;
    border: 2px dashed #5ea0f6;
    border-radius: 17px;
    background: rgba(94, 160, 246, 0.18);
    pointer-events: none;
    z-index: 90;
  }
  /* Modal styles */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .found-modal {
    width: 520px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(30, 50, 100, 0.2);
    padding: 18px 22px 24px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    position: relative;
  }
  .modal-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-logo {
    height: 28px;
  }
  .modal-close {
    border: none;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    color: #6b7280;
  }
  .modal-title {
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    color: #2b2d42;
    font-size: 20px;
    margin-top: 2px;
  }
  .modal-image-frame {
    width: 220px;
    height: 220px;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 6px 22px rgba(55, 100, 200, 0.15);
  }
  .modal-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    background:
      linear-gradient(#ffbb33 0 0, #ffbb33 0 0) center/2px 100%,
      linear-gradient(#ffbb33 0 0, #ffbb33 0 0) center/100% 2px;
    background-repeat: no-repeat;
    filter: drop-shadow(0 0 6px rgba(255, 187, 51, 0.8));
  }
  .modal-stats {
    display: flex;
    gap: 18px;
    color: #6b7280;
    font-family: Nunito, sans-serif;
  }
  .stat .icon {
    margin-right: 6px;
  }
  .modal-stars {
    color: #f5a623;
    font-size: 22px;
    letter-spacing: 4px;
  }
  .modal-primary {
    margin-top: 6px;
    width: 80%;
    height: 46px;
    border: none;
    border-radius: 10px;
    background: #4c7df3;
    color: #fff;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(76, 125, 243, 0.3);
  }
</style>
