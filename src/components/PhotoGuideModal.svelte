<script>
  export let onClose = () => {};
</script>

<div class="information-helper-text">
  <div class="frame-1410103944">
      <div class="warning">
          <div class="vector"></div>
      </div>
      <div><span class="photoguidelinesforbestresults_span">Photo Guidelines for Best Results</span></div>
  </div>
  <div class="checklist-container">
      <div class="checklist">
          <div class="check">
              <div class="userfocus">
                  <div class="vector_01"></div>
              </div>
          </div>
          <div class="checklist-text"><span class="checklist-span">Only one person should be visible.</span></div>
      </div>
      <div class="checklist">
          <div class="check">
              <div class="camera">
                  <div class="vector_02"></div>
              </div>
          </div>
          <div class="checklist-text"><span class="checklist-span">Use a clear, high-quality photo.</span></div>
      </div>
      <div class="checklist">
          <div class="check">
              <div class="scansmiley">
                  <div class="vector_03"></div>
              </div>
          </div>
          <div class="checklist-text"><span class="checklist-span">Face the camera directly.</span></div>
      </div>
      <div class="checklist">
          <div class="check">
              <div class="personsimple">
                  <div class="vector_04"></div>
              </div>
          </div>
          <div class="checklist-text"><span class="checklist-span">Wear appropriate clothing and no bare upper bodies.</span></div>
      </div>
  </div>
  <div class="button" on:click={onClose} on:keydown={(e) => e.key === 'Enter' && onClose()} role="button" tabindex="0" style="cursor: pointer;">
      <div class="close"><span class="close_span">Close</span></div>
  </div>
</div>

<style>
.vector {
  width: 24px;
  height: 24px;
  position: absolute;
  background-image: url("../assets/Warning.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.photoguidelinesforbestresults_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.vector_01 {
  width: 20px;
  height: 20px;
  position: absolute;
  background-image: url("../assets/UserFocus.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.vector_02 {
  width: 20px;
  height: 20px;
  position: absolute;
  background-image: url("../assets/Camera.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.vector_03 {
  width: 20px;
  height: 20px;
  position: absolute;
  background-image: url("../assets/ScanSmiley.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.vector_04 {
  width: 20px;
  height: 20px;
  position: absolute;
  background-image: url("../assets/PersonSimple.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.checklist-span {
  color: #121212;
  font-size: 18px;
  font-family: Nunito;
  font-weight: 400;
  line-height: 25.20px;
  word-wrap: break-word;
}

.checklist-text {
  text-align: center;
}

.close_span {
  color: #438BFF;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.20px;
  word-wrap: break-word;
}

.close {
  text-align: center;
}

.button {
  align-self: stretch;
  height: 57px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-radius: 20px;
  outline: 1px #438BFF solid;
  outline-offset: -1px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  display: inline-flex;
}

.warning {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
}

.userfocus {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.camera {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.scansmiley {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.personsimple {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.frame-1410103944 {
  align-self: stretch;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: inline-flex;
}

.check {
  padding: 7px;
  background: #438BFF;
  overflow: hidden;
  border-radius: 99999px;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  display: flex;
}

.checklist {
  align-self: stretch;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 12px;
  padding-right: 16px;
  background: #EEF6FF;
  border-radius: 12px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
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
  height: 100%;
  padding: 16px;
  left: 0px;
  top: 0px;
  position: absolute;
  background: #FDFDFD;
  border-radius: 12px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  display: inline-flex;
}
</style>