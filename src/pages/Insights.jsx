import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import './insights.css';
import Navbar from "../components/Navbar";
import { useAuth } from "../components/AuthProvider";
import {FaLightbulb} from "react-icons/fa"

ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
);


const Insights = () => {

    const {getUserId} = useAuth();
    const userID = getUserId();
    const API_URL = "https://barnes.onrender.com/";

    const [fullExpenses, setFullExpenses] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [fullIncomes, setFullIncomes] = useState([]);
    const [from, setFrom] = useState("from");
    const [to, setTo] = useState("to");
    const [change, setChange] = useState('');
    const [categories, setCategories] = useState([]);
    const [fetchedCategories, setFetchedCategories] = useState([]);
    const [labels, setLabels] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetch('https://barnes.onrender.com/expenses')
            .then(response => response.json())
            .then(data => {
                let sortedExpenses = data.expenses.filter(expense => expense.user_id === 6);
                setFullExpenses(sortedExpenses);
                let list = combineAmountByDate(sortedExpenses);
                setExpenses(list);

                let c = sortByCategories(sortedExpenses, fetchedCategories);
                setCategories(c);
            })
            .catch(error => console.log(error));
            console.log(categories);

            //http://localhost:3000/
        fetch('https://barnes.onrender.com/incomes')
            .then(response => response.json())
            .then(data => {
                let sortedIncomes = data.incomes.filter(income => income.user_id === 6);
                setFullIncomes(sortedIncomes);
                let list = combineAmountByDate(sortedIncomes);
                setIncomes(list);
            })
            .catch(error => console.log(error));
    }, [change]);

    useEffect(() => {
        filterByDate();
    }, [from, to]);

    useEffect(()=>{
        fetch('https://barnes.onrender.com/categories')
        .then(response => response.json())
        .then (d => {
            setCategories(d.categories);
            setFetchedCategories(d.categories);
        })},[change]
    );

    const combineAmountByDate = (amounts) => {
        amounts.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const combined = [];
        let currentDate = null;
        let currentAmount = 0;

        const dateLabels = [];

        for (const amount of amounts) {
            if (amount.date === currentDate) {
                currentAmount += parseInt(amount.amount);
            } else {
                if (currentDate !== null) {
                    combined.push(currentAmount);
                    dateLabels.push(currentDate);
                }
                currentDate = amount.date;
                currentAmount = parseInt(amount.amount);
            }
        }
        if (currentDate !== null) {
            combined.push(currentAmount);
            dateLabels.push(currentDate);
        }

        setLabels(dateLabels);
        return combined;
    };

    const filterByDate = () => {
        let filteredExpenses = fullExpenses.filter(expense => new Date(expense.date) >= new Date(from) && new Date(expense.date) <= new Date(to));
        let filteredIncomes = fullIncomes.filter(income => new Date(income.date) >= new Date(from) && new Date(income.date) <= new Date(to));
        
        if (filteredIncomes && filteredExpenses) {
            setExpenses(combineAmountByDate(filteredExpenses));
            setIncomes(combineAmountByDate(filteredIncomes));
        }
    };

    const sortByCategories = (data, categories) => {
        let categoriesList = [];
      
       
        let categoryTotals = {};
        categories.forEach(category => {
          categoryTotals[category.name.toLowerCase()] = 0;
        });
      
        
        for (let expense of data) {
          
          const matchingCategory = categories.find(category => category.id === expense.category_id);
      
          if (matchingCategory) {
            
            categoryTotals[matchingCategory.name.toLowerCase()] += parseInt(expense.amount);
          }
        }
      
        
        const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
      
        
        categories.forEach(category => {
          const amount = categoryTotals[category.name.toLowerCase()];
          if (amount > 0) { 
            const percentage = totalAmount ? Math.round((amount / totalAmount) * 100) : 0;
            const categoryExists = categoriesList.some(cat => cat.category === category.name.toLowerCase());
      
            if (!categoryExists) {
              categoriesList.push({
                name: category.name,
                id: category.id,
                amount: amount,
                percentage: percentage,
                category: category.name.toLowerCase(),
              });
            }
          }
        });
      
        setTotalAmount(totalAmount); 
      
        return categoriesList;
      };
      
      
    return (
        <div className="Insights" style={{ backgroundColor: 'black' }}>
            <button onClick={() => setChange(prev => prev + 1)}>Press</button>
            <Header />
            <DateFilter setTo={setTo} setFrom={setFrom} From={from} To={to} />
            <TotalExpense amount={totalAmount} />
            <div style={{ background: 'white', padding:'4px' }}>
                <InsightsChart expenses={expenses} incomes={incomes} labels={labels} />
                <ExpenseCategoryList categories={categories} />
            </div>
            <Navbar />
        </div>
    );
};



