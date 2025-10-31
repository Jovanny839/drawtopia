<script>
  import x from "../assets/X.svg";
  import qrcode from "../assets/qr.png";
  import download from "../assets/DownloadSimple.svg";
  import caretright from "../assets/CaretDown.svg";
  import video from "../assets/Video.svg";
  import trash from "../assets/Trash.svg";
</script>

<div class="modal-overlay" role="dialog" aria-modal="true">
  <div class="modal-box">
    <div class="information-helper-text">
      <div class="frame-1410103845">
        <div class="frame-1410103839">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <img src={x} alt="x" />
        </div>
        <div class="stroke"></div>
      </div>
      <div class="frame-1410103944">
        <div><span class="storyinformation_span">Story Information</span></div>
      </div>
      <img class="image-7" src={qrcode} alt="info_sotry" />
      <div class="checklist-container">
        <div class="checklist">
          <div class="frame-1410104186">
            <div class="check">
              <img src={download} alt="download" />
            </div>
            <div class="download-story">
              <span class="downloadstory_span">Download Story</span>
            </div>
          </div>
          <div class="caretright">
            <img src={caretright} alt="caretright" />
          </div>
        </div>
        <div class="checklist_01">
          <div class="frame-1410104186_01">
            <div class="check_01">
              <img src={video} alt="video" />
            </div>
            <div class="preview-record-video">
              <span class="previewrecordvideo_span">Preview Record Video</span>
            </div>
          </div>
          <div class="caretright">
            <img src={caretright} alt="caretright" />
          </div>
        </div>
        <div class="checklist_02">
          <div class="frame-1410104187">
            <div class="check_02">
              <img src={trash} alt="trash" />
            </div>
            <div class="delete-story">
              <span class="deletestory_span">Delete Story</span>
            </div>
          </div>
          <div class="caretright">
            <img src={caretright} alt="caretright" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-box {
    position: relative;
    width: 100%;
    max-width: 640px;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .storyinformation_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .image-7 {
    width: 170px;
    height: 174px;
  }

  .downloadstory_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .download-story {
    text-align: center;
  }

  .previewrecordvideo_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .preview-record-video {
    text-align: center;
  }

  .deletestory_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .delete-story {
    text-align: center;
  }

  .frame-1410103944 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
  }

  .caretright {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    transform: rotate(-90deg);
  }

  .frame-1410103839 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .check {
    padding: 7px;
    background: #438bff;
    overflow: hidden;
    border-radius: 99999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .check_01 {
    padding: 7px;
    background: #438bff;
    overflow: hidden;
    border-radius: 99999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .check_02 {
    padding: 7px;
    background: #df1c41;
    overflow: hidden;
    border-radius: 99999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104186 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104186_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104187 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .checklist {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .checklist_01 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .checklist_02 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .checklist-container {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .information-helper-text {
    width: 100%;
    padding: 16px;
    position: relative;
    background: #fdfdfd;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    max-height: 90vh;
    overflow: auto;
    display: inline-flex;
  }
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
</style>
