// FeeManagement.vue
<template>
  <Navbar_warden />
  <div class="fee-management-container">
    <div class="page-header">
      <h1>Fee Management</h1>
      <p>Set due fees and late fees for hostel residents</p>
    </div>

    <div class="fee-management-form">
      <!-- Form Section -->
      <div class="form-section">
        <h2>{{ isEditing ? 'Edit Fee Structure' : 'Set Monthly Fees' }}</h2>

        <!-- Room Type -->
        <div class="form-group">
          <label for="roomType">Room Type:</label>
          <select id="roomType" v-model="feeData.roomType">
            <option value="single">Single Room</option>
            <option value="double">Double Room</option>
            <option value="triple">Triple Room</option>
            <option value="four-sharing">Four Sharing</option>
            <option value="five-sharing">Five Sharing</option>
          </select>
        </div>

        <!-- AC Type -->
        <div class="form-group">
          <label for="acType">AC Type:</label>
          <select id="acType" v-model="feeData.acType">
            <option value="ac">AC</option>
            <option value="non-ac">Non-AC</option>
          </select>
        </div>

        <!-- Monthly Fee -->
        <div class="form-group">
          <label for="monthlyFee">Monthly Fee (₹):</label>
          <input type="number" id="monthlyFee" v-model="feeData.monthlyFee" />
        </div>
      </div>

      <!-- Late Fee Section -->
      <div class="form-section">
        <h2>Late Fee Policy</h2>

        <div class="form-group">
          <label for="dueDate">Due Date (day of month):</label>
          <input type="number" id="dueDate" v-model="feeData.dueDate" min="1" max="31" />
        </div>

        <div class="form-group">
          <label for="lateFeePerDay">Late Fee Per Day (₹):</label>
          <input type="number" id="lateFeePerDay" v-model="feeData.lateFeePerDay" />
        </div>

        <div class="form-group">
          <label for="maxLateDays">Maximum Late Days:</label>
          <input type="number" id="maxLateDays" v-model="feeData.maxLateDays" />
        </div>
      </div>

      <!-- Buttons -->
      <div class="form-actions">
        <button class="save-btn" @click="isEditing ? updateFee() : saveFeeSettings()">
          {{ isEditing ? 'Update Fee' : 'Save Settings' }}
        </button>
        <button class="reset-btn" @click="resetForm">Reset</button>
      </div>
    </div>

    <!-- Current Fee Table -->
    <div class="current-fees">
      <h2>Current Fee Structure</h2>
      <div class="fee-table">
        <div class="table-header">
          <div>Room Type</div>
          <div>AC Type</div>
          <div>Monthly Fee</div>
          <div>Due Date</div>
          <div>Late Fee/Day</div>
          <div>Max Late Days</div>
          <div>Actions</div>
        </div>

        <div class="table-row" v-for="fee in currentFees" :key="fee._id">
          <div>{{ formatRoomType(fee.roomType) }}</div>
          <div>{{ formatAcType(fee.acType) }}</div>
          <div>₹{{ fee.monthlyFee }}</div>
          <div>{{ fee.dueDate }}</div>
          <div>₹{{ fee.lateFeePerDay }}</div>
          <div>{{ fee.maxLateDays }}</div>
          <div>
            <button class="action-btn edit" @click="editFee(fee)">✏️</button>
            <button class="action-btn delete" @click="deleteFee(fee._id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Navbar_warden from '@/components/Navbar_warden.vue';
import Footer from '../../../components/Footer.vue';
import axios from 'axios';
import { API_URL } from "@/config";

