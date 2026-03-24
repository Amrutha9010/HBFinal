<template>
  <Navbar_Student/>
  <div class="room-change-container">
    <h1>Room Change Request</h1>
    
    <div class="cards-wrapper">
      <!-- Left Card - Request Form -->
      <div class="form-card">
        <form @submit.prevent="submitRequest" class="request-form">
          <div class="form-group">
            <label for="student-name">Full Name *</label>
            <input 
              type="text" 
              id="student-name" 
              v-model="formData.studentName" 
              placeholder="Enter your full name" 
              required>
          </div>

          <div class="form-group">
            <label for="current-room">Current Room Number *</label>
            <input 
              type="text" 
              id="current-room" 
              v-model="formData.currentRoom" 
              placeholder="e.g. A-101 or 201" 
              required>
          </div>

          <div class="form-group">
            <label for="preferred-block">Preferred Block *</label>
            <select id="preferred-block" v-model="formData.preferredBlock" required>
              <option value="">Select Block</option>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
            </select>
          </div>

          <div class="form-group">
            <label for="preferred-room">Preferred Room Number *</label>
            <input 
              type="text" 
              id="preferred-room" 
              v-model="formData.preferredRoomNumber" 
              placeholder="e.g. 201" 
              required>
          </div>

          <div class="form-group">
            <label for="reason">Reason for Change *</label>
            <textarea 
              id="reason" 
              v-model="formData.reason" 
              rows="4" 
              placeholder="Please explain your reason for requesting a room change..."
              required
            ></textarea>
          </div>

          <div class="form-buttons">
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Submitting...' : 'Submit Request' }}
            </button>
            <button type="button" class="submit-btn view-history-btn" @click="openHistoryModal">View History</button>
          </div>
        </form>
      </div>

      <!-- History Modal -->
      <div v-if="showHistoryModal" class="modal-overlay" @click.self="closeHistoryModal">
        <div class="history-popup">
          <div class="modal-header">
            <h3>Your Room Change History</h3>
            <button class="close-btn" @click="closeHistoryModal">×</button>
          </div>
          
          <div class="modal-body">
            <div v-if="isLoadingHistory" class="loading-history">
              <p>Loading history...</p>
            </div>
            <div v-else-if="requestHistory.length === 0" class="empty-history">
              <p>No room change requests found.</p>
              <p class="empty-subtext">Your submitted requests will appear here.</p>
            </div>
            <div v-else class="history-list">
              <div
                v-for="item in requestHistory"
                :key="item._id"
                class="history-item"
                :class="getStatusClass(item.status)"
              >
                <div class="history-header">
                  <span class="history-date">{{ formatDate(item.createdAt) }}</span>
                  <span :class="['status-badge', getStatusClass(item.status)]">
                    {{ formatStatus(item.status) }}
                  </span>
                </div>
                <div class="history-details">
                  <p><strong>Name:</strong> {{ item.studentName || 'N/A' }}</p>
                  <p><strong>Current Room:</strong> {{ item.currentRoom || 'N/A' }}</p>
                  <p><strong>Preferred Block:</strong> {{ item.preferredBlock || 'N/A' }}</p>
                  <p><strong>Preferred Room:</strong> {{ item.preferredRoomNumber || 'N/A' }}</p>
                  <p><strong>Reason:</strong> {{ item.reason || 'N/A' }}</p>
                  <p v-if="item.wardenName"><strong>Processed by:</strong> {{ item.wardenName }}</p>
                  <p v-if="item.wardenComment"><strong>Warden Comment:</strong> {{ item.wardenComment }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeHistoryModal" class="close-modal-btn">Close</button>
          </div>
        </div>
      </div>

    </div> <!-- End cards-wrapper -->
  </div>
  <Footer/>
</template>

<script>
import axios from 'axios'; 
import Navbar_Student from '../../../../components/Navbar_Student.vue';
import Footer from '../../../../components/Footer.vue';

export default {
  name: 'RoomChangeRequest',
  components: {
    Navbar_Student,
    Footer
  },
  data() {
    return {
      formData: {
        studentName: '',
        currentRoom: '',
        preferredBlock: '',
        preferredRoomNumber: '',
        reason: ''
      },
      showHistoryModal: false,
      requestHistory: [],
      isLoading: false,
      isLoadingHistory: false
    };
  },
  methods: {
    getStatusClass(status) {
      if (!status) return '';
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'pending';
        case 'approved':
          return 'approved';
        case 'rejected':
          return 'rejected';
        default:
          return '';
      }
    },

    formatStatus(status) {
      if (!status) return 'Pending';
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    async openHistoryModal() {
      this.showHistoryModal = true;
      this.isLoadingHistory = true;
      await this.fetchRequestHistory();
      this.isLoadingHistory = false;
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
    },

    async submitRequest() {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        this.$router.push('/login');
        return;
      }
      
      this.isLoading = true;
      
      try {
        const { studentName, currentRoom, preferredBlock, preferredRoomNumber, reason } = this.formData;
        
        // Validate all fields
        if (!studentName || studentName.trim() === '') {
          alert('Please enter your name');
          this.isLoading = false;
          return;
        }
        
        if (!currentRoom || currentRoom.trim() === '') {
          alert('Please enter your current room number');
          this.isLoading = false;
          return;
        }
        
        if (!preferredBlock) {
          alert('Please select a preferred block');
          this.isLoading = false;
          return;
        }
        
        if (!preferredRoomNumber || preferredRoomNumber.trim() === '') {
          alert('Please enter preferred room number');
          this.isLoading = false;
          return;
        }
        
        if (!reason || reason.trim() === '') {
          alert('Please provide a reason for the room change');
          this.isLoading = false;
          return;
        }
        
        // Prepare request data with all fields
        const requestData = {
          studentName: studentName.trim(),
          currentRoom: currentRoom.trim(),
          preferredBlock: preferredBlock,
          preferredRoomNumber: preferredRoomNumber.trim(),
          reason: reason.trim()
        };
        
        console.log('Sending request to backend:', requestData);
        
        const response = await axios.post(
          'http://localhost:5000/api/v1/room-change', 
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Response from backend:', response.data);
        
        alert('Room change request submitted successfully!');
        
        // Reset form
        this.formData = { 
          studentName: '', 
          currentRoom: '', 
          preferredBlock: '', 
          preferredRoomNumber: '', 
          reason: '' 
        };
        
        // Refresh history if modal is open
        if (this.showHistoryModal) {
          await this.fetchRequestHistory();
        }
        
      } catch (error) {
        console.error('Error submitting request:', error);
        
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          
          let errorMessage = 'Error: ';
          
          if (error.response.data && error.response.data.message) {
            errorMessage += error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            errorMessage += error.response.data.error;
          } else if (error.response.status === 401) {
            errorMessage = 'Session expired. Please login again.';
            localStorage.removeItem('token');
            this.$router.push('/login');
          } else if (error.response.status === 500) {
            errorMessage = 'Server error. Please check backend logs.';
          } else {
            errorMessage += `Status ${error.response.status}`;
          }
          
          alert(errorMessage);
        } else if (error.request) {
          alert('No response from server. Please check if backend is running at http://localhost:5000');
        } else {
          alert(`Error: ${error.message}`);
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRequestHistory() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      try {
        console.log('Fetching request history...');
        const res = await axios.get('http://localhost:5000/api/v1/room-change/my-requests', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        this.requestHistory = res.data.data || res.data || [];
        console.log('Request history fetched:', this.requestHistory);
        
        if (this.requestHistory.length === 0) {
          console.log('No history found');
        }
      } catch (error) {
        console.error("Failed to fetch request history:", error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        this.requestHistory = [];
      }
    }
  },
  mounted() {
    // Load history in background when component mounts
    this.fetchRequestHistory();
  },
};
</script>

<style scoped>
.room-change-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
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
  justify-content: center;
}

.form-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 25px;
  max-width: 800px;
  margin: 0 auto;
}

.request-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #555;
  font-size: 15px;
}

input, select, textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s;
}

