<template>
  <Navbar_warden/>
  <div class="payment-tracking-container">
    <div class="header">
      <h1>Payment Tracking</h1>
      <div class="header-line"></div>
    </div>

    <div class="controls">
      <div class="filter-buttons">
        <button @click="setFilter('all')" :class="{ active: currentFilter === 'all' }">
          All ({{ students.length }})
        </button>
        <button @click="setFilter('paid')" :class="{ active: currentFilter === 'paid' }">
          Paid ({{ paidCount }})
        </button>
        <button @click="setFilter('unpaid')" :class="{ active: currentFilter === 'unpaid' }">
          Unpaid ({{ unpaidCount }})
        </button>
      </div>
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by name or ID..." />
      </div>
    </div>

    <div class="students-grid">
      <div 
        class="payment-card" 
        v-for="student in filteredStudents" 
        :key="student._id"
        :class="student.hasPaid ? 'paid' : 'unpaid'">
        <div class="card-header">
          <span class="student-id">{{ student.studentId }}</span>
          <span :class="['payment-status', student.hasPaid ? 'paid' : 'unpaid']">
            {{ student.hasPaid ? 'Paid' : 'Unpaid' }}
          </span>
        </div>

        <div class="card-body">
          <div class="student-info">
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">{{ student.name || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Room:</span>
              <span class="value">{{ student.roomType }}</span>
            </div>
            <div class="info-row">
              <span class="label">AC/Non-AC:</span>
              <span class="value">{{ student.acType }}</span>
            </div>
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value">₹{{ student.amountPaid?.toLocaleString() }}</span>
            </div>
            <div class="info-row">
              <span class="label">Due Date:</span>
              <span class="value">{{ formatDate(student.paymentDate) }}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button 
            @click="togglePayment(student)"
            class="status-btn"
            :class="student.hasPaid ? 'paid' : 'unpaid'">
            Mark as {{ student.hasPaid ? 'Unpaid' : 'Paid' }}
          </button>
          <button v-if="!student.hasPaid" @click="sendReminder(student)" class="reminder-btn">
            Send Reminder
          </button>
        </div>
      </div>
      <div v-if="filteredStudents.length === 0" class="no-results">
        No students found matching your criteria.
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script>
import axios from 'axios';
import Footer from '../../../components/Footer.vue';
import Navbar_warden from '@/components/Navbar_warden.vue';

export default {
  components: { Navbar_warden, Footer },
  data() {
    return {
      students: [],
      currentFilter: 'all',
      searchQuery: ''
    };
  },
  computed: {
    paidCount() {
      return this.students.filter(s => s.hasPaid).length;
    },
    unpaidCount() {
      return this.students.filter(s => !s.hasPaid).length;
    },
    filteredStudents() {
      let result = this.students;
      if (this.currentFilter === 'paid') result = result.filter(s => s.hasPaid);
      if (this.currentFilter === 'unpaid') result = result.filter(s => !s.hasPaid);
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(s => 
          s.studentId.toLowerCase().includes(query) || 
          s.name?.toLowerCase().includes(query) ||
          s.roomType.toLowerCase().includes(query)
        );
      }
      return result;
    }
  },
  methods: {
    async fetchStudents() {
      try {
        const res = await axios.get('/api/payment-status');
        this.students = res.data;
      } catch (err) {
        console.error('Failed to fetch payment statuses:', err);
      }
    },
    async togglePayment(student) {
      try {
        const updated = {
          ...student,
          hasPaid: !student.hasPaid
        };
        await axios.post('/api/payment-status', updated);
        student.hasPaid = !student.hasPaid;
      } catch (err) {
        console.error('Error updating payment status:', err);
      }
    },
    sendReminder(student) {
      alert(`Reminder sent to ${student.name || student.studentId} about unpaid amount ₹${student.amountPaid}`);
    },
    setFilter(filter) {
      this.currentFilter = filter;
    },
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-GB');
    }
  },
  mounted() {
    this.fetchStudents();
  }
};
</script>





<style scoped>
.payment-tracking-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  width:1000px;
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
  font-size: 2.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.header-line {
  height: 3px;
  background-color: #1BBC9B;
  width: 1050px;
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
}

.filter-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: white;
  border:2px solid #1BBC9B;
  color: #1BBC9B;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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
  padding: 10px 15px 10px 35px;
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
 
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.payment-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.payment-card {
  border-left: 4px solid #1BBC9B; 
}

.payment-card.paid {
  border-left-color: #2e7d32; 
}

.payment-card.unpaid {
  border-left-color: #c62828;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.student-id {
  font-weight: 600;
  color: #1BBC9B;
}

.payment-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.payment-status.paid {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.payment-status.unpaid {
  background-color: #ffebee;
  color: #c62828;
}

.card-body {
  padding: 15px;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  text-align: left;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  text-align: left;
  margin-left: 20px;
}

.card-footer {
  padding: 15px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.status-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.status-btn.paid {
  background-color: #ffebee;
  color: #c62828;
}

.status-btn.unpaid {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-btn:hover {
  opacity: 0.9;
}

.reminder-btn {
  padding: 8px 12px;
  background-color: #1BBC9B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.reminder-btn:hover {
  background-color: #17a789;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #777;
  font-style: italic;
}

@media (max-width: 768px) {
  .students-grid {
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
  }
  
  .card-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .info-row {
    flex-direction: column;
    gap: 2px;
  }
  
  .label, .value {
    text-align: left;
  }
}
</style>