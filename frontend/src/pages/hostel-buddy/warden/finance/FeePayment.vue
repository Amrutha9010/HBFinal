// FeePayment.vue
<template>
  <div class="fee-page">
    <Navbar_Student />
    <main class="container">
      <div class="content-wrapper">
        <!-- Payment Card -->
        <div class="payment-card">
          <div class="card-header">
            <h1>Hostel Fee Payment</h1>
            <p class="subtitle">Secure online payment for your hostel stay</p>
          </div>

          <!-- Student Info -->
          <div class="student-info" v-if="student.studentId">
            <div class="info-item">
              <span class="info-label">Student Name:</span>
              <span class="info-value">{{ student.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Student ID:</span>
              <span class="info-value">{{ student.studentId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ student.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Room No:</span>
              <span class="info-value">{{ student.room }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone No:</span>
              <span class="info-value">{{ student.phone }}</span>
            </div>
          </div>
          <div v-else class="student-info">
            <span>Loading student details...</span>
          </div>

          <!-- Enter Amount -->
          <div class="amount-section">
            <label class="amount-label">Enter Amount to Pay</label>
            <input type="number" v-model="payment.amount" placeholder="Enter amount" class="amount-input" />
          </div>

          <!-- Pay Button -->
          <button class="pay-btn" @click="processPayment" :disabled="processingPayment || isPaid">
            <span v-if="isPaid">
              Fee Already Paid
            </span>

            <span v-else-if="!processingPayment">
              Pay ₹{{ payment.amount || 0 }}
            </span>

            <span v-else>
              Processing...
            </span>
          </button>
        </div>


        <!-- Payment History -->
        <div class="history-section">
          <div class="section-header">
            <h2><i class="fas fa-history"></i> Payment History</h2>
          </div>
          <div class="history-content">
            <table class="history-table" v-if="paymentHistory.length > 0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paymentHistory" :key="index">
                  <td>{{ new Date(item.createdAt).toLocaleDateString() }}</td>
                  <td>₹{{ item.amount }}</td>
                  <td>
                    <span class="status-badge" :class="item.status">
                      <i :class="statusIcon(item.status)"></i> {{ item.status }}
                    </span>
                  </td>
                  <td>
                    <button v-if="item.status === 'success'" @click="downloadReceipt(item)" class="download-btn">
                      <i class="fas fa-download"></i> Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              <i class="fas fa-file-invoice-dollar"></i>
              <p>No payment history yet</p>
            </div>
          </div>
        </div>
      </div>
      <div class="debug-section" v-if="student.studentId === 'N/A'">
        <button @click="debugAuth" class="debug-btn">Debug Auth State</button>
        <div v-if="debugInfo" class="debug-info">
          <pre>{{ debugInfo }}</pre>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";
import Navbar_Student from "../../../../components/Navbar_Student.vue";
import jsPDF from "jspdf";
import { API_URL } from "@/config";

export default {
  name: "FeePayment",
  components: { Navbar_Student, Footer },

  data() {
    return {
      student: {
        name: "",
        studentId: "",
        email: "",
        room: "",
        phone: "",
      },
      debugInfo: null,
      payment: { amount: null },
      paymentHistory: [],
      processingPayment: false,
      isPaid: false,
    };
  },

  async mounted() {
    await this.loadStudentDetails();

    // Only fetch payment history if we have a valid studentId
    if (this.student.studentId && this.student.studentId !== "N/A") {
      await this.fetchPaymentHistory();
      await this.fetchFeeAmount();
    } else {
      console.error("Cannot fetch payment history without valid student ID");
    }
  },

  methods: {
    debugAuth() {
      this.debugInfo = {
        token: localStorage.getItem('token'),
        userData: JSON.parse(localStorage.getItem('user')),
        env: process.env.VUE_APP_API_URL
      };
    },
    async loadStudentDetails() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/api/v1/students/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const studentData = await res.json();
        const user = JSON.parse(localStorage.getItem("user"));

        this.student = {
          name: studentData.fullName || "N/A",
          studentId: studentData.fieldId || "N/A",
          email: user?.email || "N/A",  
          room: studentData.roomNo || "Not Assigned",
          phone: studentData.phone || "N/A"
        };

      } catch (error) {
        console.error("Error loading student:", error);
      }
    },
    async fetchFeeAmount() {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/payment/student-fee?studentId=${this.student.studentId}`
        );
        const data = await res.json();

        if (data.amount) {
          this.payment.amount = data.amount;
        }

      } catch (err) {
        console.error("Failed to fetch fee amount", err);
      }
    },
    async fetchPaymentHistory() {
      try {
        if (!this.student.studentId) return;
        const res = await fetch(
          `${API_URL}/api/v1/payment/history?studentId=${this.student.studentId}`
        );
        const data = await res.json();
        this.paymentHistory = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    },

    async processPayment() {
      try {
        if (!this.payment.amount || this.payment.amount <= 0) {
          alert("Please enter a valid amount!");
          return;
        }

        this.processingPayment = true;

        const res = await fetch(
          `${API_URL}/api/v1/payment/create-order`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: this.payment.amount }),
          }
        );
        const orderData = await res.json();

        if (!orderData.success) {
          alert("Failed to create payment order");
          this.processingPayment = false;
          return;
        }

        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "HostelBuddy",
          description: "Hostel Fee Payment",
          order_id: orderData.order_id,
          handler: async (response) => {
            const verifyPayload = {
              ...response,
              studentName: this.student.name,
              studentId: this.student.studentId,
              email: this.student.email,
              amount: this.payment.amount,
            };

            console.log("Verify Payload:", verifyPayload);

            const verifyRes = await fetch(
              `${API_URL}/api/v1/payment/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(verifyPayload),
              }
            );

            const verifyData = await verifyRes.json();
            console.log("Verify Response:", verifyData);

            if (verifyData.success) {
              alert("Payment successful!");
              this.fetchPaymentHistory();
            } else {
              alert("Payment verification failed!");
            }
          },
          prefill: {
            name: this.student.name,
            email: this.student.email,
            contact: "9999999999",
          },
          theme: { color: "#1BBC9B" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        this.processingPayment = false;
      } catch (error) {
        console.error("Payment Error:", error);
        alert("Something went wrong");
        this.processingPayment = false;
      }
    },

    statusIcon(status) {
      return {
        success: "fas fa-check-circle",
        failed: "fas fa-times-circle",
        pending: "fas fa-clock",
      }[status];
    },

    downloadReceipt(payment) {
      const doc = new jsPDF();

      doc.setFont("helvetica", "normal");

      doc.text("Hostel Fee Payment Receipt", 20, 20);
      doc.text(`Student: ${this.student.name}`, 20, 40);
      doc.text(`Student ID: ${this.student.studentId}`, 20, 50);
      doc.text(`Room: ${this.student.room}`, 20, 60);
      doc.text(`Amount Paid: ₹${payment.amount}`, 20, 80);
      doc.text(`Payment ID: ${payment.razorpay_payment_id}`, 20, 90);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 20, 100);

      doc.save(`Receipt_${payment.razorpay_payment_id}.pdf`);
    },
  },
};
</script>