input:focus, select:focus, textarea:focus {
  border-color: #1BBC9B;
  outline: none;
  box-shadow: 0 0 0 2px rgba(27, 188, 155, 0.2);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.submit-btn {
  background: #1BBC9B;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 200px;
}

.submit-btn:hover:not(:disabled) {
  background: #15967D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 188, 155, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.view-history-btn {
  background-color: #1BBC9B;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.history-popup {
  background-color: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 2px solid #1BBC9B;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #1BBC9B;
  font-size: 24px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #dc3545;
  background-color: #f0f0f0;
}

.modal-body {
  padding: 20px 25px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background-color: #f9f9f9;
  border-radius: 0 0 12px 12px;
}

.close-modal-btn {
  padding: 8px 20px;
  background-color: #1BBC9B;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.close-modal-btn:hover {
  background-color: #15967D;
}

.loading-history, .empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #777;
}

.empty-history p {
  margin: 5px 0;
}

.empty-subtext {
  font-size: 12px;
  color: #999;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
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

.history-item.approved {
  border-left-color: #28a745;
}

.history-item.rejected {
  border-left-color: #dc3545;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.history-date {
  font-size: 12px;
  color: #888;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.history-details {
  font-size: 14px;
}

.history-details p {
  margin: 6px 0;
  line-height: 1.4;
}

.history-details strong {
  color: #555;
  font-weight: 600;
  min-width: 120px;
  display: inline-block;
}

@media (max-width: 768px) {
  .room-change-container {
    padding: 20px;
  }
  
  .cards-wrapper {
    flex-direction: column;
  }
  
  .form-card {
    padding: 20px;
    max-width: 100%;
  }
  
  .form-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .submit-btn {
    width: 100%;
  }
  
  .history-popup {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header h3 {
    font-size: 20px;
  }
  
  .history-details strong {
    min-width: 100px;
  }
}
</style>