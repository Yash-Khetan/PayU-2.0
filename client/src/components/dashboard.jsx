import { useState, useEffect, useRef, startTransition } from "react";
import axios from "axios";


export const Dashboard = () => {

  // fetching all users
  const API = import.meta.env.VITE_BACKEND_URL;

  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchusers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/api/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data.allusers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchusers();
  }, []);

  // fetching profile
  const [profile, setProfile] = useState({});
  const fetchprofile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(response.data.info);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  useEffect(() => {

    fetchprofile();
  }, []);

  // fetching transactions
  const [transactions, setTransactions] = useState([]);
  const fetchtransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/api/users/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransactions(response.data.history);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  useEffect(() => {
    fetchtransactions();
  }, []);

  // handling the click on pay button

  const [receiveremail, setReceiveremail] = useState("");
  const [amount, setAmount] = useState("");
  const [polling, setpolling] = useState(false);
  const [currentTransferStatus, setCurrentTransferStatus] = useState(null);
  const pollingRef = useRef(null);
  const handleformsubmit = async (e) => {
    e.preventDefault();
    if (polling) return;
    try {
      setpolling(true);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/users/transact`,
        {
          receiveremail,
          transactamount: amount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      startpolling(response.data.transferId);

      setReceiveremail("");
      setAmount("");
      console.log("Transaction successful:", response.data);

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Transaction failed";

      alert(msg);
      setpolling(false);
      setCurrentTransferStatus(null);
    }
  };



  const startpolling = (transferId) => {
    if (!transferId) return;

    setpolling(true);
    setCurrentTransferStatus("PENDING");

    const token = localStorage.getItem("token");

    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API}/api/users/transfers/${transferId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const status = res.data.transfer.status;
        setCurrentTransferStatus(status);

        if (status === "SUCCESS" || status === "FAILED") {
          stopPolling();
          fetchtransactions();
          fetchprofile();
        }

      } catch (err) {
        console.error("Polling failed:", err);
        stopPolling();
        setCurrentTransferStatus("FAILED");
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setpolling(false);
  };





  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your transactions and balance</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT PANEL - Balance & Transactions */}
          <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">
                Current Balance
              </h3>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 shadow-md">
                <p className="text-white text-sm font-medium mb-1">Available</p>
                <p className="text-white text-3xl font-bold">
                  ₹ {profile.balance ?? 0}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">
                Recent Transactions
              </h4>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No transactions yet</p>
                  </div>
                )}

                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]" title={tx.counterparty}>
                        {tx.counterparty}
                      </span>
                      <span className={`text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-gray-900"
                        }`}>
                        {tx.amount > 0 ? "+" : ""}₹{tx.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${tx.status === "SUCCESS" ? "text-green-500" :
                          tx.status === "FAILED" ? "text-red-500" :
                            "text-yellow-600"
                        }`}>
                        {tx.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER PANEL - Users List */}
          <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-4">
              All Users
            </h3>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              {users.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              )}

              {users.map((u) => (
                <div
                  key={u._id}
                  className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {u.name}
                      </p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL - Send Money Form */}
          <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-6">
              Send Money
            </h3>

            <form onSubmit={handleformsubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to (Email)
                </label>
                <input
                  placeholder="example@email.com"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  value={receiveremail}
                  onChange={(e) => setReceiveremail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>
                  <input
                    placeholder="0.00"
                    className="w-full border-2 border-gray-200 p-3 pl-8 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              <button
                disabled={polling}
                className={`w-full p-3.5 rounded-xl font-semibold shadow-lg transition-all duration-200
                  ${polling
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5"}
                  text-white`}
              >
                {polling ? "Processing..." : "Send Payment"}
              </button>

            </form>
            {currentTransferStatus && (
              <div className="mt-4 text-center">
                {currentTransferStatus === "PENDING" && (
                  <p className="text-sm text-yellow-600 font-medium">
                    ⏳ Transaction is processing…
                  </p>
                )}
                {currentTransferStatus === "SUCCESS" && (
                  <p className="text-sm text-green-600 font-medium">
                    ✅ Payment successful
                  </p>
                )}
                {currentTransferStatus === "FAILED" && (
                  <p className="text-sm text-red-600 font-medium">
                    ❌ Payment failed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};