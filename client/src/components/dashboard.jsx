import { useState } from "react";
import react from "react";
import axios from "axios";
import { useEffect } from "react";


export const Dashboard =  () => {
    // call for getting all the users except self 
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const fetchusers = async () => {
        try {
            const token = localStorage.getItem("token"); 
            const response  = await axios.get("http://localhost:5000/api/users/all", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data.allusers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }
    fetchusers();
    }, []); 
    // call for getting my profile 
    const [profile, setProfile] = useState({});
    useEffect(() => {
        const fetchprofile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfile(response.data.info);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        }
        fetchprofile();
    }, []);

    // call for getting the transaction history 
    const [transactions, setTransactions] = useState([]);
    const fetchtransactions = async () => {
        try { 
            const token = localStorage.getItem("token") ;
            const response  = await axios.post("http://localhost:5000/api/users/history", {}, {
                headers: {
                    Authorization: `Bearer ${token}` 

                }
            });
            setTransactions(response.data.history);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }
    useEffect(() => {
        fetchtransactions();
    }, []);

    // handling form submission for sending money 
    const handleformsubmit = async (e) => {
        e.preventDefault(); 
        const receiveremail = e.target[0].value; 
        const amount = e.target[1].value;
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/api/users/transact", {
                receiveremail,
                amount
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Transaction successful:", response.data);
        } catch (error) {
            console.error("Error sending money:", error);
        }
    };

    return (
  <div className="h-screen w-screen bg-gray-100 p-6">
    <div className="grid grid-cols-12 gap-6 h-full">

      {/* LEFT PANEL */}
      <div className="col-span-3 bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-lg text-gray-900">Balance</h3>
        <p className="text-2xl font-bold mt-2 text-indigo-600">
          ₹ {profile.balance ?? 0}
        </p>

        <h4 className="font-semibold mt-6 text-gray-900">Transactions</h4>

        <div className="mt-3 space-y-2">
          {transactions.length === 0 && (
            <p className="text-sm text-gray-500">No transactions yet</p>
          )}

          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="text-sm flex justify-between text-gray-700"
            >
              <span className="truncate">{tx.receiverid}</span>
              <span className="font-medium">₹{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="col-span-6 bg-white rounded-xl p-5 shadow-sm overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Users</h3>

        {users.length === 0 && (
          <p className="text-sm text-gray-500">No users found</p>
        )}

        {users.map((u) => (
          <div
            key={u._id}
            className="border-b py-3 last:border-none"
          >
            <p className="font-medium text-gray-900">{u.name}</p>
            <p className="text-sm text-gray-600">{u.email}</p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-3 bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">
          Send Money
        </h3>

        <form onSubmit={handleformsubmit}>
            <input
          placeholder="Receiver Email"
          className="w-full border border-gray-300 p-2 rounded mb-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          placeholder="Amount"
          className="w-full border border-gray-300 p-2 rounded mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded font-medium">
          Pay
        </button>
        </form>
      </div>

    </div>
  </div>
);

};