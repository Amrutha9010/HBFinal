// FeeDetails.vue
<template>
  <div :class="['fee-details', isDark ? 'dark-theme' : 'light-theme']">
    <Navbar_Student />
    <div class="container">
      <div class="header-bar">
        <h1 class="page-title">Fee Details</h1>
        <!-- <button class="theme-toggle" @click="isDark = !isDark">
          {{ isDark ? '☀ Light Mode' : '🌙 Dark Mode' }}
        </button> -->
      </div>

      <p class="info-text">
        💡 Monthly hostel fees must be paid by the <strong>{{ dueSampleDay }}th</strong> of every month. A late fee will be charged after the due date. Please ensure timely payment to avoid penalties.
      </p>

      <div v-if="loading" class="loading">Loading...</div>

      <div class="table-wrapper" v-else>
        <table class="fee-table">
          <thead>
            <tr>
              <th>Room Type</th>
              <th>AC Type</th>
              <th>Monthly Fee</th>
              <th>Due Date</th>
              <th>Late Fee/Day</th>
              <th>Max Late Days</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(fee, index) in feeStructures"
              :key="index"
              :class="{
                highlight: fee.roomType === studentRoomType && fee.acType === studentAcType
              }"
            >
              <td>{{ fee.roomType }}</td>
              <td>{{ fee.acType }}</td>
              <td>₹{{ fee.monthlyFee }}</td>
              <td>{{ fee.dueDate }}th</td>
              <td>₹{{ fee.lateFeePerDay }}</td>
              <td>{{ fee.maxLateDays }} days</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="pay-section">
      <button @click="goToPayment" class="pay-now-button">Pay Now</button>
    </div>

    <Footer />
  </div>
</template>

<script>
import Navbar_Student from "@/components/Navbar_Student.vue";
import Footer from "@/components/Footer.vue";
import axios from "axios";
import { API_URL } from "@/config"; 

export default {
  components: { Navbar_Student, Footer },
  data() {
    return {
      feeStructures: [],
      loading: true,
      studentRoomType: "",
      studentAcType: "",
      isDark: false,
    };
  },
  computed: {
    dueSampleDay() {
      return this.feeStructures.length > 0 ? this.feeStructures[0].dueDate : "10";
    },
  },
  methods: {
  goToPayment() {
    this.$router.push("/payments");
  }
},

  async mounted() {
    try {
      const res = await axios.get(`${API_URL}/api/fee-structure`);
      this.feeStructures = res.data;

      const student = JSON.parse(localStorage.getItem("user"));
      this.studentRoomType = student?.roomType || "triple";
      this.studentAcType = student?.acType || "non-ac";

    } catch (error) {
      console.error("Failed to load fee structures", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.fee-details {
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}
.container {
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 2rem;
  color: #1BBC9B;
}
.theme-toggle {
  padding: 0.5rem 1rem;
  background: #1BBC9B;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.info-text {
  background: #e8fdf8;
  padding: 1rem;
  margin: 1rem 0 2rem;
  border-left: 5px solid #1BBC9B;
  border-radius: 4px;
}
.table-wrapper {
  overflow-x: auto;
}
.fee-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
}
.fee-table th,
.fee-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #ddd;
}
.fee-table th {
  background-color: #1BBC9B;
  color: white;
}
.highlight {
  background-color: #d4f5ef;
  font-weight: bold;
}
.loading {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
}
.pay-section {
  margin-top: 2rem;
  text-align: center;
  margin-bottom: 40px;
}
.pay-now-button {
  background-color: #1BBC9B;
  color: white;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}
.pay-now-button:hover {
  background-color: #159b83;
}
.dark-theme {
  background-color: #1A1C2D;
  color: #ffffff;
}

.dark-theme {
  background-color: #1A1C2D;
  color: #ffffff;
}
.dark-theme .fee-table {
  background-color: #262837;
  color: white;
}
.dark-theme .fee-table th {
  background-color: #44D4C5;
}
.dark-theme .info-text {
  background: #2f3647;
  color: #ffffff;
  border-left-color: #44D4C5;
}
</style>