const ExpenseCategoryList = ({ categories }) => {
    console.log(categories);
    const [visibleCategories, setVisibleCategories] = useState(categories);

    useEffect(() => {
        setVisibleCategories(categories);
    }, [categories]);

    return (
        <div className='expense-category-container' style={{ backgroundColor: '#D1D1D1', padding: '0', margin: '0', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#423E3E', fontSize: '15px', marginRight: 'auto' }}>Expense categories</p>
                <Dropdown categories={categories} setVisibleCategories={setVisibleCategories} />
            </div>
            <div className="expense-category-list">
                {visibleCategories.map((category, index) => (
                    <ExpenseCategoryItem key={index} category={category} />
                ))}
            </div>
        </div>
    );
};

const Dropdown = ({ categories, setVisibleCategories }) => {

    const [value, setValue] = useState("All")

    useEffect(() => {
        fetch('https://barnes.onrender.com/expenses')
        .then(res => res.json())
        .then((data)=>{
            
            if(value === "All"){
                setVisibleCategories(categories);
            } else {
                const filteredCategories = data.expenses.filter(transaction => (transaction.category_id === parseInt(value)) && (transaction.user_id === 6));
                console.log(filteredCategories);
                setVisibleCategories(filteredCategories);
            }

        })
        .catch(err => console.error(err));
    }, [value]
    );

    const filterCategories = (event) => {
        const selectedCategory = event.target.value;
        if (selectedCategory === "All") {
            setValue("All"); 
        } else {
            setValue(event.target.value);
        }
    };
    console.log(value);

    return (
        <select className="dropdown" onChange={filterCategories} style={{ backgroundColor: '#D1D1D1', color: '#423E3E', fontSize: '15px' }}>
            <option value="All">All</option>
            {categories.map((category, index) => (
                <option key={index} value={category.id}>{category.name}</option>
            ))}
        </select>
    );
};

const DateFilter = ({ setTo, setFrom, from, to }) => {
    return (
        <div className="expense-filter" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ marginRight: 'auto' }}>
                <label>From</label>
                <input type="date" style={{ width: '120px' }} value={from} onChange={(event) => { setFrom(event.target.value), console.log(event.target.value) }} />
            </div>
            <div>
                <label>To</label>
                <input type="date" style={{ width: '120px' }} value={to} onChange={(event) => { setTo(event.target.value), console.log(event.target.value) }} />
            </div>
        </div>
    );
};

const InsightsChart = ({ expenses, incomes, labels }) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Expenses',
                data: expenses,
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                tension: 0.4,
            },
            {
                label: 'Income Over Time',
                data: incomes,
                fill: true,
                backgroundColor: 'rgba(0, 128, 0, 0.2)',
                borderColor: 'rgba(0, 128, 0, 1)',
                borderWidth: 1,
                tension: 0.4,
            }
        ]
    };

    const options = {
        scales: {
            x: {
                type: 'category',
                display: true,
            },
            y: {
                beginAtZero: true
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className={expenses.length>10? 'chart-container': null}>
            <div className={expenses.length>10? 'chart-container': 'expense-chart'}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
};


const Header = () => {
    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', margin: '10px', backgroundColor: 'black' }} className="navbar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6" width='20px' display='flex' justifyContent='space-between'>
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M480-40q-112 0-206-51T120-227v107H40v-240h240v80h-99q48 72 126.5 116T480-120q75 0 140.5-28.5t114-77q48.5-48.5 77-114T840-480h80q0 91-34.5 171T791-169q-60 60-140 94.5T480-40Zm-36-160v-52q-47-11-76.5-40.5T324-370l66-26q12 41 37.5 61.5T486-314q33 0 56.5-15.5T566-378q0-29-24.5-47T454-466q-59-21-86.5-50T340-592q0-41 28.5-74.5T446-710v-50h70v50q36 3 65.5 29t40.5 61l-64 26q-8-23-26-38.5T482-648q-35 0-53.5 15T410-592q0 26 23 41t83 35q72 26 96 61t24 77q0 29-10 51t-26.5 37.5Q583-274 561-264.5T514-250v50h-70ZM40-480q0-91 34.5-171T169-791q60-60 140-94.5T480-920q112 0 206 51t154 136v-107h80v240H680v-80h99q-48-72-126.5-116T480-840q-75 0-140.5 28.5t-114 77q-48.5 48.5-77 114T120-480H40Z" />
            </svg>
        </nav>
    );
};



const TotalExpense = ({ amount }) => {
    return (
        <div className="total-expense">
            <h2>Total expense</h2>
            <p>Ksh {amount}</p>
        </div>
    );
};






const ExpenseCategoryItem = ({ category }) => {


    return (
        <div className="expense-category-item" style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px',
            borderStyle: 'solid', borderRadius: '10px', borderWidth: '1px',
            backgroundColor: '#242424', width: '100%', height: '300',
        }}>
            {/* <p style={{ margin: '0' }}>{category.icon ? category.icon : category.id}</p> */}
            <p style={{ margin: '0' }}>{category.name? category.name : category.description}</p>
            <p style={{ margin: '0' }}>{category.amount}</p>
            <p style={{ margin: '0' }}>{category.percentage? `${category.percentage}%` : '0%'}</p>
        </div>
    );
};

export default Insights;