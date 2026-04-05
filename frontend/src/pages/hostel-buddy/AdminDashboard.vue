<template>
    <div class="admin-escalation-dashboard">
        <Navbar_admin />

        <div class="main-content">
            <div class="container">
                <!-- Header Section -->
                <div class="page-header">
                    <div>
                        <h1>Escalation Management</h1>
                        <p class="subtitle">Review and resolve student escalations</p>
                    </div>
                    <div class="header-actions">
                        <button @click="refreshData" class="refresh-btn" :disabled="loading">
                            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                            Refresh
                        </button>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="stats-grid">
                    <div class="stat-card total">
                        <div class="stat-info">
                            <h3>Total Escalations</h3>
                            <p class="stat-number">{{ stats.total }}</p>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>

                    <div class="stat-card pending">
                        <div class="stat-info">
                            <h3>Pending Issues</h3>
                            <p class="stat-number">{{ stats.pending }}</p>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>

                    <div class="stat-card resolved">
                        <div class="stat-info">
                            <h3>Resolved Issues</h3>
                            <p class="stat-number">{{ stats.resolved }}</p>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="filters-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" v-model="searchQuery" placeholder="Search by student name or description..."
                            class="search-input" />
                    </div>

                    <div class="filter-buttons">
                        <button v-for="filter in filters" :key="filter.value" @click="currentFilter = filter.value"
                            :class="['filter-btn', { active: currentFilter === filter.value }]">
                            {{ filter.label }}
                        </button>
                    </div>
                </div>

                <!-- Escalation Table -->
                <div class="table-container">
                    <div v-if="loading" class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading escalations...</p>
                    </div>

                    <div v-else-if="filteredEscalations.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>No Escalations Found</h3>
                        <p>There are no escalations matching your criteria.</p>
                    </div>

                    <div v-else class="table-responsive">
                        <table class="escalation-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="escalation in paginatedEscalations" :key="escalation._id">
                                    <td data-label="Student Name">
                                        <span class="student-name">
                                            {{ escalation.isAnonymous ? 'Anonymous' : escalation.studentName }}
                                        </span>
                                    </td>
                                    <td data-label="Category">
                                        <span class="category-badge">{{ escalation.category }}</span>
                                    </td>
                                    <td data-label="Description">
                                        <div class="description-preview">
                                            {{ truncateText(escalation.description, 60) }}
                                        </div>
                                    </td>
                                    <td data-label="Date">
                                        {{ formatDate(escalation.createdAt) }}
                                    </td>
                                    <td data-label="Status">
                                        <span :class="['status-badge', (escalation.status || 'Pending').toLowerCase()]">
                                            {{ escalation.status }}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div class="action-buttons">
                                            <button v-if="escalation.status === 'Pending'"
                                                @click="markAsResolved(escalation)" class="action-btn resolve"
                                                title="Mark as Resolved">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button @click="viewDetails(escalation)" class="action-btn view"
                                                title="View Details">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div v-if="filteredEscalations.length > 0" class="pagination">
                        <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="page-info">
                            Page {{ currentPage }} of {{ totalPages }}
                        </span>
                        <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- View Details Modal -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>Escalation Details</h2>
                    <button class="close-btn" @click="closeModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <label>Student:</label>
                        <span>{{ selectedEscalation.isAnonymous ? 'Anonymous' : selectedEscalation.studentName }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Category:</label>
                        <span>{{ selectedEscalation.category }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Date:</label>
                        <span>{{ formatDate(selectedEscalation.createdAt) }}</span>
                    </div>
                    <div class="detail-row">
                        <label>Status:</label>
                        <span :class="['status-badge', selectedEscalation.status.toLowerCase()]">
                            {{ selectedEscalation.status }}
                        </span>
                    </div>
                    <div class="detail-row full-width">
                        <label>Description:</label>
                        <p class="description-full">{{ selectedEscalation.description }}</p>
                    </div>
                    <div v-if="selectedEscalation.attachment" class="detail-row full-width">
                        <label>Attachment:</label>
                        <a :href="selectedEscalation.attachment" target="_blank" class="image-link">
                            <i class="fas fa-image"></i> View Image
                        </a>
                    </div>
                </div>
                <div class="modal-footer">
                    <button v-if="selectedEscalation.status === 'Pending'" @click="markAsResolved(selectedEscalation)"
                        class="resolve-modal-btn">
                        <i class="fas fa-check"></i> Mark as Resolved
                    </button>
                    <button @click="closeModal" class="close-modal-btn">Close</button>
                </div>
            </div>
        </div>

        <Footer />
    </div>
</template>

<script>
import axios from 'axios';
// import Navbar_admin from '@/components/Navbar_admin.vue';
import Footer from '@/components/Footer.vue';
import { API_URL } from '@/config';

export default {
    name: 'AdminEscalationDashboard',
    components: {
        Navbar_admin,
        Footer
    },
    data() {
        return {
            escalations: [],
            loading: false,
            searchQuery: '',
            currentFilter: 'all',
            currentPage: 1,
            itemsPerPage: 10,
            showModal: false,
            selectedEscalation: null,
            filters: [
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Resolved', value: 'Resolved' }
            ]
        };
    },
    computed: {
        stats() {
            const total = this.escalations.length;
            const pending = this.escalations.filter(e => e.status === 'Pending').length;
            const resolved = this.escalations.filter(e => e.status === 'Resolved').length;
            return { total, pending, resolved };
        },
        filteredEscalations() {
            let filtered = this.escalations;

            // Apply status filter
            if (this.currentFilter !== 'all') {
                filtered = filtered.filter(e => e.status === this.currentFilter);
            }

            // Apply search filter
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(e => {
                    const name = e.isAnonymous ? 'anonymous' : (e.studentName || '').toLowerCase();
                    const description = (e.description || '').toLowerCase();
                    const category = (e.category || '').toLowerCase();
                    return name.includes(query) || description.includes(query) || category.includes(query);
                });
            }

            return filtered;
        },
        totalPages() {
            return Math.ceil(this.filteredEscalations.length / this.itemsPerPage);
        },
        paginatedEscalations() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredEscalations.slice(start, end);
        }
    },
    watch: {
        searchQuery() {
            this.currentPage = 1;
        },
        currentFilter() {
            this.currentPage = 1;
        }
    },
    mounted() {
        this.fetchEscalations();
    },
    methods: {
        async fetchEscalations() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/v1/escalations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.escalations = response.data?.data || response.data || [];
            } catch (error) {
                console.error('Error fetching escalations:', error);
                alert('Failed to load escalations. Please try again.');
            } finally {
                this.loading = false;
            }
        },
        async markAsResolved(escalation) {
            if (!confirm(`Mark this escalation as resolved?`)) return;

            try {
                const token = localStorage.getItem('token');
                await axios.put(
                    `${API_URL}/api/v1/escalations/${escalation._id}`,
                    { status: 'Resolved' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Update local data
                await this.fetchEscalations(); 
                escalation.status = 'Resolved';

                alert('Escalation marked as resolved!');

                if (this.showModal) this.closeModal();
            } catch (error) {
                console.error('Error updating escalation:', error);
                alert('Failed to update status. Please try again.');
            }
        },
        viewDetails(escalation) {
            this.selectedEscalation = escalation;
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.selectedEscalation = null;
        },
        async refreshData() {
            await this.fetchEscalations();
        },
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        truncateText(text, length) {
            if (!text) return '';
            return text.length > length ? text.substring(0, length) + '...' : text;
        }
    }
};
</script>

