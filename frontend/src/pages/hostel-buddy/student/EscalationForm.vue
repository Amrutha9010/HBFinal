<template>
  <div class="escalation-page">
    <Navbar_Student />
    <div class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>Escalate Issue to Higher Authority</h1>
          <p class="subtitle">Use this option only for serious issues not resolved by the warden</p>
        </div>

        <div class="form-card">
          <form @submit.prevent="submitEscalation">
            <!-- Category Field -->
            <div class="form-group">
              <label for="category">Category <span class="required">*</span></label>
              <select 
                id="category" 
                v-model="form.category" 
                class="form-control"
                required
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Harassment">Harassment</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Description Field -->
            <div class="form-group">
              <label for="description">Description <span class="required">*</span></label>
              <textarea 
                id="description" 
                v-model="form.description" 
                class="form-control"
                rows="6"
                placeholder="Please provide detailed description of the issue..."
                required
              ></textarea>
            </div>

            <!-- Upload Image Field -->
            <div class="form-group">
              <label for="image">Upload Image (Optional)</label>
              <input 
                type="file" 
                id="image" 
                @change="handleFileUpload" 
                class="form-control"
                accept="image/*"
              />
              <small class="form-text">Upload supporting evidence (max 5MB)</small>
            </div>

            <!-- Anonymous Checkbox -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.isAnonymous" />
                <span>Submit Anonymously</span>
              </label>
              <small class="form-text">Your name will not be disclosed to the higher authority</small>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button 
                type="submit" 
                class="submit-btn" 
                :disabled="isSubmitting"
              >
                <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-paper-plane"></i>
                {{ isSubmitting ? 'Submitting...' : 'Submit Escalation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import axios from 'axios';
import Navbar_Student from '@/components/Navbar_Student.vue';
import Footer from '@/components/Footer.vue';
import { API_URL } from '@/config';

export default {
  name: 'EscalationForm',
  components: {
    Navbar_Student,
    Footer
  },
  data() {
    return {
      form: {
        category: '',
        description: '',
        isAnonymous: false,
        image: null
      },
      isSubmitting: false,
      user: null
    };
  },
  mounted() {
    this.getUserData();
  },
  methods: {
    getUserData() {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size should be less than 5MB');
          event.target.value = '';
          return;
        }
        this.form.image = file;
      }
    },
    async submitEscalation() {
      // Validation
      if (!this.form.category) {
        alert('Please select a category');
        return;
      }
      if (!this.form.description.trim()) {
        alert('Please enter description');
        return;
      }

      this.isSubmitting = true;

      try {
        const formData = new FormData();
        formData.append('category', this.form.category);
        formData.append('description', this.form.description);
        formData.append('isAnonymous', this.form.isAnonymous);
        
        if (this.form.image) {
          formData.append('image', this.form.image);
        }

        // Add student details if not anonymous
        if (!this.form.isAnonymous && this.user) {
          formData.append('studentName', this.user.fullName || this.user.name || '');
          formData.append('studentId', this.user.fieldId || this.user.id || '');
        }

        const token = localStorage.getItem('token');
        
        const response = await axios.post(`${API_URL}/api/v1/escalations`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          alert('Escalation submitted successfully!');
          this.resetForm();
        } else {
          alert(response.data.message || 'Failed to submit escalation');
        }
      } catch (error) {
        console.error('Escalation error:', error);
        alert(error.response?.data?.message || 'Failed to submit escalation. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.form = {
        category: '',
        description: '',
        isAnonymous: false,
        image: null
      };
      // Reset file input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
    }
  }
};
</script>

<style scoped>
.escalation-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #1BBC9B;
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #1BBC9B;
  box-shadow: 0 0 0 3px rgba(27, 188, 155, 0.1);
}

textarea.form-control {
  resize: vertical;
}

.form-text {
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-top: 5px;
}

.checkbox-group {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-weight: 500;
  color: #333;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.submit-btn {
  background: #1BBC9B;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #16a085;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .form-card {
    padding: 20px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>