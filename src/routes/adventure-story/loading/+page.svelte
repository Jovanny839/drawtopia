<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import drawtopia from "../../../assets/logo.png";
    import shieldstar from "../../../assets/ShieldStar.svg";
    import magicalwand from "../../../assets/magic-wand.gif"; 
    import magicalwand1 from "../../../assets/magic-wand1.gif"; 
    import magicalwand2 from "../../../assets/magic-wand2.gif"; 
    import shootingstar from "../../../assets/ShootingStar.svg"

    const TOTAL_TIME = 60; // 60 seconds
    let timeRemaining = TOTAL_TIME;
    let completionPercent = 0;
    let intervalId: number | null = null;
    let hasNavigated = false;

    // Determine which magical wand GIF to show based on completion percentage
    $: currentMagicalWand = completionPercent < 25 
        ? magicalwand 
        : completionPercent < 50 
        ? magicalwand1 
        : magicalwand2;

    // Navigate to final page when completion reaches 100%
    $: if (completionPercent === 100 && !hasNavigated) {
        hasNavigated = true;
        // Small delay to ensure UI updates before navigation
        setTimeout(() => {
            goto('/adventure-story/final');
        }, 500);
    }

    onMount(() => {
        intervalId = window.setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                completionPercent = ((TOTAL_TIME - timeRemaining) / TOTAL_TIME) * 100;
            } else {
                timeRemaining = 0;
                completionPercent = 100;
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        }, 1000);
    });

    onDestroy(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    });
</script>