<style scoped>
.admin-escalation-dashboard {
    min-height: 100vh;
    background-color: #f5f7fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-content {
    padding: 30px 0;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
}

.page-header h1 {
    margin: 0;
    color: #1BBC9B;
    font-size: 2rem;
}

.subtitle {
    color: #666;
    margin: 5px 0 0;
}

.refresh-btn {
    background: #1BBC9B;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
    background: #16a085;
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Stats Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-info h3 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
}

.stat-card.total .stat-number {
    color: #1BBC9B;
}

.stat-card.pending .stat-number {
    color: #f39c12;
}

.stat-card.resolved .stat-number {
    color: #27ae60;
}

.stat-icon {
    width: 50px;
    height: 50px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-card.total .stat-icon {
    color: #1BBC9B;
}

.stat-card.pending .stat-icon {
    color: #f39c12;
}

.stat-card.resolved .stat-icon {
    color: #27ae60;
}

/* Filters */
.filters-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 25px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-box {
    flex: 1;
    max-width: 350px;
    position: relative;
}

.search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.search-input {
    width: 100%;
    padding: 10px 10px 10px 35px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #1BBC9B;
}

.filter-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    border-color: #1BBC9B;
    color: #1BBC9B;
}

.filter-btn.active {
    background: #1BBC9B;
    color: white;
    border-color: #1BBC9B;
}

