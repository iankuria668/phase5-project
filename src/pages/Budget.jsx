import React, { useState, useEffect } from "react";
import SetGoalPopup from "../components/SetGoalPopup";
import AddLoan from "../components/AddLoan";
import AddLimit from "../components/AddLimit";
import ProgressBar from "../components/ProgressBar";
import UpdateAmountPopup from "../components/UpdateAmountPopup";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/Navbar";
import DebtManagement from "../components/DebtManagement";
import SavingsGoals from "../components/SavingsGoals";

function Budget() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(null);
  const [updateType, setUpdateType] = useState(null);
  const [updateLabel, setUpdateLabel] = useState('');

  const [goals, setGoals] = useState([]);
  const [loans, setLoans] = useState([]);
  const [limits, setLimits] = useState([]);

  const {getUserId} = useAuth();
  const userID = getUserId();

  // Fetch savings
  useEffect(() => {
    fetch("https://barnes.onrender.com/savings")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        let goalFilter = data.savings_goals.filter(goal => goal.user_id === userID);
        setGoals(goalFilter);
        console.log(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []);
  console.log(goals);

  // Persist changes to savings goals
  useEffect(() => {
    if (goals.length > 0) {
      const updatedGoal = goals[updateIndex];
      if (updatedGoal) {
        const { id, current_amount } = updatedGoal;
        fetch(`https://barnes.onrender.com/savings/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ current_amount }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to update savings goal');
            }
            return response.json();
          })
          .then(data => {
            console.log('Goal updated successfully:', data);
          })
          .catch(error => {
            console.error('Error updating goal:', error);
          });
      }
    }
  }, [goals]);

  // Fetch debts
  useEffect(() => {
    fetch("https://barnes.onrender.com/debts")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const loanFilter = data.debts.filter(loan => loan.user_id === userID);
        setLoans(loanFilter);
        console.log(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []);

  console.log(loans);

  // Persist changes to loans
  useEffect(() => {
    if (loans.length > 0) {
      const updatedLoan = loans[updateIndex];
      if (updatedLoan) {
        const { id, principal_amount } = updatedLoan;
        fetch(`https://barnes.onrender.com/debts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ principal_amount }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to update loan');
            }
            return response.json();
          })
          .then(data => {
            console.log('Loan updated successfully:', data);
          })
          .catch(error => {
            console.error('Error updating loan:', error);
          });
      }
    }
  }, [loans]);
  console.log(loans);

  // Persist changes to limits
  useEffect(() => {
    if (limits.length > 0) {
      const updatedLimit = limits[updateIndex];
      if (updatedLimit) {
        const { id, current_amount } = updatedLimit;
        fetch(`https://barnes.onrender.com/limits/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ current_amount }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to update limit');
            }
            return response.json();
          })
          .then(data => {
            console.log('Limit updated successfully:', data);
          })
          .catch(error => {
            console.error('Error updating limit:', error);
          });
      }
    }
  }, [limits]);

  const handleSaveGoal = async (newGoal) => {
    console.log('Saving goal:', newGoal);

    try {
      const response = await fetch('https://barnes.onrender.com/savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setGoals(prevGoals => [...prevGoals, { ...newGoal, current_amount: 0 }]);
      setShowGoalModal(false);

    } catch (error) {
      console.error('Error saving new goal:', error);
    }
  };

  const handleSaveLoan = async (newLoan) => {
    console.log('Saving loan:', newLoan);
    console.log(JSON.stringify(newLoan));

    try {
      const response = await fetch('https://barnes.onrender.com/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLoan),
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setLoans(prevLoans => [...prevLoans, { ...newLoan, principal_amount: 0 }]);
      setShowLoanModal(false);

    } catch (error) {
      console.error('Error saving new loan:', error);
    }
  };

  const handleSaveLimit = async (newLimit) => {
    console.log('Saving limit:', newLimit);

    try {
      const response = await fetch('https://barnes.onrender.com/limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLimit),
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setLimits(prevLimits => [...prevLimits, { ...newLimit, current_amount: 0 }]);
      setShowLimitModal(false);

    } catch (error) {
      console.error('Error saving new limit:', error);
    }
  };

  const handleUpdateAmount = (index, type, label) => {
    setUpdateIndex(index);
    setUpdateType(type);
    setUpdateLabel(label);
    setShowUpdateModal(true);
  };

  const updateAmount = (value) => {
    if (updateType === 'goal') {
      const updatedGoals = [...goals];
      let current = parseInt(updatedGoals[updateIndex].current_amount);
      current += parseInt(value);
      updatedGoals[updateIndex].current_amount = current;
      setGoals(updatedGoals);

    } else if (updateType === 'loan') {
      const updatedLoans = [...loans];
      let principal = parseInt(updatedLoans[updateIndex].remaining_balance);
      principal -= parseInt(value);
      updatedLoans[updateIndex].remaining_balance = principal;
      setLoans(updatedLoans);

    } else if (updateType === 'limit') {
      const updatedLimits = [...limits];
      updatedLimits[updateIndex].current_amount += parseInt(value);
      setLimits(updatedLimits);
    }
    setShowUpdateModal(false);
  };

  const handleDelete = async (index, type) => {
    let itemToDelete;
    let endpoint;

    if (type === 'goal') {
      itemToDelete = goals[index];
      endpoint = `https://barnes.onrender.com/savings/${itemToDelete.id}`;
    } else if (type === 'loan') {
      itemToDelete = loans[index];
      console.log(itemToDelete)
      endpoint = `https://barnes.onrender.com/debts/${itemToDelete.id}`;
    } else if (type === 'limit') {
      itemToDelete = limits[index];
      endpoint = `https://barnes.onrender.com/limits/${itemToDelete.id}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      // Update the state to remove the deleted item
      if (type === 'goal') {
        setGoals(goals.filter((_, i) => i !== index));
      } else if (type === 'loan') {
        setLoans(loans.filter((_, i) => i !== index));
      } else if (type === 'limit') {
        setLimits(limits.filter((_, i) => i !== index));
      }

      console.log(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className="rounded-b-xl p-4 text-white " style={{ backgroundColor: '#242424' }}>
      <div className="space-y-8">

      < SavingsGoals goals={goals} handleUpdateAmount={handleUpdateAmount} handleDelete={handleDelete} setShowGoalModal={setShowGoalModal} />
      < DebtManagement loans={loans} handleUpdateAmount={handleUpdateAmount} handleDelete={handleDelete} setShowLoanModal={setShowLoanModal} />
        {/* Limits */}
        <div className="p-4 rounded-lg bg-gray-500">
          <h2 className="text-xl font-bold mb-4 text-left">Limits</h2>
          <div className="space-y-4">
            {limits.map((l, index) => (
              <div key={index} className="flex justify-between items-center">
                <ProgressBar
                  key={index}
                  label={l.limit}
                  current_amount={l.current_amount}
                  target_amount={l.limitAmount}
                  type="limit"
                  onUpdate={() => handleUpdateAmount(index, 'limit', l.limit)}
                />
                <button
                  className="ml-4 bg-red-500 text-white p-2 rounded"
                  onClick={() => handleDelete(index, 'limit')}
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              className="flex items-center bg-gray-300 p-2 rounded-lg w-full justify-center text-gray-900 hover:text-black"
              onClick={() => setShowLimitModal(true)}
            >
              <span className="mr-2">+</span> Add Limit
            </button>
          </div>
        </div>
      </div>

      {showGoalModal && (
        <SetGoalPopup onClose={() => setShowGoalModal(false)} onSave={handleSaveGoal} userID={userID}/>
      )}
      {showLoanModal && (
        <AddLoan onClose={() => setShowLoanModal(false)} onSave={handleSaveLoan} userID={userID} />
      )}
      {showLimitModal && (
        <AddLimit onClose={() => setShowLimitModal(false)} onSave={handleSaveLimit} />
      )}
      {showUpdateModal && (
        <UpdateAmountPopup
          onClose={() => setShowUpdateModal(false)}
          onSave={updateAmount}
          label={updateLabel}
        />
      )}
      <Navbar />
    </div>
  );
}

export default Budget;
