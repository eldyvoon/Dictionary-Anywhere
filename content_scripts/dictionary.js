var LANGUAGE = "en",
  TRIGGER_KEY = "none",
  IS_HISTORY_ENABLED = true,
  GOOGLE_SPEECH_URI = "https://www.google.com/speech-api/v1/synthesize";

function showMeaning(word) {
  var createdDiv,
    info = {
      word,
      top: 0,
      bottom: 0,
      left: 0,
      clientY: 0,
      height: "auto",
    };

  retrieveMeaning(info)
    .then((response) => {
      if (!response.content) {
        return noMeaningFound(createdDiv);
      }

      appendToDiv(createdDiv, response.content);
    })
    .catch((e) => {
      console.log("e", e);
    });

  createdDiv = createDiv(info);
}

function retrieveMeaning(info) {
  return browser.runtime.sendMessage({
    word: info.word,
    lang: LANGUAGE,
    time: Date.now(),
  });
}

function createDiv(info) {
  var hostDiv = document.createElement("div");

  hostDiv.className = "dictionaryDiv";
  hostDiv.style.position = "absolute";
  hostDiv.attachShadow({ mode: "open" });

  var shadow = hostDiv.shadowRoot;
  var style = document.createElement("style");
  //style.textContent = "*{ all: initial}";
  style.textContent =
    ".mwe-popups{top:-1px;font-family:'Source Sans Pro', sans-serif;border-top-right-radius: 0!important;border-top-left-radius: 0!important;background:#fff;position:absolute;z-index:110;-webkit-box-shadow:0 0 4px #858374,0 0 1px #a2a9b1;box-shadow:0 0 4px #858374,0 0 1px #a2a9b1;padding:0;font-size:14px;min-width:281px;border-radius:2px}.mwe-popups.mwe-popups-is-not-tall{width:281px}.mwe-popups .mwe-popups-container{color:#222;margin-top:-9px;padding-top:9px;text-decoration:none}.mwe-popups.mwe-popups-is-not-tall .mwe-popups-extract{min-height:40px;max-height:140px;overflow:hidden;margin-bottom:47px;padding-bottom:0}.mwe-popups .mwe-popups-extract{margin:16px;display:block;color:#222;text-decoration:none;position:relative} .mwe-popups.flipped_y:before{content:'';display:none;position:absolute;border:8px solid transparent;border-bottom:0;border-top: 8px solid #a2a9b1;bottom:-8px;left:10px;display:none}.mwe-popups.flipped_y:after{content:'';position:absolute;border:11px solid transparent;border-bottom:0;border-top:11px solid #fff;bottom:-7px;left:7px} .mwe-popups.mwe-popups-no-image-tri:before{display:none;content:'';position:absolute;border:8px solid transparent;border-top:0;border-bottom: 8px solid #a2a9b1;top:-8px;left:10px}.mwe-popups.mwe-popups-no-image-tri:after{content:'';position:absolute;border:11px solid transparent;border-top:0;border-bottom:11px solid #fff;top:-7px;left:7px;display:none} .audio{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVQ4y2P4//8/AyUYQhAH3gNxA7IAIQPmo/H3g/QA8XkgFiBkwHyoYnRQABVfj88AmGZcTuuHyjlgMwBZM7IE3NlQGhQe65EN+I8Dw8MLGgYoFpFqADK/YUAMwOsFigORatFIlYRElaRMWmaiBAMAp0n+3U0kqkAAAAAASUVORK5CYII=);background-position: center;background-repeat: no-repeat;cursor:pointer;margin-left: 8px;opacity: 0.6; background-size: 12px; width: 16px; display: inline-block;} .audio:hover {opacity: 1;}";
  shadow.appendChild(style);

  var encapsulateDiv = document.createElement("div");
  encapsulateDiv.style =
    "all: initial; text-shadow: transparent 0px 0px 0px, rgba(0,0,0,1) 0px 0px 0px !important;";
  shadow.appendChild(encapsulateDiv);

  var popupDiv = document.createElement("div");
  popupDiv.style = "border-radius: 3px; box-shadow: 0 0 4px #858374";
  encapsulateDiv.appendChild(popupDiv);

  var contentContainer = document.createElement("div");
  contentContainer.className = "mwe-popups-container";
  popupDiv.appendChild(contentContainer);

  var content = document.createElement("div");
  content.className = "mwe-popups-extract";
  content.style =
    "line-height: 1.4; margin-top: 0px; margin-bottom: 11px; max-height: none";
  contentContainer.appendChild(content);

  var heading = document.createElement("h3");
  heading.style = "margin-block-end: 0px; display:inline-block;";
  heading.textContent = "Searching";

  var meaning = document.createElement("p");
  meaning.style = "margin-top: 10px";
  meaning.textContent = "Please Wait...";

  var audio = document.createElement("div");
  audio.className = "audio";
  audio.innerHTML = "&nbsp;";
  audio.style.display = "none";

  var moreInfo = document.createElement("a");
  moreInfo.href = `https://www.google.com/search?hl=${LANGUAGE}&q=define+${info.word}`;
  moreInfo.style = "float: right; text-decoration: none;";
  moreInfo.target = "_blank";

  content.appendChild(heading);
  content.appendChild(audio);
  content.appendChild(meaning);
  content.appendChild(moreInfo);

  //attact to logos application-command-host
  //document.body.appendChild(hostDiv);

  const selectionMenuContainer = document.querySelector(
    '[class^="selection-menu-container"]'
  );

  selectionMenuContainer.style =
    "border-bottom-left-radius: 0;border-bottom-right-radius: 0;";
  selectionMenuContainer.appendChild(hostDiv);

  if (info.clientY < window.innerHeight / 2) {
    popupDiv.className =
      "mwe-popups mwe-popups-no-image-tri mwe-popups-is-not-tall";
    hostDiv.style.top = info.bottom + 74 + "px";
    if (info.height == 0) {
      hostDiv.style.top = parseInt(hostDiv.style.top) + 8 + "px";
    }
  } else {
    popupDiv.className = "mwe-popups flipped_y mwe-popups-is-not-tall";
    hostDiv.style.top = info.top - 74 - popupDiv.clientHeight + "px";

    if (info.height == 0) {
      hostDiv.style.top = parseInt(hostDiv.style.top) - 8 + "px";
    }
  }

  return {
    heading,
    meaning,
    moreInfo,
    audio,
  };
}

