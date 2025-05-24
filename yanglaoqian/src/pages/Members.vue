<template>
  <div class="members-container">
    <chartpanel title="老人管理">
      <member-management />
    </chartpanel>
  </div>
</template>

<script setup>
import MemberManagement from '../components/MemberManagement.vue'
import chartpanel from '../components/chartpanel.vue'
</script>

<style scoped>
.members-container {
  padding: 20px;
  /* background: linear-gradient(135deg, #000000 0%, #111111 100%); */
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.members-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(30, 30, 30, 0.2) 0%, transparent 100%),
    radial-gradient(circle at 80% 70%, rgba(30, 30, 30, 0.2) 0%, transparent 100%);
  pointer-events: none;
}
</style> 