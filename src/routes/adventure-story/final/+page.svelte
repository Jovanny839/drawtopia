<script lang="ts">
    import { goto } from "$app/navigation";
    import drawtopialogo from "../../../assets/logo.png";
    import arrowLeft from "../../../assets/ArrowLeft.svg";
    import recordVideo from "../../../assets/record_video.png";
    import previewStory from "../../../assets/preview_story.png";
    import checkwhite from "../../../assets/WhiteCheck.svg";

    let selectedCard: "record" | "preview" | null = null;

    function handleKey(event: KeyboardEvent, key: "record" | "preview") {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectedCard = key;
        }
    }

    function handleContinue() {
        if (selectedCard === "record") {
            goto("/record");
        } else if (selectedCard === "preview") {
            goto("/preview/default");
        }
    }
</script>

<div class="record-pages-default-selected">
    <div class="navbar">
        <div class="logo-text-full">
            <img
                src={drawtopialogo}
                alt="drawtopialogo"
                class="drawtopialogo"
            />
        </div>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="heading_01">
                <div class="frame-1410103862">
                    <div class="how-would-you-like-to-experience-your-story">
                        <span class="howwouldyouliketoexperienceyourstory_span"
                            >How Would You Like to Experience Your Story?</span
                        >
                    </div>
                    <div class="pick-a-fun-way-to-enjoy-your-adventure">
                        <span class="pickafunwaytoenjoyyouradventure_span"
                            >Pick a fun way to enjoy your adventure!</span
                        >
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410104111">
            <div class="frame-1410104110">
                <div
                    class="card"
                    class:selected={selectedCard === "record"}
                    role="button"
                    tabindex="0"
                    on:click={() => (selectedCard = "record")}
                    on:keydown={(e) => handleKey(e, "record")}
                >
                    <div class="image">
                        <img
                            src={recordVideo}
                            alt="Record a Reaction Video preview"
                        />
                        {#if selectedCard === "record"}
                            <div class="frame-1410104049">
                                <img src={checkwhite} alt="selected" class="vector" />
                            </div>
                        {/if}
                    </div>
                    <div class="frame-10">
                        <div class="heading_02">
                            <div class="record-a-reaction-video">
                                <span class="recordareactionvideo_span"
                                    >Record a Reaction Video</span
                                >
                            </div>
                            <div
                                class="watch-your-childs-face-light-up-as-they-meet-talking-animals-and-travel-to-distant-worlds-and-record-the-moment-forever"
                            >
                                <span
                                    class="watchyourchildsfacelightupastheymeettalkinganimalsandtraveltodistantworldsandrecordthemomentforever_span"
                                >
                                    Watch your child's face light up as they
                                    meet talking animals and travel to distant
                                    worlds — and record the moment forever!</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="card_01"
                    class:selected={selectedCard === "preview"}
                    role="button"
                    tabindex="0"
                    on:click={() => (selectedCard = "preview")}
                    on:keydown={(e) => handleKey(e, "preview")}
                >
                    <div class="image_01">
                        <img
                            src={previewStory}
                            alt="Preview a Story"
                        />
                        {#if selectedCard === "preview"}
                            <div class="frame-1410104049">
                                <img src={checkwhite} alt="selected" class="vector" />
                            </div>
                        {/if}
                    </div>
                    <div class="frame-10_01">
                        <div class="heading_03">
                            <div class="preview-a-story">
                                <span class="previewastory_span"
                                    >Preview a Story</span
                                >
                            </div>
                            <div
                                class="step-into-a-magical-world-filled-with-friendly-creatures-hidden-treasures-and-unforgettable-adventures"
                            >
                                <span
                                    class="stepintoamagicalworldfilledwithfriendlycreatureshiddentreasuresandunforgettableadventures_span"
                                    >Step into a magical world filled with
                                    friendly creatures, hidden treasures, and
                                    unforgettable adventures.</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410103860">
            <div class="frame-1410103870">
                <div class="button">
                    <div class="arrowleft">
                        <img src={arrowLeft} alt="arrowLeft" />
                    </div>
                    <div class="back"><span class="back_span">Back</span></div>
                </div>
            </div>
            <div class="frame-1410104246" role="button" tabindex="0" on:click={handleContinue} on:keydown={(e) => e.key === "Enter" && handleContinue()}>
                <div class="continue">
                    <span class="continue_span">Continue</span>
                </div>
                <div class="ellipse-1415"></div>
            </div>
        </div>
    </div>
</div>

<style>
    .howwouldyouliketoexperienceyourstory_span {
        color: #141414;
        font-size: 48px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 57.6px;
        word-wrap: break-word;
    }

    .how-would-you-like-to-experience-your-story {
        width: 687px;
        text-align: center;
    }

    .pickafunwaytoenjoyyouradventure_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        word-wrap: break-word;
    }

    .pick-a-fun-way-to-enjoy-your-adventure {
        width: 1040px;
        text-align: center;
    }

    .image {
        align-self: stretch;
        height: 440px;
        position: relative;
        overflow: hidden;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        outline: 1px #173DB6 solid;
        outline-offset: -1px;
    }

    .image img {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }

    .recordareactionvideo_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .record-a-reaction-video {
        align-self: stretch;
    }

    .watchyourchildsfacelightupastheymeettalkinganimalsandtraveltodistantworldsandrecordthemomentforever_span {
        color: #727272;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .watch-your-childs-face-light-up-as-they-meet-talking-animals-and-travel-to-distant-worlds-and-record-the-moment-forever {
        align-self: stretch;
    }

    .image_01 {
        align-self: stretch;
        height: 440px;
        position: relative;
        overflow: hidden;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        outline: 1px #173DB6 solid;
        outline-offset: -1px;
    }

    .image_01 img {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }

    .previewastory_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .preview-a-story {
        align-self: stretch;
    }

    .stepintoamagicalworldfilledwithfriendlycreatureshiddentreasuresandunforgettableadventures_span {
        color: #727272;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .step-into-a-magical-world-filled-with-friendly-creatures-hidden-treasures-and-unforgettable-adventures {
        align-self: stretch;
    }

    .vector {
        width: 32.50px;
        height: 32.50px;
        object-fit: contain;
    }

    .frame-1410104049 {
        width: 32px;
        height: 32px;
        right: 12px;
        top: 12.63px;
        position: absolute;
        background: #173DB6;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .back_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .back {
        text-align: center;
    }

    .continue_span {
        color: white;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .continue {
        text-align: center;
    }

    .ellipse-1415 {
        width: 248px;
        height: 114px;
        left: -58px;
        top: 25px;
        position: absolute;
        background: radial-gradient(
            ellipse 42.11% 42.11% at 50% 52.94%,
            white 0%,
            rgba(255, 255, 255, 0) 100%
        );
        border-radius: 9999px;
    }

    .frame-1410103862 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .heading_02 {
        align-self: stretch;
        padding-top: 8px;
        padding-left: 8px;
        padding-right: 8px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .heading_03 {
        align-self: stretch;
        padding-top: 8px;
        padding-left: 8px;
        padding-right: 8px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .heading {
        align-self: stretch;
        padding-top: 8px;
        padding-left: 8px;
        padding-right: 8px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
        margin: auto;
    }

    .drawtopialogo {
        width: 100%;
        height: 100%;
    }

    .arrowleft {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .frame-1410104246 {
        width: 142px;
        height: 54px;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 16px;
        padding-bottom: 16px;
        position: relative;
        background: #438bff;
        overflow: hidden;
        border-radius: 12px;
        justify-content: center;
        align-items: center;
        gap: 8px;
        display: flex;
    }

    .heading_01 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-10 {
        align-self: stretch;
        padding-top: 8px;
        padding-bottom: 12px;
        padding-left: 12px;
        padding-right: 12px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame-10_01 {
        align-self: stretch;
        padding-top: 8px;
        padding-bottom: 12px;
        padding-left: 12px;
        padding-right: 12px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
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

    .button {
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
        display: flex;
    }

    .heading {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .card {
        width: 100%;
        height: 100%;
        padding-bottom: 10px;
        background: white;
        border-radius: 20px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
    }

    .card.selected {
        box-shadow: 0px 1px 8px #438BFF;
        outline: 2px #173DB6 solid;
        outline-offset: -2px;
    }

    .card_01 {
        width: 100%;
        height: 100%;
        padding-bottom: 10px;
        background: white;
        border-radius: 20px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
    }

    .card_01.selected {
        box-shadow: 0px 1px 8px #438BFF;
        outline: 2px #173DB6 solid;
        outline-offset: -2px;
    }

    .frame-1410103870 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104110 {
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410103860 {
        align-self: stretch;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .frame-1410104111 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
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

    .record-pages-default-selected {
        width: 100%;
        height: 100%;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        overflow: hidden;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 48px;
        display: inline-flex;
    }
</style>
