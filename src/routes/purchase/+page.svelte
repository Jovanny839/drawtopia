<script>
  import Navbar from "../../components/Navbar.svelte";
  import eye from "../../assets/eye.svg";
  import arrowleft from "../../assets/ArrowLeft.svg";
  import purplecheck from "../../assets/purple-check.svg";
  import MobileBackBtn from "../../components/MobileBackBtn.svelte";

  const handleBack = () => {
    // Navigate back in browser history
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };
</script>

<div class="purchase-option-screen-preview">
  <Navbar />
  
  <!-- Mobile Back Button -->
  <div class="mobile-back-button">
    <div class="mobile-back-btn" role="button" tabindex="0" 
         on:click={handleBack} 
         on:keydown={(e) => e.key === 'Enter' && handleBack()}>
      <img class="arrow-left-icon" src={arrowleft} alt="back" />
      
    </div>
    <span class="back-text">Back</span>
  </div>
  
  <div class="frame-1410103976">
    <div class="frame-1410103904">
      <div class="heading_01">
        <div><span class="storypreview_span">Story Preview</span></div>
      </div>
      <div class="frame-1410104091">
        <img
          class="frame-1410104089"
          src="https://placehold.co/91x90"
          alt="story preview"
        />
        <div class="frame-1410104090">
          <div class="lunas-magic-adventure">
            <span class="lunasmagicadventure_span">Luna's Magic Adventure</span>
          </div>
          <div class="frame-1410103893">
            <div><span class="adreasstory_span">Adreas Story</span></div>
            <div class="ellipse-9"></div>
            <div><span class="f025-04-05_span">2025-04-05</span></div>
          </div>
        </div>
        <div class="button">
            <img class="eye" src={eye} alt="eye" />
          <div class="view-story">
            <span class="viewstory_span">View Story</span>
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410103975">
      <div class="frame-1410103910">
        <div class="purchase-option">
          <span class="purchaseoption_span">Purchase Option</span>
        </div>
        <div class="frame-1410103961">
          <div class="frame-1410103909">
            <div class="select">
              <div class="frame-1410103837">
                <div class="ellipse-13"></div>
              </div>
              <div class="frame-1410103964">
                <div class="frame-1410103960">
                  <div class="frame-1410103908">
                    <div class="digital-book">
                      <span class="digitalbook_span">Digital Book</span>
                    </div>
                    <div class="instant-access-on-any-device">
                      <span class="instantaccessonanydevice_span"
                        >Instant access on any device</span
                      >
                    </div>
                  </div>
                  <div class="frame-1410103907">
                    <div class="text-900">
                      <span class="f00_span">$9.00</span>
                    </div>
                  </div>
                </div>
                <div class="button_01">
                  <div class="buy-digital">
                    <span class="buydigital_span">Buy Digital</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="select_01">
              <div class="frame-1410103837_01">
                <div class="frame-1410104118">
                  <img class="" src={purplecheck} alt="eye" />
                </div>
              </div>
              <div class="frame-1410103965">
                <div class="frame-1410103960_01">
                  <div class="frame-1410103908_01">
                    <div class="physical-book">
                      <span class="physicalbook_span">Physical Book</span>
                    </div>
                    <div class="high-quality-printed-handover">
                      <span class="highqualityprintedhandover_span"
                        >high Quality Printed Handover</span
                      >
                    </div>
                  </div>
                  <div class="frame-1410103907_01">
                    <div class="text-900_01">
                      <span class="f00_01_span">$9.00</span>
                    </div>
                  </div>
                </div>
                <div class="button_02">
                  <div class="buy-physical">
                    <span class="buyphysical_span">Buy physical</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="select_02">
              <div class="frame-1410103837_02">
                <div class="ellipse-13_01"></div>
              </div>
              <div class="frame-1410103966">
                <div class="frame-1410103960_02">
                  <div class="frame-1410103908_02">
                    <div class="bundle-deal">
                      <span class="bundledeal_span">Bundle Deal!</span>
                    </div>
                    <div class="get-both-digital-physical">
                      <span class="getbothdigitalphysical_span"
                        >Get Both Digital + Physical</span
                      >
                    </div>
                  </div>
                  <div class="frame-1410103907_02">
                    <div class="text-900_02">
                      <span class="f00_02_span">$9.00</span>
                    </div>
                  </div>
                </div>
                <div class="button_03">
                  <div class="buy-bundle">
                    <span class="buybundle_span">Buy Bundle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="frame-1410103912">
            <div class="physical-books-typically-ship-within-3-5-business-days">
              <span
                class="physicalbookstypicallyshipwithin3-5businessdays_span_01"
                >Physical books typically ship within</span
              ><span
                class="physicalbookstypicallyshipwithin3-5businessdays_span_02"
              >
                3-5 business days.</span
              >
            </div>
            <div class="free-shipping-on-orders-over-35">
              <span class="freeshippingonordersover35_span_01"
                >Free shipping on orders over</span
              ><span class="freeshippingonordersover35_span_02"> $35.</span>
            </div>
          </div>
        </div>
      </div>
      <div class="frame-1410103958">
        <div class="button_04">
          <div class="arrowleft">
            <img class="" src={arrowleft} alt="arrowleft" />
          </div>
          <div class="back"><span class="back_span">Back</span></div>
        </div>
        <div class="button_05">
          <div class="continue">
            <span class="continue_span">Continue</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-1410103898">
    <div class="contact-us-hellodrawtopiacom">
      <span class="contactushellodrawtopiacom_span"
        >Contact us: hello@drawtopia.com</span
      >
    </div>
    <div class="rectangle-34"></div>
    <div class="frame-1410103820">
      <div class="privacy-policy">
        <span class="privacypolicy_span">Privacy Policy</span>
      </div>
      <div class="terms-of-service">
        <span class="termsofservice_span">Terms of Service</span>
      </div>
    </div>
  </div>
