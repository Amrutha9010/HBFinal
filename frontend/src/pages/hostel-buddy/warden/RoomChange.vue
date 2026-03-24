<template>
  <div>
    <Navbar_warden />
    <div class="approval-container">
      <h2 class="approval-title">Room Change Requests</h2>
      <div class="approval-cards">
        <div v-if="requests.length > 0">
          <div 
            v-for="request in requests" 
            :key="request._id" 
            class="request-card"
            :class="{
              'approved': request.status === 'Approved',
              'rejected': request.status === 'Rejected',
              'pending': request.status === 'Pending'
            }">
            <div class="request-content">
              <div class="request-details">
                <p><strong>Student Name:</strong> {{ request.studentName }}</p>
                <p><strong>Current Room:</strong> {{ request.currentRoom }}</p>
                <p><strong>Preferred Block:</strong> {{ request.preferredBlock }}</p>
                <p><strong>Preferred Room:</strong> {{ request.preferredRoomNumber }}</p>
                <p><strong>Reason:</strong> {{ request.reason }}</p>
                <p><strong>Applied on:</strong> {{ formatDate(request.createdAt) }}</p>
                <p><strong>Status:</strong> 
                  <span :class="getStatusClass(request.status)">{{ request.status }}</span>
                </p>
              </div>
              <div class="button-group">
                <template v-if="request.status === 'Pending'">
                  <button @click="updateStatus(request._id, 'Approved')" class="approve-btn">Approve</button>
                  <button @click="updateStatus(request._id, 'Rejected')" class="reject-btn">Reject</button>
                </template>
                <div v-else class="status-display">
                  Processed
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="no-requests-message">No room change requests found.</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar_warden from '@/components/Navbar_Warden.vue';
import axios from 'axios';
import Footer from '@/components/Footer.vue';

export default {
  name: 'RoomChangeApproval',
  components: { 
    Navbar_warden,
    Footer 
  },
  data() {
    return {
      requests: []
    };
  },
  async mounted() {
    await this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/v1/room-change/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.requests = res.data.data || res.data;
        console.log('Fetched requests:', this.requests);
      } catch (err) {
        console.error('Error fetching requests:', err);
        alert('Failed to fetch requests');
      }
    },

    async updateStatus(requestId, status) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:5000/api/v1/room-change/${requestId}/status`,
          { status },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        alert(`Request ${status.toLowerCase()} successfully!`);
        await this.fetchRequests(); // Refresh the list
        
      } catch (error) {
        console.error("Status update error:", error);
        alert(`Failed to ${status.toLowerCase()} request: ${error.response?.data?.message || error.message}`);
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'status-pending';
        case 'approved':
          return 'status-approved';
        case 'rejected':
          return 'status-rejected';
        default:
          return '';
      }
    }
  }
};
</script>

<style scoped>
.approval-container {
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
}

.approval-title {
  color: #00b894;
  text-align: center;
  font-size: 35px;
  margin-bottom: 2rem;
  border-bottom: 3px solid #1BBC9B;
  padding-bottom: 10px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.approval-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.request-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 750px;
  transition: 0.3s ease;
  margin-bottom: 10px;
  border-left: 4px solid #f4c430;
}

.request-card.pending {
  border-left-color: #f4c430;
}

.request-card.approved {
  border-left-color: #28a745;
}

.request-card.rejected {
  border-left-color: #dc3545;
}

.request-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.request-details {
  flex: 1;
  line-height: 2;
}

.request-details p {
  margin: 8px 0;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin-left: 20px;
}

.approve-btn,
.reject-btn {
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  width: 120px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.approve-btn {
  background-color: white;
  color: #1BBC9B;
  border: 2px solid #1BBC9B;
}

.reject-btn {
  background-color: white;
  color: #dc3545;
  border: 2px solid #dc3545;
}

.approve-btn:hover {
  background-color: #1BBC9B;
  color: white;
  transform: translateY(-2px);
}

.reject-btn:hover {
  background-color: #dc3545;
  color: white;
  transform: translateY(-2px);
}

.status-display {
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  background-color: #f8f9fa;
  color: #666;
}

.status-pending {
  color: #f4c430;
  font-weight: bold;
}

.status-approved {
  color: #28a745;
  font-weight: bold;
}

.status-rejected {
  color: #dc3545;
  font-weight: bold;
}

.no-requests-message {
  text-align: center;
  font-size: 25px;
  color: #777;
  margin-top: 4rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .approval-container {
    padding: 1rem;
  }
  
  .request-card {
    width: 100%;
  }
  
  .request-content {
    flex-direction: column;
  }
  
  .button-group {
    flex-direction: row;
    margin-left: 0;
    margin-top: 15px;
  }
}
</style>