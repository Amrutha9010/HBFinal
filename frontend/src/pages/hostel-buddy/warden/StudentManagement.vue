<template>
  <Navbar_warden />

  <div class="student-management">
    <h1 class="title">Student Management</h1>

    <!-- 🔍 Search -->
    <div class="controls">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by name, email, room..."
        class="search-box"
      />
    </div>

    <!-- 📊 TABLE -->
    <table class="student-table">
      <thead>
        <tr>
          <th>Photo</th>
          <th>Name</th>
          <th>Roll</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Room</th>
          <th>Payment</th>
          <th>Balance</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="student in filteredStudents" :key="student._id">

          <!-- 📸 Photo -->
          <td>
            <img
              :src="student.studentPhoto || defaultAvatar"
              class="student-avatar"
            />
          </td>

          <!-- 👤 Details -->
          <td>{{ student.fullName }}</td>
          <td>{{ student.rollNumber }}</td>
          <td>{{ student.email }}</td>
          <td>{{ student.phone }}</td>
          <td class="address">{{ student.address }}</td>
          <td>{{ student.roomNo }}</td>

          <!-- 💰 Payment -->
          <td>
            <span :class="student.paid ? 'paid' : 'not-paid'">
              {{ student.paid ? "Paid" : "Not Paid" }}
            </span>
          </td>

          <td>₹{{ student.balance }}</td>

          <!-- ❌ Remove -->
          <td>
            <button class="delete-btn" @click="deleteStudent(student._id)">
              Remove
            </button>
          </td>

        </tr>
      </tbody>
    </table>
  </div>

  <Footer />
</template>

<script>
import Navbar_warden from '@/components/Navbar_warden.vue';
import Footer from '../../../components/Footer.vue';
import axios from "axios";
import { API_URL } from "@/config";

export default {
  components: {
    Navbar_warden,
    Footer
  },

  data() {
    return {
      searchQuery: "",
      students: [],
      defaultAvatar: "https://via.placeholder.com/50"
    };
  },

  computed: {
    filteredStudents() {
      return this.students.filter((s) =>
        s.fullName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (s.roomNo || "").toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },

  mounted() {
    this.fetchStudents();
  },

  methods: {

    // ✅ FETCH STUDENTS
    async fetchStudents() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/api/v1/students`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // ✅ Directly use backend data (no remapping needed)
        this.students = res.data.data;

      } catch (err) {
        console.error("Error fetching students:", err);
      }
    },

    // ❌ REMOVE STUDENT
    async deleteStudent(id) {
      if (!confirm("Are you sure you want to remove this student?")) return;

      try {
        const token = localStorage.getItem("token");

        await axios.delete(`${API_URL}/api/v1/students/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // refresh list
        this.fetchStudents();
        alert("Student removed successfully");

      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete student");
      }
    }

  }
};
</script>


<style scoped>
.student-management {
  padding: 1.5rem;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 50vh;
  min-width: 300px;
  /* background: linear-gradient(rgba(59, 57, 57, 0.9), rgba(255, 255, 255, 0.9)), 
              url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') no-repeat center center fixed; */
  background-size: cover;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  color: #1BBC9B;
  text-align: center;
  margin-bottom: 25px;
  font-size: 2.2rem;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  align-items: center;
  flex-wrap: wrap;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box:focus {
  border-color: #1BBC9B;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

select {
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #1BBC9B;
  background-color: #1BBC9B;
  font-size: 14px;
  cursor: pointer;
  color: white;
}

.btn {
  background-color: #1BBC9B;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  background-color: #1BBC9B;
  transform: translateY(-1px);
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.student-table th {
  background-color: #1BBC9B;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 500;
}

.student-table td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.student-table tr:last-child td {
  border-bottom: none;
}

.student-table tr:hover {
  background-color: #f5f5f5;
}

.student-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.student-info img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1BBC9B;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #1BBC9B;
}

.student-info div {
  line-height: 1.4;
}

.student-info small {
  color: white;
  font-size: 0.85rem;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  display: inline-block;
  font-size: 13px;
  min-width: 80px;
  text-align: center;
}

.status.active {
  background-color: #e8f5e9;
  color: #1BBC9B;
}

.status.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.status.on-leave {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status.mess-off {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.status.pending {
  background-color: #e3f2fd;
  color: #1565c0;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 5px 10px;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: #f0f0f0;
  color: #1BBC9B;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-box {
  background: white;
  padding: 30px;
  width: 650px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-box h2 {
  color: #1BBC9B;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.form-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

input,
select {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  transition: all 0.3s;
}

input:focus,
select:focus {
  border-color: #1BBC9B;
  outline: none;
  box-shadow: 0 0 0 2px #1BBC9B
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: white;
  color: #1BBC9B;
  border-color: #1BBC9B;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #1BBC9B;
  color: white;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #1BBC9B;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background-color: #1BBC9B;
  transform: translateY(-1px);
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.address {
  max-width: 200px;
  font-size: 12px;
}

.paid {
  color: green;
  font-weight: bold;
}

.not-paid {
  color: red;
  font-weight: bold;
}

.delete-btn {
  background: red;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
}
</style>