<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Amount Section Styles */
.amount-section {
  padding: 0 1.5rem 1.5rem;
}

.debug-btn {
  background: #ff4757;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 10px 0;
}

.debug-info {
  background: #f1f1f1;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
}

.amount-label {
  display: block;
  font-size: 0.8125rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #212529;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.amount-input:focus {
  outline: none;
  border-color: #1BBC9B;
  box-shadow: 0 0 0 3px rgba(27, 188, 155, 0.2);
  background-color: white;
}

.amount-input::placeholder {
  color: #adb5bd;
  font-weight: 300;
}

.fee-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
}

.student-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.info-item {
  overflow: hidden;
}

.info-value {
  word-break: break-word;
  overflow-wrap: anywhere;
}



.container {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  width: 100%;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 1rem;
  /* Space for navbar */
}

/* Payment Card Styles */
.payment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid #e0e0e0;
}

.payment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
  background: #1BBC9B;
  /* Tea color */
  color: white;
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0.5rem 0 0;
  font-weight: 300;
}

.student-info {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.8125rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #212529;
}

.highlight .info-value {
  color: #1BBC9B;
  /* Tea color */
  font-weight: 600;
  font-size: 1.125rem;
}

.pay-btn {
  width: calc(100% - 3rem);
  margin: 0 1.5rem 1.5rem;
  padding: 1rem;
  background: #1BBC9B;
  /* Tea color */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pay-btn:hover {
  background: #1BBC9B;
  /* Darker tea color */
  box-shadow: 0 4px 12px rgba(27, 188, 155, 0.2);
}

.pay-btn:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

/* History Section Styles */
.history-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.section-header {
  background: #1BBC9B;
  /* Tea color */
  color: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-content {
  padding: 1.5rem;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 1px solid #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #495057;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.failed {
  background-color: #ffebee;
  color: #c62828;
}

.status-badge.pending {
  background-color: #fff8e1;
  color: #f57f17;
}

.download-btn {
  background: #f5f5f5;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #5d4037;
  /* Tea color */
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border: 1px solid #e0e0e0;
}

.download-btn:hover {
  background: #e0e0e0;
  color: #3e2723;
  /* Darker tea color */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  color: #9e9e9e;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #bdbdbd;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .content-wrapper {
    margin-top: 4rem;
  }

  .student-info {
    grid-template-columns: 1fr;
  }

  .history-table {
    display: block;
    overflow-x: auto;
  }

  .pay-btn {
    width: calc(100% - 2rem);
    margin: 0 1rem 1rem;
  }
}
</style>