<div class="loading-option-3-1">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopia} alt="Drawtopia Logo" class="logo-img" />
        </div>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="creating-your-story">
                <span class="creatingyourstory_span">Creating Your Story</span>
            </div>
            <div class="your-preview-will-be-ready-in-about-47-seconds">
                <span class="yourpreviewwillbereadyinabout47seconds_span_01"
                    >Your preview will be ready in about
                </span>&nbsp;<span
                    class="yourpreviewwillbereadyinabout47seconds_span_02"
                    >{timeRemaining} {timeRemaining === 1 ? 'second' : 'seconds'}</span
                >
            </div>
            <div class="tag">
                <img
                    src={shieldstar}
                    alt="Shield Star"
                    class="img-shieldstar"
                />
                <div>
                    <span class="ffreepagepreview_span"
                        >2 Free Page Preview</span
                    >
                </div>
            </div>
        </div>
        <div class="progress-bar">
            <div class="progress-bar_01">
                <div class="progress-bar_02">
                    <div class="step-1">
                        <span class="step1_span">Step 1</span>
                    </div>
                    <div class="bar"></div>
                    <div class="frame-1410103829">
                        <div class="character-upload">
                            <span class="characterupload_span"
                                >Character Upload</span
                            >
                        </div>
                    </div>
                </div>
                <div class="progress-bar_03">
                    <div class="frame-1410103829_01">
                        <div class="step-2">
                            <span class="step2_span">Step 2</span>
                        </div>
                    </div>
                    <div class="bar_01"></div>
                    <div class="character-enhancement">
                        <span class="characterenhancement_span"
                            >Character Enhancement</span
                        >
                    </div>
                </div>
                <div class="progress-bar_04">
                    <div class="step-3">
                        <span class="step3_span">Step 3</span>
                    </div>
                    <div class="bar_02"></div>
                    <div class="frame-1410103829_02">
                        <div class="format-selection">
                            <span class="formatselection_span"
                                >Format Selection</span
                            >
                        </div>
                    </div>
                </div>
                <div class="progress-bar_05">
                    <div class="step-4">
                        <span class="step4_span">Step 4</span>
                    </div>
                    <div class="bar_03"></div>
                    <div class="frame-1410103829_03">
                        <div class="configuration">
                            <span class="configuration_span">Configuration</span
                            >
                        </div>
                    </div>
                </div>
                <div class="progress-bar_06">
                    <div class="step-5">
                        <span class="step5_span">Step 5</span>
                    </div>
                    <div class="bar_04"></div>
                    <div class="frame-1410103829_04">
                        <div class="generation">
                            <span class="generation_span">Generation</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-13">
            <div class="frame-1410103853">
                <div class="frame">
                    <div class="frame-2147227347">
                        <div class="frame-2147227507">
                            <img
                                class="magic-wand_12404075-1"
                                src={currentMagicalWand}
                                alt="Magical Wand"
                            />
                            <div class="content">
                                <div class="enhancing-your-character">
                                    <span class="enhancingyourcharacter_span"
                                        >Enhancing your character…</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="frame-2147227505">
                            <div class="frame-1410103855">
                                <div class="bar_05"></div>
                                <div class="bar_06" style="width: {completionPercent}%"></div>
                            </div>
                            <div class="text-25-complete">
                                <span class="f5complete_span">{Math.round(completionPercent)}% Complete</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="frame-2147227509">
                        <div class="frame-1410104037">
                            <img src={shootingstar} alt="Shooting Star" class="img-shootingstar">
                            <div class="frame-2147227506">
                                <div class="fun-fact">
                                    <span class="funfact_span">Fun Fact</span>
                                </div>
                                <div
                                    class="your-characters-special-ability-will-help-solve-a-big-problem"
                                >
                                    <span
                                        class="yourcharactersspecialabilitywillhelpsolveabigproblem_span"
                                        >Your character's special ability will
                                        help solve a big problem</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="frame-2147227510">
                            <div class="frame-2147227508">
                                <div class="tag_01">
                                    <div>
                                        <span class="sketch_span">Sketch</span>
                                    </div>
                                </div>
                            </div>
                            <img
                                class="frame-2147227509_01"
                                src="https://placehold.co/171x218"
                                alt="no image1"
                            />
                            <img
                                class="frame-2147227510_01"
                                src="https://placehold.co/171x218"
                                alt="no image2"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="frame-13_01">
                <div class="button">
                    <div class="cancel">
                        <span class="cancel_span">Cancel</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .drawtopia {
        width: 203.32px;
        height: 38px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: radial-gradient(
            ellipse 50% 50% at 50% 50%,
            #0fe3ef 44%,
            #438bff 100%
        );
        box-shadow: 0px 0.5678421258926392px 1.703526258468628px #871fff inset;
    }

    .subtract {
        width: 28.39px;
        height: 28.39px;
        left: 121.55px;
        top: 1.82px;
        position: absolute;
        transform: rotate(4deg);
        transform-origin: top left;
        background: radial-gradient(
            ellipse 50% 50% at 50% 50%,
            #0fe3ef 44%,
            #438bff 100%
        );
        box-shadow: 0px 0.5678421854972839px 1.703526496887207px #871fff inset;
    }

    .creatingyourstory_span {
        color: #141414;
        font-size: 48px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 57.6px;
        word-wrap: break-word;
    }

    .creating-your-story {
        align-self: stretch;
        text-align: center;
    }

    .yourpreviewwillbereadyinabout47seconds_span_01 {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .yourpreviewwillbereadyinabout47seconds_span_02 {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .your-preview-will-be-ready-in-about-47-seconds {
        align-self: stretch;
        text-align: center;
    }

    .img-shieldstar {
        margin: auto;
    }

    .ffreepagepreview_span {
        color: #438bff;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }

    .step1_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-1 {
        width: 63px;
    }

    .bar {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .characterupload_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .character-upload {
        align-self: stretch;
    }

    .step2_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-2 {
        width: 63px;
    }

    .bar_01 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .characterenhancement_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .character-enhancement {
        align-self: stretch;
    }

    .step3_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-3 {
        width: 63px;
    }

    .bar_02 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .formatselection_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .format-selection {
        align-self: stretch;
    }

    .step4_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-4 {
        width: 63px;
    }

    .bar_03 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .configuration_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .configuration {
        align-self: stretch;
    }

    .step5_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-5 {
        width: 63px;
    }

    .bar_04 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .generation_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .generation {
        align-self: stretch;
    }

    .magic-wand_12404075-1 {
        width: 60px;
        height: 60px;
    }

    .enhancingyourcharacter_span {
        color: #438bff;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 33.6px;
        word-wrap: break-word;
    }

    .enhancing-your-character {
        align-self: stretch;
        text-align: center;
    }

    .bar_05 {
        align-self: stretch;
        height: 13px;
        position: relative;
        background: #eef6ff;
        border-radius: 12px;
    }

    .bar_06 {
        height: 13px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: #438bff;
        border-radius: 12px;
        transition: width 0.3s ease;
    }

    .f5complete_span {
        color: #438bff;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 21.6px;
        word-wrap: break-word;
    }

    .text-25-complete {
        align-self: stretch;
        text-align: center;
    }

    .vector_01 {
        width: 35px;
        height: 35px;
        left: 2.5px;
        top: 2.5px;
        position: absolute;
        background: #6912c5;
    }

    .funfact_span {
        color: #6912c5;
        font-size: 20px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28px;
        word-wrap: break-word;
    }

    .fun-fact {
        align-self: stretch;
    }

    .yourcharactersspecialabilitywillhelpsolveabigproblem_span {
        color: black;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .your-characters-special-ability-will-help-solve-a-big-problem {
        align-self: stretch;
    }

    .sketch_span {
        color: #141414;
        font-size: 12px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }

    .vector_02 {
        width: 32.5px;
        height: 32.5px;
        left: 4px;
        top: 4px;
        position: absolute;
        background: white;
    }

    .frame-2147227509_01 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 12px;
        border: 1px #ededed solid;
    }

    .frame-2147227510_01 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 12px;
        border: 1px #ededed solid;
    }

    .cancel_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .cancel {
        text-align: center;
    }

    .frame-1410103829 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_02 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_03 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_04 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .content {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-2147227506 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 4px;
        display: inline-flex;
    }

    .tag_01 {
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 2px;
        padding-bottom: 2px;
        left: 54px;
        top: 178px;
        position: absolute;
        background: #f8fafb;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .button {
        width: 200px;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 16px;
        padding-bottom: 16px;
        box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
        margin: auto;
    }

    .logo-img {
        width: 100%;
    }

    .shieldstar {
        width: 20px;
        height: 20px;
        position: relative;
        overflow: hidden;
    }

    .frame-1410103855 {
        align-self: stretch;
        position: relative;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .shootingstar {
        width: 40px;
        height: 40px;
        position: relative;
        overflow: hidden;
    }

    .spinnergap {
        width: 40px;
        height: 40px;
        left: 65px;
        top: 89px;
        position: absolute;
        overflow: hidden;
    }

    .progress-bar_02 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_03 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_04 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_05 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_06 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .frame-2147227507 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-13_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .navbar {
        align-self: stretch;
        height: 79px;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 24px;
        padding-right: 12px;
        border-radius: 20px;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .tag {
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        background: #eef6ff;
        border-radius: 99px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .frame-2147227505 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104037 {
        align-self: stretch;
        padding: 12px;
        background: #f5f2ff;
        border-radius: 10px;
        outline: 1px #964dff solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227508 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.25) 0%,
            rgba(0, 0, 0, 0.25) 100%
        );
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        overflow: hidden;
        border-radius: 12px;
        background-image: url(https://placehold.co/171x218);
    }

    .progress-bar_01 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        display: inline-flex;
    }

    .heading {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-2147227347 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 32px;
        display: flex;
    }

    .frame-2147227510 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .progress-bar {
        width: 1240px;
        padding: 8px;
        background: white;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .frame-2147227509 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame {
        width: 576px;
        padding: 20px;
        background: white;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 10px;
        outline: 1px #f8f8f8 solid;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 32px;
        display: flex;
    }

    .frame-1410103853 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-13 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .frame-1410103818 {
        width: 1240px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .loading-option-3-1 {
        width: 100%;
        height: 100%;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        overflow: hidden;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
        display: inline-flex;
    }
</style>