export default {
  name: 'FeeManagement',
  components: { Navbar_warden, Footer },
  data() {
    return {
      feeData: {
        roomType: 'single',
        acType: 'non-ac',
        monthlyFee: '',
        dueDate: '',
        lateFeePerDay: '',
        maxLateDays: ''
      },
      currentFees: [],
      isEditing: false,
      editingId: null
    };
  },
  mounted() {
    this.fetchCurrentFees();
  },
  methods: {
    async saveFeeSettings() {
      try {
        const payload = {
          ...this.feeData,
          monthlyFee: Number(this.feeData.monthlyFee),
          dueDate: Number(this.feeData.dueDate),
          lateFeePerDay: Number(this.feeData.lateFeePerDay),
          maxLateDays: Number(this.feeData.maxLateDays),
        };

        await axios.post(`${API_URL}/api/v1/fee-structure`, payload);
        this.fetchCurrentFees();
        this.resetForm();
        alert('Fee settings saved successfully!');
      } catch (err) {
        alert('Failed to save fee settings.');
      }
    },
    async fetchCurrentFees() {
      try {
        const res = await axios.get(`${API_URL}/api/v1/fee-structure`);
        this.currentFees = res.data;
      } catch (err) {
        console.error('Error fetching fees:', err);
      }
    },
    resetForm() {
      this.feeData = {
        roomType: 'single',
        acType: 'non-ac',
        monthlyFee: '',
        dueDate: '',
        lateFeePerDay: '',
        maxLateDays: ''
      };
      this.isEditing = false;
      this.editingId = null;
    },
    formatRoomType(type) {
      const types = {
        single: 'Single Room',
        double: 'Double Room',
        triple: 'Triple Room',
        'four-sharing': 'Four Sharing',
        'five-sharing': 'Five Sharing'
      };
      return types[type] || type;
    },
    formatAcType(type) {
      return type === 'ac' ? 'AC' : 'Non-AC';
    },
    editFee(fee) {
      this.feeData = { ...fee };
      this.isEditing = true;
      this.editingId = fee._id;
      window.scrollTo(0, 0);
    },
    async updateFee() {
      try {
        const payload = {
          ...this.feeData,
          monthlyFee: Number(this.feeData.monthlyFee),
          dueDate: Number(this.feeData.dueDate),
          lateFeePerDay: Number(this.feeData.lateFeePerDay),
          maxLateDays: Number(this.feeData.maxLateDays),
        };

        await axios.put(`${API_URL}/api/v1/fee-structure/${this.editingId}`, payload); 
        this.fetchCurrentFees();
        this.resetForm();
        alert('Fee structure updated successfully!');
      } catch (err) {
        alert('Failed to update fee structure.');
      }
    },
    async deleteFee(id) {
      if (!confirm('Are you sure you want to delete this fee structure?')) return;
      try {
        await axios.delete(`${API_URL}/api/v1/fee-structure/${id}`);
        this.fetchCurrentFees();
        alert('Fee structure deleted successfully!');
      } catch (err) {
        alert('Failed to delete fee structure.');
      }
    }
  }
};
</script>


<style scoped>
.action-btn {
  margin: 0 5px;
  padding: 5px 10px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
}

.action-btn.edit {
  background-color: #1BBC9B;
  color: white;
}

.action-btn.delete {
  background-color: red;
  color: white;
}
</style>


<style scoped>
.fee-management-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.page-header {
  border-bottom: 3px solid #1BBC9B;
  margin-bottom: 30px;
  padding-bottom: 15px;
}

.page-header h1 {
  color: #1BBC9B;
  margin: 0 0 10px 0;
  font-size: 38px;
  text-align: center;
}

.page-header p {
  color: #666;
  margin: 0;
  font-size: 18px;
  text-align: center;
}

.fee-management-form {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.form-section {
  flex: 1;
  min-width: 300px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #1BBC9B;
}

.current-fees h2 {
  text-align: center;
  font-size: 35px;
}

.form-section h2 {
  color: #1BBC9B;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  text-align: center;
  border-color: 2px solid #1BBC9B;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-group select,
.form-group input {
  width: 90%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-actions {
  width: 100%;
  display: flex;
  gap: 25px;
  margin-top: 20px;
}

.save-btn,
.reset-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn {
  border: 2px solid #1BBC9B;
  background-color: white;
  font-size: 20px;
  color: #1BBC9B;
}

.save-btn:hover {
  background-color: #16a085;
  color: white;
}

.reset-btn {
  background-color: white;
  color: red;
  width: 150px;
  border: 2px solid red;
  font-size: 20px;
}

.reset-btn:hover {
  background-color: red;
  color: white;
}

/* Current Fees Table */
.current-fees {
  margin-top: 30px;
}

.current-fees h2 {
  color: #1BBC9B;
  border-bottom: 2px solid #1BBC9B;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.fee-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
  padding: 12px 15px;
  border: 2px solid #1BBC9B;
}

.table-header {
  background-color: #1BBC9B;
  color: white;
  font-weight: bold;
}

.table-row {
  border-bottom: 1px solid #eee;
  background-color: white;
}

.table-row:last-child {
  border-bottom: 2px solid #1BBC9B;
}

.table-header div,
.table-row div {
  flex: 1;
  text-align: left;
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .fee-management-form {
    flex-direction: column;
  }

  .table-header {
    display: none;
  }

  .table-row {
    flex-direction: column;
    border-bottom: 2px solid #eee;
  }

  .table-row div {
    padding: 5px 0;
    border-bottom: 1px solid #f5f5f5;
  }

  .table-row div:last-child {
    border-bottom: none;
  }

  .table-row div::before {
    content: attr(data-label);
    font-weight: bold;
    color: #1BBC9B;
    display: inline-block;
    width: 120px;
  }
}
</style>