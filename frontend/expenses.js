document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
    }

    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const filterBtn = document.getElementById('filterBtn');
    const logoutBtn = document.getElementById('logoutBtn');

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

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const expenses = await response.json();
                
                // Calculate total expenses
                const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
                
                expenseList.innerHTML = expenses.map(expense => `
                    <tr>
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
            } else {
                const errorData = await response.text();
                alert(`Fetch expenses failed: ${errorData}`);
            }
        } catch (error) {
            console.error('Fetch expenses error:', error);
            alert('An error occurred while fetching expenses.');
        }
    }

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

    // Rest of the code remains the same...

    // Initial load
    fetchExpenses();
});