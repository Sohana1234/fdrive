<script setup>
import { ref } from 'vue';
import {
  generateThumbnail,
  blobDigest,
  multipartUpload,
  SIZE_LIMIT,
} from "/assets/main.mjs";
const fileInput = ref('');
const modal = ref(null);
const state = ref(0);
const ready = ref(false);
const progressValue = ref(0);
const fileElement = ref('');
const cwd=new URL(window.location).searchParams.get("p") || "";
const cancelToken=ref(null);
const uniqueLinkCopy=ref('');
const linkCopied=ref(false);

function chooseFile() {
  fileInput.value.click();
}

function handleFileChange(event) {

  const file = event.target.files[0]
 
  if (file) {
    ready.value = true;
   fileElement.value=file.name
  }
}

function removeFile() {
  fileInput.value.value = "";
  ready.value = false;
  if (fileElement.value) {
    fileElement.value = "";
  }
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function uploadFile() {
 const file = fileInput.value.files[0];
 
  if (!file) return;
   state.value = 1;
    progressValue.value=0;
   let thumbnailDigest = null;
    if (file.type.startsWith("image/") || file.type === "video/mp4") {
	try {
     const thumbnailBlob = await generateThumbnail(file);
     const digestHex = await blobDigest(thumbnailBlob);
    
     const thumbnailUploadUrl = `/api/write/items/_$flaredrive$/thumbnails/${digestHex}.png`;
      try {
            await axios.put(thumbnailUploadUrl, thumbnailBlob);
            thumbnailDigest = digestHex;
     
          } catch (error) {
            fetch("/api/write/")
              .then((value) => {
                if (value.redirected) window.location.href = value.url;
              })
              .catch(() => {});
  
          }
	}catch(error){
        console.error(`Generate thumbnail failed`);
	}
 }
    try{
    const uniqueDir = generateUniqueId();
	uniqueLinkCopy.value=uniqueDir
  const uploadUrl = `/api/write/items/${cwd}${uniqueDir}/${file.name}`;
  const headers = {};
  cancelToken.value=axios.CancelToken.source();
    if (thumbnailDigest) headers["fd-thumbnail"] = thumbnailDigest;
    
     if (file.size >= SIZE_LIMIT) {
        await multipartUpload(`${cwd}${uniqueDir}/${file.name}`,file,{
            headers,
            onUploadProgress: (progressEvent) => {
                progressValue.value = (progressEvent.loaded * 100) / progressEvent.total;
		        if (progressValue.value === 100) {
                   setTimeout(() => {
                        state.value = 3; 
                   }, 500); 
                 }
        
           },
		   cancelToken:cancelToken.token,
         });
	 }else{
        await axios.put(uploadUrl, file, {
        headers,
      onUploadProgress: (progressEvent) => {
        progressValue.value = (progressEvent.loaded * 100) / progressEvent.total;
		if (progressValue.value === 100) {
          setTimeout(() => {
            state.value = 3; 
          }, 500); 
        }  
      },
	  cancelToken:cancelToken.token,
    });	    
	 }

    }catch(error){
       fetch("/api/write/")
          .then((value) => {
            if (value.redirected) window.location.href = value.url;
          })
          .catch(() => {});
		  state.value = 2; 
    }
  }


  function copyLink(link) {
     const url = new URL(link, window.location.origin);
      navigator.clipboard.writeText(url.toString()).then(() => {
      linkCopied.value = true;
        setTimeout(() => {
        linkCopied.value = false;
        }, 3000); 
      });     
    }

function retryUpload(){
state.value=0;
}



function cancelUpload() {
  if(cancelToken){
   cancelToken.value.cancel();
   state.value=0;
  }
}

function resetModal() {
  state.value = 0;
  progressValue.value = 0;
  ready.value = false;
  fileInput.value.value = "";
   if (fileElement.value) {
    fileElement.value= "";
  }
}
</script>

<template>
  <div ref="modal" class="modal" :data-state="state" :data-ready="ready">
    <div class="modal__header">
      <button class="modal__close-button" type="button" @click="resetModal">
        <svg class="modal__close-icon" viewBox="0 0 16 16" width="16px" height="16px" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="1,1 15,15" />
            <polyline points="15,1 1,15" />
          </g>
        </svg>
        <span class="modal__sr">Close</span>
      </button>
    </div>
    <div class="modal__body">
      <div class="modal__col">
        <!-- up -->
        <svg class="modal__icon modal__icon--blue" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
          <g fill="none" stroke="hsl(223,90%,50%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle class="modal__icon-sdo69" cx="12" cy="12" r="11" stroke-dasharray="69.12 69.12" />
            <polyline class="modal__icon-sdo14" points="7 12 12 7 17 12" stroke-dasharray="14.2 14.2" />
            <line class="modal__icon-sdo10" x1="12" y1="7" x2="12" y2="17" stroke-dasharray="10 10" />
          </g>
        </svg>
        <!-- error -->
        <svg class="modal__icon modal__icon--red" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true"  v-if="state === 2">
          <g fill="none" stroke="hsl(3,90%,50%)" stroke-width="2" stroke-linecap="round">
            <circle class="modal__icon-sdo69" cx="12" cy="12" r="11" stroke-dasharray="69.12 69.12" />
            <line class="modal__icon-sdo14" x1="7" y1="7" x2="17" y2="17" stroke-dasharray="14.2 14.2" />
            <line class="modal__icon-sdo14" x1="17" y1="7" x2="7" y2="17" stroke-dasharray="14.2 14.2" />
          </g>
        </svg>
        <!-- check -->
        <svg class="modal__icon modal__icon--green" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true" v-if="state === 3">
          <g fill="none" stroke="hsl(138,90%,50%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle class="modal__icon-sdo69" cx="12" cy="12" r="11" stroke-dasharray="69.12 69.12" />
            <polyline class="modal__icon-sdo14" points="7 12.5 10 15.5 17 8.5" stroke-dasharray="14.2 14.2" />
          </g>
        </svg>
      </div>
      <div class="modal__col">
        <div class="modal__content">
          <h2 class="modal__title">Upload a File</h2>
          <p class="modal__message">Select a file to upload from your computer or device.</p>
          <div class="modal__actions" @click="chooseFile">
            <button class="modal__button modal__button--upload" type="button">Choose File</button>
            <input ref="fileInput" type="file"  accept="*"
              multiple
              hidden  @change="handleFileChange">
          </div>
          <div class="modal__actions" v-if="state === 0 && fileElement">
            <svg class="modal__file-icon" viewBox="0 0 24 24" width="24px" height="24px">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="4 1 12 1 20 8 20 23 4 23" />
                <polyline points="12 1 12 8 20 8" />
              </g>
            </svg>
            <div class="modal__file" data-file>{{fileElement}}</div>
            <button class="modal__close-button" type="button" @click="removeFile">
              <svg class="modal__close-icon" viewBox="0 0 16 16" width="16px" height="16px" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <polyline points="4,4 12,12" />
                  <polyline points="12,4 4,12" />
                </g>
              </svg>
              <span class="modal__sr">Remove</span>
            </button>
            <button class="modal__button" type="button" @click="uploadFile">Upload</button>
          </div>
        </div>
       <div class="modal__content" v-if="state === 1">
           <h2 class="modal__title">Uploading…</h2>
           <p class="modal__message">Just give us a moment to process your file.</p>
           <div class="modal__actions">
              <div class="modal__progress">
	
                <div class="modal__progress-value" data-progress-value>{{ progressValue }}%</div>
                   <div class="modal__progress-bar">
                      <div class="modal__progress-fill"  :style="{ transform: `scaleX(${progressValue / 100})` }"></div>
                   </div>
                </div>
               <button class="modal__button" type="button" @click="cancelUpload">Cancel</button>
          </div>
    </div>
	</div>
        <div class="modal__content" v-if="state === 2">
          <h2 class="modal__title">Oops!</h2>
          <p class="modal__message">Your file could not be uploaded due to an error. Try uploading it again?</p>
          <div class="modal__actions modal__actions--center">
            <button class="modal__button" type="button" @click="retryUpload">Retry</button>
            <button class="modal__button" type="button" @click="cancelUpload">Cancel</button>
          </div>
        </div>
        <div class="modal__content" v-if="state === 3">
          <h2 class="modal__title">Upload Successful!</h2>
          <p class="modal__message">Your file has been uploaded. You can copy the link to your clipboard.</p>
          <div class="modal__actions modal__actions--center">
		     <button class="modal__button" type="button" @click="copyLink(`/raw/${uniqueLinkCopy}/${fileElement}`)">
                  <template v-if="linkCopied">
                    <svg class="modal__icon modal__icon--green" viewBox="0 0 24 24" width="16px" height="16px" aria-hidden="true">
                      <g fill="none" stroke="hsl(138, 90%, 50%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="11" />
                        <polyline points="7 12.5 10 15.5 17 8.5" />
                      </g>
                    </svg>
                    Copied
                  </template>
                  <template v-else>
                    Copy Link
                  </template>
                </button>
            <button class="modal__button" type="button" @click="resetModal">Done</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style>
:root {
	--hue: 223;
	--bg: hsl(var(--hue),10%,85%);
	--fg: hsl(var(--hue),10%,5%);
	--trans-dur: 0.3s;
	font-size: calc(16px + (20 - 16) * (100vw - 320px) / (2560 - 320));
}
.modal {
	background-color: hsl(0, 0%, 20%);
	border-radius: 1em;
	box-shadow: 0 0.75em 1em hsla(var(--hue),10%,5%,0.3);
	color: hsl(var(--hue),10%,5%);
	width: calc(100% - 3em);
	max-width: 34.5em;
	overflow: hidden;
	left:30%;
	top:11rem;
	position: relative;
	transition:
		background-color var(--trans-dur),
		color var(--trans-dur);
}
.modal:before {
	background-color: hsl(223,90%,60%);
	border-radius: 50%;
	content: "";
	filter: blur(60px);
	opacity: 0.15;
	position: absolute;
	top: -8em;
	right: -15em;
	width: 25em;
	height: 25em;
	z-index: 0;
	transition: background-color var(--trans-dur);
}
.modal__actions {
	animation-delay: 0.2s;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}
.modal__body,
.modal__header {
	position: relative;
	z-index: 1;
}
.modal__body {
	display: flex;
	flex-direction: column;
	padding: 0 2em 1.875em 1.875em;
}
.modal__button,
.modal__close-button {
	color: currentColor;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
}
.modal__button {
	background-color: #808080;
	border-radius: 0.25rem;
	font-size: 0.75em;
	padding: 0.5rem 2rem;
	transition:
		background-color var(--trans-dur),
		border-color var(--trans-dur),
		opacity var(--trans-dur);
	width: 100%;
	color:#FFFFFF;
}
.modal__button + .modal__button {
	margin-top: 0.75em;
}
.modal__button:disabled {
	opacity: 0.5;
}
.modal__button:focus,
.modal__close-button:focus {
	outline: transparent;
}
.modal__button:hover,
.modal__button:focus-visible {
	background-color: hsla(var(--hue),10%,60%,0.2);
}
.modal__button--upload {
	background-color: transparent;
	border: 0.125rem dashed hsl(0, 0%, 60%);
	flex: 1;
	padding: 0.375rem 2rem;
	color:#FFFFFF;
}
.modal__col + .modal__col {
	flex: 1;
	margin-top: 1.875em;
}
.modal__progress-value {
	color: #FFFFFF;
	transition: color var(--trans-dur);
}

.modal__close-button {
	background-color: transparent;
	display: flex;
	width: 1.5em;
	height: 1.5em;
	transition: color var(--trans-dur);
	color:#808080
}
.modal__close-button:hover,
.modal__close-button:focus-visible {
	color: hsl(var(--hue),10%,40%);
}
.modal__close-icon {
	display: block;
	margin: auto;
	pointer-events: none;
	width: 50%;
	height: auto;
}
.modal__content > * {
	/* don’t use shorthand syntax, or actions delay will be overridden */
	animation-name: fadeSlideIn;
	animation-duration: 0.5s;
	animation-timing-function: ease-in-out;
	animation-fill-mode: forwards;
	opacity: 0;
}
.modal__file {
	flex: 1;
	font-size: 0.75em;
	font-weight: 700;
	margin-right: 0.25rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.modal__file ~ .modal__button {
	margin-top: 1.5em;
}
.modal__file-icon {
	color: hsl(var(--hue),10%,50%);
	display: block;
	margin-right: 0.75em;
	width: 1.5em;
	height: 1.5em;
	transition: color var(--trans-dur);
}
.modal__header {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	height: 2.5em;
	padding: 0.5em;
}
.modal__icon {
	display: block;
	margin: auto;
	width: 2.25em;
	height: 2.25em;
}
.modal__icon--blue g {
	stroke: hsl(223,90%,50%);
}
.modal__icon--red g {
	stroke: hsl(3,90%,50%);
}
.modal__icon--green g {
	stroke: hsl(138,90%,40%);
}
.modal__icon circle,
.modal__icon line,
.modal__icon polyline {
	animation: sdo 0.25s ease-in-out forwards;
	transition: stroke var(--trans-dur);
}
.modal__icon :nth-child(2) {
	animation-delay: 0.25s;
}
.modal__icon :nth-child(3) {
	animation-delay: 0.5s;
}
.modal__icon-sdo10 {
	stroke-dashoffset: 10;
}
.modal__icon-sdo14 {
	stroke-dashoffset: 14.2;
}
.modal__icon-sdo69 {
	stroke-dashoffset: 69.12;
	transform: rotate(-90deg);
	transform-origin: 12px 12px;
}
.modal__message {
	animation-delay: 0.1s;
	font-size: 1em;
	margin-bottom: 1.5em;
	min-height: 3em;
	color:#808080;
}
.modal__progress {
	flex: 1;
}
.modal__progress + .modal__button {
	margin-top: 1.75em;
}
.modal__progress-bar {
	background-image: linear-gradient(90deg,hsl(var(--hue),90%,50%),hsl(var(--hue),90%,70%));
	border-radius:0.2em;
	overflow: hidden;
	width: 100%;
	height: 0.4em;
	transform: translate3d(0,0,0);
}
.modal__progress-fill {
	background-color: hsl(var(--hue),10%,90%);
	width: inherit;
	height: inherit;
	transition: transform 0.1s ease-in-out;
}
.modal__progress-value {
	font-size: 0.75em;
	font-weight: 700;
	line-height: 1.333;
	text-align: right;
}
.modal__sr {
	overflow: hidden;
	position: absolute;
	width: 1px;
	height: 1px;
}
.modal__title {
	font-size: 1.25em;
	font-weight: 500;
	line-height: 1.2;
	margin-bottom: 1.5rem;
	text-align: center;
	color:#FFFFFF;
}
/* state change */
[data-state="2"]:before {
	background-color: hsl(3,90%,60%);
}
[data-state="3"]:before {
	background-color: hsl(138,90%,60%);
}
.modal__icon + .modal__icon,
[data-state="1"] .modal__icon:first-child,
[data-state="2"] .modal__icon:first-child,
[data-state="3"] .modal__icon:first-child,
.modal__content + .modal__content,
[data-state="1"] .modal__content:first-child,
[data-state="2"] .modal__content:first-child,
[data-state="3"] .modal__content:first-child {
	display: none;
}
[data-state="1"] .modal__icon:first-child,
[data-state="2"] .modal__icon:nth-child(2),
[data-state="3"] .modal__icon:nth-child(3),
[data-state="1"] .modal__content:nth-child(2),
[data-state="2"] .modal__content:nth-child(3),
[data-state="3"] .modal__content:nth-child(4) {
	display: block;
}
[data-ready="false"] .modal__content:first-child .modal__actions:nth-of-type(2),
[data-ready="true"] .modal__content:first-child .modal__actions:first-of-type {
	display: none;
}
[data-ready="true"] .modal__content:first-child .modal__actions:nth-of-type(2) {
	display: flex;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
	:root {
		--bg: hsl(var(--hue),10%,35%);
		--fg: hsl(var(--hue),10%,95%);
	}
	.modal {
		background-color: hsl(var(--hue),10%,10%);
		color: hsl(var(--hue),10%,95%);
	}
	.modal__close-button,	
	.modal__progress-value {
		color: hsl(var(--hue),10%,70%);
	}
	.modal__close-button:hover,
	.modal__close-button:focus-visible {
		color: hsl(var(--hue),10%,80%);
	}
	.modal__file-icon {
		color: hsl(var(--hue),10%,60%);
	}
	.modal__icon--blue g {
		stroke: hsl(223,90%,60%);
	}
	.modal__icon--red g {
		stroke: hsl(3,90%,60%);
	}
	.modal__icon--green g {
		stroke: hsl(138,90%,60%);
	}
	.modal__progress-fill {
		background-color: hsl(var(--hue),10%,20%);
	}
}

/* Animations */
@keyframes fadeSlideIn {
	from { opacity: 0; transform: translateY(33%); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes sdo {
	to { stroke-dashoffset: 0; }
}

/* Beyond mobile */
@media (min-width: 768px) {

	.modal__actions--center {
		justify-content: center;
		margin-left: -4.125em;
	}
	.modal__body {
		flex-direction: row;
		align-items: center;
	}
	.modal__button {
		width: auto;
	}
	.modal__button + .modal__button {
		margin-top: 0;
		margin-left: 1.5rem;
	}
	.modal__file ~ .modal__button {
		margin-top: 0;
	}
	.modal__file ~ .modal__close-button {
		margin-right: 1.5rem;
	}
	.modal__progress {
		margin-right: 2em;
	}
	.modal__progress + .modal__button {
		margin-top: 0;
	}
	.modal__col + .modal__col {
		margin-top: 0;
		margin-left: 1.875em;
	}
	.modal__title {
		text-align: left;
	}
}
@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
  .modal{
    left: 24%;
    top: 9rem;
  }
}
@media only screen and (orientation : landscape) and (-webkit-min-device-pixel-ratio: 1) and (min-device-width : 768px) and (max-device-width : 1007px)
{
    .modal{
    left: 13%;
    
    }
  }
  @media only screen
and (min-device-width : 320px)
and (max-device-width : 480px)
{ 
    .modal{
    left: 6%;
    top: 5rem;  
    }
 }
 
</style>