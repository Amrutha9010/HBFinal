<template>
  <Navbar_Student />
  <div class="room-application-container">
    <h1 class="application-title">Room Application</h1>

    <form @submit.prevent="submitApplication" class="application-form" enctype="multipart/form-data">
      <!-- Row 1 -->
      <div class="form-row">
        <div class="form-group">
          <label for="fullName">Full Name:</label>
          <input type="text" id="fullName" v-model="form.fullName" required />
        </div>

        <div class="form-group">
          <label for="rollNumber">Roll Number:</label>
          <input type="text" v-model="form.rollNumber" readonly />
        </div>
      </div>

      <!-- Row 2 -->
      <div class="form-row">
        <div class="form-group">
          <label for="branchYear">Branch / Year:</label>
          <input type="text" id="branchYear" v-model="form.branchYear" required />
        </div>

        <div class="form-group">
          <label for="gender">Gender:</label>
          <select id="gender" v-model="form.gender" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <!-- Row 3 -->
      <div class="form-row">
        <div class="form-group">
          <label for="studentPhoto">Student Photo:</label>
          <input type="file" id="studentPhoto" @change="handleFileUpload('studentPhoto', $event)" accept="image/*"
            required />
        </div>

        <div class="form-group">
          <label for="aadhaar">Aadhaar Card:</label>
          <input type="file" id="aadhaar" @change="handleFileUpload('aadhaar', $event)" accept="application/pdf,image/*"
            required />
        </div>
      </div>

      <!-- Row 4 -->
      <div class="form-row">
        <div class="form-group">
          <label for="collegeId">College ID:</label>
          <input type="file" id="collegeId" @change="handleFileUpload('collegeId', $event)"
            accept="application/pdf,image/*" required />
        </div>

        <div class="form-group">
          <label for="medicalInfo">Medical Info (optional):</label>
          <textarea id="medicalInfo" v-model="form.medicalInfo" placeholder="Allergies, conditions, etc."></textarea>
        </div>
      </div>

      <!-- Row 5 -->
      <div class="form-row">
        <div class="form-group">
          <label for="studentPhone">Student Phone:</label>
          <input type="text" id="studentPhone" v-model="form.phone" required />
        </div>

        <div class="form-group">
          <label for="parentPhone">Parent Phone:</label>
          <input type="text" id="parentPhone" v-model="form.parentPhone" required />
        </div>
      </div>

      <!-- Row 6 -->
      <div class="form-row">
        <div class="form-group full-width">
          <label for="address">Address:</label>
          <textarea id="address" v-model="form.address" required></textarea>
        </div>
      </div>

      <!-- Additional Room Preference -->
      <div class="form-row">
        <!-- <div class="form-group">
          <label for="preferredBuilding">Preferred Building:</label>
          <select id="preferredBuilding" v-model="form.preferredBuilding" required>
            <option value="">Select Building</option>
            <option value="A">Building A</option>
            <option value="B">Building B</option>
            <option value="C">Building C</option>
          </select>
        </div> -->

        <div class="form-group">
          <label for="sharing">Room Sharing Type</label>
          <select id="sharing" v-model="form.sharingType" required>
            <option value="">Select</option>
            <option value="1">1 Sharing</option>
            <option value="2">2 Sharing</option>
            <option value="3">3 Sharing</option>
            <option value="4">4 Sharing</option>
            <option value="5">5 Sharing</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ac">AC / Non-AC</label>
          <select id="ac" v-model="form.acType" required>
            <option value="">Select</option>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </select>
        </div>

        <!-- <div class="form-group">
          <label for="specialRequirements">Special Requirements:</label>
          <textarea id="specialRequirements" v-model="form.specialRequirements"></textarea>
        </div> -->
      </div>

      <!-- Terms Agreement -->
      <div class="form-row">
        <div class="form-group full-width checkbox-wrapper">
          <label class="checkbox-label">
            <input type="checkbox" id="termsAgreed" v-model="form.termsAgreed" required />
            <span>I agree to the hostel rules and regulations</span>
          </label>
        </div>
      </div>

      <!-- Submit & Back -->
      <div class="form-actions">
        <button type="submit" class="submit-btn">Submit Application</button>
      </div>
      <div class="back-nav">
        <button @click="goBack" class="back-link">
          ← Back to Dashboard
        </button>
      </div>
    </form>
  </div>
  <Footer />
</template>

<script>
import Navbar_Student from '../../../../components/Navbar_Student.vue';
import Footer from '@/components/Footer.vue';
import axios from 'axios';
import { API_URL } from "@/config";

export default {
  name: 'RoomApplication',
  components: { Navbar_Student, Footer },
  data() {
    return {
      form: {
        fullName: '',
        rollNumber: '',
        branchYear: '',
        gender: '',
        phone: '',
        parentPhone: '',
        address: '',
        medicalInfo: '',
        sharingType: '',
        acType: '',
        studentPhoto: null,
        aadhaar: null,
        collegeId: null,
        termsAgreed: false,
      },
      isSubmitting: false
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.form.rollNumber = user.fieldId; // ✅ AUTO SET
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'StudentDashboard' });
    },

    handleFileUpload(field, event) {
      this.form[field] = event.target.files[0];
    },

    async submitApplication() {
      if (!this.form.termsAgreed) {
        alert('Please agree to the hostel rules and regulations.');
        return;
      }

      // ✅ prevent multiple clicks
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      try {
        const formData = new FormData();

        formData.append('fullName', this.form.fullName);
        formData.append('rollNumber', this.form.rollNumber);
        formData.append('branchYear', this.form.branchYear);
        formData.append('gender', this.form.gender);
        formData.append('phone', this.form.phone);
        formData.append('parentPhone', this.form.parentPhone);
        formData.append('address', this.form.address);
        formData.append('medicalInfo', this.form.medicalInfo);
        formData.append('sharingType', this.form.sharingType);
        formData.append('acType', this.form.acType);

        if (this.form.studentPhoto)
          formData.append('studentPhoto', this.form.studentPhoto);

        if (this.form.aadhaar)
          formData.append('aadhaar', this.form.aadhaar);

        if (this.form.collegeId)
          formData.append('collegeId', this.form.collegeId);

        const res = await axios.post(
          `${API_URL}/api/v1/room-application`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        console.log("RESPONSE:", res.data);

        // ✅ ALWAYS SUCCESS (since backend 201)
        alert('Application submitted successfully!');
        this.$router.push({ name: 'StudentDashboard' });

      } catch (error) {
        console.error('ERROR:', error.response || error);

        // ✅ show backend message (duplicate case)
        if (error.response) {
          alert(error.response.data.message || 'Something went wrong');
        } else {
          alert('Network error. Please try again.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>



<style scoped>
.room-application-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 1000px;
}

.back-nav {
  margin-bottom: 20px;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  color: #1bbc9b;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-link:hover {
  background-color: #e6fffb;
}

.application-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 26px;
}

.application-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-row {
  display: flex;
  gap: 24px;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.form-group {
  flex: 0 0 48%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group.full-width {
  flex: 0 0 100%;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.checkbox-wrapper {
  margin-top: -10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  font-size: 15px;
  color: #444;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.submit-btn {
  background-color: #1bbc9b;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.submit-btn:hover {
  background-color: #17a689;
}
</style>