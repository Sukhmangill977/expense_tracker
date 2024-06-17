document.addEventListener('DOMContentLoaded', function () {
    // Initialize Flatpickr for date input
    flatpickr('#expense-date', {
        dateFormat: 'Y-m-d'
    });

    const ctx = document.getElementById('myChart').getContext('2d');
    let myChart = null; // Initialize chart variable

    // Function to create or update Chart
    function createOrUpdateChart(labels, data) {
        if (!myChart) {
            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Expenses',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            myChart.data.labels = labels;
            myChart.data.datasets[0].data = data;
            myChart.update();
        }
    }

    // Function to fetch and display expenses
    async function fetchExpenses() {
        try {
            const response = await fetch('/expenses');
            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }
            const expenses = await response.json();
            displayExpenses(expenses);
            updateChart(expenses);
        } catch (error) {
            console.error('Error fetching expenses:', error.message);
        }
    }

    // Function to display expenses in the UI
    function displayExpenses(expenses) {
        const expensesList = document.getElementById('expenses');
        expensesList.innerHTML = '';

        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.textContent = `${expense.name} - $${expense.amount} - ${expense.date}`;

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                // Populate form fields with the selected expense data for editing
                document.getElementById('expense-name').value = expense.name;
                document.getElementById('expense-amount').value = expense.amount;
                document.getElementById('expense-date').value = expense.date;
                document.getElementById('expense-id').value = expense._id; // Store expense ID
            });
            li.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', async () => {
                try {
                    const deleteResponse = await fetch(`/expenses/${expense._id}`, {
                        method: 'DELETE'
                    });
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete expense');
                    }
                    // Refresh the expense list after deletion
                    fetchExpenses();
                } catch (error) {
                    console.error('Error deleting expense:', error.message);
                }
            });
            li.appendChild(deleteBtn);

            expensesList.appendChild(li);
        });
    }

    // Event listener for expense form submission (add or edit)
    document.getElementById('expense-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('expense-name').value;
        const amount = document.getElementById('expense-amount').value;
        const date = document.getElementById('expense-date').value;
        const expenseId = document.getElementById('expense-id').value; // Retrieve expense ID if editing

        try {
            let url = '/expenses';
            let method = 'POST';

            // Determine if it's an edit or add operation
            if (expenseId) {
                url += `/${expenseId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, amount, date })
            });

            if (!response.ok) {
                throw new Error('Failed to save expense');
            }

            // Clear form fields after successful submission
            document.getElementById('expense-name').value = '';
            document.getElementById('expense-amount').value = '';
            document.getElementById('expense-date').value = '';
            document.getElementById('expense-id').value = ''; // Reset expense ID after submit

            // Refresh expenses and update chart
            fetchExpenses();
        } catch (error) {
            console.error('Error saving expense:', error.message);
        }
    });

    // Function to update Chart with fetched expenses
    function updateChart(expenses) {
        const labels = expenses.map(expense => expense.name);
        const data = expenses.map(expense => expense.amount);

        createOrUpdateChart(labels, data);
    }

    // Initial fetch and display of expenses
    fetchExpenses();
});
