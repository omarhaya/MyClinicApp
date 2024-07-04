<!-- AppToolbar.vue -->
<template>

  <ion-toolbar :class="{ 'toolbar-hidden': isToolbarHidden }" class="app-toolbar">
    <ion-buttons slot="start">
      <ion-button @click="goToNewPost">
        <ion-icon name="add-outline"></ion-icon>
      </ion-button>
    </ion-buttons>

    <ion-title class="ion-text-center">app</ion-title>

    <ion-buttons slot="end">
      <ion-button @click="goToNotifications">
        <ion-icon name="heart-outline"></ion-icon>
      </ion-button>
      <ion-button @click="goToUserProfile">
        <ion-avatar>
          <ion-img :src="userAvatar" alt="User Avatar"></ion-img>
        </ion-avatar>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script>
export default {
  data() {
    return {
      userAvatar: 'path/to/user/avatar.jpg',
      isToolbarHidden: false,
      lastScrollTop: 0,

    };
  },
  mounted() {
    // Add scroll event listener
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    // Remove scroll event listener to prevent memory leaks
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      // Get the current scroll position
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Determine scroll direction
      this.isToolbarHidden = scrollTop > this.lastScrollTop && scrollTop > 50;

      // Update last scroll position
      this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    },
    goToNewPost() {
      // Implement navigation logic for new post
    },
    goToNotifications() {
      // Implement navigation logic for notifications
    },
    goToUserProfile() {
      // Implement navigation logic for user profile
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the Instagram toolbar */
.app-toolbar {
  --ion-toolbar-background: #fff;
  --ion-toolbar-border-color: #ddd;
  transition: opacity 0.3s ease-in-out; /* Add transition for opacity */
}

/* Add class for hiding the toolbar */
.toolbar-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-100%); /* Move the toolbar off-screen when hidden */
}
</style>