/* Table */
.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.table-responsive {
    overflow-x: auto;
}

.escalation-table {
    width: 100%;
    border-collapse: collapse;
}

.escalation-table thead {
    background: #f8f9fa;
}

.escalation-table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #555;
    border-bottom: 2px solid #eee;
}

.escalation-table td {
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
}

.escalation-table tr:hover {
    background: #fafafa;
}

.student-name {
    font-weight: 500;
    color: #333;
}

.category-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #f0f0f0;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.description-preview {
    max-width: 300px;
    color: #666;
    font-size: 0.85rem;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.pending {
    background: #fff3e0;
    color: #e65100;
}

.status-badge.resolved {
    background: #e8f5e9;
    color: #2e7d32;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn.resolve {
    background: #e8f5e9;
    color: #2e7d32;
}

.action-btn.resolve:hover {
    background: #2e7d32;
    color: white;
}

.action-btn.view {
    background: #e3f2fd;
    color: #1976d2;
}

.action-btn.view:hover {
    background: #1976d2;
    color: white;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border-top: 1px solid #eee;
}

.page-btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #1BBC9B;
    color: white;
    border-color: #1BBC9B;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    color: #666;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.loading-state i,
.empty-state i {
    font-size: 3rem;
    color: #ccc;
    margin-bottom: 15px;
}

.empty-state h3 {
    margin: 0 0 5px;
    color: #666;
}

.empty-state p {
    color: #999;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h2 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
}

.modal-body {
    padding: 20px;
}

.detail-row {
    display: flex;
    margin-bottom: 15px;
}

.detail-row label {
    font-weight: 600;
    width: 100px;
    color: #555;
}

.detail-row span {
    color: #333;
}

.detail-row.full-width {
    flex-direction: column;
}

.detail-row.full-width label {
    width: auto;
    margin-bottom: 5px;
}

.description-full {
    margin: 0;
    line-height: 1.5;
    color: #666;
}

.image-link {
    color: #1BBC9B;
    text-decoration: none;
}

.image-link:hover {
    text-decoration: underline;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.resolve-modal-btn {
    background: #1BBC9B;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}

.close-modal-btn {
    background: #e0e0e0;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .filters-section {
        flex-direction: column;
    }

    .search-box {
        max-width: 100%;
    }

    .filter-buttons {
        width: 100%;
        justify-content: center;
    }

    .escalation-table thead {
        display: none;
    }

    .escalation-table tbody tr {
        display: block;
        margin-bottom: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
    }

    .escalation-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #f0f0f0;
    }

    .escalation-table tbody td:before {
        content: attr(data-label);
        font-weight: 600;
        color: #555;
    }

    .action-buttons {
        justify-content: flex-end;
    }

    .modal-content {
        width: 95%;
        margin: 20px;
    }

    .detail-row {
        flex-direction: column;
    }

    .detail-row label {
        width: auto;
        margin-bottom: 5px;
    }
}
</style>