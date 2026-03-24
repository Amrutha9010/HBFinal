<template>
  <Navbar_Student />
  <div class="request-container1">
    <div class="request-container">
      <div class="cards-wrapper">
        <!-- Complaint Form - Left Side -->
        <div class="form-card">
          <h1 class="center-heading">Complaint Submission</h1>

          <div class="complaint-section">
            <div class="form-group">
              <label>Complaint Type:</label>
              <select v-model="complaintType" class="form-input">
                <option disabled value="">Select complaint type</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Furniture</option>
                <option>Cleaning</option>
                <option>Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description:</label>
              <textarea
                v-model="complaintDescription"
                placeholder="Please describe your complaint in detail..."
                rows="4"
                class="form-input"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Upload Photo (Optional):</label>
              <input type="file" @change="handleFileUpload" accept="image/*" class="form-input" />
            </div>

            <div class="submit-wrapper">
              <button @click="submitComplaint" class="submit-btn">Submit Complaint</button>
            </div>
          </div>
        </div>

        <!-- Complaint History - Right Side (No Filters) -->
        <div class="history-card">
          <h2>Complaint History</h2>

          <!-- History List - Show All Complaints -->
          <div class="history-list" v-if="complaints.length > 0">
            <div 
              class="history-item" 
              v-for="c in complaints" 
              :key="c._id"
              :class="getStatusClass(c.status)"
            >
              <div class="complaint-header">
                <span class="complaint-category">{{ c.category }}</span>
                <span :class="['status-badge', getStatusClass(c.status)]">
                  {{ formatStatus(c.status) }}
                </span>
              </div>
              <div class="complaint-description">
                {{ c.description }}
              </div>
              <div class="complaint-date">
                {{ formatDate(c.createdAt) }}
              </div>
              <div v-if="c.wardenRemark" class="warden-remark">
                <strong>Remark:</strong> {{ c.wardenRemark }}
              </div>
              <div v-if="c.image" class="complaint-image">
                <a :href="c.image" target="_blank" class="image-link">View Image</a>
              </div>
            </div>
          </div>
          <div class="empty-history" v-else>
            <p>No complaints found.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Navbar_Student from '../../../../components/Navbar_Student.vue';
import Footer from '../../../../components/Footer.vue';
import axios from 'axios';

export default {
  name: 'ComplaintSystem',
  components: { Footer, Navbar_Student },
  data() {
    return {
      complaintType: '',
      complaintDescription: '',
      uploadedPhoto: null,
      complaints: []
    };
  },
  methods: {
    handleFileUpload(event) {
      this.uploadedPhoto = event.target.files[0];
    },
    
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    formatStatus(status) {
      if (!status) return 'Pending';
      return status
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
    
    getStatusClass(status) {
      switch(status?.toLowerCase()) {
        case 'pending':
          return 'pending';
        case 'in progress':
        case 'in-progress':
          return 'in-progress';
        case 'staff assigned':
        case 'staff-assigned':
          return 'staff-assigned';
        case 'resolved':
          return 'resolved';
        case 'rejected':
          return 'rejected';
        default:
          return 'pending';
      }
    },
    
    async fetchStudentComplaints() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/v1/complaints/my', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.complaints = res.data.data || [];
        console.log('Fetched complaints:', this.complaints);
        
      } catch (err) {
        console.error('Error fetching student complaints:', err);
        this.complaints = [];
      }
    },
    
    async submitComplaint() {
      const token = localStorage.getItem('token');

      if (!this.complaintType || !this.complaintDescription) {
        alert('Please fill in all fields.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('category', this.complaintType);
        formData.append('description', this.complaintDescription);

        if (this.uploadedPhoto) {
          formData.append('image', this.uploadedPhoto);
        }

        await axios.post('http://localhost:5000/api/v1/complaints', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        alert('Complaint submitted successfully!');
        this.resetComplaintForm();
        await this.fetchStudentComplaints(); // Refresh list
        
      } catch (err) {
        console.error('Complaint submission error:', err);
        alert(err.response?.data?.message || 'Failed to submit complaint.');
      }
    },
    
    resetComplaintForm() {
      this.complaintType = '';
      this.complaintDescription = '';
      this.uploadedPhoto = null;
    }
  },
  mounted() {
    this.fetchStudentComplaints();
  }
};
</script>

<style scoped>
.request-container {
  width: 100%;
  padding: 0 20px;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.center-heading {
  color: #1BBC9B;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  border-bottom: 2px solid #1BBC9B;
  padding-bottom: 10px;
}

.cards-wrapper {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  padding: 30px;
  flex: 1;
  min-width: 300px;
}

.history-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  padding: 30px;
  flex: 1;
  min-width: 300px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.history-card h2 {
  color: #1BBC9B;
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
  border-bottom: 2px solid #1BBC9B;
  padding-bottom: 10px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.history-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border-left: 4px solid #ddd;
  transition: all 0.2s;
}

.history-item:hover {
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.history-item.pending {
  border-left-color: #f4c430;
}

.history-item.in-progress {
  border-left-color: #3498db;
}

.history-item.staff-assigned {
  border-left-color: #9b59b6;
}

.history-item.resolved {
  border-left-color: #28a745;
}

.history-item.rejected {
  border-left-color: #dc3545;
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.complaint-category {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.in-progress {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.staff-assigned {
  background: #e7e3fc;
  color: #5a3e9b;
}

.status-badge.resolved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.complaint-description {
  color: #555;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
  word-break: break-word;
}

.complaint-date {
  color: #999;
  font-size: 11px;
  margin-bottom: 6px;
}

.warden-remark {
  background: #f0f0f0;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.warden-remark strong {
  color: #333;
}

.complaint-image {
  margin-top: 8px;
}

.image-link {
  color: #1BBC9B;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
}

.image-link:hover {
  text-decoration: underline;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-style: italic;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #1BBC9B;
  outline: none;
  box-shadow: 0 0 0 2px rgba(27, 188, 155, 0.2);
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.request-container1 {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(to bottom, 
    #e0f8f6 0%, 
    #f0fdfc 30%, 
    #ffffff 50%, 
    #f0fdfc 70%, 
    #e0f8f6 100%);
  overflow-y: auto;
}

.submit-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

.submit-btn {
  background: #1BBC9B;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 200px;
}

.submit-btn:hover {
  background: #15967D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 188, 155, 0.3);
}

/* Scrollbar Styling */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #1BBC9B;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #15967D;
}

@media (max-width: 992px) {
  .cards-wrapper {
    flex-direction: column;
  }
  
  .form-card, .history-card {
    width: 100%;
  }
  
  .history-card {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .request-container1 {
    padding: 1rem;
  }
  
  .request-container {
    padding: 0 10px;
  }
  
  .form-card, .history-card {
    padding: 20px;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>