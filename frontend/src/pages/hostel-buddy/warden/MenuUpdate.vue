<template>
  <Navbar_warden />
  <h2>Mess Menu Update</h2>

  <div class="main-wrapper">
    <!-- Grid of Day Cards -->
    <div class="cards-container">
      <div class="day-card" v-for="(menu, day) in weeklyMenu" :key="day">
        <h3>{{ day }}</h3>
        <p><strong>Breakfast:</strong> {{ menu.breakfast }}</p>
        <p><strong>Lunch:</strong> {{ menu.lunch }}</p>
        <p><strong>Dinner:</strong> {{ menu.dinner }}</p>

        <button class="open-btn" @click="toggleForm(day)">
          {{ editingDay === day ? "Cancel" : "Update Menu" }}
        </button>
      </div>
    </div>

    <!-- Update section below -->
    <div v-if="editingDay" class="update-section">
      <!-- Left: Update Form -->
      <div class="update-form">
        <h3>Update Menu for {{ editingDay }}</h3>

        <input v-model="form.breakfast" placeholder="Enter breakfast" />
        <input v-model="form.lunch" placeholder="Enter lunch" />
        <input v-model="form.dinner" placeholder="Enter dinner" />

        <button class="submit-btn" @click="updateMenu">Submit</button>
      </div>

      <!-- Right: Mess Image -->
      <div class="image-container">
        <img src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600" alt="Mess Food" />
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import axios from "axios";
import Navbar_warden from "../../../components/Navbar_warden.vue";
import Footer from "../../../components/Footer.vue";
import { API_URL } from "@/config";

export default {
  components: {
    Navbar_warden,
    Footer,
  },
  data() {
    return {
      editingDay: "",
      weeklyMenu: {},
      form: {
        breakfast: "",
        lunch: "",
        dinner: "",
      },
    };
  },
  mounted() {
    this.fetchMenu();
  },
  methods: {
    async fetchMenu() {
      try {
        const res = await axios.get(`${API_URL}/api/menu`);
        this.weeklyMenu = res.data.weeklyMenu;
      } catch (err) {
        console.error("Error fetching menu", err);
      }
    },
    toggleForm(day) {
      if (this.editingDay === day) {
        this.editingDay = "";
        this.form = { breakfast: "", lunch: "", dinner: "" };
      } else {
        this.editingDay = day;
        this.form = { ...this.weeklyMenu[day] };
      }
    },
    async updateMenu() {
      if (!this.editingDay) return;

      try {
        await axios.put(
          `${API_URL}/api/menu/${this.editingDay}`,
          this.form
        );

        alert(`Menu updated for ${this.editingDay}`);
        this.weeklyMenu[this.editingDay] = { ...this.form };

        this.editingDay = "";
        this.form = { breakfast: "", lunch: "", dinner: "" };
      } catch (err) {
        console.error("Error updating menu", err);
        alert("❌ Failed to update menu");
      }
    },
  },
};
</script>

<style scoped>
h2{
  text-align: center;
  margin-top: 30px;
}
.main-wrapper {
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* ✅ 4 cards per row using grid */
.cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* ✅ exactly 4 columns */
  gap: 20px;
  margin-bottom: 30px;
}


.day-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #1bbc9b;
  text-align: center;
  transition: transform 0.2s ease;
  margin: 20px 10px;
}
.day-card:hover {
  transform: translateY(-3px);
}

.open-btn {
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #1bbc9b;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

/* ✅ Update section below cards */
.update-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.update-form {
  flex: 1;
  min-width: 300px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #1bbc9b;
}

.update-form input {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.submit-btn {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  background-color: #1bbc9b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 17px;
}

/* Image on side */
.image-container {
  flex: 1;
  min-width: 300px;
  text-align: center;
}
.image-container img {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  object-fit: cover;
}
</style>
