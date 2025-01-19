document.addEventListener('DOMContentLoaded', () => {
    // Token refresh utility function
    async function refreshAccessToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
            // If no refresh token, force user to log in again
            window.location.href = 'index.html';
            return null;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/accounts/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                // Update access token in local storage
                localStorage.setItem('access_token', data.access);
                return data.access;
            } else {
                // If refresh fails, force user to log in again
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = 'index.html';
                return null;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = 'index.html';
            return null;
        }
    }

    // Wrapper function for authenticated fetch with automatic token refresh
    async function authenticatedFetch(url, options = {}) {
        let token = localStorage.getItem('access_token');
        
        // Prepare the fetch options
        const fetchOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const response = await fetch(url, fetchOptions);

            // If unauthorized (likely expired token), try to refresh
            if (response.status === 401) {
                const newToken = await refreshAccessToken();
                
                if (newToken) {
                    // Retry the original request with new token
                    fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
                    return fetch(url, fetchOptions);
                }
            }

            return response;
        } catch (error) {
            console.error('Authenticated fetch error:', error);
            throw error;
        }
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
    }

    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const filterBtn = document.getElementById('filterBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let editingExpenseId = null;

    // Helper function to calculate date
    function calculateDateRange(period) {
        const today = new Date();
        let startDate = new Date();

        switch(period) {
            case '3days':
                startDate.setDate(today.getDate() - 3);
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            default:
                return { startDate: null, endDate: null };
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };
    }

    // Fetch and display expenses
    async function fetchExpenses(category = '', startDate = '', endDate = '') {
        try {
            const url = new URL('http://127.0.0.1:8000/api/expenses/user/');
            if (category) url.searchParams.append('category', category);
            if (startDate) url.searchParams.append('start_date', startDate);
            if (endDate) url.searchParams.append('end_date', endDate);

            const response = await authenticatedFetch(url.toString());

            if (response.ok) {
                const expenses = await response.json();
                
                // Calculate total expenses
                const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
                
                expenseList.innerHTML = expenses.map(expense => `
                    <tr data-id="${expense.id}">
                        <td>${expense.title}</td>
                        <td>${expense.category}</td>
                        <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                        <td>${expense.date}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-expense" data-id="${expense.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-expense" data-id="${expense.id}">Delete</button>
                        </td>
                    </tr>
                `).join('');

                // Add total expenses row
                expenseList.innerHTML += `
                    <tr class="table-active">
                        <td colspan="2"><strong>Total Expenses</strong></td>
                        <td colspan="3"><strong>$${totalExpenses.toFixed(2)}</strong></td>
                    </tr>
                `;

                // Add event listeners for edit and delete buttons
                document.querySelectorAll('.edit-expense').forEach(button => {
                    button.addEventListener('click', handleEditExpense);
                });

                document.querySelectorAll('.delete-expense').forEach(button => {
                    button.addEventListener('click', handleDeleteExpense);
                });
            } else {
                const errorData = await response.text();
                alert(`Fetch expenses failed: ${errorData}`);
            }
        } catch (error) {
            console.error('Fetch expenses error:', error);
            alert('An error occurred while fetching expenses.');
        }
    }

    // Handle Edit Expense
    async function handleEditExpense(event) {
        const expenseId = event.target.getAttribute('data-id');
        editingExpenseId = expenseId;

        try {
            const response = await authenticatedFetch(`http://127.0.0.1:8000/api/expenses/user/${expenseId}/`);

            if (response.ok) {
                const expense = await response.json();
                
                // Populate form with expense details
                document.getElementById('expenseTitle').value = expense.title;
                document.getElementById('expenseCategory').value = expense.category;
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expenseDate').value = expense.date;

                // Change form submit button text
                const submitButton = expenseForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Update Expense';
            } else {
                const errorData = await response.text();
                alert(`Fetch expense details failed: ${errorData}`);
            }
        } catch (error) {
            console.error('Edit expense error:', error);
            alert('An error occurred while editing the expense.');
        }
    }

    // Handle Delete Expense
    async function handleDeleteExpense(event) {
        const expenseId = event.target.getAttribute('data-id');

        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        try {
            const response = await authenticatedFetch(`http://127.0.0.1:8000/api/expenses/user/${expenseId}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove the expense row from the table
                const expenseRow = document.querySelector(`tr[data-id="${expenseId}"]`);
                if (expenseRow) {
                    expenseRow.remove();
                }
                
                // Refresh the expenses to recalculate total
                fetchExpenses();
            } else {
                const errorData = await response.text();
                alert(`Delete expense failed: ${errorData}`);
            }
        } catch (error) {
            console.error('Delete expense error:', error);
            alert('An error occurred while deleting the expense.');
        }
    }

    // Add/Update Expense
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('expenseTitle').value;
        const category = document.getElementById('expenseCategory').value;
        const amount = document.getElementById('expenseAmount').value;
        const date = document.getElementById('expenseDate').value;

        try {
            let response;
            let method = 'POST';
            let url = 'http://127.0.0.1:8000/api/expenses/user/';

            // If editing an existing expense, use PATCH method
            if (editingExpenseId) {
                method = 'PATCH';
                url += `${editingExpenseId}/`;
            }

            response = await authenticatedFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, category, amount, date })
            });

            if (response.ok) {
                fetchExpenses();
                expenseForm.reset();
                
                // Reset edit mode
                editingExpenseId = null;
                const submitButton = expenseForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Add Expense';
            } else {
                const errorData = await response.text();
                alert(`${editingExpenseId ? 'Update' : 'Add'} expense failed: ${errorData}`);
            }
        } catch (error) {
            console.error(`${editingExpenseId ? 'Update' : 'Add'} expense error:`, error);
            alert(`An error occurred while ${editingExpenseId ? 'updating' : 'adding'} the expense.`);
        }
    });

    // Filter expenses
    filterBtn.addEventListener('click', () => {
        const category = document.getElementById('filterCategory').value;
        const period = document.getElementById('filterPeriod').value;
        const manualStartDate = document.getElementById('startDate').value;
        const manualEndDate = document.getElementById('endDate').value;

        // Prioritize manual dates if provided
        let startDate = manualStartDate;
        let endDate = manualEndDate;

        // If no manual dates, use period-based dates
        if (!startDate && period) {
            const periodDates = calculateDateRange(period);
            startDate = periodDates.startDate;
            endDate = periodDates.endDate;
        }

        fetchExpenses(category, startDate, endDate);
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/accounts/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (response.ok) {
                // Clear tokens from local storage
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                
                // Redirect to login page
                window.location.href = 'index.html';
            } else {
                const errorData = await response.json();
                alert(`Logout failed: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout.');
            
            // Fallback logout (in case of network error)
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = 'index.html';
        }
    }); 

    // Initial load
    fetchExpenses();
});