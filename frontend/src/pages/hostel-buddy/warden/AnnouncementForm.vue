<template>
  <Navbar_warden/>
  <div class="dashboard">
    <h1>Announcement Dashboard</h1>

    <!--CREATE + RIGHT SIDE -->
    <div class="top-section">
      
      <!-- CREATE ANNOUNCEMENT BOX -->
      <div class="create-announcement">
        <h2>{{ editingId ? "Edit Announcement" : "Create Announcement" }}</h2>

        <label>Title</label>
        <input v-model="title" placeholder="e.g., Important Notice: Water Supply" />

        <label>Description</label>
        <textarea v-model="description" placeholder="Provide detailed information about the announcement..."></textarea>

        <label>Type</label>
        <div class="audience-buttons">
          <button
            v-for="t in ['announcement', 'event', 'notice']"
            :key="t"
            :class="{ active: type === t }"
            @click="type = t"
          >
            {{ t }}
          </button>
        </div>

        <!--Schedule Later -->
        <div class="schedule-section">
          <label>Schedule for later</label>
          <div class="schedule-toggle">
            <label class="toggle-switch">
              <input type="checkbox" v-model="scheduleLater" />
              <span class="slider round"></span>
            </label>
            <input 
              v-if="scheduleLater" 
              type="datetime-local" 
              v-model="scheduleDate"
              class="datetime-picker"
            />
          </div>
        </div>

        <div class="action-buttons">
          <button @click="resetForm" class="clear">Clear</button>
          <button class="post" @click="postAnnouncement">{{ editingId ? "Update" : "Post Now" }}</button>
        </div>
      </div>

      <!-- RIGHT SIDE: If scheduled announcements exist show them, else show image -->
      <div class="right-side">
        <div v-if="scheduledAnnouncements.length > 0" class="scheduled-announcements">
          <h2>⏳ Scheduled Announcements</h2>
          <div v-for="ann in scheduledAnnouncements" :key="ann._id" class="scheduled-card">
            <h3>{{ ann.title }}</h3>
            <p>{{ ann.message }}</p>
            <small>Scheduled for: {{ formatDate(ann.scheduleDate) }}</small>
          </div>
        </div>
        <div v-else class="preview-image">
          <img 
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1470&q=80" 
            alt="Announcement Preview" 
          />
        </div>
      </div>
    </div>

    <!-- PAST ANNOUNCEMENTS -->
    <div class="past-section">
      <h2>📢 Active Announcements</h2>
      <div v-if="visibleAnnouncements.length === 0">No active announcements.</div>
      
      <div class="announcements-grid">
        <div 
          v-for="ann in limitedAnnouncements" 
          :key="ann._id" 
          class="announcement-card"
        >
          <h3>{{ ann.title }}</h3>
          <small>{{ timeAgo(ann.createdAt) }}</small>
          <p class="card-message">{{ ann.message }}</p>
          <div class="audience-tag">{{ ann.type }}</div>

          <div class="posted-time">
            <span v-if="ann.scheduleDate">⏳ Scheduled for {{ formatDate(ann.scheduleDate) }}</span>
          </div>

          <!-- EDIT & DELETE OPTIONS -->
          <div class="card-actions">
            <button class="edit-btn" @click="editAnnouncement(ann)">✏ Edit</button>
            <button class="delete-btn" @click="deleteAnnouncement(ann._id)">🗑 Delete</button>
          </div>
        </div>
      </div>

      <!-- Show More / Show Less Button -->
      <div v-if="visibleAnnouncements.length > 8" class="show-more-wrapper">
        <button @click="toggleShowAll" class="show-more-btn">
          {{ showAll ? 'Show Less' : 'Show More' }}
        </button>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Navbar_warden from '@/components/Navbar_warden.vue'
import Footer from '../../../components/Footer.vue'
import { API_URL } from "@/config";

/* ------------------ FORM STATE ------------------ */
const title = ref('')
const description = ref('')
const type = ref('announcement')
const scheduleLater = ref(false)
const scheduleDate = ref('')
const editingId = ref(null)

/* ------------------ ANNOUNCEMENTS DATA ------------------ */
const announcements = ref([])

/* Show only announcements that are due now */
const visibleAnnouncements = computed(() => {
  const now = new Date()
  return announcements.value.filter(ann => {
    if (ann.scheduleDate && new Date(ann.scheduleDate) > now) return false
    return true
  })
})

/* Upcoming scheduled announcements only */
const scheduledAnnouncements = computed(() => {
  const now = new Date()
  return announcements.value.filter(ann => ann.scheduleDate && new Date(ann.scheduleDate) > now)
})

/* Show More / Show Less logic */
const showAll = ref(false)
const limitedAnnouncements = computed(() => {
  return showAll.value ? visibleAnnouncements.value : visibleAnnouncements.value.slice(0, 8)
})
const toggleShowAll = () => {
  showAll.value = !showAll.value
}

