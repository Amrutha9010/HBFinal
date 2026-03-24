<template>
  <Navbar_Student />

  <div class="mess-menu-container">
    <h1>Mess Menu</h1>

    <!-- ✅ Weekly Menu -->
    <div class="weekly-menu">
      <!-- 7 Day Cards -->
      <div
        v-for="day in weeklyMenu"
        :key="day.dayName"
        class="day-card"
        :class="{ today: day.isToday }"
      >
        <div class="day-header">
          <div class="day-name">{{ day.dayName }}</div>
        </div>

        <div class="meal-section">
          <h3>Breakfast</h3>
          <ul>
            <li v-for="(item, index) in day.breakfast" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="meal-section">
          <h3>Lunch</h3>
          <ul>
            <li v-for="(item, index) in day.lunch" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="meal-section">
          <h3>Dinner</h3>
          <ul>
            <li v-for="(item, index) in day.dinner" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="quote-image-box">
        <img :src="quoteImage" alt="Mess Quote" class="quote-image" />
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import axios from "axios";
import Navbar_Student from "../../../../components/Navbar_Student.vue";
import Footer from "../../../../components/Footer.vue";

// ✅ Import image from assets
import quoteImage from "@/assets/images/messQuote.png";

export default {
  name: "MessMenu",
  components: { Navbar_Student, Footer },
  data() {
    return {
      backendMenu: {},
      quoteImage,
    };
  },
  computed: {
    weeklyMenu() {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      return days.map((day) => {
        const todayName = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });
        const isToday = todayName === day;

        const backendDayMenu = this.backendMenu[day] || {
          breakfast: [],
          lunch: [],
          dinner: [],
        };

        return {
          dayName: day,
          isToday,
          breakfast: [backendDayMenu.breakfast],
          lunch: [backendDayMenu.lunch],
          dinner: [backendDayMenu.dinner],
        };
      });
    },
  },
  mounted() {
    this.fetchMenuFromBackend();
  },
  methods: {
    async fetchMenuFromBackend() {
      try {
        const res = await axios.get("http://localhost:5000/api/menu");
        this.backendMenu = res.data.weeklyMenu;
      } catch (err) {
        console.error("Error fetching menu", err);
      }
    },
  },
};
</script>

<style scoped>
.mess-menu-container {
  width: 95%;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #1bbc9b;
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  border-bottom: 3px solid #1bbc9b;
  padding-bottom: 10px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

/* ✅ 3 columns per row */
.weekly-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.day-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
  transition: all 0.3s ease;
  min-height: 300px; /* same height for consistency */
}

.day-card.today {
  border: 2px solid #1bbc9b;
  box-shadow: 0 6px 18px rgba(27, 188, 155, 0.2);
}

.day-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.day-name {
  font-weight: 700;
  color: #333;
  font-size: 20px;
}

.meal-section {
  margin-bottom: 15px;
}

.meal-section h3 {
  color: #1bbc9b;
  font-size: 17px;
  margin-bottom: 8px;
}

.meal-section ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.meal-section li {
  padding: 6px 0;
  color: #555;
  border-bottom: 1px dashed #eee;
}

/* ✅ Image box will span 2 grid columns */
.quote-image-box {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.quote-image {
  /* width: 100%; */
  /* height: 100%; */
  max-height: 400px;
  object-fit: cover;
  margin-top: 30px;
}

@media (max-width: 992px) {
  .weekly-menu {
    grid-template-columns: repeat(2, 1fr);
  }
  .quote-image-box {
    grid-column: span 2; /* still spans full row on tablet */
  }
}
@media (max-width: 600px) {
  .weekly-menu {
    grid-template-columns: 1fr;
  }
  .quote-image-box {
    grid-column: span 1; /* full width on mobile */
  }
}
</style>
