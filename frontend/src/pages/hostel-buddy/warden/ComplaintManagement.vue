<template>
  <Navbar_warden />
  <div class="complaint-management-container">
    <div class="header">
      <h1>Complaint Management</h1>
      <div class="header-line"></div>
    </div>

    <div class="controls">
      <div class="filter-buttons">
        <button @click="setFilter('all')" :class="{ active: currentFilter === 'all' }">
          All ({{ complaints.length }})
        </button>
        <button @click="setFilter('pending')" :class="{ active: currentFilter === 'pending' }">
          Pending ({{ pendingCount }})
        </button>
        <button @click="setFilter('in-progress')" :class="{ active: currentFilter === 'in-progress' }">
          In Progress ({{ inProgressCount }})
        </button>
        <button @click="setFilter('staff-assigned')" :class="{ active: currentFilter === 'staff-assigned' }">
          Staff Assigned ({{ staffAssignedCount }})
        </button>
        <button @click="setFilter('rejected')" :class="{ active: currentFilter === 'rejected' }">
          Rejected ({{ rejectedCount }})
        </button>
        <button @click="setFilter('resolved')" :class="{ active: currentFilter === 'resolved' }">
          Resolved ({{ resolvedCount }})
        </button>
      </div>

      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search complaints..."
          class="search-input"
        />
      </div>
    </div>

    <div class="complaints-grid">
      <div
        class="complaint-card"
        v-for="complaint in sortedAndFilteredComplaints"
        :key="complaint._id"
        :class="getStatusClass(complaint.status)">
        <div class="card-header">
          <span class="complaint-id">{{ complaint._id.slice(-6).toUpperCase() }}</span>
          <span :class="['status-badge', getStatusClass(complaint.status)]">
            {{ formatStatus(complaint.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="detail-row">
            <span class="detail-label">Submitted By:</span>
            <span>
              {{ complaint.submittedBy?.fullName || complaint.studentName || complaint.submittedBy || 'N/A' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Room:</span>
            <span>{{ complaint.submittedBy?.roomNumber || complaint.currentRoom || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span>{{ complaint.category }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span>{{ formatDate(complaint.createdAt || complaint.date) }}</span>
          </div>
          <div class="detail-row description">
            <span class="detail-label">Description:</span>
            <p class="truncated-description">{{ complaint.description || 'No description provided' }}</p>
          </div>
          <div class="detail-row" v-if="complaint.imageUrl">
            <span class="detail-label">Image:</span>
            <img :src="complaint.imageUrl" alt="Complaint Image" style="max-width: 100px; border-radius: 6px;" />
          </div>
          <div class="detail-row" v-if="complaint.assignedStaff">
            <span class="detail-label">Assigned Staff:</span>
            <span>{{ getStaffName(complaint.assignedStaff) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <button @click="showDetails(complaint)" class="details-btn">Update Status</button>
        </div>
      </div>

      <div v-if="sortedAndFilteredComplaints.length === 0" class="no-results">
        No complaints found matching your criteria.
      </div>
    </div>

    <!-- Modal -->
    <div v-if="selectedComplaint" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Update Complaint Status</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span>{{ selectedComplaint._id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Student:</span>
            <span>{{ selectedComplaint.submittedBy?.fullName || selectedComplaint.studentName || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Room:</span>
            <span>{{ selectedComplaint.submittedBy?.roomNumber || selectedComplaint.currentRoom || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span>{{ selectedComplaint.category }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current Status:</span>
            <span :class="['status-badge', getStatusClass(selectedComplaint.status)]">
              {{ formatStatus(selectedComplaint.status) }}
            </span>
          </div>
          <div class="detail-row">
            <label class="detail-label">Update Status:</label>
            <select v-model="selectedStatus" class="status-select">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="staff-assigned">Staff Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="detail-row" v-if="selectedStatus === 'staff-assigned'">
            <label class="detail-label">Assign Staff:</label>
            <select v-model="selectedStaffId" class="staff-select">
              <option value="">Select Staff Member</option>
              <option v-for="staff in staffMembers" :key="staff.id" :value="staff.id">
                {{ staff.name }} ({{ staff.expertise }})
              </option>
            </select>
          </div>

          <div class="detail-row">
            <label class="detail-label">Remarks/Warden Comment:</label>
            <textarea 
              v-model="wardenRemark" 
              rows="3" 
              class="remark-input"
              placeholder="Add any remarks or comments..."
            ></textarea>
          </div>

          <div class="detail-row">
            <span class="detail-label">Description:</span>
            <p class="complaint-description">{{ selectedComplaint.description || 'No description provided' }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="updateComplaintStatus" class="modal-btn primary">Update Status</button>
          <button @click="closeModal" class="modal-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Navbar_warden from '../../../components/Navbar_warden.vue';
import Footer from '../../../components/Footer.vue';
import axios from 'axios';

export default {
  components: {
    Navbar_warden,
    Footer
  },
  data() {
    return {
      currentFilter: 'all',
      searchQuery: '',
      sortColumn: 'date',
      sortDirection: 'desc',
      selectedComplaint: null,
      selectedStatus: '',
      selectedStaffId: '',
      wardenRemark: '',
      complaints: [],
      staffMembers: [
        { id: 'ST001', name: 'Rajesh Kumar', expertise: 'Electrical' },
        { id: 'ST002', name: 'Priya Sharma', expertise: 'Plumbing' },
        { id: 'ST003', name: 'Amit Patel', expertise: 'Furniture' },
        { id: 'ST004', name: 'Neha Gupta', expertise: 'Cleaning' },
        { id: 'ST005', name: 'Vikram Joshi', expertise: 'Internet' }
      ]
    };
  },
  computed: {
    pendingCount() {
      return this.complaints.filter(c => this.normalizeStatus(c.status) === 'pending').length;
    },
    inProgressCount() {
      return this.complaints.filter(c => this.normalizeStatus(c.status) === 'in-progress').length;
    },
    staffAssignedCount() {
      return this.complaints.filter(c => this.normalizeStatus(c.status) === 'staff-assigned').length;
    },
    resolvedCount() {
      return this.complaints.filter(c => this.normalizeStatus(c.status) === 'resolved').length;
    },
    rejectedCount() {
      return this.complaints.filter(c => this.normalizeStatus(c.status) === 'rejected').length;
    },
    filteredComplaints() {
      let filtered = this.complaints;
      
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter(complaint => 
          this.normalizeStatus(complaint.status) === this.currentFilter
        );
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(complaint => {
          const studentName = complaint.submittedBy?.fullName || complaint.studentName || '';
          const category = complaint.category || '';
          const description = complaint.description || '';
          const assignedStaff = complaint.assignedStaff ? this.getStaffName(complaint.assignedStaff) : '';
          
          return studentName.toLowerCase().includes(query) ||
            complaint._id.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query) ||
            description.toLowerCase().includes(query) ||
            assignedStaff.toLowerCase().includes(query);
        });
      }
      return filtered;
    },
    sortedAndFilteredComplaints() {
      return [...this.filteredComplaints].sort((a, b) => {
        let modifier = this.sortDirection === 'desc' ? -1 : 1;
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return (dateA - dateB) * modifier;
      });
    }
  },
  watch: {
    selectedComplaint(newVal) {
      if (newVal) {
        this.selectedStatus = newVal.status || 'pending';
        this.selectedStaffId = newVal.assignedStaff || '';
        this.wardenRemark = newVal.wardenRemark || newVal.wardenComment || '';
      }
    }
  },
  methods: {
    // Normalize status for consistent comparison
    normalizeStatus(status) {
      if (!status) return 'pending';
      const normalized = status.toString().toLowerCase().trim();
      
      // Handle different status variations
      if (normalized === 'staff assigned' || normalized === 'staff-assigned') return 'staff-assigned';
      if (normalized === 'in progress' || normalized === 'in-progress') return 'in-progress';
      if (normalized === 'resolved') return 'resolved';
      if (normalized === 'rejected') return 'rejected';
      if (normalized === 'pending') return 'pending';
      
      return normalized;
    },
    
    getStatusClass(status) {
      const normalized = this.normalizeStatus(status);
      switch(normalized) {
        case 'pending':
          return 'pending';
        case 'in-progress':
          return 'in-progress';
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
    
    async fetchComplaints() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/v1/complaints/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.complaints = res.data.data || [];
        console.log('Fetched complaints:', this.complaints);
        
        // Debug: Log all unique statuses
        const uniqueStatuses = [...new Set(this.complaints.map(c => c.status))];
        console.log('Unique statuses found:', uniqueStatuses);
        
      } catch (err) {
        console.error('Failed to fetch complaints', err);
        alert('Failed to fetch complaints. Please check if backend is running.');
      }
    },
    
    setFilter(filter) {
      this.currentFilter = filter;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    formatStatus(status) {
      if (!status) return 'Pending';
      // Convert status to readable format
      return status
        .toString()
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    
    getStaffName(staffId) {
      const staff = this.staffMembers.find(s => s.id === staffId);
      return staff ? `${staff.name} (${staff.expertise})` : staffId || 'Unassigned';
    },
    
    showDetails(complaint) {
      this.selectedComplaint = complaint;
      this.selectedStatus = complaint.status || 'pending';
      this.selectedStaffId = complaint.assignedStaff || '';
      this.wardenRemark = complaint.wardenRemark || complaint.wardenComment || '';
    },
    
    closeModal() {
      this.selectedComplaint = null;
      this.selectedStatus = '';
      this.selectedStaffId = '';
      this.wardenRemark = '';
    },
    
    async updateComplaintStatus() {
      if (!this.selectedComplaint || !this.selectedStatus) {
        alert('Please select a status');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const updateData = {
          status: this.selectedStatus,
          wardenRemark: this.wardenRemark
        };
        
        // If staff assigned, include the staff ID
        if (this.selectedStatus === 'staff-assigned' && this.selectedStaffId) {
          updateData.assignedStaff = this.selectedStaffId;
        }
        
        const res = await axios.put(
          `http://localhost:5000/api/v1/complaints/${this.selectedComplaint._id}/status`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Update local state
        const index = this.complaints.findIndex(c => c._id === this.selectedComplaint._id);
        if (index !== -1) {
          this.complaints[index].status = this.selectedStatus;
          this.complaints[index].assignedStaff = this.selectedStaffId || null;
          this.complaints[index].wardenRemark = this.wardenRemark;
        }

        alert('Complaint status updated successfully!');
        this.closeModal();
        
        // Refresh complaints to get latest data
        await this.fetchComplaints();
        
      } catch (error) {
        console.error('Error updating status:', error);
        alert(error.response?.data?.message || 'Failed to update complaint status.');
      }
    }
  },
  mounted() {
    this.fetchComplaints();
  }
};
</script>

<style scoped>
.complaint-management-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  color: #1BBC9B;
  font-size: 2.8rem;
  margin-bottom: 10px;
  font-weight: 600;
  padding-bottom: 10px;
}

.header-line {
  height: 4px;
  background-color: #1BBC9B;
  width: 1250px;
  margin: 0 auto;
  border-radius: 2px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 15px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-right: 0;
}

.filter-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: white;
  color: #1BBC9B;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #1BBC9B;
  font-size: 0.95rem;
}

.filter-buttons button.active {
  background-color: #1BBC9B;
  color: white;
}

.filter-buttons button:hover {
  background-color: #17a789;
  color: white;
}

.search-box {
  position: relative;
  min-width: 250px;
  flex-grow: 1;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #1BBC9B;
  border-radius: 25px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #1BBC9B;
  box-shadow: 0 0 0 2px rgba(27, 188, 155, 0.2);
}

.complaints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.complaint-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 4px solid #ddd;
}

.complaint-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.complaint-card.pending {
  border-left-color: #f4c430;
}

.complaint-card.in-progress {
  border-left-color: #3498db;
}

.complaint-card.staff-assigned {
  border-left-color: #9b59b6;
}

.complaint-card.resolved {
  border-left-color: #28a745;
}

.complaint-card.rejected {
  border-left-color: #dc3545;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.complaint-id {
  font-weight: 600;
  color: #1BBC9B;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.in-progress {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.staff-assigned {
  background-color: #e7e3fc;
  color: #5a3e9b;
}

.status-badge.resolved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.card-body {
  padding: 15px;
  flex-grow: 1;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.detail-row.description {
  flex-direction: column;
  margin-top: 15px;
}

.detail-label {
  font-weight: 600;
  min-width: 100px;
  color: #666;
}

.truncated-description {
  margin: 5px 0 0;
  color: #555;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  padding: 15px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.details-btn {
  padding: 8px 16px;
  background-color: #1BBC9B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.details-btn:hover {
  background-color: #17a789;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #777;
  font-style: italic;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px 8px 0 0;
}

.modal-header h2 {
  color: #1BBC9B;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
  padding: 0 5px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.status-select, .staff-select, .remark-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 5px;
}

.remark-input {
  resize: vertical;
  font-family: inherit;
}

.complaint-description {
  margin: 5px 0 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f9f9f9;
  border-radius: 0 0 8px 8px;
}

.modal-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.modal-btn.primary {
  background-color: #1BBC9B;
  color: white;
}

.modal-btn.primary:hover {
  background-color: #17a789;
}

.modal-btn:hover:not(.primary) {
  background-color: #e0e0e0;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .complaints-grid {
    grid-template-columns: 1fr;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .search-box {
    width: 100%;
    max-width: 100%;
  }
  
  .header-line {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .detail-row {
    flex-direction: column;
    gap: 2px;
  }
  
  .detail-label {
    min-width: auto;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
  }
}
</style>