<template>
  <nav class="navbar" :class="{'dark-theme': isDarkTheme}">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        <font-awesome-icon :icon="['fas', 'users']" />
        Hostel Buddy
      </router-link>

      <!-- Theme Toggle -->
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDarkTheme ? '☀' : '🌙'  }}
      </button>

      <!-- Navigation Menu -->
      <ul class="nav-menu" :class="{'active': isOpen}">
        <li class="nav-item">
          <router-link to="/hostel-buddy" class="nav-links" @click="closeMenu">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/warden-dashboard" class="nav-links" @click="closeMenu">Dashboard</router-link>
        </li>

            <!-- Hamburger icon button -->
<li class="nav-item hamburger-button">
  <button @click="toggleQuickActions" class="hamburger-icon-button">
    <span class="bar1"></span>
    <span class="bar2"></span>
    <span class="bar3"></span>
  </button>
</li>

       </ul>
    </div>
  </nav>

<!-- Floating Sidebar Menu -->
<div class="quick-actions-popup" :class="{ open: isQuickActionsOpen }">
  <div class="popup-header">
    <h3>Quick Actions</h3>
    <button class="close-popup" @click="toggleQuickActions">×</button>
  </div>
  <ul class="popup-actions-list">
   <li>
    <router-link to="/announcement-form"  @click="closeMenu">
    <font-awesome-icon :icon="['fas', 'bullhorn']" /> Announcements
    </router-link>
    </li>

     <li>
    <router-link to="room-assignment"  @click="closeMenu">
   <font-awesome-icon :icon="['fas',  'home']" /> Room Allocation
    </router-link>
    </li>

    <li>
    <router-link to="room-change"  @click="closeMenu">
    <font-awesome-icon :icon="['fas', 'exchange-alt']" /> Change Rooms
    </router-link>
    </li>

    <li>
    <router-link to="hostel-occupancy"  @click="closeMenu">
    <font-awesome-icon :icon="['fas', 'bed']" /> Hostel Occupancy
    </router-link>
    </li>


     <li>
    <router-link to="leave-approval"  @click="closeMenu">
    <font-awesome-icon :icon="['fas', 'clipboard-check']" /> Leave Approval
    </router-link>
    </li>


    <li>
    <router-link to="complaint-management"  @click="closeMenu">
    <font-awesome-icon :icon="['fas','screwdriver-wrench']" /> View Complaints
    </router-link>
    </li>

    <li>
    <router-link to="menu-update"  @click="closeMenu">
   <font-awesome-icon :icon="['fas', 'utensils']" /> Update Menu
    </router-link>
    </li>

    <li>
    <router-link to="fee-management"  @click="closeMenu">
    <font-awesome-icon :icon="['fas', 'indian-rupee-sign']" /> Fee Management
    </router-link>
    </li>

    

    <!-- <li>
    <router-link to="payment-tracking"  @click="closeMenu">
   <font-awesome-icon :icon="['fas', 'file-alt']" /> Fee Reports
    </router-link>
    </li> -->

    
   

    <!-- <li>
    <router-link to="student-management"  @click="closeMenu">
    <font-awesome-icon :icon="['fas', 'user-graduate']" /> Student Details
    </router-link>
    </li> -->

   
  </ul>
</div>

</template>

<script>
import { ref, onMounted } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBullhorn, faExchangeAlt, faUtensils,   faIndianRupeeSign, 
  faScrewdriverWrench,  faFileAlt, faHome, faBed, faMapMarkerAlt,
  faUserGraduate, faClipboardCheck, faEdit, faBars, faUsers
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faBullhorn, faExchangeAlt, faUtensils,faIndianRupeeSign, 
   faScrewdriverWrench,  faFileAlt, faHome, faBed,  faMapMarkerAlt,
  faUserGraduate, faClipboardCheck, faEdit, faBars, faUsers
);

const isQuickActionsOpen = ref(false);

export default {
  name: 'Navbar',
  setup() {
    const isOpen = ref(false);
    const isDarkTheme = ref(false);
 
const toggleQuickActions = () => {
  isQuickActionsOpen.value = !isQuickActionsOpen.value;
};
 
    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    const closeMenu = () => {
      isOpen.value = false;
      isQuickActionsOpen.value = false; 
    };

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
      localStorage.setItem('darkTheme', isDarkTheme.value ? 'dark' : 'light');
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { isDark: isDarkTheme.value }
      }));
    };

    onMounted(() => {
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme) {
        isDarkTheme.value = savedTheme === 'dark';
      }
    });

      return {
  isOpen,
  isDarkTheme,
  toggleMenu,
  closeMenu,
  toggleTheme,
  isQuickActionsOpen,
  toggleQuickActions
    };
  }
}

</script>

<style scoped>
/* General Styles */
.navbar {
  background-color: #fff;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  height: 80px;
  width: 100%;
  max-width: 1500px;
  padding: 0 24px;
}

.navbar-logo {
  color: #1BBC9B;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  font-weight: bold;
  text-decoration: none;
}

