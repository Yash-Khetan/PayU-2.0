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
                const response = await axios.get("http://localhost:5000/api/users/myprofile", {
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

      return (
    <div className="h-screen w-screen bg-gray-100 p-6">
      <div className="grid grid-cols-12 gap-6 h-full">

        {/* LEFT PANEL */}
        <div className="col-span-3 bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold text-lg">Balance</h3>
          <p className="text-2xl font-bold mt-2">₹ {profile.balance}</p>

          <h4 className="font-semibold mt-6">Transactions</h4>
          <div className="mt-2 space-y-2">
            {transactions.map((tx) => (
              <div key={tx._id} className="text-sm flex justify-between">
                <span>{tx.receiverid}</span>
                <span>₹{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="col-span-6 bg-white rounded-xl p-4 shadow overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">Users</h3>
          {users.map((u) => (
            <div key={u._id} className="border-b py-2">
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-3 bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold text-lg mb-4">Send Money</h3>

          <input
            placeholder="Receiver Email"
            className="w-full border p-2 rounded mb-3"
          />
          <input
            placeholder="Amount"
            className="w-full border p-2 rounded mb-3"
          />
          <button className="w-full bg-indigo-600 text-white p-2 rounded">
            Pay
          </button>
        </div>

      </div>
    </div>
  );
};