function getSelectionCoords(selection) {
  var oRange = selection.getRangeAt(0); //get the text range
  var oRect = oRange.getBoundingClientRect();
  return oRect;
}

function appendToDiv(createdDiv, content) {
  var hostDiv = createdDiv.heading.getRootNode().host;
  var popupDiv = createdDiv.heading.getRootNode().querySelectorAll("div")[1];

  var heightBefore = popupDiv.clientHeight;
  createdDiv.heading.textContent = content.word;
  createdDiv.meaning.textContent = content.meaning;
  createdDiv.moreInfo.textContent = "More »";

  var heightAfter = popupDiv.clientHeight;
  var difference = heightAfter - heightBefore;

  if (popupDiv.classList.contains("flipped_y")) {
    hostDiv.style.top = parseInt(hostDiv.style.top) - difference + 1 + "px";
  }

  if (content.audioSrc) {
    var sound = document.createElement("audio");
    sound.src = content.audioSrc;
    createdDiv.audio.style.display = "inline-block";
    createdDiv.audio.addEventListener("click", function () {
      sound.play();
    });
  }
}

function noMeaningFound(createdDiv) {
  createdDiv.heading.textContent = "Sorry";
  createdDiv.meaning.textContent = "No definition found.";
}

const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation && mutation.addedNodes && mutation.addedNodes.length > 0) {
      const section = document.querySelector(
        '[class^="selection-menu-container"] > [class^="section"]'
      );
      if (section.children.length === 4) {
        setTimeout(() => {
          let wordFromCanvas = document.querySelector('a[title="Take a note"]');

          if (wordFromCanvas) {
            wordFromCanvas = wordFromCanvas.attributes.href.value;

            wordFromCanvas = decodeURIComponent(wordFromCanvas.split("=")[1]);

            wordFromCanvas = JSON.parse(wordFromCanvas).anchorData.selection
              .text;

            showMeaning(wordFromCanvas);
          }
        }, 250);
      }
    }
  });
});

const node = document.querySelector(
  ".application-command-host div:nth-child(1)"
);
observer.observe(node, { childList: true, substree: true });