</div>

<style>


  .storypreview_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .frame-1410104089 {
    width: 91px;
    height: 90px;
    position: relative;
    background: white;
    border-radius: 12px;
    border: 4px #c1c1c1 solid;
  }

  .lunasmagicadventure_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .lunas-magic-adventure {
    width: 320px;
  }

  .adreasstory_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .ellipse-9 {
    width: 8px;
    height: 8px;
    background: #666d80;
    border-radius: 9999px;
  }

  .f025-04-05_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .viewstory_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .view-story {
    text-align: center;
  }

  .purchaseoption_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .purchase-option {
    width: 530px;
  }

  .ellipse-13 {
    width: 32px;
    height: 32px;
    background: white;
    border-radius: 9999px;
  }

  .digitalbook_span {
    color: #121212;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .digital-book {
    align-self: stretch;
  }

  .instantaccessonanydevice_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .instant-access-on-any-device {
    align-self: stretch;
  }

  .f00_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-900 {
    align-self: stretch;
    text-align: right;
  }

  .buydigital_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .buy-digital {
    text-align: center;
  }

  .physicalbook_span {
    color: #121212;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .physical-book {
    align-self: stretch;
  }

  .highqualityprintedhandover_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .high-quality-printed-handover {
    width: 232px;
  }

  .f00_01_span {
    color: #6912c5;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-900_01 {
    align-self: stretch;
    text-align: right;
  }

  .buyphysical_span {
    color: #6912c5;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .buy-physical {
    text-align: center;
  }

  .ellipse-13_01 {
    width: 32px;
    height: 32px;
    background: white;
    border-radius: 9999px;
  }

  .bundledeal_span {
    color: #121212;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .bundle-deal {
    align-self: stretch;
  }

  .getbothdigitalphysical_span {
    color: #727272;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .get-both-digital-physical {
    width: 232px;
  }

  .f00_02_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-900_02 {
    align-self: stretch;
    text-align: right;
  }

  .buybundle_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .buy-bundle {
    text-align: center;
  }

  .physicalbookstypicallyshipwithin3-5businessdays_span_01 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .physicalbookstypicallyshipwithin3-5businessdays_span_02 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .physical-books-typically-ship-within-3-5-business-days {
    align-self: stretch;
  }

  .freeshippingonordersover35_span_01 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .freeshippingonordersover35_span_02 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .free-shipping-on-orders-over-35 {
    align-self: stretch;
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

  .contactushellodrawtopiacom_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .contact-us-hellodrawtopiacom {
    text-align: center;
  }

  .rectangle-34 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .privacypolicy_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .privacy-policy {
    text-align: center;
  }

  .termsofservice_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .terms-of-service {
    text-align: center;
  }



  .heading_01 {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103908 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103907 {
    width: 121px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .button_01 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103908_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103907_01 {
    width: 121px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .button_02 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #f5f2ff;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103908_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103907_02 {
    width: 121px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .button_03 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103912 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .button_05 {
    width: 160px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }



  .frame-1410103893 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .eye {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410103837 {
    align-self: stretch;
    height: 316px;
    padding: 12px;
    background: #e9e9e9;
    overflow: hidden;
    border-radius: 16px;
    background-image: url(https://placehold.co/381x316);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame-1410104118 {
    width: 32.5px;
    height: 32.5px;
    position: relative;
    background: linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.2) 100%
      ),
      white;
    border-radius: 9999px;
  }

  .frame-1410103837_02 {
    align-self: stretch;
    height: 316px;
    padding: 12px;
    overflow: hidden;
    border-radius: 16px;
    background-image: url(https://placehold.co/381x316);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }



  .frame-1410103960 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103960_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103960_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103898 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104090 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .button {
    height: 57px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103837_01 {
    align-self: stretch;
    height: 316px;
    padding: 12px;
    background: #e9e9e9;
    overflow: hidden;
    border-radius: 16px;
    outline: 1px #6912c5 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/381x316);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .button_04 {
    width: 174px;
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



  .frame-1410103964 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103965 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103966 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104091 {
    align-self: stretch;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103958 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }



  .select {
    flex: 1 1 0;
    padding: 12px;
    border-radius: 16px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .select_01 {
    flex: 1 1 0;
    padding: 12px;
    box-shadow: 0px 1px 8px #871fff;
    border-radius: 16px;
    outline: 2px #6912c5 solid;
    outline-offset: -2px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .select_02 {
    flex: 1 1 0;
    padding: 12px;
    border-radius: 16px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103904 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103909 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103961 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103910 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103975 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 48px;
    display: flex;
  }

  .frame-1410103976 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .purchase-option-screen-preview {
    width: 100%;
    height: 100%;
    padding-left: 100px;
    padding-right: 100px;
    padding-top: 24px;
    padding-bottom: 24px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 53px;
    display: inline-flex;
  }

  /* Mobile Back Button Styles */
  .mobile-back-button {
    display: none;
  }

  .mobile-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px;
    background: white;
    border-radius: 8px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: fit-content;
  }

  .mobile-back-btn:hover {
    background-color: #f8fafb;
  }

  .arrow-left-icon {
    width: 20px;
    height: 20px;
  }

  .back-text {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .mobile-back-button {
      display: flex;
      width: 100%;
      margin-bottom: 16px;
      align-items: center;
      gap: 10px;
    }

    .purchase-option-screen-preview {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 16px;
      padding-bottom: 16px;
      gap: 24px;
    }

    .frame-1410103976 {
      gap: 16px;
    }

    .frame-1410103975 {
      gap: 24px;
    }

    .frame-1410104091 {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
    }

    .frame-1410104090 {
      width: 100%;
    }

    .lunas-magic-adventure {
      width: 100%;
    }

    .button {
      width: 100%;
      height: auto;
      padding: 12px 16px;
    }

    .frame-1410103909 {
      flex-direction: column;
      gap: 16px;
    }

    .select,
    .select_01,
    .select_02 {
      width: 100%;
    }

    .frame-1410103837,
    .frame-1410103837_01,
    .frame-1410103837_02 {
      height: 200px;
    }

    .purchase-option {
      width: 100%;
    }

    .frame-1410103958 {
      flex-direction: column;
      gap: 16px;
    }

    .button_04,
    .button_05 {
      width: 100%;
    }

    .storypreview_span {
      font-size: 20px;
      line-height: 28px;
      text-align: center;
    }

    .purchaseoption_span {
      font-size: 20px;
      line-height: 28px;
    }

    .lunasmagicadventure_span {
      font-size: 20px;
      line-height: 28px;
    }

    .digitalbook_span,
    .physicalbook_span,
    .bundledeal_span {
      font-size: 20px;
      line-height: 28px;
    }

    .f00_span,
    .f00_01_span,
    .f00_02_span {
      font-size: 20px;
      line-height: 28px;
    }

    .instantaccessonanydevice_span,
    .highqualityprintedhandover_span,
    .getbothdigitalphysical_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .high-quality-printed-handover,
    .get-both-digital-physical {
      width: 100%;
    }

    .viewstory_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .buydigital_span,
    .buyphysical_span,
    .buybundle_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .back_span,
    .continue_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .physicalbookstypicallyshipwithin3-5businessdays_span_01,
    .physicalbookstypicallyshipwithin3-5businessdays_span_02,
    .freeshippingonordersover35_span_01,
    .freeshippingonordersover35_span_02 {
      font-size: 16px;
      line-height: 22.4px;
    }

    .contactushellodrawtopiacom_span,
    .privacypolicy_span,
    .termsofservice_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame-1410103820 {
      flex-direction: column;
      gap: 16px;
    }

    .frame-1410103898 {
      gap: 16px;
      padding: 16px;
    }

    .adreasstory_span,
    .f025-04-05_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame-1410104089 {
      width: 80px;
      height: 80px;
    }

    .frame-1410103893 {
      flex-wrap: wrap;
    }
    .button_04 {
      display: none;
    }
  }
</style>