/* ------------------ API CALLS ------------------ */
const fetchAnnouncements = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/announcements`)
    announcements.value = res.data
  } catch (err) {
    console.error('Failed to fetch announcements', err)
  }
}

const postAnnouncement = async () => {
  if (!title.value.trim() || !description.value.trim()) {
    alert('⚠️ Title and description are required!')
    return
  }

  const newAnn = {
    title: title.value,
    message: description.value,
    type: type.value,
    createdBy: 'Warden',
    scheduleDate: scheduleLater.value ? scheduleDate.value : null
  }

  try {
    if (editingId.value) {
      await axios.put(`${API_URL}/api/announcements/${editingId.value}`, newAnn)
      alert('Announcement updated successfully!')
      editingId.value = null
    } else {
      await axios.post(`${API_URL}/api/announcements`, newAnn, {
        headers: { 'Content-Type': 'application/json' }
      })
      alert('Announcement posted successfully!')
    }

    await fetchAnnouncements()
    resetForm()
  } catch (err) {
    console.error('Failed to post announcement', err.response?.data || err.message)
    alert('Publish announcement failed!')
  }
}

const deleteAnnouncement = async (id) => {
  if (!confirm("Are you sure you want to delete this announcement?")) return
  try {
    await axios.delete(`${API_URL}/api/announcements/${id}`)
    alert('🗑 Announcement deleted')
    await fetchAnnouncements()
  } catch (err) {
    console.error('Delete failed', err)
  }
}

const editAnnouncement = (ann) => {
  title.value = ann.title
  description.value = ann.message
  type.value = ann.type
  scheduleLater.value = !!ann.scheduleDate
  scheduleDate.value = ann.scheduleDate ? ann.scheduleDate.slice(0, 16) : ''
  editingId.value = ann._id
}

/* ------------------ UTILITIES ------------------ */
const resetForm = () => {
  title.value = ''
  description.value = ''
  type.value = 'announcement'
  scheduleLater.value = false
  scheduleDate.value = ''
  editingId.value = null
}

const timeAgo = (time) => {
  const now = new Date()
  const diff = Math.floor((now - new Date(time)) / 60000)
  if (diff < 1) return 'less than a minute ago'
  if (diff === 1) return '1 minute ago'
  if (diff < 60) return `${diff} minutes ago`
  const hours = Math.floor(diff / 60)
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

/* Auto-remove expired announcements older than 30 days */
const removeOldAnnouncements = async () => {
  const THRESHOLD_DAYS = 30
  const now = new Date()
  for (let ann of announcements.value) {
    const created = new Date(ann.createdAt)
    const diffDays = (now - created) / (1000 * 60 * 60 * 24)
    if (diffDays > THRESHOLD_DAYS) {
      await axios.delete(`${API_URL}/api/announcements/${ann._id}`)
    }
  }
  await fetchAnnouncements()
}

onMounted(async () => {
  await fetchAnnouncements()
  await removeOldAnnouncements()
})
</script>





<style scoped>
.show-more-wrapper {
  text-align: center;
  margin-top: 1rem;
}

.show-more-btn {
  padding: 0.6rem 1.2rem;
  background: #1BBC9B;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.show-more-btn:hover {
  background: #18a589;
}

.dashboard {
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 2rem; /* padding from laptop edges */
}

h1 {
  font-size: 2rem;
  color: black;
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  color: #1BBC9B;
  margin-bottom: 1rem;
}

/* TOP SECTION: CREATE + RIGHT SIDE */
.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* CREATE FORM */
.create-announcement {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

input,
textarea {
  width: 100%;
  margin: 0.4rem 0 1rem;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  color: black;
}

.audience-buttons {
  display: flex;
  gap: 0.8rem;
  margin: 0.5rem 0 1rem;
}
.audience-buttons button {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #1BBC9B;
  background: white;
  color: #1BBC9B;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.audience-buttons button.active,
.audience-buttons button:hover {
  background: #1BBC9B;
  color: white;
}

/* ✅ SCHEDULE SECTION */
.schedule-section {
  margin-top: 1.5rem; 
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.audience-buttons button.active {
  background: #1BBC9B;
  color: white;
}

.schedule-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.schedule-toggle input[type='datetime-local'] {
  margin-top: 0.5rem;
  background: white;
  color: black;
}
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.toggle-label {
  color: #333;
  font-size: 0.9rem;
}


.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1BBC9B;
}

input:checked + .slider:before {
  transform: translateX(26px);
}


.datetime-picker {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  font-family: inherit;
  width: 100%;
  max-width: 300px;
}

.datetime-picker:focus {
  outline: none;
  border-color: #1BBC9B;
  box-shadow: 0 0 0 2px rgba(27, 188, 155, 0.2);
}

.action-buttons {
  margin-top: 1rem;
}
.action-buttons :hover {
  background: #1BBC9B;
  color: white;
}
button.clear {
  background: white;
  color: #1BBC9B;
  border: 1px solid #1BBC9B;
  border-radius: 8px;
  border-color: #1BBC9B;
}

button.post {
  background-color:white;
  color: #1BBC9B;
  border-radius: 8px;
  border-color: #1BBC9B;
  border: 1px solid #1BBC9B;
}


button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  margin-right: 0.5rem;
  cursor: pointer;
}
/* ✅ RIGHT SIDE IMAGE or SCHEDULED LIST */
.right-side {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.preview-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
}
.scheduled-card {
  background: #f9f9f9;
  border-left: 4px solid #1BBC9B;
  padding: 1rem;
  margin-bottom: 0.8rem;
  border-radius: 8px;
}

/* ✅ PAST ANNOUNCEMENTS */
.past-section {
  margin-top: 2rem;
}

.announcements-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* ✅ 4 per line */
  gap: 1rem;
}

.announcement-card {
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 230px; /* ✅ same height for all */
}

.card-message {
  flex-grow: 1;
}

.audience-tag {
  background: #1BBC9B;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  /* display: inline-block; */
  margin-top: 4px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}
.edit-btn {
  background: #e6f0ff;
  color: #1e90ff;
  border: 1px solid #1e90ff;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
}
.delete-btn {
  background: #ffecec;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
}
</style>