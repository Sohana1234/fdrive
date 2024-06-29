<template>
  <div class="main">
   
    <UploadPopup
    ></UploadPopup> 
    </div>
</template>

<script>
import {
  generateThumbnail,
  blobDigest,
  multipartUpload,
  SIZE_LIMIT,
} from "/assets/main.mjs";
import Dialog from "./Dialog.vue";
import Menu from "./Menu.vue";
import MimeIcon from "./MimeIcon.vue";
import UploadPopup from "./UploadPopup.vue";

export default {
  data: () => ({

  }),

  computed: {
   
  },

  methods: {
   
   

    

    
    
    

    
   
   
   
   

    
    
  },

  watch: {
    cwd: {
      
      immediate: true,
    },
  },

  created() {
   
  },

  components: {
   
    UploadPopup,
  },
};
</script>

<style>


</style>