.navbar-logo svg {
  margin-right: 10px;
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.navbar-logo:hover svg {
  transform: scale(1.1);
  color: #16a085;
}

.theme-toggle {
  background-color: #44D4C5;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0 10px;
  height: 30px;
  margin-top: 28px;
  margin-left: auto;
  margin-right: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  height: 40px;
  width: 50px;
}

/* Hamburger Menu Bars */
.menu-toggle {
  display: none;
  cursor: pointer;
  z-index: 1001;
}

.bar1, .bar2, .bar3 {
  width: 25px;
  height: 3px;
  margin: 5px auto;
  background-color: #333;
  transition: 0.4s;
}

.bar1.active {
  transform: rotate(45deg) translate(5px, 5px);
}

.bar2.active {
  opacity: 0;
}

.bar3.active {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Nav menu items */
.nav-menu {
  display: flex;
  align-items: center;
  list-style: none;
  transition: all 0.5s ease;
}

.nav-item {
  height: 80px;
}

.nav-links {
  color: #333;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  transition: all 0.3s ease;
}

.nav-links:hover {
  color: #1BBC9B;
}

.nav-links.router-link-exact-active {
  color: #1BBC9B;
  border-bottom: 3px solid #1BBC9B;
}

/* Dark Theme */
.navbar.dark-theme {
  background-color: #1A1C2D;
}

.navbar.dark-theme .navbar-logo {
  color: #44d4c5;
}

.navbar.dark-theme .nav-links {
  color: #e0e0e0;
}

.navbar.dark-theme .nav-links:hover {
  color: #44d4c5;
}

.navbar.dark-theme .nav-links.router-link-exact-active {
  color: #44d4c5;
  border-bottom: 3px solid #44d4c5;
}

.navbar.dark-theme .bar1,
.navbar.dark-theme .bar2,
.navbar.dark-theme .bar3 {
  background-color: #e0e0e0;
}

.navbar.dark-theme .theme-toggle {
  background-color: #44D4C5;
  color: #1A1C2D;
}

/* Mobile */
@media screen and (max-width: 768px) {
  .theme-toggle {
    position: absolute;
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .menu-toggle {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-100%, 60%);
  }

  .nav-menu {
    position: fixed;
    left: -100%;
    top: 80px;
    width: 100%;
    height: calc(100vh - 80px);
    background-color: #fff;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    transition: all 0.5s ease;
    z-index: 1000;
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-item {
    width: 100%;
    padding: 20px 0;
  }

  .nav-links {
    text-align: center;
    padding: 2rem;
    width: 100%;
    display: block;
  }

  .nav-links:hover {
    background-color: #f5f5f5;
    color: #1BBC9B;
  }

  .nav-links.router-link-exact-active {
    background-color: #f5f5f5;
  }

  .navbar.dark-theme .nav-menu {
    background-color: #2E3047;
  }

  .navbar.dark-theme .nav-links:hover {
    background-color: #3a3d5a;
  }

  .navbar.dark-theme .nav-links.router-link-exact-active {
    background-color: #3a3d5a;
  }
}

.hamburger-icon-button {
  background-color: #34c3b5;  
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-left: 15px;
}

.hamburger-icon-button span {
  background: rgba(0, 0, 0, 0.1);
  height: 3px;
  width: 20px;
  margin: 2px 0;
  transition: 0.4s;
}

 .hamburger-icon-button span {
  background-color: rgba(255, 255, 255, 0.816); /* ✅ Visible in light mode */
  height: 3px;
  width: 20px;
  margin: 2px 0;
  transition: 0.4s;
}


.quick-actions-sidebar {
  position: fixed;
  top: 0;
  right: -320px;
  width: 300px;
  height: 100vh;
  color: white;
  padding: 20px;
  transition: right 0.3s ease-in-out;
  z-index: 2000;
  overflow-y: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
}

.quick-actions-sidebar.open {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  margin-bottom: 10px;
  text-align: center;
  color:#1BBC9B;
  background-color: #17a88b;
  width:300px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
}

.quick-actions-list {
  list-style: none;
  padding: 0;
}

.quick-actions-list li {
  display: flex;
  align-items: center;
  padding: 12px 0;
  font-size: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  background-color: white;
  color:#1BBC9B;
}

.quick-actions-list li svg {
  margin-right: 10px;
  font-size: 1.1rem;
}
.quick-actions-popup {
  position: fixed;
  top: 0;
  right: -350px;
  width: 280px;
  height: 100vh;
  background-color: #ffffff;
  color: #009688;
  /* padding: 20px; */
  transition: right 0.3s ease-in-out;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  overflow-y: auto;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.quick-actions-popup.open {
  right: 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: bold;
  /* margin-bottom: 20px; */
  background-color: #1BBC9B;
  height:100px;
}

.close-popup {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: white;
  cursor: pointer;
  padding-right: 50px;
  padding-top: 10px;
}

.popup-actions-list {
  list-style: none;
  padding: 0;
}

.popup-actions-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.904);
  cursor: pointer;
  transition: background-color 0.2s ease;
  height:55px;
  text-decoration: none;
  list-style-type: none;
}

.popup-actions-list li:hover {
  background-color: #f9f9f9;
  border-radius: 4px;
  text-decoration: none;
  margin: 0;
  padding-left: 0%;
}

.popup-actions-list li svg {
  font-size: 1.1rem;
  color:#1BBC9B;
}

.quick-actions-header {
  background-color: #17a88b; /* ✅ Use exact green shade from screenshot */
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  object-fit: fill;
  height:40px;
  
}

.quick-actions-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
}

.quick-actions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-decoration: none;
}

.quick-actions-list li {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: #17a88b;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  text-decoration: none;
  list-style-type: none;
}

.quick-actions-list li svg {
  margin-right: 10px;
}

.popup-actions-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.904);
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: 55px;
  list-style-type: none;
}

.popup-actions-list li a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: black;
  text-decoration: none;
  width: 100%;
  padding:20px;
}

.popup-actions-list li a:hover {
  text-decoration: none;
  border-right: 4px solid #1BBC9B;
}

.popup-header {
  background-color: #1BBC9B; /* ✅ Matches screenshot */
  color: white;
  height: 100px;
  /* padding: 1.5rem; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%; /* ✅ Make it full width */
  box-sizing: border-box;
}
.popup-header h3{
  width:100%;
  height:50px;
  background-color: #1BBC9B; /* ✅ Matches screenshot */
  padding-left: 30px;
  padding-top: 10px;
}
</style>